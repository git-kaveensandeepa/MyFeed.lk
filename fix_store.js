const fs = require('fs');
const file = 'src/app/store.component.ts';
let code = fs.readFileSync(file, 'utf8');

// Fix imports
code = code.replace(
  "import { Component, inject, computed, signal } from '@angular/core';",
  "import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';"
);

code = code.replace(
  "import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';",
  "import { doc, updateDoc, arrayUnion, increment, collection, onSnapshot, query, orderBy } from 'firebase/firestore';"
);

// Fix class implements
code = code.replace(
  "export class StoreComponent implements import('@angular/core').OnInit, import('@angular/core').OnDestroy {",
  "export class StoreComponent implements OnInit, OnDestroy {"
);

fs.writeFileSync(file, code);
