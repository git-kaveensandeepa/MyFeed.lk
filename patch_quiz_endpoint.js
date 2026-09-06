const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

const endpoint = `
    // Quiz Generation Endpoint
    if (url.pathname === '/api/admin/quizzes/generate-now' && request.method === 'POST') {
      try {
        await executeDailyQuizGeneration('scheduled');
        return new Response(JSON.stringify({ success: true, message: 'Quizzes generated successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/admin/autopilot/status' && request.method === 'GET') {`;

code = code.replace(
  "    if (url.pathname === '/api/admin/autopilot/status' && request.method === 'GET') {",
  endpoint
);

fs.writeFileSync('src/server.ts', code);
