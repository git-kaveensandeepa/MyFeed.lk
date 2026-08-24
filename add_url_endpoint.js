const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

const newEndpoint = `
    // AI Article Generation from a Given URL
    if (url.pathname === '/api/generate-from-url' && request.method === 'POST') {
      const geminiApiKey = process.env['GEMINI_API_KEY'];
      if (!geminiApiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server' }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      try {
        const body = await request.json();
        const articleUrl = body.url;
        if (!articleUrl) {
          return new Response(JSON.stringify({ error: 'No URL provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Fetch the raw HTML of the target article
        console.log('Fetching URL:', articleUrl);
        const res = await fetch(articleUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        
        if (!res.ok) {
           return new Response(JSON.stringify({ error: 'Failed to fetch the provided URL' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const html = await res.text();
        
        // Lightly clean HTML to save tokens (remove script, style, SVG tags)
        const cleanedHtml = html
          .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
          .replace(/<style\\b[^<]*(?:(?!<\\/style>)<[^<]*)*<\\/style>/gi, '')
          .replace(/<svg\\b[^<]*(?:(?!<\\/svg>)<[^<]*)*<\\/svg>/gi, '')
          .substring(0, 150000); // cap to ~150k characters just in case it's massive

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = \`You are a senior chief technology journalist and editor for MyFeed.lk, Sri Lanka's leading tech publication.
I will provide you with the raw HTML source code of a news webpage. Your job is to extract the MAIN article content (ignore navbars, footers, ads, sidebars), figure out what the story is about, and then write a comprehensive, in-depth, long-form news article in fluent, professional Sinhala (දීර්ඝ පූර්ණ මාධ්‍යවේදී පුවත් වාර්තාවක්) based on that story.

RAW HTML EXTRACT:
\${cleanedHtml}

REQUIREMENTS:
1. Long-form article (at least 5-7 detailed paragraphs in Sinhala).
2. Format the body content ('sinhalaFullContent') with clean HTML:
   - <p class="lead">Opening engaging overview</p>
   - <h2>ප්‍රධාන විශේෂාංග සහ තොරතුරු</h2>
   - <p>Detailed breakdown</p>
   - <ul><li><strong>Key Item:</strong> Explanation</li></ul>
   - <h2>පරිශීලකයින්ට ඇතිවන බලපෑම</h2>
   - <p>Industry impact</p>
3. High journalistic standard in modern Sinhala.
4. Extract the original article's title (in English or original language) and generate a 'sinhalaTitle'.
5. Generate a 'visualPrompt' in English (20-30 words) that describes an image for this article to be used in AI image generation (e.g., 'A modern glowing 5G smartphone on a desk, cinematic lighting, 8k').
6. Classify 'suggestedCategory' as strictly one of: 'AI', 'Local' (Sri Lanka), or 'Tech'.\`;

        const genResponse = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sinhalaTitle: { type: Type.STRING },
                sinhalaDescription: { type: Type.STRING },
                sinhalaFullContent: { type: Type.STRING },
                suggestedCategory: { type: Type.STRING, description: "One of 'AI', 'Local', or 'Tech'" },
                visualPrompt: { type: Type.STRING, description: "English prompt for image generation" },
                readTime: { type: Type.STRING }
              },
              required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'suggestedCategory', 'visualPrompt']
            }
          }
        });

        const result = JSON.parse(genResponse?.text || '{}');
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (genErr: unknown) {
        const err = genErr as { message?: string };
        console.error('Error generating AI article from URL:', genErr);
        return new Response(JSON.stringify({ error: err.message || 'Generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
`;

code = code.replace(
  "// Direct AI Long Article Generator Endpoint",
  newEndpoint + "\n    // Direct AI Long Article Generator Endpoint"
);

fs.writeFileSync('src/server.ts', code);
console.log('Added /api/generate-from-url endpoint');
