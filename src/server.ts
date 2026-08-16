import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js';
import { Buffer } from 'buffer';
import { GoogleGenAI, Type, Schema } from '@google/genai';

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
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

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
          const prompt = `You are a professional news editor for a Sri Lankan tech news website. 
          Write a FULL, comprehensive news article in Sinhala based on the following news information.
          DO NOT just translate the short description. You must expand on the topic to write a complete, detailed news report (at least 3-4 paragraphs) in Sinhala.
          Format the body of the article using HTML <p> tags for paragraphs. Make it engaging for readers.
          
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
        readTime: '3 min read'
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

    const context = getContext();
    const result = await angularAppEngine.handle(request, context);
    return result || new Response('Not found', { status: 404 });
  } catch (err) {
    console.error('Netlify SSR Error:', err);
    return new Response('SSR Error: ' + (err instanceof Error ? err.message : String(err)), { status: 500 });
  }
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
