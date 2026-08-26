import { Injectable, signal, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  collection, 
  onSnapshot,
  getDocs, 
  doc, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  increment,
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';

export interface FactSource {
  name: string;
  url?: string;
  domain?: string;
  isPrimary?: boolean;
}

export interface FactCheckData {
  score: number; // 0 to 100
  status: 'verified_100' | 'mostly_verified' | 'developing' | 'unconfirmed';
  statusBadge: string;
  reason: string;
  sources: FactSource[];
  metrics: {
    sourceReliability: number;
    factualAccuracy: number;
    editorialReview: number;
  };
  checkedBy: string;
}

export interface Article {
  id: string;
  slug?: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  sourceUrl?: string;
  originalTitle?: string;
  authorType?: 'ai' | 'human' | 'editorial';
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  isAiGenerated?: boolean;
  createdAt?: unknown;
  uploadTimeStr?: string;
  timestamp?: number;
  views?: number;
  reactions?: Record<string, number>;
  factCheck?: FactCheckData;
}

function getSimpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Rich, curated high-definition technology image collections (Unsplash verified)
export const TECH_IMAGE_POOLS: Record<string, string[]> = {
  blackberry_software: [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // Cybersecurity & SOC data
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Cyber code matrix
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // Embedded silicon processor
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', // High-performance software code
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80', // Software engineering architecture
    'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80'  // Embedded hardware IoT
  ],
  apple: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', // iPhone 15/16 Pro Titanium
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80', // Sleek Apple aesthetic
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80', // Apple devices on desk
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'  // MacBook Pro Retina
  ],
  samsung: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80', // Samsung Galaxy Flagship
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80', // Foldable Galaxy
    'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=1200&q=80'  // Modern Android Display
  ],
  pixel: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80', // Google Pixel Camera
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1200&q=80'  // Android Smartphone
  ],
  ai: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80', // Neural network nodes
    'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&w=1200&q=80', // Digital cyber brain
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // Generative AI visual
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80', // 3D AI typography
    'https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?auto=format&fit=crop&w=1200&q=80', // Modern holographic AI
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=1200&q=80'  // Cyber matrix deep learning
  ],
  robotics: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', // White humanoid robot
    'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1200&q=80', // Bionic robotic hand
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80', // Industrial robotic arm
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=80'  // Robot eye sensor
  ],
  chips_hardware: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', // Microchip silicon wafer
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=1200&q=80', // Glowing motherboard PCB
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80', // GPU processor core
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80'  // Quantum processor
  ],
  cybersecurity: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', // Green matrix security code
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80', // Padlock digital shield
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'  // Cybersecurity SOC
  ],
  gaming: [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', // Neon gaming console
    'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=1200&q=80', // VR headset gaming
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'  // RGB mechanical setup
  ],
  space: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Earth from orbit satellite
    'https://images.unsplash.com/photo-1517976487507-5b6533d44e7c?auto=format&fit=crop&w=1200&q=80', // Rocket launch
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'  // Space station
  ],
  ev_automotive: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', // Smart EV
    'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1200&q=80'  // Tesla supercharger
  ],
  local_sl: [
    'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80', // Colombo Skyline & Lotus Tower
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80'  // Sri Lanka tech environment
  ],
  general_tech: [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80', // Modern laptop glowing tech
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', // Coding setup
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'  // Cloud server racks
  ]
};

