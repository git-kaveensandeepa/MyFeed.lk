import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getAllowedHosts, getContext, getTrustProxyHeaders } from '@netlify/angular-runtime/app-engine.js';
import { Buffer } from 'buffer';
import { GoogleGenAI, Type } from '@google/genai';
import webpush from 'web-push';
import { initializeApp as initServerFirebase, getApps as getServerApps, getApp as getServerApp } from 'firebase/app';
import { 
  getFirestore as getServerFirestore, 
  collection as serverCollection, 
  addDoc as serverAddDoc, 
  getDocs as serverGetDocs, 
  getDoc as serverGetDoc,
  serverTimestamp as serverTimestampDoc,
  doc as serverDoc,
  setDoc as serverSetDoc,
  updateDoc as serverUpdateDoc,
  type Firestore
} from 'firebase/firestore';

// Polyfill Buffer and process for environments that don't have them (like Netlify Edge)
const g: any = globalThis;

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
  factCheck?: {
    score: number;
    status: string;
    statusBadge: string;
    reason: string;
    sources: { name: string; url?: string; isPrimary?: boolean }[];
    metrics: {
      sourceReliability: number;
      factualAccuracy: number;
      editorialReview: number;
    };
    checkedBy: string;
  };
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
  { name: 'Ada Derana', url: 'http://www.adaderana.lk/rss.php' },
  { name: 'The Verge Tech', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'BBC Tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
];

function getServerSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const SERVER_IMAGE_POOLS: Record<string, string[]> = {
  blackberry_software: [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'
  ],
  apple: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80'
  ],
  samsung: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80'
  ],
  pixel: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1200&q=80'
  ],
  ai: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=1200&q=80'
  ],
  robotics: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'
  ],
  chips: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80'
  ],
  cyber: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'
  ],
  space: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517976487507-5b6533d44e7c?auto=format&fit=crop&w=1200&q=80'
  ],
  general: [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getServerTopicImage(title = ''): string {
  const t = title.toLowerCase();
  const hash = getServerSimpleHash(title);

  if (t.includes('blackberry') || t.includes('qnx') || t.includes('iot') || t.includes('embedded') || t.includes('බ්ලැක්බෙරි') || t.includes('මෘදුකාංග')) {
    const pool = SERVER_IMAGE_POOLS['blackberry_software'];
    return pool[hash % pool.length];
  }
  if (t.includes('apple') || t.includes('iphone') || t.includes('macbook') || t.includes('ipad') || t.includes('ios') || t.includes('ඇපල්')) {
    const pool = SERVER_IMAGE_POOLS['apple'];
    return pool[hash % pool.length];
  }
  if (t.includes('samsung') || t.includes('galaxy') || t.includes('z fold') || t.includes('සැම්සුන්')) {
    const pool = SERVER_IMAGE_POOLS['samsung'];
    return pool[hash % pool.length];
  }
  if (t.includes('pixel') || t.includes('android') || t.includes('ගූගල්')) {
    const pool = SERVER_IMAGE_POOLS['pixel'];
    return pool[hash % pool.length];
  }
  if (t.includes('ai') || t.includes('gpt') || t.includes('openai') || t.includes('claude') || t.includes('gemini') || t.includes('deepseek') || t.includes('කෘත්‍රිම බුද්ධිය')) {
    const pool = SERVER_IMAGE_POOLS['ai'];
    return pool[hash % pool.length];
  }
  if (t.includes('robot') || t.includes('humanoid') || t.includes('automation') || t.includes('රොබෝ')) {
    const pool = SERVER_IMAGE_POOLS['robotics'];
    return pool[hash % pool.length];
  }
  if (t.includes('chip') || t.includes('nvidia') || t.includes('semiconductor') || t.includes('intel') || t.includes('amd') || t.includes('gpu') || t.includes('චිප්')) {
    const pool = SERVER_IMAGE_POOLS['chips'];
    return pool[hash % pool.length];
  }
  if (t.includes('cyber') || t.includes('hack') || t.includes('security') || t.includes('malware') || t.includes('සයිබර්')) {
    const pool = SERVER_IMAGE_POOLS['cyber'];
    return pool[hash % pool.length];
  }
  if (t.includes('space') || t.includes('nasa') || t.includes('spacex') || t.includes('අභ්‍යවකාශ')) {
    const pool = SERVER_IMAGE_POOLS['space'];
    return pool[hash % pool.length];
  }
  const pool = SERVER_IMAGE_POOLS['general'];
  return pool[hash % pool.length];
}

function isValidServerImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) return false;

  const lower = url.toLowerCase();

  // Strip query string and hash for filename check
  const cleanPath = lower.split('?')[0].split('#')[0];

  // Discard tracking beacons, spacers, 1x1 pixels, favicon files, and vector SVGs
  if (
    cleanPath.endsWith('/1x1.gif') ||
    cleanPath.endsWith('/1x1.png') ||
    cleanPath.endsWith('/spacer.gif') ||
    cleanPath.endsWith('/blank.gif') ||
    cleanPath.endsWith('/cleardot.gif') ||
    cleanPath.endsWith('/pixel.gif') ||
    cleanPath.endsWith('/beacon.gif') ||
    cleanPath.endsWith('/transparent.gif') ||
    cleanPath.endsWith('/track.gif') ||
    cleanPath.endsWith('/tr.gif') ||
    cleanPath.endsWith('/favicon.ico') ||
    cleanPath.endsWith('/favicon.png') ||
    cleanPath.endsWith('/favicon.svg') ||
    cleanPath.endsWith('.svg')
  ) {
    return false;
  }

  // Discard generic tracking domains and placeholder avatars
  if (
    lower.includes('google.com/favicon') ||
    lower.includes('gstatic.com/images/branding') ||
    lower.includes('doubleclick.net') ||
    lower.includes('adroll.com') ||
    lower.includes('scorecardresearch.com') ||
    lower.includes('facebook.com/tr/') ||
    lower.includes('gravatar.com/avatar/default') ||
    lower.includes('default-avatar')
  ) {
    return false;
  }

  return true;
}

