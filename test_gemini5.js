const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const models = ['gemini-3.1-flash-lite', 'gemma-4-31b-it', 'gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash-lite'];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: 'Hello' });
      console.log(m, "SUCCESS:", res.text.substring(0, 20));
      break;
    } catch (e) {
      console.error(m, "ERROR:", e.message);
    }
  }
}
run();
