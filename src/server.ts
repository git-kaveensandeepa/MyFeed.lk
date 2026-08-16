import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js';
import { Buffer } from 'buffer';
import { GoogleGenAI, Type } from '@google/genai';

// Polyfill Buffer and process for environments that don't have them (like Netlify Edge)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}
if (typeof g.process === 'undefined') {
  g.process = { env: {} };
}

// Polyfill matchMedia for SSR
const matchMediaPolyfill = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  /* eslint-disable @typescript-eslint/no-empty-function */
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
  dispatchEvent: () => false,
});

if (typeof g.matchMedia === 'undefined') {
  g.matchMedia = matchMediaPolyfill;
}

// If window is defined but incomplete, fix it
if (typeof g.window !== 'undefined' && typeof g.window.matchMedia === 'undefined') {
  g.window.matchMedia = matchMediaPolyfill;
}

// Polyfill localStorage for SSR
if (typeof g.localStorage === 'undefined') {
  /* eslint-disable @typescript-eslint/no-empty-function */
  g.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
  /* eslint-enable @typescript-eslint/no-empty-function */
}

const angularAppEngine = new AngularAppEngine({
  allowedHosts: getAllowedHosts(),
  trustProxyHeaders: getTrustProxyHeaders(),
});

// Cache for news
let cachedNews: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 42 * 60 * 1000; // 42 minutes