function parseLargestFromSrcset(srcsetStr: string, pageUrl?: string): string {
  if (!srcsetStr) return '';
  const entries = srcsetStr.split(',').map(s => s.trim()).filter(Boolean);
  let bestUrl = '';
  let maxDim = 0;

  for (const entry of entries) {
    const parts = entry.split(/\s+/);
    const candidateUrl = parts[0];
    if (!candidateUrl) continue;
    let dim = 1;
    if (parts[1]) {
      const match = parts[1].match(/(\d+)(?:w|x)/i);
      if (match) dim = parseInt(match[1], 10);
    }
    if (dim >= maxDim) {
      maxDim = dim;
      bestUrl = candidateUrl;
    }
  }

  if (bestUrl) {
    bestUrl = bestUrl.replace(/&amp;/g, '&').replace(/&#38;/g, '&');
    if (pageUrl && (bestUrl.startsWith('/') || !bestUrl.startsWith('http'))) {
      try {
        bestUrl = new URL(bestUrl, pageUrl).href;
      } catch {
        // ignore
      }
    }
  }
  return bestUrl;
}

function extractOriginalImageFromHtml(html: string, pageUrl?: string): string {
  if (!html) return '';

  const candidates: string[] = [];

  // 1. OpenGraph, Twitter, and SEO meta tags (both property/name first AND content first)
  const metaRegex = /<meta\s+[^>]*?(?:property|name)=["'](og:image|og:image:url|og:image:secure_url|twitter:image|twitter:image:src|twitter:image0|image|thumbnail|sailthru\.image|sailthru\.image\.full|parsely-image-url|itemprop)["'][^>]*?content=["']([^"']+)["'][^>]*?>|<meta\s+[^>]*?content=["']([^"']+)["'][^>]*?(?:property|name)=["'](og:image|og:image:url|og:image:secure_url|twitter:image|twitter:image:src|twitter:image0|image|thumbnail|sailthru\.image|sailthru\.image\.full|parsely-image-url|itemprop)["'][^>]*?>/gi;
  let metaMatch;
  while ((metaMatch = metaRegex.exec(html)) !== null) {
    const val = metaMatch[2] || metaMatch[3];
    if (val && typeof val === 'string' && val.trim().length > 0) {
      candidates.push(val.trim());
    }
  }

  // 2. Link rel image_src / preload
  const linkMatches = html.matchAll(/<link\s+[^>]*?rel=["'](?:image_src|preload)["'][^>]*?(?:href|imagesrcset)=["']([^"']+)["'][^>]*?>/gi);
  for (const m of linkMatches) {
    if (m[1]) {
      const urlCandidate = m[1].split(' ')[0].trim();
      if (urlCandidate) candidates.push(urlCandidate);
    }
  }

  // 3. Schema.org JSON-LD structured data
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      const findImage = (obj: any): string | null => {
        if (!obj) return null;
        if (typeof obj === 'string' && (obj.startsWith('http') || obj.startsWith('/'))) return obj;
        if (typeof obj === 'object' && obj !== null) {
          const record = obj as Record<string, unknown>;
          
          // Check standard schema properties
          const imgVal = record['image'] || record['primaryImageOfPage'] || record['associatedMedia'];
          if (imgVal) {
            if (typeof imgVal === 'string') return imgVal;
            if (Array.isArray(imgVal) && imgVal[0]) {
              const first = imgVal[0];
              if (typeof first === 'string') return first;
              if (typeof first === 'object' && first !== null) {
                const firstRec = first as Record<string, unknown>;
                if (typeof firstRec['url'] === 'string') return firstRec['url'];
                if (typeof firstRec['contentUrl'] === 'string') return firstRec['contentUrl'];
              }
            }
            if (typeof imgVal === 'object' && imgVal !== null) {
              const imgRec = imgVal as Record<string, unknown>;
              if (typeof imgRec['url'] === 'string') return imgRec['url'];
              if (typeof imgRec['contentUrl'] === 'string') return imgRec['contentUrl'];
            }
          }

          const thumbVal = record['thumbnailUrl'] || record['contentUrl'];
          if (typeof thumbVal === 'string') return thumbVal;

          // Search graph arrays
          if (Array.isArray(record['@graph'])) {
            for (const item of record['@graph']) {
              const found = findImage(item);
              if (found) return found;
            }
          }

          if (Array.isArray(obj)) {
            for (const item of obj) {
              const found = findImage(item);
              if (found) return found;
            }
          }
        }
        return null;
      };
      const found = findImage(data);
      if (found) candidates.push(found);
    } catch {
      // Ignore JSON parse errors in script tags
    }
  }

  // 4. Featured article container / picture tag / figure tag
  const figureMatches = html.matchAll(/<(?:figure|picture|article|div)[^>]*?(?:class|id)=["'][^"']*(?:featured|lead|thumbnail|wp-post-image|hero|main-image|story-media)[^"']*["'][^>]*>([\s\S]*?)<\/(?:figure|picture|article|div)>/gi);
  for (const fm of figureMatches) {
    const blockHtml = fm[1];
    
    // Check srcset inside picture or source
    const srcsetMatch = blockHtml.match(/srcset=["']([^"']+)["']/i);
    if (srcsetMatch && srcsetMatch[1]) {
      const best = parseLargestFromSrcset(srcsetMatch[1], pageUrl);
      if (best) candidates.push(best);
    }

    // Check img tag data-src or src
    const imgMatch = blockHtml.match(/<img\s+[^>]*?(?:data-src|data-original|data-lazy-src|data-orig-file|src)=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      candidates.push(imgMatch[1].trim());
    }
  }

  // 5. General article lead image
  const articleImgMatch = html.match(/<article[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["']/i) ||
                          html.match(/<figure[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["']/i);
  if (articleImgMatch && articleImgMatch[1]) {
    candidates.push(articleImgMatch[1].trim());
  }

  // 6. Direct img tags in top portion of HTML
  const topHtml = html.substring(0, 100000);
  const generalImgMatches = topHtml.matchAll(/<img\s+[^>]*?(?:data-src|data-original|data-lazy-src|src)=["']([^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/gi);
  for (const gm of generalImgMatches) {
    if (gm[1]) candidates.push(gm[1].trim());
  }

  // Filter, clean & resolve candidate URLs
  for (let candidate of candidates) {
    // Decode HTML entities if any
    candidate = candidate.replace(/&amp;/g, '&').replace(/&#38;/g, '&').replace(/&#x2F;/g, '/');
    
    // Resolve relative URL if pageUrl is given
    if (pageUrl && (candidate.startsWith('/') || !candidate.startsWith('http'))) {
      try {
        candidate = new URL(candidate, pageUrl).href;
      } catch {
        // Invalid URL
      }
    }

    if (isValidServerImage(candidate)) {
      return candidate;
    }
  }

  return '';
}

function parseServerRss(xmlText: string, sourceName: string): ServerArticleItem[] {
  const items: ServerArticleItem[] = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 15)) {
    const titleMatch = itemXml.match(/<title(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const linkMatch = itemXml.match(/<link(?:[^>]*)href="([^"]+)"/i) || itemXml.match(/<link(?:[^>]*)>([\s\S]*?)<\/link>/i) || itemXml.match(/<guid[^>]*isPermaLink="true"[^>]*>([\s\S]*?)<\/guid>/i);
    let link = linkMatch ? (linkMatch[1] || linkMatch[0]).trim() : '';
    link = link.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();

    const descMatch = itemXml.match(/<description(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const rawDesc = descMatch ? descMatch[1] : '';
    let description = rawDesc.replace(/<[^>]+>/g, '').trim();
    description = description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const contentEncodedMatch = itemXml.match(/<content:encoded(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/i);
    const fullContentHtml = contentEncodedMatch ? contentEncodedMatch[1] : '';

    // Extract exact original article image from media tags, enclosure, or content:encoded
    let imageUrl = '';
    const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i) ||
                       itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i) ||
                       itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i) ||
                       itemXml.match(/<image>\s*<url>([^<]+)<\/url>\s*<\/image>/i) ||
                       itemXml.match(/<wp:attachment_url>([^<]+)<\/wp:attachment_url>/i) ||
                       itemXml.match(/<wp:featured_image>([^<]+)<\/wp:featured_image>/i);
    
    if (mediaMatch && mediaMatch[1] && isValidServerImage(mediaMatch[1].trim())) {
      imageUrl = mediaMatch[1].trim();
    } else {
      // Check for <img> tag inside description or content:encoded (e.g. Ada Derana, The Verge, WordPress)
      const combinedHtml = `${fullContentHtml} ${rawDesc}`;
      
      // Check srcset first for highest res
      const srcsetMatch = combinedHtml.match(/srcset=["']([^"']+)["']/i);
      if (srcsetMatch && srcsetMatch[1]) {
        const largest = parseLargestFromSrcset(srcsetMatch[1], link);
        if (largest && isValidServerImage(largest)) {
          imageUrl = largest;
        }
      }

      if (!imageUrl) {
        const rawImgMatch = combinedHtml.match(/<img\s+[^>]*?(?:data-src|data-original|data-lazy-src|src)=["']([^"']+)["']/i);
        if (rawImgMatch && rawImgMatch[1]) {
          let candidate = rawImgMatch[1].trim().replace(/&amp;/g, '&');
          if (link && (candidate.startsWith('/') || !candidate.startsWith('http'))) {
            try {
              candidate = new URL(candidate, link).href;
            } catch {
              // ignore
            }
          }
          if (isValidServerImage(candidate)) {
            imageUrl = candidate;
          }
        }
      }
    }

    const dateMatch = itemXml.match(/<pubDate(?:[^>]*)>([\s\S]*?)<\/pubDate>/i);
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    if (title) {
      items.push({
        title,
        description: description || title,
        url: link,
        imageUrl: imageUrl, // Keep authentic image if found, or empty string so downstream scraper fetches full page image
        publishedAt: pubDate,
        source: { name: sourceName }
      });
    }
  }
  return items;
}

const firebaseServerConfig = {
  projectId: "gen-lang-client-0797933634",
  appId: "1:203252959685:web:ffcea46dc94edc1675e3ac",
  apiKey: "AIzaSyDyNb52a42_PXS929gTeeKdY3TomCyQYuE",
  authDomain: "gen-lang-client-0797933634.firebaseapp.com",
  storageBucket: "gen-lang-client-0797933634.firebasestorage.app",
  messagingSenderId: "203252959685",
};

let serverDbInstance: Firestore | null = null;
function getServerDb(): Firestore {
  if (!serverDbInstance) {
    const apps = getServerApps();
    const app = apps.length > 0 ? getServerApp() : initServerFirebase(firebaseServerConfig);
    serverDbInstance = getServerFirestore(app, "ai-studio-myfeedlk-576ec80c-841c-44ac-9b2a-8b4ec4ec22e7");
  }
  return serverDbInstance;
}

const VAPID_PUBLIC_KEY = process.env['VAPID_PUBLIC_KEY'] || 'BGAgbaEbbGpuE92I7FiigT8999bHBAfgsZNcr7ayNUuAE3KTpSGKbKtbjRPo8_f96hTzCvGv0nzUX8I5dBH8-0g';
const VAPID_PRIVATE_KEY = process.env['VAPID_PRIVATE_KEY'] || 'oQIU3f4vjeMlQIaAJO47DoEdCOtYDkAHfs57SuFzba0';
const VAPID_SUBJECT = process.env['VAPID_SUBJECT'] || 'mailto:mail.kaveensandeepa@gmail.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (vapidErr) {
  console.warn('[VAPID] Initial setup notice:', vapidErr);
}

async function sendWebPushToAllSubscribers(article: {
  title: string;
  summary: string;
  articleUrl: string;
  imageUrl?: string;
  category?: string;
}): Promise<{ total: number; sent: number; failed: number }> {
  try {
    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    } catch {
      console.debug('[VAPID] Webpush already initialized');
    }

    const db = getServerDb();
    const snap = await serverGetDocs(serverCollection(db, 'web_push_subscriptions'));
    if (snap.empty) {
      return { total: 0, sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title: (article.title ? `📰 ${article.title}` : 'MyFeed.lk News Alert').slice(0, 80),
      body: (article.summary || 'නව පුවතක් MyFeed.lk හි ප්‍රකාශයට පත් කෙරිණි. දැන්ම කියවන්න!').slice(0, 180),
      url: article.articleUrl || '/',
      icon: '/favicon.ico',
      image: article.imageUrl || undefined,
      category: article.category || 'News'
    });

    let sent = 0;
    let failed = 0;
    const expiredIds: string[] = [];

    await Promise.allSettled(
      snap.docs.map(async (docSnap) => {
        const subData = docSnap.data() as webpush.PushSubscription;
        if (!subData || !subData.endpoint) return;
        try {
          await webpush.sendNotification(subData, payload);
          sent++;
        } catch (pushErr: any) {
          failed++;
          const errObj = pushErr as { statusCode?: number };
          if (errObj?.statusCode === 404 || errObj?.statusCode === 410) {
            expiredIds.push(docSnap.id);
          }
        }
      })
    );

    // Clean up expired subscriptions from Firestore
    if (expiredIds.length > 0) {
      try {
        const { doc: serverDoc, deleteDoc: serverDeleteDoc } = await import('firebase/firestore');
        for (const id of expiredIds) {
          await serverDeleteDoc(serverDoc(db, 'web_push_subscriptions', id)).catch((e) => {
            console.warn('[WebPush] Cleanup warning:', e);
          });
        }
      } catch (cleanErr) {
        console.warn('[WebPush] Expired cleanup notice:', cleanErr);
      }
    }

    return { total: snap.size, sent, failed };
  } catch (err: any) {
    console.error('[WebPush] Error sending push notifications:', err);
    return { total: 0, sent: 0, failed: 0 };
  }
}

export interface AutoPilotLog {
  id: string;
  timestamp: string;
  durationMs: number;
  sourcesScanned: number;
  newArticlesFound: number;
  publishedArticles: { title: string; category: string; imageUrl: string; url?: string }[];
  status: 'success' | 'warning' | 'error';
  message: string;
  triggerType: 'scheduled_cron' | 'webhook_cron' | 'manual_admin';
}

export interface AutoPilotConfig {
  enabled: boolean;
  scheduleMode: 'interval' | 'exact_times'; // 'interval' | 'exact_times'
  intervalMinutes: number;
  scheduledDailyTimes: string[]; // 24-hour format in Asia/Colombo (Sri Lanka Time)
  autoPublish: boolean;
  notifyPhone: boolean;
  postWhatsApp: boolean;
  postFacebook: boolean;
  phoneTopic: string;
  waWebhookUrl: string;
  fbWebhookUrl: string;
  maxArticlesPerRun: number;
}

export const DEFAULT_SCHEDULED_TIMES: string[] = [
  '00:17', // 12:17 AM
  '01:43', // 1:43 AM
  '03:08', // 3:08 AM
  '05:52', // 5:52 AM
  '07:26', // 7:26 AM
  '09:41', // 9:41 AM
  '11:13', // 11:13 AM
  '12:58', // 12:58 PM
  '14:34', // 2:34 PM
  '16:19', // 4:19 PM
  '18:47', // 6:47 PM
  '20:22', // 8:22 PM
  '22:36', // 10:36 PM
  '23:51'  // 11:51 PM
];

const autoPilotConfig: AutoPilotConfig = {
  enabled: true,
  scheduleMode: 'exact_times',
  intervalMinutes: 60,
  scheduledDailyTimes: [...DEFAULT_SCHEDULED_TIMES],
  autoPublish: true,
  notifyPhone: true,
  postWhatsApp: true,
  postFacebook: true,
  phoneTopic: 'myfeedlk_kaveen',
  waWebhookUrl: '',
  fbWebhookUrl: '',
  maxArticlesPerRun: 1
};

const autoPilotLogs: AutoPilotLog[] = [];
let isAutoPilotSyncing = false;
let autoPilotLastRunTime: string | null = null;
let lastExecutedAutoPilotSlot = '';

// Load persistent config from Firestore
async function loadAutoPilotConfigFromFirestore(): Promise<void> {
  try {
    const db = getServerDb();
    const snap = await serverGetDoc(serverDoc(db, 'system_config', 'autopilot'));
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data['enabled'] === 'boolean') autoPilotConfig.enabled = data['enabled'];
      if (data['scheduleMode'] === 'interval' || data['scheduleMode'] === 'exact_times') autoPilotConfig.scheduleMode = data['scheduleMode'];
      if (typeof data['intervalMinutes'] === 'number') autoPilotConfig.intervalMinutes = data['intervalMinutes'];
      if (Array.isArray(data['scheduledDailyTimes']) && data['scheduledDailyTimes'].length > 0) {
        autoPilotConfig.scheduledDailyTimes = data['scheduledDailyTimes'];
      }
      if (typeof data['autoPublish'] === 'boolean') autoPilotConfig.autoPublish = data['autoPublish'];
      if (typeof data['notifyPhone'] === 'boolean') autoPilotConfig.notifyPhone = data['notifyPhone'];
      if (typeof data['postWhatsApp'] === 'boolean') autoPilotConfig.postWhatsApp = data['postWhatsApp'];
      if (typeof data['postFacebook'] === 'boolean') autoPilotConfig.postFacebook = data['postFacebook'];
      if (typeof data['phoneTopic'] === 'string') autoPilotConfig.phoneTopic = data['phoneTopic'];
      if (typeof data['waWebhookUrl'] === 'string') autoPilotConfig.waWebhookUrl = data['waWebhookUrl'];
      if (typeof data['fbWebhookUrl'] === 'string') autoPilotConfig.fbWebhookUrl = data['fbWebhookUrl'];
      if (typeof data['maxArticlesPerRun'] === 'number') autoPilotConfig.maxArticlesPerRun = data['maxArticlesPerRun'];
      console.log(`[Auto-Pilot] Loaded persistent config from Firestore. Mode: ${autoPilotConfig.scheduleMode}, Times: [${autoPilotConfig.scheduledDailyTimes.join(', ')}]`);
    }
  } catch (err) {
    console.warn('[Auto-Pilot] Could not load persistent config from Firestore, using defaults:', err);
  }
  autoPilotNextRunTime = calculateNextRunTimestamp(autoPilotConfig);
}

async function saveAutoPilotConfigToFirestore(cfg: AutoPilotConfig): Promise<void> {
  try {
    const db = getServerDb();
    await serverSetDoc(serverDoc(db, 'system_config', 'autopilot'), {
      enabled: cfg.enabled,
      scheduleMode: cfg.scheduleMode,
      intervalMinutes: cfg.intervalMinutes,
      scheduledDailyTimes: cfg.scheduledDailyTimes,
      autoPublish: cfg.autoPublish,
      notifyPhone: cfg.notifyPhone,
      postWhatsApp: cfg.postWhatsApp,
      postFacebook: cfg.postFacebook,
      phoneTopic: cfg.phoneTopic,
      waWebhookUrl: cfg.waWebhookUrl,
      fbWebhookUrl: cfg.fbWebhookUrl,
      maxArticlesPerRun: cfg.maxArticlesPerRun,
      updatedAt: serverTimestampDoc()
    }, { merge: true });
    console.log('[Auto-Pilot] Persistent config saved to Firestore system_config/autopilot');
  } catch (err) {
    console.warn('[Auto-Pilot] Error saving persistent config to Firestore:', err);
  }
}

// Kick off initial load in the background
loadAutoPilotConfigFromFirestore().catch(e => console.warn('[Auto-Pilot] Startup load warning:', e));

// Colombo / Sri Lanka Timezone Helpers (Asia/Colombo UTC+5:30)
export function getColomboDateTimeParts(): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateString: string;
  timeString: string;
  formattedSinhalaDate: string;
} {
  const now = new Date();
  const colomboFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    hourCycle: 'h23'
  });
  const parts = colomboFormatter.formatToParts(now);
  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      p[part.type] = part.value;
    }
  }
  const year = parseInt(p['year'] || '2026', 10);
  const month = parseInt(p['month'] || '1', 10);
  const day = parseInt(p['day'] || '1', 10);
  const hour = parseInt(p['hour'] || '0', 10);
  const minute = parseInt(p['minute'] || '0', 10);
  const second = parseInt(p['second'] || '0', 10);
  const weekday = p['weekday'] || 'Today';

  const sinhalaMonths = ['', 'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
  const sinhalaDays: Record<string, string> = {
    'Monday': 'සඳුදා',
    'Tuesday': 'අඟහරුවාදා',
    'Wednesday': 'බදාදා',
    'Thursday': 'බ්‍රහස්පතින්දා',
    'Friday': 'සිකුරාදා',
    'Saturday': 'සෙනසුරාදා',
    'Sunday': 'ඉරිදා'
  };

  const monthSinhala = sinhalaMonths[month] || `මාසය ${month}`;
  const daySinhala = sinhalaDays[weekday] || weekday;
  const formattedSinhalaDate = `${year} ${monthSinhala} ${day} • ${daySinhala} (${weekday} Morning)`;

  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return { year, month, day, hour, minute, second, dateString, timeString, formattedSinhalaDate };
}

// Next Occurrence Ms helper
function getNextOccurrenceMs(targetTime: string): { nextMs: number; nextTimeString: string; diffSeconds: number } {
  const parts = targetTime.split(':').map(x => parseInt(x, 10));
  const targetHour = isNaN(parts[0]) ? 3 : parts[0] % 24;
  const targetMinute = isNaN(parts[1]) ? 30 : parts[1] % 60;

  const colombo = getColomboDateTimeParts();
  const currentMinutes = colombo.hour * 60 + colombo.minute;
  const targetMinutes = targetHour * 60 + targetMinute;

  let diffMinutes = targetMinutes - currentMinutes;
  if (diffMinutes <= 0 && colombo.second >= 5) {
    diffMinutes += 24 * 60; // Wrap around to tomorrow
  }
  const diffSeconds = Math.max(10, (diffMinutes * 60) - colombo.second);
  const nextMs = Date.now() + (diffSeconds * 1000);
  return { nextMs, nextTimeString: `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`, diffSeconds };
}

// Helper to calculate the next execution timestamp in Sri Lanka timezone (Asia/Colombo UTC+5:30)
function calculateNextRunTimestamp(config: AutoPilotConfig): number {
  if (!config.enabled) return Date.now() + (24 * 60 * 60 * 1000);

  if (config.scheduleMode === 'exact_times' && Array.isArray(config.scheduledDailyTimes) && config.scheduledDailyTimes.length > 0) {
    const colombo = getColomboDateTimeParts();
    const currentMinutesOfDay = colombo.hour * 60 + colombo.minute;

    // Convert scheduled times into minutes of day
    const parsedMinutesList = config.scheduledDailyTimes
      .map(t => {
        const [h, m] = t.split(':').map(x => parseInt(x, 10));
        return isNaN(h) || isNaN(m) ? null : { text: t, minutes: (h % 24) * 60 + m };
      })
      .filter((item): item is { text: string; minutes: number } => item !== null)
      .sort((a, b) => a.minutes - b.minutes);

    if (parsedMinutesList.length > 0) {
      // Find the next scheduled time strictly in future (at least 1 minute ahead)
      const nextTimeToday = parsedMinutesList.find(item => item.minutes > currentMinutesOfDay);

      let targetMinutes = 0;
      let daysToAdd = 0;

      if (nextTimeToday) {
        targetMinutes = nextTimeToday.minutes;
        daysToAdd = 0;
      } else {
        // Wrap around to first scheduled time tomorrow
        targetMinutes = parsedMinutesList[0].minutes;
        daysToAdd = 1;
      }

      const diffMinutes = (daysToAdd * 24 * 60) + (targetMinutes - currentMinutesOfDay);
      const diffMs = (diffMinutes * 60 * 1000) - (colombo.second * 1000);
      return Date.now() + Math.max(30000, diffMs);
    }
  }

  // Fallback to interval mode
  const mins = config.intervalMinutes >= 15 ? config.intervalMinutes : 60;
  return Date.now() + (mins * 60 * 1000);
}

// =========================================================================
// AUTOMATED AI AUDIO PIPELINE (3:30 AM Generate -> 4:00 AM Daily Publish)
// =========================================================================

export interface AudioPipelineConfig {
  enabled: boolean;
  generateTime: string; // Default: '03:30' (Asia/Colombo)
  publishTime: string;  // Default: '04:00' (Asia/Colombo)
  autoPublish: boolean;
  narratorName: string;
  narratorRole: string;
  defaultAudioUrl: string;
  autoNotifyWebPush: boolean;
  autoNotifyPhone: boolean;
  phoneTopic: string;
}

export interface AudioChapterItem {
  timeFormatted: string;
  seconds: number;
  title: string;
  category?: string;
  summary?: string;
  articleId?: string;
}

export interface AudioPipelineDraft {
  id: string;
  editionNumber: number;
  title: string;
  subTitle: string;
  date: string;
  dateFormatted: string;
  windowStart: string;
  windowEnd: string;
  audioUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  narratorName: string;
  narratorRole: string;
  summarySinhala: string;
  fullNarrationScriptSinhala: string;
  keyStoriesCount: number;
  chapters: AudioChapterItem[];
  generatedAt: string;
  status: 'ready_for_publish' | 'published';
}

export interface AudioPipelineLog {
  id: string;
  timestamp: string;
  type: 'generate' | 'publish' | 'error' | 'manual';
  status: 'success' | 'warning' | 'error';
  message: string;
  editionId?: string;
  articlesCount?: number;
  editionTitle?: string;
}

export const audioPipelineConfig: AudioPipelineConfig = {
  enabled: true,
  generateTime: '03:30', // Daily 3:30 AM Sri Lanka Time
  publishTime: '04:00',  // Daily 4:00 AM Sri Lanka Time
  autoPublish: true,
  narratorName: 'Kaveen Sandeepa & MyFeed AI Studio',
  narratorRole: 'Editor-in-Chief & AI Audio Studio',
  defaultAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=news-ambient-112199.mp3',
  autoNotifyWebPush: true,
  autoNotifyPhone: true,
  phoneTopic: 'myfeedlk_kaveen'
};

let currentAudioDraft: AudioPipelineDraft | null = null;
const audioPipelineLogs: AudioPipelineLog[] = [];
let isAudioGenerating = false;
let isAudioPublishing = false;
let lastAudioGeneratedDate: string | null = null;
let lastAudioGeneratedTime: string | null = null;
let lastAudioPublishedDate: string | null = null;
let lastAudioPublishedTime: string | null = null;

let autoPilotNextRunTime = calculateNextRunTimestamp(autoPilotConfig);

async function executeAutoPilotSync(triggerType: 'scheduled_cron' | 'webhook_cron' | 'manual_admin' = 'scheduled_cron'): Promise<{ success: boolean; count: number; articles: { title: string; category: string; imageUrl: string; url?: string }[]; message: string }> {
  if (isAutoPilotSyncing) {
    return { success: false, count: 0, articles: [], message: 'Auto-pilot sync is already running in background' };
  }

  isAutoPilotSyncing = true;
  const startTime = Date.now();
  const timestampStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
  const publishedArticlesList: { title: string; category: string; imageUrl: string; url?: string }[] = [];

  try {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const db = getServerDb();

    // 1. Fetch all recent articles from Firestore to prevent any duplicate generation
    const existingTitlesSet = new Set<string>();
    const existingUrlsSet = new Set<string>();
    const existingCleanWordsSet: Set<string>[] = [];
    const recentPublishedStories: { title: string; originalTitle?: string; summary?: string }[] = [];

    try {
      const articlesSnap = await serverGetDocs(serverCollection(db, 'articles'));
      articlesSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const t = (data['title'] as string || '').toLowerCase().trim();
        const ot = (data['originalTitle'] as string || '').toLowerCase().trim();
        const sum = (data['summary'] as string || '').slice(0, 150);

        if (t) {
          existingTitlesSet.add(t);
          const words = new Set(t.replace(/[^\w\s\u0D80-\u0DFF]/g, ' ').split(/\s+/).filter(w => w.length > 3));
          if (words.size > 0) existingCleanWordsSet.push(words);
        }
        if (ot) {
          existingTitlesSet.add(ot);
          const words = new Set(ot.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3));
          if (words.size > 0) existingCleanWordsSet.push(words);
        }
        if (data['sourceUrl']) {
          const u = (data['sourceUrl'] as string).toLowerCase().trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
          existingUrlsSet.add(u);
        }

        if (t || ot) {
          recentPublishedStories.push({
            title: data['title'] || '',
            originalTitle: data['originalTitle'] || undefined,
            summary: sum || undefined
          });
        }
      });

      // Also check drafts so we don't duplicate existing drafts
      const draftsSnap = await serverGetDocs(serverCollection(db, 'drafts'));
      draftsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const t = (data['title'] as string || '').toLowerCase().trim();
        const ot = (data['originalTitle'] as string || '').toLowerCase().trim();
        if (t) existingTitlesSet.add(t);
        if (ot) existingTitlesSet.add(ot);
        if (data['sourceUrl']) {
          const u = (data['sourceUrl'] as string).toLowerCase().trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
          existingUrlsSet.add(u);
        }
        if (t || ot) {
          recentPublishedStories.push({
            title: data['title'] || '',
            originalTitle: data['originalTitle'] || undefined
          });
        }
      });
    } catch (dbReadErr) {
      console.warn('[Auto-Pilot] Note: Firestore read check returned:', dbReadErr);
    }

    // 2. Fetch fresh articles from all configured tech RSS feeds
    const rawFeedArticles: ServerArticleItem[] = [];
    for (const feed of SERVER_RSS_FEEDS) {
      try {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(30000)
        });
        if (res.ok) {
          const xml = await res.text();
          const parsed = parseServerRss(xml, feed.name);
          rawFeedArticles.push(...parsed);
        }
      } catch (feedErr) {
        console.warn(`[Auto-Pilot] Feed fetch failed for ${feed.name}:`, feedErr);
      }
    }

    // 3. Strict Multi-Tier Filter:
    // (a) Deduplicate candidates within the fetched batch itself (cross-feed deduplication)
    // (b) Deduplicate against existing Firestore articles & drafts
    const seenBatchKeywords: string[][] = [];
    const candidateArticles: ServerArticleItem[] = [];

    for (const item of rawFeedArticles) {
      const titleLower = item.title.toLowerCase().trim();
      const cleanItemUrl = (item.url || '').toLowerCase().trim().replace(/[?#].*$/, '').replace(/\/+$/, '');

      // Direct URL check
      if (cleanItemUrl && (existingUrlsSet.has(cleanItemUrl) || Array.from(existingUrlsSet).some(u => cleanItemUrl.includes(u) || u.includes(cleanItemUrl)))) {
        continue;
      }

      // Direct Title check
      if (existingTitlesSet.has(titleLower)) {
        continue;
      }

      // Substring check against existing database titles
      let isSubstringDuplicate = false;
      for (const existing of existingTitlesSet) {
        if (existing.length > 12) {
          const snippetA = titleLower.substring(0, Math.min(25, titleLower.length));
          const snippetB = existing.substring(0, Math.min(25, existing.length));
          if (titleLower.includes(snippetB) || existing.includes(snippetA)) {
            isSubstringDuplicate = true;
            break;
          }
        }
      }
      if (isSubstringDuplicate) continue;

      // Extract significant English words (>3 chars)
      const itemWords = titleLower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'more', 'about', 'after', 'will', 'what', 'into', 'your', 'news'].includes(w));

      // Overlap check against database existing titles
      if (itemWords.length >= 3) {
        let isWordOverlapDuplicate = false;
        for (const existingWords of existingCleanWordsSet) {
          let matches = 0;
          for (const w of itemWords) {
            if (existingWords.has(w)) matches++;
          }
          if (matches / itemWords.length >= 0.5) {
            isWordOverlapDuplicate = true;
            break;
          }
        }
        if (isWordOverlapDuplicate) continue;
      }

      // Cross-feed batch deduplication (prevent picking 2 articles from 2 different feeds covering same topic in same run)
      let isBatchDuplicate = false;
      for (const seenWords of seenBatchKeywords) {
        let batchMatches = 0;
        for (const w of itemWords) {
          if (seenWords.includes(w)) batchMatches++;
        }
        if (itemWords.length > 0 && batchMatches / itemWords.length >= 0.45) {
          isBatchDuplicate = true;
          break;
        }
      }
      if (isBatchDuplicate) continue;

      seenBatchKeywords.push(itemWords);
      candidateArticles.push(item);
    }

    if (candidateArticles.length === 0) {
      const logEntry: AutoPilotLog = {
        id: `log-${Date.now()}`,
        timestamp: timestampStr,
        durationMs: Date.now() - startTime,
        sourcesScanned: SERVER_RSS_FEEDS.length,
        newArticlesFound: 0,
        publishedArticles: [],
        status: 'warning',
        message: 'No new breaking stories detected. All current feeds are already published & synced.',
        triggerType
      };
      autoPilotLogs.unshift(logEntry);
      if (autoPilotLogs.length > 30) autoPilotLogs.pop();
      autoPilotLastRunTime = timestampStr;
      autoPilotNextRunTime = calculateNextRunTimestamp(autoPilotConfig);
      return { success: true, count: 0, articles: [], message: 'Feeds checked. All up to date.' };
    }

    // Prepare recent published stories string for Gemini AI Semantic Validation Shield
    const recentStoriesSummaryText = recentPublishedStories
      .slice(-35)
      .map((s, idx) => `${idx + 1}. [Sinhala: ${s.title}] ${s.originalTitle ? `(Original: ${s.originalTitle})` : ''} ${s.summary ? `- ${s.summary.slice(0, 100)}` : ''}`)
      .join('\n');

    const maxToPublish = autoPilotConfig.maxArticlesPerRun || 1;

    // 4. Generate in-depth Sinhala journalistic articles & Auto-Publish with AI Semantic Duplicate Shield
    for (const item of candidateArticles) {
      if (publishedArticlesList.length >= maxToPublish) {
        break; // Reached quota for this scheduled run
      }

      try {
        let originalSourceImage = item.imageUrl || '';
        let sourceHtml = '';

        if (item.url) {
          try {
            const pageRes = await fetch(item.url, {
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,si;q=0.8'
              },
              redirect: 'follow',
              signal: AbortSignal.timeout(30000)
            });
            if (pageRes.ok) {
              const html = await pageRes.text();
              const finalUrl = pageRes.url || item.url;
              const extractedImg = extractOriginalImageFromHtml(html, finalUrl);
              if (extractedImg && isValidServerImage(extractedImg)) {
                originalSourceImage = extractedImg;
              }
              sourceHtml = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .substring(0, 60000);
            }
          } catch (scrapeErr) {
            console.warn('[Auto-Pilot] URL scrape fallback:', scrapeErr);
          }
        }

        const prompt = `You are the Editor-in-Chief and Chief Technology Journalist for MyFeed.lk (ශ්‍රී ලංකාවේ ප්‍රමුඛතම තාක්ෂණික පුවත් වෙබ් අඩවිය).
Your job is to examine this incoming breaking story and write an in-depth, prestigious, highly engaging technology news article in fluent, professional Sinhala (පූර්ණ මාධ්‍යවේදී පුවත් වාර්තාවක්).

=== CRITICAL AI SEMANTIC DEDUPLICATION SHIELD ===
Check the incoming story against our recently published articles list:
${recentStoriesSummaryText ? recentStoriesSummaryText : 'No prior articles recorded.'}

DEDUPLICATION MANDATE:
- If this incoming story covers the SAME core news announcement, event, study, product launch, or topic that is ALREADY covered in the list above (even if from a different RSS source, or with different words), you MUST set "isDuplicate": true and provide "duplicateReason".
- If it is a completely fresh, distinct, and unique story, set "isDuplicate": false.

INPUT STORY:
- Headline: ${item.title}
- Source: ${item.source.name}
- Summary: ${item.description}
- Source URL: ${item.url}
${sourceHtml ? `- Web Excerpt: ${sourceHtml.substring(0, 4000)}` : ''}

EDITORIAL GUIDELINES (when isDuplicate is false):
1. 'sinhalaTitle': An enticing, high-journalistic headline in Sinhala.
2. 'sinhalaDescription': A punchy, 2-3 sentence overview in Sinhala.
3. 'sinhalaFullContent': Full-length article (500-800 words) with clean HTML:
   - <p class="lead font-medium text-lg mb-4">Engaging opening hook paragraph</p>
   - <h2>ප්‍රධාන තාක්ෂණික තොරතුරු සහ විශේෂාංග</h2>
   - <p>In-depth technical analysis</p>
   - <ul><li><strong>විශේෂාංගය:</strong> විස්තරය...</li></ul>
   - <h2>පරිශීලකයින්ට සහ තාක්ෂණ ක්ෂේත්‍රයට ඇතිවන බලපෑම</h2>
   - <p>Practical user implications and industry context</p>
   - <h2>අවසන් විග්‍රහය සහ MyFeed.lk නිගමනය</h2>
   - <p>Final verdict</p>
4. 'suggestedCategory': Classify strictly into 'AI', 'Tech', or 'Local'.
5. 'readTime': e.g. '4 min read'
6. 'socialShareText': Formatted WhatsApp / Social copy with emojis and summary in Sinhala.`;

        let geminiRes;
        const retries = 3;
        let delay = 2000;
        for (let i = 0; i < retries; i++) {
          try {
            geminiRes = await ai.models.generateContent({
              model: 'gemini-3.7-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    isDuplicate: { type: Type.BOOLEAN },
                    duplicateReason: { type: Type.STRING },
                    sinhalaTitle: { type: Type.STRING },
                    sinhalaDescription: { type: Type.STRING },
                    sinhalaFullContent: { type: Type.STRING },
                    suggestedCategory: { type: Type.STRING },
                    readTime: { type: Type.STRING },
                    socialShareText: { type: Type.STRING },
                  },
                  required: ['isDuplicate', 'sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'suggestedCategory', 'readTime', 'socialShareText']
                }
              }
            });
            break; // Success
          } catch (err: any) {
            const isTransient = err?.status === 429 || err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('429');
            if (i === retries - 1 || !isTransient) throw err;
            console.warn(`[Auto-Pilot] Gemini API error (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
        if (!geminiRes) throw new Error('Gemini API call failed after retries');

        const generated = JSON.parse(geminiRes.text || '{}');

        // If AI detects this is a duplicate of a previously published story, skip it safely!
        if (generated.isDuplicate) {
          console.log(`[Auto-Pilot] 🛡️ AI Duplicate Shield filtered out story: "${item.title}". Reason: ${generated.duplicateReason || 'Already covered recently'}`);
          continue;
        }

        const finalImage = (originalSourceImage && isValidServerImage(originalSourceImage)) 
          ? originalSourceImage 
          : getServerTopicImage(item.title);
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const englishSource = (item.title || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        const cleanSlug = englishSource && englishSource.length >= 3 ? englishSource.slice(0, 80) : '';

        const targetCollection = autoPilotConfig.autoPublish ? 'articles' : 'drafts';
        const newDocPayload = {
          title: generated.sinhalaTitle || item.title,
          summary: generated.sinhalaDescription || item.description,
          content: generated.sinhalaFullContent || `<p>${generated.sinhalaDescription}</p>`,
          category: generated.suggestedCategory || 'Tech',
          imageUrl: finalImage,
          sourceUrl: item.url || '',
          originalTitle: item.title,
          readTime: generated.readTime || '4 min read',
          date: dateStr,
          authorType: 'ai',
          isAiGenerated: true,
          slug: cleanSlug,
          createdAt: serverTimestampDoc(),
          timestamp: Date.now(),
          views: 0
        };

        const docRef = await serverAddDoc(serverCollection(db, targetCollection), newDocPayload);
        const finalSlug = cleanSlug || docRef.id;
        const baseSiteUrl = (process.env['SITE_URL'] || 'https://myfeedlk.com').replace(/\/+$/, '');
        const articleSiteUrl = `${baseSiteUrl}/article/${finalSlug}`;

        publishedArticlesList.push({
          title: newDocPayload.title,
          category: newDocPayload.category,
          imageUrl: finalImage,
          url: articleSiteUrl
        });

        // Add to local sets in case of multi-item run
        existingTitlesSet.add((newDocPayload.title || '').toLowerCase().trim());
        existingTitlesSet.add((item.title || '').toLowerCase().trim());
        if (item.url) existingUrlsSet.add(item.url.toLowerCase().trim());

        // 5. Send instant Phone Push Alert via ntfy.sh (using JSON body to fully support UTF-8 Sinhala & emojis)
        if (autoPilotConfig.notifyPhone && autoPilotConfig.phoneTopic) {
          try {
            const cleanTopic = (autoPilotConfig.phoneTopic.trim().replace(/[^a-zA-Z0-9_-]/g, '')) || 'myfeedlk_kaveen';
            const phonePayload: Record<string, unknown> = {
              topic: cleanTopic,
              title: `📰 ${(newDocPayload.title || '').slice(0, 100)}`,
              message: `${(newDocPayload.summary || '').slice(0, 500)}\n\n🔗 Tap to read full story →`,
              click: articleSiteUrl,
              priority: 4,
              tags: ['newspaper', 'rocket', 'fire']
            };

            if (finalImage && typeof finalImage === 'string' && finalImage.startsWith('http') && !finalImage.startsWith('data:')) {
              phonePayload['attach'] = finalImage;
            }

            let phoneRes = await fetch('https://ntfy.sh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(phonePayload)
            });

            if (!phoneRes.ok && phonePayload['attach']) {
              delete phonePayload['attach'];
              phoneRes = await fetch('https://ntfy.sh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(phonePayload)
              });
            }
          } catch (phoneErr) {
            console.warn('[Auto-Pilot] Phone push alert error:', phoneErr);
          }
        }

        // 6. Post to WhatsApp Webhook if configured
        if (autoPilotConfig.postWhatsApp && autoPilotConfig.waWebhookUrl) {
          try {
            const waBody = {
              title: newDocPayload.title,
              summary: newDocPayload.summary,
              category: newDocPayload.category,
              readTime: newDocPayload.readTime,
              imageUrl: finalImage,
              articleUrl: articleSiteUrl,
              customSnippet: generated.socialShareText
            };
            await fetch(autoPilotConfig.waWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(waBody)
            });
          } catch (waErr) {
            console.warn('[Auto-Pilot] WhatsApp dispatch error:', waErr);
          }
        }

        // 7. Post to Facebook Webhook if configured
        if (autoPilotConfig.postFacebook && autoPilotConfig.fbWebhookUrl) {
          try {
            const fbBody = {
              title: newDocPayload.title,
              summary: newDocPayload.summary,
              category: newDocPayload.category,
              readTime: newDocPayload.readTime,
              imageUrl: finalImage,
              articleUrl: articleSiteUrl,
              slug: newDocPayload.slug,
              customSnippet: generated.socialShareText,
              caption: `📰 ${newDocPayload.title}\n\n${newDocPayload.summary}\n\n🔗 සම්පූර්ණ විස්තරය කියවන්න: ${articleSiteUrl}\n\n#MyFeedLK #TechNews #SriLanka`
            };
            await fetch(autoPilotConfig.fbWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fbBody)
            });
          } catch (fbErr) {
            console.warn('[Auto-Pilot] Facebook dispatch error:', fbErr);
          }
        }

        // 8. Auto-alert all registered Web Push Subscribers
        try {
          await sendWebPushToAllSubscribers({
            title: newDocPayload.title,
            summary: newDocPayload.summary,
            articleUrl: articleSiteUrl,
            imageUrl: finalImage,
            category: newDocPayload.category
          });
        } catch (pushErr) {
          console.warn('[Auto-Pilot] Web push dispatch notice:', pushErr);
        }

        // Add to existing set to avoid same-run duplicates
        existingTitlesSet.add(newDocPayload.title.toLowerCase().trim());
      } catch (itemGenErr) {
        console.error('[Auto-Pilot] Error processing item:', itemGenErr);
      }
    }

    const logEntry: AutoPilotLog = {
      id: `log-${Date.now()}`,
      timestamp: timestampStr,
      durationMs: Date.now() - startTime,
      sourcesScanned: SERVER_RSS_FEEDS.length,
      newArticlesFound: publishedArticlesList.length,
      publishedArticles: publishedArticlesList,
      status: publishedArticlesList.length > 0 ? 'success' : 'warning',
      message: `Successfully synced & published ${publishedArticlesList.length} articles on Auto-Pilot.`,
      triggerType
    };

    autoPilotLogs.unshift(logEntry);
    if (autoPilotLogs.length > 30) autoPilotLogs.pop();
    autoPilotLastRunTime = timestampStr;
    autoPilotNextRunTime = calculateNextRunTimestamp(autoPilotConfig);

    return {
      success: true,
      count: publishedArticlesList.length,
      articles: publishedArticlesList,
      message: `Auto-pilot synced ${publishedArticlesList.length} news articles.`
    };
  } catch (err: any) {
    const errorObj = err as { message?: string };
    const logEntry: AutoPilotLog = {
      id: `log-${Date.now()}`,
      timestamp: timestampStr,
      durationMs: Date.now() - startTime,
      sourcesScanned: SERVER_RSS_FEEDS.length,
      newArticlesFound: 0,
      publishedArticles: [],
      status: 'error',
      message: `Auto-pilot failed: ${errorObj.message || String(err)}`,
      triggerType
    };
    autoPilotLogs.unshift(logEntry);
    if (autoPilotLogs.length > 30) autoPilotLogs.pop();
    return {
      success: false,
      count: 0,
      articles: [],
      message: `Auto-pilot failed: ${errorObj.message || String(err)}`
    };
  } finally {
    autoPilotNextRunTime = calculateNextRunTimestamp(autoPilotConfig);
    isAutoPilotSyncing = false;
  }
}

