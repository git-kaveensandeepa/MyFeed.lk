const fs = require('fs');
const file = 'src/app/quizzes.component.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Add imports
code = code.replace(
  "import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';",
  "import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';\nimport { UserProfile } from './auth.service';"
);

// 2. Add Leaderboard UI and modify header
const oldHeader = `<div class="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 rounded-full text-[#FF9500]">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">stars</mat-icon>
            <span class="text-sm font-bold">{{ totalPoints() }}</span>
          </div>`;
          
const newHeader = `<div (click)="openLeaderboard()" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 rounded-full text-[#FF9500] cursor-pointer hover:bg-[#FF9500]/20 active:scale-95 transition-all">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">leaderboard</mat-icon>
            <span class="text-sm font-bold">{{ totalPoints() }}</span>
          </div>`;

code = code.replace(oldHeader, newHeader);

// 3. Add Leaderboard Modal markup at the end of the template
const modalMarkup = `
        <!-- Leaderboard Modal -->
        @if (showLeaderboardModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div class="bg-white dark:bg-[#1c1c1e] rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.1] relative max-h-[85vh] flex flex-col">
              
              <div class="flex items-center justify-between mb-5 shrink-0">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-[#FF9500]/20 text-[#FF9500] flex items-center justify-center">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">leaderboard</mat-icon>
                  </div>
                  <h3 class="text-lg font-bold text-[#000000] dark:text-white">
                    ප්‍රමුඛ පුවරුව (Leaderboard)
                  </h3>
                </div>
                <button (click)="closeLeaderboard()" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer active:scale-95">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                </button>
              </div>

              <div class="overflow-y-auto flex-grow -mx-2 px-2 custom-scrollbar">
                @if (isLoadingLeaderboard()) {
                  <div class="flex flex-col items-center justify-center py-10">
                    <div class="w-8 h-8 border-3 border-[#FF9500] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p class="text-xs text-[#8E8E93] font-semibold animate-pulse">දත්ත පූරණය වෙමින් පවතී...</p>
                  </div>
                } @else {
                  <div class="flex flex-col gap-2">
                    @for (user of leaderboardUsers(); track user.uid; let i = $index) {
                      <div class="flex items-center justify-between p-3 rounded-[16px] transition-colors"
                           [ngClass]="authService.currentUser()?.uid === user.uid ? 'bg-[#FF9500]/10 border border-[#FF9500]/20' : 'bg-black/5 dark:bg-white/5'">
                        <div class="flex items-center gap-3">
                          <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                               [ngClass]="{
                                 'bg-gradient-to-tr from-yellow-400 to-yellow-200 text-yellow-900': i === 0,
                                 'bg-gradient-to-tr from-gray-400 to-gray-200 text-gray-900': i === 1,
                                 'bg-gradient-to-tr from-amber-700 to-amber-500 text-amber-50': i === 2,
                                 'bg-white dark:bg-[#2C2C2E] text-black dark:text-white': i > 2
                               }">
                            {{ i + 1 }}
                          </div>
                          <div class="flex items-center gap-2">
                            @if (user.photoURL) {
                              <img [src]="user.photoURL" class="w-8 h-8 rounded-full object-cover shadow-sm" referrerpolicy="no-referrer">
                            } @else {
                              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                                {{ user.displayName ? user.displayName.charAt(0) : 'U' }}
                              </div>
                            }
                            <div class="flex flex-col">
                              <span class="text-sm font-bold leading-tight max-w-[120px] sm:max-w-[160px] truncate" 
                                    [ngClass]="authService.currentUser()?.uid === user.uid ? 'text-[#FF9500]' : 'text-black dark:text-white'">
                                {{ user.displayName || 'Anonymous User' }}
                              </span>
                              @if (authService.currentUser()?.uid === user.uid) {
                                <span class="text-[9px] font-extrabold uppercase tracking-wider text-[#FF9500]">ඔබ (You)</span>
                              }
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full shrink-0">
                          <span class="text-xs font-black text-black dark:text-white">{{ user.quizPoints || 0 }}</span>
                          <mat-icon style="font-size: 12px; width: 12px; height: 12px;" class="text-[#FF9500]">stars</mat-icon>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </main>
    </div>
`;
code = code.replace("</main>\n    </div>\n  `,\n  styles:", modalMarkup + "  `,\n  styles:");

// Add custom scrollbar styling
code = code.replace(
  "    @keyframes fadeIn {\n      from { opacity: 0; }\n      to { opacity: 1; }\n    }\n  `\n]",
  "    @keyframes fadeIn {\n      from { opacity: 0; }\n      to { opacity: 1; }\n    }\n    .custom-scrollbar::-webkit-scrollbar {\n      width: 4px;\n    }\n    .custom-scrollbar::-webkit-scrollbar-track {\n      background: transparent;\n    }\n    .custom-scrollbar::-webkit-scrollbar-thumb {\n      background: rgba(142, 142, 147, 0.3);\n      border-radius: 4px;\n    }\n  `\n]"
);

// Add class properties & methods
const methods = `  showLeaderboardModal = signal<boolean>(false);
  isLoadingLeaderboard = signal<boolean>(false);
  leaderboardUsers = signal<UserProfile[]>([]);

  async openLeaderboard() {
    this.showLeaderboardModal.set(true);
    this.isLoadingLeaderboard.set(true);
    try {
      const q = query(collection(db, 'users'), orderBy('quizPoints', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const users: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as UserProfile;
        if (data.quizPoints && data.quizPoints > 0) {
          users.push(data);
        }
      });
      this.leaderboardUsers.set(users);
    } catch (err) {
      console.error('Error fetching leaderboard', err);
    } finally {
      this.isLoadingLeaderboard.set(false);
    }
  }

  closeLeaderboard() {
    this.showLeaderboardModal.set(false);
  }
`;
code = code.replace("earnedPoints = signal<number>(0);", "earnedPoints = signal<number>(0);\n" + methods);

fs.writeFileSync(file, code);
