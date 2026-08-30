import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const DATABASE_ID = "ai-studio-myfeedlk-576ec80c-841c-44ac-9b2a-8b4ec4ec22e7";
const db = admin.firestore(DATABASE_ID);

// 100% Free, Official Direct RSS Feeds
const RSS_FEEDS = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'AI' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', category: 'AI' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', category: 'AI' },
  { name: 'The Verge Tech', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
  { name: 'TechCrunch Tech', url: 'https://techcrunch.com/feed/', category: 'Tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Tech' },
  { name: '9to5Google', url: 'https://9to5google.com/feed/', category: 'Tech' },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/', category: 'Tech' },
  { name: 'Daily FT Tech', url: 'https://www.ft.lk/rss/it-telecom-technology', category: 'Local' },
  { name: 'Ada Derana Biz', url: 'http://bizenglish.adaderana.lk/feed/', category: 'Local' }
];

function getTopicFallbackImage(title = '', category = '') {
  const t = (title + ' ' + category).toLowerCase();
  if (t.includes('apple') || t.includes('iphone') || t.includes('ios') || t.includes('macbook')) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('samsung') || t.includes('galaxy') || t.includes('android')) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80';
  }
  if (t.includes('ai') || t.includes('gemini') || t.includes('openai') || t.includes('chatgpt')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
}

function parseRssXml(xmlText, defaultCategory = 'Tech') {
  const items = [];
  const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title(?:\s+[^>]*)?>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/is);
    const title = (titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '').trim();

    const linkMatch = itemXml.match(/<link(?:\s+[^>]*)?>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/link>/is);
    const link = (linkMatch ? (linkMatch[1] || linkMatch[2] || '') : '').trim();

    const descMatch = itemXml.match(/<description(?:\s+[^>]*)?>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/description>/is);
    const description = (descMatch ? (descMatch[1] || descMatch[2] || '') : '').replace(/<[^>]+>/g, ' ').trim();

    const pubDateMatch = itemXml.match(/<pubDate(?:\s+[^>]*)?>(.*?)<\/pubDate>/is);
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

    let imageUrl = '';
    const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
    const mediaContentMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
    const imgTagMatch = itemXml.match(/<img[^>]*src=["']([^"']+)["']/i);
    if (enclosureMatch) imageUrl = enclosureMatch[1];
    else if (mediaContentMatch) imageUrl = mediaContentMatch[1];
    else if (imgTagMatch) imageUrl = imgTagMatch[1];

    if (!imageUrl) imageUrl = getTopicFallbackImage(title, defaultCategory);

    if (title && (link || description)) {
      items.push({ title, link, description, pubDate, imageUrl, category: defaultCategory });
    }
  }
  return items;
}

