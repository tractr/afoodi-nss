// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseClient: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function launchRunOverrided(runId: string) {
  // Get API URL from environment or use docker host in development
  const api_url = Deno.env.get('STREAM_AI_API_URL');

  if (!api_url) {
    throw new Error('STREAM_AI_API_URL not configured');
  }

  // Initiate the fetch request and ensure it's sent
  try {
    // Create the promise but don't await its completion
    const fetchPromise = fetch(`${api_url}/stream-ai/${runId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auto_walk: true,
        is_current_step: true,
      }),
    });

    // Handle the promise without blocking
    fetchPromise
      .then(response => {
        console.log('Processing request initiated', {
          run_id: runId,
          status: response.status,
        });
      })
      .catch(error => {
        console.error('Processing trigger failed', {
          error,
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
      run_id: runId,
    });
    throw new Error('Failed to initiate override request');
  }
}

async function duplicateMenuRunContext(oldRunId: string, newRunId: string) {
  // Fetch the original menu run context
  const { data: originalContext, error: contextError } = await supabaseClient
    .from('stream_ai_menu_run_contexts')
    .select('*')
    .eq('run', oldRunId)
    .single();

  if (contextError) {
    console.error('Menu run context not found', { contextError });
    return; // Not throwing error as this might be optional
  }

  if (originalContext) {
    // Create a new menu run context with the new run ID
    const { error: newContextError } = await supabaseClient
      .from('stream_ai_menu_run_contexts')
      .insert({
        menu: originalContext.menu,
        run: newRunId,
      });

    if (newContextError) {
      console.error('Failed to create new menu run context', { newContextError });
      throw new Error('Failed to create new menu run context');
    }
  }
}

async function duplicatePreviousSteps(
  oldRunId: string,
  newRunId: string,
  currentStepId: string,
  overrideInput?: Record<string, unknown>
) {
  // Fetch the current step to get its created_at
  const { data: currentStep, error: currentStepError } = await supabaseClient
    .from('stream_ai_run_steps')
    .select('created_at')
    .eq('id', currentStepId)
    .single();

  if (currentStepError || !currentStep) {
    console.error('Current step not found', { currentStepError });
    throw new Error('Current step not found');
  }

  // Fetch all previous steps from the old run
  const { data: previousSteps, error: previousStepsError } = await supabaseClient
    .from('stream_ai_run_steps')
    .select('*')
    .eq('run', oldRunId)
    .lt('created_at', currentStep.created_at)
    .order('created_at', { ascending: true });

  if (previousStepsError) {
    console.error('Failed to fetch previous steps', { previousStepsError });
    throw new Error('Failed to fetch previous steps');
  }

  if (!previousSteps || previousSteps.length === 0) {
    return;
  }

  // Duplicate each previous step
  for (let i = 0; i < previousSteps.length; i++) {
    const step = previousSteps[i];
    const isLastStep = i === previousSteps.length - 1;

    const { error: newStepError } = await supabaseClient.from('stream_ai_run_steps').insert({
      run: newRunId,
      step: step.step,
      input: step.input,
      output: isLastStep ? overrideInput : step.output,
      created_at: step.created_at,
      finished_at: step.finished_at,
      error: step.error,
      status: step.status,
    });

    if (newStepError) {
      console.error('Failed to create new step', { newStepError });
      throw new Error('Failed to create new step');
    }
  }
}

async function duplicateRun(runStepId: string, overrideInput?: Record<string, unknown>) {
  // Fetch the original run step and its associated run
  const { data: runStep, error: runStepError } = await supabaseClient
    .from('stream_ai_run_steps')
    .select('*, run(*)')
    .eq('id', runStepId)
    .single();

  if (runStepError || !runStep) {
    console.error('Run step not found', { runStepError });
    throw new Error('Run step not found');
  }

  // Create a new run with status 'created'
  const { data: newRun, error: newRunError } = await supabaseClient
    .from('stream_ai_runs')
    .insert({
      status: 'created',
      current_step: runStep.step,
      type: runStep.run.type,
      owner: runStep.run.owner,
    })
    .select('id, type')
    .single();

  if (newRunError || !newRun) {
    throw new Error('Failed to create new run');
  }

  // After creating the new run and before duplicating context, duplicate previous steps
  try {
    await duplicatePreviousSteps(runStep.run.id, newRun.id, runStepId, overrideInput);
  } catch (error) {
    console.error('Failed to duplicate previous steps', { error });
    throw new Error('Failed to duplicate previous steps');
  }

  // After duplicating steps, duplicate the menu run context if it exists
  try {
    switch (newRun.type) {
      case 'menu':
        await duplicateMenuRunContext(runStep.run.id, newRun.id);
        break;
      default:
        console.error('Unsupported duplicate run type', { runType: newRun.type });
        break;
    }
  } catch (error) {
    console.error('Failed to duplicate menu run context', { error });
    throw new Error('Failed to duplicate menu run context');
  }

  return newRun;
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

    console.log('Override run step launched', { runStepId });

    let newRun;

    try {
      newRun = await duplicateRun(runStepId, input);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message === 'Run step not found' ? 404 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    await launchRunOverrided(newRun.id);

    return new Response(
      JSON.stringify({
        success: true,
        newRun: newRun.id,
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
