const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

const quizLogic = `
let isQuizGenerating = false;
let lastQuizGeneratedDate = '';

async function executeDailyQuizGeneration(trigger: 'scheduled') {
  if (isQuizGenerating) return;
  isQuizGenerating = true;
  console.log('[Quiz-Generator] Starting daily 10 quizzes generation...');
  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.warn('[Quiz-Generator] GEMINI_API_KEY missing.');
      return;
    }

    const prompt = \`You are a Sinhala content creator. Generate exactly 10 short and engaging quizzes in Sinhala for a mobile app. 
Each quiz should be on a different topic (e.g. Technology, Sri Lanka, World Knowledge, Cybersecurity, Science, Pop Culture, etc.).
For each quiz, provide 3 multiple-choice questions.

Return the result STRICTLY as a JSON array of objects with this structure (no markdown fences, just JSON):
[
  {
    "id": "q_\${random_string}",
    "title": "English Title",
    "titleSinhala": "Sinhala Title",
    "category": "Category in Sinhala (e.g. තාක්ෂණය)",
    "categoryColor": "one of: bg-[#FF9500]/15 text-[#FF9500], bg-[#34C759]/15 text-[#34C759], bg-[#FF3B30]/15 text-[#FF3B30], bg-[#007AFF]/15 text-[#007AFF], bg-[#AF52DE]/15 text-[#AF52DE]",
    "points": 50,
    "durationMins": 2,
    "questions": [
      {
        "text": "Question in Sinhala?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctIndex": 0
      }
    ]
  }
]\`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    let generatedQuizzes = [];
    try {
      const text = response.text || '';
      const cleanJson = text.replace(/^\\\`\\\`(?:json)?/m, '').replace(/\\\`\\\`$/m, '').trim();
      generatedQuizzes = JSON.parse(cleanJson);
    } catch(e) {
      console.error('[Quiz-Generator] JSON Parse Error:', e);
      return;
    }

    if (!Array.isArray(generatedQuizzes) || generatedQuizzes.length === 0) {
      console.warn('[Quiz-Generator] Invalid format returned.');
      return;
    }

    const db = getServerDb();

    // Delete old quizzes
    const oldSnap = await serverGetDocs(serverCollection(db, 'quizzes'));
    for (const doc of oldSnap.docs) {
      await serverDeleteDoc(serverDoc(db, 'quizzes', doc.id));
    }

    // Insert new quizzes
    for (const q of generatedQuizzes) {
      q.id = 'quiz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      await serverSetDoc(serverDoc(db, 'quizzes', q.id), q);
    }

    console.log(\`[Quiz-Generator] Successfully generated and published \${generatedQuizzes.length} new quizzes.\`);
  } catch (err) {
    console.error('[Quiz-Generator] Failed to generate quizzes:', err);
  } finally {
    isQuizGenerating = false;
  }
}
`;

code = code.replace(
  "// Colombo / Sri Lanka Timezone Helpers",
  quizLogic + "\n// Colombo / Sri Lanka Timezone Helpers"
);

fs.writeFileSync('src/server.ts', code);
