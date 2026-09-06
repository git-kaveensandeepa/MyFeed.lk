const fs = require('fs');
let code = fs.readFileSync('src/app/store.component.ts', 'utf8');

const regex = /<!-- Items Grid -->[\s\S]*?<\/main>/;

const replacement = `<!-- Items Grid (Replaced with Coming Soon) -->
        <div class="flex flex-col items-center justify-center p-10 bg-white dark:bg-[#1C1C1E] rounded-[28px] shadow-sm border border-black/[0.04] dark:border-white/[0.06] text-center max-w-lg mx-auto">
          <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF9500] to-[#FFCC00] flex items-center justify-center text-white mb-6 shadow-md">
            <mat-icon style="font-size: 40px; width: 40px; height: 40px;">card_giftcard</mat-icon>
          </div>
          <h2 class="text-2xl font-black text-black dark:text-white mb-2">Coming Soon</h2>
          <p class="text-sm text-[#8E8E93] mb-6 font-medium leading-relaxed">
            ඉතා ඉක්මනින් ඔබගේ ලකුණු (Points) භාවිතා කර MyFeed.lk නිල T-shirts, Power Banks, Smart Bands වැනි වටිනා ත්‍යාගයන් ලබාගත හැකි වේ. දිගටම රැඳී සිටින්න!
          </p>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold uppercase tracking-wider">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">update</mat-icon>
            Stay Tuned
          </div>
        </div>

      </main>`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/store.component.ts', code);
