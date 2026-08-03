import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js';
import { Buffer } from 'buffer';

// Polyfill Buffer and process for environments that don't have them (like Netlify Edge)
if (typeof globalThis.Buffer === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Buffer = Buffer;
}
if (typeof globalThis.process === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).process = { env: {} };
}

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
});

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  try {
    const context = getContext();
    const result = await angularAppEngine.handle(request, context);
    return result || new Response('Not found', { status: 404 });
  } catch (err) {
    console.error('Netlify SSR Error:', err);
    return new Response('SSR Error: ' + (err instanceof Error ? err.message : String(err)), { status: 500 });
  }
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