// Main Core Logic: Process News Feed
async function processLatestNews() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("GEMINI_API_KEY environment variable is missing!");
    return { success: false, error: "Missing GEMINI_API_KEY" };
  }

  const ai = new GoogleGenAI({ apiKey });
  const rawItems = [];

  for (const feed of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MyFeedLK/2.0' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseRssXml(text, feed.category);
        rawItems.push(...parsed.slice(0, 3));
      }
    } catch (e) {
      logger.warn(`Error fetching ${feed.name}:`, e.message);
    }
  }

  logger.info(`Fetched ${rawItems.length} candidate news items from RSS feeds.`);

  // Get existing recent titles to prevent duplicates
  const existingTitles = new Set();
  try {
    const recentSnap = await db.collection("news").orderBy("createdAt", "desc").limit(60).get();
    recentSnap.forEach(doc => {
      const data = doc.data();
      if (data.sourceTitle) existingTitles.add(data.sourceTitle.toLowerCase().trim());
      if (data.title) existingTitles.add(data.title.toLowerCase().trim());
    });
  } catch (e) {
    logger.warn("Could not query existing news titles:", e.message);
  }

  const newItems = rawItems.filter(item => !existingTitles.has(item.title.toLowerCase().trim())).slice(0, 3);
  logger.info(`Processing ${newItems.length} brand new articles with Gemini AI...`);

  let addedCount = 0;
  for (const item of newItems) {
    try {
      const prompt = `You are a chief tech journalist and editor for MyFeed.lk.
Translate and write an exhaustive, high-quality, long-form technology news article in fluent, professional Sinhala (500+ words) with rich HTML (<h2>, <p class="lead">, <p>, <ul>, <li>).

SOURCE ARTICLE:
Title: ${item.title}
Summary: ${item.description}
Category: ${item.category}

Return ONLY valid JSON matching this schema:
{
  "sinhalaTitle": "ආකර්ෂණීය සිංහල සිරස්තලය",
  "sinhalaDescription": "වාක්‍ය 2-3ක විධායක සාරාංශය",
  "sinhalaFullContent": "<p class=\\"lead\\">...</p><h2>ප්‍රධාන කරුණු</h2><p>...</p>",
  "category": "${item.category}"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sinhalaTitle: { type: Type.STRING },
              sinhalaDescription: { type: Type.STRING },
              sinhalaFullContent: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent', 'category']
          }
        }
      });

      const parsed = JSON.parse(response.text);
      await db.collection("news").add({
        title: parsed.sinhalaTitle || item.title,
        description: parsed.sinhalaDescription || item.description,
        content: parsed.sinhalaFullContent || `<p>${item.description}</p>`,
        category: parsed.category || item.category || 'Tech',
        sourceTitle: item.title,
        sourceUrl: item.link || '',
        imageUrl: item.imageUrl || getTopicFallbackImage(item.title, item.category),
        views: 0,
        likes: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      addedCount++;
      logger.info(`Successfully added article: "${parsed.sinhalaTitle}"`);
    } catch (err) {
      logger.error(`Failed to process item: ${item.title}`, err);
    }
  }

  return { success: true, processedCount: addedCount };
}

// -------------------------------------------------------------
// 1️⃣ CLOUD FUNCTION: Auto News Scanner (Runs every 5 minutes)
// -------------------------------------------------------------
export const scanNewsEvery5Minutes = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Asia/Colombo",
    memory: "512MiB",
    timeoutSeconds: 180,
    retryCount: 1
  },
  async (event) => {
    logger.info("Starting scheduled 5-minute news scan...");
    const result = await processLatestNews();
    logger.info("Completed 5-minute news scan.", result);
  }
);

// -------------------------------------------------------------
// 2️⃣ CLOUD FUNCTION: 3:30 AM Daily Morning Tech Summary & Audio Script
// -------------------------------------------------------------
export const dailyTechSummaryAt330AM = onSchedule(
  {
    schedule: "30 3 * * *",
    timeZone: "Asia/Colombo",
    memory: "512MiB",
    timeoutSeconds: 180
  },
  async (event) => {
    logger.info("Starting 3:30 AM Daily Tech Summary generation...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.error("GEMINI_API_KEY missing!");
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Fetch top 8 news from past 24 hours
    const recentSnap = await db.collection("news").orderBy("createdAt", "desc").limit(8).get();
    const articles = [];
    recentSnap.forEach(d => {
      const data = d.data();
      articles.push(`- ${data.title}: ${data.description}`);
    });

    if (articles.length === 0) {
      logger.info("No recent news found for summary.");
      return;
    }

    const todayStr = new Date().toLocaleDateString('si-LK', { timeZone: 'Asia/Colombo' });
    const prompt = `You are Chief News Anchor & AI Editor at MyFeed.lk.
Create a Daily Morning Tech Digest (දෛනික උදෑසන තාක්ෂණික පුවත් සාරාංශය) in rich HTML and a spoken Sinhala Radio Voice script for audio broadcast.

RECENT STORIES:
${articles.join('\n')}

Output valid JSON:
{
  "summaryTitle": "අද දවසේ ප්‍රධාන තාක්ෂණික පුවත් සාරාංශය (${todayStr})",
  "summaryHtml": "<h3>🌅 උදෑසන පුවත් විග්‍රහය</h3><p>...</p>",
  "spokenAudioScript": "සුබ උදෑසනක්! මේ MyFeed.lk අද දවසේ ප්‍රධාන තාක්ෂණික පුවත් සාරාංශය..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryTitle: { type: Type.STRING },
            summaryHtml: { type: Type.STRING },
            spokenAudioScript: { type: Type.STRING }
          },
          required: ['summaryTitle', 'summaryHtml', 'spokenAudioScript']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    await db.collection("daily_summaries").add({
      title: parsed.summaryTitle,
      htmlContent: parsed.summaryHtml,
      audioScript: parsed.spokenAudioScript,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Successfully generated and saved 3:30 AM Daily Summary!");
  }
);

// -------------------------------------------------------------
// 3️⃣ MANUAL HTTP TRIGGER (For instant testing via browser/curl)
// -------------------------------------------------------------
export const manualNewsScan = onRequest(
  {
    cors: true,
    timeoutSeconds: 120
  },
  async (req, res) => {
    logger.info("Manual news scan triggered via HTTP request.");
    const result = await processLatestNews();
    res.json(result);
  }
);
