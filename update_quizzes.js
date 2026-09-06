const fs = require('fs');
let code = fs.readFileSync('src/app/quizzes.component.ts', 'utf8');

// Update imports
code = code.replace(
  "import { Component, inject, computed, signal } from '@angular/core';",
  "import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';"
);

code = code.replace(
  "import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';",
  "import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';"
);

// Class declaration
code = code.replace(
  "export class QuizzesComponent {",
  "export class QuizzesComponent implements OnInit, OnDestroy {"
);

// Quizzes static array to signal
const oldQuizzesStr = `  quizzes: Quiz[] = [
    {
      id: 'q1',
      title: 'Prompt Engineering & AI Tools 2026',
      titleSinhala: 'AI මෙවලම් සහ Prompt Engineering',
      category: 'අභියෝගය',
      categoryColor: 'bg-[#FF9500]/15 text-[#FF9500]',
      points: 50,
      durationMins: 2,
      questions: [
        {
          text: 'AI මාදිලි වල (AI Models) "System Prompt" එකක ප්‍රධාන කාර්යය කුමක්ද?',
          options: [
            'භාෂා පරිවර්තනය කිරීම',
            'AI හි මූලික හැසිරීම, භූමිකාව සහ සීමාවන් සැකසීම',
            'පින්තූර නිර්මාණය කිරීම',
            'අන්තර්ජාලයට සම්බන්ධ වීම'
          ],
          correctIndex: 1
        },
        {
          text: 'AI එකට යම් කාර්යයක් කිරීමට පෙර උදාහරණ කිහිපයක් ලබා දීමේ ක්‍රමය හඳුන්වන්නේ කුමක් ලෙසද?',
          options: [
            'Zero-Shot Prompting',
            'Few-Shot Prompting',
            'Chain of Thought',
            'Fine-Tuning'
          ],
          correctIndex: 1
        },
        {
          text: '"Chain of Thought" Prompting මගින් සිදුවන්නේ කුමක්ද?',
          options: [
            'AI වේගයෙන් පිළිතුරු ලබා දෙයි',
            'AI පයිතන් (Python) වලින් කේත ලියයි',
            'සංකීර්ණ ගැටළු පියවරෙන් පියවර විසඳීමට AI දිරිමත් කරයි',
            'ස්වයංක්‍රීයව අන්තර්ජාලයෙන් පිළිතුරු සොයයි'
          ],
          correctIndex: 2
        }
      ]
    },
    {
      id: 'q2',
      title: 'Python Data Structures Basics',
      titleSinhala: 'Python මූලික Data Structures',
      category: 'කේතකරණය',
      categoryColor: 'bg-[#34C759]/15 text-[#34C759]',
      points: 30,
      durationMins: 5,
      questions: [
        {
          text: 'පහත සඳහන් දෑ අතුරින් Python හි වෙනස් කළ නොහැකි (immutable) Data Type එක කුමක්ද?',
          options: ['List', 'Dictionary', 'Set', 'Tuple'],
          correctIndex: 3
        },
        {
          text: 'Python හි හිස් Dictionary එකක් (Empty Dictionary) සාදා ගන්නේ කෙසේද?',
          options: ['d = []', 'd = {}', 'd = ()', 'd = empty()'],
          correctIndex: 1
        }
      ]
    },
    {
      id: 'q3',
      title: 'Cybersecurity Fundamentals',
      titleSinhala: 'සයිබර් ආරක්ෂාව පිළිබඳ මූලික දැනුම',
      category: 'ආරක්ෂාව',
      categoryColor: 'bg-[#FF3B30]/15 text-[#FF3B30]',
      points: 40,
      durationMins: 4,
      questions: [
        {
          text: '"Phishing" යනු කුමක්ද?',
          options: [
            'මාළු ඇල්ලීමේ ක්‍රමයකි',
            'ෆයර්වෝල් (Firewall) එකකින් සර්වර් එකක් ආරක්ෂා කිරීම',
            'ව්‍යාජ ඊමේල් හෝ වෙබ් අඩවි හරහා පරිශීලක දත්ත සොරකම් කිරීමේ ප්‍රහාරයකි',
            'හාඩ් ඩ්‍රයිව් එකක දත්ත සංකේතනය (Encrypt) කිරීම'
          ],
          correctIndex: 2
        }
      ]
    }
  ];`;

const newQuizzesStr = `  quizzes = signal<Quiz[]>([]);
  private unsubQuizzes: any;

  ngOnInit() {
    const q = query(collection(db, 'quizzes'));
    this.unsubQuizzes = onSnapshot(q, (snapshot: any) => {
      this.quizzes.set(snapshot.docs.map((doc: any) => doc.data() as Quiz));
    });
  }

  ngOnDestroy() {
    if (this.unsubQuizzes) this.unsubQuizzes();
  }`;

code = code.replace(oldQuizzesStr, newQuizzesStr);

// Update HTML usages
code = code.replace(/quizzes\[0\]/g, "quizzes()[0]");
code = code.replace(/quizzes\.slice\(1\)/g, "quizzes().slice(1)");

// We also need to add a check if quizzes() is empty
code = code.replace(
  "<!-- Featured Quiz -->",
  "@if (quizzes().length > 0) {\n            <!-- Featured Quiz -->"
);
code = code.replace(
  "</div>\n            </div>\n\n            <!-- Other Quizzes List -->",
  "</div>\n            </div>\n\n            <!-- Other Quizzes List -->"
);
// Wait, the block replacement using @if needs to be careful. Let's just do it manually with regex.
fs.writeFileSync('src/app/quizzes.component.ts', code);
