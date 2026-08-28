import {ChangeDetectionStrategy, Component, computed, signal, inject, OnInit, OnDestroy} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {SearchService} from './search.service';
import {ArticleService, Article, getTopicFallbackImage, getArticleFactCheck} from './article.service';
import {AdComponent} from './ad.component';
import {BookmarkManager} from './bookmark';
import {SkeletonLoaderComponent} from './skeleton-loader.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [MatIconModule, RouterLink, AdComponent, SkeletonLoaderComponent],
  host: {
    '(touchstart)': 'onTouchStart($event)',
    '(touchmove)': 'onTouchMove($event)',
    '(touchend)': 'onTouchEnd()'
  },
  template: `
    <!-- iOS Pull to Refresh Indicator -->
    @if (pullDistance() > 0 || isRefreshing()) {
      <div 
        class="fixed top-2 left-0 right-0 z-[60] flex justify-center transition-all duration-200 pointer-events-none"
        [style.transform]="'translateY(' + (isRefreshing() ? 50 : Math.min(pullDistance() * 0.45, 90)) + 'px)'">
        <div class="ios-glass shadow-xl rounded-full px-4 py-2 border border-black/5 dark:border-white/10 flex items-center gap-2.5">
          <div 
            class="w-5 h-5 rounded-full border-2 border-[#007AFF]/20 border-t-[#007AFF] animate-spin"
            [class.animate-none]="!isRefreshing()"
            [style.transform]="'rotate(' + (pullDistance() * 3) + 'deg)'">
          </div>
          <span class="text-xs font-semibold text-[#000000] dark:text-white">
            {{ isRefreshing() ? 'Updating stories...' : (pullDistance() > 100 ? 'Release to refresh' : 'Pull to refresh') }}
          </span>
        </div>
      </div>
    }

    <main 
      class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 min-h-[calc(100vh-160px)] transition-transform duration-200"
      [style.transform]="'translateY(' + (isRefreshing() ? 0 : Math.min(pullDistance() * 0.25, 30)) + 'px)'">
      
      <!-- iOS Large Title Header on Mobile -->
      <div class="lg:hidden mb-4 pt-1">
        <div class="flex items-baseline justify-between">
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000000] dark:text-white">
            Today's Feed
          </h1>
          <span class="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider">
            {{ currentDate }}
          </span>
        </div>
      </div>

      <!-- Desktop Editorial Page Header -->
      <header class="hidden lg:block mb-8 text-center animate-fade-in-up">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 text-xs font-bold uppercase tracking-widest text-[#007AFF] dark:text-blue-300 mb-4 border border-blue-100 dark:border-blue-900/40">
          <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse"></span>
          <span>Sri Lanka Tech Journal &bull; {{ currentDate }}</span>
        </div>
        <h1 class="text-6xl lg:text-7xl font-black tracking-tight text-[#000000] dark:text-white mb-3 leading-[0.95]">
          My Feed <span class="text-[#007AFF]">Lk</span>
        </h1>
        <p class="text-base text-[#8e8e93] max-w-2xl mx-auto px-2 leading-relaxed">
          Curated stories in Sinhala & English &bull; Sri Lanka's Modern Tech Edition
        </p>
      </header>

      <!-- iOS Native Search Bar -->
      <div class="max-w-2xl mx-auto mb-4 sm:mb-6 animate-fade-in-up">
        <div class="relative flex items-center bg-black/[0.04] dark:bg-white/[0.08] rounded-xl sm:rounded-2xl transition-all duration-200 px-3.5 py-2 border border-black/[0.04] dark:border-white/[0.06] focus-within:bg-white dark:focus-within:bg-[#1c1c1e] focus-within:ring-2 focus-within:ring-[#007AFF]/40 focus-within:shadow-md">
          <mat-icon style="font-size: 19px; width: 19px; height: 19px;" class="text-[#8e8e93] shrink-0">search</mat-icon>

          <!-- Text Input -->
          <input 
            #searchInput
            type="text" 
            [placeholder]="animatedPlaceholder()"
            [value]="searchService.searchTerm()"
            (input)="onSearchInput($event)"
            class="w-full bg-transparent px-2.5 text-xs sm:text-sm text-[#000000] dark:text-white font-medium focus:outline-none placeholder:text-[#8e8e93]"
          />

          <!-- Clear Button -->
          @if (searchService.searchTerm().trim()) {
            <button 
              (click)="clearSearch()"
              class="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/15 text-[#8e8e93] hover:text-[#000000] dark:hover:text-white transition-all cursor-pointer shrink-0"
              title="Clear search">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
            </button>
          }
        </div>
      </div>

      <!-- iOS Segmented Category Filter Carousel -->
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 mb-6 px-0.5">
        @for (cat of categoryFilters; track cat.id) {
          <button
            (click)="selectCategory(cat.id)"
            class="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 ios-touch cursor-pointer flex items-center gap-1.5"
            [class]="activeCategory() === cat.id 
              ? 'bg-[#007AFF] text-white shadow-sm font-bold' 
              : 'bg-white dark:bg-[#1c1c1e] text-[#000000] dark:text-white border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'">
            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">{{ cat.icon }}</mat-icon>
            <span>{{ cat.label }}</span>
          </button>
        }
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
        <!-- Skeleton Loader State with Shimmer Effect -->
        <div class="space-y-12 sm:space-y-16 py-4 animate-fade-in">
          <!-- Featured skeleton -->
          <div class="space-y-3">
            <div class="h-4 w-36 rounded-full bg-slate-200 dark:bg-zinc-800 animate-pulse"></div>
            <app-skeleton-loader type="featured"></app-skeleton-loader>
          </div>
          <!-- Grid skeleton -->
          <div class="space-y-4">
            <div class="h-4 w-44 rounded-full bg-slate-200 dark:bg-zinc-800 animate-pulse"></div>
            <app-skeleton-loader type="grid"></app-skeleton-loader>
          </div>
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
        <!-- 1. FEATURED LEAD STORY (Apple News Top Story) -->
        <!-- ============================================== -->
        @if (featuredArticle(); as featured) {
          <section class="mb-8 sm:mb-12 animate-fade-in-up">
            <div class="flex items-center justify-between mb-3 px-1">
              <div class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#007AFF] dark:text-[#0A84FF]">
                <span class="w-2 h-2 rounded-full bg-[#007AFF] animate-ping"></span>
                <span>Top Story &bull; ප්‍රධාන පුවත</span>
              </div>
            </div>

            <article [routerLink]="['/article', featured.slug || featured.id]" class="group relative bg-white dark:bg-[#1c1c1e] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer flex flex-col lg:flex-row border border-black/[0.06] dark:border-white/[0.08] ios-card">
              <!-- Feature Image -->
              <div class="w-full lg:w-[55%] overflow-hidden bg-black/[0.03] dark:bg-white/[0.05] relative min-h-[220px] sm:min-h-[320px] lg:min-h-[400px]">
                <img [src]="featured.imageUrl" [alt]="featured.title" referrerpolicy="no-referrer" loading="lazy"
                     #leadImg (load)="leadImg.classList.remove('opacity-0', 'blur-xl', 'scale-110'); leadImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                     (error)="onImgError($event, featured.title, featured.category)"
                     class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out opacity-0 blur-xl scale-110" />
                
                <!-- Overlay Gradient for mobile -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:hidden"></div>

                <!-- Top Badges -->
                <div class="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-wrap items-center gap-1.5">
                  <span class="px-3 py-1 rounded-full bg-[#007AFF] text-white font-bold text-[10px] sm:text-xs tracking-tight shadow-sm">
                    {{ featured.category }}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-semibold text-[10px] sm:text-xs shadow-sm">
                    <mat-icon style="font-size: 13px; width: 13px; height: 13px;">visibility</mat-icon> {{ featured.views || 0 }}
                  </span>
                  @if (getFactCheck(featured); as fc) {
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md font-semibold text-[10px] tracking-tight shadow-sm text-white"
                          [class.bg-[#34C759]/90]="fc.score >= 95"
                          [class.bg-[#FF9500]/90]="fc.score < 95">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">verified</mat-icon>
                      <span>{{ fc.score }}% Verified</span>
                    </span>
                  }
                </div>

                <!-- Bookmark Button -->
                <button 
                  (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(featured.id)"
                  class="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md shadow-sm text-[#000000] dark:text-white flex items-center justify-center ios-touch cursor-pointer border border-black/5 dark:border-white/10"
                  [title]="bookmarkManager.isBookmarked(featured.id) ? 'Remove bookmark' : 'Bookmark article'">
                  <mat-icon style="font-size: 17px; width: 17px; height: 17px;" [class.text-[#007AFF]]="bookmarkManager.isBookmarked(featured.id)">
                    {{ bookmarkManager.isBookmarked(featured.id) ? 'bookmark' : 'bookmark_border' }}
                  </mat-icon>
                </button>
              </div>
              
              <!-- Content Pane -->
              <div class="w-full lg:w-[45%] p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative bg-white dark:bg-[#1c1c1e]">
                <div>
                  <div class="flex flex-wrap items-center gap-2 mb-2 text-[10px] sm:text-xs font-semibold text-[#8e8e93]">
                    <span>{{ featured.date }}</span>
                    @if (featured.uploadTimeStr) {
                      <span>&bull;</span>
                      <span>{{ featured.uploadTimeStr }}</span>
                    }
                    <span>&bull;</span>
                    <span class="flex items-center gap-1 text-[#007AFF] font-bold">
                      <mat-icon style="font-size: 13px; width: 13px; height: 13px;">schedule</mat-icon> {{ featured.readTime }}
                    </span>
                  </div>
                  
                  <h2 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#000000] dark:text-white mb-2 sm:mb-3 leading-snug group-hover:text-[#007AFF] transition-colors duration-200">
                    {{ featured.title }}
                  </h2>
                  
                  <p class="text-xs sm:text-sm text-[#3a3a3c] dark:text-[#d1d1d6] line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal mb-4">
                    {{ featured.summary }}
                  </p>
                </div>

                <div class="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between mt-auto">
                  <div class="flex items-center gap-2">
                    @if (featured.authorType === 'human') {
                      <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-6 h-6 rounded-full object-cover shadow-sm" />
                      <span class="text-xs font-semibold text-[#000000] dark:text-white">Kaveen Sandeepa</span>
                    } @else {
                      <div class="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
                        <mat-icon style="font-size: 13px; width: 13px; height: 13px;">smart_toy</mat-icon>
                      </div>
                      <span class="text-xs font-semibold text-[#000000] dark:text-white">MyFeed AI</span>
                    }
                  </div>

                  <span class="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] group-hover:translate-x-1 transition-transform">
                    Read Story <mat-icon style="font-size: 15px; width: 15px; height: 15px;">chevron_right</mat-icon>
                  </span>
                </div>
              </div>
            </article>
          </section>
        }

        <!-- ============================================== -->
        <!-- 2. LATEST STORIES FEED (Apple News Cards Grid) -->
        <!-- ============================================== -->
        <section class="mb-12 sm:mb-16">
          <div class="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-[10px] bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">grid_view</mat-icon>
              </div>
              <h2 class="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#000000] dark:text-white">
                Latest Stories <span class="text-[#8e8e93] font-normal text-sm sm:text-base">&bull; අලුත්ම පුවත්</span>
              </h2>
            </div>
            
            <span class="text-xs font-semibold text-[#8e8e93]">
              {{ filteredArticles().length }} Stories
            </span>
          </div>

          <!-- ACTIVE ADS BANNER / WIDGET -->
          @if (!searchService.searchTerm()) {
            <div class="mb-6 animate-fade-in-up">
              <app-ad placement="home-top"></app-ad>
            </div>
          }

          <!-- iOS 3-Column News Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            @for (article of visibleGridArticles(); track article.id; let i = $index) {
              <article 
                [routerLink]="['/article', article.slug || article.id]" 
                class="animate-fade-in-up group bg-white dark:bg-[#1c1c1e] p-3.5 sm:p-4 rounded-[20px] sm:rounded-[24px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full border border-black/[0.06] dark:border-white/[0.08] relative overflow-hidden ios-card" 
                [style.animation-delay]="(0.04 + ((i % 8) * 0.04)) + 's'">
                
                <!-- Card Cover Image -->
                <div class="aspect-[16/10] w-full rounded-[14px] sm:rounded-[18px] overflow-hidden bg-black/[0.03] dark:bg-white/[0.05] relative mb-3.5 shadow-inner">
                  <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer" loading="lazy"
                       #gridImg (load)="gridImg.classList.remove('opacity-0', 'blur-xl', 'scale-110'); gridImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                       (error)="onImgError($event, article.title, article.category)"
                       class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500 ease-out opacity-0 blur-xl scale-110" />
                  
                  <!-- Category Badge Tag -->
                  <div class="absolute top-2.5 left-2.5 z-20 flex flex-wrap items-center gap-1">
                    <span class="px-2.5 py-0.5 rounded-full bg-[#007AFF] text-white font-bold text-[9px] sm:text-[10px] tracking-tight shadow-sm">
                      {{ article.category }}
                    </span>
                    @if (article.authorType !== 'human') {
                      <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-semibold text-[9px]">
                        <mat-icon style="font-size: 10px; width: 10px; height: 10px;">smart_toy</mat-icon> AI
                      </span>
                    }
                  </div>

                  <!-- Quick Bookmark Button -->
                  <button 
                    (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(article.id)"
                    class="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md shadow-sm text-[#000000] dark:text-white flex items-center justify-center ios-touch cursor-pointer border border-black/5 dark:border-white/10"
                    [title]="bookmarkManager.isBookmarked(article.id) ? 'Remove bookmark' : 'Bookmark article'">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;" [class.text-[#007AFF]]="bookmarkManager.isBookmarked(article.id)">
                      {{ bookmarkManager.isBookmarked(article.id) ? 'bookmark' : 'bookmark_border' }}
                    </mat-icon>
                  </button>
                </div>

                <!-- Card Body -->
                <div class="flex flex-col flex-grow">
                  <div class="flex flex-wrap items-center gap-1.5 mb-1.5 text-[10px] font-semibold text-[#8e8e93]">
                    <span>{{ article.date }}</span>
                    @if (article.uploadTimeStr) {
                      <span>&bull;</span>
                      <span>{{ article.uploadTimeStr }}</span>
                    }
                  </div>

                  <h3 class="text-base sm:text-lg font-bold tracking-tight text-[#000000] dark:text-white mb-1.5 leading-snug group-hover:text-[#007AFF] transition-colors duration-150 line-clamp-2">
                    {{ article.title }}
                  </h3>

                  <p class="text-xs sm:text-sm text-[#3a3a3c] dark:text-[#aeaeb2] line-clamp-2 sm:line-clamp-3 mb-3 flex-grow leading-relaxed font-normal">
                    {{ article.summary }}
                  </p>

                  <!-- Card Footer -->
                  <div class="flex items-center justify-between pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] text-[10px] sm:text-xs font-semibold text-[#8e8e93] mt-auto">
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size: 13px; width: 13px; height: 13px;">schedule</mat-icon>
                      {{ article.readTime }}
                    </span>

                    <span class="text-[#007AFF] dark:text-[#0A84FF] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                      Read <mat-icon style="font-size: 14px; width: 14px; height: 14px;">chevron_right</mat-icon>
                    </span>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- MORE NEWS / PAGINATION LOAD BUTTON -->
          @if (hasMoreArticles()) {
            <div class="mt-8 sm:mt-10 text-center animate-fade-in-up flex flex-col items-center">
              <button 
                (click)="loadMore()" 
                class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-[#007AFF] text-white font-bold text-xs sm:text-sm tracking-tight shadow-md hover:bg-[#0062cc] active:scale-95 transition-all ios-touch cursor-pointer">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">expand_more</mat-icon>
                <span>Load More Stories</span>
                <span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  +{{ Math.min(PAGE_SIZE, remainingArticlesCount()) }}
                </span>
              </button>
              
              <p class="text-xs text-[#8e8e93] mt-2.5 font-medium">
                Showing {{ visibleGridArticles().length }} of {{ gridArticles().length }} stories
              </p>
            </div>
          } @else if (gridArticles().length > PAGE_SIZE) {
            <div class="mt-8 sm:mt-10 text-center py-3 border-t border-black/[0.06] dark:border-white/[0.08] animate-fade-in">
              <p class="text-xs text-[#8e8e93] font-semibold flex items-center justify-center gap-1.5">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-[#34C759]">check_circle</mat-icon>
                All {{ gridArticles().length }} stories loaded
              </p>
            </div>
          }
        </section>

        <!-- ============================================== -->
        <!-- 3. TOPICAL SECTIONS -->
        <!-- ============================================== -->
        @if (!searchService.searchTerm().trim()) {
          
          <!-- Tech Events & Meetups Showcase Section -->
          <section class="mb-10 sm:mb-14 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] animate-fade-in-up">
            <div class="flex items-center justify-between mb-4 sm:mb-6">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-[10px] bg-[#FF9500] text-white flex items-center justify-center shadow-sm">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">event_upcoming</mat-icon>
                </div>
                <h2 class="text-lg sm:text-xl font-bold tracking-tight text-[#000000] dark:text-white">
                  Tech Events &amp; Meetups <span class="text-[#8e8e93] font-normal text-sm">&bull; සම්මන්ත්‍රණ සහ වැඩමුළු</span>
                </h2>
              </div>
              <a routerLink="/events" class="inline-flex items-center gap-1 text-xs font-bold text-[#FF9500] hover:gap-1.5 transition-all ios-touch cursor-pointer">
                <span>View All Events</span>
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;">chevron_right</mat-icon>
              </a>
            </div>

            <!-- Events Highlight Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div routerLink="/events" class="group bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] text-white p-5 rounded-[24px] border border-white/10 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ios-card">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-0.5 rounded-full bg-[#FF9500] text-white text-[9px] font-extrabold uppercase tracking-wider">
                      Hackathon
                    </span>
                    <span class="text-xs text-white/70 font-semibold flex items-center gap-1">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-[#FF9500]">schedule</mat-icon>
                      Sep 12-13, 2026
                    </span>
                  </div>
                  <h3 class="text-base sm:text-lg font-bold leading-snug group-hover:text-[#FF9500] transition-colors mb-2">
                    Colombo AI Hackathon 2026: Agentic Intelligence &amp; Sinhala NLP
                  </h3>
                  <p class="text-xs text-white/70 line-clamp-2 leading-relaxed mb-4">
                    36-hour physical hackathon bringing together top ML developers at Trace Expert City Maradana.
                  </p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-[#FF9500]">
                  <span class="text-white/80">Trace Expert City, Colombo</span>
                  <span class="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore &amp; RSVP <mat-icon style="font-size: 15px; width: 15px; height: 15px;">arrow_forward</mat-icon>
                  </span>
                </div>
              </div>

              <div routerLink="/events" class="group bg-white dark:bg-[#1c1c1e] p-5 rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ios-card">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-0.5 rounded-full bg-[#007AFF]/15 text-[#007AFF] text-[9px] font-extrabold uppercase tracking-wider">
                      Meetup
                    </span>
                    <span class="text-xs text-[#8e8e93] font-semibold flex items-center gap-1">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-[#007AFF]">schedule</mat-icon>
                      Sep 05, 2026
                    </span>
                  </div>
                  <h3 class="text-base sm:text-lg font-bold tracking-tight text-[#000000] dark:text-white leading-snug group-hover:text-[#007AFF] transition-colors mb-2">
                    GDG Colombo: Modern Cloud &amp; Gemini Architecture Meetup
                  </h3>
                  <p class="text-xs text-[#3a3a3c] dark:text-[#aeaeb2] line-clamp-2 leading-relaxed mb-4">
                    Serverless architectures, Gemini Flash, and cloud deployments live at WSO2 Auditorium.
                  </p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-xs font-bold text-[#007AFF]">
                  <span class="text-[#8e8e93]">WSO2 Auditorium, Colombo 04</span>
                  <span class="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Free RSVP <mat-icon style="font-size: 15px; width: 15px; height: 15px;">arrow_forward</mat-icon>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- AI & Emerging Tech Spotlight Section -->
          @if (getArticlesByCategory('AI').length > 0) {
            <section class="mb-10 sm:mb-14 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] animate-fade-in-up">
              <div class="flex items-center justify-between mb-4 sm:mb-6">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-[10px] bg-[#5856D6] text-white flex items-center justify-center shadow-sm">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">smart_toy</mat-icon>
                  </div>
                  <h2 class="text-lg sm:text-xl font-bold tracking-tight text-[#000000] dark:text-white">
                    AI & Intelligence <span class="text-[#8e8e93] font-normal text-sm">&bull; කෘත්‍රිම බුද්ධිය</span>
                  </h2>
                </div>
                <button (click)="selectCategory('AI')" class="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] hover:gap-1.5 transition-all ios-touch cursor-pointer">
                  <span>See All</span>
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">chevron_right</mat-icon>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                @for (aiArt of getArticlesByCategory('AI').slice(0, 2); track aiArt.id) {
                  <article [routerLink]="['/article', aiArt.slug || aiArt.id]" class="group bg-white dark:bg-[#1c1c1e] p-4 sm:p-5 rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 items-center ios-card">
                    <img [src]="aiArt.imageUrl" [alt]="aiArt.title" referrerpolicy="no-referrer" (error)="onImgError($event, aiArt.title, aiArt.category)" class="w-full sm:w-32 h-32 rounded-[16px] object-cover shrink-0 shadow-inner group-hover:scale-102 transition-transform duration-300" />
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#5856D6] dark:text-[#BF5AF2]">
                        <span class="bg-[#5856D6]/10 dark:bg-[#BF5AF2]/20 px-2 py-0.5 rounded-full">AI Spotlight</span>
                        <span>&bull; {{ aiArt.readTime }}</span>
                      </div>
                      <h3 class="text-sm sm:text-base font-bold tracking-tight text-[#000000] dark:text-white mb-1.5 leading-snug group-hover:text-[#007AFF] transition-colors line-clamp-2">
                        {{ aiArt.title }}
                      </h3>
                      <p class="text-xs text-[#3a3a3c] dark:text-[#aeaeb2] line-clamp-2 leading-relaxed font-normal">
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
            <section class="mb-10 sm:mb-14 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] animate-fade-in-up">
              <div class="flex items-center justify-between mb-4 sm:mb-6">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-[10px] bg-[#34C759] text-white flex items-center justify-center shadow-sm">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">devices</mat-icon>
                  </div>
                  <h2 class="text-lg sm:text-xl font-bold tracking-tight text-[#000000] dark:text-white">
                    Tech & Gadgets <span class="text-[#8e8e93] font-normal text-sm">&bull; තාක්ෂණික පුවත්</span>
                  </h2>
                </div>
                <button (click)="selectCategory('Tech')" class="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] hover:gap-1.5 transition-all ios-touch cursor-pointer">
                  <span>See All</span>
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">chevron_right</mat-icon>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                @for (techArt of getArticlesByCategory('Tech').slice(0, 2); track techArt.id) {
                  <article [routerLink]="['/article', techArt.slug || techArt.id]" class="group bg-white dark:bg-[#1c1c1e] p-4 sm:p-5 rounded-[22px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 items-center ios-card">
                    <img [src]="techArt.imageUrl" [alt]="techArt.title" referrerpolicy="no-referrer" (error)="onImgError($event, techArt.title, techArt.category)" class="w-full sm:w-32 h-32 rounded-[16px] object-cover shrink-0 shadow-inner group-hover:scale-102 transition-transform duration-300" />
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#34C759]">
                        <span class="bg-[#34C759]/10 px-2 py-0.5 rounded-full">Hardware</span>
                        <span>&bull; {{ techArt.readTime }}</span>
                      </div>
                      <h3 class="text-sm sm:text-base font-bold tracking-tight text-[#000000] dark:text-white mb-1.5 leading-snug group-hover:text-[#007AFF] transition-colors line-clamp-2">
                        {{ techArt.title }}
                      </h3>
                      <p class="text-xs text-[#3a3a3c] dark:text-[#aeaeb2] line-clamp-2 leading-relaxed font-normal">
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
  private titleService = inject(Title);
  private metaService = inject(Meta);
  readonly getFactCheck = getArticleFactCheck;
  
  pullDistance = signal(0);
  isRefreshing = signal(false);
  activeCategory = signal<string>('all');
  private startY = 0;

  readonly categoryFilters = [
    { id: 'all', label: 'All Stories', icon: 'auto_stories' },
    { id: 'AI', label: 'AI & Machine', icon: 'smart_toy' },
    { id: 'Tech', label: 'Tech & Gadgets', icon: 'devices' },
    { id: 'Apple', label: 'Apple & iOS', icon: 'phone_iphone' },
    { id: 'Startups', label: 'Startups & Business', icon: 'trending_up' },
    { id: 'Local', label: 'Sri Lanka', icon: 'public' },
    { id: 'Global', label: 'Global', icon: 'language' }
  ];

  selectCategory(catId: string) {
    this.activeCategory.set(catId);
    this.visibleCount.set(this.PAGE_SIZE);
  }

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

  readonly trendingKeywords = computed(() => {
    const articles = this.articleService.articles();
    if (!articles || articles.length === 0) return ['AI', 'Tech', 'Apple', 'Tesla', 'Local'];

    // Sort descending by views
    const sorted = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
    const topKeywords = new Set<string>();

    for (const art of sorted) {
      if (art.category && !['Local', 'Global', 'Entertainment'].includes(art.category)) {
        topKeywords.add(art.category);
      }
      if (topKeywords.size >= 5) break;
    }

    ['AI', 'Tech', 'Apple', 'Tesla'].forEach(k => topKeywords.add(k));

    return Array.from(topKeywords).slice(0, 5);
  });

  ngOnInit() {
    // Set Base SEO tags for Home Page
    this.titleService.setTitle('My Feed Lk | Sri Lanka Tech Journal');
    this.metaService.updateTag({ name: 'description', content: 'තාක්ෂණය, කෘත්‍රිම බුද්ධිය සහ නවෝත්පාදන පුවත්. Curated tech stories in Sinhala and English from Sri Lanka.' });
    this.metaService.updateTag({ property: 'og:title', content: 'My Feed Lk | Sri Lanka Tech Journal' });
    this.metaService.updateTag({ property: 'og:description', content: 'තාක්ෂණය, කෘත්‍රිම බුද්ධිය සහ නවෝත්පාදන පුවත්. Curated tech stories in Sinhala and English from Sri Lanka.' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });

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
    this.visibleCount.set(this.PAGE_SIZE);
  }

  clearSearch() {
    this.searchService.setSearchTerm('');
    this.visibleCount.set(this.PAGE_SIZE);
  }

  applyTrendingTag(tag: string) {
    if (this.searchService.searchTerm().toLowerCase() === tag.toLowerCase()) {
      this.searchService.setSearchTerm('');
    } else {
      this.searchService.setSearchTerm(tag);
    }
    this.visibleCount.set(this.PAGE_SIZE);
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

  
  readonly PAGE_SIZE = 8;
  visibleCount = signal<number>(8);

  readonly filteredArticles = computed(() => {
    const searchTerm = this.searchService.searchTerm().toLowerCase().trim();
    const cat = this.activeCategory();
    let articles = this.articleService.articles();

    if (cat && cat !== 'all') {
      articles = articles.filter(a => a.category?.toLowerCase() === cat.toLowerCase());
    }
    
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
    if (articles.length === 0) return null;

    if (this.searchService.searchTerm().trim()) {
      return articles[0];
    }

    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    const recentArticles = articles.filter(a => {
      const timestamp = a.timestamp || (a.date ? new Date(a.date).getTime() : 0);
      return (now - timestamp) <= threeDaysMs;
    });

    if (recentArticles.length > 0) {
      recentArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
      return recentArticles[0];
    }

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const weekArticles = articles.filter(a => {
      const timestamp = a.timestamp || (a.date ? new Date(a.date).getTime() : 0);
      return (now - timestamp) <= sevenDaysMs;
    });

    if (weekArticles.length > 0) {
      weekArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
      return weekArticles[0];
    }

    return articles[0];
  });

  readonly gridArticles = computed(() => {
    const articles = this.filteredArticles();
    const featured = this.featuredArticle();
    
    if (featured) {
      return articles.filter(a => a.id !== featured.id);
    }
    return articles;
  });

  readonly visibleGridArticles = computed(() => {
    return this.gridArticles().slice(0, this.visibleCount());
  });

  readonly hasMoreArticles = computed(() => {
    return this.gridArticles().length > this.visibleCount();
  });

  readonly remainingArticlesCount = computed(() => {
    return Math.max(0, this.gridArticles().length - this.visibleCount());
  });

  loadMore() {
    this.visibleCount.update(count => count + this.PAGE_SIZE);
  }

  getArticlesByCategory(catName: string): Article[] {
    const all = this.articleService.articles();
    return all.filter(a => a.category?.toLowerCase() === catName.toLowerCase());
  }

  onImgError(event: Event, title = '', category = '') {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = getTopicFallbackImage(title, category);
      target.classList.remove('opacity-0', 'blur-xl', 'scale-110');
      target.classList.add('opacity-100', 'blur-0', 'scale-100');
    }
  }
}
