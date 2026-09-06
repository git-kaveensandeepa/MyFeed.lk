const fs = require('fs');
const file = 'src/app/shorts.component.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "imports: [MatIconModule, RouterLink, CommonModule],",
  "imports: [MatIconModule, CommonModule],"
);

fs.writeFileSync(file, code);
