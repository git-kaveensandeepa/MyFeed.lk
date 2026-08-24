const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.list();
    const models = [];
    for await (const m of response) {
      models.push(m.name);
    }
    console.log("AVAILABLE MODELS:", models.join(", "));
  } catch (e) {
    console.error("LIST ERROR:", e.message);
  }
}
run();