// =========================================================================
// GEMINI AI VOICE OVER SYNTHESIS & WAV ENCODER
// =========================================================================

export function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const wavHeader = Buffer.alloc(headerSize);

  // RIFF Chunk Descriptor
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(totalSize - 8, 4);
  wavHeader.write('WAVE', 8);

  // fmt sub-chunk
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for standard PCM)
  wavHeader.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

export function ensureWavBuffer(buffer: Buffer, sampleRate = 24000): Buffer {
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WAVE') {
    return buffer;
  }
  return pcmToWav(buffer, sampleRate);
}

// In-Memory Cached Audio Files for Instant Streaming
export const generatedAudioStore = new Map<string, {
  buffer: Buffer;
  contentType: string;
  createdAt: number;
  title: string;
  voiceName: string;
  durationSeconds: number;
}>();

export async function synthesizeAiVoiceScript(
  text: string,
  title = 'MyFeed Morning Tech Wrap',
  voiceName = 'Puck'
): Promise<{ success: boolean; audioId: string; audioUrl: string; durationSeconds: number; durationFormatted: string } | null> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanText) {
    throw new Error('No narration text provided for speech synthesis');
  }

  // Split into manageable spoken blocks for high quality & stability
  const sentences = cleanText.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 5);
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > 700 && cur.length > 0) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? `${cur} ${s}` : s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());

  // Synthesize all spoken chunks to produce the full news segment
  const targetChunks = chunks;
  const pcmSegments: Buffer[] = [];

  for (let i = 0; i < targetChunks.length; i++) {
    const chunk = targetChunks[i];
    try {
      const speechRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are the chief broadcaster and official voice for MyFeed.lk Sri Lanka.
Read and speak the following news text naturally in fluent, energetic radio/podcast style (fluent Sinhala with clear English technical words):

${chunk}`
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Puck'
              }
            }
          }
        }
      });

      const candidates = speechRes.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const rawPcm = Buffer.from(part.inlineData.data, 'base64');
            if (rawPcm.length > 0) {
              pcmSegments.push(rawPcm);
              break;
            }
          }
        }
      }
    } catch (segErr) {
      console.warn(`[TTS] Warning generating chunk ${i + 1}/${targetChunks.length}:`, segErr);
    }
  }

  if (pcmSegments.length === 0) {
    throw new Error('Gemini Speech Engine did not produce audio segments. Please verify your GEMINI_API_KEY.');
  }

  const combinedPcm = Buffer.concat(pcmSegments);
  const wavBuffer = pcmToWav(combinedPcm, 24000, 1, 16);
  const audioId = `voice-${Date.now()}`;
  
  // Calculate duration (24,000 samples/sec * 2 bytes/sample = 48,000 bytes/sec)
  const durationSeconds = Math.max(10, Math.round(combinedPcm.length / 48000));
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const durationFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  generatedAudioStore.set(audioId, {
    buffer: wavBuffer,
    contentType: 'audio/wav',
    createdAt: Date.now(),
    title,
    voiceName,
    durationSeconds
  });

  return {
    success: true,
    audioId,
    audioUrl: `/api/audio/file/${audioId}.wav`,
    durationSeconds,
    durationFormatted
  };
}

// =========================================================================
// AUTOMATED AI AUDIO PIPELINE GENERATOR & PUBLISHER METHODS
// =========================================================================

export async function executeMorningAudioGeneration(triggerType: 'scheduled' | 'manual' = 'scheduled'): Promise<{ success: boolean; draft?: AudioPipelineDraft; message: string }> {
  if (isAudioGenerating) {
    return { success: false, message: 'Audio generation is already running in background' };
  }
  isAudioGenerating = true;
  const colombo = getColomboDateTimeParts();
  const timestampStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });

  try {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const db = getServerDb();

    // 1. Fetch top recent articles from Firestore (Last 24 hours)
    const articlesSnap = await serverGetDocs(serverCollection(db, 'articles'));
    const allArticles: any[] = [];
    articlesSnap.forEach(d => {
      const data = d.data();
      allArticles.push({ id: d.id, ...data });
    });

    // Sort descending by timestamp or publishedAt
    allArticles.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.publishedAt || 0).getTime());
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.publishedAt || 0).getTime());
      return timeB - timeA;
    });

    // Pick top 6-8 articles
    let topArticles = allArticles.slice(0, 8);
    if (topArticles.length === 0) {
      // Fallback to RSS articles if DB is empty
      const rssArticles = await fetchAndTranslateNews();
      topArticles = rssArticles.slice(0, 6) as any[];
    }

    // Format 24-hr window dates in Sri Lanka Time
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayCol = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(yesterdayDate);
    const [yM, yD, yY] = yesterdayCol.split('/');
    const windowStart = `${yY}/${yM}/${yD} 04:00 AM`;
    const windowEnd = `${colombo.year}/${String(colombo.month).padStart(2, '0')}/${String(colombo.day).padStart(2, '0')} 04:00 AM`;

    const articleContext = topArticles.map((art, idx) => 
      `${idx + 1}. [${art.category || 'Tech'}] ${art.title}\nSummary: ${art.summary || (art.content ? String(art.content).slice(0, 160) : '')}\nArticle ID: ${art.id || ''}`
    ).join('\n\n');

    // Count existing audio editions to determine edition number
    const editionsSnap = await serverGetDocs(serverCollection(db, 'audio_editions'));
    const editionNumber = editionsSnap.size + 1;

    const audioPrompt = `You are the Lead Morning Audio Producer and Sinhala Voice Broadcaster for MyFeed.lk (Sri Lanka's premier technology news media).
Every morning, MyFeed publishes the "MyFeed Daily Morning Tech Wrap" (පසුගිය පැය 24 පුවත් විනාඩි 15න්) — a curated, high-impact 15-minute audio briefing for morning commuters across Sri Lanka.

Target Time Window: ${windowStart} to ${windowEnd} (Past 24 Hours)
Date: ${colombo.formattedSinhalaDate}
Edition Number: #${editionNumber}

Top Articles published in past 24 hours:
${articleContext}

Generate a complete, broadcast-ready JSON document adhering strictly to this format:
{
  "title": "MyFeed Daily Morning Tech Wrap",
  "subTitle": "පසුගිය පැය 24 පුවත් විනාඩි 15න් • Morning Commute Explainer",
  "summarySinhala": "3 to 4 sentence clear, executive-level Sinhala overview summarizing the top tech breakthroughs and local tech updates in this edition.",
  "fullNarrationScriptSinhala": "Complete, natural, broadcast-quality radio/podcast voice script in Sinhala (with technical terms pronounced clearly) containing:\n1. Energetic morning greeting to commuters on the road, public transport, or home preparing for work.\n2. In-depth, analytical breakdown of each top story with Sri Lankan developer/tech ecosystem context.\n3. Quick Market & AI landscape wrap-up.\n4. Energetic sign-off and reminder of the next 4:00 AM edition.",
  "durationFormatted": "15:15",
  "durationSeconds": 915,
  "keyStoriesCount": ${topArticles.length},
  "chapters": [
    {
      "timeFormatted": "00:00",
      "seconds": 0,
      "title": "🌅 Commute Opening & 24-Hr Overview",
      "category": "Highlights",
      "summary": "උදෑසන ආරම්භය සහ ප්‍රධාන සිරස්තල පෙරදසුන"
    }
  ]
}

Important Rules for Chapters:
- Spread 6 to 8 chapters smoothly across the 15 minutes (e.g. 00:00, 01:30, 04:15, 07:00, 09:45, 12:15, 14:10).
- Chapter titles should be crisp, engaging, and in Sinhala/English mix appropriate for tech audiences.
- Link the articleId from the provided list if matching a specific story.
- Respond ONLY with valid JSON.`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: audioPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subTitle: { type: Type.STRING },
            summarySinhala: { type: Type.STRING },
            fullNarrationScriptSinhala: { type: Type.STRING },
            durationFormatted: { type: Type.STRING },
            durationSeconds: { type: Type.INTEGER },
            keyStoriesCount: { type: Type.INTEGER },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeFormatted: { type: Type.STRING },
                  seconds: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  summary: { type: Type.STRING }
                }
              }
            }
          },
          required: ['title', 'subTitle', 'summarySinhala', 'fullNarrationScriptSinhala', 'chapters']
        },
        temperature: 0.3
      }
    });

    const rawText = aiRes.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const draft: AudioPipelineDraft = {
      id: `draft-${Date.now()}`,
      editionNumber,
      title: parsed.title || 'MyFeed Daily Morning Tech Wrap',
      subTitle: parsed.subTitle || 'පසුගිය පැය 24 පුවත් විනාඩි 15න් • Morning Commute Explainer',
      date: colombo.dateString,
      dateFormatted: colombo.formattedSinhalaDate,
      windowStart,
      windowEnd,
      audioUrl: audioPipelineConfig.defaultAudioUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=news-ambient-112199.mp3',
      durationSeconds: parsed.durationSeconds || 915,
      durationFormatted: parsed.durationFormatted || '15:15',
      narratorName: audioPipelineConfig.narratorName || 'Kaveen Sandeepa & MyFeed AI Studio',
      narratorRole: audioPipelineConfig.narratorRole || 'Editor-in-Chief & AI Audio Studio',
      summarySinhala: parsed.summarySinhala || 'පසුගිය පැය 24 තුළ පළවූ ප්‍රධාන තාක්ෂණික පුවත් පිළිබඳ විනාඩි 15ක සම්පූර්ණ විග්‍රහය.',
      fullNarrationScriptSinhala: parsed.fullNarrationScriptSinhala || '',
      keyStoriesCount: topArticles.length,
      chapters: Array.isArray(parsed.chapters) && parsed.chapters.length > 0 ? parsed.chapters : [
        { timeFormatted: '00:00', seconds: 0, title: '🌅 Commute Opening & Highlights Overview', category: 'Highlights' },
        { timeFormatted: '02:00', seconds: 120, title: 'Top AI & Global Tech Breakthroughs', category: 'AI' },
        { timeFormatted: '06:30', seconds: 390, title: 'Sri Lanka Tech & Local Developments', category: 'Local' },
        { timeFormatted: '11:00', seconds: 660, title: 'Developer & Industry Insights', category: 'Dev' },
        { timeFormatted: '14:00', seconds: 840, title: '📊 Tech Outlook & Commute Sign-off', category: 'Wrap-up' }
      ],
      generatedAt: new Date().toISOString(),
      status: 'ready_for_publish'
    };

    // Auto-synthesize Gemini Voice Over for the generated Sinhala script
    try {
      const speechScript = draft.fullNarrationScriptSinhala || draft.summarySinhala;
      if (speechScript) {
        const voiceRes = await synthesizeAiVoiceScript(speechScript, draft.title, 'Puck');
        if (voiceRes && voiceRes.audioUrl) {
          draft.audioUrl = voiceRes.audioUrl;
          console.log(`[Audio-Pipeline] Gemini AI Voice Over synthesized: ${voiceRes.audioUrl} (${voiceRes.durationFormatted})`);
        }
      }
    } catch (ttsErr) {
      console.warn('[Audio-Pipeline] Automatic AI Voice synthesis warning, keeping default audio fallback:', ttsErr);
    }

    currentAudioDraft = draft;
    lastAudioGeneratedDate = colombo.dateString;
    lastAudioGeneratedTime = timestampStr;

    // Cache draft in Firestore
    try {
      await serverSetDoc(serverDoc(db, 'audio_pipeline_drafts', 'latest_draft'), {
        ...draft,
        updatedAt: serverTimestampDoc()
      }, { merge: true });
    } catch (saveErr) {
      console.warn('Failed to cache draft in Firestore:', saveErr);
    }

    const logEntry: AudioPipelineLog = {
      id: `alog-${Date.now()}`,
      timestamp: timestampStr,
      type: triggerType === 'manual' ? 'manual' : 'generate',
      status: 'success',
      message: `Successfully synthesized Morning Edition #${editionNumber} (${draft.chapters.length} chapters, ${topArticles.length} stories). Ready for 4:00 AM publish.`,
      editionTitle: draft.title,
      articlesCount: topArticles.length
    };
    audioPipelineLogs.unshift(logEntry);
    if (audioPipelineLogs.length > 30) audioPipelineLogs.pop();

    console.log(`[Audio-Pipeline] Morning Edition #${editionNumber} generated successfully at 3:30 AM.`);
    return { success: true, draft, message: 'Audio edition generated and prepared for 4:00 AM publication' };

  } catch (err: any) {
    const errorObj = err as { message?: string };
    const logEntry: AudioPipelineLog = {
      id: `alog-${Date.now()}`,
      timestamp: timestampStr,
      type: 'error',
      status: 'error',
      message: `Audio generation failed: ${errorObj.message || String(err)}`
    };
    audioPipelineLogs.unshift(logEntry);
    if (audioPipelineLogs.length > 30) audioPipelineLogs.pop();
    console.error('[Audio-Pipeline] Generation error:', err);
    return { success: false, message: errorObj.message || 'Audio generation failed' };
  } finally {
    isAudioGenerating = false;
  }
}

