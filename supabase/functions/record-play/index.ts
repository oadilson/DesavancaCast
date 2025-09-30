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
    const { episode_id, user_id } = await req.json();

    if (!episode_id) {
      return new Response(JSON.stringify({ error: 'Missing episode_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Usar service role key para inserir no banco de dados
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Cloudflare provides the country code in the CF-IPCountry header
    const country = req.headers.get('CF-IPCountry') || 'UNKNOWN';

    const { error } = await supabase.from('plays').insert({
      episode_id: episode_id,
      user_id: user_id,
      country: country,
    });

    if (error) {
      console.error('Error inserting play record:', error);
      throw error;
    }

    return new Response(JSON.stringify({ message: 'Play recorded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in record-play Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});