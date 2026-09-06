const fs = require('fs');

// Fix Quizzes Component
let quizCode = fs.readFileSync('src/app/quizzes.component.ts', 'utf8');
quizCode = quizCode.replace(
  "import { Component, signal, computed, inject } from '@angular/core';",
  "import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';"
);
fs.writeFileSync('src/app/quizzes.component.ts', quizCode);

// Fix Server
let serverCode = fs.readFileSync('src/server.ts', 'utf8');
serverCode = serverCode.replace(
  /\"id\": \"q_\$\{random_string\}\"/g,
  "\"id\": \"q_random_string_here\""
);
fs.writeFileSync('src/server.ts', serverCode);

