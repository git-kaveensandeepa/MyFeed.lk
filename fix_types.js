const fs = require('fs');
const file = 'src/app/store.component.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "this.unsub = onSnapshot(q, (snapshot) => {",
  "this.unsub = onSnapshot(q, (snapshot: any) => {"
);

code = code.replace(
  "snapshot.forEach(doc => {",
  "snapshot.forEach((doc: any) => {"
);

fs.writeFileSync(file, code);
