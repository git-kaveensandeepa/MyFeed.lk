const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

// Replace executeDailyQuizGeneration with executeDailyBytesGeneration
const oldGenRegex = /let isQuizGenerating = false;[\s\S]*?isQuizGenerating = false;\n  \}\n\}/;
const newGen = `let isBytesGenerating = false;
let lastBytesGeneratedDate = '';

async function executeDailyBytesGeneration(trigger: 'scheduled') {
  if (isBytesGenerating) return;
  isBytesGenerating = true;
  console.log('[Bytes-Generator] Starting daily 60s bytes generation...');
  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.warn('[Bytes-Generator] GEMINI_API_KEY missing.');
      return;
    }

    const prompt = \`You are an expert tech educator in Sri Lanka. Generate exactly 6 fresh, engaging, and highly informative "60-Second Bytes" (flashcards) in Sinhala about modern Technology, AI, Cloud, Cybersecurity, Web3, or Tech Careers.
Keep the Sinhala natural and easy to read. 

Return the result STRICTLY as a JSON array of objects with this structure (no markdown fences, just JSON):
[
  {
    "id": "b_random_string",
    "topic": "English Topic Name (e.g. AI Hallucination)",
    "category": "English Category (e.g. AI Concepts)",
    "icon": "material-icon-name (e.g. psychology, bolt, terminal)",
    "question": "Question in Sinhala?",
    "answer": "Clear, concise answer in Sinhala.",
    "sinhalaNote": "A very short 1-line catchy tip in Sinhala/English mix"
  }
]\`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    let generatedBytes = [];
    try {
      const text = response.text || '';
      const cleanJson = text.replace(/^\\\`\\\`(?:json)?/m, '').replace(/\\\`\\\`$/m, '').trim();
      generatedBytes = JSON.parse(cleanJson);
    } catch(e) {
      console.error('[Bytes-Generator] JSON Parse Error:', e);
      return;
    }

    if (!Array.isArray(generatedBytes) || generatedBytes.length === 0) {
      console.warn('[Bytes-Generator] Invalid format returned.');
      return;
    }

    const db = getServerDb();

    // Delete old bytes
    const oldSnap = await serverGetDocs(serverCollection(db, 'bytes'));
    for (const doc of oldSnap.docs) {
      await serverDeleteDoc(serverDoc(db, 'bytes', doc.id));
    }

    // Insert new bytes
    for (const b of generatedBytes) {
      b.id = 'byte_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      await serverSetDoc(serverDoc(db, 'bytes', b.id), b);
    }

    console.log(\`[Bytes-Generator] Successfully generated and published \${generatedBytes.length} new 60s Bytes.\`);
  } catch (err) {
    console.error('[Bytes-Generator] Failed to generate bytes:', err);
  } finally {
    isBytesGenerating = false;
  }
}`;

code = code.replace(oldGenRegex, newGen);

// Replace quiz cron condition
const oldCronRegex = /  \/\/ Daily Quizzes \(4:00 AM and 4:00 PM\)[\s\S]*?await executeDailyQuizGeneration\('scheduled'\);\n  \}/;
const newCron = `  // Daily 60s Bytes (4:00 AM)
  const colomboCron = getColomboDateTimeParts();
  const isBytesTime = colomboCron.timeString === '04:00';
  const currentBytesSlot = colomboCron.dateString + '_' + colomboCron.timeString;
  
  if (isBytesTime && lastBytesGeneratedDate !== currentBytesSlot && !isBytesGenerating) {
    lastBytesGeneratedDate = currentBytesSlot;
    console.log(\`[Bytes-Generator] Triggered at Sri Lanka Time (\${colomboCron.dateString} \${colomboCron.timeString})...\`);
    await executeDailyBytesGeneration('scheduled');
  }`;

code = code.replace(oldCronRegex, newCron);

// Replace /api/admin/quizzes/generate-now to /api/admin/bytes/generate-now
const oldEndpointRegex = /if \(url\.pathname === '\/api\/admin\/quizzes\/generate-now' && request\.method === 'POST'\) \{[\s\S]*?\}\n    \}/;
const newEndpoint = `if (url.pathname === '/api/admin/bytes/generate-now' && request.method === 'POST') {
      try {
        await executeDailyBytesGeneration('scheduled');
        return new Response(JSON.stringify({ success: true, message: '60s Bytes generated successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }`;

code = code.replace(oldEndpointRegex, newEndpoint);

fs.writeFileSync('src/server.ts', code);
