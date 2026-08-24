const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

if (!code.includes('/ads/{document}')) {
    code = code.replace(
        "    match /articles/{document} {",
        "    match /ads/{document} {\n      allow read: if true;\n      allow write: if isAdmin();\n    }\n\n    match /articles/{document} {"
    );
    fs.writeFileSync('firestore.rules', code);
    console.log('Fixed firestore.rules');
}
