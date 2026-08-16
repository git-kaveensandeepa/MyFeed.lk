import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
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

function getNormalizedKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
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
Source: ${article.url}`;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`Generating Long Sinhala Article (Attempt ${attempt}/${maxAttempts})...`);
      
      const genResponse = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
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
              }
            },
            required: ['sinhalaTitle', 'sinhalaDescription', 'sinhalaFullContent']
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
      if (attempt < maxAttempts) {
        const waitMs = attempt * 10000;
        console.log(`Waiting ${waitMs / 1000}s before retrying Gemini...`);
        await new Promise((res) => setTimeout(res, waitMs));
      }
    }
  }

  return null;
}

async function runAutoNewsUpload() {
  console.log('=== Starting Automated Long-Form Sinhala News Fetch & Firebase Upload ===');
  const newsApiKey = process.env['NEWS_API_KEY'];
  const geminiApiKey = process.env['GEMINI_API_KEY'];

  if (!newsApiKey) {
    console.error('ERROR: NEWS_API_KEY is not set in environment.');
    process.exit(1);
  }
  if (!geminiApiKey) {
    console.error('ERROR: GEMINI_API_KEY is not set in environment.');
    process.exit(1);
  }

  try {
    // 1. Fetch all existing articles from Firestore to build robust deduplication index
    console.log('Fetching existing articles from Firestore for duplicate detection...');
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(150));
    const querySnapshot = await getDocs(q);
    
    const existingSourceUrls = new Set();
    const existingImageUrls = new Set();
    const existingOriginalTitles = new Set();
    const existingSinhalaTitles = new Set();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.sourceUrl) existingSourceUrls.add(data.sourceUrl.trim().toLowerCase());
      if (data.imageUrl && !data.imageUrl.startsWith('data:image')) {
        existingImageUrls.add(data.imageUrl.split('?')[0].trim().toLowerCase());
      }
      if (data.originalTitle) existingOriginalTitles.add(getNormalizedKey(data.originalTitle));
      if (data.title) existingSinhalaTitles.add(data.title.trim().toLowerCase());
    });

    console.log(`Indexed existing records: ${existingSourceUrls.size} URLs, ${existingImageUrls.size} Images, ${existingSinhalaTitles.size} Titles.`);

    // 2. Fetch fresh top headlines from NewsAPI
    console.log('Fetching fresh technology headlines from NewsAPI...');
    const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&category=technology&pageSize=10&apiKey=${newsApiKey}`);
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const articles = (data.articles || []).filter((a) => a.title && a.description && a.urlToImage);

    if (articles.length === 0) {
      console.log('No valid technology articles found.');
      return;
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let uploadedCount = 0;

    for (let index = 0; index < articles.length; index++) {
      const article = articles[index];
      const sourceUrl = (article.url || '').trim().toLowerCase();
      const imageUrl = (article.urlToImage || '').split('?')[0].trim().toLowerCase();
      const normalizedTitleKey = getNormalizedKey(article.title);

      // Strict duplicate check across URL, Image, and Title
      if (existingSourceUrls.has(sourceUrl)) {
        console.log(`[Duplicate Skip] Source URL already exists: "${article.title}"`);
        continue;
      }
      if (existingImageUrls.has(imageUrl)) {
        console.log(`[Duplicate Skip] Image URL already exists: "${article.title}"`);
        continue;
      }
      if (existingOriginalTitles.has(normalizedTitleKey)) {
        console.log(`[Duplicate Skip] English title key already exists: "${article.title}"`);
        continue;
      }

      console.log(`\n[${index + 1}/${articles.length}] Generating Long Sinhala Article for: "${article.title}"`);
      
      const fullArticle = await generateFullSinhalaArticle(ai, article);

      if (!fullArticle) {
        console.warn(`Could not generate full Sinhala content for "${article.title}". Skipping.`);
        continue;
      }

      const formattedContent = fullArticle.sinhalaFullContent + 
        `<div class="mt-10 pt-6 border-t border-black/10 dark:border-white/10 text-sm font-medium">` +
        `<p><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-bold">` +
        `<span>මුල් පුවත් වාර්තාව කියවන්න (Source: ${article.source?.name || 'External Tech News'}) &rarr;</span>` +
        `</a></p></div>`;

      const articleDoc = {
        title: fullArticle.sinhalaTitle,
        summary: fullArticle.sinhalaDescription,
        content: formattedContent,
        category: 'Tech',
        imageUrl: article.urlToImage || 'https://picsum.photos/seed/tech/800/600',
        date: new Date(article.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '5 min read',
        sourceUrl: article.url || '',
        originalTitle: article.title || '',
        authorType: 'ai',
        isAiGenerated: true,
        createdAt: serverTimestamp()
      };

      // Upload to Firebase Firestore
      const colRef = collection(db, 'articles');
      const docRef = await addDoc(colRef, articleDoc);
      console.log(`✓ Successfully uploaded NEW Long Sinhala Article to Firebase! (Doc ID: ${docRef.id})`);
      console.log(`  Title: ${fullArticle.sinhalaTitle}`);
      uploadedCount++;

      existingSourceUrls.add(sourceUrl);
      existingImageUrls.add(imageUrl);
      existingOriginalTitles.add(normalizedTitleKey);
      existingSinhalaTitles.add(fullArticle.sinhalaTitle.trim().toLowerCase());

      // Upload 1 deep long article per scheduled run to conserve quota and maintain quality
      if (uploadedCount >= 1) {
        console.log('\nTarget quota (1 long article per run) reached. Done.');
        break;
      }

      await new Promise((res) => setTimeout(res, 5000));
    }

    console.log(`\n=== Finished run. Total Long Sinhala Articles uploaded: ${uploadedCount} ===`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during auto upload:', err);
    process.exit(1);
  }
}

runAutoNewsUpload();
