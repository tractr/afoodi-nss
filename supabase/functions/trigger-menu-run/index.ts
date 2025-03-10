// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'jsr:@supabase/supabase-js';
import { launchRun, logger } from './helpers.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  const requestId = crypto.randomUUID();
  logger.info('Trigger menu run request received');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    logger.info('Handling OPTIONS request', { requestId });
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  logger.info('Received menu run trigger request', { requestId, method: req.method });

  try {
    // Get menu_id from either query params (GET) or body (POST)
    let menu_id: string;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      menu_id = url.searchParams.get('menu_id') ?? '';
    } else if (req.method === 'POST') {
      const body = await req.json();
      menu_id = body.menu_id;
    } else {
      throw new Error('Method not allowed. Use GET, POST, or OPTIONS');
    }

    logger.info('Processing request', { requestId, menu_id });

    if (!menu_id || typeof menu_id !== 'string') {
      throw new Error('Invalid menu_id provided');
    }

    // Check if menu exists
    logger.info('Checking menu existence', { requestId, menu_id });
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .select('id, owner')
      .eq('id', menu_id)
      .single();

    if (menuError || !menu) {
      throw new Error(menuError?.message || 'Menu not found');
    }
    logger.info('Menu found', { requestId });

    // Create new stream_ai_run
    logger.info('Creating stream_ai_run', {
      requestId,
      payload: { type: 'menu', owner: menu.owner, status: 'created' },
    });
    const { data: runData, error: runError } = await supabase
      .from('stream_ai_runs')
      .insert({
        type: 'menu',
        owner: menu.owner,
        status: 'created',
      })
      .select('id');

    if (runError || !runData) {
      throw new Error(runError?.message || 'Failed to create run');
    }

    const run_id = runData[0].id;
    logger.info('Created run', { requestId, run_id });

    // Create menu run context
    logger.info('Creating menu run context', { requestId, run_id, menu_id });
    const { error: contextError } = await supabase.from('stream_ai_menu_run_contexts').insert({
      menu: menu_id,
      run: run_id,
    });

    if (contextError) {
      throw new Error(contextError.message);
    }
    logger.info('Created menu run context', { requestId });

    await launchRun(run_id, { requestId, menu_id });

    const processingTime = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      processingTime,
      run_id,
    });

    // Add CORS headers to successful response
    return new Response(JSON.stringify({ run_id }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Request failed', {
      error,
      requestId,
      processingTime,
    });

    // Add CORS headers to error response
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  # Using POST:
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/trigger-menu-run' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"menu_id":"your-menu-uuid"}'

  # Using GET:
  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/trigger-menu-run?menu_id=your-menu-uuid' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

*/
