import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl } = await req.json();
    console.log('proxy-audio: Received request for audioUrl:', audioUrl); // Log adicionado

    if (!audioUrl) {
      console.error('proxy-audio: Missing audioUrl in request body.'); // Log adicionado
      return new Response(JSON.stringify({ error: 'Missing audioUrl' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch the audio file from the provided URL on the server-side
    const audioResponse = await fetch(audioUrl);
    console.log(`proxy-audio: Fetch response status for ${audioUrl}: ${audioResponse.status}`); // Log adicionado

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`);
    }

    // Get the audio data
    const audioData = await audioResponse.blob();

    // Create new headers for the response, copying essential ones
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('Content-Type', audioResponse.headers.get('Content-Type') || 'audio/mpeg');
    responseHeaders.set('Content-Length', audioResponse.headers.get('Content-Length') || audioData.size.toString());
    
    console.log('proxy-audio: Successfully proxied audio.'); // Log adicionado
    // Return the audio data directly to the client
    return new Response(audioData, {
      headers: responseHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error in proxy-audio Edge Function:', error.message); // Log adicionado
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});