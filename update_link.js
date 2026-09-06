const fs = require('fs');
let code = fs.readFileSync('src/app/profile.ts', 'utf8');
code = code.replace('href="https://kaveensandeepa.com"', 'href="https://myfeedlk.com/developer"');
fs.writeFileSync('src/app/profile.ts', code);
