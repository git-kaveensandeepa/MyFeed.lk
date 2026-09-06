import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, doc, getDoc, updateDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';

const firebaseConfig = {
  projectId: "gen-lang-client-0797933634",
  appId: "1:203252959685:web:ffcea46dc94edc1675e3ac",
  apiKey: "AIzaSyDyNb52a42_PXS929gTeeKdY3TomCyQYuE",
  authDomain: "gen-lang-client-0797933634.firebaseapp.com",
  storageBucket: "gen-lang-client-0797933634.firebasestorage.app",
  messagingSenderId: "203252959685",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-myfeedlk-576ec80c-841c-44ac-9b2a-8b4ec4ec22e7");

// Hard safety timeout: Exit after max 90 seconds to never hang or consume GitHub Actions minutes
setTimeout(() => {
  console.log('[Safety Limit] Script reached 90s runtime limit. Exiting cleanly to save credits.');
  process.exit(0);
}, 90000).unref();

// 100% Free, Official Direct RSS Feeds with rich Category diversity (AI, Local, Tech)
const RSS_FEEDS = [
  // --- AI (Artificial Intelligence & Machine Learning) ---
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'AI'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'AI'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'AI'
  },
  {
    name: 'Google News - AI & Machine Learning',
    url: 'https://news.google.com/rss/search?q=Artificial+Intelligence+OR+ChatGPT+OR+OpenAI+OR+Gemini+AI+OR+Claude+AI&hl=en-US&gl=US&ceid=US:en',
    category: 'AI'
  },

  // --- Local (Sri Lanka Tech, Innovation & Local News) ---
  {
    name: 'Daily FT - Sri Lanka IT & Telecom',
    url: 'https://www.ft.lk/rss/it-telecom-technology',
    category: 'Local'
  },
  {
    name: 'Google News - Sri Lanka Tech & Digital',
    url: 'https://news.google.com/rss/search?q=Sri+Lanka+technology+OR+Sri+Lanka+digital+OR+Sri+Lanka+telecom+OR+Dialog+Axiata&hl=en-US&gl=US&ceid=US:en',
    category: 'Local'
  },
  {
    name: 'Ada Derana',
    url: 'http://www.adaderana.lk/rss.php',
    category: 'Local'
  },
  {
    name: 'Daily Mirror - Sri Lanka Business & Tech',
    url: 'https://www.dailymirror.lk/rss/business-main/36',
    category: 'Local'
  },

  // --- Tech (Smartphones, Hardware, Apple, Samsung, Gadgets) ---
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Tech'
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Tech'
  },
  {
    name: 'BBC News - Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Tech'
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'Tech'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Tech'
  },
  {
    name: '9to5Google',
    url: 'https://9to5google.com/feed/',
    category: 'Tech'
  },
  {
    name: '9to5Mac',
    url: 'https://9to5mac.com/feed/',
    category: 'Tech'
  },
  {
    name: 'Android Authority',
    url: 'https://www.androidauthority.com/feed/',
    category: 'Tech'
  },
  {
    name: 'SamMobile',
    url: 'https://www.sammobile.com/feed/',
    category: 'Tech'
  },
  {
    name: 'Google News - Technology',
    url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
    category: 'Tech'
  }
];

