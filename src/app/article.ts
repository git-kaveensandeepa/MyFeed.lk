import {ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {ArticleService} from './article.service';
import {BookmarkManager} from './bookmark';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-article',
  imports: [MatIconModule, RouterLink],
  template: `
    @if (articleService.loading()) {
      <div class="flex justify-center items-center py-32 animate-pulse min-h-[calc(100vh-200px)]">
        <div class="w-12 h-12 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin"></div>
      </div>
    } @else if (article(); as article) {
      <!-- Progress Bar -->
      <div class="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
        <div class="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" [style.width.%]="scrollProgress()"></div>
      </div>

      <main class="animate-fade-in-up pb-16 sm:pb-32 w-full max-w-full overflow-hidden">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-12 md:pt-16 pb-6 sm:pb-12">
          <!-- Top Navigation & Action Controls -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-12">
            <a routerLink="/" class="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white transition-all cursor-pointer group shrink-0">
              <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
              <span>Back to Journal</span>
            </a>

            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button 
                (click)="toggleSpeech(article)"
                [disabled]="isLoadingAudio()"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer border text-xs font-bold shrink-0"
                [class.bg-blue-600]="isSpeaking()"
                [class.text-white]="isSpeaking()"
                [class.border-blue-600]="isSpeaking()"
                [class.shadow-md]="isSpeaking()"
                [class.shadow-blue-500/20]="isSpeaking()"
                [class.bg-black/5]="!isSpeaking()"
                [class.dark:bg-white/10]="!isSpeaking()"
                [class.hover:bg-black/10]="!isSpeaking()"
                [class.dark:hover:bg-white/20]="!isSpeaking()"
                [class.text-[#1d1d1f]]="!isSpeaking()"
                [class.dark:text-white]="!isSpeaking()"
                [class.border-black/5]="!isSpeaking()"
                [class.dark:border-white/10]="!isSpeaking()">
                @if (isLoadingAudio()) {
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="animate-spin text-blue-600 dark:text-blue-400">sync</mat-icon>
                  <span>Loading...</span>
                } @else if (isSpeaking() && !isPaused()) {
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="animate-pulse">volume_up</mat-icon>
                  <span>Playing</span>
                } @else if (isPaused()) {
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">pause</mat-icon>
                  <span>Paused</span>
                } @else {
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-blue-600 dark:text-blue-400">headphones</mat-icon>
                  <span>Listen</span>
                }
              </button>

              <button 
                (click)="copyLink()"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10 shrink-0 group">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="group-hover:rotate-12 transition-transform">share</mat-icon>
                <span>{{ copySuccess() ? 'Copied!' : 'Share' }}</span>
              </button>

              <button 
                (click)="bookmarkManager.toggleBookmark(article.id)"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10 shrink-0">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;" [class.text-blue-600]="bookmarkManager.isBookmarked(article.id)">
                  {{ bookmarkManager.isBookmarked(article.id) ? 'bookmark' : 'bookmark_border' }}
                </mat-icon>
                <span>{{ bookmarkManager.isBookmarked(article.id) ? 'Saved' : 'Save' }}</span>
              </button>
            </div>
          </div>

          <header class="mb-8 sm:mb-16 text-center max-w-full overflow-hidden">
            <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mb-4 sm:mb-8 text-[10px] sm:text-xs font-bold tracking-widest text-[#1d1d1f]/50 dark:text-white/50 uppercase">
              <span class="text-blue-600">{{ article.category }}</span>
              <span class="w-1 h-1 rounded-full bg-[#1d1d1f]/20 dark:bg-white/20"></span>
              <span>{{ article.date }} @if (article.uploadTimeStr) { &bull; {{ article.uploadTimeStr }} }</span>
              <span class="w-1 h-1 rounded-full bg-[#1d1d1f]/20 dark:bg-white/20"></span>
              <span class="flex items-center gap-1"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">schedule</mat-icon> {{ article.readTime }}</span>
            </div>
            
            <h1 class="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-4 sm:mb-8 leading-[1.25] sm:leading-[1.1] max-w-4xl mx-auto drop-shadow-sm break-words hyphens-auto">
              {{ article.title }}
            </h1>
            
            <p class="text-sm sm:text-lg md:text-2xl text-[#1d1d1f]/60 dark:text-white/60 font-serif italic leading-relaxed max-w-3xl mx-auto break-words">
              {{ article.summary }}
            </p>
          </header>
        </div>

        <figure class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-16 md:mb-24">
          <div class="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2.2/1] rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-white/5 relative shadow-xl sm:shadow-2xl shadow-black/10">
            <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer"
                 class="absolute inset-0 w-full h-full object-cover" />
          </div>
        </figure>

        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
          <!-- Author / Byline Block with AI Transparency Compliance -->
          <div class="flex items-center gap-3 sm:gap-5 mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-black/5 dark:border-white/10">
            @if (article.authorType === 'human') {
              <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover bg-gray-100 dark:bg-white/10 shadow-sm shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-[#1d1d1f] dark:text-white text-sm sm:text-lg truncate">Written by Kaveen Sandeepa</div>
                <div class="text-[11px] sm:text-sm font-medium text-[#1d1d1f]/50 dark:text-white/50">Editor-in-Chief &bull; MyFeed.lk</div>
              </div>
            } @else {
              <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <mat-icon style="font-size: 22px; width: 22px; height: 22px;">auto_awesome</mat-icon>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span class="font-bold text-[#1d1d1f] dark:text-white text-sm sm:text-lg">MyFeed AI Desk</span>
                  <span class="inline-flex items-center px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    AI-Assisted
                  </span>
                </div>
                <div class="text-[11px] sm:text-sm font-medium text-[#1d1d1f]/60 dark:text-white/60 leading-snug">
                  Supervised & Edited by Kaveen Sandeepa
                </div>
              </div>
            }
          </div>

          <div 
            class="prose prose-base sm:prose-xl max-w-none text-[#1d1d1f]/80 dark:text-gray-300 leading-[1.8] sm:leading-[1.9] font-serif break-words overflow-hidden [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-[#1d1d1f] [&_h2]:dark:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-5 [&_li]:mb-2.5 [&_strong]:font-bold [&_strong]:text-[#1d1d1f] [&_strong]:dark:text-white"
            [innerHTML]="article.content">
          </div>

          <!-- AI Compliance & Transparency Disclosure Box -->
          @if (article.authorType !== 'human') {
            <div class="mt-10 sm:mt-14 p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm text-blue-950/80 dark:text-blue-200/80 leading-relaxed font-sans break-words overflow-hidden">
              <div class="flex items-start sm:items-center gap-2 font-bold text-blue-900 dark:text-blue-100 text-xs sm:text-sm uppercase tracking-wider mb-2">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0">verified</mat-icon>
                <span>AI විනිවිදභාවය සහ සංස්කාරක ප්‍රකාශනය (AI Transparency)</span>
              </div>
              <p class="text-blue-900/70 dark:text-blue-200/70 text-[11px] sm:text-xs leading-relaxed">
                මෙම තාක්ෂණික පුවත් වාර්තාව MyFeed.lk ස්වයංක්‍රීය කෘත්‍රිම බුද්ධි (AI Intelligence) මාධ්‍ය පද්ධතිය මඟින් ගෝලීය පුවත් මූලාශ්‍ර විශ්ලේෂණය කර සම්පාදනය කරන ලද්දකි. ජාත්‍යන්තර AI අන්තර්ගත විනිවිදභාවය පිළිබඳ ප්‍රමිතීන්ට (Global AI Content Transparency Standards) අනුකූලව මෙම තොරතුරු ප්‍රධාන කර්තෘ කවින් සඳීප විසින් අධීක්ෂණය කර ප්‍රකාශයට පත් කරනු ලබයි.
              </p>
            </div>
          }
        </div>
      </main>
    } @else {
      <div class="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-[#1d1d1f]/50 dark:text-white/50">
        <mat-icon class="opacity-50 mb-4" style="font-size: 48px; width: 48px; height: 48px;">error_outline</mat-icon>
        <p class="text-xl font-medium tracking-tight mb-6">Article not found.</p>
        <a routerLink="/" class="px-6 py-3 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#121212] font-medium hover:bg-black/80 dark:hover:bg-gray-200 transition-colors cursor-pointer">
          Return to Home
        </a>
      </div>
    }
  `,
  host: {
    '(window:scroll)': 'onWindowScroll()'
  }
})
export class ArticleComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  readonly articleService = inject(ArticleService);
  readonly bookmarkManager = inject(BookmarkManager);

  private articleId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  readonly article = computed(() => {
    const id = this.articleId();
    if (!id) return null;
    return this.articleService.articles().find(a => a.slug === id || a.id === id) || null;
  });

  readonly scrollProgress = signal(0);
  readonly copySuccess = signal(false);
  readonly isSpeaking = signal(false);
  readonly isPaused = signal(false);
  readonly isLoadingAudio = signal(false);
  private currentAudioElement: HTMLAudioElement | null = null;

  async toggleSpeech(article: { title: string; summary: string; content: string }) {
    if (typeof window === 'undefined') return;

    // 1. If already playing via HTMLAudioElement (OpenAI TTS)
    if (this.currentAudioElement) {
      if (this.isPaused()) {
        this.currentAudioElement.play();
        this.isPaused.set(false);
      } else {
        this.currentAudioElement.pause();
        this.isPaused.set(true);
      }
      return;
    }

    // 2. If speaking via Browser Web Speech Synthesis
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      if (this.isPaused()) {
        window.speechSynthesis.resume();
        this.isPaused.set(false);
      } else {
        window.speechSynthesis.pause();
        this.isPaused.set(true);
      }
      return;
    }

    // Extract text cleanly
    const tmp = document.createElement('div');
    tmp.innerHTML = article.content;
    const cleanContent = (tmp.textContent || tmp.innerText || '').slice(0, 3500);
    const fullTextToRead = `${article.title}. ${article.summary}. ${cleanContent}`;

    this.isLoadingAudio.set(true);

    // Try OpenAI HD TTS first via server proxy
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullTextToRead,
          voice: 'nova' // 'nova' is clear and expressive
        })
      });

      if (response.ok && response.headers.get('Content-Type')?.includes('audio')) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        this.currentAudioElement = audio;

        audio.onplay = () => {
          this.isSpeaking.set(true);
          this.isPaused.set(false);
          this.isLoadingAudio.set(false);
        };

        audio.onpause = () => {
          if (!audio.ended) {
            this.isPaused.set(true);
          }
        };

        audio.onended = () => {
          this.stopSpeech();
        };

        audio.onerror = () => {
          this.stopSpeech();
          this.fallbackBrowserSpeech(fullTextToRead);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback silently if OpenAI key is not set or network fails
    } finally {
      this.isLoadingAudio.set(false);
    }

    // 3. Fallback to Browser Speech Synthesis
    this.fallbackBrowserSpeech(fullTextToRead);
  }

  private fallbackBrowserSpeech(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const siVoice = voices.find(v => v.lang.startsWith('si') || v.lang.startsWith('ta'));
    if (siVoice) {
      utterance.voice = siVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking.set(true);
      this.isPaused.set(false);
    };

    utterance.onend = () => {
      this.isSpeaking.set(false);
      this.isPaused.set(false);
    };

    utterance.onerror = () => {
      this.isSpeaking.set(false);
      this.isPaused.set(false);
    };

    synth.speak(utterance);
  }

  stopSpeech() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
    this.isPaused.set(false);
    this.isLoadingAudio.set(false);
  }

  copyLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 3000);
    });
  }

  ngOnDestroy() {
    this.stopSpeech();
  }

  onWindowScroll() {
    if (typeof window === 'undefined') return;
    const docElement = document.documentElement;
    const scrollTotal = docElement.scrollHeight - docElement.clientHeight;
    if (scrollTotal > 0) {
      const progress = (window.scrollY / scrollTotal) * 100;
      this.scrollProgress.set(progress);
    }
  }
}
