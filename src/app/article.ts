import {ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, signal, untracked, ChangeDetectorRef} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {ArticleService, getTopicFallbackImage, getCuratedTopicImages, getArticleFactCheck, Article, ArticleComment} from './article.service';
import {BookmarkManager} from './bookmark';
import {SkeletonLoaderComponent} from './skeleton-loader.component';
import {AuthService} from './auth.service';
import {auth} from './firebase';
import {onAuthStateChanged} from 'firebase/auth';
import {onSnapshot, Unsubscribe} from 'firebase/firestore';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-article',
  imports: [MatIconModule, RouterLink, SkeletonLoaderComponent, FormsModule, DatePipe],
  template: `
    @if (articleService.loading() && !article()) {
      <app-skeleton-loader type="article-detail"></app-skeleton-loader>
    } @else if (article(); as article) {
      <!-- Progress Bar -->
      <div class="fixed top-0 left-0 w-full h-1 z-[60] bg-transparent">
        <div class="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" [style.width.%]="scrollProgress()"></div>
      </div>

      <!-- Toast Notification -->
      @if (toastMessage()) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] animate-fade-in-up flex items-center gap-3 px-5 py-3 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#121212] shadow-2xl border border-black/10 dark:border-white/20 text-xs sm:text-sm font-semibold max-w-[90vw]">
          <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-blue-400 dark:text-blue-600 shrink-0">check_circle</mat-icon>
          <span>{{ toastMessage() }}</span>
        </div>
      }

      <main class="animate-fade-in-up pb-16 sm:pb-32 w-full max-w-full overflow-hidden">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-12 md:pt-16 pb-6 sm:pb-12">
          
          <!-- ADMIN QUICK CONTROLS BAR (Visible only to authorized Admin) -->
          @if (isAdmin()) {
            <div class="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-red-200/50 dark:border-red-900/30 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div class="flex items-center gap-2 text-xs font-bold text-[#1d1d1f] dark:text-white">
                <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-red-600">admin_panel_settings</mat-icon>
                <span>Admin Quick Controls (කර්තෘ පාලන පුවරුව)</span>
              </div>
              <div class="flex items-center gap-2">
                <a routerLink="/admin" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-white/10 hover:bg-gray-50 text-[#1d1d1f] dark:text-white text-xs font-bold transition-all shadow-sm border border-black/5 dark:border-white/10">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">dashboard</mat-icon>
                  <span>Admin Panel</span>
                </a>
                <button 
                  (click)="openQuickImageModal(article)"
                  class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer active:scale-95">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">photo_camera</mat-icon>
                  <span>Change Image (පින්තූරය වෙනස් කරන්න)</span>
                </button>
                <button 
                  (click)="openDeleteModal()"
                  class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shadow-red-600/20 cursor-pointer active:scale-95">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete_forever</mat-icon>
                  <span>Delete Story (පුවත මකන්න)</span>
                </button>
              </div>
            </div>
          }

          <!-- iOS Top Navigation & Action Controls Bar -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div class="flex items-center gap-2.5">
              <a routerLink="/" class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-xs font-bold text-[#000000] dark:text-white ios-touch cursor-pointer group shrink-0">
                <mat-icon class="text-[#007AFF] group-hover:-translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">chevron_left</mat-icon>
                <span>Journal</span>
              </a>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] sm:text-xs font-semibold">
                <mat-icon style="font-size: 13px; width: 13px; height: 13px;">visibility</mat-icon>
                {{ article.views || 0 }} Views
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <!-- Social Story Card / Poster Generator Button -->
              <button 
                (click)="openPosterModal(article)"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007AFF] text-white font-bold text-xs shadow-sm hover:bg-[#0062cc] active:scale-95 transition-all ios-touch cursor-pointer"
                title="Create Social Media Story Card">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;">image</mat-icon>
                <span>Poster</span>
              </button>

              <!-- WhatsApp Direct Share & Forward Button -->
              <button 
                (click)="shareToWhatsApp(article)"
                [disabled]="isSharing()"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#34C759] text-white font-bold text-xs shadow-sm hover:bg-[#2db24e] active:scale-95 transition-all ios-touch cursor-pointer"
                title="Forward article to WhatsApp">
                @if (isSharing()) {
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="animate-spin">sync</mat-icon>
                } @else {
                  <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                }
                <span>Share</span>
              </button>

              <!-- Bookmark -->
              <button 
                (click)="bookmarkManager.toggleBookmark(article.id)"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[#000000] dark:text-white font-bold text-xs ios-touch cursor-pointer border border-black/5 dark:border-white/10"
                title="Save article to bookmarks">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" [class.text-[#007AFF]]="bookmarkManager.isBookmarked(article.id)">
                  {{ bookmarkManager.isBookmarked(article.id) ? 'bookmark' : 'bookmark_border' }}
                </mat-icon>
                <span>{{ bookmarkManager.isBookmarked(article.id) ? 'Saved' : 'Save' }}</span>
              </button>
            </div>
          </div>

          <header class="mb-8 sm:mb-12 text-center max-w-full overflow-hidden">
            <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-3 sm:mb-5 text-[10px] sm:text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
              <span class="text-[#007AFF] font-bold">{{ article.category }}</span>
              <span>&bull;</span>
              <span>{{ article.date }} @if (article.uploadTimeStr) { &bull; {{ article.uploadTimeStr }} }</span>
              <span>&bull;</span>
              <span class="flex items-center gap-1 text-[#007AFF]"><mat-icon style="font-size: 13px; width: 13px; height: 13px;">schedule</mat-icon> {{ article.readTime }}</span>
            </div>
            
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#000000] dark:text-white mb-3 sm:mb-6 leading-[1.2] max-w-4xl mx-auto break-words">
              {{ article.title }}
            </h1>
            
            <p class="text-sm sm:text-base md:text-lg text-[#3a3a3c] dark:text-[#aeaeb2] leading-relaxed max-w-3xl mx-auto break-words font-normal">
              {{ article.summary }}
            </p>
          </header>
        </div>

        <!-- Featured Image Figure -->
        <figure class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-14 relative group">
          <div class="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2.2/1] rounded-[22px] sm:rounded-[32px] overflow-hidden bg-black/[0.03] dark:bg-white/[0.05] relative shadow-sm border border-black/[0.06] dark:border-white/[0.08] ios-card">
            <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer" loading="eager"
                 #mainImg (load)="mainImg.classList.remove('opacity-0', 'blur-xl', 'scale-105'); mainImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                 (error)="onImgError($event, article.title, article.category)"
                 class="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 blur-xl scale-105" />
            
            @if (isAdmin()) {
              <button 
                (click)="openQuickImageModal(article)"
                class="absolute top-3.5 right-3.5 z-20 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-bold backdrop-blur-md shadow-md flex items-center gap-1.5 transition-all ios-touch cursor-pointer">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-amber-400">photo_camera</mat-icon>
                <span>Change Cover</span>
              </button>
            }
          </div>
        </figure>

        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 max-w-full overflow-hidden">
          <!-- Author / Byline Block with AI Transparency Compliance -->
          <div class="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
            @if (article.authorType === 'human') {
              <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover bg-black/[0.03] dark:bg-white/[0.05] shadow-sm shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-[#000000] dark:text-white text-sm sm:text-base truncate flex items-center gap-1.5">
                  <span>Kaveen Sandeepa</span>
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-[#007AFF]">verified</mat-icon>
                </div>
                <div class="text-xs font-normal text-[#8e8e93]">Editor-in-Chief &bull; MyFeed.lk</div>
              </div>
            } @else {
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-[#007AFF] flex items-center justify-center text-white shadow-sm shrink-0">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">smart_toy</mat-icon>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="font-bold text-[#000000] dark:text-white text-sm sm:text-base">MyFeed AI Desk</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF]/10 text-[#007AFF]">
                    AI-Assisted
                  </span>
                </div>
                <div class="text-xs font-normal text-[#8e8e93] leading-snug">
                  Supervised &amp; Edited by MyFeed Editorial Team
                </div>
              </div>
            }
          </div>

          <!-- Quick Fact-Check & Credibility Status Ribbon -->
          @if (factCheck(); as fc) {
            <div class="mb-6 p-3.5 sm:p-4 rounded-[18px] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-xs ios-card">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-xs font-extrabold shadow-xs shrink-0"
                     [class.bg-[#34C759]]="fc.score >= 95"
                     [class.bg-[#FF9500]]="fc.score < 95">
                  {{ fc.score }}%
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;" [class.text-[#34C759]]="fc.score >= 95" [class.text-[#FF9500]]="fc.score < 95">verified</mat-icon>
                    <span>{{ fc.score === 100 ? '100% Verified Source' : fc.statusBadge }}</span>
                  </div>
                  <div class="text-[11px] text-[#8e8e93]">
                    @if (fc.sources[0]?.name) {
                      Source: <span class="font-semibold text-[#007AFF]">{{ fc.sources[0]?.name }}</span>
                    } @else {
                      MyFeed AI &amp; Editorial Verified
                    }
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                @if (fc.sources[0]?.url) {
                  <a [href]="fc.sources[0]?.url" target="_blank" rel="noopener noreferrer"
                     class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold hover:bg-[#007AFF]/20 transition-colors ios-touch"
                     title="Open original primary source in new tab">
                    <span>Source</span>
                    <mat-icon style="font-size: 12px; width: 12px; height: 12px;">open_in_new</mat-icon>
                  </a>
                }
                <button (click)="scrollToFactCheck()" 
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[#000000] dark:text-white text-xs font-bold transition-colors ios-touch cursor-pointer">
                  <span>Report</span>
                  <mat-icon style="font-size: 13px; width: 13px; height: 13px;">arrow_downward</mat-icon>
                </button>
              </div>
            </div>
          }

          <!-- Article Body Content -->
          <div 
            class="prose prose-base sm:prose-lg max-w-none text-[#2c2c2e] dark:text-[#d1d1d6] leading-[1.8] font-sans break-words overflow-hidden [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-[#000000] [&_h2]:dark:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-4 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-[#000000] [&_strong]:dark:text-white"
            [innerHTML]="article.content">
          </div>

          <!-- ======================================================== -->
          <!-- FACT-CHECK & CREDIBILITY METER (Apple Inset Style) -->
          <!-- ======================================================== -->
          @if (factCheck(); as fc) {
            <section id="factCheckSection" class="mt-8 sm:mt-12 rounded-[22px] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-7 shadow-xs relative overflow-hidden ios-card">
              
              <!-- Top Header & Score -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shadow-sm shrink-0"
                       [class.bg-[#34C759]]="fc.score >= 95"
                       [class.bg-[#FF9500]]="fc.score < 95">
                    <mat-icon style="font-size: 22px; width: 22px; height: 22px;">verified</mat-icon>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-base font-bold tracking-tight text-[#000000] dark:text-white">
                        Fact Check &amp; Credibility
                      </h3>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF]/10 text-[#007AFF]">
                        Verified
                      </span>
                    </div>
                    <p class="text-xs text-[#8e8e93] font-normal">
                      Information accuracy and source transparency
                    </p>
                  </div>
                </div>

                <!-- Score Badge -->
                <div class="flex items-center gap-2.5 self-start sm:self-auto bg-black/[0.03] dark:bg-white/[0.05] p-2 pr-3.5 rounded-[14px]">
                  <div class="w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-xs text-white"
                       [class.bg-[#34C759]]="fc.score >= 95"
                       [class.bg-[#FF9500]]="fc.score < 95">
                    {{ fc.score }}%
                  </div>
                  <div class="text-left">
                    <div class="text-[11px] font-bold"
                         [class.text-[#34C759]]="fc.score >= 95"
                         [class.text-[#FF9500]]="fc.score < 95">
                      {{ fc.statusBadge }}
                    </div>
                    <div class="text-[10px] text-[#8e8e93]">
                      Trust Score
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reason & Transparency Box -->
              <div class="py-4">
                <div class="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] mb-2 flex items-center gap-1.5">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-[#007AFF]">info</mat-icon>
                  <span>Verification Analysis:</span>
                </div>

                <div class="p-3.5 rounded-[16px] border text-xs leading-relaxed font-sans font-medium"
                     [class.bg-[#34C759]/10]="fc.score >= 95"
                     [class.border-[#34C759]/20]="fc.score >= 95"
                     [class.text-[#000000]]="fc.score >= 95"
                     [class.dark:text-[#d1d1d6]]="fc.score >= 95"
                     [class.bg-[#FF9500]/10]="fc.score < 95"
                     [class.border-[#FF9500]/20]="fc.score < 95"
                     [class.text-[#000000]]="fc.score < 95"
                     [class.dark:text-[#d1d1d6]]="fc.score < 95">
                  @if (fc.score === 100) {
                    <div class="flex items-start gap-1.5">
                      <span class="text-[#34C759] font-bold shrink-0">✓ Verified:</span>
                      <span>{{ fc.reason }}</span>
                    </div>
                  } @else {
                    <div class="flex flex-col gap-1">
                      <div class="flex items-start gap-1.5">
                        <span class="text-[#FF9500] font-bold shrink-0">⚠ Note:</span>
                        <span>{{ fc.reason }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Verified Source Links -->
              <div class="pt-2 pb-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div class="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] mb-2.5 flex items-center gap-1.5">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-[#007AFF]">link</mat-icon>
                  <span>Source Citations:</span>
                </div>

                <div class="flex flex-wrap gap-2">
                  @for (src of fc.sources; track src.name) {
                    @if (src.url) {
                      <a [href]="src.url" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-black/[0.03] dark:bg-white/[0.05] hover:bg-[#007AFF]/10 text-[#007AFF] font-bold text-xs border border-black/[0.06] dark:border-white/[0.08] transition-all ios-touch group">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-[#007AFF]">public</mat-icon>
                        <span>{{ src.name }}</span>
                        @if (src.isPrimary) {
                          <span class="px-1 py-0.2 rounded bg-[#007AFF]/20 text-[#007AFF] text-[9px] font-bold uppercase">Primary</span>
                        }
                        <mat-icon style="font-size: 12px; width: 12px; height: 12px;" class="text-[#8e8e93]">open_in_new</mat-icon>
                      </a>
                    } @else {
                      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.04] text-[#8e8e93] font-semibold text-xs border border-black/[0.06] dark:border-white/[0.08]">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-[#8e8e93]">newspaper</mat-icon>
                        <span>{{ src.name }}</span>
                      </div>
                    }
                  }
                </div>
              </div>

              <!-- 3-Pillar Breakdown Bars -->
              <div class="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs flex-1">
                  <div class="p-2.5 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                    <div class="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#8e8e93]">
                      <span>Source Reliability</span>
                      <span class="font-bold text-[#34C759]">{{ fc.metrics.sourceReliability }}%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div class="h-full bg-[#34C759] rounded-full" [style.width.%]="fc.metrics.sourceReliability"></div>
                    </div>
                  </div>

                  <div class="p-2.5 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                    <div class="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#8e8e93]">
                      <span>Factual Accuracy</span>
                      <span class="font-bold text-[#007AFF]">{{ fc.metrics.factualAccuracy }}%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div class="h-full bg-[#007AFF] rounded-full" [style.width.%]="fc.metrics.factualAccuracy"></div>
                    </div>
                  </div>

                  <div class="p-2.5 rounded-[14px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                    <div class="flex justify-between items-center mb-1 text-[11px] font-semibold text-[#8e8e93]">
                      <span>Editorial Review</span>
                      <span class="font-bold text-[#5856D6]">{{ fc.metrics.editorialReview }}%</span>
                    </div>
                    <div class="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div class="h-full bg-[#5856D6] rounded-full" [style.width.%]="fc.metrics.editorialReview"></div>
                    </div>
                  </div>
                </div>

                <!-- Report Inaccuracy button -->
                <button (click)="reportInaccuracy()"
                        class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[14px] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#8e8e93] hover:text-[#000000] dark:hover:text-white text-xs font-semibold transition-colors ios-touch cursor-pointer shrink-0">
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">flag</mat-icon>
                  <span>Report/Suggest</span>
                </button>
              </div>

            </section>
          }

          <!-- Reactions -->
          <div class="mt-6 sm:mt-10 flex flex-wrap items-center gap-2 sm:gap-3 border-t border-b border-black/[0.06] dark:border-white/[0.08] py-4 sm:py-6">
            <span class="text-xs font-bold text-[#8e8e93] uppercase tracking-wider mr-1">React:</span>
            
            <button (click)="toggleReaction('like')" [class.bg-blue-100]="currentReaction() === 'like'" [class.dark:bg-blue-950]="currentReaction() === 'like'" [class.border-[#007AFF]]="currentReaction() === 'like'" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1e] ios-touch cursor-pointer">
              <mat-icon [class.text-[#007AFF]]="currentReaction() === 'like'" class="text-[#8e8e93]" style="font-size: 17px; width: 17px; height: 17px;">thumb_up</mat-icon>
              <span class="text-xs font-bold text-[#000000] dark:text-white">{{ article.reactions?.['like'] || 0 }}</span>
            </button>
            
            <button (click)="toggleReaction('love')" [class.bg-red-100]="currentReaction() === 'love'" [class.dark:bg-red-950]="currentReaction() === 'love'" [class.border-[#FF2D55]]="currentReaction() === 'love'" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1e] ios-touch cursor-pointer">
              <mat-icon [class.text-[#FF2D55]]="currentReaction() === 'love'" class="text-[#8e8e93]" style="font-size: 17px; width: 17px; height: 17px;">favorite</mat-icon>
              <span class="text-xs font-bold text-[#000000] dark:text-white">{{ article.reactions?.['love'] || 0 }}</span>
            </button>
            
            <button (click)="toggleReaction('fire')" [class.bg-orange-100]="currentReaction() === 'fire'" [class.dark:bg-orange-950]="currentReaction() === 'fire'" [class.border-[#FF9500]]="currentReaction() === 'fire'" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1e] ios-touch cursor-pointer">
              <mat-icon [class.text-[#FF9500]]="currentReaction() === 'fire'" class="text-[#8e8e93]" style="font-size: 17px; width: 17px; height: 17px;">local_fire_department</mat-icon>
              <span class="text-xs font-bold text-[#000000] dark:text-white">{{ article.reactions?.['fire'] || 0 }}</span>
            </button>

            <button (click)="toggleReaction('insight')" [class.bg-amber-100]="currentReaction() === 'insight'" [class.dark:bg-amber-950]="currentReaction() === 'insight'" [class.border-[#FFCC00]]="currentReaction() === 'insight'" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1e] ios-touch cursor-pointer">
              <mat-icon [class.text-[#FFCC00]]="currentReaction() === 'insight'" class="text-[#8e8e93]" style="font-size: 17px; width: 17px; height: 17px;">lightbulb</mat-icon>
              <span class="text-xs font-bold text-[#000000] dark:text-white">{{ article.reactions?.['insight'] || 0 }}</span>
            </button>
            
            <button (click)="toggleReaction('rocket')" [class.bg-purple-100]="currentReaction() === 'rocket'" [class.dark:bg-purple-950]="currentReaction() === 'rocket'" [class.border-[#AF52DE]]="currentReaction() === 'rocket'" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#1c1c1e] ios-touch cursor-pointer">
              <mat-icon [class.text-[#AF52DE]]="currentReaction() === 'rocket'" class="text-[#8e8e93]" style="font-size: 17px; width: 17px; height: 17px;">rocket_launch</mat-icon>
              <span class="text-xs font-bold text-[#000000] dark:text-white">{{ article.reactions?.['rocket'] || 0 }}</span>
            </button>
          </div>

          <!-- Bottom Action & Sharing Bar for Readers -->
          <div class="mt-6 sm:mt-10 p-5 sm:p-6 rounded-[22px] bg-white dark:bg-[#1c1c1e] border border-black/[0.06] dark:border-white/[0.08] shadow-xs ios-card">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div>
                <h3 class="text-base font-bold tracking-tight text-[#000000] dark:text-white mb-0.5">
                  Share this Story
                </h3>
                <p class="text-xs text-[#8e8e93]">
                  Forward story summary and link directly
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <!-- WhatsApp Forward Button -->
                <button 
                  (click)="shareToWhatsApp(article)"
                  [disabled]="isSharing()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34C759] text-white hover:bg-[#2db24e] font-bold text-xs transition-all ios-touch cursor-pointer shadow-sm">
                  @if (isSharing()) {
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="animate-spin">sync</mat-icon>
                  } @else {
                    <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  }
                  <span>WhatsApp</span>
                </button>

                <!-- Facebook Share Button -->
                <button 
                  (click)="shareToFacebook(article)"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] font-bold text-xs transition-all ios-touch cursor-pointer shadow-sm">
                  <svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                  <span>Share</span>
                </button>

                <!-- Copy Link -->
                <button 
                  (click)="copyLink()"
                  class="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[#000000] dark:text-white font-bold text-xs transition-all ios-touch cursor-pointer">
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">share</mat-icon>
                  <span>{{ copySuccess() ? 'Copied!' : 'Copy' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-black/[0.06] dark:border-white/[0.08]" id="comments">
            <h3 class="text-lg sm:text-xl font-extrabold text-[#000000] dark:text-white mb-5 flex items-center gap-2">
              <mat-icon class="text-[#007AFF]">forum</mat-icon>
              <span>Discussion</span>
              <span class="text-xs font-bold bg-[#007AFF]/10 text-[#007AFF] px-2 py-0.5 rounded-full ml-1">
                {{ comments().length }}
              </span>
            </h3>

            <!-- Add Comment Form -->
            <div class="mb-8 bg-white dark:bg-[#1c1c1e] p-4 sm:p-5 rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] shadow-xs ios-card">
              @if (authService.isLoggedIn()) {
                <div class="flex gap-3">
                  <div class="relative w-9 h-9 shrink-0">
                    <div class="w-full h-full rounded-full overflow-hidden bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF] font-bold border border-black/[0.06] dark:border-white/[0.08]">
                      @if (authService.userProfile()?.photoURL || authService.currentUser()?.photoURL) {
                        <img [src]="authService.userProfile()?.photoURL || authService.currentUser()?.photoURL" alt="You" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                      } @else {
                        {{ authService.userInitials() }}
                      }
                    </div>
                    
                    <!-- Online Status Indicator -->
                    <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#34C759] border-2 border-white dark:border-[#1c1c1e] rounded-full z-10" title="Online"></div>

                    <!-- Verification / Admin Badge -->
                    @if (authService.userProfile()?.verified || authService.isAdmin()) {
                      <div class="absolute -top-1 -right-1 z-10 bg-white dark:bg-[#1c1c1e] rounded-full p-[1px] flex items-center justify-center shadow-xs" title="{{ authService.isAdmin() ? 'Admin' : 'Verified User' }}">
                        <mat-icon class="{{ authService.isAdmin() ? 'text-amber-500' : 'text-[#007AFF]' }}" style="font-size: 13px; width: 13px; height: 13px;">{{ authService.isAdmin() ? 'shield' : 'verified' }}</mat-icon>
                      </div>
                    }
                  </div>
                  <div class="flex-grow">
                    <textarea 
                      [(ngModel)]="newCommentText" 
                      rows="3" 
                      placeholder="Share your thoughts about this article..." 
                      class="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-[14px] p-3 text-[#000000] dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-shadow resize-y min-h-[70px]"
                    ></textarea>
                    <div class="mt-2.5 flex justify-end">
                      <button 
                        (click)="submitComment()" 
                        [disabled]="isSubmittingComment() || !newCommentText().trim()"
                        class="px-5 py-2 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-full transition-all flex items-center gap-1.5 shadow-sm ios-touch cursor-pointer"
                      >
                        @if (isSubmittingComment()) {
                          <mat-icon class="animate-spin" style="font-size: 15px; width: 15px; height: 15px;">sync</mat-icon>
                          <span>Posting...</span>
                        } @else {
                          <mat-icon style="font-size: 15px; width: 15px; height: 15px;">send</mat-icon>
                          <span>Post</span>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="text-center py-5">
                  <div class="w-12 h-12 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <mat-icon class="text-[#007AFF]" style="font-size: 26px; width: 26px; height: 26px;">lock</mat-icon>
                  </div>
                  <h4 class="text-[#000000] dark:text-white font-bold text-base mb-1">Join the Conversation</h4>
                  <p class="text-xs text-[#8e8e93] mb-4 max-w-sm mx-auto">
                    Sign in to share your thoughts and interact with other readers.
                  </p>
                  <button 
                    (click)="authService.openAuthModal('login')"
                    class="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white font-bold text-xs rounded-full transition-transform active:scale-95 shadow-sm ios-touch cursor-pointer"
                  >
                    Log In to Comment
                  </button>
                </div>
              }
            </div>

            <!-- Comments List -->
            <div class="space-y-4">
              @for (comment of comments(); track comment.id) {
                <div class="flex gap-3 group">
                  <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-black/[0.05] dark:bg-white/[0.1] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-center text-[#8e8e93] font-bold text-xs">
                    @if (comment.authorPhotoURL) {
                      <img [src]="comment.authorPhotoURL" alt="{{comment.authorName}}" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                    } @else {
                      {{ comment.authorName.substring(0, 2).toUpperCase() }}
                    }
                  </div>
                  <div class="flex-grow">
                    <div class="bg-white dark:bg-[#1c1c1e] rounded-[16px] rounded-tl-sm p-3.5 border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                      <div class="flex items-center gap-1.5 mb-1">
                        <span class="font-bold text-xs text-[#000000] dark:text-[#f2f2f7]">{{ comment.authorName }}</span>
                        <!-- Verification / Admin Badge -->
                        @if (comment.authorVerified || comment.authorRole === 'admin') {
                          <div class="flex items-center justify-center" title="{{ comment.authorRole === 'admin' ? 'Admin' : 'Verified User' }}">
                            <mat-icon class="{{ comment.authorRole === 'admin' ? 'text-amber-500' : 'text-[#007AFF]' }}" style="font-size: 13px; width: 13px; height: 13px;">{{ comment.authorRole === 'admin' ? 'shield' : 'verified' }}</mat-icon>
                          </div>
                        }
                        @if (comment.createdAt) {
                          <span class="text-[10px] text-[#8e8e93] font-medium ml-1">
                            {{ formatCommentDate(comment.createdAt) | date:'MMM d, h:mm a' }}
                          </span>
                        }
                      </div>
                      <p class="text-xs sm:text-sm text-[#3a3a3c] dark:text-[#aeaeb2] whitespace-pre-wrap leading-relaxed">
                        {{ comment.text }}
                      </p>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-8 bg-black/[0.01] dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 rounded-[18px]">
                  <mat-icon class="text-[#8e8e93] mb-2" style="font-size: 32px; width: 32px; height: 32px;">chat_bubble_outline</mat-icon>
                  <p class="text-xs text-[#8e8e93] font-medium">No comments yet. Be the first to share your thoughts!</p>
                </div>
              }
            </div>
          </div>

          <!-- Related Articles Section (සබැඳි පුවත්) -->
          @if (relatedArticles().length > 0) {
            <section class="mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-black/[0.06] dark:border-white/[0.08]">
              <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
                <div>
                  <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    <mat-icon style="font-size: 13px; width: 13px; height: 13px;">auto_stories</mat-icon>
                    <span>Recommended</span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-[#000000] dark:text-white">
                    Related Stories
                  </h2>
                </div>
                <a routerLink="/" class="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] hover:gap-1.5 transition-all group shrink-0">
                  <span>View All</span>
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="group-hover:translate-x-0.5 transition-transform">arrow_forward</mat-icon>
                </a>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                @for (rel of relatedArticles(); track rel.id; let i = $index) {
                  <article [routerLink]="['/article', rel.slug || rel.id]" class="group bg-white dark:bg-[#1c1c1e] rounded-[20px] p-3.5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full border border-black/[0.06] dark:border-white/[0.08] relative overflow-hidden ios-card">
                    <div class="aspect-[16/10] w-full rounded-[14px] overflow-hidden bg-black/[0.03] dark:bg-white/[0.05] relative mb-3">
                      <img [src]="rel.imageUrl" [alt]="rel.title" referrerpolicy="no-referrer" loading="lazy"
                           #relImg (load)="relImg.classList.remove('opacity-0', 'blur-xl', 'scale-110'); relImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                           class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500 ease-out opacity-0 blur-xl scale-110" />
                      <button 
                        (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(rel.id)"
                        class="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md shadow-xs text-[#000000] dark:text-white hover:scale-110 transition-transform cursor-pointer border border-black/[0.06] dark:border-white/[0.08]"
                        [title]="bookmarkManager.isBookmarked(rel.id) ? 'Remove bookmark' : 'Bookmark article'">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;" [class.text-[#007AFF]]="bookmarkManager.isBookmarked(rel.id)">
                          {{ bookmarkManager.isBookmarked(rel.id) ? 'bookmark' : 'bookmark_border' }}
                        </mat-icon>
                      </button>
                    </div>

                    <div class="flex flex-col flex-grow">
                      <div class="flex flex-wrap items-center gap-1.5 mb-1.5 text-[10px] font-semibold text-[#8e8e93] uppercase">
                        <span class="text-[#007AFF] font-bold">{{ rel.category }}</span>
                        <span>&bull;</span>
                        <span>{{ rel.date }}</span>
                      </div>

                      <h3 class="text-sm font-bold tracking-tight text-[#000000] dark:text-white mb-1.5 leading-snug group-hover:text-[#007AFF] transition-colors line-clamp-2">
                        {{ rel.title }}
                      </h3>

                      <p class="text-xs text-[#3a3a3c] dark:text-[#aeaeb2] font-normal line-clamp-2 mb-3 flex-grow leading-relaxed">
                        {{ rel.summary }}
                      </p>

                      <div class="flex items-center justify-between pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] text-[10px] font-semibold text-[#8e8e93] mt-auto">
                        <span class="flex items-center gap-1">
                          <mat-icon style="font-size: 12px; width: 12px; height: 12px;">schedule</mat-icon>
                          {{ rel.readTime }}
                        </span>
                        <span class="text-[#007AFF] font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          Read <mat-icon style="font-size: 12px; width: 12px; height: 12px;">chevron_right</mat-icon>
                        </span>
                      </div>
                    </div>
                  </article>
                }
              </div>
            </section>
          }

          <!-- AI Compliance & Transparency Disclosure Box -->
          @if (article.authorType !== 'human') {
            <div class="mt-8 sm:mt-12 p-4 sm:p-5 rounded-[20px] bg-[#007AFF]/5 border border-[#007AFF]/15 text-xs text-[#000000]/80 dark:text-white/80 leading-relaxed font-sans break-words overflow-hidden">
              <div class="flex items-center gap-1.5 font-bold text-[#007AFF] text-xs uppercase tracking-wider mb-1.5">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="shrink-0">verified</mat-icon>
                <span>AI Transparency &amp; Editorial Oversight</span>
              </div>
              <p class="text-[#3a3a3c] dark:text-[#aeaeb2] text-[11px] leading-relaxed">
                මෙම තාක්ෂණික පුවත් වාර්තාව MyFeed.lk ස්වයංක්‍රීය කෘත්‍රිම බුද්ධි (AI Intelligence) පද්ධතිය මඟින් ගෝලීය පුවත් මූලාශ්‍ර විශ්ලේෂණය කර සම්පාදනය කරන ලද්දකි. ජාත්‍යන්තර AI අන්තර්ගත විනිවිදභාවය පිළිබඳ ප්‍රමිතීන්ට (Global AI Content Transparency Standards) අනුකූලව මෙම තොරතුරු MyFeed.lk සංස්කාරක මණ්ඩලය (Editorial Team) විසින් අධීක්ෂණය කර ප්‍රකාශයට පත් කරනු ලබයි.
              </p>
            </div>
          }
        </div>
      </main>

      <!-- Story Poster Preview Modal -->
      @if (showPosterModal()) {
        <div class="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl max-w-md w-full p-6 border border-black/10 dark:border-white/20 shadow-2xl relative flex flex-col max-h-[90vh]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-black tracking-tight text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <mat-icon class="text-blue-600">photo_camera</mat-icon>
                <span>Social Story Poster</span>
              </h3>
              <button (click)="closePosterModal()" class="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f]/60 dark:text-white/60 cursor-pointer">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Canvas Container / Preview -->
            <div class="flex-1 overflow-y-auto flex items-center justify-center bg-gray-100 dark:bg-black/40 rounded-2xl p-2 mb-4">
              @if (isGeneratingPoster()) {
                <div class="py-20 flex flex-col items-center gap-3">
                  <div class="w-8 h-8 rounded-full border-2 border-blue-600/20 border-t-blue-600 animate-spin"></div>
                  <span class="text-xs font-bold text-[#1d1d1f]/60 dark:text-white/60">Generating HD Poster...</span>
                </div>
              } @else if (posterDataUrl()) {
                <img [src]="posterDataUrl()" alt="Story Poster" class="max-h-[50vh] w-auto rounded-xl shadow-md object-contain" />
              }
            </div>

            <!-- Hidden Canvas -->
            <canvas #posterCanvas class="hidden"></canvas>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                (click)="downloadPoster()"
                [disabled]="isGeneratingPoster() || !posterDataUrl()"
                class="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">download</mat-icon>
                <span>Download PNG</span>
              </button>
              <button 
                (click)="shareToWhatsApp(article)"
                class="w-full py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md shadow-[#25D366]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95">
                <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
              <button 
                (click)="shareToFacebook(article)"
                class="w-full py-3 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-md shadow-[#1877F2]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95">
                <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- QUICK COVER IMAGE EDITOR MODAL (Admin only) -->
      @if (quickImageArticle(); as qArticle) {
        <div class="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div class="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-white/10 animate-scale-in my-8">
            <!-- Modal Header -->
            <div class="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-black/5 dark:border-white/10">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 26px; width: 26px; height: 26px;">photo_camera</mat-icon>
                </div>
                <div class="min-w-0">
                  <h3 class="text-lg font-black text-[#1d1d1f] dark:text-white truncate">Cover Image වෙනස් කරන්න</h3>
                  <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60 truncate max-w-md">{{ qArticle.title }}</p>
                </div>
              </div>
              <button (click)="closeQuickImageModal()" class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white flex items-center justify-center transition-all cursor-pointer shrink-0">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <!-- Current / Selected Image Live Preview -->
            <div class="mb-5">
              <div class="text-xs font-bold uppercase tracking-wider text-[#1d1d1f]/60 dark:text-white/60 mb-2 flex items-center justify-between">
                <span>Selected Image Preview (තෝරාගත් පින්තූරය):</span>
                @if (quickImageUrl()) {
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">check_circle</mat-icon> Ready to save
                  </span>
                }
              </div>
              <div class="w-full aspect-[16/9] sm:aspect-[2.2/1] rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 relative shadow-inner">
                @if (quickImageUrl()) {
                  <img [src]="quickImageUrl()" [alt]="qArticle.title" referrerpolicy="no-referrer"
                       class="w-full h-full object-cover transition-all duration-300" />
                } @else {
                  <div class="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <mat-icon style="font-size: 36px; width: 36px; height: 36px;">image_not_supported</mat-icon>
                    <span class="text-xs font-medium">පින්තූරයක් තෝරා නැත</span>
                  </div>
                }
              </div>
            </div>

            <!-- Curated Smart Matching Recommendations -->
            <div class="mb-5">
              <div class="text-xs font-bold uppercase tracking-wider text-[#1d1d1f] dark:text-white mb-2 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-blue-600">auto_awesome</mat-icon>
                  <span>Curated High-Definition Smart Matches (ක්ලික් කර තෝරන්න):</span>
                </div>
              </div>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                @for (sug of quickImageSuggestions(); track sug) {
                  <button type="button" (click)="quickImageUrl.set(sug)"
                          class="relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all group cursor-pointer"
                          [class.border-blue-600]="quickImageUrl() === sug"
                          [class.border-transparent]="quickImageUrl() !== sug"
                          [class.ring-2]="quickImageUrl() === sug"
                          [class.ring-blue-600/30]="quickImageUrl() === sug">
                    <img [src]="sug" alt="Curated Option" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    @if (quickImageUrl() === sug) {
                      <div class="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                        <mat-icon class="text-white drop-shadow" style="font-size: 20px; width: 20px; height: 20px;">check_circle</mat-icon>
                      </div>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Alternative Options: AI Generate or Custom URL or Local File or Source Website -->
            <div class="space-y-3 mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <!-- Original Web Source Image Extraction Option -->
              @if (qArticle.sourceUrl) {
                <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/10">
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-emerald-600 dark:text-emerald-400">travel_explore</mat-icon>
                      <span>Original Source Website එකෙන් Image එක ගන්න</span>
                    </div>
                    <div class="text-[11px] text-[#1d1d1f]/60 dark:text-white/60 truncate max-w-sm">{{ qArticle.sourceUrl }}</div>
                  </div>
                  <button type="button" (click)="extractQuickSourceImage()" [disabled]="isExtractingQuickSourceImage()"
                          class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0">
                    @if (isExtractingQuickSourceImage()) {
                      <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Extracting...</span>
                    } @else {
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">image_search</mat-icon>
                      <span>🌐 Fetch Original Photo</span>
                    }
                  </button>
                </div>
              }

              <!-- AI Generate Option -->
              <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/10">
                <div>
                  <div class="text-xs font-bold text-[#1d1d1f] dark:text-white">Generate with Gemini AI</div>
                  <div class="text-[11px] text-[#1d1d1f]/60 dark:text-white/60">පුවතේ මාතෘකාවට අදාළව AI මඟින් නව visual එකක් සාදන්න</div>
                </div>
                <button type="button" (click)="generateQuickAiImage()" [disabled]="isGeneratingQuickAiImage()"
                        class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  @if (isGeneratingQuickAiImage()) {
                    <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  } @else {
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">auto_awesome</mat-icon>
                    <span>🎨 AI Visual එකක් සාදන්න</span>
                  }
                </button>
              </div>

              <!-- Custom URL & File Upload Inputs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label for="quickArticleDirectUrl" class="block text-[11px] font-bold text-[#1d1d1f]/60 dark:text-white/60 uppercase tracking-wider mb-1">Paste Direct Image URL</label>
                  <input id="quickArticleDirectUrl" type="text" [value]="quickImageUrl()" (input)="quickImageUrl.set($any($event.target).value)"
                         placeholder="https://images.unsplash.com/..." class="w-full px-3 py-2 bg-white dark:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 text-xs text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label for="quickArticleFileUpload" class="block text-[11px] font-bold text-[#1d1d1f]/60 dark:text-white/60 uppercase tracking-wider mb-1">Or Upload From Device</label>
                  <input id="quickArticleFileUpload" type="file" accept="image/*" (change)="onQuickImageFileUpload($event)" class="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-white/10 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>
            </div>

            <!-- Footer Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" (click)="closeQuickImageModal()" [disabled]="isQuickImageUpdating()"
                      class="px-6 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
                Cancel (අවලංගු කරන්න)
              </button>
              <button type="button" (click)="saveQuickImage()" [disabled]="isQuickImageUpdating() || !quickImageUrl()"
                      class="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                @if (isQuickImageUpdating()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating Firestore...</span>
                } @else {
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">save</mat-icon>
                  <span>Save & Update Cover Image</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ARTICLE DELETE CONFIRMATION MODAL (Admin only) -->
      @if (showDeleteConfirmModal()) {
        <div class="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-black/10 dark:border-white/10 animate-scale-in">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <mat-icon style="font-size: 26px; width: 26px; height: 26px;">delete_forever</mat-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#1d1d1f] dark:text-white">පුවත Delete කිරීම</h3>
                <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60">Delete this News Article</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-200 text-xs sm:text-sm font-medium mb-5 leading-relaxed">
              <strong>අවවාදයයි:</strong> මෙම පුවත ("{{ article.title }}") database එකෙන් සහ වෙබ් අඩවියෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්න.
            </div>
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                (click)="cancelDelete()" 
                [disabled]="isDeletingArticle()"
                class="px-5 py-3 rounded-2xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
                Cancel
              </button>
              <button 
                type="button" 
                (click)="confirmDeleteArticle()" 
                [disabled]="isDeletingArticle()"
                class="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                @if (isDeletingArticle()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                } @else {
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                  <span>Delete Permanently</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
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
  private router = inject(Router);
  readonly articleService = inject(ArticleService);
  readonly bookmarkManager = inject(BookmarkManager);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  readonly authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  readonly comments = signal<ArticleComment[]>([]);
  readonly newCommentText = signal<string>('');
  readonly isSubmittingComment = signal<boolean>(false);
  private unsubscribeComments: Unsubscribe | null = null;

  readonly isAdmin = signal(false);
  readonly showDeleteConfirmModal = signal(false);
  readonly isDeletingArticle = signal(false);

  // Quick Cover Image Editor Signals
  readonly quickImageArticle = signal<Article | null>(null);
  readonly quickImageUrl = signal<string>('');
  readonly quickImageSuggestions = signal<string[]>([]);
  readonly isQuickImageUpdating = signal(false);
  readonly isGeneratingQuickAiImage = signal(false);
  readonly isExtractingQuickSourceImage = signal(false);

  private articleId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  readonly article = computed(() => {
    const id = this.articleId();
    if (!id) return null;
    return this.articleService.articles().find(a => a.slug === id || a.id === id) || null;
  });

  readonly factCheck = computed(() => {
    const current = this.article();
    return current ? getArticleFactCheck(current) : null;
  });

  readonly relatedArticles = computed(() => {
    const current = this.article();
    if (!current) return [];
    const all = this.articleService.articles();
    // Exclude currently viewed article
    const others = all.filter(a => a.id !== current.id && a.slug !== current.slug);
    // Prioritize articles with matching category
    const sameCategory = others.filter(a => a.category?.toLowerCase() === current.category?.toLowerCase());
    const differentCategory = others.filter(a => a.category?.toLowerCase() !== current.category?.toLowerCase());
    
    return [...sameCategory, ...differentCategory].slice(0, 3);
  });

  constructor() {
    if (typeof window !== 'undefined') {
      onAuthStateChanged(auth, user => {
        this.isAdmin.set(user?.email === 'mail.kaveensandeepa@gmail.com');
      });
    }

    // 1. SEO Tags Effect (Re-runs when article data changes, e.g. views/likes update, which is safe)
    effect(() => {
      const currentArt = this.article();
      if (currentArt) {
        // Update SEO Tags dynamically for search engines and social media
        this.titleService.setTitle(`${currentArt.title} | MyFeed.lk`);
        this.metaService.updateTag({ name: 'description', content: currentArt.summary });
        
        // Open Graph tags for Facebook / LinkedIn / WhatsApp
        this.metaService.updateTag({ property: 'og:title', content: currentArt.title });
        this.metaService.updateTag({ property: 'og:description', content: currentArt.summary });
        this.metaService.updateTag({ property: 'og:image', content: currentArt.imageUrl });
        this.metaService.updateTag({ property: 'og:type', content: 'article' });
        
        // Twitter Card tags
        this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.metaService.updateTag({ name: 'twitter:title', content: currentArt.title });
        this.metaService.updateTag({ name: 'twitter:description', content: currentArt.summary });
        this.metaService.updateTag({ name: 'twitter:image', content: currentArt.imageUrl });
      }
    });

    // 2. Navigation & View Increment Effect (MUST only re-run when the article ID changes in the URL)
    effect(() => {
      const id = this.articleId();
      if (id && typeof window !== 'undefined') {
        // Untrack to prevent any accidental reactive loops if we read other signals inside
        untracked(() => {
          // Smoothly scroll to the top whenever navigating to a new article
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          if (typeof localStorage !== 'undefined') {
            const storedReaction = localStorage.getItem(`myfeed_reaction_${id}`);
            this.currentReaction.set(storedReaction);
          }

          // Record view increment dynamically after a short delay
          setTimeout(() => {
            const art = this.article();
            if (art && art.id) {
              this.articleService.incrementViews(art.id);
            }
          }, 1500);
        });
      }
    });

    // 3. Comments listener
    effect(() => {
      const art = this.article();
      untracked(() => {
        if (this.unsubscribeComments) {
          this.unsubscribeComments();
          this.unsubscribeComments = null;
        }
        if (art && art.id && typeof window !== 'undefined') {
          const q = this.articleService.getComments(art.id);
          this.unsubscribeComments = onSnapshot(q, (snapshot) => {
            const fetchedComments: ArticleComment[] = [];
            snapshot.forEach(doc => {
              fetchedComments.push({ id: doc.id, ...doc.data() } as ArticleComment);
            });
            this.comments.set(fetchedComments);
            this.cdr.markForCheck();
          }, (error) => {
            console.error('Error fetching comments', error);
          });
        }
      });
    });
  }

  async toggleReaction(reactionId: string) {
    const art = this.article();
    if (!art) return;

    const current = this.currentReaction();
    let newReaction: string | null = reactionId;
    const oldReaction: string | null = current;

    if (current === reactionId) {
      // Toggle off
      newReaction = null;
      this.currentReaction.set(null);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`myfeed_reaction_${art.id}`);
      }
    } else {
      // Set new
      this.currentReaction.set(reactionId);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`myfeed_reaction_${art.id}`, reactionId);
      }
    }

    // Backend update
    await this.articleService.updateReaction(art.id, newReaction || '', oldReaction || '');
  }

  readonly scrollProgress = signal(0);
  readonly copySuccess = signal(false);
  readonly isSharing = signal(false);
  readonly toastMessage = signal<string | null>(null);
  readonly currentReaction = signal<string | null>(null);

  // Social Media Story / Poster Generator (HTML5 Canvas)
  readonly showPosterModal = signal(false);
  readonly isGeneratingPoster = signal(false);
  readonly posterDataUrl = signal<string | null>(null);

  async openPosterModal(article: { title: string; summary: string; category?: string; date?: string; imageUrl?: string }) {
    this.showPosterModal.set(true);
    this.isGeneratingPoster.set(true);
    this.posterDataUrl.set(null);

    // Render Canvas Story Card (1080 x 1350 High Resolution)
    setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background Dark Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(0.5, '#1e293b');
        bgGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1350);

        // Header Branding
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('MyFeed', 80, 110);
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('.lk', 250, 110);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 24px sans-serif';
        ctx.fillText('SRI LANKA TECH JOURNAL', 80, 150);

        // Category Tag
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.roundRect(80, 190, 160, 48, 24);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((article.category || 'TECH').toUpperCase(), 160, 222);
        ctx.textAlign = 'left';

        // Load Article Image onto Canvas
        if (article.imageUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const imgLoaded = new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            img.src = article.imageUrl;
            await imgLoaded;

            // Draw Rounded Image Card
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(80, 270, 920, 520, 32);
            ctx.clip();
            ctx.drawImage(img, 80, 270, 920, 520);
            ctx.restore();
          } catch {
            // Placeholder rect if image CORS fails
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.roundRect(80, 270, 920, 520, 32);
            ctx.fill();
          }
        }

        // Article Title (Multi-line wrapping)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        const words = article.title.split(' ');
        let line = '';
        let y = 860;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 920 && n > 0) {
            ctx.fillText(line, 80, y);
            line = words[n] + ' ';
            y += 56;
            if (y > 980) break;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);

        // Summary Text
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 28px sans-serif';
        const summaryWords = article.summary.split(' ');
        let sLine = '';
        let sy = y + 70;
        for (let n = 0; n < summaryWords.length; n++) {
          const testLine = sLine + summaryWords[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 920 && n > 0) {
            ctx.fillText(sLine, 80, sy);
            sLine = summaryWords[n] + ' ';
            sy += 42;
            if (sy > 1180) break;
          } else {
            sLine = testLine;
          }
        }
        ctx.fillText(sLine, 80, sy);

        // Footer Bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 1230, 1080, 120);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('Read full story on myfeed.lk', 80, 1300);

        ctx.fillStyle = '#64748b';
        ctx.font = '500 24px sans-serif';
        ctx.fillText(article.date || 'Updated Daily', 800, 1300);

        const dataUrl = canvas.toDataURL('image/png');
        this.posterDataUrl.set(dataUrl);
      } catch (e) {
        console.error('Poster generation error', e);
      } finally {
        this.isGeneratingPoster.set(false);
      }
    }, 100);
  }

  closePosterModal() {
    this.showPosterModal.set(false);
  }

  downloadPoster() {
    const url = this.posterDataUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `myfeed-story-${Date.now()}.png`;
    a.click();
    this.showToast('Story Poster Downloaded! 📸');
  }

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string) {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(message);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  /**
   * Forwards formatted article with Feature image file, Summary, and Read More link directly to WhatsApp app/web
   */
  async shareToWhatsApp(article: { title: string; summary: string; category?: string; readTime?: string; slug?: string; id: string; imageUrl?: string }) {
    if (typeof window === 'undefined') return;

    const domain = window.location.origin.includes('localhost') || window.location.origin.includes('run.app')
      ? 'https://myfeedlk.com'
      : window.location.origin;
    const articleUrl = `${domain}/article/${article.slug || article.id}`;

    const formattedPost = `*🚀 NEW ON MYFEED.LK (${article.category || 'News'})*