// Topic-matching high-resolution photography fallbacks
function getTopicFallbackImage(title = '', category = '') {
  const t = (title + ' ' + category).toLowerCase();
  
  // 1. Apple & iPhone Ecosystem
  if (
    t.includes('apple') || 
    t.includes('iphone') || 
    t.includes('macbook') || 
    t.includes('ipad') || 
    t.includes('ios') || 
    t.includes('vision pro') || 
    t.includes('airpods') ||
    t.includes('ඇපල්') || 
    t.includes('අයිෆෝන්') || 
    t.includes('අයිපෑඩ්') || 
    t.includes('මැක්බුක්')
  ) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80';
  }

  // 2. Samsung Galaxy
  if (
    t.includes('samsung') || 
    t.includes('galaxy') || 
    t.includes('z fold') || 
    t.includes('z flip') || 
    t.includes('s24') || 
    t.includes('s25') ||
    t.includes('සැම්සුන්') || 
    t.includes('ගැලැක්සි')
  ) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80';
  }

  // 3. Google Pixel & Android
  if (
    t.includes('pixel') || 
    t.includes('android') || 
    t.includes('google phone') || 
    t.includes('ගූගල්') || 
    t.includes('ඇන්ඩ්‍රොයිඩ්')
  ) {
    return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80';
  }

  // 4. General Foldable / Smartphones
  if (t.includes('foldable') || t.includes('flip phone') || t.includes('නැවෙන සුළු') || t.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80';
  }

  // 5. Artificial Intelligence & Generative AI
  if (
    t.includes('ai') || 
    t.includes('gpt') || 
    t.includes('chatgpt') || 
    t.includes('openai') || 
    t.includes('claude') || 
    t.includes('gemini') || 
    t.includes('deepseek') || 
    t.includes('intelligence') || 
    t.includes('llm') || 
    t.includes('bot') || 
    t.includes('කෘත්‍රිම බුද්ධිය') || 
    t.includes('ඒඅයි') || 
    t.includes('ජෙමිනයි')
  ) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80';
  }

  // 6. Robotics & Automation
  if (
    t.includes('robot') || 
    t.includes('humanoid') || 
    t.includes('automation') || 
    t.includes('boston dynamics') || 
    t.includes('රොබෝ')
  ) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80';
  }

  // 7. Cybersecurity & Privacy
  if (
    t.includes('cyber') || 
    t.includes('hack') || 
    t.includes('security') || 
    t.includes('malware') || 
    t.includes('privacy') || 
    t.includes('breach') || 
    t.includes('සයිබර්') || 
    t.includes('හැක්')
  ) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';
  }

  // 8. Semiconductor, Chips & Hardware
  if (
    t.includes('chip') || 
    t.includes('nvidia') || 
    t.includes('semiconductor') || 
    t.includes('intel') || 
    t.includes('amd') || 
    t.includes('qualcomm') || 
    t.includes('gpu') || 
    t.includes('processor') || 
    t.includes('චිප්') || 
    t.includes('ප්‍රොසෙසර්')
  ) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  }

  // 9. Gaming & Consoles
  if (
    t.includes('game') || 
    t.includes('gaming') || 
    t.includes('playstation') || 
    t.includes('xbox') || 
    t.includes('nintendo') || 
    t.includes('gta') || 
    t.includes('ගේමින්') || 
    t.includes('ප්ලේස්ටේෂන්')
  ) {
    return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';
  }

  // 10. Space, NASA & Astronomy
  if (
    t.includes('space') || 
    t.includes('nasa') || 
    t.includes('spacex') || 
    t.includes('mars') || 
    t.includes('satellite') || 
    t.includes('orbit') || 
    t.includes('අභ්‍යවකාශ') || 
    t.includes('නාසා')
  ) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
  }

  // 11. Electric Vehicles & Tesla
  if (
    t.includes('tesla') || 
    t.includes('ev') || 
    t.includes('electric vehicle') || 
    t.includes('car') || 
    t.includes('auto') || 
    t.includes('ටෙස්ලා') || 
    t.includes('විදුලි වාහන')
  ) {
    return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80';
  }

  // 12. Sri Lanka / Local
  if (
    t.includes('sri lanka') || 
    t.includes('colombo') || 
    t.includes('lka') || 
    t.includes('ශ්‍රී ලංකා') || 
    t.includes('ලංකා') || 
    category?.toLowerCase() === 'local'
  ) {
    return 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80';
}

