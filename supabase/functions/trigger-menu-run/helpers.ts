// Logger utility to standardize log format
export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(
      JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        ...(data && { data }),
      })
    );
  },
  error: (message: string, error?: unknown) => {
    console.error(
      JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        message,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      })
    );
  },
};

export async function launchRun(runId: string, metadata?: Record<string, unknown>) {
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
      body: JSON.stringify({}),
    });

    // Handle the promise without blocking
    fetchPromise
      .then(response => {
        logger.info('Processing request initiated', {
          ...metadata,
          run_id: runId,
          status: response.status,
        });
      })
      .catch(error => {
        logger.error('Processing trigger failed', {
          error,
          ...metadata,
          run_id: runId,
        });
      });

    // Start the request execution
    await Promise.race([
      fetchPromise,
      new Promise(resolve => setTimeout(resolve, 100)), // Small timeout to ensure request starts
    ]);
  } catch (error) {
    logger.error('Failed to initiate processing request', {
      error,
      ...metadata,
      run_id: runId,
    });
    throw new Error('Failed to initiate processing');
  }
}
