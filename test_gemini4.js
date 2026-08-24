const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const models = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest', 'gemini-pro-latest'];
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