// Generate dynamic AI image directly matching the article title and subject
async function generateAiImageUrlFromTitle(ai, title = '', category = 'Tech') {
  try {
    let visualPrompt = '';
    if (ai) {
      const promptRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Translate and convert this tech news headline into a concise 20-word visual description for a photorealistic editorial tech photograph.
Headline: "${title}"
Category: "${category}"
Rules: Focus on hardware/device/concept, studio lighting, 8k, cinematic, no text on image. Output ONLY the English prompt.`,
      });
      visualPrompt = promptRes.text?.trim().replace(/^"|"$/g, '') || '';
    }
    
    if (!visualPrompt) {
      visualPrompt = `${title} modern tech gadget studio lighting 8k cinematic`;
    }

    const randomSeed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPrompt)}?width=1200&height=675&nologo=true&enhance=true&seed=${randomSeed}`;
  } catch (err) {
    console.warn('Could not generate AI image from title, using topic fallback:', err.message || err);
    return getTopicFallbackImage(title, category);
  }
}

function getNormalizedKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Decode Google News redirect tokens to get the actual publisher destination URL
function resolvePublisherUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('news.google.com/rss/articles/') || url.includes('news.google.com/articles/')) {
    try {
      const match = url.match(/articles\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        const token = match[1];
        const raw = Buffer.from(token, 'base64').toString('latin1');
        const urlMatch = raw.match(/https?:\/\/[^\x00-\x1F\x7F-\x9F"'\s<>]+/);
        if (urlMatch && urlMatch[0]) {
          return urlMatch[0];
        }
      }
    } catch (_) {}
  }
  return url;
}

// Fetch and scrape original article HTML to extract the exact real featured image
async function fetchOriginalArticleImage(rawUrl) {
  const articleUrl = resolvePublisherUrl(rawUrl);
  if (!articleUrl || !articleUrl.startsWith('http')) return '';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);
    if (!response.ok) return '';

    const html = await response.text();

    // 1. OpenGraph secure or standard og:image
    const ogMatch = html.match(/<meta\s+[^>]*property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image:secure_url["']/i) ||
                    html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
                    html.match(/<meta\s+[^>]*name=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1] && isValidArticlePhoto(ogMatch[1])) return ogMatch[1];

    // 2. Twitter Card Image
    const twMatch = html.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i) ||
                    html.match(/<meta\s+[^>]*name=["']twitter:image:src["'][^>]*content=["']([^"']+)["']/i);
    if (twMatch && twMatch[1] && isValidArticlePhoto(twMatch[1])) return twMatch[1];

    // 3. Schema.org / JSON-LD
    const jsonLdMatch = html.match(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch && jsonLdMatch[1]) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        const img = parsed.image?.url || (Array.isArray(parsed.image) ? (parsed.image[0]?.url || parsed.image[0]) : parsed.image) || parsed.thumbnailUrl;
        if (typeof img === 'string' && isValidArticlePhoto(img)) return img;
      } catch (_) {}
    }

    // 4. Picture or Lead Article Image
    const leadImgMatch = html.match(/<article[^>]*>[\s\S]*?<img\s+[^>]*src=["']([^"']+)["']/i) ||
                         html.match(/<figure[^>]*>[\s\S]*?<img\s+[^>]*src=["']([^"']+)["']/i);
    if (leadImgMatch && leadImgMatch[1] && isValidArticlePhoto(leadImgMatch[1])) return leadImgMatch[1];
  } catch (e) {
    // Graceful silent fallback
  }
  return '';
}

function isValidArticlePhoto(url) {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
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
    lower.includes('emoji') || 
    lower.includes('spinner') || 
    lower.includes('placeholder') ||
    lower.includes('blank') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  ) {
    return false;
  }
  return true;
}

