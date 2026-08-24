const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

// 1. Import
code = code.replace("import { GoogleGenAI, Type } from '@google/genai';", "import Groq from 'groq-sdk';");

// 2. Process variable
code = code.replace(/const geminiApiKey = process\.env\['GEMINI_API_KEY'\];/g, "const geminiApiKey = process.env['GROQ_API_KEY'];");

// 3. Translation
let translationMatch = `const ai = new GoogleGenAI({ apiKey: geminiApiKey });`;
let groqInit = `const ai = new Groq({ apiKey: geminiApiKey });`;
code = code.replace(new RegExp(translationMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), groqInit);

// 4. replace `generateContent` calls.
// Since the structure of generateContent vs groq.chat.completions.create is different, I need to do this carefully.
// Let's use a regex or custom replacements for each block.
