import sharp from 'sharp';
import fs from 'fs';

async function generateAssets() {
  if (!fs.existsSync('public/assets/icons')) {
    fs.mkdirSync('public/assets/icons', { recursive: true });
  }

  const width = 1080;
  const height = 1920;
  const svgMobile = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#09090b"/>
        <stop offset="100%" stop-color="#18181b"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2563eb"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect y="0" width="100%" height="160" fill="#18181b" fill-opacity="0.9"/>
    <text x="60" y="105" font-family="sans-serif" font-size="52" font-weight="bold" fill="#ffffff">MyFeed.lk</text>
    <rect x="340" y="65" width="140" height="52" rx="26" fill="url(#accent)"/>
    <text x="375" y="100" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">TECH</text>

    <!-- Card 1 -->
    <rect x="60" y="210" width="960" height="600" rx="36" fill="#27272a"/>
    <rect x="60" y="210" width="960" height="340" rx="36" fill="#3b82f6" fill-opacity="0.2"/>
    <text x="100" y="610" font-family="sans-serif" font-size="40" font-weight="bold" fill="#ffffff">Artificial Intelligence &amp; Future Tech</text>
    <text x="100" y="670" font-family="sans-serif" font-size="26" fill="#a1a1aa">Sri Lanka's premier Sinhala &amp; English Tech feed</text>

    <!-- Card 2 -->
    <rect x="60" y="850" width="960" height="420" rx="36" fill="#27272a"/>
    <text x="100" y="930" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff">Smartphones, Computing &amp; Gadgets</text>
    <text x="100" y="1000" font-family="sans-serif" font-size="26" fill="#a1a1aa">Daily breaking updates on Apple, Android, Nvidia and AI</text>

    <!-- Card 3 -->
    <rect x="60" y="1310" width="960" height="400" rx="36" fill="#27272a"/>
    <text x="100" y="1390" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff">Quizzes, Academy &amp; Audio Briefings</text>
    <text x="100" y="1460" font-family="sans-serif" font-size="26" fill="#a1a1aa">Interactive tech learning and daily summaries</text>
  </svg>`;

  await sharp(Buffer.from(svgMobile))
    .png()
    .toFile('public/assets/icons/screenshot-mobile.png');

  console.log('Successfully generated public/assets/icons/screenshot-mobile.png');
}

generateAssets().catch(console.error);
