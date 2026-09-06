const fs = require('fs');
let appTs = fs.readFileSync('src/app/app.ts', 'utf8');
appTs = appTs.replace(/, inject } from '@angular\/core';/g, " } from '@angular/core';");
appTs = appTs.replace("computed } from '@angular/core';", "computed, inject } from '@angular/core';");
fs.writeFileSync('src/app/app.ts', appTs);
