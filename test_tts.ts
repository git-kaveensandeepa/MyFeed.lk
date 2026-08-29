import { GoogleGenAI } from '@google/genai';

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-tts-preview',
    contents: 'Say the following: WOOHOO This is so much fun!',
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore"
          }
        }
      }
    }
  });

  const audioContent = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (audioContent) {
    console.log('Got audio content, length:', audioContent.length);
  } else {
    console.log('No audio content found. Text:', response.text);
  }
}
main().catch(console.error);
