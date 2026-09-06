const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
  "    match /store_items/{document} {",
  "    match /quizzes/{document} {\n      allow read: if true;\n      allow write: if isAdmin();\n    }\n    match /store_items/{document} {"
);
fs.writeFileSync('firestore.rules', code);