*${article.title}*

${article.summary}

⏱️ ${article.readTime || '3 min read'}
🔗 *Read full story:* ${articleUrl}

_Curated with precision by MyFeed.lk Sri Lanka_`;

    // 1. Check if device supports Web Share API with files (Android / iOS / Mobile Chrome & Safari)
    if (article.imageUrl && typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        this.isSharing.set(true);
        this.showToast('Preparing image & details for WhatsApp... ⏳');

        // Fetch image blob via proxy to avoid CORS issues
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(article.imageUrl)}`;
        let blob: Blob | null = null;
        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            blob = await res.blob();
          }
        } catch {
          // Direct fetch fallback if proxy unavailable
          try {
            const res = await fetch(article.imageUrl, { mode: 'cors' });
            if (res.ok) blob = await res.blob();
          } catch {
            // ignore
          }
        }

        if (blob) {
          const fileType = blob.type || 'image/jpeg';
          const ext = fileType.includes('png') ? 'png' : fileType.includes('webp') ? 'webp' : 'jpg';
          const file = new File([blob], `myfeed-${article.slug || article.id}.${ext}`, { type: fileType });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: article.title,
              text: formattedPost,
              files: [file]
            });
            this.isSharing.set(false);
            this.showToast('Shared with image! ✨');
            return;
          }
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error?.name === 'AbortError') {
          // User closed share dialog
          this.isSharing.set(false);
          return;
        }
      } finally {
        this.isSharing.set(false);
      }
    }

    // 2. Fallback for Desktop browser or if Web Share API with files is not supported
    // WhatsApp direct deep link with complete formatted text and read more link
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedPost)}`;
    window.open(waUrl, '_blank');
    this.showToast('Opening WhatsApp... 🚀');
  }

  shareToFacebook(article: { slug?: string; id: string; title: string }) {
    if (typeof window === 'undefined') return;
    const domain = window.location.origin.includes('localhost') || window.location.origin.includes('run.app')
      ? 'https://myfeedlk.com'
      : window.location.origin;
    const articleUrl = `${domain}/article/${article.slug || article.id}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    
    // Attempt to use native share if supported, fallback to window.open
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        navigator.share({
          title: article.title,
          url: articleUrl
        }).catch(err => {
          if (err.name !== 'AbortError') {
            window.open(fbUrl, '_blank', 'width=600,height=400');
          }
        });
      } catch {
        window.open(fbUrl, '_blank', 'width=600,height=400');
      }
    } else {
      window.open(fbUrl, '_blank', 'width=600,height=400');
    }
  }

  scrollToFactCheck() {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('factCheckSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  reportInaccuracy() {
    if (typeof window === 'undefined') return;
    const current = this.article();
    const title = current?.title || 'Story';
    const link = window.location.href;
    const msg = `*MyFeed.lk Fact-Check Update Request*\n\n📌 *ලිපිය (Article):* ${title}\n🔗 *සබැඳිය (Link):* ${link}\n\n📝 *නිවැරදි කිරීම / අදහස (Correction / Details):* `;
    const waUrl = `https://wa.me/94775467475?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  }

  copyLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copySuccess.set(true);
      this.showToast('Article link copied to clipboard! 🔗');
      setTimeout(() => this.copySuccess.set(false), 3000);
    });
  }

  openDeleteModal() {
    this.showDeleteConfirmModal.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirmModal.set(false);
  }

  openQuickImageModal(article: Article) {
    this.quickImageArticle.set(article);
    this.quickImageUrl.set(article.imageUrl || '');
    this.quickImageSuggestions.set(getCuratedTopicImages(article.title, article.category));
  }

  closeQuickImageModal() {
    this.quickImageArticle.set(null);
    this.quickImageUrl.set('');
    this.quickImageSuggestions.set([]);
    this.isQuickImageUpdating.set(false);
    this.isGeneratingQuickAiImage.set(false);
  }

  onQuickImageFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.quickImageUrl.set(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async generateQuickAiImage() {
    const article = this.quickImageArticle();
    if (!article) return;

    this.isGeneratingQuickAiImage.set(true);
    try {
      const res = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          category: article.category || 'Tech'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate AI image');
      }

      const data = await res.json();
      if (data.imageUrl) {
        this.quickImageUrl.set(data.imageUrl);
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert('AI Image Generator Error: ' + (err.message || String(e)));
    } finally {
      this.isGeneratingQuickAiImage.set(false);
    }
  }

  async extractQuickSourceImage() {
    const article = this.quickImageArticle();
    const sourceUrl = article?.sourceUrl || '';
    if (!sourceUrl || !sourceUrl.startsWith('http')) {
      alert('Source URL එකක් හමු නොවීය.');
      return;
    }

    this.isExtractingQuickSourceImage.set(true);
    try {
      const res = await fetch('/api/extract-source-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to extract image from source website');
      }

      const data = await res.json();
      if (data.originalImageUrl) {
        this.quickImageUrl.set(data.originalImageUrl);
      } else if (data.imageUrl) {
        this.quickImageUrl.set(data.imageUrl);
      } else {
        alert('මෙම Source Website එකෙන් Original Image එකක් හඳුනාගත නොහැකි විය.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Source Image Extraction Error: ' + (e.message || String(err)));
    } finally {
      this.isExtractingQuickSourceImage.set(false);
    }
  }

  async saveQuickImage() {
    const article = this.quickImageArticle();
    const newUrl = this.quickImageUrl().trim();
    if (!article || !newUrl) return;

    this.isQuickImageUpdating.set(true);
    try {
      await this.articleService.updateArticle(article.id, { imageUrl: newUrl });
      this.showToast('Cover Image සාර්ථකව update කරන ලදී! 📸');
      this.closeQuickImageModal();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Failed to update cover image: ' + (e.message || String(err)));
    } finally {
      this.isQuickImageUpdating.set(false);
    }
  }

  async confirmDeleteArticle() {
    const art = this.article();
    if (!art) return;
    this.isDeletingArticle.set(true);
    try {
      await this.articleService.deleteArticle(art.id);
      this.showDeleteConfirmModal.set(false);
      this.showToast('පුවත සාර්ථකව Delete කරන ලදී (Article deleted successfully)');
      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 1000);
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('Failed to delete article. Please try again.');
    } finally {
      this.isDeletingArticle.set(false);
    }
  }

  async submitComment() {
    if (this.isSubmittingComment() || !this.newCommentText().trim()) return;
    const art = this.article();
    const user = this.authService.userProfile();
    const curUser = this.authService.currentUser();
    
    const uid = user?.uid || curUser?.uid;
    if (!art || !art.id || !uid) return;
    
    this.isSubmittingComment.set(true);
    try {
      const displayName = user?.displayName || curUser?.displayName || 'User';
      const photoURL = user?.photoURL || curUser?.photoURL || '';
      const verified = user?.verified ?? false;
      const role = user?.role ?? 'reader';
      
      await this.articleService.addComment(
        art.id, 
        this.newCommentText(), 
        uid, 
        displayName, 
        photoURL,
        verified,
        role
      );
      this.newCommentText.set('');
    } catch (err) {
      console.error('Failed to submit comment', err);
    } finally {
      this.isSubmittingComment.set(false);
    }
  }

  formatCommentDate(createdAt: unknown): number | Date | null {
    if (!createdAt) return null;
    const dateObj = createdAt as { toDate?: () => Date };
    if (typeof dateObj.toDate === 'function') {
      return dateObj.toDate();
    }
    return createdAt as (number | Date);
  }

  ngOnDestroy() {
    if (this.unsubscribeComments) {
      this.unsubscribeComments();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
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

  onImgError(event: Event, title = '', category = '') {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = getTopicFallbackImage(title, category);
      target.classList.remove('opacity-0', 'blur-xl', 'scale-105');
      target.classList.add('opacity-100', 'blur-0', 'scale-100');
    }
  }
}

