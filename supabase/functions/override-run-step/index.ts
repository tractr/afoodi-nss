// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function launchRunOverride(runId: string, overrideInput?: Record<string, unknown>) {
  // Get API URL from environment or use docker host in development
  const api_url = Deno.env.get('STREAM_AI_API_URL');

  if (!api_url) {
    throw new Error('STREAM_AI_API_URL not configured');
  }

  // Initiate the fetch request and ensure it's sent
  try {
    // Create the promise but don't await its completion
    const fetchPromise = fetch(`${api_url}/stream-ai/${runId}/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input_data: overrideInput,
      }),
    });

    // Handle the promise without blocking
    fetchPromise
      .then(response => {
        console.log('Processing request initiated', {
          input_data: overrideInput,
          run_id: runId,
          status: response.status,
        });
      })
      .catch(error => {
        console.error('Processing trigger failed', {
          error,
          input_data: overrideInput,
          run_id: runId,
        });
      });

    // Start the request execution
    await Promise.race([
      fetchPromise,
      new Promise(resolve => setTimeout(resolve, 100)), // Small timeout to ensure request starts
    ]);
  } catch (error) {
    console.error('Failed to initiate override request', {
      error,
      input_data: overrideInput,
      run_id: runId,
    });
    throw new Error('Failed to initiate override request');
  }
}

Deno.serve(async req => {
  const requestId = crypto.randomUUID();

  console.log('Override run step request received', { requestId });

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get input parameters
    const { runStepId, input } = await req.json();

    console.log('Override run step launched', { runStepId, input });

    // Fetch the original run step and its associated run
    const { data: runStep, error: runStepError } = await supabaseClient
      .from('stream_ai_run_steps')
      .select('*, run(*)')
      .eq('id', runStepId)
      .single();

    if (runStepError || !runStep) {
      console.error('Run step not found', { runStepError });
      return new Response(JSON.stringify({ error: 'Run step not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create a new run with status 'created'
    const { data: newRun, error: newRunError } = await supabaseClient
      .from('stream_ai_runs')
      .insert({
        status: 'created',
        current_step: runStep.run.current_step,
        type: runStep.run.type,
        owner: runStep.run.owner,
      })
      .select()
      .single();

    if (newRunError || !newRun) {
      return new Response(JSON.stringify({ error: 'Failed to create new run' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    await launchRunOverride(newRun.id, input);

    return new Response(
      JSON.stringify({
        success: true,
        newRun,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/override-run-step' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"runStepId":"d08280d4-a1b6-4a49-9155-4e30a6272cc6","input": {}}'

*/
