const fs = require('fs');
let code = fs.readFileSync('src/app/learn.component.ts', 'utf8');

// 1. Interface
code = code.replace(/export interface QuizQuestion \{[\s\S]*?\n\}\n\n/, '');

// 2. XP section
code = code.replace(/completedLessonsCount\(\) \* 50 \+ quizScore\(\) \* 20/g, 'completedLessonsCount() * 50');

// 3. Quiz Tab button
const tabBtnRegex = /\s*<button\s*type="button"\s*\(click\)="activeTab\.set\('quiz'\)"[\s\S]*?<\/button>\n/;
code = code.replace(tabBtnRegex, '');

// 4. TAB 2 Block
const tab2Regex = /\s*<!-- TAB 2: DAILY TECH QUIZ -->[\s\S]*?<!-- TAB 3: 60-SECOND BYTE CARDS -->/m;
code = code.replace(tab2Regex, '\n\n        <!-- TAB 3: 60-SECOND BYTE CARDS -->');

// 5. activeTab signal type
code = code.replace(/signal<'courses' \| 'quiz' \| 'flashcards'>/g, "signal<'courses' | 'flashcards'>");

// 6. Properties
code = code.replace(/\s*quizScore = signal<number>\(0\);/, '');
code = code.replace(/\s*currentQuestionIndex = signal<number>\(0\);/, '');
code = code.replace(/\s*selectedAnswer = signal<number \| null>\(null\);/, '');
code = code.replace(/\s*answered = signal<boolean>\(false\);/, '');

// 7. quizQuestions array
const quizArrRegex = /\s*quizQuestions: QuizQuestion\[\] = \[[\s\S]*?\];\n/;
code = code.replace(quizArrRegex, '');

// 8. currentQuestion computed
const currQRegex = /\s*currentQuestion = computed\(\(\) => \{[\s\S]*?\}\);\n/;
code = code.replace(currQRegex, '');

// 9. Methods
const selectAnswerRegex = /\s*selectAnswer\(index: number\) \{[\s\S]*?\}\n/m;
code = code.replace(selectAnswerRegex, '');

const nextQRegex = /\s*nextQuestion\(\) \{[\s\S]*?\}\n/m;
code = code.replace(nextQRegex, '');

// 10. LocalStorage
code = code.replace(/\s*const savedScore = localStorage\.getItem\('myfeed_quiz_score'\);\s*if \(savedScore\) \{\s*this\.quizScore\.set\(parseInt\(savedScore, 10\)\);\s*\}/g, '');

fs.writeFileSync('src/app/learn.component.ts', code);
