const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

// Replace gemini-3.7-flash with gemini-2.5-flash or gemini-3.1-pro-preview
// Or wait, maybe gemini-3.7-flash doesn't exist? The error was "Your project has been denied access".
// The model string 'gemini-3.7-flash' isn't available yet or the API key doesn't have access. Let's change it to gemini-2.5-flash globally.
code = code.replace(/gemini-3\.7-flash/g, 'gemini-2.5-flash');

fs.writeFileSync('src/server.ts', code);
console.log('Fixed server.ts models');
