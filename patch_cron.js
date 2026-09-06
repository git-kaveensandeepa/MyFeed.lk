const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

const quizCron = `
  // Daily Quizzes (4:00 AM and 4:00 PM)
  const colomboCron = getColomboDateTimeParts();
  const isQuizTime = colomboCron.timeString === '04:00' || colomboCron.timeString === '16:00';
  const currentQuizSlot = colomboCron.dateString + '_' + colomboCron.timeString;
  
  if (isQuizTime && lastQuizGeneratedDate !== currentQuizSlot && !isQuizGenerating) {
    lastQuizGeneratedDate = currentQuizSlot;
    console.log(\`[Quiz-Generator] Triggered at Sri Lanka Time (\${colomboCron.dateString} \${colomboCron.timeString})...\`);
    await executeDailyQuizGeneration('scheduled');
  }

  // 2. Automated AI Audio Pipeline`;

code = code.replace(
  "  // 2. Automated AI Audio Pipeline",
  quizCron
);

fs.writeFileSync('src/server.ts', code);
