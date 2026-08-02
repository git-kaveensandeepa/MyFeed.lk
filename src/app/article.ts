import {ChangeDetectionStrategy, Component, computed, inject, signal, HostListener} from '@angular/core';
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

      <main class="animate-fade-in-up pb-20 sm:pb-32">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 md:pt-24 pb-8 sm:pb-12">
          <div class="flex items-center justify-between mb-8 sm:mb-16">
            <a routerLink="/" class="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/40 dark:text-white/40 hover:text-[#1d1d1f] dark:hover:text-white transition-all cursor-pointer group">
              <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
              Back to Journal
            </a>

            <div class="flex items-center gap-3">
              <button 
                (click)="copyLink()"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10 group">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="group-hover:rotate-12 transition-transform">share</mat-icon>
                <span>{{ copySuccess() ? 'Link Copied!' : 'Share Story' }}</span>
              </button>

              <button 
                (click)="bookmarkManager.toggleBookmark(article.id)"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;" [class.text-blue-600]="bookmarkManager.isBookmarked(article.id)">
                  {{ bookmarkManager.isBookmarked(article.id) ? 'bookmark' : 'bookmark_border' }}
                </mat-icon>
                <span>{{ bookmarkManager.isBookmarked(article.id) ? 'Saved' : 'Save' }}</span>
              </button>
            </div>
          </div>

          <header class="mb-10 sm:mb-20 text-center">
            <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-10 text-[10px] sm:text-xs font-bold tracking-widest text-[#1d1d1f]/40 dark:text-white/40 uppercase">
              <span class="text-blue-600">{{ article.category }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#1d1d1f]/20 dark:bg-white/20"></span>
              <span>{{ article.date }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#1d1d1f]/20 dark:bg-white/20"></span>
              <span class="flex items-center gap-1.5"><mat-icon style="font-size: 16px; width: 16px; height: 16px;">schedule</mat-icon> {{ article.readTime }}</span>
            </div>
            
            <h1 class="text-2xl sm:text-4xl md:text-6xl lg:text-[6.5rem] font-black tracking-tight text-[#1d1d1f] dark:text-white mb-6 sm:mb-10 leading-[1.15] sm:leading-[0.95] max-w-5xl mx-auto drop-shadow-sm break-words">
              {{ article.title }}
            </h1>
            
            <p class="text-base sm:text-2xl md:text-3xl text-[#1d1d1f]/50 dark:text-white/50 font-serif italic leading-relaxed max-w-4xl mx-auto">
              {{ article.summary }}
            </p>
          </header>
        </div>

        <figure class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20 md:mb-32">
          <div class="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.5/1] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-white/5 relative shadow-2xl shadow-black/10">
            <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer"
                 class="absolute inset-0 w-full h-full object-cover" />
          </div>
        </figure>

        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Author Block -->
          <div class="flex items-center gap-4 sm:gap-5 mb-10 sm:mb-16 pb-8 sm:pb-12 border-b border-black/5 dark:border-white/10">
            <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover bg-gray-100 dark:bg-white/10 shadow-sm shrink-0" />
            <div>
              <div class="font-bold text-[#1d1d1f] dark:text-white text-base sm:text-lg">Written by Kaveen Sandeepa</div>
              <div class="text-xs sm:text-sm font-medium text-[#1d1d1f]/50 dark:text-white/50">Editor-in-Chief &bull; MyFeed.lk</div>
            </div>
          </div>

          <div 
            class="prose prose-base sm:prose-xl md:prose-2xl max-w-none text-[#1d1d1f]/80 dark:text-gray-300 leading-[1.8] sm:leading-[1.9] font-serif [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-[#1d1d1f] [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-6 [&_li]:mb-3 [&_strong]:font-bold [&_strong]:text-[#1d1d1f] [&_strong]:dark:text-white"
            [innerHTML]="article.content">
          </div>
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
  `
})
export class ArticleComponent {
  private route = inject(ActivatedRoute);
  readonly articleService = inject(ArticleService);
  readonly bookmarkManager = inject(BookmarkManager);

  private articleSlug = toSignal(
    this.route.paramMap.pipe(map(params => params.get('slug')))
  );

  readonly article = computed(() => {
    const slug = this.articleSlug();
    if (!slug) return null;
    return this.articleService.articles().find(a => a.slug === slug || a.id === slug) || null;
  });

  readonly scrollProgress = signal(0);
  readonly copySuccess = signal(false);

  copyLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 3000);
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window === 'undefined') return;
    const docElement = document.documentElement;
    const scrollTotal = docElement.scrollHeight - docElement.clientHeight;
    if (scrollTotal > 0) {
      const progress = (docElement.scrollTop / scrollTotal) * 100;
      this.scrollProgress.set(progress);
    }
  }
}