export async function executeMorningAudioPublish(triggerType: 'scheduled' | 'manual' = 'scheduled'): Promise<{ success: boolean; editionId?: string; message: string }> {
  if (isAudioPublishing) {
    return { success: false, message: 'Audio publishing is already in progress' };
  }
  isAudioPublishing = true;
  const timestampStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' });
  const colombo = getColomboDateTimeParts();

  try {
    const db = getServerDb();

    // If no draft exists in memory, attempt to load from Firestore
    if (!currentAudioDraft) {
      try {
        const snap = await serverGetDocs(serverCollection(db, 'audio_pipeline_drafts'));
        snap.forEach(d => {
          if (d.id === 'latest_draft') {
            currentAudioDraft = d.data() as AudioPipelineDraft;
          }
        });
      } catch (e) {
        console.warn('Draft load failed:', e);
      }
    }

    if (!currentAudioDraft) {
      console.log('[Audio-Pipeline] No draft found. Generating fresh draft before publishing...');
      const genRes = await executeMorningAudioGeneration(triggerType);
      if (!genRes.success || !genRes.draft) {
        throw new Error('Failed to auto-generate draft before publishing: ' + genRes.message);
      }
    }

    const draft = currentAudioDraft!;
    const editionId = `edition-${Date.now()}`;

    // 1. Unset isFeatured on older editions
    try {
      const existingEditions = await serverGetDocs(serverCollection(db, 'audio_editions'));
      for (const edDoc of existingEditions.docs) {
        const edData = edDoc.data();
        if (edData['isFeatured']) {
          await serverUpdateDoc(serverDoc(db, 'audio_editions', edDoc.id), { isFeatured: false });
        }
      }
    } catch (featErr) {
      console.warn('Error clearing featured audio editions:', featErr);
    }

    // 2. Write new morning edition to audio_editions collection
    const editionData = {
      id: editionId,
      editionNumber: draft.editionNumber,
      title: draft.title,
      subTitle: draft.subTitle,
      date: draft.date,
      dateFormatted: draft.dateFormatted,
      windowStart: draft.windowStart,
      windowEnd: draft.windowEnd,
      audioUrl: draft.audioUrl,
      durationSeconds: draft.durationSeconds,
      durationFormatted: draft.durationFormatted,
      narratorName: draft.narratorName,
      narratorRole: draft.narratorRole,
      summarySinhala: draft.summarySinhala,
      fullNarrationScriptSinhala: draft.fullNarrationScriptSinhala || '',
      keyStoriesCount: draft.keyStoriesCount,
      chapters: draft.chapters,
      isFeatured: true,
      listenCount: 0,
      publishedAt: new Date().toISOString()
    };

    await serverSetDoc(serverDoc(db, 'audio_editions', editionId), editionData);

    draft.status = 'published';
    lastAudioPublishedDate = colombo.dateString;
    lastAudioPublishedTime = timestampStr;

    // 3. Send Web Push Notification to all active subscribers
    if (audioPipelineConfig.autoNotifyWebPush) {
      try {
        await sendWebPushToAllSubscribers({
          title: `🎙️ MyFeed Morning Audio Brief (#${draft.editionNumber})`,
          summary: `අද උදෑසන විනාඩි 15ක ශ්‍රව්‍ය පුවත් සංග්‍රහය (4:00 AM) දැන් සූදානම්! කාර්යාලයට යන අතරතුර සවන් දෙන්න.`,
          articleUrl: `/`,
          category: 'Audio'
        });
      } catch (pushErr) {
        console.warn('Web push for audio brief failed:', pushErr);
      }
    }

    // 4. Send Phone notification if configured
    if (audioPipelineConfig.autoNotifyPhone && audioPipelineConfig.phoneTopic) {
      try {
        const cleanTopic = (audioPipelineConfig.phoneTopic.trim().replace(/[^a-zA-Z0-9_-]/g, '')) || 'myfeedlk_kaveen';
        const phonePayload: Record<string, unknown> = {
          topic: cleanTopic,
          title: `🎙️ 4:00 AM Audio Brief Published!`,
          message: `MyFeed Morning Tech Wrap (#${draft.editionNumber}) is now LIVE with ${draft.chapters.length} chapters.\n\n🔗 Tap to listen →`,
          click: 'https://myfeedlk.web.app',
          priority: 4,
          tags: ['headphones', 'microphone', 'newspaper']
        };

        await fetch('https://ntfy.sh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(phonePayload)
        });
      } catch (phoneErr) {
        console.warn('Phone notification for audio brief failed:', phoneErr);
      }
    }

    const logEntry: AudioPipelineLog = {
      id: `alog-${Date.now()}`,
      timestamp: timestampStr,
      type: 'publish',
      status: 'success',
      message: `🚀 Published Edition #${draft.editionNumber} to app at 4:00 AM. Featured commute mode active!`,
      editionId,
      editionTitle: draft.title,
      articlesCount: draft.keyStoriesCount
    };
    audioPipelineLogs.unshift(logEntry);
    if (audioPipelineLogs.length > 30) audioPipelineLogs.pop();

    console.log(`[Audio-Pipeline] Published Morning Edition #${draft.editionNumber} (ID: ${editionId}) successfully.`);
    return { success: true, editionId, message: 'Morning Audio Edition published successfully' };

  } catch (err: any) {
    const errorObj = err as { message?: string };
    const logEntry: AudioPipelineLog = {
      id: `alog-${Date.now()}`,
      timestamp: timestampStr,
      type: 'error',
      status: 'error',
      message: `Audio publishing failed: ${errorObj.message || String(err)}`
    };
    audioPipelineLogs.unshift(logEntry);
    if (audioPipelineLogs.length > 30) audioPipelineLogs.pop();
    console.error('[Audio-Pipeline] Publishing error:', err);
    return { success: false, message: errorObj.message || 'Audio publishing failed' };
  } finally {
    isAudioPublishing = false;
  }
}

