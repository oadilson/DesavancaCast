import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Parser from 'https://esm.sh/rss-parser@3.13.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parser = new Parser({
  customFields: {
    item: ['itunes:duration', 'itunes:image', 'itunes:episodeType', 'itunes:explicit'],
  },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rssFeedUrl } = await req.json();
    if (!rssFeedUrl) {
      return new Response(JSON.stringify({ error: 'Missing rssFeedUrl' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting user in Edge Function:', userError);
      return new Response(JSON.stringify({ error: `Authentication error: ${userError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401, // Unauthorized
      });
    }

    // Se não houver usuário autenticado, não podemos realizar operações de upsert.
    // Apenas tentamos buscar dados de podcast existentes (que estarão sujeitos a RLS para SELECT).
    if (!user) {
      const { data: publicPodcastData, error: publicFetchError } = await supabase
        .from('podcasts')
        .select(`*, episodes (*)`)
        .eq('rss_feed_url', rssFeedUrl)
        .single();

      if (publicFetchError && publicFetchError.code !== 'PGRST116') {
        console.error('Error fetching public podcast data:', publicFetchError);
        return new Response(JSON.stringify({ error: `Falha ao carregar dados do podcast público: ${publicFetchError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      return new Response(JSON.stringify(publicPodcastData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // O usuário está autenticado, prosseguir com a lógica de sincronização/upsert
    const rssResponse = await fetch(rssFeedUrl, {
      headers: { 'User-Agent': 'PodcastSync/1.0' },
    });
    if (!rssResponse.ok) {
      return new Response(JSON.stringify({ error: `Falha ao buscar o feed RSS: ${rssResponse.statusText} (Status: ${rssResponse.status})` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: rssResponse.status, // Propagate original status or 500
      });
    }
    const rssText = await rssResponse.text();
    const feed = await parser.parseString(rssText);

    // Primeiro, tentamos encontrar o podcast que pertence ao usuário atual
    let { data: podcast, error: fetchPodcastError } = await supabase
      .from('podcasts')
      .select('id, is_edited')
      .eq('rss_feed_url', rssFeedUrl)
      .eq('user_id', user.id) // Crucial: buscar apenas se for de propriedade do usuário atual
      .single();

    if (fetchPodcastError && fetchPodcastError.code !== 'PGRST116') { // PGRST116 = nenhuma linha encontrada
      console.error('Database error fetching podcast for current user:', fetchPodcastError);
      return new Response(JSON.stringify({ error: `Erro no banco de dados ao buscar podcast: ${fetchPodcastError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let isPodcastEdited = podcast?.is_edited || false;
    let podcastId = podcast?.id;

    // Se o podcast não foi encontrado para este usuário, verificamos se ele existe para *qualquer* usuário
    if (!podcast) {
      const { data: existingPodcastAnyUser, error: fetchAnyUserPodcastError } = await supabase
        .from('podcasts')
        .select('id, user_id')
        .eq('rss_feed_url', rssFeedUrl)
        .single();

      if (fetchAnyUserPodcastError && fetchAnyUserPodcastError.code !== 'PGRST116') {
        console.error('Database error checking for existing podcast by any user:', fetchAnyUserPodcastError);
        return new Response(JSON.stringify({ error: `Erro no banco de dados ao verificar podcast existente: ${fetchAnyUserPodcastError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      if (existingPodcastAnyUser) {
        // O podcast existe, mas é de propriedade de outro usuário.
        // Return a 409 Conflict status
        return new Response(JSON.stringify({ error: 'Este podcast já está sendo gerenciado por outro usuário. Por favor, use o RSS de um podcast que você gerencia ou entre em contato com o suporte.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        });
      }
      // O podcast não existe, prosseguir para inserção
    }

    // Preparar dados para upsert
    let podcastDataToUpsert: any = {
      rss_feed_url: rssFeedUrl,
      user_id: user.id,
      title: feed.title,
      host: feed.itunes?.author || feed.creator,
      description: feed.description || feed.itunes?.summary,
      cover_image: feed.itunes?.image || feed.image?.url,
      is_edited: isPodcastEdited, // Preservar o status is_edited existente
    };

    if (podcastId) {
      podcastDataToUpsert.id = podcastId; // Incluir ID para atualização
    }

    // Realizar o upsert
    const { data: upsertedPodcast, error: upsertError } = await supabase
      .from('podcasts')
      .upsert(podcastDataToUpsert, { onConflict: 'rss_feed_url' })
      .select()
      .single();

    if (upsertError) {
      console.error('Database error during podcast upsert:', upsertError);
      return new Response(JSON.stringify({ error: `Erro no banco de dados ao salvar podcast: ${upsertError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    if (!upsertedPodcast) {
      return new Response(JSON.stringify({ error: 'Falha ao criar ou encontrar o podcast após a sincronização.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Atualizar a variável podcast com o resultado do upsert
    podcast = upsertedPodcast;

    // Lógica de upsert de episódios
    if (feed.items) {
      const { data: editedEpisodes, error: fetchEditedEpisodesError } = await supabase
        .from('episodes')
        .select('guid')
        .eq('podcast_id', podcast.id)
        .eq('is_edited', true);

      if (fetchEditedEpisodesError) {
        console.error('Database error fetching edited episodes:', fetchEditedEpisodesError);
        return new Response(JSON.stringify({ error: `Erro no banco de dados ao buscar episódios editados: ${fetchEditedEpisodesError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      const editedGuids = new Set(editedEpisodes?.map(e => e.guid));

      const episodesToUpsert = feed.items
        .filter(item => !editedGuids.has(item.guid || item.link))
        .map(item => ({
          podcast_id: podcast.id,
          guid: item.guid || item.link,
          title: item.title,
          description: item.contentSnippet || item.content,
          duration: item.itunes?.duration,
          release_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          audio_url: item.enclosure?.url,
          cover_image: item.itunes?.image || feed.itunes?.image,
          is_edited: false,
        }));

      if (episodesToUpsert.length > 0) {
        const { error: episodesError } = await supabase.from('episodes').upsert(episodesToUpsert, { onConflict: 'podcast_id,guid' });
        if (episodesError) {
          console.error('Database error during episode upsert:', episodesError);
          return new Response(JSON.stringify({ error: `Erro no banco de dados ao salvar episódios: ${episodesError.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }
      }
    }

    // Finalmente, buscar os dados completos do podcast com os episódios
    const { data: finalPodcastData, error: finalError } = await supabase
      .from('podcasts')
      .select(`*, episodes (*)`)
      .eq('id', podcast.id) // Usar o ID do podcast upserted
      .single();

    if (finalError && finalError.code !== 'PGRST116') {
      console.error('Database error fetching final podcast data:', finalError);
      return new Response(JSON.stringify({ error: `Erro no banco de dados ao buscar dados finais do podcast: ${finalError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify(finalPodcastData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Erro inesperado na função sync-and-get-podcast:', error.message);
    return new Response(JSON.stringify({ error: `Erro interno do servidor: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});