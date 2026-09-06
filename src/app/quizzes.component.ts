import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { doc, updateDoc, arrayUnion, increment, collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './auth.service';
import { db } from './firebase';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  titleSinhala: string;
  category: string;
  categoryColor: string;
  points: number;
  durationMins: number;
  questions: Question[];
}

@Component({
  selector: 'app-quizzes',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-[100dvh] bg-[#F2F2F7] dark:bg-black text-black dark:text-white pb-24">
      
      <!-- Top Header -->
      <header class="sticky top-0 z-40 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 pt-12 pb-3">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold tracking-tight">දවසේ ප්‍රශ්න</h1>
          <button type="button" (click)="openLeaderboard()" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 rounded-full text-[#FF9500] cursor-pointer hover:bg-[#FF9500]/20 active:scale-95 transition-all border-none">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">leaderboard</mat-icon>
            <span class="text-sm font-bold">{{ totalPoints() }}</span>
          </button>
        </div>
      </header>

      <main class="px-4 py-6">
        
        <!-- List View -->
        @if (currentView() === 'list') {
          <div class="animate-fade-in-up">
            <h2 class="text-lg font-bold tracking-tight mb-4 text-[#8E8E93] dark:text-[#EBEBF5]/60 uppercase text-xs">
              Daily Challenge &bull; දවසේ අභියෝගය
            </h2>

            @if (quizzes().length > 0) {
            <!-- Featured Quiz -->
            <button type="button" (click)="startQuiz(quizzes()[0])" 
                 [disabled]="completedQuizIds().includes(quizzes()[0].id)"
                 [ngClass]="completedQuizIds().includes(quizzes()[0].id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'"
                 class="w-full text-left group bg-gradient-to-br from-[#FF9500] to-[#FF8A00] text-white p-5 rounded-[24px] shadow-sm transition-all mb-8 relative overflow-hidden border-none block">
              <div class="absolute -right-4 -top-4 opacity-20">
                <mat-icon style="font-size: 120px; width: 120px; height: 120px;">emoji_events</mat-icon>
              </div>
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider">
                    Featured
                  </span>
                  <span class="text-xs text-white/90 font-semibold flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">stars</mat-icon>
                    {{ quizzes()[0].points }} Pts
                  </span>
                </div>
                <h3 class="text-xl font-bold leading-snug mb-1">
                  {{ quizzes()[0].title }}
                </h3>
                <p class="text-sm text-white/80 font-medium mb-5">
                  {{ quizzes()[0].titleSinhala }}
                </p>
                <div class="flex items-center justify-between pt-4 border-t border-white/20 text-xs font-bold text-white">
                  <span>{{ quizzes()[0].questions.length }} ප්‍රශ්න &bull; මිනිත්තු {{ quizzes()[0].durationMins }}</span>
                  <span class="inline-flex items-center gap-1 transition-transform" [ngClass]="completedQuizIds().includes(quizzes()[0].id) ? '' : 'group-hover:translate-x-1'">
                    @if (completedQuizIds().includes(quizzes()[0].id)) {
                      සම්පූර්ණයි <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                    } @else {
                      ආරම්භ කරන්න <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_forward</mat-icon>
                    }
                  </span>
                </div>
              </div>
            </button>

            <h2 class="text-lg font-bold tracking-tight mb-4 text-[#8E8E93] dark:text-[#EBEBF5]/60 uppercase text-xs">
              All Quizzes &bull; සියලුම ප්‍රශ්න
            </h2>

            <!-- Other Quizzes List -->
            <div class="flex flex-col gap-4">
              @for (quiz of quizzes().slice(1); track quiz.id) {
                <button type="button" (click)="startQuiz(quiz)" 
                     [disabled]="completedQuizIds().includes(quiz.id)"
                     [ngClass]="completedQuizIds().includes(quiz.id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'"
                     class="w-full text-left bg-white dark:bg-[#1C1C1E] p-4 rounded-[20px] shadow-sm flex flex-col transition-colors border-none block">
                  <div class="flex items-start justify-between mb-2">
                    <span [ngClass]="quiz.categoryColor" class="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                      {{ quiz.category }}
                    </span>
                    <span class="text-xs text-[#8E8E93] font-semibold flex items-center gap-1">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">stars</mat-icon>
                      {{ quiz.points }}
                    </span>
                  </div>
                  <h3 class="text-base font-bold text-black dark:text-white leading-snug mb-1">
                    {{ quiz.title }}
                  </h3>
                  <p class="text-xs text-[#8E8E93] mb-3">
                    {{ quiz.titleSinhala }}
                  </p>
                  <div class="flex items-center justify-between text-[11px] font-bold text-[#8E8E93] pt-3 border-t border-black/5 dark:border-white/5">
                    <span>ප්‍රශ්න {{ quiz.questions.length }} &bull; මිනිත්තු {{ quiz.durationMins }}</span>
                    @if (completedQuizIds().includes(quiz.id)) {
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-[#34C759]">check_circle</mat-icon>
                    } @else {
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">play_circle</mat-icon>
                    }
                  </div>
                </button>
              }
            </div>
            }
          </div>
        }

        <!-- Playing View -->
        @if (currentView() === 'playing' && activeQuiz()) {
          <div class="animate-fade-in">
            <div class="flex items-center justify-between mb-6">
              <button (click)="quitQuiz()" class="text-[#FF9500] text-sm font-bold flex items-center gap-1 active:opacity-70">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon> ඉවත්වන්න
              </button>
              <div class="text-xs font-bold text-[#8E8E93]">
                ප්‍රශ්නය {{ currentQuestionIndex() + 1 }} / {{ activeQuiz()!.questions.length }}
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full mb-8 overflow-hidden">
              <div class="h-full bg-[#FF9500] transition-all duration-300" [style.width.%]="((currentQuestionIndex() + 1) / activeQuiz()!.questions.length) * 100"></div>
            </div>

            <div class="mb-8">
              <h2 class="text-xl sm:text-2xl font-bold text-black dark:text-white leading-snug">
                {{ activeQuiz()!.questions[currentQuestionIndex()].text }}
              </h2>
            </div>

            <div class="flex flex-col gap-3">
              @for (option of activeQuiz()!.questions[currentQuestionIndex()].options; track option; let i = $index) {
                <button 
                  (click)="selectOption(i)"
                  [disabled]="selectedOptionIndex() !== null"
                  class="w-full text-left p-4 rounded-2xl border transition-all duration-200 text-sm sm:text-base font-semibold flex items-center justify-between"
                  [ngClass]="{
                    'border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1C1E] text-black dark:text-white hover:border-[#FF9500] dark:hover:border-[#FF9500]': selectedOptionIndex() === null,
                    'border-[#34C759] bg-[#34C759]/10 text-[#34C759]': selectedOptionIndex() !== null && i === activeQuiz()!.questions[currentQuestionIndex()].correctIndex,
                    'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30]': selectedOptionIndex() === i && i !== activeQuiz()!.questions[currentQuestionIndex()].correctIndex,
                    'opacity-50 border-black/5 dark:border-white/5': selectedOptionIndex() !== null && i !== selectedOptionIndex() && i !== activeQuiz()!.questions[currentQuestionIndex()].correctIndex
                  }">
                  <span>{{ option }}</span>
                  
                  @if (selectedOptionIndex() !== null) {
                    @if (i === activeQuiz()!.questions[currentQuestionIndex()].correctIndex) {
                      <mat-icon style="font-size: 20px; width: 20px; height: 20px;" class="text-[#34C759]">check_circle</mat-icon>
                    }
                    @if (selectedOptionIndex() === i && i !== activeQuiz()!.questions[currentQuestionIndex()].correctIndex) {
                      <mat-icon style="font-size: 20px; width: 20px; height: 20px;" class="text-[#FF3B30]">cancel</mat-icon>
                    }
                  }
                </button>
              }
            </div>

            @if (selectedOptionIndex() !== null) {
              <div class="mt-8 animate-fade-in-up">
                <button 
                  (click)="nextQuestion()"
                  class="w-full py-4 bg-[#FF9500] text-white rounded-2xl font-bold text-base shadow-md active:scale-[0.98] transition-transform">
                  {{ currentQuestionIndex() === activeQuiz()!.questions.length - 1 ? 'ප්‍රතිඵල බලන්න' : 'ඊළඟ ප්‍රශ්නය' }}
                </button>
              </div>
            }
          </div>
        }

        <!-- Result View -->
        @if (currentView() === 'result' && activeQuiz()) {
          <div class="animate-fade-in-up flex flex-col items-center justify-center pt-10 pb-6 text-center">
            
            <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                 [ngClass]="score() >= (activeQuiz()!.questions.length / 2) ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'">
              <mat-icon style="font-size: 48px; width: 48px; height: 48px;">
                {{ score() >= (activeQuiz()!.questions.length / 2) ? 'emoji_events' : 'sentiment_dissatisfied' }}
              </mat-icon>
            </div>

            <h2 class="text-2xl font-bold text-black dark:text-white mb-2">
              {{ score() >= (activeQuiz()!.questions.length / 2) ? 'ඉතා විශිෂ්ටයි!' : 'තවත් උත්සාහ කරන්න!' }}
            </h2>
            <p class="text-sm text-[#8E8E93] mb-8">
              ඔබ ප්‍රශ්න {{ activeQuiz()!.questions.length }} න් {{ score() }} කට නිවැරදිව පිළිතුරු ලබා දී ඇත: <br>
              <span class="font-semibold text-black dark:text-white">{{ activeQuiz()!.titleSinhala }}</span>
            </p>

            <div class="w-full bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 mb-8 shadow-sm">
              <div class="text-xs text-[#8E8E93] font-bold uppercase tracking-wider mb-2">ලබාගත් ලකුණු</div>
              <div class="text-4xl font-black text-[#FF9500] flex items-center justify-center gap-2">
                +{{ earnedPoints() }} <mat-icon style="font-size: 28px; width: 28px; height: 28px;">stars</mat-icon>
              </div>
            </div>

            <button 
              (click)="finishQuiz()"
              class="w-full py-4 bg-[#FF9500] text-white rounded-2xl font-bold text-base shadow-md active:scale-[0.98] transition-transform">
              නැවත මුල් පිටුවට
            </button>
          </div>
        }
      
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
                              <img [src]="user.photoURL" alt="User avatar" class="w-8 h-8 rounded-full object-cover shadow-sm" referrerpolicy="no-referrer">
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
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 0.4s ease-out forwards;
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class QuizzesComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  userProfile = this.authService.userProfile;
  totalPoints = computed(() => this.userProfile()?.quizPoints || 0);
  completedQuizIds = computed(() => this.userProfile()?.completedQuizzes || []);

  
  currentView = signal<'list' | 'playing' | 'result'>('list');
  activeQuiz = signal<Quiz | null>(null);
  
  currentQuestionIndex = signal<number>(0);
  selectedOptionIndex = signal<number | null>(null);
  score = signal<number>(0);
  earnedPoints = signal<number>(0);
  showLeaderboardModal = signal<boolean>(false);
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


  quizzes = signal<Quiz[]>([]);
  private unsubQuizzes: any;

  ngOnInit() {
    const q = query(collection(db, 'quizzes'));
    this.unsubQuizzes = onSnapshot(q, (snapshot: any) => {
      this.quizzes.set(snapshot.docs.map((doc: any) => doc.data() as Quiz));
    });
  }

  ngOnDestroy() {
    if (this.unsubQuizzes) this.unsubQuizzes();
  }

  startQuiz(quiz: Quiz) {
    if (!this.authService.currentUser()) {
      this.authService.openAuthModal('login');
      return;
    }
    if (this.completedQuizIds().includes(quiz.id)) {
      return;
    }
    this.activeQuiz.set(quiz);
    this.currentQuestionIndex.set(0);
    this.selectedOptionIndex.set(null);
    this.score.set(0);
    this.earnedPoints.set(0);
    this.currentView.set('playing');
  }

  selectOption(index: number) {
    if (this.selectedOptionIndex() !== null) return; // Prevent multiple clicks
    
    this.selectedOptionIndex.set(index);
    
    if (index === this.activeQuiz()!.questions[this.currentQuestionIndex()].correctIndex) {
      this.score.update(s => s + 1);
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex() < this.activeQuiz()!.questions.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
      this.selectedOptionIndex.set(null);
    } else {
      // Calculate points earned based on score
      const maxPoints = this.activeQuiz()!.points;
      const pct = this.score() / this.activeQuiz()!.questions.length;
      const earned = Math.round(maxPoints * pct);
      this.earnedPoints.set(earned);
      this.currentView.set('result');
    }
  }

  quitQuiz() {
    if (confirm('ඔබට විශ්වාසද? ඔබ ලබාගත් ප්‍රගතිය මැකී යනු ඇත.')) {
      this.currentView.set('list');
      this.activeQuiz.set(null);
    }
  }

  async finishQuiz() {
    const user = this.authService.currentUser();
    const activeQ = this.activeQuiz();
    const points = this.earnedPoints();

    this.currentView.set('list');
    this.activeQuiz.set(null);

    if (user && activeQ) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          completedQuizzes: arrayUnion(activeQ.id),
          quizPoints: increment(points)
        });
        
        // Optimistic UI update
        this.authService.userProfile.update(profile => {
          if (!profile) return profile;
          return {
            ...profile,
            completedQuizzes: [...(profile.completedQuizzes || []), activeQ.id],
            quizPoints: (profile.quizPoints || 0) + points
          };
        });
      } catch (err) {
        console.error('Error saving quiz progress', err);
      }
    }
  }
}
