import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  try {
    const result = await angularAppEngine.handle(request);
    return result || new Response('Not found', { status: 404 });
  } catch (err) {
    console.error('SSR Error:', err);
    return new Response('An error occurred during server-side rendering.', { status: 500 });
  }
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
