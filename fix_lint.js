const fs = require('fs');
const file = 'src/app/quizzes.component.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<img [src]="user.photoURL" class="w-8 h-8 rounded-full object-cover shadow-sm" referrerpolicy="no-referrer">',
  '<img [src]="user.photoURL" alt="User avatar" class="w-8 h-8 rounded-full object-cover shadow-sm" referrerpolicy="no-referrer">'
);

fs.writeFileSync(file, code);
