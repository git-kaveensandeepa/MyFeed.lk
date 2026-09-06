const fs = require('fs');

// 1. app.ts
let appTs = fs.readFileSync('src/app/app.ts', 'utf8');
if (!appTs.includes('HapticService')) {
  appTs = appTs.replace(/import \{.*?\} from '@angular\/core';/, (match) => match.replace('}', ', inject }').replace(', inject, inject }', ', inject }'));
  appTs = appTs.replace("import {AuthModalComponent} from './auth-modal.component';", "import {AuthModalComponent} from './auth-modal.component';\nimport {HapticService} from './haptic.service';");
  appTs = appTs.replace("export class App implements OnInit {", "export class App implements OnInit {\n  readonly haptic = inject(HapticService);");
  fs.writeFileSync('src/app/app.ts', appTs);
}

// 2. app.html (bottom nav)
let appHtml = fs.readFileSync('src/app/app.html', 'utf8');
if (!appHtml.includes('haptic.selection()')) {
  // Add haptic to all routerLinks that are inside the nav tag
  appHtml = appHtml.replace(/<a routerLink="\/?"/g, '<a (click)="haptic.selection()" routerLink="/"');
  appHtml = appHtml.replace(/<a routerLink="\/learn"/g, '<a (click)="haptic.selection()" routerLink="/learn"');
  appHtml = appHtml.replace(/<a routerLink="\/quizzes"/g, '<a (click)="haptic.selection()" routerLink="/quizzes"');
  appHtml = appHtml.replace(/<a routerLink="\/store"/g, '<a (click)="haptic.selection()" routerLink="/store"');
  appHtml = appHtml.replace(/<a routerLink="\/profile"/g, '<a (click)="haptic.selection()" routerLink="/profile"');
  fs.writeFileSync('src/app/app.html', appHtml);
}

// 3. home.ts
let homeTs = fs.readFileSync('src/app/home.ts', 'utf8');
if (!homeTs.includes('HapticService')) {
  homeTs = homeTs.replace("import {ArticleService} from './article.service';", "import {ArticleService} from './article.service';\nimport {HapticService} from './haptic.service';");
  homeTs = homeTs.replace("export class HomeComponent {", "export class HomeComponent {\n  readonly haptic = inject(HapticService);");
  homeTs = homeTs.replace("selectCategory(cat: string) {", "selectCategory(cat: string) {\n    this.haptic.selection();");
  fs.writeFileSync('src/app/home.ts', homeTs);
}

// 4. article.ts
let articleTs = fs.readFileSync('src/app/article.ts', 'utf8');
if (!articleTs.includes('HapticService')) {
  articleTs = articleTs.replace("import {BookmarkManager} from './bookmark';", "import {BookmarkManager} from './bookmark';\nimport {HapticService} from './haptic.service';");
  articleTs = articleTs.replace("export class ArticleComponent implements OnInit {", "export class ArticleComponent implements OnInit {\n  readonly haptic = inject(HapticService);");
  articleTs = articleTs.replace("toggleBookmark() {", "toggleBookmark() {\n    this.haptic.mediumImpact();");
  articleTs = articleTs.replace("async shareArticle() {", "async shareArticle() {\n    this.haptic.lightImpact();");
  articleTs = articleTs.replace("playAudio() {", "playAudio() {\n    this.haptic.mediumImpact();");
  fs.writeFileSync('src/app/article.ts', articleTs);
}

// 5. quizzes.component.ts
let quizzesTs = fs.readFileSync('src/app/quizzes.component.ts', 'utf8');
if (!quizzesTs.includes('HapticService')) {
  quizzesTs = quizzesTs.replace("import {AuthService} from './auth.service';", "import {AuthService} from './auth.service';\nimport {HapticService} from './haptic.service';");
  quizzesTs = quizzesTs.replace("export class QuizzesComponent implements OnInit {", "export class QuizzesComponent implements OnInit {\n  readonly haptic = inject(HapticService);");
  quizzesTs = quizzesTs.replace("selectOption(optionIndex: number) {", "selectOption(optionIndex: number) {\n    this.haptic.selection();");
  quizzesTs = quizzesTs.replace("submitQuiz() {", "submitQuiz() {\n    this.haptic.success();");
  fs.writeFileSync('src/app/quizzes.component.ts', quizzesTs);
}

console.log('Haptic feedback added successfully.');
