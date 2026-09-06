import { CourseTrackData } from '../../courses.data';

export const AI_TOOLS_COURSE: CourseTrackData = {
  id: 'ai-prompt-engineering',
  title: 'AI Tools & Prompt Engineering (ChatGPT, Gemini)',
  titleSinhala: 'AI මෙවලම් සහ Prompt Engineering: කෘත්‍රිම බුද්ධියෙන් නිවැරදිව වැඩ ගනිමු',
  tag: 'AI / Tech',
  category: 'ai-tech',
  targetAudience: 'everyone',
  targetAudienceLabel: 'සියලු දෙනා සඳහා (සිසුන්, වෘත්තිකයන්, ව්‍යාපාරිකයන්)',
  level: 'Beginner to Advanced (ආරම්භකයේ සිට උසස් මට්ටම දක්වා)',
  icon: 'smart_toy',
  gradient: 'bg-gradient-to-tr from-purple-500 via-indigo-600 to-blue-600',
  badgeName: 'AI Master',
  totalDuration: 'පැය 1.5 (පාඩම් 5)',
  description: 'Master ChatGPT, Gemini, Image Generation, and the art of writing perfect prompts to 10x your productivity.',
  descriptionSinhala: 'ChatGPT, Gemini සහ AI Image Generators නිවැරදිව භාවිතා කරමින් ඔබේ දෛනික වැඩකටයුතු, ඉගෙනීම් සහ ව්‍යාපාරික කටයුතු 10 ගුණයකින් වේගවත් කරගන්නා ආකාරය ඉගෙන ගන්න.',
  lessons: [
  {
    "id": "ai-1",
    "title": "01. AI (කෘත්‍රිම බුද්ධිය) කියන්නේ මොකක්ද? (හැඳින්වීම)",
    "level": "Beginner",
    "duration": "මිනිත්තු 10",
    "summary": "කෘත්‍රිම බුද්ධිය (AI) යනු කුමක්ද සහ එය ක්‍රියාකරන ආකාරය සරලව තේරුම් ගනිමු.",
    "analogy": "AI එකක් කියන්නේ පොත් මිලියන ගණනක් කියවපු, හැමදේම මතක තියෙන සුපිරි මොළයක් වගේ.",
    "content": [
      "AI යනු කුමක්ද? (What is Artificial Intelligence?)",
      "Machine Learning සහ Deep Learning සරලව",
      "Chatbots (ChatGPT, Gemini) ක්‍රියාකරන ආකාරය",
      "AI වලින් කළ හැකි සහ කළ නොහැකි දේවල්"
    ],
    "keyTakeaways": [
      "AI යනු මිනිස් මොළය මෙන් සිතන්නට පුහුණු කළ පරිගණක වැඩසටහනකි.",
      "අප අසන ප්‍රශ්න (Prompts) වල ගුණාත්මකභාවය මත AI පිළිතුරේ නිවැරදිභාවය තීරණය වේ."
    ],
    "exercise": {
      "prompt": "ChatGPT වැනි AI මෘදුකාංග නිර්මාණය කර ඇති තාක්ෂණය සාමාන්‍යයෙන් හඳුන්වන්නේ කුමක් ලෙසද?",
      "hint": "Machine ...",
      "solution": "Machine Learning (හෝ Artificial Intelligence)"
    }
  },
  {
    "id": "ai-2",
    "title": "02. Prompt Engineering මූලධර්ම: AI එකෙන් නිවැරදිව වැඩක් ගන්නේ කොහොමද?",
    "level": "Beginner",
    "duration": "මිනිත්තු 15",
    "summary": "AI එකකට ලබාදෙන විධානය (Prompt) නිවැරදිව සහ පැහැදිලිව සකස් කරන ආකාරය.",
    "analogy": "AI එකක් කියන්නේ අලුත් සේවකයෙක් වගේ. ඔබ ලබාදෙන උපදෙස් (Prompt) කොතරම් පැහැදිලිද, ප්‍රතිඵලයත් එතරම් සාර්ථකයි.",
    "content": [
      "Prompt එකක් කියන්නේ මොකක්ද?",
      "හොඳ Prompt එකක තිබිය යුතු කොටස් (Context, Task, Format)",
      "Role-playing prompts (උදා: \"ඔබ දක්ෂ ගුරුවරයෙක් ලෙස සිතන්න...\")",
      "පැහැදිලි නොවන Prompts වල ඇති ගැටළු"
    ],
    "keyTakeaways": [
      "Context (පසුබිම) ලබාදීමෙන් වඩාත් නිවැරදි පිළිතුරු ලබාගත හැක.",
      "පිළිතුර අවශ්‍ය ආකෘතිය (Format) - උදා: ලිපියක්, වගුවක් හෝ ලැයිස්තුවක් ලෙස ඉල්ලීම."
    ],
    "exercise": {
      "prompt": "AI එකට ලබාදෙන උපදෙස් හඳුන්වන්නේ කුමන නමකින්ද?",
      "hint": "P...t",
      "solution": "Prompt"
    }
  },
  {
    "id": "ai-3",
    "title": "03. ChatGPT සහ Gemini භාවිතයෙන් ලිපි සහ ඊමේල් ලිවීම",
    "level": "Intermediate",
    "duration": "මිනිත්තු 15",
    "summary": "ව්‍යාපාරික ඊමේල්, බ්ලොග් ලිපි, සහ රචනා ලිවීමට AI භාවිතා කිරීම.",
    "analogy": "මෙය හරියට ඔබටම කියා දක්ෂ ලේකම්වරයෙක් (Secretary) සිටිනවා වැනිය.",
    "content": [
      "Professional Email එකක් ලිවීමට Prompt එකක් සකස් කිරීම",
      "ලිපියක Tone එක වෙනස් කිරීම (Formal, Friendly, Humorous)",
      "දිගු ලිපියක් කෙටි කිරීම (Summarizing)",
      "සිංහල භාෂාවෙන් පිළිතුරු ලබාගැනීම සහ පරිවර්තනය (Translation)"
    ],
    "keyTakeaways": [
      "AI මඟින් මිනිත්තු ගණනක් ගතවන ඊමේල් ලිවීම තත්පර කිහිපයකින් කළ හැක.",
      "ලැබෙන පිළිතුර 100% ක්ම ඒ ආකාරයෙන්ම නොගෙන, අවශ්‍ය සංශෝධන කිරීම වැදගත් වේ."
    ],
    "exercise": {
      "prompt": "දිගු ලිපියක සාරාංශයක් ලබාගැනීමට AI එකට ලබාදිය යුතු විධානය (Command) කුමක්ද?",
      "hint": "Summ...",
      "solution": "Summarize (සාරාංශ කරන්න)"
    }
  },
  {
    "id": "ai-4",
    "title": "04. AI භාවිතයෙන් පින්තූර (Images) නිර්මාණය කිරීම",
    "level": "Intermediate",
    "duration": "මිනිත්තු 20",
    "summary": "Midjourney, DALL-E, සහ Leonardo AI වැනි Image Generation මෙවලම් භාවිතය.",
    "analogy": "ඔබේ මනසේ ඇති රූපය විස්තර කළ සැණින් එය සිතුවමට නගන දක්ෂ චිත්‍ර ශිල්පියෙක් වගේ.",
    "content": [
      "Image Generation AI යනු කුමක්ද?",
      "සාර්ථක Image Prompt එකක් ලියන ආකාරය (Subject, Style, Lighting)",
      "DALL-E 3 (ChatGPT හරහා) භාවිතයෙන් පින්තූර සෑදීම",
      "නොමිලේ භාවිතා කළ හැකි Image Generation Tools (Bing Image Creator)"
    ],
    "keyTakeaways": [
      "පින්තූරයේ විලාසය (උදා: Photorealistic, Cartoon, 3D Render) සඳහන් කිරීමෙන් වඩා හොඳ ප්‍රතිඵල ලැබේ.",
      "විස්තරය (Description) කෙතරම් නිවැරදිද, පින්තූරය එතරම් අලංකාර වේ."
    ],
    "exercise": {
      "prompt": "මයික්‍රොසොෆ්ට් සමාගම විසින් නොමිලේ ලබාදෙන, පින්තූර නිර්මාණය කළ හැකි AI මෙවලම කුමක්ද?",
      "hint": "Bing ...",
      "solution": "Bing Image Creator (Copilot)"
    }
  },
  {
    "id": "ai-5",
    "title": "05. Data Analysis සහ Presentation සඳහා AI භාවිතය",
    "level": "Advanced",
    "duration": "මිනිත්තු 20",
    "summary": "Excel දත්ත විශ්ලේෂණය කිරීමට සහ PowerPoint Presentations සෑදීමට AI භාවිතා කිරීම.",
    "analogy": "මෙය හරියට දත්ත ගොඩක් දෙස බලා තත්පරයෙන් නිවැරදි තීරණ ගන්න දක්ෂ කළමනාකරුවෙක් වගේ.",
    "content": [
      "ChatGPT Advanced Data Analysis භාවිතය",
      "වගුවකින් (CSV/Excel) නිගමන ලබාගැනීම",
      "AI හරහා PowerPoint Slides සඳහා අන්තර්ගතය (Content) සෑදීම",
      "Tome, Gamma වැනි AI Presentation මෙවලම් භාවිතය"
    ],
    "keyTakeaways": [
      "සංකීර්ණ දත්ත විශ්ලේෂණය කර ප්‍රස්ථාර සහ සාරාංශ ලබාගැනීම දැන් ඉතා පහසුය.",
      "Gamma වැනි මෙවලම් මඟින් විනාඩි 5කින් අලංකාර Presentation එකක් සෑදිය හැක."
    ],
    "exercise": {
      "prompt": "තත්පර කිහිපයකින් Presentations (ස්ලයිඩ් දර්ශන) නිර්මාණය කිරීමට භාවිතා කළ හැකි ප්‍රසිද්ධ AI මෙවලමක් නම් කරන්න.",
      "hint": "Gamm...",
      "solution": "Gamma (Gamma.app) හෝ Tome"
    }
  }
]
};
