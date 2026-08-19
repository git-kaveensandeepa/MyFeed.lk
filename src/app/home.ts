import {ChangeDetectionStrategy, Component, computed, signal, inject, OnInit, OnDestroy} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {SearchService} from './search.service';
import {ArticleService, Article} from './article.service';
import {BookmarkManager} from './bookmark';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [MatIconModule, RouterLink],
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchmove)': 'onTouchMove($event)',
    '(touchend)': 'onTouchEnd()'
  },
  template: `
    <!-- Pull to Refresh Indicator -->
    @if (pullDistance() > 0 || isRefreshing()) {
      <div 
        class="fixed top-0 left-0 right-0 z-[60] flex justify-center pt-4 transition-transform duration-200 pointer-events-none"
        [style.transform]="'translateY(' + (isRefreshing() ? 40 : Math.min(pullDistance() * 0.5, 80)) + 'px)'">
        <div class="bg-white dark:bg-[#1a1a1a] shadow-xl rounded-full p-2 border border-black/5 dark:border-white/10 flex items-center justify-center">
          <div 
            class="w-8 h-8 rounded-full border-2 border-blue-600/20 border-t-blue-600 animate-spin"
            [class.animate-none]="!isRefreshing()"
            [style.transform]="'rotate(' + (pullDistance() * 2) + 'deg)'">
            @if (!isRefreshing()) {
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;" class="text-blue-600 flex items-center justify-center">arrow_downward</mat-icon>
            }
          </div>
        </div>
      </div>
    }

    <main 
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14 min-h-[calc(100vh-200px)] transition-transform duration-200"
      [style.transform]="'translateY(' + (isRefreshing() ? 0 : Math.min(pullDistance() * 0.3, 40)) + 'px)'">
      
      <!-- Editorial Page Header -->
      <header class="mb-6 sm:mb-10 text-center animate-fade-in-up">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-3 sm:mb-5 border border-blue-100 dark:border-blue-900/40">
          <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Sri Lanka Tech Journal &bull; {{ currentDate }}</span>
        </div>
        <h1 class="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#1d1d1f] dark:text-white mb-2 sm:mb-4 leading-[1.05] sm:leading-[0.95]">
          The Feed<span class="text-blue-600">.</span>lk
        </h1>
        <p class="text-xs sm:text-base md:text-xl text-[#1d1d1f]/60 dark:text-white/60 font-serif italic max-w-2xl mx-auto px-2">
          තාක්ෂණය, කෘත්‍රිම බුද්ධිය සහ නවෝත්පාදන පුවත් &bull; Curated stories in Sinhala & English
        </p>
      </header>

      <!-- ============================================== -->
      <!-- SUPER ANIMATED MODERN SEARCH BAR -->
      <!-- ============================================== -->
      <div class="max-w-2xl mx-auto mb-10 sm:mb-14 animate-fade-in-up" style="animation-delay: 0.1s;">
        <div class="relative group">
          <!-- Animated Ambient Glow Backdrop -->
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-md opacity-70 group-focus-within:opacity-100 group-hover:opacity-90 transition duration-500"></div>
          
          <!-- Search Box Container -->
          <div class="relative flex items-center bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-full border border-black/10 dark:border-white/10 shadow-lg shadow-black/[0.04] group-focus-within:border-blue-600 dark:group-focus-within:border-blue-500 group-focus-within:ring-4 group-focus-within:ring-blue-600/10 transition-all duration-300 px-4 py-2 sm:py-2.5">
            <!-- Animated Search Icon -->
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-transform group-focus-within:scale-110 group-focus-within:rotate-12 duration-300">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">search</mat-icon>
            </div>

            <!-- Text Input -->
            <input 
              #searchInput
              type="text" 
              [placeholder]="animatedPlaceholder()"
              [value]="searchService.searchTerm()"
              (input)="onSearchInput($event)"
              class="w-full bg-transparent px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-[#1d1d1f] dark:text-white font-medium focus:outline-none placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 placeholder:transition-opacity placeholder:duration-300"
            />

            <!-- Clear Button (when text exists) -->
            @if (searchService.searchTerm().trim()) {
              <button 
                (click)="clearSearch()"
                class="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white transition-all cursor-pointer shrink-0 mr-1 animate-scale-in"
                title="Clear search">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
              </button>
            }

            <!-- Live Matches Badge -->
            @if (searchService.searchTerm().trim()) {
              <div class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm animate-fade-in">
                {{ filteredArticles().length }} found
              </div>
            }
          </div>
        </div>

        <!-- Quick Trending Discovery Tags -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3.5 px-2">
          <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1d1d1f]/40 dark:text-white/40 flex items-center gap-1 mr-1">
            <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-amber-500">trending_up</mat-icon>
            Trending:
          </span>
          @for (tag of trendingKeywords; track tag) {
            <button 
              (click)="applyTrendingTag(tag)"
              class="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer border flex items-center gap-1"
              [class]="searchService.searchTerm().toLowerCase() === tag.toLowerCase() 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-white/80 dark:bg-white/[0.04] text-[#1d1d1f]/70 dark:text-white/70 border-black/5 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/40'">
              <span>#{{ tag }}</span>
            </button>
          }
          @if (searchService.searchTerm().trim()) {
            <button 
              (click)="clearSearch()"
              class="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer">
              Reset
            </button>
          }
        </div>
      </div>

      <!-- Search Active Indicator (if searching) -->
      @if (searchService.searchTerm().trim()) {
        <div class="mb-8 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between animate-fade-in-up">
          <div class="flex items-center gap-2 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-blue-600">search</mat-icon>
            <span>Showing results for <strong>"{{ searchService.searchTerm() }}"</strong> ({{ filteredArticles().length }} articles found)</span>
          </div>
          <button (click)="clearSearch()" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            Clear Search
          </button>
        </div>
      }

      @if (articleService.loading() && filteredArticles().length === 0) {
        <!-- Skeleton Loader State -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse py-12">
          <div class="md:col-span-3 h-80 rounded-3xl bg-gray-200 dark:bg-white/5"></div>
          <div class="h-64 rounded-3xl bg-gray-200 dark:bg-white/5"></div>
          <div class="h-64 rounded-3xl bg-gray-200 dark:bg-white/5"></div>
          <div class="h-64 rounded-3xl bg-gray-200 dark:bg-white/5"></div>
        </div>
      } @else if (filteredArticles().length === 0) {
        <div class="text-center py-16 sm:py-24 text-[#1d1d1f]/40 dark:text-white/40 animate-fade-in-up bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm border border-black/5 dark:border-white/10 mx-auto max-w-2xl mt-4 p-8">
          <div class="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="opacity-40" style="font-size: 32px; width: 32px; height: 32px;">search_off</mat-icon>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-[#1d1d1f]/80 dark:text-white/80 mb-1">ලිපි හමු නොවුණි (No Articles Found)</h2>
          <p class="text-sm">We couldn't find anything matching "{{ searchService.searchTerm() }}".</p>
          <button (click)="clearSearch()" class="mt-5 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-md">
            සියලු පුවත් පෙන්වන්න (View All Stories)
          </button>
        </div>
      } @else {
        
        <!-- ============================================== -->
        <!-- 1. FEATURED LEAD STORY (ප්‍රධාන පුවත) -->
        <!-- ============================================== -->
        @if (featuredArticle(); as featured) {
          <section class="mb-12 sm:mb-16 animate-fade-in-up" style="animation-delay: 0.15s;">
            <div class="flex items-center justify-between mb-3.5">
              <div class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Lead Story &bull; ප්‍රධාන පුවත</span>
              </div>
            </div>

            <article [routerLink]="['/article', featured.slug || featured.id]" class="group relative bg-white dark:bg-[#1a1a1a] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-lg shadow-black/[0.03] hover:shadow-2xl hover:shadow-blue-950/10 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col lg:flex-row border border-black/[0.06] dark:border-white/10">
              <!-- Feature Image -->
              <div class="w-full lg:w-[54%] overflow-hidden bg-gray-100 dark:bg-white/5 relative min-h-[240px] sm:min-h-[340px] lg:min-h-[420px]">
                <img [src]="featured.imageUrl" [alt]="featured.title" referrerpolicy="no-referrer"
                     class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                
                <!-- Overlay Gradient for contrast -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:hidden"></div>

                <!-- Top Badges -->
                <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider shadow-md">
                    {{ featured.category }}
                  </span>
                  @if (featured.authorType !== 'human') {
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white font-bold text-[10px] tracking-wide shadow-md">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">auto_awesome</mat-icon> AI Intelligence
                    </span>
                  }
                </div>

                <!-- Bookmark Button -->
                <button 
                  (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(featured.id)"
                  class="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-md text-[#1d1d1f] dark:text-white hover:scale-110 transition-transform cursor-pointer border border-black/5 dark:border-white/10"
                  [title]="bookmarkManager.isBookmarked(featured.id) ? 'Remove bookmark' : 'Bookmark article'">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;" [class.text-blue-600]="bookmarkManager.isBookmarked(featured.id)">
                    {{ bookmarkManager.isBookmarked(featured.id) ? 'bookmark' : 'bookmark_border' }}
                  </mat-icon>
                </button>
              </div>
              
              <!-- Content Pane -->
              <div class="w-full lg:w-[46%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative bg-white dark:bg-[#1a1a1a]">
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-3 text-[10px] sm:text-xs font-bold tracking-widest text-[#1d1d1f]/40 dark:text-white/40 uppercase">
                    <span>{{ featured.date }}</span>
                    @if (featured.uploadTimeStr) {
                      <span class="w-1 h-1 rounded-full bg-black/20 dark:bg-white/30"></span>
                      <span>{{ featured.uploadTimeStr }}</span>
                    }
                    <span class="w-1 h-1 rounded-full bg-black/20 dark:bg-white/30"></span>
                    <span class="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">schedule</mat-icon> {{ featured.readTime }}
                    </span>
                  </div>
                  
                  <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-3 leading-snug group-hover:text-blue-600 transition-colors duration-300 break-words">
                    {{ featured.title }}
                  </h2>
                  
                  <p class="text-xs sm:text-base text-[#1d1d1f]/70 dark:text-white/70 font-serif italic mb-6 leading-relaxed line-clamp-3 sm:line-clamp-4">
                    {{ featured.summary }}
                  </p>
                </div>

                <div class="pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between mt-auto">
                  <div class="flex items-center gap-2">
                    @if (featured.authorType === 'human') {
                      <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-7 h-7 rounded-full object-cover shadow-sm" />
                      <span class="text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70">Kaveen Sandeepa</span>
                    } @else {
                      <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">smart_toy</mat-icon>
                      </div>
                      <span class="text-xs font-bold text-[#1d1d1f]/70 dark:text-white/70">MyFeed AI</span>
                    }
                  </div>

                  <span class="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    Read Story <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_forward</mat-icon>
                  </span>
                </div>
              </div>
            </article>
          </section>
        }

        <!-- ============================================== -->
        <!-- 2. LATEST STORIES FEED (අලුත්ම පුවත් ගැලරිය) -->
        <!-- ============================================== -->
        <section class="mb-14 sm:mb-20">
          <div class="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-black/5 dark:border-white/10">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">grid_view</mat-icon>
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                  අලුත්ම පුවත් <span class="text-[#1d1d1f]/40 dark:text-white/40 font-serif italic text-base sm:text-xl font-normal">&bull; Latest Stories</span>
                </h2>
              </div>
            </div>
            
            <span class="text-xs font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase tracking-widest hidden sm:inline">
              Updated Live
            </span>
          </div>

          <!-- Responsive 3-Column Modern News Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            @for (article of gridArticles(); track article.id; let i = $index) {
              <article 
                [routerLink]="['/article', article.slug || article.id]" 
                class="animate-fade-in-up group bg-white dark:bg-[#1a1a1a] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-blue-950/20 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col h-full border border-black/[0.06] dark:border-white/10 relative overflow-hidden" 
                [style.animation-delay]="(0.1 + (i * 0.06)) + 's'">
                
                <!-- Card Cover Image -->
                <div class="aspect-[16/10] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 relative mb-4 shadow-inner">
                  <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer"
                       class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                  
                  <!-- Category Badge Tag -->
                  <div class="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                    <span class="px-2.5 py-0.5 rounded-full bg-blue-600/95 text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-sm">
                      {{ article.category }}
                    </span>
                    @if (article.authorType !== 'human') {
                      <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-indigo-300 font-bold text-[9px]">
                        <mat-icon style="font-size: 10px; width: 10px; height: 10px;">auto_awesome</mat-icon> AI
                      </span>
                    }
                  </div>

                  <!-- Quick Bookmark Button -->
                  <button 
                    (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(article.id)"
                    class="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-md text-[#1d1d1f] dark:text-white hover:scale-110 transition-transform cursor-pointer border border-black/5 dark:border-white/10"
                    [title]="bookmarkManager.isBookmarked(article.id) ? 'Remove bookmark' : 'Bookmark article'">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;" [class.text-blue-600]="bookmarkManager.isBookmarked(article.id)">
                      {{ bookmarkManager.isBookmarked(article.id) ? 'bookmark' : 'bookmark_border' }}
                    </mat-icon>
                  </button>
                </div>

                <!-- Card Body -->
                <div class="flex flex-col flex-grow">
                  <div class="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase text-[#1d1d1f]/40 dark:text-white/40">
                    <span>{{ article.date }}</span>
                    @if (article.uploadTimeStr) {
                      <span class="w-1 h-1 rounded-full bg-black/10 dark:bg-white/20"></span>
                      <span>{{ article.uploadTimeStr }}</span>
                    }
                  </div>

                  <h3 class="text-base sm:text-lg md:text-xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                    {{ article.title }}
                  </h3>

                  <p class="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 font-serif italic line-clamp-2 sm:line-clamp-3 mb-4 flex-grow leading-relaxed">
                    {{ article.summary }}
                  </p>

                  <!-- Card Footer -->
                  <div class="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-[10px] sm:text-xs font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase mt-auto">
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size: 13px; width: 13px; height: 13px;">schedule</mat-icon>
                      {{ article.readTime }}
                    </span>

                    <span class="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read <mat-icon style="font-size: 13px; width: 13px; height: 13px;">arrow_forward</mat-icon>
                    </span>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>

        <!-- ============================================== -->
        <!-- 3. TOPICAL SECTIONS -->
        <!-- ============================================== -->
        @if (!searchService.searchTerm().trim()) {
          
          <!-- AI & Emerging Tech Spotlight Section -->
          @if (getArticlesByCategory('AI').length > 0) {
            <section class="mb-14 sm:mb-20 pt-8 border-t border-black/5 dark:border-white/10 animate-fade-in-up">
              <div class="flex items-center justify-between mb-6 sm:mb-8">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">smart_toy</mat-icon>
                  </div>
                  <div>
                    <h2 class="text-xl sm:text-2xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                      කෘත්‍රිම බුද්ධිය <span class="text-[#1d1d1f]/40 dark:text-white/40 font-serif italic text-base sm:text-lg font-normal">&bull; AI & Machine Intelligence</span>
                    </h2>
                  </div>
                </div>
                <button (click)="applyTrendingTag('AI')" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all cursor-pointer group">
                  <span>සියල්ල (See All)</span>
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                @for (aiArt of getArticlesByCategory('AI').slice(0, 2); track aiArt.id) {
                  <article [routerLink]="['/article', aiArt.slug || aiArt.id]" class="group bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-5 sm:p-6 rounded-3xl border border-blue-100/80 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-500 cursor-pointer flex flex-col sm:flex-row gap-5 items-center">
                    <img [src]="aiArt.imageUrl" [alt]="aiArt.title" referrerpolicy="no-referrer" class="w-full sm:w-36 h-36 rounded-2xl object-cover shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500" />
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-2 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <span class="bg-indigo-100/80 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">AI Report</span>
                        <span>{{ aiArt.readTime }} read</span>
                      </div>
                      <h3 class="text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {{ aiArt.title }}
                      </h3>
                      <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60 font-serif italic line-clamp-2 leading-relaxed">
                        {{ aiArt.summary }}
                      </p>
                    </div>
                  </article>
                }
              </div>
            </section>
          }

          <!-- Tech & Innovations Section -->
          @if (getArticlesByCategory('Tech').length > 0) {
            <section class="mb-14 sm:mb-20 pt-8 border-t border-black/5 dark:border-white/10 animate-fade-in-up">
              <div class="flex items-center justify-between mb-6 sm:mb-8">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shadow-md">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">devices</mat-icon>
                  </div>
                  <div>
                    <h2 class="text-xl sm:text-2xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                      තාක්ෂණික පුවත් <span class="text-[#1d1d1f]/40 dark:text-white/40 font-serif italic text-base sm:text-lg font-normal">&bull; Tech & Gadgets</span>
                    </h2>
                  </div>
                </div>
                <button (click)="applyTrendingTag('Tech')" class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all cursor-pointer group">
                  <span>සියල්ල (See All)</span>
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                @for (techArt of getArticlesByCategory('Tech').slice(0, 2); track techArt.id) {
                  <article [routerLink]="['/article', techArt.slug || techArt.id]" class="group bg-white dark:bg-[#1a1a1a] p-5 sm:p-6 rounded-3xl border border-black/[0.06] dark:border-white/10 hover:border-blue-600/40 hover:shadow-lg transition-all duration-500 cursor-pointer flex flex-col sm:flex-row gap-5 items-center">
                    <img [src]="techArt.imageUrl" [alt]="techArt.title" referrerpolicy="no-referrer" class="w-full sm:w-36 h-36 rounded-2xl object-cover shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500" />
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-2 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        <span class="bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">Hardware & Tech</span>
                        <span>{{ techArt.readTime }} read</span>
                      </div>
                      <h3 class="text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-white mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {{ techArt.title }}
                      </h3>
                      <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60 font-serif italic line-clamp-2 leading-relaxed">
                        {{ techArt.summary }}
                      </p>
                    </div>
                  </article>
                }
              </div>
            </section>
          }
        }
      }
    </main>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly Math = Math;
  readonly searchService = inject(SearchService);
  readonly articleService = inject(ArticleService);
  readonly bookmarkManager = inject(BookmarkManager);
  
  pullDistance = signal(0);
  isRefreshing = signal(false);
  private startY = 0;

  readonly currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Rotating placeholder suggestions
  readonly placeholderSuggestions = [
    'කෘත්‍රිම බුද්ධිය (AI) පුවත් සොයන්න...',
    'Search Sri Lanka tech startups & telecom...',
    'තාක්ෂණික පුවත් සොයන්න (Search Tech)...',
    'Search Apple, Tesla, OpenAI, Google...',
    'Search gadgets, chips & innovations...'
  ];
  
  animatedPlaceholder = signal<string>(this.placeholderSuggestions[0]);
  private placeholderTimer: ReturnType<typeof setInterval> | null = null;
  private placeholderIndex = 0;

  readonly trendingKeywords = ['AI', 'Tech', 'Apple', 'Tesla', 'Google', 'Local'];

  ngOnInit() {
    // Rotate placeholder text every 3 seconds
    if (typeof window !== 'undefined') {
      this.placeholderTimer = setInterval(() => {
        this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholderSuggestions.length;
        this.animatedPlaceholder.set(this.placeholderSuggestions[this.placeholderIndex]);
      }, 3000);
    }
  }

  ngOnDestroy() {
    if (this.placeholderTimer) {
      clearInterval(this.placeholderTimer);
    }
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }

  clearSearch() {
    this.searchService.setSearchTerm('');
  }

  applyTrendingTag(tag: string) {
    if (this.searchService.searchTerm().toLowerCase() === tag.toLowerCase()) {
      this.searchService.setSearchTerm('');
    } else {
      this.searchService.setSearchTerm(tag);
    }
  }

  onTouchStart(event: TouchEvent) {
    if (typeof window !== 'undefined' && window.scrollY === 0) {
      this.startY = event.touches[0].pageY;
    }
  }

  onTouchMove(event: TouchEvent) {
    if (typeof window !== 'undefined' && window.scrollY === 0 && !this.isRefreshing()) {
      const currentY = event.touches[0].pageY;
      const distance = currentY - this.startY;
      if (distance > 0) {
        this.pullDistance.set(distance);
        if (distance > 10) {
          if (event.cancelable) event.preventDefault();
        }
      }
    }
  }

  async onTouchEnd() {
    if (this.pullDistance() > 120 && !this.isRefreshing()) {
      await this.refresh();
    }
    this.pullDistance.set(0);
  }

  async refresh() {
    this.isRefreshing.set(true);
    try {
      await this.articleService.loadArticles();
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      this.isRefreshing.set(false);
    }
  }

  readonly filteredArticles = computed(() => {
    const searchTerm = this.searchService.searchTerm().toLowerCase().trim();
    let articles = this.articleService.articles();
    
    if (searchTerm) {
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchTerm) || 
        a.summary.toLowerCase().includes(searchTerm) ||
        (a.category && a.category.toLowerCase().includes(searchTerm)) ||
        (a.content && a.content.toLowerCase().includes(searchTerm))
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
    if (articles.length > 1) {
      return articles.slice(1);
    }
    return [];
  });

  getArticlesByCategory(catName: string): Article[] {
    const all = this.articleService.articles();
    return all.filter(a => a.category?.toLowerCase() === catName.toLowerCase());
  }
}
