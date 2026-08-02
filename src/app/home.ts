import {ChangeDetectionStrategy, Component, computed, signal, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {SearchService} from './search.service';
import {ArticleService} from './article.service';
import {BookmarkManager} from './bookmark';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [MatIconModule, RouterLink],
  template: `
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 md:py-24 min-h-[calc(100vh-200px)]">
      
      <!-- Page Header -->
      <header class="mb-12 sm:mb-20 pt-4 sm:pt-8 text-center animate-fade-in-up">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#1d1d1f]/60 dark:text-white/60 mb-6 sm:mb-8 border border-black/[0.05] dark:border-white/10">
          <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Daily Journal &bull; {{ currentDate }}
        </div>
        <h1 class="text-4xl sm:text-6xl md:text-[7.5rem] font-black tracking-tighter text-[#1d1d1f] dark:text-white mb-4 sm:mb-6 leading-[1.0] sm:leading-[0.9]">
          The Feed.
        </h1>
        <p class="text-base sm:text-xl md:text-3xl text-[#1d1d1f]/50 dark:text-white/50 font-serif italic max-w-2xl mx-auto px-2">
          Curated stories at the intersection of technology, design, and culture.
        </p>
      </header>

      <!-- Category Filter (Pill Navigation) -->
      <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-16 animate-fade-in-up" style="animation-delay: 0.1s;">
        @for (cat of categories; track cat) {
          <button 
            (click)="setCategory(cat)"
            class="px-5 py-2 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-300 active:scale-95 cursor-pointer border"
            [class]="activeCategory() === cat ? 'bg-[#1d1d1f] dark:bg-white dark:text-[#121212] text-white border-[#1d1d1f] dark:border-white shadow-lg shadow-black/20' : 'bg-transparent text-[#1d1d1f]/60 dark:text-white/60 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 hover:text-[#1d1d1f] dark:hover:text-white'">
            {{ cat }}
          </button>
        }
      </div>

      @if (articleService.loading()) {
        <div class="flex justify-center items-center py-32 animate-pulse">
          <div class="w-12 h-12 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin"></div>
        </div>
      } @else if (filteredArticles().length === 0) {
        <div class="text-center py-20 sm:py-32 text-[#1d1d1f]/40 dark:text-white/40 animate-fade-in-up bg-white dark:bg-[#1a1a1a] rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-black/5 dark:border-white/10 mx-auto max-w-2xl mt-12 p-6">
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <mat-icon class="opacity-40" style="font-size: 36px; width: 36px; height: 36px;">search_off</mat-icon>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]/80 dark:text-white/80 mb-2">No articles found</h2>
          <p class="text-base sm:text-lg font-medium">We couldn't find anything matching your search.</p>
        </div>
      } @else {
        
        <!-- Featured Article (First item) -->
        @if (featuredArticle(); as featured) {
          <article [routerLink]="['/article', featured.slug || featured.id]" class="group relative bg-white dark:bg-[#1a1a1a] rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700 mb-16 sm:mb-24 cursor-pointer flex flex-col lg:flex-row min-h-0 lg:min-h-[550px] animate-fade-in-up border border-black/[0.03] dark:border-white/10" style="animation-delay: 0.2s;">
            <div class="w-full lg:w-[55%] overflow-hidden bg-gray-100 dark:bg-white/5 relative min-h-[240px] sm:min-h-[350px] lg:min-h-full">
              <img [src]="featured.imageUrl" [alt]="featured.title" referrerpolicy="no-referrer"
                   class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" />
              <button 
                (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(featured.id)"
                class="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-xl text-[#1d1d1f] dark:text-white hover:scale-110 transition-transform cursor-pointer border border-black/5 dark:border-white/10"
                [title]="bookmarkManager.isBookmarked(featured.id) ? 'Remove bookmark' : 'Bookmark article'">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;" [class.text-blue-600]="bookmarkManager.isBookmarked(featured.id)">
                  {{ bookmarkManager.isBookmarked(featured.id) ? 'bookmark' : 'bookmark_border' }}
                </mat-icon>
              </button>
            </div>
            
            <div class="w-full lg:w-[45%] p-6 sm:p-10 md:p-14 lg:p-20 flex flex-col justify-center relative bg-white dark:bg-[#1a1a1a] overflow-hidden z-10">
              <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-50/50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8 text-[10px] sm:text-[11px] font-bold tracking-widest text-[#1d1d1f]/40 dark:text-white/40 uppercase relative z-10">
                <span class="text-blue-600 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full backdrop-blur-sm">{{ featured.category }}</span>
                <span class="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/20"></span>
                <span>{{ featured.date }}</span>
              </div>
              
              <h2 class="text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight text-[#1d1d1f] dark:text-white mb-4 sm:mb-8 leading-[1.15] sm:leading-[1.05] group-hover:text-blue-600 transition-colors duration-500 relative z-10 break-words">
                {{ featured.title }}
              </h2>
              
              <p class="text-base sm:text-xl md:text-2xl text-[#1d1d1f]/60 dark:text-white/60 font-serif italic mb-6 sm:mb-12 leading-relaxed relative z-10">
                {{ featured.summary }}
              </p>
              
              <div class="mt-auto flex items-center gap-2 sm:gap-3 text-[#1d1d1f] dark:text-white group-hover:text-blue-600 font-black tracking-widest uppercase text-xs group-hover:translate-x-3 transition-all duration-500 relative z-10">
                Read Story <mat-icon class="transform group-hover:scale-110 transition-transform" style="font-size: 20px; width: 20px; height: 20px;">trending_flat</mat-icon>
              </div>
            </div>
          </article>
        }

        <!-- Grid of older articles -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          @for (article of gridArticles(); track article.id; let i = $index) {
            <article [routerLink]="['/article', article.slug || article.id]" class="animate-fade-in-up group bg-transparent hover:bg-white dark:hover:bg-[#1a1a1a] p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer flex flex-col h-full border border-transparent hover:border-black/[0.04] dark:hover:border-white/10" [style.animation-delay]="(0.3 + (i * 0.1)) + 's'">
              <div class="aspect-[4/3] w-full rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-white/5 relative mb-6 sm:mb-8 shadow-inner">
                <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer"
                     class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" />
                <button 
                  (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(article.id)"
                  class="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-lg text-[#1d1d1f] dark:text-white hover:scale-110 transition-transform cursor-pointer border border-black/5 dark:border-white/10"
                  [title]="bookmarkManager.isBookmarked(article.id) ? 'Remove bookmark' : 'Bookmark article'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" [class.text-blue-600]="bookmarkManager.isBookmarked(article.id)">
                    {{ bookmarkManager.isBookmarked(article.id) ? 'bookmark' : 'bookmark_border' }}
                  </mat-icon>
                </button>
              </div>
              <div class="flex flex-col flex-grow px-1 sm:px-2">
                <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-[10px] sm:text-xs font-bold tracking-widest text-[#1d1d1f]/40 dark:text-white/40 uppercase">
                  <span class="text-blue-600">{{ article.category }}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/20"></span>
                  <span>{{ article.date }}</span>
                </div>
                <h3 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-3 sm:mb-5 leading-[1.2] sm:leading-[1.1] group-hover:text-blue-600 transition-colors duration-300 break-words">
                  {{ article.title }}
                </h3>
                <p class="text-sm sm:text-lg text-[#1d1d1f]/60 dark:text-white/60 font-serif italic leading-relaxed mb-6 sm:mb-10 flex-grow">
                  {{ article.summary }}
                </p>
                <div class="text-[10px] sm:text-xs font-bold tracking-widest text-[#1d1d1f]/30 dark:text-white/30 flex items-center gap-2 mt-auto uppercase">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">schedule</mat-icon>
                  {{ article.readTime }} read
                </div>
              </div>
            </article>
          }
        </div>
      }
    </main>
  `
})
export class HomeComponent {
  readonly searchService = inject(SearchService);
  readonly articleService = inject(ArticleService);
  readonly bookmarkManager = inject(BookmarkManager);
  readonly categories = ['All', 'AI', 'Tech', 'Local'] as const;
  readonly currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  readonly activeCategory = signal<typeof this.categories[number]>('All');

  readonly filteredArticles = computed(() => {
    const category = this.activeCategory();
    const searchTerm = this.searchService.searchTerm().toLowerCase().trim();
    
    let articles = this.articleService.articles();
    if (category !== 'All') {
      articles = articles.filter(a => a.category === category);
    }
    
    if (searchTerm) {
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm) || 
        a.summary.toLowerCase().includes(searchTerm)
      );
    }
    
    return articles;
  });

  readonly featuredArticle = computed(() => {
    const articles = this.filteredArticles();
    return articles.length > 0 ? articles[0] : null;
  });

  readonly gridArticles = computed(() => {
    const articles = this.filteredArticles();
    return articles.length > 1 ? articles.slice(1) : [];
  });

  setCategory(category: typeof this.categories[number]) {
    this.activeCategory.set(category);
  }
}
