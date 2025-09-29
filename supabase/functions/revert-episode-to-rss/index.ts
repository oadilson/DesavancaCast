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
    const { episode_id } = await req.json();
    if (!episode_id) throw new Error('Missing episode_id');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Use service role for admin actions
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select(`guid, podcast_id, podcasts(rss_feed_url)`)
      .eq('id', episode_id)
      .single();

    if (episodeError) throw episodeError;
    if (!episode || !episode.podcasts) throw new Error('Episódio ou podcast associado não encontrado.');

    const { guid } = episode;
    const { rss_feed_url } = episode.podcasts;

    // Lógica de busca de RSS mais robusta
    const rssResponse = await fetch(rss_feed_url, {
        headers: { 'User-Agent': 'PodcastSync/1.0' },
    });
    if (!rssResponse.ok) {
        throw new Error(`Falha ao buscar o feed RSS para reverter: ${rssResponse.statusText} (Status: ${rssResponse.status})`);
    }
    const rssText = await rssResponse.text();
    const feed = await parser.parseString(rssText);

    const originalItem = feed.items.find(item => (item.guid || item.link) === guid);

    if (!originalItem) throw new Error('Episódio não encontrado no feed RSS original.');

    const { error: updateError } = await supabase
      .from('episodes')
      .update({
        title: originalItem.title,
        description: originalItem.contentSnippet || originalItem.content,
        duration: originalItem.itunes?.duration,
        release_date: originalItem.pubDate ? new Date(originalItem.pubDate).toISOString() : null,
        audio_url: originalItem.enclosure?.url,
        cover_image: originalItem.itunes?.image || feed.itunes?.image,
        is_edited: false, // Reverter o flag
        newsletter_subtitle: null, // Limpar o subtítulo
      })
      .eq('id', episode_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: 'Episódio revertido com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função revert-episode-to-rss:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});