async function fetchAndTranslateNews() {
  const newsApiKey = process.env['NEWS_API_KEY'];
  const geminiApiKey = process.env['GEMINI_API_KEY'];

  if (!newsApiKey || !geminiApiKey) {
    console.warn('NewsAPI or Gemini API keys are missing. Skipping automatic news generation.');
    return [];
  }

  // 1. Fetch from NewsAPI (Reduced page size to 3 to save quota)
  const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&category=technology&pageSize=3&apiKey=${newsApiKey}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch from NewsAPI');
  }

  const data = await response.json();
  const articles = data.articles.filter((a: any) => a.title && a.description && a.urlToImage);

  // 2. Translate with Gemini
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  
  const translatedArticles: any[] = [];
  for (let index = 0; index < articles.length; index++) {
    const article = articles[index];
    try {
      let genResponse;
      let attempt = 0;
      const maxAttempts = 3;
      
      while (attempt < maxAttempts) {
        try {
          const prompt = `You are a senior chief technology journalist and editor for MyFeed.lk, Sri Lanka's leading technology news platform.
Write a FULL, comprehensive, highly engaging, and in-depth news article in natural, fluent Sinhala (පූර්ණ මාධ්‍යවේදී පුවත් ලිපියක්) based on the provided news story.

CRITICAL INSTRUCTIONS:
1. DO NOT just translate the short description. You MUST generate a complete, professional, long-form news report (at least 4 to 6 detailed paragraphs in Sinhala).
2. Structure the 'sinhalaFullContent' using clean HTML formatting:
   - Use engaging introductory paragraphs (<p>...</p>) explaining the breaking news.
   - Use descriptive subheadings (<h2>...</h2>) in Sinhala to break down the article into sections (e.g. ප්‍රධාන තාක්ෂණික විශේෂාංග, වෙළඳපොළට සහ පරිශීලකයන්ට ඇති බලපෑම, ඉදිරි අපේක්ෂාවන්).
   - Use bullet points (<ul><li>...</li></ul>) to highlight key specifications or takeaways.
   - Conclude with an analytical final paragraph evaluating the impact on the tech ecosystem.
3. Language & Tone: High-standard, readable, modern Sinhala journalism (නූතන තාක්ෂණික මාධ්‍ය භාෂාව).

English Title: ${article.title}
English Description: ${article.description}
Source URL: ${article.url}`;
          
          genResponse = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  sinhalaTitle: { type: Type.STRING },
                  sinhalaDescription: { type: Type.STRING, description: "A short 1-2 sentence summary" },
                  sinhalaFullContent: { type: Type.STRING, description: "The full, comprehensive news article in Sinhala formatted with HTML <p> tags. Must be at least 3 paragraphs long." }
                },
                required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent']
              }
            }
          });
          break; // Success, exit retry loop
        } catch (err: any) {
          attempt++;
          if ((err?.status === 503 || err?.message?.includes('503')) && attempt < maxAttempts) {
            console.log(`[Retry ${attempt}/${maxAttempts}] 503 High demand. Waiting before retry...`);
            await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
          } else {
            throw err; // Re-throw 429 or other errors, or 503 if max attempts reached
          }
        }
      }
      
      const translation = JSON.parse(genResponse?.text || '{}');
      
      translatedArticles.push({
        id: `news-${index}-${Date.now()}`,
        title: translation.sinhalaTitle || article.title,
        summary: translation.sinhalaDescription || article.description,
        content: (translation.sinhalaFullContent || `<p>${translation.sinhalaDescription}</p>`) + `<br><p><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">මුල් පුවත කියවන්න (Read original article)</a></p>`,
        category: 'Tech',
        imageUrl: article.urlToImage || 'https://picsum.photos/seed/tech/800/600',
        date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '3 min read',
        authorType: 'ai',
        isAiGenerated: true,
        sourceUrl: article.url || ''
      });

      // Add a generous delay to prevent hitting free tier rate limits (15 RPM / concurrency limits)
      if (index < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 4500));
      }
    } catch (e: any) {
      // Log as a warning instead of error to avoid triggering the error scraper if it's an expected API limit
      console.warn('Translation fallback triggered due to API limits:', e?.message || e);
      
      // Fallback: If translation fails, just push the original English article with a notice so the feed isn't completely empty
      translatedArticles.push({
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        summary: article.description,
        content: `<p><em>(Sinhala translation currently unavailable due to system limits)</em></p><p>${article.description}</p><br><p><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Read original article</a></p>`,
        category: 'Tech',
        imageUrl: article.urlToImage || 'https://picsum.photos/seed/tech/800/600',
        date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '3 min read'
      });

      // If we hit a rate limit (429) or high demand (503), stop processing further articles to give the API a break.
      if (
        e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('quota') ||
        e?.status === 503 || e?.message?.includes('503') || e?.message?.includes('demand')
      ) {
        console.warn('API limit or high demand hit. Stopping further translations for this batch.');
        break; 
      }
    }
  }

  return translatedArticles;
}

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    
    // Custom API Route for News
    if (url.pathname === '/api/news') {
      const now = Date.now();
      // If we don't have cached news, or cache expired, OR the cache contains fallback articles (indicating API failure)
      const hasApiErrors = cachedNews && cachedNews.some((a: any) => a.content.includes('translation currently unavailable'));
      const shouldFetch = !cachedNews || (now - lastFetchTime > CACHE_DURATION_MS) || (hasApiErrors && now - lastFetchTime > 5 * 60 * 1000); // Retry after 5 mins if there was an error
      
      if (shouldFetch) {
        try {
          cachedNews = await fetchAndTranslateNews();
          lastFetchTime = now;
        } catch (e: any) {
          console.error('Error fetching news:', e);
          if (!cachedNews) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
          }
        }
      }
      return new Response(JSON.stringify(cachedNews), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Direct AI Long Article Generator Endpoint
    if (url.pathname === '/api/generate-ai-article' && request.method === 'POST') {
      const geminiApiKey = process.env['GEMINI_API_KEY'];
      if (!geminiApiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server' }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      try {
        const body = await request.json();
        const topic = body.topic || body.title || 'Latest Technology Breakthrough';
        const contextInfo = body.context || '';

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `You are a senior chief technology journalist and editor for MyFeed.lk, Sri Lanka's leading tech publication.
Write a comprehensive, in-depth, long-form news article in fluent, professional Sinhala (දීර්ඝ පූර්ණ මාධ්‍යවේදී පුවත් වාර්තාවක්) on the following topic:

Topic: ${topic}
Additional Context: ${contextInfo}

REQUIREMENTS:
1. Long-form article (at least 600-900 words in Sinhala, 5-7 detailed paragraphs).
2. Format the body content ('sinhalaFullContent') with clean HTML:
   - <p class="lead">Opening engaging overview</p>
   - <h2>ප්‍රධාන විශේෂාංග සහ තාක්ෂණික තොරතුරු</h2>
   - <p>Detailed breakdown</p>
   - <ul><li><strong>Key Item:</strong> Explanation</li></ul>
   - <h2>පරිශීලකයින්ට සහ ක්ෂේත්‍රයට ඇතිවන බලපෑම</h2>
   - <p>Industry impact and user experience</p>
   - <h2>වෙළඳපොළ තරඟකාරිත්වය සහ අනාගතය</h2>
   - <p>Comparison with rivals and roadmap</p>
   - <h2>අවසාන නිගමනය සහ MyFeed.lk විග්‍රහය</h2>
   - <p>Final verdict and takeaway</p>
3. High journalistic standard in modern Sinhala.`;

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
                suggestedCategory: { type: Type.STRING },
                readTime: { type: Type.STRING }
              },
              required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent']
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
        console.error('Error generating AI long article:', genErr);
        return new Response(JSON.stringify({ error: err.message || 'Generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // High-Quality OpenAI Text-to-Speech (TTS) Proxy Endpoint
    if (url.pathname === '/api/tts' && request.method === 'POST') {
      const openAiApiKey = process.env['OPENAI_API_KEY'];
      if (!openAiApiKey) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on server', hasOpenAI: false }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      try {
        const body = await request.json();
        const inputText = (body.text || '').slice(0, 4096); // OpenAI TTS character limit
        const voice = body.voice || 'alloy'; // alloy, echo, fable, onyx, nova, shimmer

        if (!inputText.trim()) {
          return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: inputText,
            voice: voice,
            response_format: 'mp3'
          })
        });

        if (!ttsResponse.ok) {
          const errData = await ttsResponse.json().catch(() => ({ error: { message: 'TTS Request failed' } }));
          const errMsg = errData?.error?.message || 'OpenAI TTS returned status ' + ttsResponse.status;
          console.warn('OpenAI TTS API notice:', errMsg);
          return new Response(JSON.stringify({ error: errMsg, hasOpenAI: true, status: ttsResponse.status }), { 
            status: ttsResponse.status, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        const audioBuffer = await ttsResponse.arrayBuffer();
        return new Response(audioBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      } catch (ttsErr: unknown) {
        const err = ttsErr as { message?: string };
        console.error('TTS proxy error:', ttsErr);
        return new Response(JSON.stringify({ error: err.message || 'TTS request failed' }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    // Automated WhatsApp Channel Auto-Post API
    if (url.pathname === '/api/whatsapp/post' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { title, summary, articleUrl, category, readTime, customMessage } = body;
        
        // WhatsApp Business Cloud API or custom Webhook Integration
        const waAccessToken = process.env['WHATSAPP_ACCESS_TOKEN'] || process.env['WHATSAPP_TOKEN'];
        const waPhoneNumberId = process.env['WHATSAPP_PHONE_NUMBER_ID'];
        const waRecipient = process.env['WHATSAPP_RECIPIENT_ID'] || process.env['WHATSAPP_CHANNEL_ID'];
        const waWebhookUrl = process.env['WHATSAPP_WEBHOOK_URL'];

        const formattedPost = customMessage || `*🚀 NEW ON MYFEED.LK (${category || 'Tech'})*

*${title}*

${summary}

⏱️ ${readTime || '3 min read'}
🔗 *Read full story:* ${articleUrl || 'https://myfeed.lk'}

_Curated with precision by MyFeed.lk Sri Lanka_`;

        // 1. If custom Webhook is configured (Zapier / Make / Evolution API / Baileys)
        if (waWebhookUrl) {
          const webhookRes = await fetch(waWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: formattedPost,
              title,
              url: articleUrl,
              category
            })
          });
          return new Response(JSON.stringify({ success: true, mode: 'webhook', status: webhookRes.status }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 2. If Official Meta WhatsApp Cloud API credentials are provided
        if (waAccessToken && waPhoneNumberId && waRecipient) {
          const waApiRes = await fetch(`https://graph.facebook.com/v19.0/${waPhoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${waAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: waRecipient,
              type: 'text',
              text: { body: formattedPost }
            })
          });

          const waResult = await waApiRes.json();
          return new Response(JSON.stringify({ success: waApiRes.ok, result: waResult }), {
            status: waApiRes.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 3. Fallback response with the ready-to-share formatted WhatsApp payload
        return new Response(JSON.stringify({
          success: true,
          mode: 'formatted_payload',
          message: 'Post formatted and ready for WhatsApp dispatch',
          formattedText: formattedPost,
          directShareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedPost)}`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (waErr: unknown) {
        const err = waErr as { message?: string };
        return new Response(JSON.stringify({ error: err.message || 'WhatsApp dispatch error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const context = getContext();
    const result = await angularAppEngine.handle(request, context);
    return result || new Response('Not found', { status: 404 });
  } catch (err) {
    console.error('Netlify SSR Error:', err);
    return new Response('SSR Error: ' + (err instanceof Error ? err.message : String(err)), { status: 500 });
  }
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