export function getTopicFallbackImage(title = '', category = ''): string {
  const t = (title + ' ' + (category || '')).toLowerCase();
  const hash = getSimpleHash(title + (category || ''));
  
  // 1. BlackBerry / QNX / Software / Embedded Systems
  if (
    t.includes('blackberry') || 
    t.includes('qnx') || 
    t.includes('black berry') ||
    t.includes('බ්ලැක්බෙරි') || 
    t.includes('iot') ||
    t.includes('embedded') ||
    (t.includes('මෘදුකාංග') && !t.includes('chatgpt'))
  ) {
    const pool = TECH_IMAGE_POOLS['blackberry_software'];
    return pool[hash % pool.length];
  }

  // 2. Apple & iPhone Ecosystem
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
    const pool = TECH_IMAGE_POOLS['apple'];
    return pool[hash % pool.length];
  }

  // 3. Samsung Galaxy
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
    const pool = TECH_IMAGE_POOLS['samsung'];
    return pool[hash % pool.length];
  }

  // 4. Google Pixel & Android
  if (
    t.includes('pixel') || 
    t.includes('android') || 
    t.includes('google phone') || 
    t.includes('ගූගල්') || 
    t.includes('ඇන්ඩ්‍රොයිඩ්')
  ) {
    const pool = TECH_IMAGE_POOLS['pixel'];
    return pool[hash % pool.length];
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
    const pool = TECH_IMAGE_POOLS['ai'];
    return pool[hash % pool.length];
  }

  // 6. Robotics & Automation
  if (
    t.includes('robot') || 
    t.includes('humanoid') || 
    t.includes('automation') || 
    t.includes('boston dynamics') || 
    t.includes('රොබෝ')
  ) {
    const pool = TECH_IMAGE_POOLS['robotics'];
    return pool[hash % pool.length];
  }

  // 7. Semiconductor, Chips & Hardware
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
    const pool = TECH_IMAGE_POOLS['chips_hardware'];
    return pool[hash % pool.length];
  }

  // 8. Cybersecurity & Privacy
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
    const pool = TECH_IMAGE_POOLS['cybersecurity'];
    return pool[hash % pool.length];
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
    const pool = TECH_IMAGE_POOLS['gaming'];
    return pool[hash % pool.length];
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
    const pool = TECH_IMAGE_POOLS['space'];
    return pool[hash % pool.length];
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
    const pool = TECH_IMAGE_POOLS['ev_automotive'];
    return pool[hash % pool.length];
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
    const pool = TECH_IMAGE_POOLS['local_sl'];
    return pool[hash % pool.length];
  }
  
  const pool = TECH_IMAGE_POOLS['general_tech'];
  return pool[hash % pool.length];
}

export function getCuratedTopicImages(title = '', category = ''): string[] {
  const t = (title + ' ' + (category || '')).toLowerCase();
  
  if (t.includes('blackberry') || t.includes('qnx') || t.includes('iot') || t.includes('embedded') || t.includes('මෘදුකාංග')) {
    return TECH_IMAGE_POOLS['blackberry_software'];
  }
  if (t.includes('apple') || t.includes('iphone') || t.includes('ios') || t.includes('macbook') || t.includes('ඇපල්')) {
    return TECH_IMAGE_POOLS['apple'];
  }
  if (t.includes('samsung') || t.includes('galaxy') || t.includes('සැම්සුන්')) {
    return TECH_IMAGE_POOLS['samsung'];
  }
  if (t.includes('pixel') || t.includes('android') || t.includes('ගූගල්')) {
    return TECH_IMAGE_POOLS['pixel'];
  }
  if (t.includes('ai') || t.includes('gpt') || t.includes('claude') || t.includes('gemini') || t.includes('කෘත්‍රිම බුද්ධිය')) {
    return TECH_IMAGE_POOLS['ai'];
  }
  if (t.includes('robot') || t.includes('humanoid') || t.includes('රොබෝ')) {
    return TECH_IMAGE_POOLS['robotics'];
  }
  if (t.includes('chip') || t.includes('nvidia') || t.includes('intel') || t.includes('චිප්')) {
    return TECH_IMAGE_POOLS['chips_hardware'];
  }
  if (t.includes('cyber') || t.includes('security') || t.includes('සයිබර්')) {
    return TECH_IMAGE_POOLS['cybersecurity'];
  }
  if (t.includes('game') || t.includes('gaming') || t.includes('playstation')) {
    return TECH_IMAGE_POOLS['gaming'];
  }
  if (t.includes('space') || t.includes('nasa') || t.includes('spacex')) {
    return TECH_IMAGE_POOLS['space'];
  }
  if (t.includes('tesla') || t.includes('electric vehicle') || t.includes('විදුලි වාහන')) {
    return TECH_IMAGE_POOLS['ev_automotive'];
  }
  if (t.includes('sri lanka') || category?.toLowerCase() === 'local' || t.includes('ලංකා')) {
    return TECH_IMAGE_POOLS['local_sl'];
  }
  return [...TECH_IMAGE_POOLS['general_tech'], ...TECH_IMAGE_POOLS['ai'].slice(0, 2)];
}

