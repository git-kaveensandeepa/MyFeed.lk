const fs = require('fs');
let code = fs.readFileSync('src/app/learn.component.ts', 'utf8');

// Update ByteCard interface
code = code.replace(
  '  id: number;',
  '  id: string | number;'
);

// Add imports
code = code.replace(
  "import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';",
  "import { Component, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy } from '@angular/core';\nimport { collection, query, onSnapshot } from 'firebase/firestore';\nimport { db } from './firebase';"
);

// Add implements OnDestroy
code = code.replace(
  'export class LearnComponent implements OnInit {',
  'export class LearnComponent implements OnInit, OnDestroy {'
);

// Change byteCards to signal and add unsub method
const byteCardsRegex = /\s*byteCards: ByteCard\[\] = \[[\s\S]*?\];\n/;
const newByteCards = `
  byteCards = signal<ByteCard[]>([]);
  private unsubBytes: any;
`;
code = code.replace(byteCardsRegex, newByteCards);

// Update ngOnInit to subscribe to firestore
code = code.replace(
  '  ngOnInit() {',
  `  ngOnInit() {
    // Realtime listener for 60-second bytes
    const q = query(collection(db, 'bytes'));
    this.unsubBytes = onSnapshot(q, (snapshot) => {
      this.byteCards.set(snapshot.docs.map(doc => doc.data() as ByteCard));
    });
`
);

// Add ngOnDestroy
code = code.replace(
  '  toggleLargeText() {',
  `  ngOnDestroy() {
    if (this.unsubBytes) this.unsubBytes();
  }

  toggleLargeText() {`
);

// Update template usages
code = code.replace(/@for \(byte of byteCards; track byte\.id\) \{/g, '@for (byte of byteCards(); track byte.id) {');

fs.writeFileSync('src/app/learn.component.ts', code);
