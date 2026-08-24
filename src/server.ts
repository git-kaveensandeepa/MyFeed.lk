import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js';
import { Buffer } from 'buffer';
import Groq from 'groq-sdk';
import webpush from 'web-push';

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

interface ServerArticleItem {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: { name: string };
}

interface TranslatedServerArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  date: string;
  readTime: string;
  authorType?: string;
  isAiGenerated?: boolean;
  sourceUrl?: string;
}

// Cache for news
let cachedNews: TranslatedServerArticle[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// 100% Free, Official RSS Feeds for Server Live Cache (AI, Local Sri Lanka, Tech)
const SERVER_RSS_FEEDS = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml' },
  { name: 'Google News AI', url: 'https://news.google.com/rss/search?q=Artificial+Intelligence+OR+ChatGPT+OR+Gemini+AI&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Daily FT Sri Lanka', url: 'https://www.ft.lk/rss/it-telecom-technology' },
  { name: 'Ada Derana', url: 'http://www.adaderana.lk/rss.php' },
  { name: 'The Verge Tech', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'BBC Tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
];

function getServerTopicImage(title = ''): string {
  const t = title.toLowerCase();
  if (
    t.includes('apple') || 
    t.includes('iphone') || 
    t.includes('macbook') || 
    t.includes('ipad') || 
    t.includes('ios') || 
    t.includes('vision pro') || 
    t.includes('ඇපල්') || 
    t.includes('අයිෆෝන්')
  ) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80';
  }
  if (
    t.includes('samsung') || 
    t.includes('galaxy') || 
    t.includes('z fold') || 
    t.includes('z flip') || 
    t.includes('s24') || 
    t.includes('s25') ||
    t.includes('සැම්සුන්')
  ) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('pixel') || t.includes('android') || t.includes('google phone') || t.includes('ගූගල්')) {
    return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('ai') || t.includes('gpt') || t.includes('openai') || t.includes('claude') || t.includes('gemini') || t.includes('deepseek') || t.includes('කෘත්‍රිම බුද්ධිය')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('cyber') || t.includes('hack') || t.includes('security') || t.includes('malware') || t.includes('සයිබර්')) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('chip') || t.includes('nvidia') || t.includes('semiconductor') || t.includes('intel') || t.includes('amd') || t.includes('චිප්')) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80';
}

function isValidServerImage(url: string): boolean {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes('googleusercontent.com') ||
    lower.includes('news.google.com') ||
    lower.includes('gstatic.com') ||
    lower.includes('google.com/favicon') ||
    lower.includes('avatar') ||
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('1x1') ||
    lower.includes('pixel') ||
    lower.includes('badge') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  ) {
    return false;
  }
  return true;
}

function parseServerRss(xmlText: string, sourceName: string): ServerArticleItem[] {
  const items: ServerArticleItem[] = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 5)) {
    const titleMatch = itemXml.match(/<title(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const linkMatch = itemXml.match(/<link(?:[^>]*)href="([^"]+)"/i) || itemXml.match(/<link(?:[^>]*)>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? (linkMatch[1] || linkMatch[0]).trim() : '';

    const descMatch = itemXml.match(/<description(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    let description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    description = description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    // Extract exact original article image from media tags or description
    let imageUrl = '';
    const mediaMatch = itemXml.match(/<media:content[^>]+url="([^">]+)"/i) ||
                       itemXml.match(/<enclosure[^>]+url="([^">]+)"/i) ||
                       itemXml.match(/<media:thumbnail[^>]+url="([^">]+)"/i);
    if (mediaMatch && mediaMatch[1] && isValidServerImage(mediaMatch[1])) {
      imageUrl = mediaMatch[1];
    } else {
      const rawImgMatch = (descMatch ? descMatch[1] : '').match(/<img\s+[^>]*src="([^">]+)"/i);
      if (rawImgMatch && rawImgMatch[1] && isValidServerImage(rawImgMatch[1])) {
        imageUrl = rawImgMatch[1];
      }
    }

    const dateMatch = itemXml.match(/<pubDate(?:[^>]*)>([\s\S]*?)<\/pubDate>/i);
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    if (title) {
      items.push({
        title,
        description: description || title,
        url: link,
        imageUrl: imageUrl || getServerTopicImage(title),
        publishedAt: pubDate,
        source: { name: sourceName }
      });
    }
  }
  return items;
}