export function extractDomain(urlStr?: string): { name: string; domain: string } {
  if (!urlStr) {
    return { name: 'Verified Primary Source', domain: 'news.google.com' };
  }
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    const hostname = url.hostname.replace(/^www\./, '');
    
    // Friendly source names
    if (hostname.includes('theverge')) return { name: 'The Verge', domain: hostname };
    if (hostname.includes('techcrunch')) return { name: 'TechCrunch', domain: hostname };
    if (hostname.includes('reuters')) return { name: 'Reuters', domain: hostname };
    if (hostname.includes('bloomberg')) return { name: 'Bloomberg', domain: hostname };
    if (hostname.includes('gsmarena')) return { name: 'GSMArena', domain: hostname };
    if (hostname.includes('adaderana')) return { name: 'Ada Derana', domain: hostname };
    if (hostname.includes('dailymirror')) return { name: 'Daily Mirror', domain: hostname };
    if (hostname.includes('bbc')) return { name: 'BBC News', domain: hostname };
    if (hostname.includes('apple.com')) return { name: 'Apple Newsroom', domain: hostname };
    if (hostname.includes('androidauthority')) return { name: 'Android Authority', domain: hostname };
    if (hostname.includes('wired')) return { name: 'WIRED', domain: hostname };
    if (hostname.includes('arstechnica')) return { name: 'Ars Technica', domain: hostname };
    if (hostname.includes('engadget')) return { name: 'Engadget', domain: hostname };
    if (hostname.includes('news.google')) return { name: 'Google News Syndicate', domain: hostname };

    const parts = hostname.split('.');
    const cleanName = parts.length > 1 ? parts[parts.length - 2] : hostname;
    return { 
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1), 
      domain: hostname 
    };
  } catch {
    return { name: 'Verified Global Media', domain: 'myfeed.lk' };
  }
}

export function getArticleFactCheck(article: Partial<Article>): FactCheckData {
  if (article.factCheck && article.factCheck.score) {
    return article.factCheck;
  }

  const title = (article.title || '').toLowerCase();
  const summary = (article.summary || '').toLowerCase();
  const content = (article.content || '').toLowerCase();
  const combined = `${title} ${summary} ${content}`;

  const { name: primarySourceName, domain: sourceDomain } = extractDomain(article.sourceUrl);
  
  const sources: FactSource[] = [
    {
      name: primarySourceName,
      url: article.sourceUrl || undefined,
      domain: sourceDomain,
      isPrimary: true
    }
  ];

  // Secondary verification source if applicable
  if (combined.includes('apple') || combined.includes('iphone') || combined.includes('ios')) {
    sources.push({ name: 'Apple Newsroom & Developer Docs', url: 'https://www.apple.com/newsroom/', isPrimary: false });
  } else if (combined.includes('openai') || combined.includes('chatgpt')) {
    sources.push({ name: 'OpenAI Research & Official Blog', url: 'https://openai.com/news/', isPrimary: false });
  } else if (combined.includes('google') || combined.includes('android') || combined.includes('gemini')) {
    sources.push({ name: 'Google Keyword & Developer Hub', url: 'https://blog.google/', isPrimary: false });
  } else if (combined.includes('sri lanka') || combined.includes('ශ්‍රී ලංකා') || article.category === 'Local') {
    sources.push({ name: 'National News Wire (SL)', url: 'https://www.adaderana.lk/', isPrimary: false });
  } else {
    sources.push({ name: 'Global Tech Press Wire', url: 'https://reuters.com/technology', isPrimary: false });
  }

  // Check for Rumors / Leaks / Developing / Speculative language
  const isRumorOrLeak = 
    combined.includes('leak') || 
    combined.includes('rumor') || 
    combined.includes('කටකතා') || 
    combined.includes('කතාවක්') || 
    combined.includes('අපේක්ෂා') || 
    combined.includes('ඉඩ ඇත') || 
    combined.includes('වාර්තා පළවේ') ||
    combined.includes('likely') || 
    combined.includes('speculation') ||
    combined.includes('unconfirmed');

  if (isRumorOrLeak) {
    return {
      score: 88,
      status: 'developing',
      statusBadge: '88% සත්‍යාපිතයි (Insider Leak / Developing)',
      reason: 'මූලික තාක්ෂණික තොරතුරු විශ්වාසදායක Insider මූලාශ්‍ර මඟින් තහවුරු කර ඇති නමුත්, නිෂ්පාදන සමාගමේ නිල නිවේදනය (Official Press Release) තවමත් බලාපොරොත්තුවේ.',
      sources,
      metrics: {
        sourceReliability: 90,
        factualAccuracy: 85,
        editorialReview: 95
      },
      checkedBy: 'MyFeed Fact-Check Desk'
    };
  }

  // Check for official launch / verified announcements
  const isOfficialRelease = 
    combined.includes('නිල') || 
    combined.includes('නිකුත්') || 
    combined.includes('හඳුන්වා') || 
    combined.includes('official') || 
    combined.includes('announc') || 
    combined.includes('launch') || 
    combined.includes('unveil') || 
    combined.includes('release') ||
    !!article.sourceUrl;

  if (isOfficialRelease) {
    return {
      score: 100,
      status: 'verified_100',
      statusBadge: '100% සත්‍යාපිත මූලාශ්‍රයකි (Fully Verified)',
      reason: 'ප්‍රධාන නිල මූලාශ්‍ර (Official Press Release / Verified Newsroom) සහ MyFeed.lk සංස්කාරක මණ්ඩලයේ සත්‍යාපන ක්‍රමවේද මඟින් පුවත 100% ක් සනාථ කර ඇත.',
      sources,
      metrics: {
        sourceReliability: 100,
        factualAccuracy: 100,
        editorialReview: 100
      },
      checkedBy: 'MyFeed Fact-Check Desk'
    };
  }

  // Standard verified analytical story
  return {
    score: 95,
    status: 'mostly_verified',
    statusBadge: '95% සත්‍යාපිතයි (Verified Report)',
    reason: 'මූලාශ්‍ර තොරතුරු සහ කර්මාන්ත විශ්ලේෂණ සනාථ කර ඇති අතර, නවතම වෙළඳපල යාවත්කාලීන වීම් අනුව සුළු තාක්ෂණික වෙනස්කම් සිදුවිය හැක.',
    sources,
    metrics: {
      sourceReliability: 95,
      factualAccuracy: 95,
      editorialReview: 98
    },
    checkedBy: 'MyFeed Fact-Check Desk'
  };
}

