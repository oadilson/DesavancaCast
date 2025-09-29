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
    if (!rssFeedUrl) throw new Error('Missing rssFeedUrl');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Lógica de busca de RSS mais robusta
      const rssResponse = await fetch(rssFeedUrl, {
        headers: { 'User-Agent': 'PodcastSync/1.0' },
      });
      if (!rssResponse.ok) {
        throw new Error(`Falha ao buscar o feed RSS: ${rssResponse.statusText} (Status: ${rssResponse.status})`);
      }
      const rssText = await rssResponse.text();
      const feed = await parser.parseString(rssText);

      // Verifica se o podcast já existe e se foi editado manualmente
      const { data: existingPodcast } = await supabase
        .from('podcasts')
        .select('id, is_edited')
        .eq('rss_feed_url', rssFeedUrl)
        .single();

      let podcastDataToUpsert;
      if (existingPodcast && existingPodcast.is_edited) {
        // Se foi editado, não sobrescreve os campos principais. Apenas garante que user_id está lá.
        podcastDataToUpsert = {
          rss_feed_url: rssFeedUrl,
          user_id: user.id,
        };
      } else {
        // Se não foi editado ou não existe, usa os dados do RSS.
        podcastDataToUpsert = {
          rss_feed_url: rssFeedUrl,
          user_id: user.id,
          title: feed.title,
          host: feed.itunes?.author || feed.creator,
          description: feed.description || feed.itunes?.summary,
          cover_image: feed.itunes?.image || feed.image?.url,
          is_edited: false,
        };
      }

      const { data: podcast, error: upsertError } = await supabase
        .from('podcasts')
        .upsert(podcastDataToUpsert, { onConflict: 'rss_feed_url' })
        .select()
        .single();

      if (upsertError) throw upsertError;
      if (!podcast) throw new Error('Falha ao criar ou encontrar o podcast após a sincronização.');

      if (feed.items) {
        const { data: editedEpisodes } = await supabase
          .from('episodes')
          .select('guid')
          .eq('podcast_id', podcast.id)
          .eq('is_edited', true);

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
          if (episodesError) throw episodesError;
        }
      }
    }

    const { data: finalPodcastData, error: finalError } = await supabase
      .from('podcasts')
      .select(`*, episodes (*)`)
      .eq('rss_feed_url', rssFeedUrl)
      .single();

    if (finalError && finalError.code !== 'PGRST116') throw finalError;

    if (!finalPodcastData) {
      return new Response(JSON.stringify(null), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify(finalPodcastData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função sync-and-get-podcast:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});