async function fetchAndTranslateNews(): Promise<TranslatedServerArticle[]> {
  const geminiApiKey = process.env['GROQ_API_KEY'];

  // Fetch from RSS Feeds
  let articles: ServerArticleItem[] = [];
  for (const feed of SERVER_RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (res.ok) {
        const xml = await res.text();
        const parsed = parseServerRss(xml, feed.name);
        articles.push(...parsed);
      }
    } catch (e) {
      console.warn(`RSS fetch error for ${feed.name}:`, e);
    }
  }

  if (articles.length === 0) {
    return [];
  }

  // Pick top 3 unique articles
  articles = articles.slice(0, 3);

  if (!geminiApiKey) {
    return articles.map((a, i) => ({
      id: `rss-${i}-${Date.now()}`,
      title: a.title,
      summary: a.description,
      content: `<p>${a.description}</p><p><a href="${a.url}" target="_blank">Read more</a></p>`,
      category: 'Tech',
      imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      date: new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: '3 min read'
    }));
  }

  // 2. Translate and enrich with Gemini
  const ai = new Groq({ apiKey: geminiApiKey });
  const translatedArticles: TranslatedServerArticle[] = [];

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
Source URL: ${article.url}

CATEGORY RULE:
Classify into strictly one of: 'AI' (for Artificial Intelligence, ChatGPT, OpenAI, Claude, LLMs), 'Local' (for Sri Lanka news), or 'Tech' (for Apple, Samsung, hardware, general gadgets).`;
          
          
          const groqResponse = await ai.chat.completions.create({
            model: "qwen/qwen3.6-27b",
            messages: [
              {
                role: "system",
                content: "You are a helpful API that only returns valid JSON. The JSON must exactly match this schema: { sinhalaTitle: string, sinhalaDescription: string, sinhalaFullContent: string, category: 'AI' | 'Local' | 'Tech' }"
              },
              {
                role: "user",
                content: prompt + "\n\nPlease return JSON according to the schema."
              }
            ],
            response_format: { type: "json_object" }
          });
          genResponse = { text: groqResponse.choices[0].message.content };
          break; // Success, exit retry loop
        } catch (err: unknown) {
          attempt++;
          const errorObj = err as { status?: number | string; message?: string };
          const isRateLimit = errorObj?.status === 429 || errorObj?.status === 'RESOURCE_EXHAUSTED' || errorObj?.message?.includes('429') || errorObj?.message?.includes('RESOURCE_EXHAUSTED');
          const isHighDemand = errorObj?.status === 503 || errorObj?.message?.includes('503');

          if ((isRateLimit || isHighDemand) && attempt < maxAttempts) {
            const delayMs = isRateLimit ? 7000 * attempt : 3000 * attempt;
            console.log(`[Gemini Retry ${attempt}/${maxAttempts}] Rate/demand notice. Waiting ${delayMs / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            throw err;
          }
        }
      }
      
      const translation = JSON.parse(genResponse?.text || '{}');
      const rawCategory = (translation.category || 'Tech').toLowerCase();
      const detectedCategory = rawCategory.includes('ai') || rawCategory.includes('artificial') ? 'AI' :
                               rawCategory.includes('local') || rawCategory.includes('lanka') ? 'Local' : 'Tech';
      
      translatedArticles.push({
        id: `news-${index}-${Date.now()}`,
        title: translation.sinhalaTitle || article.title,
        summary: translation.sinhalaDescription || article.description,
        content: (translation.sinhalaFullContent || `<p>${translation.sinhalaDescription}</p>`) + `<br><p><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">මුල් පුවත කියවන්න (Read original article)</a></p>`,
        category: detectedCategory,
        imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '4 min read',
        authorType: 'ai',
        isAiGenerated: true,
        sourceUrl: article.url || ''
      });

      if (index < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      console.warn('Translation fallback triggered:', err?.message || e);
      translatedArticles.push({
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        summary: article.description,
        content: `<p>${article.description}</p><br><p><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Read original article</a></p>`,
        category: 'Tech',
        imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        date: new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '3 min read'
      });
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
      const hasApiErrors = cachedNews && cachedNews.some((a) => a.content.includes('translation currently unavailable'));
      const shouldFetch = !cachedNews || (now - lastFetchTime > CACHE_DURATION_MS) || (hasApiErrors && now - lastFetchTime > 5 * 60 * 1000); // Retry after 5 mins if there was an error
      
      if (shouldFetch) {
        try {
          cachedNews = await fetchAndTranslateNews();
          lastFetchTime = now;
        } catch (e: unknown) {
          const err = e as { message?: string };
          console.error('Error fetching news:', e);
          if (!cachedNews) {
            return new Response(JSON.stringify({ error: err?.message || 'Failed to fetch news' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
          }
        }
      }
      return new Response(JSON.stringify(cachedNews), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    
    // AI Article Generation from a Given URL
    if (url.pathname === '/api/generate-from-url' && request.method === 'POST') {
      const geminiApiKey = process.env['GROQ_API_KEY'];
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
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
          .substring(0, 150000); // cap to ~150k characters just in case it's massive

        const ai = new Groq({ apiKey: geminiApiKey });
        const prompt = `You are a senior chief technology journalist and editor for MyFeed.lk, Sri Lanka's leading tech publication.
I will provide you with the raw HTML source code of a news webpage. Your job is to extract the MAIN article content (ignore navbars, footers, ads, sidebars), figure out what the story is about, and then write a comprehensive, in-depth, long-form news article in fluent, professional Sinhala (දීර්ඝ පූර්ණ මාධ්‍යවේදී පුවත් වාර්තාවක්) based on that story.

RAW HTML EXTRACT:
${cleanedHtml}

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
6. Classify 'suggestedCategory' as strictly one of: 'AI', 'Local' (Sri Lanka), or 'Tech'.`;

        const groqResponse = await ai.chat.completions.create({
          model: "qwen/qwen3.6-27b",
          messages: [
            {
              role: "system",
              content: "You are an API that only returns valid JSON. Ensure the JSON follows this exact schema: { sinhalaTitle: string, sinhalaDescription: string, sinhalaFullContent: string, suggestedCategory: 'AI'|'Local'|'Tech', visualPrompt: string, readTime: string }"
            },
            {
              role: "user",
              content: prompt + "\n\nPlease return JSON according to the schema."
            }
          ],
          response_format: { type: "json_object" }
        });
        const genResponse = { text: groqResponse.choices[0].message.content };

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

    // Direct AI Long Article Generator Endpoint
    if (url.pathname === '/api/generate-ai-article' && request.method === 'POST') {
      const geminiApiKey = process.env['GROQ_API_KEY'];
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

        const ai = new Groq({ apiKey: geminiApiKey });
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
3. High journalistic standard in modern Sinhala.
4. Classify 'suggestedCategory' as strictly one of: 'AI' (for Artificial Intelligence, ChatGPT, OpenAI, LLMs, robotics), 'Local' (for Sri Lanka tech/news), or 'Tech' (for Apple, Samsung, hardware, gadgets).`;

        const groqResponse = await ai.chat.completions.create({
          model: "qwen/qwen3.6-27b",
          messages: [
            {
              role: "system",
              content: "You are an API that only returns valid JSON. Schema: { sinhalaTitle: string, sinhalaDescription: string, sinhalaFullContent: string, suggestedCategory: 'AI'|'Local'|'Tech', readTime: string }"
            },
            {
              role: "user",
              content: prompt + "\n\nPlease return JSON according to the schema."
            }
          ],
          response_format: { type: "json_object" }
        });
        const genResponse = { text: groqResponse.choices[0].message.content };

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

    // Dedicated AI Image Generator from Article Title
    if (url.pathname === '/api/generate-ai-image' && request.method === 'POST') {
      const geminiApiKey = process.env['GROQ_API_KEY'];
      try {
        const body = await request.json();
        const title = (body.title || body.topic || '').trim();
        const category = body.category || 'Tech';

        if (!title) {
          return new Response(JSON.stringify({ error: 'Title is required to generate an image' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        let visualPrompt = '';

        if (geminiApiKey) {
          try {
            const ai = new Groq({ apiKey: geminiApiKey });
            
            const promptRes = await ai.chat.completions.create({
              model: "qwen/qwen3.6-27b",
              messages: [
                {
                  role: "user",
                  content: `Translate and convert this news article title into a short, descriptive 20-30 word visual prompt for generating a photorealistic, ultra-high-quality tech editorial image.
Title: "${title}"
Category: "${category}"

Rules:
1. Focus on the core visual subject.
2. Avoid text or words inside the image.
3. Use cinematic editorial tech photography style, 8k, modern studio lighting.
4. Output ONLY the English prompt text without quotes or preamble.`
                }
              ]
            });
            visualPrompt = promptRes.choices[0].message.content?.trim().replace(/^"|"$/g, '') || '';

          } catch (promptErr) {
            console.warn('Could not generate Gemini visual prompt, falling back:', promptErr);
          }
        }

        if (!visualPrompt) {
          visualPrompt = `${title} modern high-tech editorial photography studio lighting 8k cinematic`;
        }

        // Generate AI image URL with high-definition 16:9 ratio
        const randomSeed = Math.floor(Math.random() * 1000000);
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1200&height=675&nologo=true&enhance=true&seed=${randomSeed}`;

        return new Response(JSON.stringify({
          imageUrl: generatedImageUrl,
          prompt: visualPrompt
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (imgErr: unknown) {
        const err = imgErr as { message?: string };
        console.error('Error generating AI image from title:', imgErr);
        return new Response(JSON.stringify({ error: err.message || 'Image generation failed' }), {
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
        const { title, summary, articleUrl, category, readTime, customMessage, imageUrl } = body;
        
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

        // 1. If custom Webhook is configured (Zapier / Make / Evolution API / Baileys / WhatsApp Gateway)
        if (waWebhookUrl) {
          const webhookRes = await fetch(waWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: formattedPost,
              caption: formattedPost,
              image: imageUrl || '',
              imageUrl: imageUrl || '',
              title,
              summary,
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
          const waPayload = imageUrl ? {
            messaging_product: 'whatsapp',
            to: waRecipient,
            type: 'image',
            image: {
              link: imageUrl,
              caption: formattedPost
            }
          } : {
            messaging_product: 'whatsapp',
            to: waRecipient,
            type: 'text',
            text: { body: formattedPost }
          };

          const waApiRes = await fetch(`https://graph.facebook.com/v19.0/${waPhoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${waAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(waPayload)
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
          imageUrl: imageUrl || '',
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

    // Instant Phone Push Notification (via ntfy.sh - 100% Free & Open-Source)
    if (url.pathname === '/api/notify/phone' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { title, summary, articleUrl, topic = 'myfeedlk_kaveen', imageUrl } = body;

        const cleanTopic = (topic || 'myfeedlk_kaveen').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'myfeedlk_kaveen';
        const safeTitle = (title ? `📰 ${title}` : '📰 MyFeed.lk: New Story').slice(0, 120);
        const safeMessage = (summary ? `${summary}\n\n🔗 Tap to read full story →` : 'A new article has just been published on MyFeed.lk. Tap to read!').slice(0, 800);
        const safeUrl = (articleUrl || 'https://myfeedlk.web.app').trim();
        
        const payload: Record<string, unknown> = {
          topic: cleanTopic,
          title: safeTitle,
          message: safeMessage,
          click: safeUrl,
          priority: 4,
          tags: ['newspaper', 'rocket']
        };

        // Only attach if it's a valid remote HTTP/HTTPS URL and not a data URL
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          payload['attach'] = imageUrl;
        }

        let res = await fetch('https://ntfy.sh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        // If rejected due to attachment or image fetch error, retry immediately without attachment
        if (!res.ok && payload['attach']) {
          delete payload['attach'];
          res = await fetch('https://ntfy.sh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }

        const resText = await res.text();
        return new Response(JSON.stringify({ success: res.ok, status: res.status, topic: cleanTopic, response: resText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (phoneErr: unknown) {
        const err = phoneErr as { message?: string };
        return new Response(JSON.stringify({ error: err.message || 'Phone notification failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Image Proxy for Web Share API / File blob extraction (bypasses CORS)
    if (url.pathname === '/api/proxy-image' && request.method === 'GET') {
      try {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
          return new Response('Missing url parameter', { status: 400 });
        }
        const imgRes = await fetch(targetUrl);
        if (!imgRes.ok) {
          return new Response('Failed to fetch image', { status: imgRes.status });
        }
        const contentType = imgRes.headers.get('Content-Type') || 'image/jpeg';
        const buffer = await imgRes.arrayBuffer();
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      } catch {
        return new Response('Image proxy error', { status: 500 });
      }
    }

    const context = getContext();
    
    // Web Push API
    if (url.pathname === '/api/notify/webpush' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { title, summary, articleUrl, subscriptions } = body;
        
        const payload = JSON.stringify({
          title: (title ? `📰 ${title}` : 'MyFeed.lk News').slice(0, 50),
          body: (summary || 'A new article has just been published!').slice(0, 150),
          url: articleUrl || '/',
          icon: '/favicon.ico'
        });

        const results = await Promise.allSettled(
          subscriptions.map((sub: any) => webpush.sendNotification(sub, payload))
        );
        
        const failedEndpoints = results
          .map((res, index) => res.status === 'rejected' ? subscriptions[index].endpoint : null)
          .filter(Boolean);

        return new Response(JSON.stringify({ success: true, failedEndpoints }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Web push failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const result = await angularAppEngine.handle(request, context);
    return result || new Response('Not found', { status: 404 });
  } catch (err) {
    console.error('Netlify SSR Error:', err);
    return new Response('SSR Error: ' + (err instanceof Error ? err.message : String(err)), { status: 500 });
  }
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
