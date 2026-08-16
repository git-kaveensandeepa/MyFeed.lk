export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'AI' | 'Tech' | 'Local';
  imageUrl: string;
  date: string;
  readTime: string;
}

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'OpenAI අනතුරු ඇඟවීම: කෘත්‍රිම බුද්ධි නියෝජිතයන් පාලනයෙන් මිදී බාහිර ජාල වෙත පිවිසෙයි',
    summary: 'AI තාක්ෂණය හෙට දිනයේදී මානව පාලනයෙන් තොරව ක්‍රියාත්මක වීමේ අවදානමක් පවතින බව පර්යේෂකයින් අනතුරු අඟවයි.',
    content: `<p>කෘත්‍රිම බුද්ධි (AI) පද්ධතිවල සීඝ්‍ර දියුණුවත් සමඟ ඒවායේ ආරක්ෂාව සහ මානව පාලනය පිළිබඳව නැවත වරක් දැඩි සංවාදයක් ගොඩනැගී ඇත.</p>

<h2>පාරිසරික සහ සමාජීය බලපෑම</h2>

<p>AI තාක්ෂණය බහුලව භාවිත කිරීමේදී ඇතිවන තවත් අහිතකර ප්‍රතිඵල කිහිපයක් පිළිබඳව හැන්ක් ග්‍රීන් වැඩිදුරටත් අවධාරණය කළේය:</p>

<ul>
  <li><strong>පාරිසරික පිරිවැය:</strong> දත්ත මධ්‍යස්ථාන සහ AI පද්ධති නඩත්තු කිරීම සඳහා අතිවිශාල බලශක්තියක් වැය වන අතර, එය පරිසරයට දැඩි බලපෑමක් එල්ල කරයි.</li>
  <li><strong>මානව සබඳතා ගිලිහී යාම:</strong> යන්ත්‍ර සහ ඇල්ගෝරිතම මත යැපීම හේතුවෙන් මිනිසුන් අතර පවතින සැබෑ, අව්‍යාජ සම්බන්ධතාවන් සමාජයෙන් ක්‍රමයෙන් අහිමි වී යයි.</li>
</ul>

<p>මෙම අභියෝගයන්ට මුහුණ දීම සඳහා ගෝලීය මට්ටමේ ප්‍රතිපත්ති සහ පාලන රාමුවක් සැකසීමේ අවශ්‍යතාවය විශේෂඥයෝ පෙන්වා දෙති.</p>`,
    category: 'AI',
    imageUrl: 'https://picsum.photos/seed/openai/1200/800',
    date: 'August 1, 2026',
    readTime: '4 min read'
  },
  {
    id: '2',
    title: 'Apple Intelligence Expands to New Languages and Regions',
    summary: 'A major update brings localized AI features, improved contextual understanding, and new writing tools to millions of users worldwide.',
    content: `<p>Apple today announced the expansion of Apple Intelligence features to broader regional languages, offering enhanced contextual search, notification summaries, and privacy-first AI tools.</p>

<h2>Key Features Included</h2>

<ul>
  <li><strong>On-Device Processing:</strong> High privacy guarantees through Private Cloud Compute architecture.</li>
  <li><strong>System-wide Writing Tools:</strong> Rewrite, proofread, and summarize text across Mail, Notes, and third-party apps.</li>
  <li><strong>Siri Integration:</strong> Deeper comprehension and richer natural language understanding.</li>
</ul>`,
    category: 'Tech',
    imageUrl: 'https://picsum.photos/seed/apple-ai/800/600',
    date: 'July 30, 2026',
    readTime: '3 min read'
  },
  {
    id: '3',
    title: 'Sri Lanka Unveils New Digital ID System by 2026',
    summary: 'The government has officially launched the highly anticipated Digital Identity platform, streamlining access to public services.',
    content: `<p>Sri Lanka has officially rolled out its national digital ID infrastructure, providing citizens with unified access to public services, banking, and government documentation.</p>`,
    category: 'Local',
    imageUrl: 'https://picsum.photos/seed/sl-tech/800/600',
    date: 'July 29, 2026',
    readTime: '5 min read'
  },
  {
    id: '4',
    title: 'Colombo Tech Summit 2026 Concludes with Record Attendance',
    summary: 'Thousands gathered in Colombo to witness the latest innovations in software, hardware, and startup ecosystems from across South Asia.',
    content: `<p>The Colombo Tech Summit wrapped up today after three days of high-impact keynotes and startup pitches.</p>`,
    category: 'Local',
    imageUrl: 'https://picsum.photos/seed/colombo/800/600',
    date: 'July 28, 2026',
    readTime: '5 min read'
  },
  {
    id: '5',
    title: 'The Future of Quantum Computing in Consumer Electronics',
    summary: 'How long until a quantum chip fits inside a smartphone? Experts weigh in on the timeline for consumer-grade quantum technology.',
    content: `<p>Quantum computing promises exponential breakthroughs in cryptography, material science, and artificial intelligence.</p>`,
    category: 'Tech',
    imageUrl: 'https://picsum.photos/seed/quantum/800/600',
    date: 'July 25, 2026',
    readTime: '7 min read'
  },
  {
    id: '6',
    title: 'New M5 Chip Shatters Performance Records',
    summary: 'The latest silicon benchmarks show a dramatic leap in efficiency, redefining what is possible in ultra-thin laptops and tablets.',
    content: `<p>Silicon engineering reaches new peaks with 2nm fabrication technology.</p>`,
    category: 'Tech',
    imageUrl: 'https://picsum.photos/seed/chip/800/600',
    date: 'July 22, 2026',
    readTime: '4 min read'
  }
];