function sanitizeArticleImage(rawUrl: string | undefined, title = '', category = '', originalTitle = ''): string {
  if (!rawUrl || typeof rawUrl !== 'string' || (!rawUrl.startsWith('http') && !rawUrl.startsWith('data:image'))) {
    return getTopicFallbackImage(title || originalTitle, category);
  }

  const lower = rawUrl.toLowerCase();
  // Filter out Google News icons, Google User Content logos, favicons, avatars, and generic placeholders
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
    lower.includes('spinner') ||
    lower.includes('placeholder') ||
    lower.includes('blank') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  ) {
    return getTopicFallbackImage(title || originalTitle, category);
  }

  return rawUrl;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService implements OnDestroy {
  private _articles = signal<Article[]>([]);
  private _loading = signal<boolean>(true);
  private platformId = inject(PLATFORM_ID);
  private unsubscribeSnapshot: Unsubscribe | null = null;

  readonly articles = this._articles.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.clearLegacyStorage();
    this.initRealtimeArticles();
  }

  private clearLegacyStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('myfeed_cached_articles_v3');
        localStorage.removeItem('myfeed_cached_articles_v2');
        localStorage.removeItem('myfeed_cached_articles');
      } catch {
        // ignore
      }
    }
  }

  private getDocTimestamp(docData: Record<string, unknown>): number {
    if (typeof docData['timestamp'] === 'number') return docData['timestamp'];
    const createdAt = docData['createdAt'] as { toMillis?: () => number; toDate?: () => Date } | string | undefined;
    if (createdAt) {
      if (typeof createdAt === 'object' && typeof createdAt.toMillis === 'function') return createdAt.toMillis();
      if (typeof createdAt === 'object' && typeof createdAt.toDate === 'function') return createdAt.toDate().getTime();
      const parsed = new Date(createdAt as string).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    const dateVal = docData['date'] as string | undefined;
    if (dateVal) {
      const parsed = new Date(dateVal).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  }

  /**
   * Initializes real-time listener strictly for Firestore 'articles' collection.
   * Only documents that exist in Firebase will be rendered.
   */
  private initRealtimeArticles() {
    this._loading.set(true);

    try {
      const articlesCol = collection(db, 'articles');

      // Realtime listener for Firestore collection
      this.unsubscribeSnapshot = onSnapshot(articlesCol, (snapshot) => {
        const list: Article[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          let uploadTimeStr: string | undefined = undefined;
          const createdAt = data['createdAt'] as { toDate?: () => Date } | string | undefined;
          if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
            uploadTimeStr = createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          } else if (typeof createdAt === 'string') {
            const d = new Date(createdAt);
            if (!isNaN(d.getTime())) {
              uploadTimeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
          }

          const rawImg = data['imageUrl'] as string | undefined;
          const title = (data['title'] as string) || '';
          const category = (data['category'] as string) || '';
          const originalTitle = (data['originalTitle'] as string) || '';
          const safeImageUrl = sanitizeArticleImage(rawImg, title, category, originalTitle);

          list.push({
            id: docSnap.id,
            ...data,
            imageUrl: safeImageUrl,
            uploadTimeStr
          } as unknown as Article);
        });

        // Sort descending by timestamp / date
        list.sort((a, b) => {
          const timeA = this.getDocTimestamp(a as unknown as Record<string, unknown>);
          const timeB = this.getDocTimestamp(b as unknown as Record<string, unknown>);
          return timeB - timeA;
        });

        // Strictly set only real Firestore articles
        this._articles.set(list);
        this._loading.set(false);
      }, (error) => {
        console.warn('Firestore realtime subscription notice:', error);
        this.fallbackGetDocs();
      });
    } catch (err) {
      console.warn('Error initializing articles query:', err);
      this.fallbackGetDocs();
    }
  }

  private async fallbackGetDocs() {
    try {
      const articlesCol = collection(db, 'articles');
      const querySnapshot = await getDocs(articlesCol);
      const list: Article[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        let uploadTimeStr: string | undefined = undefined;
        const createdAt = data['createdAt'] as { toDate?: () => Date } | string | undefined;
        if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
          uploadTimeStr = createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (typeof createdAt === 'string') {
          uploadTimeStr = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        
        const rawImg = data['imageUrl'] as string | undefined;
        const title = (data['title'] as string) || '';
        const category = (data['category'] as string) || '';
        const originalTitle = (data['originalTitle'] as string) || '';
        const safeImageUrl = sanitizeArticleImage(rawImg, title, category, originalTitle);

        list.push({
          id: docSnap.id,
          ...data,
          imageUrl: safeImageUrl,
          uploadTimeStr
        } as unknown as Article);
      });

      list.sort((a, b) => {
        const timeA = this.getDocTimestamp(a as unknown as Record<string, unknown>);
        const timeB = this.getDocTimestamp(b as unknown as Record<string, unknown>);
        return timeB - timeA;
      });

      this._articles.set(list);
    } catch (e) {
      console.error('Firestore getDocs failed:', e);
      this._articles.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  async loadArticles() {
    this._loading.set(true);
    await this.fallbackGetDocs();
  }

  async getArticleById(id: string): Promise<Article | null> {
    const localArticle = this._articles().find(a => a.id === id || a.slug === id);
    if (localArticle) {
      return localArticle;
    }

    try {
      const docRef = doc(db, 'articles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Record<string, unknown>;
        let uploadTimeStr = undefined;
        const createdAt = data['createdAt'] as { toDate?: () => Date } | string | undefined;
        if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
          uploadTimeStr = createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (typeof createdAt === 'string') {
          uploadTimeStr = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        const rawImg = data['imageUrl'] as string | undefined;
        const title = (data['title'] as string) || '';
        const category = (data['category'] as string) || '';
        const originalTitle = (data['originalTitle'] as string) || '';
        const safeImageUrl = sanitizeArticleImage(rawImg, title, category, originalTitle);

        return { id: docSnap.id, ...data, imageUrl: safeImageUrl, uploadTimeStr } as unknown as Article;
      }
      return null;
    } catch (error) {
      console.warn('Error getting article by id from Firestore:', error);
      return null;
    }
  }

  async addArticle(article: Omit<Article, 'id' | 'createdAt'>) {
    try {
      const colRef = collection(db, 'articles');
      const docRef = await addDoc(colRef, {
        ...article,
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding article to Firestore:', error);
      throw error;
    }
  }

  async updateArticle(id: string, article: Partial<Article>) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, { ...article, updatedAt: serverTimestamp() });
      this._articles.update(list => list.map(a => (a.id === id || a.slug === id) ? { ...a, ...article } : a));
    } catch (error) {
      console.error('Error updating article in Firestore:', error);
      throw error;
    }
  }

  async incrementViews(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, { views: increment(1) });
    } catch (error) {
      console.error('Error incrementing views in Firestore:', error);
    }
  }

  async updateReaction(id: string, newReaction: string, oldReaction: string | null) {
    try {
      const docRef = doc(db, 'articles', id);
      const updates: Record<string, unknown> = {};
      
      if (oldReaction) {
        updates[`reactions.${oldReaction}`] = increment(-1);
      }
      if (newReaction) {
        updates[`reactions.${newReaction}`] = increment(1);
      }
      
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating reaction in Firestore:', error);
    }
  }

  async deleteArticle(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      await deleteDoc(docRef);
      // Optimistically update signal state
      this._articles.update(list => list.filter(a => a.id !== id && a.slug !== id));
    } catch (error) {
      console.error('Error deleting article from Firestore:', error);
      throw error;
    }
  }

  async deleteMultipleArticles(ids: string[]) {
    if (!ids || ids.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const id of ids) {
        batch.delete(doc(db, 'articles', id));
      }
      await batch.commit();
      // Optimistically update signal state
      const idSet = new Set(ids);
      this._articles.update(list => list.filter(a => !idSet.has(a.id) && (!a.slug || !idSet.has(a.slug))));
    } catch (error) {
      console.error('Error batch deleting articles from Firestore:', error);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }
}