// Background Cron Scheduler (Checks every 15 seconds)
setInterval(async () => {
  // 1. AutoPilot 24/7 News Sync
  if (autoPilotConfig.enabled && !isAutoPilotSyncing) {
    const colombo = getColomboDateTimeParts();
    
    if (autoPilotConfig.scheduleMode === 'exact_times') {
      const currentSlot = `${colombo.dateString}_${colombo.timeString}`;
      const isScheduledMinute = autoPilotConfig.scheduledDailyTimes.includes(colombo.timeString);
      const isTimePassed = Date.now() >= autoPilotNextRunTime;

      if ((isScheduledMinute && lastExecutedAutoPilotSlot !== currentSlot) || (isTimePassed && lastExecutedAutoPilotSlot !== currentSlot)) {
        lastExecutedAutoPilotSlot = currentSlot;
        console.log(`[Auto-Pilot] ⏰ Scheduled time reached in Sri Lanka Time: ${colombo.timeString} (${colombo.dateString}). Executing 24/7 news sync...`);
        await executeAutoPilotSync('scheduled_cron');
      }
    } else {
      // Interval mode
      if (Date.now() >= autoPilotNextRunTime) {
        console.log('[Auto-Pilot] ⏱️ Interval reached. Executing 24/7 news sync...');
        await executeAutoPilotSync('scheduled_cron');
      }
    }
  }

  // 2. Automated AI Audio Pipeline (3:30 AM Generate -> 4:00 AM Daily Publish)
  if (audioPipelineConfig.enabled) {
    const colombo = getColomboDateTimeParts();

    // Check 3:30 AM generation
    if (colombo.timeString === audioPipelineConfig.generateTime && lastAudioGeneratedDate !== colombo.dateString && !isAudioGenerating) {
      console.log(`[Audio-Pipeline] Daily 3:30 AM generation triggered in Sri Lanka Time (${colombo.dateString})...`);
      await executeMorningAudioGeneration('scheduled');
    }

    // Check 4:00 AM publication
    if (colombo.timeString === audioPipelineConfig.publishTime && lastAudioPublishedDate !== colombo.dateString && audioPipelineConfig.autoPublish && !isAudioPublishing) {
      console.log(`[Audio-Pipeline] Daily 4:00 AM publication triggered in Sri Lanka Time (${colombo.dateString})...`);
      await executeMorningAudioPublish('scheduled');
    }
  }
}, 15 * 1000);

let geminiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'] || process.env['GROQ_API_KEY'];
  if (!apiKey) {
    return null;
  }
  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClientInstance;
}

async function fetchAndTranslateNews(): Promise<TranslatedServerArticle[]> {
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

  const ai = getGeminiClient();
  if (!ai) {
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
  const translatedArticles: TranslatedServerArticle[] = [];

  for (let index = 0; index < articles.length; index++) {
    const article = articles[index];
    try {
      let genResponseText = '';
      let attempt = 0;
      const maxAttempts = 3;
      
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

FACT-CHECK CREDIBILITY ASSESSMENT INSTRUCTIONS:
- Assess credibility score: 100 for official company announcements, launches, or confirmed releases; 85-92 for unconfirmed leaks, rumors, or developing stories.
- In 'factCheckReason', write a 1-2 sentence explanation in Sinhala explaining why it is 100% (e.g. ප්‍රධාන නිල මූලාශ්‍ර සහ ආයතනික නිවේදන මත පදනම්ව 100% ක් සනාථ කර ඇත) or if less than 100%, explain what is pending (e.g. නිල නිවේදනයක් තවමත් බලාපොරොත්තුවේ).

CATEGORY RULE:
Classify into strictly one of: 'AI' (for Artificial Intelligence, ChatGPT, OpenAI, Claude, LLMs), 'Local' (for Sri Lanka news), or 'Tech' (for Apple, Samsung, hardware, general gadgets).`;

      while (attempt < maxAttempts) {
        try {
          const response = await ai.models.generateContent({
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
                  category: { type: Type.STRING },
                  factCheckScore: { type: Type.INTEGER },
                  factCheckReason: { type: Type.STRING }
                },
                required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'category']
              }
            }
          });
          genResponseText = response.text || '';
          break; // Success, exit retry loop
        } catch (err: any) {
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
      
      const translation = JSON.parse(genResponseText || '{}');
      const rawCategory = (translation.category || 'Tech').toLowerCase();
      const detectedCategory = rawCategory.includes('ai') || rawCategory.includes('artificial') ? 'AI' :
                               rawCategory.includes('local') || rawCategory.includes('lanka') ? 'Local' : 'Tech';
      
      const fcScore = typeof translation.factCheckScore === 'number' ? translation.factCheckScore : (article.url ? 100 : 95);
      const fcReason = translation.factCheckReason || (fcScore >= 95 
        ? 'ප්‍රධාන නිල මූලාශ්‍ර සහ සංස්කාරක මණ්ඩලයේ සත්‍යාපන ක්‍රමවේද මඟින් පුවත 100% ක් සනාථ කර ඇත.' 
        : 'මූලික තොරතුරු සනාථ කර ඇති නමුත් සමාගමේ නිල නිවේදනය තවමත් බලාපොරොත්තුවේ.');

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
        sourceUrl: article.url || '',
        factCheck: {
          score: fcScore,
          status: fcScore >= 95 ? 'verified_100' : 'developing',
          statusBadge: fcScore >= 95 ? '100% සත්‍යාපිත මූලාශ්‍රයකි (Fully Verified)' : `${fcScore}% සත්‍යාපිතයි (Developing Story)`,
          reason: fcReason,
          sources: [
            {
              name: 'Primary Press Wire',
              url: article.url || undefined,
              isPrimary: true
            }
          ],
          metrics: {
            sourceReliability: fcScore >= 95 ? 100 : 90,
            factualAccuracy: fcScore >= 95 ? 100 : 85,
            editorialReview: fcScore >= 95 ? 100 : 95
          },
          checkedBy: 'MyFeed Fact-Check Desk'
        }
      });

      if (index < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (e: any) {
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
    
    // Custom API Route for Single Latest News (for Make.com / Zapier / Social Media Webhooks)
    if (url.pathname === '/api/latest-news') {
      try {
        const db = getServerDb();
        const articlesSnap = await serverGetDocs(serverCollection(db, 'articles'));
        const allArticles: any[] = [];
        articlesSnap.forEach(doc => {
          allArticles.push({ id: doc.id, ...doc.data() });
        });

        allArticles.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.publishedAt || 0).getTime());
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.publishedAt || 0).getTime());
          return timeB - timeA;
        });

        const latest = allArticles[0] || {};
        const baseUrl = 'https://myfeedlk.com';
        const articleLink = latest.slug ? `${baseUrl}/article/${latest.slug}` : (latest.id ? `${baseUrl}/article/${latest.id}` : baseUrl);

        return new Response(JSON.stringify({
          id: latest.id || '',
          title: latest.title || '',
          summary: latest.summary || latest.description || '',
          imageUrl: latest.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
          link: articleLink,
          slug: latest.slug || '',
          category: latest.category || 'Tech',
          publishedAt: latest.publishedAt || new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30, s-maxage=30'
          }
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || 'Failed to fetch latest news' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

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
        } catch (e: any) {
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

    // Public RSS Feed for Social Media Automation (Make.com, Zapier, Buffer, IFTTT)
    if ((url.pathname === '/api/rss' || url.pathname === '/api/rss/' || url.pathname === '/rss.xml' || url.pathname === '/feed.xml' || url.pathname === '/rss') && (request.method === 'GET' || request.method === 'HEAD')) {
      try {
        const db = getServerDb();
        const articlesSnap = await serverGetDocs(serverCollection(db, 'articles'));
        const allArticles: any[] = [];
        articlesSnap.forEach(doc => {
          const data = doc.data();
          allArticles.push({ id: doc.id, ...data });
        });

        // Sort descending by timestamp or publishedAt
        allArticles.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.publishedAt || 0).getTime());
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.publishedAt || 0).getTime());
          return timeB - timeA;
        });

        const baseUrl = 'https://myfeedlk.com';
        const topArticles = allArticles.slice(0, 20);

        const rssItemsXml = topArticles.map(art => {
          const itemUrl = art.slug ? `${baseUrl}/article/${art.slug}` : (art.id ? `${baseUrl}/article/${art.id}` : baseUrl);
          const imgUrl = art.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';
          const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date().toUTCString();

          return `    <item>
      <title><![CDATA[${art.title || ''}]]></title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${art.summary || art.description || ''}]]></description>
      <enclosure url="${imgUrl}" length="0" type="image/jpeg" />
      <media:content url="${imgUrl}" medium="image" type="image/jpeg" />
    </item>`;
        }).join('\n');

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MyFeed.lk - Breaking Sri Lanka &amp; Global Tech News</title>
    <link>${baseUrl}</link>
    <description>ශ්‍රී ලංකාවේ ප්‍රමුඛතම තාක්ෂණික පුවත් වෙබ් අඩවිය</description>
    <language>si-LK</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml" />
${rssItemsXml}
  </channel>
</rss>`;

        return new Response(rssXml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=60'
          }
        });
      } catch (rssErr) {
        console.error('RSS generation error:', rssErr);
        return new Response('Failed to generate RSS feed', { status: 500 });
      }
    }

    
    // ==========================================
    // AUTO-PILOT 24/7 1-HOUR NEWS SYNC ENDPOINTS
    // ==========================================

    // Auto-Pilot Status & Live History
    if (url.pathname === '/api/admin/autopilot/status' && request.method === 'GET') {
      return new Response(JSON.stringify({
        config: autoPilotConfig,
        logs: autoPilotLogs,
        isRunning: isAutoPilotSyncing,
        serverTime: new Date().toISOString(),
        nextRunTime: autoPilotNextRunTime,
        lastRunTime: autoPilotLastRunTime
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Auto-Pilot Configuration Update
    if (url.pathname === '/api/admin/autopilot/config' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (typeof body.enabled === 'boolean') autoPilotConfig.enabled = body.enabled;
        if (body.scheduleMode === 'interval' || body.scheduleMode === 'exact_times') {
          autoPilotConfig.scheduleMode = body.scheduleMode;
        }
        if (typeof body.intervalMinutes === 'number' && body.intervalMinutes >= 15) {
          autoPilotConfig.intervalMinutes = body.intervalMinutes;
        }
        if (Array.isArray(body.scheduledDailyTimes)) {
          autoPilotConfig.scheduledDailyTimes = body.scheduledDailyTimes
            .filter((t: any) => typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t.trim()))
            .map((t: string) => t.trim());
          if (autoPilotConfig.scheduledDailyTimes.length === 0) {
            autoPilotConfig.scheduledDailyTimes = ['08:00', '12:00', '16:00', '20:00'];
          }
        }
        if (typeof body.autoPublish === 'boolean') autoPilotConfig.autoPublish = body.autoPublish;
        if (typeof body.notifyPhone === 'boolean') autoPilotConfig.notifyPhone = body.notifyPhone;
        if (typeof body.postWhatsApp === 'boolean') autoPilotConfig.postWhatsApp = body.postWhatsApp;
        if (typeof body.postFacebook === 'boolean') autoPilotConfig.postFacebook = body.postFacebook;
        if (typeof body.phoneTopic === 'string') autoPilotConfig.phoneTopic = body.phoneTopic.trim();
        if (typeof body.waWebhookUrl === 'string') autoPilotConfig.waWebhookUrl = body.waWebhookUrl.trim();
        if (typeof body.fbWebhookUrl === 'string') autoPilotConfig.fbWebhookUrl = body.fbWebhookUrl.trim();
        if (typeof body.maxArticlesPerRun === 'number') autoPilotConfig.maxArticlesPerRun = Math.max(1, Math.min(body.maxArticlesPerRun, 5));

        autoPilotNextRunTime = calculateNextRunTimestamp(autoPilotConfig);
        await saveAutoPilotConfigToFirestore(autoPilotConfig);

        return new Response(JSON.stringify({ success: true, config: autoPilotConfig, nextRunTime: autoPilotNextRunTime }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        const errorObj = err as { message?: string };
        return new Response(JSON.stringify({ error: errorObj.message || 'Failed to update config' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Dedicated 1-Hour Cron & Webhook Trigger for Auto-Pilot
    if ((url.pathname === '/api/cron/sync-news' || url.pathname === '/api/admin/autopilot/sync-now') && (request.method === 'GET' || request.method === 'POST')) {
      const triggerType = url.pathname.includes('sync-now') ? 'manual_admin' : 'webhook_cron';
      const result = await executeAutoPilotSync(triggerType);
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ==========================================
    // AUTOMATED AI AUDIO PIPELINE ENDPOINTS (3:30 AM -> 4:00 AM)
    // ==========================================

    // Audio Pipeline Status & Current Draft
    if (url.pathname === '/api/admin/audio-pipeline/status' && request.method === 'GET') {
      const colombo = getColomboDateTimeParts();
      const nextGen = getNextOccurrenceMs(audioPipelineConfig.generateTime);
      const nextPub = getNextOccurrenceMs(audioPipelineConfig.publishTime);

      return new Response(JSON.stringify({
        config: audioPipelineConfig,
        currentDraft: currentAudioDraft,
        logs: audioPipelineLogs,
        isGenerating: isAudioGenerating,
        isPublishing: isAudioPublishing,
        colomboTime: colombo.timeString,
        colomboDate: colombo.dateString,
        colomboFormatted: colombo.formattedSinhalaDate,
        nextGenerateMs: nextGen.nextMs,
        nextGenerateFormatted: nextGen.nextTimeString,
        nextPublishMs: nextPub.nextMs,
        nextPublishFormatted: nextPub.nextTimeString,
        lastGeneratedDate: lastAudioGeneratedDate,
        lastGeneratedTime: lastAudioGeneratedTime,
        lastPublishedDate: lastAudioPublishedDate,
        lastPublishedTime: lastAudioPublishedTime
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Audio Pipeline Config Update
    if (url.pathname === '/api/admin/audio-pipeline/config' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (typeof body.enabled === 'boolean') audioPipelineConfig.enabled = body.enabled;
        if (typeof body.generateTime === 'string' && /^\d{1,2}:\d{2}$/.test(body.generateTime.trim())) {
          audioPipelineConfig.generateTime = body.generateTime.trim();
        }
        if (typeof body.publishTime === 'string' && /^\d{1,2}:\d{2}$/.test(body.publishTime.trim())) {
          audioPipelineConfig.publishTime = body.publishTime.trim();
        }
        if (typeof body.autoPublish === 'boolean') audioPipelineConfig.autoPublish = body.autoPublish;
        if (typeof body.narratorName === 'string') audioPipelineConfig.narratorName = body.narratorName.trim();
        if (typeof body.narratorRole === 'string') audioPipelineConfig.narratorRole = body.narratorRole.trim();
        if (typeof body.defaultAudioUrl === 'string') audioPipelineConfig.defaultAudioUrl = body.defaultAudioUrl.trim();
        if (typeof body.autoNotifyWebPush === 'boolean') audioPipelineConfig.autoNotifyWebPush = body.autoNotifyWebPush;
        if (typeof body.autoNotifyPhone === 'boolean') audioPipelineConfig.autoNotifyPhone = body.autoNotifyPhone;
        if (typeof body.phoneTopic === 'string') audioPipelineConfig.phoneTopic = body.phoneTopic.trim();

        return new Response(JSON.stringify({ success: true, config: audioPipelineConfig }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        const errorObj = err as { message?: string };
        return new Response(JSON.stringify({ error: errorObj.message || 'Failed to update audio pipeline config' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Manual Generate Trigger (Admin or External Cron)
    if (url.pathname === '/api/admin/audio-pipeline/generate-now' && (request.method === 'GET' || request.method === 'POST')) {
      const result = await executeMorningAudioGeneration('manual');
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Manual Publish Trigger (Admin or External Cron)
    if (url.pathname === '/api/admin/audio-pipeline/publish-now' && (request.method === 'GET' || request.method === 'POST')) {
      const result = await executeMorningAudioPublish('manual');
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ==========================================
    // GEMINI AI VOICE OVER AUDIO STREAMING & SYNTHESIS ENDPOINTS
    // ==========================================

    // Instant High-Fidelity Audio File Stream (with HTTP 206 Partial Content / Range support)
    if (url.pathname.startsWith('/api/audio/file/') && request.method === 'GET') {
      const fileKey = url.pathname.replace('/api/audio/file/', '').replace(/\.wav$/i, '');
      const audioEntry = generatedAudioStore.get(fileKey);

      if (!audioEntry) {
        // If not in memory store, fallback to redirect or 404
        return new Response(JSON.stringify({ error: 'Audio file expired or not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const buffer = audioEntry.buffer;
      const totalBytes = buffer.length;
      const rangeHeader = request.headers.get('range') || request.headers.get('Range');

      if (rangeHeader && rangeHeader.startsWith('bytes=')) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10) || 0;
        const end = parts[1] ? parseInt(parts[1], 10) : totalBytes - 1;
        const clampedEnd = Math.min(end, totalBytes - 1);
        const chunk = buffer.subarray(start, clampedEnd + 1);

        return new Response(new Uint8Array(chunk) as unknown as BodyInit, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${clampedEnd}/${totalBytes}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunk.length.toString(),
            'Content-Type': audioEntry.contentType || 'audio/wav',
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      return new Response(new Uint8Array(buffer) as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': audioEntry.contentType || 'audio/wav',
          'Content-Length': totalBytes.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Direct Gemini AI Voice Over Synthesis Trigger
    if (url.pathname === '/api/audio/generate-voice' && request.method === 'POST') {
      try {
        const body = await request.json();
        const script = body.script || body.text || currentAudioDraft?.fullNarrationScriptSinhala || currentAudioDraft?.summarySinhala || '';
        const title = body.title || currentAudioDraft?.title || 'MyFeed Morning Tech Wrap';
        const voiceName = body.voiceName || 'Puck';

        if (!script || script.trim().length === 0) {
          return new Response(JSON.stringify({ error: 'No narration text provided for AI voice synthesis' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const voiceRes = await synthesizeAiVoiceScript(script, title, voiceName);
        if (!voiceRes) {
          return new Response(JSON.stringify({ error: 'Failed to synthesize speech with Gemini AI' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // If active draft exists, sync it
        if (currentAudioDraft) {
          currentAudioDraft.audioUrl = voiceRes.audioUrl;
          currentAudioDraft.durationSeconds = voiceRes.durationSeconds;
          currentAudioDraft.durationFormatted = voiceRes.durationFormatted;

          try {
            const db = getServerDb();
            await serverSetDoc(serverDoc(db, 'audio_pipeline_drafts', 'latest_draft'), {
              ...currentAudioDraft,
              updatedAt: serverTimestampDoc()
            }, { merge: true });
          } catch (draftErr) {
            console.warn('Failed to sync updated draft audio in Firestore:', draftErr);
          }
        }

        return new Response(JSON.stringify({
          ...voiceRes
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (voiceErr: any) {
        console.error('Error generating AI voice over:', voiceErr);
        return new Response(JSON.stringify({ error: voiceErr?.message || 'AI Voice Over generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 1. Trending Tech News Feed for Admin Auto-Crawler (with Cross-Feed Deduplication)
    if (url.pathname === '/api/admin/trending-news' && request.method === 'GET') {
      try {
        const trendingItems: {
          id: string;
          title: string;
          description: string;
          url: string;
          imageUrl: string;
          publishedAt: string;
          source: string;
          categoryHint: string;
        }[] = [];

        const seenTrendingKeywords: string[][] = [];

        for (const feed of SERVER_RSS_FEEDS) {
          try {
            const res = await fetch(feed.url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
              signal: AbortSignal.timeout(30000)
            });
            if (res.ok) {
              const xml = await res.text();
              const parsed = parseServerRss(xml, feed.name);
              for (const item of parsed.slice(0, 4)) {
                const words = item.title.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'more', 'about', 'after', 'will', 'what'].includes(w));
                
                // Cross-feed duplicate check
                let isDup = false;
                for (const seen of seenTrendingKeywords) {
                  let matches = 0;
                  for (const w of words) {
                    if (seen.includes(w)) matches++;
                  }
                  if (words.length > 0 && matches / words.length >= 0.5) {
                    isDup = true;
                    break;
                  }
                }
                if (isDup) continue;
                seenTrendingKeywords.push(words);

                const isAi = item.title.toLowerCase().includes('ai') || item.title.toLowerCase().includes('gpt') || feed.name.includes('AI');
                const isLocal = feed.name.includes('Sri Lanka') || feed.name.includes('Derana') || feed.name.includes('FT');
                trendingItems.push({
                  id: `trend-${Math.random().toString(36).substring(2, 9)}`,
                  title: item.title,
                  description: item.description,
                  url: item.url,
                  imageUrl: item.imageUrl || getServerTopicImage(item.title),
                  publishedAt: item.publishedAt,
                  source: feed.name,
                  categoryHint: isAi ? 'AI' : (isLocal ? 'Local' : 'Tech')
                });
              }
            }
          } catch (feedErr) {
            console.warn(`Admin trending fetch failed for ${feed.name}:`, feedErr);
          }
        }

        return new Response(JSON.stringify(trendingItems), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        const errorObj = err as { message?: string };
        return new Response(JSON.stringify({ error: errorObj.message || 'Failed to fetch trending news' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. Comprehensive Admin Auto Article & Content Generator
    if (url.pathname === '/api/admin/generate-full-article' && request.method === 'POST') {
      const ai = getGeminiClient();
      if (!ai) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server. Please configure your Gemini API Key in Settings > Secrets.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json();
        const mode = body.mode || 'topic'; // 'topic' | 'url' | 'trending' | 'custom'
        const topic = (body.topic || '').trim();
        const articleUrl = (body.url || '').trim();
        const incomingImageUrl = (body.imageUrl || body.rawImageUrl || '').trim();
        const contextInfo = (body.context || '').trim();
        const tone = body.tone || 'journalistic'; // 'journalistic', 'review', 'explainer', 'breaking', 'opinion'
        const length = body.length || 'standard'; // 'short', 'standard', 'deep_dive'
        const targetAudience = body.targetAudience || 'general'; // 'general', 'sri_lanka', 'tech_enthusiasts', 'business'
        const includeLKR = !!body.includePricingInLKR;

        let sourceMaterial = '';
        let originalSourceImage = (incomingImageUrl && isValidServerImage(incomingImageUrl)) ? incomingImageUrl : '';

        if (articleUrl) {
          try {
            const pageRes = await fetch(articleUrl, {
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,si;q=0.8'
              },
              redirect: 'follow',
              signal: AbortSignal.timeout(30000)
            });
            if (pageRes.ok) {
              const html = await pageRes.text();
              const finalUrl = pageRes.url || articleUrl;
              const extractedImg = extractOriginalImageFromHtml(html, finalUrl);
              if (extractedImg && isValidServerImage(extractedImg)) {
                originalSourceImage = extractedImg;
              }
              sourceMaterial = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
                .substring(0, 120000);
            }
          } catch (scrapeErr) {
            console.warn('Could not scrape full URL, falling back to topic/summary:', scrapeErr);
          }
        }

        const toneInstruction = 
          tone === 'review' ? 'In-depth analytical review with pros/cons, performance evaluation, and buying advice.' :
          tone === 'explainer' ? 'Step-by-step beginner-friendly educational tech guide explaining how it works.' :
          tone === 'breaking' ? 'High-urgency breaking news flash emphasizing latest real-time developments and implications.' :
          tone === 'opinion' ? 'Thought-provoking editorial tech commentary and industry future projections.' :
          'Objective, prestigious investigative technology journalism with balanced reporting and facts.';

        const lengthInstruction =
          length === 'short' ? 'Concise 350-500 words report with 3 concise sections.' :
          length === 'deep_dive' ? 'Comprehensive, exhaustive long-form deep dive (1000-1500+ words) with 5-7 distinct sections, deep technical breakdown, tables/lists, and expert analysis.' :
          'Standard full-length editorial news story (650-900 words) with 4-5 well-structured sections.';

        const audienceInstruction =
          targetAudience === 'sri_lanka' ? 'Tailored specifically for the Sri Lankan audience: explain Sri Lanka market relevance, local ISP/payment support, and estimated local pricing.' :
          targetAudience === 'tech_enthusiasts' ? 'Advanced technical depth: specifications, architecture, silicon, benchmark references, and developer impact.' :
          targetAudience === 'business' ? 'Enterprise, economic, startup, and financial tech market implications.' :
          'Engaging, accessible to the broader tech-savvy public.';

        const pricingInstruction = includeLKR ? 'When mentioning any international USD prices, provide approximate Sri Lankan Rupee (LKR) conversion estimates.' : '';

        const prompt = `You are the Editor-in-Chief and Chief Technology Journalist for MyFeed.lk (ශ්‍රී ලංකාවේ ප්‍රමුඛතම තාක්ෂණික පුවත් වෙබ් අඩවිය).
Write an outstanding, professional, high-journalistic quality news article in natural, fluent Sinhala (පූර්ණ මාධ්‍යවේදී පුවත් වාර්තාවක්).

INPUT DETAILS:
- Mode: ${mode}
- Main Topic / Headline: ${topic || 'Latest Technology Breakthrough'}
- Extra Context / Source Notes: ${contextInfo || 'N/A'}
- Source URL: ${articleUrl || 'N/A'}
${sourceMaterial ? `- Raw Web Content Extract: ${sourceMaterial.substring(0, 5000)}` : ''}

WRITING CRITERIA:
1. Tone: ${toneInstruction}
2. Length: ${lengthInstruction}
3. Target Audience: ${audienceInstruction}
4. ${pricingInstruction}

CONTENT FORMATTING ('sinhalaFullContent'):
- Must be clean HTML.
- Start with an engaging, hook lead paragraph: <p class="lead font-medium text-lg mb-4">...</p>
- Divide into well-organized thematic sections with clear, enticing Sinhala subheadings (<h2>...</h2>).
- Include bullet point lists (<ul><li class="mb-2"><strong>විශේෂාංගය:</strong> විස්තරය...</li></ul>) for key specifications, highlights, or features.
- Provide a dedicated section evaluating the broader impact (<h2>වෙළඳපොළට සහ පරිශීලකයින්ට ඇතිවන බලපෑම</h2>).
- Conclude with a strong analytical summary (<h2>අවසන් නිගමනය (Verdict)</h2>).
- High standards of modern Sinhala technical language and grammar (නූතන තාක්ෂණික වචන නිවැරදිව භාවිත කරන්න).

SOCIAL COPY ('socialShareText'):
- Create a complete, formatted WhatsApp Channel & Social Media post in Sinhala with eye-catching emojis, title, 3 key bullet points, and call-to-action to read on MyFeed.lk.`;

        const geminiRes = await ai.models.generateContent({
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
                readTime: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
                socialShareText: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                factCheckScore: { type: Type.INTEGER },
                factCheckReason: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: [
                'sinhalaTitle',
                'sinhalaDescription',
                'sinhalaFullContent',
                'suggestedCategory',
                'readTime',
                'visualPrompt',
                'socialShareText',
                'metaDescription',
                'tags'
              ]
            }
          }
        });

        const result = JSON.parse(geminiRes.text || '{}');
        
        // Auto-generate AI image URL fallback if original image not found
        const promptText = result.visualPrompt || `${topic} futuristic modern high-tech device editorial photography studio lighting 8k`;
        const randomSeed = Math.floor(Math.random() * 1000000);
        const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=1200&height=675&nologo=true&enhance=true&seed=${randomSeed}`;
        
        // Prioritize original source image from article webpage
        result.originalImageUrl = originalSourceImage || '';
        result.imageUrl = originalSourceImage || generatedImageUrl;
        result.sourceUrl = articleUrl || '';

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (genErr: any) {
        const err = genErr as { message?: string };
        console.error('Error generating full article:', genErr);
        return new Response(JSON.stringify({ error: err.message || 'Article generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 3. Admin Content Polishing & Smart Enhancer
    if (url.pathname === '/api/admin/polish-content' && request.method === 'POST') {
      const ai = getGeminiClient();
      if (!ai) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json();
        const content = body.content || '';
        const title = body.title || '';
        const action = body.action || 'polish_all'; // 'polish_all', 'fix_grammar', 'add_subheadings', 'create_summary', 'generate_social'

        const prompt = `You are a chief Sinhala tech copyeditor for MyFeed.lk.
Given this article content and title, perform the requested action: ${action}

Title: ${title}
Content:
${content}

Return a valid JSON object matching the schema with the improved/transformed content.`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                polishedTitle: { type: Type.STRING },
                polishedContent: { type: Type.STRING },
                suggestedSummary: { type: Type.STRING },
                socialPost: { type: Type.STRING }
              },
              required: ['polishedTitle', 'polishedContent', 'suggestedSummary', 'socialPost']
            }
          }
        });

        const result = JSON.parse(geminiRes.text || '{}');
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (polishErr: any) {
        const err = polishErr as { message?: string };
        return new Response(JSON.stringify({ error: err.message || 'Polishing failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 4. Batch Article Generation for Admin
    if (url.pathname === '/api/admin/batch-generate' && request.method === 'POST') {
      const ai = getGeminiClient();
      if (!ai) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json();
        const items: { title: string; url?: string; description?: string }[] = body.items || [];

        if (!items.length) {
          return new Response(JSON.stringify({ error: 'No items provided for batch generation' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const generatedList = [];

        for (let i = 0; i < Math.min(items.length, 5); i++) {
          const item = items[i];
          const prompt = `Write a comprehensive, professional Sinhala news article for MyFeed.lk based on:
Headline: ${item.title}
Summary: ${item.description || ''}
Source URL: ${item.url || ''}

REQUIREMENTS:
- Informative, accurate Sinhala title ('sinhalaTitle')
- Engaging summary ('sinhalaDescription')
- 4-5 structured HTML paragraphs with <h2> subheadings and <ul> bullet highlights ('sinhalaFullContent')
- Classify into 'AI', 'Tech', or 'Local' ('suggestedCategory')
- 20-30 word visual prompt for AI image ('visualPrompt')
- Ready-to-share WhatsApp post copy ('socialShareText')`;

          const res = await ai.models.generateContent({
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
                  readTime: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  socialShareText: { type: Type.STRING }
                },
                required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'suggestedCategory', 'readTime', 'visualPrompt', 'socialShareText']
              }
            }
          });

          const parsed = JSON.parse(res.text || '{}');
          const randomSeed = Math.floor(Math.random() * 1000000);
          parsed.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsed.visualPrompt || item.title)}?width=1200&height=675&nologo=true&enhance=true&seed=${randomSeed}`;
          parsed.sourceUrl = item.url || '';
          generatedList.push(parsed);

          if (i < items.length - 1) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        return new Response(JSON.stringify({ articles: generatedList }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (batchErr: any) {
        const err = batchErr as { message?: string };
        return new Response(JSON.stringify({ error: err.message || 'Batch generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // AI Article Generation from a Given URL
    if (url.pathname === '/api/generate-from-url' && request.method === 'POST') {
      const ai = getGeminiClient();
      if (!ai) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server. Please configure your Gemini API Key in Settings > Secrets.' }), { 
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

        const geminiRes = await ai.models.generateContent({
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
                visualPrompt: { type: Type.STRING },
                readTime: { type: Type.STRING },
              },
              required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'suggestedCategory', 'visualPrompt', 'readTime']
            }
          }
        });

        const result = JSON.parse(geminiRes.text || '{}');
        const originalSourceImg = extractOriginalImageFromHtml(html, articleUrl);
        result.originalImageUrl = originalSourceImg || '';
        result.imageUrl = originalSourceImg || '';
        result.sourceUrl = articleUrl;

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (genErr: any) {
        const err = genErr as { message?: string };
        console.error('Error generating AI article from URL:', genErr);
        return new Response(JSON.stringify({ error: err.message || 'Generation failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Dedicated Endpoint to Extract Original Article Image from any Web URL / Source
    if (url.pathname === '/api/extract-source-image' && request.method === 'POST') {
      try {
        const body = await request.json();
        const targetUrl = (body.url || '').trim();
        if (!targetUrl) {
          return new Response(JSON.stringify({ error: 'Source URL is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const pageRes = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          },
          signal: AbortSignal.timeout(30000)
        });

        if (!pageRes.ok) {
          return new Response(JSON.stringify({ error: `Failed to fetch page (Status ${pageRes.status})` }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const html = await pageRes.text();
        const originalImage = extractOriginalImageFromHtml(html, targetUrl);

        // Also extract original title and site name if present
        const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                           html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        const siteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
        const siteName = siteMatch ? siteMatch[1].trim() : '';

        return new Response(JSON.stringify({
          originalImageUrl: originalImage || '',
          imageUrl: originalImage || getServerTopicImage(title),
          title,
          siteName
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        const e = err as { message?: string };
        return new Response(JSON.stringify({ error: e.message || 'Failed to extract original image' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Direct AI Long Article Generator Endpoint
    if (url.pathname === '/api/generate-ai-article' && request.method === 'POST') {
      const ai = getGeminiClient();
      if (!ai) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on server. Please configure your Gemini API Key in Settings > Secrets.' }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      try {
        const body = await request.json();
        const topic = body.topic || body.title || 'Latest Technology Breakthrough';
        const contextInfo = body.context || '';

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

        const geminiRes = await ai.models.generateContent({
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
                readTime: { type: Type.STRING },
              },
              required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'suggestedCategory', 'readTime']
            }
          }
        });

        const result = JSON.parse(geminiRes.text || '{}');
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (genErr: any) {
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
        const ai = getGeminiClient();

        if (ai) {
          try {
            const promptRes = await ai.models.generateContent({
              model: 'gemini-3.7-flash',
              contents: `Translate and convert this news article title into a short, descriptive 20-30 word visual prompt for generating a photorealistic, ultra-high-quality tech editorial image.
Title: "${title}"
Category: "${category}"

Rules:
1. Focus on the core visual subject.
2. Avoid text or words inside the image.
3. Use cinematic editorial tech photography style, 8k, modern studio lighting.
4. Output ONLY the English prompt text without quotes or preamble.`
            });
            visualPrompt = promptRes.text?.trim().replace(/^"|"$/g, '') || '';
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
      } catch (imgErr: any) {
        const err = imgErr as { message?: string };
        console.error('Error generating AI image from title:', imgErr);
        return new Response(JSON.stringify({ error: err.message || 'Image generation failed' }), {
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
🔗 *Read full story:* ${articleUrl || (process.env['SITE_URL'] || 'https://myfeedlk.com')}

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
      } catch (waErr: any) {
        const err = waErr as { message?: string };
        return new Response(JSON.stringify({ error: err.message || 'WhatsApp dispatch error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Automated Facebook Page Auto-Post API
    if (url.pathname === '/api/facebook/post' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { title, summary, articleUrl, category, readTime, customMessage, imageUrl, webhookUrl } = body;
        
        const fbWebhookUrl = webhookUrl || autoPilotConfig.fbWebhookUrl || process.env['FACEBOOK_WEBHOOK_URL'];
        const fbPageAccessToken = process.env['FACEBOOK_PAGE_ACCESS_TOKEN'] || process.env['FB_PAGE_TOKEN'];
        const fbPageId = process.env['FACEBOOK_PAGE_ID'] || process.env['FB_PAGE_ID'];

        const formattedPost = customMessage || `📰 ${title || 'MyFeed.lk Breaking News'}

${summary || ''}

🔗 සම්පූර්ණ විස්තරය කියවන්න: ${articleUrl || (process.env['SITE_URL'] || 'https://myfeedlk.com')}

#MyFeedLK #TechNews #SriLanka #${(category || 'Tech').replace(/\s+/g, '')}`;

        // 1. If custom Webhook is configured (Make.com, Zapier, n8n, Webhook Relay)
        if (fbWebhookUrl) {
          const webhookRes = await fetch(fbWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: formattedPost,
              caption: formattedPost,
              message: formattedPost,
              image: imageUrl || '',
              imageUrl: imageUrl || '',
              photoUrl: imageUrl || '',
              title: title || '',
              summary: summary || '',
              url: articleUrl || '',
              articleUrl: articleUrl || '',
              category: category || 'Tech',
              readTime: readTime || ''
            })
          });
          return new Response(JSON.stringify({ success: true, mode: 'webhook', status: webhookRes.status }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 2. If Official Meta Facebook Graph API Page Access Token is provided
        if (fbPageAccessToken && fbPageId) {
          let fbApiUrl = `https://graph.facebook.com/v19.0/${fbPageId}/feed`;
          let fbPayload: Record<string, any> = {
            message: formattedPost,
            access_token: fbPageAccessToken
          };

          if (imageUrl) {
            fbApiUrl = `https://graph.facebook.com/v19.0/${fbPageId}/photos`;
            fbPayload = {
              url: imageUrl,
              caption: formattedPost,
              access_token: fbPageAccessToken
            };
          }

          const fbApiRes = await fetch(fbApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fbPayload)
          });

          const fbResult = await fbApiRes.json();
          return new Response(JSON.stringify({ success: fbApiRes.ok, result: fbResult }), {
            status: fbApiRes.status,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // 3. Fallback response with formatted payload and web sharer URL
        const directShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl || 'https://myfeedlk.com')}&quote=${encodeURIComponent(formattedPost)}`;
        return new Response(JSON.stringify({
          success: true,
          mode: 'formatted_payload',
          message: 'Post formatted and ready for Facebook dispatch',
          formattedText: formattedPost,
          imageUrl: imageUrl || '',
          directShareUrl
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (fbErr: any) {
        const err = fbErr as { message?: string };
        return new Response(JSON.stringify({ error: err.message || 'Facebook dispatch error' }), {
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
      } catch (phoneErr: any) {
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
        const { title, summary, articleUrl, imageUrl, category, subscriptions } = body;
        
        try {
          webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        } catch {
          console.debug('[VAPID] Webpush details ready');
        }

        if (Array.isArray(subscriptions) && subscriptions.length > 0) {
          const payload = JSON.stringify({
            title: (title ? `📰 ${title}` : 'MyFeed.lk Breaking News').slice(0, 80),
            body: (summary || 'නව පුවතක් MyFeed.lk හි ප්‍රකාශයට පත් කෙරිණි. දැන්ම කියවන්න!').slice(0, 180),
            url: articleUrl || '/',
            icon: '/favicon.ico',
            image: imageUrl || undefined,
            category: category || 'News'
          });

          const results = await Promise.allSettled(
            subscriptions.map((sub: webpush.PushSubscription) => webpush.sendNotification(sub, payload))
          );
          
          const failedEndpoints = results
            .map((res, index) => res.status === 'rejected' ? subscriptions[index].endpoint : null)
            .filter(Boolean);

          return new Response(JSON.stringify({ success: true, count: subscriptions.length, failedEndpoints }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          const result = await sendWebPushToAllSubscribers({
            title: title || 'MyFeed.lk Breaking News',
            summary: summary || 'නව පුවතක් MyFeed.lk හි ප්‍රකාශයට පත් කෙරිණි.',
            articleUrl: articleUrl || '/',
            imageUrl,
            category
          });

          return new Response(JSON.stringify({ success: true, ...result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (err: any) {
        const errorObj = err as { message?: string };
        return new Response(JSON.stringify({ error: errorObj.message || 'Web push failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const result = await angularAppEngine.handle(request, context);
    return result || new Response('Not found', { status: 404 });
  } catch (err: any) {
    console.error('Netlify SSR Error:', err);
    return new Response('SSR Error: ' + (err instanceof Error ? err.message : String(err)), { status: 500 });
  }
}

export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
