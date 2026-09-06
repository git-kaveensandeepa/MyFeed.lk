const fs = require('fs');
let code = fs.readFileSync('src/app/quizzes.component.ts', 'utf8');

code = code.replace(
  `                </div>\n              }\n            </div>`,
  `                </div>\n              }\n            </div>\n            }`
);

fs.writeFileSync('src/app/quizzes.component.ts', code);
