import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AudioService, MorningEdition, ChapterMark } from './audio.service';
import { ArticleService } from './article.service';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-transparent text-[#000000] dark:text-white transition-colors duration-300 pb-36 pt-3 sm:pt-6">
      
      <main class="max-w-4xl w-full mx-auto px-4 sm:px-6">
        
        <!-- Navigation Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <a routerLink="/" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full ios-glass-thin text-xs font-bold text-[#007AFF] hover:opacity-80 transition-opacity ios-touch">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">chevron_left</mat-icon>
              <span>Journal</span>
            </a>
          </div>
          
          <div class="text-center">
            <h1 class="text-base sm:text-lg font-black text-[#000000] dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              <mat-icon class="text-[#007AFF]" style="font-size: 22px; width: 22px; height: 22px;">podcasts</mat-icon>
              <span>Morning Commute Audio</span>
            </h1>
            <p class="text-[10px] text-[#8e8e93] font-medium">
              Daily 15-Minute Curated Tech Wrap
            </p>
          </div>

          <div class="flex items-center gap-2">
            <!-- Car Mode / Commute Mode Toggle Button -->
            <button 
              type="button"
              (click)="audioService.toggleCarMode()"
              [class.bg-[#007AFF]]="audioService.carMode()"
              [class.text-white]="audioService.carMode()"
              class="px-3 py-1.5 rounded-full ios-glass-thin text-xs font-bold flex items-center gap-1.5 transition-all ios-touch cursor-pointer">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">directions_car</mat-icon>
              <span class="hidden sm:inline">Drive Mode</span>
            </button>
          </div>
        </div>

        @if (selectedEdition(); as edition) {
          
          <!-- Car Mode Full Screen Overlay (When driving/commuting) -->
          @if (audioService.carMode()) {
            <div class="fixed inset-0 z-50 bg-[#0a0a0c] text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn">
              
              <!-- Car Top Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-black uppercase tracking-wider">
                    🚗 DRIVE &amp; COMMUTE MODE
                  </span>
                  <span class="text-xs text-gray-400 font-mono">
                    {{ edition.windowStart }} &rarr; {{ edition.windowEnd }}
                  </span>
                </div>

                <button 
                  type="button"
                  (click)="audioService.toggleCarMode()"
                  class="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                  <span>Exit Drive Mode</span>
                </button>
              </div>

              <!-- Car Center Track Details -->
              <div class="text-center my-auto max-w-2xl mx-auto space-y-4">
                <div class="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 mx-auto flex items-center justify-center shadow-2xl border border-white/10">
                  <mat-icon style="font-size: 64px; width: 64px; height: 64px;">podcasts</mat-icon>
                </div>

                <div>
                  <h2 class="text-2xl sm:text-4xl font-black tracking-tight mb-2">
                    {{ edition.title }}
                  </h2>
                  <p class="text-base text-blue-400 font-bold">
                    Now Playing: {{ audioService.currentChapter()?.title || edition.dateFormatted }}
                  </p>
                  <p class="text-sm text-gray-400 mt-1">
                    {{ edition.summarySinhala }}
                  </p>
                </div>

                <!-- Big Progress Bar -->
                <div class="space-y-2 pt-4">
                  <div 
                    class="w-full h-4 bg-white/10 rounded-full overflow-hidden relative cursor-pointer" 
                    role="slider"
                    tabindex="0"
                    aria-label="Seek audio"
                    [attr.aria-valuenow]="audioService.currentTime()"
                    [attr.aria-valuemin]="0"
                    [attr.aria-valuemax]="audioService.duration()"
                    (keydown.arrowright)="audioService.skip(10)"
                    (keydown.arrowleft)="audioService.skip(-10)"
                    (click)="onProgressClick($event)">
                    <div class="h-full bg-blue-500 rounded-full" [style.width.%]="audioService.progressPercent()"></div>
                  </div>
                  <div class="flex justify-between text-base font-mono text-gray-400">
                    <span>{{ audioService.formattedCurrentTime() }}</span>
                    <span>{{ audioService.formattedRemainingTime() }}</span>
                  </div>
                </div>
              </div>

              <!-- Car Huge Controls (Safety First) -->
              <div class="flex items-center justify-center gap-6 sm:gap-12 pb-6">
                
                <!-- Huge Skip -15s -->
                <button 
                  type="button"
                  (click)="audioService.skip(-15)"
                  class="w-20 h-20 rounded-full bg-white/10 active:bg-white/20 flex flex-col items-center justify-center text-white cursor-pointer shadow-lg">
                  <mat-icon style="font-size: 36px; width: 36px; height: 36px;">replay_10</mat-icon>
                  <span class="text-[10px] font-bold mt-[-2px]">-15s</span>
                </button>

                <!-- Massive Play / Pause -->
                <button 
                  type="button"
                  (click)="playOrToggleEdition(edition)"
                  class="w-28 h-28 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 flex items-center justify-center text-white shadow-2xl transition-all cursor-pointer">
                  <mat-icon style="font-size: 56px; width: 56px; height: 56px;">
                    {{ (audioService.currentEdition()?.id === edition.id && audioService.isPlaying()) ? 'pause' : 'play_arrow' }}
                  </mat-icon>
                </button>

                <!-- Huge Skip +15s -->
                <button 
                  type="button"
                  (click)="audioService.skip(15)"
                  class="w-20 h-20 rounded-full bg-white/10 active:bg-white/20 flex flex-col items-center justify-center text-white cursor-pointer shadow-lg">
                  <mat-icon style="font-size: 36px; width: 36px; height: 36px;">forward_15</mat-icon>
                  <span class="text-[10px] font-bold mt-[-2px]">+15s</span>
                </button>

              </div>

            </div>
          }

          <!-- Normal Studio Card (Featured Daily 15-Min Brief) -->
          <div class="relative overflow-hidden rounded-[28px] ios-card text-[#000000] dark:text-white p-6 sm:p-8 mb-8">
            
            <!-- Background Glow Accent -->
            <div class="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="relative z-10">
              
              <!-- 24-Hour Coverage Window Pill Banner -->
              <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900/40">
                  <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>24-Hour Window: <strong>{{ edition.windowStart }}</strong> &rarr; <strong>{{ edition.windowEnd }}</strong></span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">timer</mat-icon>
                    {{ edition.durationFormatted }} Commute Edition
                  </span>
                  <span class="text-gray-300 dark:text-gray-700">&bull;</span>
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">headphones</mat-icon>
                    {{ edition.listenCount || 1200 }} Listens
                  </span>
                </div>
              </div>

              <!-- Main Player Row -->
              <div class="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-6">
                
                <!-- Album Artwork with Pulse / Equalizer -->
                <div class="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-800 text-white flex-shrink-0 flex flex-col items-center justify-center p-4 shadow-xl border border-white/20 overflow-hidden">
                  
                  @if (audioService.currentEdition()?.id === edition.id && audioService.isPlaying()) {
                    <div class="flex items-end gap-1 h-8 mb-2">
                      <span class="w-1.5 bg-white rounded-full animate-bounce" style="height: 100%; animation-duration: 0.6s;"></span>
                      <span class="w-1.5 bg-white rounded-full animate-bounce" style="height: 60%; animation-duration: 0.9s;"></span>
                      <span class="w-1.5 bg-white rounded-full animate-bounce" style="height: 90%; animation-duration: 0.5s;"></span>
                      <span class="w-1.5 bg-white rounded-full animate-bounce" style="height: 40%; animation-duration: 0.8s;"></span>
                      <span class="w-1.5 bg-white rounded-full animate-bounce" style="height: 75%; animation-duration: 0.7s;"></span>
                    </div>
                  } @else {
                    <mat-icon style="font-size: 48px; width: 48px; height: 48px;" class="mb-1 text-white/90">graphic_eq</mat-icon>
                  }

                  <span class="text-[10px] font-black uppercase tracking-widest text-white/90">MYFEED AUDIO</span>
                  <span class="text-[9px] text-white/70 font-mono">15-MIN WRAP</span>
                </div>

                <!-- Title & Player Controls -->
                <div class="flex-1 w-full text-center md:text-left">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider mb-2">
                    🌅 MORNING TECH EDITION #{{ edition.editionNumber }}
                  </div>

                  <h2 class="text-xl sm:text-3xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-1.5">
                    {{ edition.title }}
                  </h2>

                  <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                    <span>{{ edition.dateFormatted }}</span>
                    <span>&bull;</span>
                    <span class="text-blue-600 dark:text-blue-400 font-semibold">{{ edition.narratorName }}</span>
                  </p>

                  <!-- Scrubber Bar -->
                  <div class="space-y-1.5 mb-5">
                    <div 
                      class="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
                      role="slider"
                      tabindex="0"
                      aria-label="Seek audio"
                      [attr.aria-valuenow]="audioService.currentTime()"
                      [attr.aria-valuemin]="0"
                      [attr.aria-valuemax]="audioService.duration()"
                      (keydown.arrowright)="audioService.skip(10)"
                      (keydown.arrowleft)="audioService.skip(-10)"
                      (click)="onProgressClick($event)">
                      <div 
                        class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-100 relative"
                        [style.width.%]="audioService.currentEdition()?.id === edition.id ? audioService.progressPercent() : 0">
                        <span class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </div>
                    </div>

                    <div class="flex justify-between text-[11px] font-mono text-gray-400 dark:text-gray-500">
                      <span>{{ audioService.currentEdition()?.id === edition.id ? audioService.formattedCurrentTime() : '00:00' }}</span>
                      <span>{{ audioService.currentEdition()?.id === edition.id ? audioService.formattedRemainingTime() : edition.durationFormatted }}</span>
                    </div>
                  </div>

                  <!-- Control Buttons Row -->
                  <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    
                    <!-- Rewind 15s -->
                    <button 
                      type="button"
                      (click)="audioService.skip(-15)"
                      title="Rewind 15 seconds"
                      class="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all cursor-pointer">
                      <mat-icon style="font-size: 22px; width: 22px; height: 22px;">replay_10</mat-icon>
                    </button>

                    <!-- Main Big Play / Pause Button -->
                    <button 
                      type="button"
                      (click)="playOrToggleEdition(edition)"
                      class="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer">
                      <mat-icon style="font-size: 24px; width: 24px; height: 24px;">
                        {{ (audioService.currentEdition()?.id === edition.id && audioService.isPlaying()) ? 'pause' : 'play_arrow' }}
                      </mat-icon>
                      <span>{{ (audioService.currentEdition()?.id === edition.id && audioService.isPlaying()) ? 'Pause Brief' : 'Play 15-Min Audio' }}</span>
                    </button>

                    <!-- Forward 15s -->
                    <button 
                      type="button"
                      (click)="audioService.skip(15)"
                      title="Forward 15 seconds"
                      class="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-all cursor-pointer">
                      <mat-icon style="font-size: 22px; width: 22px; height: 22px;">forward_15</mat-icon>
                    </button>

                    <!-- Speed Multiplier -->
                    <button 
                      type="button"
                      (click)="audioService.cycleSpeed()"
                      title="Playback Speed"
                      class="px-3 py-2 rounded-full text-xs font-black bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 transition-all cursor-pointer">
                      {{ audioService.playbackRate() }}x Speed
                    </button>

                  </div>

                </div>

              </div>

              <!-- Sinhala Summary Box -->
              <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 mb-6">
                <div class="flex items-center gap-2 mb-1.5">
                  <mat-icon class="text-blue-500" style="font-size: 18px; width: 18px; height: 18px;">auto_awesome</mat-icon>
                  <span class="text-xs font-bold text-gray-900 dark:text-white">පැය 24 පුවත් සාරාංශය (Commute Edition Brief):</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sinhala">
                  {{ edition.summarySinhala }}
                </p>
              </div>

              <!-- Chapters / Story Timestamps Breakdown -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-black uppercase tracking-wider text-[#1d1d1f] dark:text-white flex items-center gap-2">
                    <mat-icon class="text-blue-600" style="font-size: 18px; width: 18px; height: 18px;">format_list_bulleted</mat-icon>
                    <span>Stories Covered in this 15-Min Audio ({{ edition.chapters.length }} Chapters)</span>
                  </h3>
                  <span class="text-[11px] text-gray-400 font-medium">Click time to jump</span>
                </div>

                <div class="space-y-2">
                  @for (chap of edition.chapters; track chap.seconds; let idx = $index) {
                    <div 
                      role="button"
                      tabindex="0"
                      (keydown.enter)="onChapterClick(edition, chap)"
                      (click)="onChapterClick(edition, chap)"
                      [class.bg-blue-50]="audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds"
                      [class.dark:bg-blue-950/30]="audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds"
                      [class.border-blue-300]="audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds"
                      [class.dark:border-blue-800]="audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds"
                      class="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer group">
                      
                      <div class="flex items-center gap-3 min-w-0 pr-2">
                        <!-- Timestamp Pill -->
                        <span 
                          [class.bg-blue-600]="audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds"
                          [class.text-white]="audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds"
                          [class.bg-black/5]="!(audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds)"
                          [class.dark:bg-white/10]="!(audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds)"
                          class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex-shrink-0 transition-colors">
                          {{ chap.timeFormatted }}
                        </span>

                        <div class="min-w-0">
                          <h4 class="text-xs sm:text-sm font-bold truncate text-[#1d1d1f] dark:text-white group-hover:text-blue-600 transition-colors">
                            {{ chap.title }}
                          </h4>
                          @if (chap.summary) {
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {{ chap.summary }}
                            </p>
                          }
                        </div>
                      </div>

                      <div class="flex items-center gap-2 flex-shrink-0">
                        @if (chap.category) {
                          <span class="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                            {{ chap.category }}
                          </span>
                        }

                        <button 
                          type="button"
                          class="w-7 h-7 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">
                            {{ (audioService.currentEdition()?.id === edition.id && audioService.currentChapter()?.seconds === chap.seconds && audioService.isPlaying()) ? 'equalizer' : 'play_circle' }}
                          </mat-icon>
                        </button>
                      </div>

                    </div>
                  }
                </div>
              </div>

            </div>

          </div>

        }

        <!-- Archive of Past Morning Editions -->
        <div class="mt-10">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-black tracking-tight text-[#1d1d1f] dark:text-white">
                Past Morning Editions (Archive)
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                පෙර දිනවල උදෑසන 15-Min Audio Briefings
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (past of audioService.editions(); track past.id) {
              <div 
                role="button"
                tabindex="0"
                (keydown.enter)="selectEdition(past)"
                (click)="selectEdition(past)"
                [class.ring-2]="selectedEdition()?.id === past.id"
                [class.ring-blue-500]="selectedEdition()?.id === past.id"
                class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 hover:shadow-md transition-all cursor-pointer group">
                
                <div class="flex items-start justify-between gap-3 mb-2">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                    #{{ past.editionNumber }} &bull; {{ past.durationFormatted }}
                  </span>
                  <span class="text-[10px] font-mono text-gray-400">
                    {{ past.date }}
                  </span>
                </div>

                <h4 class="text-sm font-bold text-[#1d1d1f] dark:text-white group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                  {{ past.title }}
                </h4>

                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                  {{ past.summarySinhala }}
                </p>

                <div class="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
                  <span class="text-gray-400 font-medium truncate">
                    Coverage: {{ past.timeWindowText || '4:00 AM – 4:00 AM' }}
                  </span>

                  <button 
                    type="button"
                    (click)="playOrToggleEdition(past); $event.stopPropagation()"
                    class="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                      {{ (audioService.currentEdition()?.id === past.id && audioService.isPlaying()) ? 'pause' : 'play_arrow' }}
                    </mat-icon>
                    <span>{{ (audioService.currentEdition()?.id === past.id && audioService.isPlaying()) ? 'Pause' : 'Listen' }}</span>
                  </button>
                </div>

              </div>
            }
          </div>
        </div>

      </main>

    </div>
  `
})
export class RadioComponent {
  readonly audioService = inject(AudioService);
  readonly articleService = inject(ArticleService);

  readonly selectedEdition = signal<MorningEdition | null>(null);

  constructor() {
    // Select featured edition by default
    const featured = this.audioService.featuredEdition();
    if (featured) {
      this.selectedEdition.set(featured);
    }
  }

  selectEdition(edition: MorningEdition) {
    this.selectedEdition.set(edition);
  }

  playOrToggleEdition(edition: MorningEdition) {
    if (this.audioService.currentEdition()?.id === edition.id) {
      this.audioService.togglePlay();
    } else {
      this.selectedEdition.set(edition);
      this.audioService.playEdition(edition);
    }
  }

  onChapterClick(edition: MorningEdition, chapter: ChapterMark) {
    if (this.audioService.currentEdition()?.id !== edition.id) {
      this.selectedEdition.set(edition);
      this.audioService.playEdition(edition, chapter.seconds);
    } else {
      this.audioService.seekToChapter(chapter);
    }
  }

  onProgressClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
    this.audioService.seekToPercent(percentage);
  }
}
