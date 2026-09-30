// src/app/api-client.util.ts

export const BACKEND_FALLBACK_URL = 'https://ais-dev-wkbrkijpyogfl6rf4zj5d5-110393045040.asia-east1.run.app';

/**
 * Returns user-configured custom backend URL if set, or empty string.
 */
export function getCustomBackendUrl(): string {
  if (typeof window === 'undefined') return '';
  const custom = localStorage.getItem('myfeed_backend_api_url');
  return custom ? custom.trim().replace(/\/+$/, '') : '';
}

/**
 * Builds the URL for an API endpoint.
 * On Cloudflare Pages (pages.dev), if no custom backend is set and Cloudflare proxy isn't configured,
 * it can automatically route directly to the active backend.
 */
export function buildApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const custom = getCustomBackendUrl();
  if (custom) {
    return `${custom}${cleanPath}`;
  }

  // If on Cloudflare Pages, use direct backend or relative
  if (typeof window !== 'undefined' && window.location.hostname.includes('pages.dev')) {
    // If user prefers direct backend to bypass static SPA catch-all
    return `${BACKEND_FALLBACK_URL}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Safely fetches an API route, gracefully handling Cloudflare Pages SPA catch-alls,
 * HTML responses, network issues, and JSON parsing.
 */
export async function safeApiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  let res: Response;

  try {
    res = await fetch(url, init);
  } catch (netErr: any) {
    // If failed and was relative, retry with fallback backend
    if (!url.startsWith('http') && typeof window !== 'undefined') {
      const fallbackUrl = `${BACKEND_FALLBACK_URL}${path.startsWith('/') ? path : `/${path}`}`;
      res = await fetch(fallbackUrl, init);
    } else {
      throw new Error(`Network error connecting to API: ${netErr?.message || String(netErr)}`);
    }
  }

  const contentType = res.headers.get('content-type') || '';

  // If response is HTML (e.g. index.html served instead of API)
  if (contentType.includes('text/html')) {
    // If we haven't tried the fallback backend yet, try it now
    if (!url.startsWith('http') && typeof window !== 'undefined') {
      const fallbackUrl = `${BACKEND_FALLBACK_URL}${path.startsWith('/') ? path : `/${path}`}`;
      const fallbackRes = await fetch(fallbackUrl, init);
      const fallbackCt = fallbackRes.headers.get('content-type') || '';
      if (fallbackCt.includes('application/json')) {
        const data = await fallbackRes.json();
        if (!fallbackRes.ok) {
          throw new Error(data.error || data.message || `Server error: HTTP ${fallbackRes.status}`);
        }
        return data as T;
      }
    }
    throw new Error('API server returned HTML instead of JSON. The backend server might be offline or starting up.');
  }

  const text = await res.text();
  if (!text || !text.trim()) {
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status} with empty response.`);
    }
    return {} as T;
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response (HTTP ${res.status}): ${text.slice(0, 100)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with HTTP ${res.status}`);
  }

  return data as T;
}