// Lightweight XML parser for RSS Feeds
function parseRssXml(xmlText, sourceName, category) {
  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || xmlText.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const itemXml of itemMatches) {
    // Title
    const titleMatch = itemXml.match(/<title(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    // Link
    const linkMatch = itemXml.match(/<link(?:[^>]*)href="([^"]+)"/i) || itemXml.match(/<link(?:[^>]*)>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? (linkMatch[1] || linkMatch[0]).trim() : '';

    // Description / Summary
    const descMatch = itemXml.match(/<description(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
                      itemXml.match(/<summary(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i) ||
                      itemXml.match(/<content(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i);
    let description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    description = description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    // Extract genuine original image from media tags or description HTML
    let imageUrl = '';
    const mediaMatch = itemXml.match(/<media:content[^>]+url="([^">]+)"/i) ||
                       itemXml.match(/<enclosure[^>]+url="([^">]+)"/i) ||
                       itemXml.match(/<media:thumbnail[^>]+url="([^">]+)"/i);
    if (mediaMatch && isValidArticlePhoto(mediaMatch[1])) {
      imageUrl = mediaMatch[1];
    } else {
      const rawImgMatch = (descMatch ? descMatch[1] : '').match(/<img\s+[^>]*src="([^">]+)"/i) || itemXml.match(/<img\s+[^>]*src="([^">]+)"/i);
      if (rawImgMatch && isValidArticlePhoto(rawImgMatch[1])) {
        imageUrl = rawImgMatch[1];
      }
    }

    // Published date
    const dateMatch = itemXml.match(/<pubDate(?:[^>]*)>([\s\S]*?)<\/pubDate>/i) || itemXml.match(/<updated(?:[^>]*)>([\s\S]*?)<\/updated>/i);
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    if (title && (link || description)) {
      items.push({
        title,
        description: description || title,
        url: link,
        urlToImage: imageUrl,
        publishedAt: pubDate,
        source: { name: sourceName },
        category
      });
    }
  }

  return items;
}

async function fetchFromRssFeeds() {
  console.log('Fetching live articles from fast RSS Feeds...');
  const allArticles = [];

  // Pick 1 AI, 1 Local, and 1 Tech feed to guarantee variety while remaining ultra-fast
  const aiFeeds = RSS_FEEDS.filter(f => f.category === 'AI');
  const localFeeds = RSS_FEEDS.filter(f => f.category === 'Local');
  const techFeeds = RSS_FEEDS.filter(f => f.category === 'Tech');

  const selectedFeeds = [
    aiFeeds[Math.floor(Math.random() * aiFeeds.length)],
    localFeeds[Math.floor(Math.random() * localFeeds.length)],
    techFeeds[Math.floor(Math.random() * techFeeds.length)]
  ].filter(Boolean);

  for (const feed of selectedFeeds) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`Could not fetch RSS from ${feed.name}: ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const parsed = parseRssXml(xml, feed.name, feed.category);
      console.log(`✓ Fetched ${parsed.length} articles from ${feed.name}`);
      // Take only top 3 freshest items per feed
      allArticles.push(...parsed.slice(0, 3));
    } catch (e) {
      console.warn(`Notice fetching ${feed.name}:`, e.message || e);
    }
  }

  return allArticles;
}

async function generateFullSinhalaArticle(ai, article) {
  const maxAttempts = 3;
  let attempt = 0;

  const prompt = `You are an award-winning senior technology journalist and chief editor for MyFeed.lk (ශ්‍රී ලංකාවේ ප්‍රමුඛතම තාක්ෂණික පුවත් සහ විචාරාත්මක මාධ්‍ය ජාලය).

TASK:
Write a comprehensive, exhaustive, highly detailed LONG-FORM technology news article in fluent, professional Sinhala (දීර්ඝ, සම්පූර්ණ හා විචාරාත්මක පුවත් වාර්තාවක්) based on the story below.

LENGTH & DEPTH REQUIREMENTS:
1. This MUST be a LONG ARTICLE (at least 600-900 words in Sinhala, minimum 5-7 thorough paragraphs).
2. DO NOT write short summaries. Expand comprehensively with context, technical explanation, historical background, and industry analysis.

REQUIRED HTML STRUCTURE for 'sinhalaFullContent':
- <p class="lead font-medium text-lg">Detailed opening paragraph introducing the breaking event, why it matters, and who is involved.</p>
- <h2>ප්‍රධාන තාක්ෂණික තොරතුරු සහ විශේෂාංග (Key Technical Highlights)</h2>
- <p>Detailed analysis of how this technology works, architecture, design decisions, and new capabilities.</p>
- <ul class="list-disc pl-6 space-y-2">
    <li><strong>විශේෂාංගය 1:</strong> Specific technical feature explained in detail.</li>
    <li><strong>විශේෂාංගය 2:</strong> Performance, efficiency, or design improvement.</li>
    <li><strong>විශේෂාංගය 3:</strong> Compatibility, pricing, or rollout schedule.</li>
  </ul>
- <h2>පරිශීලකයින්ට සහ තාක්ෂණික ක්ෂේත්‍රයට ඇතිවන බලපෑම (Industry & User Impact)</h2>
- <p>How this changes consumer experience, workflow, developer ecosystem, or security.</p>
- <h2>වෙළඳපොළ තරඟකාරිත්වය සහ අනාගත දැක්ම (Market Competition & Outlook)</h2>
- <p>Comparison with rivals (e.g., Apple, Google, Microsoft, Meta, OpenAI) and what to expect in upcoming months.</p>
- <h2>සාරාංශය සහ MyFeed.lk විග්‍රහය (Final Verdict)</h2>
- <p>Concluding thoughts summarizing the long-term value and recommendation.</p>

SOURCE MATERIAL:
Title: ${article.title}
Summary: ${article.description}
Source: ${article.source?.name || 'Global News'}
Feed Default Category: ${article.category || 'Tech'}

CATEGORY CLASSIFICATION RULE:
Classify the story into exactly one of these 3 category labels:
- 'AI' : If about Artificial Intelligence, Machine Learning, ChatGPT, OpenAI, Claude, Gemini, DeepSeek, Copilot, Midjourney, LLMs, Neural Networks, Humanoid AI robots.
- 'Local' : If about Sri Lanka, Colombo, Dialog, Mobitel, SLT, local startups, IT/telecom sector in Sri Lanka, local business & technology events.
- 'Tech' : If about smartphones (Apple, Samsung, Google Pixel), gadgets, semiconductors, hardware, Windows, Android, cybersecurity, space, gaming.`;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`Generating Long Sinhala Article with Gemini (Attempt ${attempt}/${maxAttempts})...`);
      
      const modelName = 'gemini-3.8-flash';
      const genResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sinhalaTitle: { 
                type: Type.STRING, 
                description: "An engaging, high-impact, professional headline in Sinhala." 
              },
              sinhalaDescription: { 
                type: Type.STRING, 
                description: "A comprehensive 2-3 sentence executive summary in Sinhala." 
              },
              sinhalaFullContent: { 
                type: Type.STRING, 
                description: "A LONG-FORM comprehensive multi-paragraph Sinhala article with HTML subheadings, bullet lists, and paragraphs. Minimum 500+ words." 
              },
              category: {
                type: Type.STRING,
                description: "One of 'AI', 'Local', or 'Tech'"
              }
            },
            required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'category']
          }
        }
      });

      const parsed = JSON.parse(genResponse?.text || '{}');
      if (parsed.sinhalaTitle && parsed.sinhalaDescription && parsed.sinhalaFullContent && parsed.sinhalaFullContent.length > 400) {
        return parsed;
      }
      throw new Error('Generated content length was too short');
    } catch (err) {
      console.warn(`Gemini generation attempt ${attempt} failed:`, err.message || err);
      const isRateLimit = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit) {
        console.warn('Gemini quota / rate limit reached. Halting run cleanly to save GitHub Actions credits.');
        process.exit(0);
      }
      if (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }

  return null;
}

async function runAutoNewsUpload() {
  console.log('=== Starting 100% Free Automated Long-Form Sinhala News Fetch & Firebase Upload ===');
  const geminiApiKey = process.env['GEMINI_API_KEY'];

  if (!geminiApiKey) {
    console.error('ERROR: GEMINI_API_KEY is not set in environment.');
    process.exit(1);
  }

  try {
    // Load Auto-Pilot configuration from Firestore system_config/autopilot if available
    let autoPilotConfig = {
      enabled: true,
      autoPublish: true,
      maxArticlesPerRun: 2,
      waWebhookUrl: process.env['WHATSAPP_WEBHOOK_URL'] || '',
      fbWebhookUrl: process.env['FACEBOOK_WEBHOOK_URL'] || '',
      phoneTopic: process.env['PHONE_NOTIFICATION_TOPIC'] || 'myfeedlk_kaveen',
      notifyPhone: true,
      postWhatsApp: true,
      postFacebook: true,
    };
    try {
      const cfgSnap = await getDoc(doc(db, 'system_config', 'autopilot'));
      if (cfgSnap.exists()) {
        const d = cfgSnap.data();
        if (typeof d['enabled'] === 'boolean') autoPilotConfig.enabled = d['enabled'];
        if (typeof d['autoPublish'] === 'boolean') autoPilotConfig.autoPublish = d['autoPublish'];
        if (typeof d['maxArticlesPerRun'] === 'number') autoPilotConfig.maxArticlesPerRun = d['maxArticlesPerRun'];
        if (d['waWebhookUrl']) autoPilotConfig.waWebhookUrl = d['waWebhookUrl'];
        if (d['fbWebhookUrl']) autoPilotConfig.fbWebhookUrl = d['fbWebhookUrl'];
        if (d['phoneTopic']) autoPilotConfig.phoneTopic = d['phoneTopic'];
        if (typeof d['notifyPhone'] === 'boolean') autoPilotConfig.notifyPhone = d['notifyPhone'];
        if (typeof d['postWhatsApp'] === 'boolean') autoPilotConfig.postWhatsApp = d['postWhatsApp'];
        if (typeof d['postFacebook'] === 'boolean') autoPilotConfig.postFacebook = d['postFacebook'];
        console.log('✓ Loaded Auto-Pilot configuration from Firestore system_config/autopilot');
      }
    } catch (cfgErr) {
      console.log('Note: using environment variables / defaults for Auto-Pilot config:', cfgErr.message || cfgErr);
    }

    if (!autoPilotConfig.enabled) {
      console.log('Auto-Pilot is currently disabled in system_config/autopilot. Exiting cleanly.');
      process.exit(0);
    }

    // 1. Fetch all existing articles from Firestore to build robust deduplication index
    console.log('Fetching existing articles from Firestore for duplicate detection...');
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(200));
    const querySnapshot = await getDocs(q);
    
    const existingSourceUrls = new Set();
    const existingImageUrls = new Set();
    const existingOriginalTitles = new Set();
    const existingSinhalaTitles = new Set();

    querySnapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      if (data.sourceUrl) existingSourceUrls.add(data.sourceUrl.trim().toLowerCase());
      if (data.imageUrl && !data.imageUrl.startsWith('data:image')) {
        existingImageUrls.add(data.imageUrl.split('?')[0].trim().toLowerCase());
      }
      if (data.originalTitle) existingOriginalTitles.add(getNormalizedKey(data.originalTitle));
      if (data.title) existingSinhalaTitles.add(data.title.trim().toLowerCase());

      // Auto-cleanup legacy Google News logos in Firestore
      if (data.imageUrl && !isValidArticlePhoto(data.imageUrl)) {
        const replacementImg = getTopicFallbackImage(data.title || data.originalTitle, data.category);
        try {
          await updateDoc(doc(db, 'articles', docSnap.id), { imageUrl: replacementImg });
          console.log(`[Auto-Cleaned] Replaced logo with high-res photo for "${data.title || docSnap.id}"`);
        } catch (_) {}
      }
    });

    console.log(`Indexed existing records: ${existingSourceUrls.size} URLs, ${existingImageUrls.size} Images, ${existingSinhalaTitles.size} Titles.`);

    // 2. Fetch fresh articles from Official RSS Feeds (No NewsAPI required!)
    const articles = await fetchFromRssFeeds();

    if (articles.length === 0) {
      console.log('No articles fetched from RSS feeds.');
      process.exit(0);
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let uploadedCount = 0;
    const candidates = articles.slice(0, 6);

    for (let index = 0; index < candidates.length; index++) {
      const article = candidates[index];
      const sourceUrl = (article.url || '').trim().toLowerCase();
      const normalizedTitleKey = getNormalizedKey(article.title);

      // Strict duplicate check across URL and Title
      if (sourceUrl && existingSourceUrls.has(sourceUrl)) {
        console.log(`[Duplicate Skip] Source URL already exists: "${article.title}"`);
        continue;
      }
      if (existingOriginalTitles.has(normalizedTitleKey)) {
        console.log(`[Duplicate Skip] English title key already exists: "${article.title}"`);
        continue;
      }

      console.log(`\n[${index + 1}/${articles.length}] Generating Long Sinhala Article for: "${article.title}"`);
      
      // Attempt to extract the real high-res original article image from the source webpage
      let finalImageUrl = article.urlToImage;
      if (!finalImageUrl || !isValidArticlePhoto(finalImageUrl)) {
        console.log(`Extracting original high-res article image from source page: ${article.url}`);
        const scrapedImg = await fetchOriginalArticleImage(article.url);
        if (scrapedImg && isValidArticlePhoto(scrapedImg)) {
          finalImageUrl = scrapedImg;
          console.log(`✓ Successfully extracted original article image: ${scrapedImg}`);
        } else {
          finalImageUrl = await generateAiImageUrlFromTitle(ai, article.title, article.category);
          console.log(`✓ Generated custom AI visual from title: ${finalImageUrl}`);
        }
      }

      const fullArticle = await generateFullSinhalaArticle(ai, article);

      if (!fullArticle) {
        console.warn(`Could not generate full Sinhala content for "${article.title}". Skipping.`);
        continue;
      }

      const formattedContent = fullArticle.sinhalaFullContent + 
        `<div class="mt-10 pt-6 border-t border-black/10 dark:border-white/10 text-sm font-medium">` +
        `<p><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-bold">` +
        `<span>මුල් පුවත් වාර්තාව කියවන්න (Source: ${article.source?.name || 'Official Tech Feed'}) &rarr;</span>` +
        `</a></p></div>`;

      const detectedCategory = fullArticle.category || article.category || 'Tech';
      const cleanCategory = (detectedCategory.toLowerCase().includes('ai') || detectedCategory.toLowerCase().includes('artificial')) ? 'AI' :
                            (detectedCategory.toLowerCase().includes('local') || detectedCategory.toLowerCase().includes('sri lanka') || detectedCategory.toLowerCase().includes('lanka')) ? 'Local' : 'Tech';

      const articleDoc = {
        title: fullArticle.sinhalaTitle,
        summary: fullArticle.sinhalaDescription,
        content: formattedContent,
        category: cleanCategory,
        imageUrl: finalImageUrl,
        date: new Date(article.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '5 min read',
        sourceUrl: article.url || '',
        originalTitle: article.title || '',
        authorType: 'ai',
        isAiGenerated: true,
        createdAt: serverTimestamp()
      };

      // Upload to Firebase Firestore (Articles or Drafts based on Auto-Pilot config)
      const targetCollection = autoPilotConfig.autoPublish ? 'articles' : 'drafts';
      const colRef = collection(db, targetCollection);
      const docRef = await addDoc(colRef, articleDoc);
      console.log(`✓ Successfully uploaded NEW Long Sinhala Article to Firebase [${targetCollection}]! (Doc ID: ${docRef.id})`);
      console.log(`  Title: ${fullArticle.sinhalaTitle}`);
      uploadedCount++;

      const siteBaseUrl = process.env['SITE_URL'] || 'https://myfeedlk.web.app';
      const articleUrl = `${siteBaseUrl}/article/${docRef.id}`;

      // Auto-post to WhatsApp Channel if configured
      const waWebhook = autoPilotConfig.waWebhookUrl || process.env['WHATSAPP_WEBHOOK_URL'];
      if (autoPilotConfig.postWhatsApp && waWebhook) {
        try {
          const formattedPost = `*🚀 NEW ON MYFEED.LK (${cleanCategory})*\n\n*${fullArticle.sinhalaTitle}*\n\n${fullArticle.sinhalaDescription}\n\n⏱️ 5 min read\n🔗 *Read full story:* ${articleUrl}\n\n_Curated with precision by MyFeed.lk Sri Lanka_`;
          await fetch(waWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: formattedPost,
              caption: formattedPost,
              image: finalImageUrl,
              imageUrl: finalImageUrl,
              title: fullArticle.sinhalaTitle,
              summary: fullArticle.sinhalaDescription,
              url: articleUrl,
              category: cleanCategory
            })
          });
          console.log(`  ✓ Auto-posted to WhatsApp Channel Webhook!`);
        } catch (waErr) {
          console.warn('  WhatsApp Webhook auto-post notice:', waErr.message || waErr);
        }
      }

      // Auto-post to Facebook Webhook if configured
      const fbWebhook = autoPilotConfig.fbWebhookUrl || process.env['FACEBOOK_WEBHOOK_URL'];
      if (autoPilotConfig.postFacebook && fbWebhook) {
        try {
          const formattedFbPost = `🚀 ${fullArticle.sinhalaTitle}\n\n${fullArticle.sinhalaDescription}\n\n⏱️ 5 min read\n🔗 කියවන්න: ${articleUrl}\n\n#MyFeedLK #TechNews #SriLanka #${cleanCategory}`;
          await fetch(fbWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: formattedFbPost,
              text: formattedFbPost,
              caption: formattedFbPost,
              image: finalImageUrl,
              imageUrl: finalImageUrl,
              title: fullArticle.sinhalaTitle,
              summary: fullArticle.sinhalaDescription,
              url: articleUrl,
              category: cleanCategory
            })
          });
          console.log(`  ✓ Auto-posted to Facebook Webhook!`);
        } catch (fbErr) {
          console.warn('  Facebook Webhook auto-post notice:', fbErr.message || fbErr);
        }
      }

      // Auto-dispatch Instant Phone Push Notification (100% Free via ntfy.sh)
      const phoneTopic = autoPilotConfig.phoneTopic || process.env['PHONE_NOTIFICATION_TOPIC'] || 'myfeedlk_kaveen';
      if (autoPilotConfig.notifyPhone && phoneTopic) {
        try {
          await fetch(`https://ntfy.sh/${phoneTopic}`, {
            method: 'POST',
            headers: {
              'Title': `📰 MyFeed.lk (${cleanCategory}): ${fullArticle.sinhalaTitle}`,
              'Click': articleUrl,
              'Tags': 'newspaper,rocket',
              'Priority': 'high',
              ...(finalImageUrl ? { 'Attach': finalImageUrl } : {})
            },
            body: `${fullArticle.sinhalaDescription}\n\nTap to read on MyFeed.lk`
          });
          console.log(`  ✓ Phone Push Alert dispatched to topic: ${phoneTopic}`);
        } catch (phoneErr) {
          console.warn('  Phone Push alert notice:', phoneErr.message || phoneErr);
        }
      }

      if (sourceUrl) existingSourceUrls.add(sourceUrl);
      existingOriginalTitles.add(normalizedTitleKey);
      existingSinhalaTitles.add(fullArticle.sinhalaTitle.trim().toLowerCase());

      // Target batch limit from Auto-Pilot config (default: 2)
      const maxBatch = autoPilotConfig.maxArticlesPerRun || 2;
      if (uploadedCount >= maxBatch) {
        console.log(`\nTarget batch (${maxBatch} long articles) uploaded successfully.`);
        break;
      }

      await new Promise((res) => setTimeout(res, 4000));
    }

    console.log(`\n=== Finished run. Total Long Sinhala Articles uploaded: ${uploadedCount} ===`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during auto upload:', err);
    process.exit(1);
  }
}

runAutoNewsUpload();

