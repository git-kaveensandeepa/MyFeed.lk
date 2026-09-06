const fs = require('fs');
let code = fs.readFileSync('src/app/profile.ts', 'utf8');

// Replace external link with routerLink="/developer"
code = code.replace(
  '<a href="https://myfeedlk.com/developer" target="_blank" rel="noopener noreferrer"',
  '<a routerLink="/developer"'
);
code = code.replace(
  '<mat-icon class="text-purple-500 group-hover:translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">open_in_new</mat-icon>',
  '<mat-icon class="text-purple-500 group-hover:translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>'
);

fs.writeFileSync('src/app/profile.ts', code);
