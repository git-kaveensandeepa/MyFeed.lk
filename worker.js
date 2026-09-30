export default {
  async fetch(request, env, ctx) {
    // Serve static assets from Angular's dist/app/browser
    const response = await env.ASSETS.fetch(request);

    // Apply security headers
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
