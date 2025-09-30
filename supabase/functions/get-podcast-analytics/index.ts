import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { podcast_id } = await req.json();
    if (!podcast_id) {
      return new Response(JSON.stringify({ error: 'Missing podcast_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Use service role key for analytics to bypass RLS if needed
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get all episode IDs for the given podcast
    const { data: episodesData, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title')
      .eq('podcast_id', podcast_id);

    if (episodesError) throw episodesError;
    const episodeIds = episodesData.map(ep => ep.id);
    const episodeTitlesMap = new Map(episodesData.map(ep => [ep.id, ep.title]));

    if (episodeIds.length === 0) {
      return new Response(JSON.stringify({
        totalPlays: 0,
        uniqueListeners: 0,
        averagePlayTime: "0 min",
        topEpisodes: [],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Total Plays
    const { count: totalPlays, error: totalPlaysError } = await supabase
      .from('plays')
      .select('*', { count: 'exact', head: true })
      .in('episode_id', episodeIds);

    if (totalPlaysError) throw totalPlaysError;

    // Unique Listeners
    const { data: uniqueListenersData, error: uniqueListenersError } = await supabase
      .from('plays')
      .select('user_id', { distinct: true })
      .in('episode_id', episodeIds);

    if (uniqueListenersError) throw uniqueListenersError;
    const uniqueListeners = uniqueListenersData.filter(item => item.user_id !== null).length;

    // Top Episodes
    const { data: topEpisodesData, error: topEpisodesError } = await supabase
      .from('plays')
      .select('episode_id, count')
      .in('episode_id', episodeIds)
      .order('count', { ascending: false })
      .limit(5)
      .returns<{ episode_id: string, count: number }[]>(); // Explicitly define return type

    if (topEpisodesError) throw topEpisodesError;

    const topEpisodes = topEpisodesData.map((item, index) => ({
      rank: index + 1,
      title: episodeTitlesMap.get(item.episode_id) || 'Título Desconhecido',
      plays: item.count,
    }));

    return new Response(JSON.stringify({
      totalPlays: totalPlays || 0,
      uniqueListeners: uniqueListeners,
      averagePlayTime: "Em breve", // Placeholder for now
      topEpisodes: topEpisodes,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-podcast-analytics Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});