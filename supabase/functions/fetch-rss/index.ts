import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    // Usar o fetch nativo do Deno para obter o conteúdo do RSS
    const rssResponse = await fetch(rssFeedUrl);
    if (!rssResponse.ok) {
      throw new Error(`Failed to fetch RSS feed: ${rssResponse.statusText}`);
    }
    const rssText = await rssResponse.text();

    // Analisar o texto do RSS com o rss-parser
    const feed = await parser.parseString(rssText);

    return new Response(JSON.stringify(feed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});