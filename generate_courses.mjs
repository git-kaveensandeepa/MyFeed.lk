// Course generation script for all 10 courses requested by the user
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'src/app/data/courses');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating courses into:', outDir);
