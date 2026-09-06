import { Component, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ALL_COURSES, CourseTrackData, TargetAudienceType } from './courses.data';

export interface ByteCard {
  id: string | number;
  topic: string;
  category: string;
  icon: string;
  question: string;
  answer: string;
  sinhalaNote: string;
}

export interface AudienceOption {
  id: TargetAudienceType | 'all';
  labelSinhala: string;
  labelEn: string;
  icon: string;
  color: string;
  badge: string;
  description: string;
}

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-transparent text-[#000000] dark:text-white transition-colors duration-300 pb-36 pt-3 sm:pt-6" [class.text-base]="largeTextMode()" [class.text-sm]="!largeTextMode()">
      
      <main class="max-w-6xl w-full mx-auto px-4 sm:px-6">
        
        <!-- Top Navigation & Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <a routerLink="/" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ios-glass-thin text-xs font-bold text-[#007AFF] hover:opacity-80 transition-opacity ios-touch">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">chevron_left</mat-icon>
              <span>ප්‍රධාන පිටුව (Home)</span>
            </a>
          </div>
          
          <div class="text-center">
            <h1 class="text-base sm:text-lg font-black text-[#000000] dark:text-white tracking-tight flex items-center justify-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;">school</mat-icon>
              </div>
              <span>MyFeed Academy</span>
            </h1>
            <p class="text-[10px] sm:text-xs text-[#8e8e93] font-medium">
              ඕනෑම වයසක කෙනෙකුට (Kids, Seniors, Students, Pros) නොමිලේ ඉගෙන ගත හැකි පාඨමාලා {{ tracks.length }}ක්
            </p>
          </div>
          
          <!-- Accessibility Large Text Toggle & XP Badge -->
          <div class="flex items-center gap-2">
            <button 
              type="button"
              (click)="toggleLargeText()"
              [class.bg-[#007AFF]]="largeTextMode()"
              [class.text-white]="largeTextMode()"
              [class.ios-glass-thin]="!largeTextMode()"
              [class.text-[#8e8e93]]="!largeTextMode()"
              title="විශාල අකුරු මාදිලිය (Large Font for Seniors & Kids)"
              class="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ios-touch cursor-pointer">
              <mat-icon style="font-size: 15px; width: 15px; height: 15px;">format_size</mat-icon>
              <span class="hidden sm:inline">{{ largeTextMode() ? 'විශාල අකුරු ON' : 'විශාල අකුරු' }}</span>
            </button>

            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full ios-glass-thin">
              <mat-icon class="text-amber-500" style="font-size: 16px; width: 16px; height: 16px;">bolt</mat-icon>
              <span class="text-xs font-black text-amber-500 font-mono">{{ completedLessonsCount() * 50 }} XP</span>
            </div>
          </div>
        </div>

        <!-- Hero Learning Status Card (VisionOS Glass) -->
        <div class="relative overflow-hidden rounded-[24px] sm:rounded-[28px] ios-card p-5 sm:p-8 mb-8 border border-white/80 dark:border-white/10 shadow-xl">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="space-y-2.5 max-w-xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-600 dark:text-purple-400 text-[11px] font-black uppercase tracking-wider border border-purple-500/20">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">family_restroom</mat-icon>
                <span>සැමටම සුදුසු තාක්ෂණික දැනුම (For All Ages)</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-[#000000] dark:text-white leading-tight">
                ඕනෑම වයසක කෙනෙකුට සරලව <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">තේරෙන විදියට ඉගෙන ගනිමු</span>
              </h2>
              <p class="text-xs sm:text-sm text-[#8e8e93] leading-relaxed">
                කුඩා දරුවන්ට Game &amp; Logic, වැඩිහිටි/දෙමාපියන්ට Smartphone &amp; Banking ආරක්ෂාව, සිසුන්ට AI &amp; Python, සහ Developers ලාට Modern Cloud &amp; Fullstack පාඨමාලා සරල උපමා (Real-life Analogies) සමඟින් සිංහලෙන්.
              </p>
            </div>

            <!-- Quick Progress Stats Capsule -->
            <div class="w-full md:w-auto shrink-0 flex items-center justify-around sm:justify-end gap-2 sm:gap-3 p-3 sm:p-4 rounded-[20px] ios-glass-thin border border-black/5 dark:border-white/10">
              <div class="text-center px-3">
                <div class="text-lg font-black text-[#007AFF] font-mono">{{ completedLessonsCount() }} / {{ totalLessonsCount() }}</div>
                <div class="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider">අවසන් පාඩම්</div>
              </div>
              <div class="w-px h-8 bg-black/10 dark:bg-white/10"></div>
              <div class="text-center px-3">
                <div class="text-lg font-black text-purple-500 font-mono">{{ tracks.length }}</div>
                <div class="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider">Courses</div>
              </div>
              <div class="w-px h-8 bg-black/10 dark:bg-white/10"></div>
              <div class="text-center px-3">
                <div class="text-lg font-black text-emerald-500 font-mono">{{ getEarnedBadgesCount() }}</div>
                <div class="text-[10px] text-[#8e8e93] font-bold uppercase tracking-wider">Badges</div>
              </div>
            </div>
          </div>

          <!-- Overall Progress Bar -->
          <div class="mt-6 pt-4 border-t border-black/5 dark:border-white/10">
            <div class="flex items-center justify-between text-xs font-bold mb-2 text-[#8e8e93]">
              <span>ඔබගේ ප්‍රගතිය (Overall Progress)</span>
              <span class="text-[#007AFF] font-mono">{{ progressPercentage() }}%</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-500" [style.width.%]="progressPercentage()"></div>
            </div>
          </div>
        </div>

        <!-- NEW: Age / Audience Mode Selector (Whom is Learning?) -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3 px-1">
            <div class="flex items-center gap-2">
              <mat-icon class="text-purple-600 dark:text-purple-400" style="font-size: 18px; width: 18px; height: 18px;">face</mat-icon>
              <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#000000] dark:text-white">
                ඉගෙනුම් මාදිලිය තෝරන්න (Select Who is Learning):
              </h3>
            </div>
            <span class="text-[11px] text-[#8e8e93] font-mono">
              {{ filteredTracks().length }} Courses Found
            </span>
          </div>

          <!-- Audience Cards Carousel/Grid -->
          <div class="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            @for (aud of audienceOptions; track aud.id) {
              <button 
                type="button"
                (click)="selectedAudience.set(aud.id)"
                [class.ring-2]="selectedAudience() === aud.id"
                [class.ring-[#007AFF]]="selectedAudience() === aud.id"
                [class.bg-white]="selectedAudience() === aud.id"
                [class.dark:bg-[#2c2c2e]]="selectedAudience() === aud.id"
                [class.shadow-md]="selectedAudience() === aud.id"
                [class.ios-glass-thin]="selectedAudience() !== aud.id"
                class="w-[75%] sm:w-auto shrink-0 snap-center p-4 rounded-2xl text-left transition-all ios-touch cursor-pointer flex flex-col justify-between gap-3 border border-black/5 dark:border-white/10">
                <div class="flex items-center justify-between">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs text-sm" [class]="aud.color">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ aud.icon }}</mat-icon>
                  </div>
                  <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#8e8e93]">
                    {{ aud.badge }}
                  </span>
                </div>
                <div>
                  <div class="text-xs font-black text-[#000000] dark:text-white leading-tight">
                    {{ aud.labelSinhala }}
                  </div>
                  <div class="text-[10px] text-[#8e8e93] font-medium leading-tight mt-0.5 line-clamp-1">
                    {{ aud.description }}
                  </div>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- Section Navigation Segmented Controls (Cupertino Pill Tabs) -->
        <div class="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl ios-glass-thick mb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide max-w-lg mx-auto -mx-2 px-2 sm:mx-auto sm:px-1.5">
          <button 
            type="button"
            (click)="activeTab.set('courses')"
            [class.bg-white]="activeTab() === 'courses'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'courses'"
            [class.shadow-md]="activeTab() === 'courses'"
            [class.text-[#000000]]="activeTab() === 'courses'"
            [class.dark:text-white]="activeTab() === 'courses'"
            [class.text-[#8e8e93]]="activeTab() !== 'courses'"
            class="snap-center shrink-0 flex-1 py-2.5 px-4 sm:px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">menu_book</mat-icon>
            <span>පාඨමාලා ({{ filteredTracks().length }})</span>
          </button>
          <button 
            type="button"
            (click)="activeTab.set('flashcards')"
            [class.bg-white]="activeTab() === 'flashcards'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'flashcards'"
            [class.shadow-md]="activeTab() === 'flashcards'"
            [class.text-[#000000]]="activeTab() === 'flashcards'"
            [class.dark:text-white]="activeTab() === 'flashcards'"
            [class.text-[#8e8e93]]="activeTab() !== 'flashcards'"
            class="snap-center shrink-0 flex-1 py-2.5 px-4 sm:px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">style</mat-icon>
            <span>තත්පර 60 Bytes</span>
          </button>
        </div>

        <!-- TAB 1: ALL EXPANDED COURSES -->
        @if (activeTab() === 'courses') {
          
          <!-- Category Filter Bar -->
          <div class="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            @for (cat of categories; track cat.id) {
              <button 
                type="button"
                (click)="selectedCategory.set(cat.id)"
                [class.bg-[#007AFF]]="selectedCategory() === cat.id"
                [class.text-white]="selectedCategory() === cat.id"
                [class.ios-glass-thin]="selectedCategory() !== cat.id"
                [class.text-[#8e8e93]]="selectedCategory() !== cat.id"
                class="snap-start sm:snap-center px-4 py-2 rounded-full text-xs font-bold transition-all ios-touch shrink-0 cursor-pointer flex items-center gap-1.5">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ cat.icon }}</mat-icon>
                <span>{{ cat.labelSinhala }}</span>
              </button>
            }
          </div>

          <!-- Course Tracks Grid (3 columns on wide screens) -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            @for (track of filteredTracks(); track track.id) {
              <div class="group rounded-[24px] sm:rounded-[28px] ios-card p-5 sm:p-6 flex flex-col justify-between transition-all hover:-translate-y-1.5 hover:shadow-2xl border border-white/70 dark:border-white/10 relative overflow-hidden">
                
                <!-- Track Top Header -->
                <div>
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform" [class]="track.gradient">
                      <mat-icon style="font-size: 24px; width: 24px; height: 24px;">{{ track.icon }}</mat-icon>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      <span class="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-[#007AFF]">
                        {{ track.targetAudienceLabel || track.level }}
                      </span>
                      <span class="text-[10px] font-mono text-[#8e8e93]">
                        {{ track.totalDuration }} &bull; {{ track.lessons.length }} Lessons
                      </span>
                    </div>
                  </div>

                  <h3 class="text-base font-black tracking-tight text-[#000000] dark:text-white group-hover:text-[#007AFF] transition-colors mb-1">
                    {{ track.titleSinhala }}
                  </h3>
                  <div class="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold mb-2 line-clamp-1">
                    {{ track.title }}
                  </div>
                  <p class="text-xs text-[#8e8e93] leading-relaxed line-clamp-2 mb-3">
                    {{ track.descriptionSinhala }}
                  </p>

                  <!-- 3-Tier Roadmap Preview (Beginner -> Intermediate -> Pro) -->
                  <div class="p-2.5 rounded-xl ios-glass-thin border border-black/5 dark:border-white/10 mb-2">
                    <div class="text-[9px] font-black uppercase tracking-wider text-[#8e8e93] mb-1.5 flex items-center justify-between">
                      <span>Roadmap (මාවත):</span>
                      <span class="text-purple-600 dark:text-purple-400 font-bold">Beginner to Pro</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div class="flex-1 py-1 px-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold text-center truncate">
                        🟢 Beginner
                      </div>
                      <span class="text-[10px] text-[#8e8e93]">&rarr;</span>
                      <div class="flex-1 py-1 px-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold text-center truncate">
                        🟡 Inter
                      </div>
                      <span class="text-[10px] text-[#8e8e93]">&rarr;</span>
                      <div class="flex-1 py-1 px-1.5 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold text-center truncate">
                        🔴 Pro
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Track Progress and Start Dedicated Page Button -->
                <div class="mt-2 pt-3 border-t border-black/5 dark:border-white/10">
                  <div class="flex items-center justify-between mb-2 text-[11px] font-bold">
                    <span class="text-[#8e8e93]">ප්‍රගතිය</span>
                    <span class="text-[#007AFF] font-mono">{{ getTrackCompletedCount(track) }}/{{ track.lessons.length }} අවසන්</span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 mb-4 overflow-hidden">
                    <div class="h-full bg-[#007AFF] rounded-full transition-all duration-300" [style.width.%]="(getTrackCompletedCount(track) / track.lessons.length) * 100"></div>
                  </div>

                  <a 
                    [routerLink]="['/learn', track.id]"
                    class="w-full py-3 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0062cc] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ios-touch cursor-pointer">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">play_lesson</mat-icon>
                    <span>පාඩම් පිටුවට යන්න (Open Player)</span>
                  </a>
                </div>

              </div>
            }
          </div>

        }

        <!-- TAB 3: 60-SECOND BYTE CARDS -->
        @if (activeTab() === 'flashcards') {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            @for (byte of byteCards(); track byte.id) {
              <div class="group rounded-[20px] sm:rounded-[24px] ios-card p-4 sm:p-5 flex flex-col justify-between transition-all hover:scale-[1.02] border border-white/70 dark:border-white/10 shadow-md">
                
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ byte.icon }}</mat-icon>
                    </div>
                    <span class="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">{{ byte.category }}</span>
                  </div>

                  <h4 class="text-sm font-black text-[#000000] dark:text-white mb-2 leading-snug">
                    {{ byte.question }}
                  </h4>

                  <p class="text-xs text-[#1d1d1f] dark:text-gray-200 leading-relaxed mb-3">
                    {{ byte.answer }}
                  </p>
                </div>

                <div class="pt-3 border-t border-black/5 dark:border-white/10">
                  <div class="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <mat-icon style="font-size: 13px; width: 13px; height: 13px;">translate</mat-icon>
                    <span class="line-clamp-1">{{ byte.sinhalaNote }}</span>
                  </div>
                </div>

              </div>
            }
          </div>
        }

      </main>

    </div>
  `
})
export class LearnComponent implements OnInit, OnDestroy {
  activeTab = signal<'courses' | 'flashcards'>('courses');
  selectedCategory = signal<string>('all');
  selectedAudience = signal<TargetAudienceType | 'all'>('all');
  largeTextMode = signal<boolean>(false);

  completedLessonIds = signal<string[]>([]);

  audienceOptions: AudienceOption[] = [
    {
      id: 'all',
      labelSinhala: 'සියලු දෙනාටම',
      labelEn: 'All Ages',
      icon: 'public',
      color: 'bg-gradient-to-tr from-blue-500 to-indigo-600',
      badge: 'ALL',
      description: 'මුල සිට සරලව ඕනෑම කෙනෙකුට'
    },
    {
      id: 'kids',
      labelSinhala: 'කුඩා දරුවන්ට (8-14)',
      labelEn: 'Kids & Starters',
      icon: 'smart_toy',
      color: 'bg-gradient-to-tr from-amber-500 to-orange-500',
      badge: 'KIDS',
      description: 'Game Logic, Scratch & Fun'
    },
    {
      id: 'seniors',
      labelSinhala: 'වැඩිහිටි & දෙමාපියන්ට',
      labelEn: 'Seniors & Parents',
      icon: 'elderly',
      color: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
      badge: 'SENIORS',
      description: 'Phone Safety, Banking & Scam Defense'
    },
    {
      id: 'students',
      labelSinhala: 'පාසල් & Campus සිසුන්ට',
      labelEn: 'Students',
      icon: 'school',
      color: 'bg-gradient-to-tr from-purple-500 to-pink-500',
      badge: 'STUDENTS',
      description: 'Python, AI Prompts & Career'
    },
    {
      id: 'developers',
      labelSinhala: 'Developers & Pros',
      labelEn: 'Engineers',
      icon: 'terminal',
      color: 'bg-gradient-to-tr from-slate-700 to-slate-900',
      badge: 'PRO',
      description: 'Signals, Cloud, Docker & SQL'
    }
  ];

  categories = [
    { id: 'all', labelSinhala: 'සියලුම Tracks', icon: 'grid_view' },
    { id: 'marketing', labelSinhala: 'Digital Marketing & Ads', icon: 'campaign' },
    { id: 'data', labelSinhala: 'Data Analytics & Power BI', icon: 'analytics' },
    { id: 'web3', labelSinhala: 'Web3 & Blockchain', icon: 'currency_bitcoin' },
    { id: 'ai', labelSinhala: 'AI & Prompts', icon: 'smart_toy' },
    { id: 'python', labelSinhala: 'Python & Data', icon: 'terminal' },
    { id: 'fullstack', labelSinhala: 'Full-Stack Web', icon: 'code' },
    { id: 'mobile', labelSinhala: 'Mobile (Flutter)', icon: 'phone_iphone' },
    { id: 'cloud', labelSinhala: 'Cloud & DevOps', icon: 'cloud' },
    { id: 'security', labelSinhala: 'Cybersecurity', icon: 'shield' },
    { id: 'design', labelSinhala: 'UI/UX & Figma', icon: 'palette' },
    { id: 'career', labelSinhala: 'Tech Career & Upwork', icon: 'work' }
  ];

  tracks = ALL_COURSES;
  byteCards = signal<ByteCard[]>([]);
  private unsubBytes: any;

  filteredTracks = computed(() => {
    let list = this.tracks;
    
    // Filter by audience
    const aud = this.selectedAudience();
    if (aud !== 'all') {
      list = list.filter(t => t.targetAudience === aud || t.targetAudience === 'all-ages');
    }

    // Filter by category
    const cat = this.selectedCategory();
    if (cat !== 'all') {
      list = list.filter(t => t.category === cat);
    }

    return list;
  });

  totalLessonsCount = computed(() => {
    return this.tracks.reduce((acc, t) => acc + t.lessons.length, 0);
  });

  completedLessonsCount = computed(() => {
    return this.completedLessonIds().length;
  });

  progressPercentage = computed(() => {
    const total = this.totalLessonsCount();
    if (total === 0) return 0;
    return Math.round((this.completedLessonsCount() / total) * 100);
  });
  ngOnInit() {
    // Realtime listener for 60-second bytes
    const q = query(collection(db, 'bytes'));
    this.unsubBytes = onSnapshot(q, (snapshot) => {
      this.byteCards.set(snapshot.docs.map(doc => doc.data() as ByteCard));
    });

    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('myfeed_completed_lessons');
        if (saved) {
          this.completedLessonIds.set(JSON.parse(saved));
        }
        const savedLarge = localStorage.getItem('myfeed_large_text');
        if (savedLarge) {
          this.largeTextMode.set(savedLarge === 'true');
        }
      } catch (e) {
        console.warn('LocalStorage error', e);
      }
    }
  }

  ngOnDestroy() {
    if (this.unsubBytes) this.unsubBytes();
  }

  toggleLargeText() {
    const next = !this.largeTextMode();
    this.largeTextMode.set(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('myfeed_large_text', next.toString());
    }
  }

  getTrackCompletedCount(track: CourseTrackData): number {
    return track.lessons.filter(l => this.completedLessonIds().includes(l.id)).length;
  }

  getEarnedBadgesCount(): number {
    return this.tracks.filter(t => this.getTrackCompletedCount(t) === t.lessons.length && t.lessons.length > 0).length;
  }
}
