import {ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, signal, untracked} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {ArticleService} from './article.service';
import {BookmarkManager} from './bookmark';
import {auth} from './firebase';
import {onAuthStateChanged} from 'firebase/auth';

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
                  (click)="openDeleteModal()"
                  class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shadow-red-600/20 cursor-pointer active:scale-95">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">delete_forever</mat-icon>
                  <span>Delete Story (පුවත මකන්න)</span>
                </button>
              </div>
            </div>
          }

          <!-- Top Navigation & Action Controls -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-12">
            <div class="flex items-center gap-4">
              <a routerLink="/" class="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white transition-all cursor-pointer group shrink-0">
                <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
                <span>Back to Journal</span>
              </a>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-blue-300 text-[10px] sm:text-[11px] font-bold tracking-wider">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility</mat-icon>
                {{ article.views || 0 }} Views
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <!-- Social Story Card / Poster Generator Button -->
              <button 
                (click)="openPosterModal(article)"
                class="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-blue-500/20 shrink-0 active:scale-95"
                title="Create Social Media Story Card">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">image</mat-icon>
                <span>Story Poster</span>
              </button>

              <!-- Audio TTS Listen -->
              <button 
                (click)="toggleSpeech(article)"
                [disabled]="isLoadingAudio()"
                class="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all cursor-pointer border text-xs font-bold shrink-0 active:scale-95"
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
                [class.dark:border-white/10]="!isSpeaking()"
                title="Listen to this article">
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

              <!-- WhatsApp Direct Share & Forward Button -->
              <button 
                (click)="shareToWhatsApp(article)"
                [disabled]="isSharing()"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition-all cursor-pointer shrink-0 group active:scale-95 shadow-md shadow-[#25D366]/20 border border-[#25D366]"
                title="Forward article and image to WhatsApp">
                @if (isSharing()) {
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="animate-spin">sync</mat-icon>
                  <span>Sharing...</span>
                } @else {
                  <svg class="w-4 h-4 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>WhatsApp</span>
                }
              </button>

              <!-- Share Link -->
              <button 
                (click)="copyLink()"
                class="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10 shrink-0 group active:scale-95"
                title="Copy page link">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="group-hover:rotate-12 transition-transform">share</mat-icon>
                <span>{{ copySuccess() ? 'Copied!' : 'Share' }}</span>
              </button>

              <!-- Bookmark -->
              <button 
                (click)="bookmarkManager.toggleBookmark(article.id)"
                class="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10 shrink-0 active:scale-95"
                title="Save article to bookmarks">
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

        <!-- Featured Image Figure -->
        <figure class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-16 md:mb-24 relative group">
          <div class="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2.2/1] rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-white/5 relative shadow-xl sm:shadow-2xl shadow-black/10">
            <img [src]="article.imageUrl" [alt]="article.title" referrerpolicy="no-referrer" loading="eager"
                 #mainImg (load)="mainImg.classList.remove('opacity-0', 'blur-xl', 'scale-105'); mainImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                 class="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out opacity-0 blur-xl scale-105" />
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

          <!-- Article Body Content -->
          <div 
            class="prose prose-base sm:prose-xl max-w-none text-[#1d1d1f]/80 dark:text-gray-300 leading-[1.8] sm:leading-[1.9] font-serif break-words overflow-hidden [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-[#1d1d1f] [&_h2]:dark:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-5 [&_li]:mb-2.5 [&_strong]:font-bold [&_strong]:text-[#1d1d1f] [&_strong]:dark:text-white"
            [innerHTML]="article.content">
          </div>

          <!-- Reactions -->
          <div class="mt-8 sm:mt-12 flex flex-wrap items-center gap-3 sm:gap-4 border-t border-b border-black/5 dark:border-white/10 py-6 sm:py-8">
            <span class="text-sm font-bold text-[#1d1d1f] dark:text-white uppercase tracking-widest mr-2">React:</span>
            
            <button (click)="toggleReaction('like')" [class.bg-blue-100]="currentReaction() === 'like'" [class.dark:bg-blue-900]="currentReaction() === 'like'" [class.border-blue-300]="currentReaction() === 'like'" [class.dark:border-blue-700]="currentReaction() === 'like'" class="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 group">
              <mat-icon [class.text-blue-600]="currentReaction() === 'like'" [class.dark:text-blue-400]="currentReaction() === 'like'" class="text-gray-500 dark:text-gray-400 group-hover:-translate-y-0.5 transition-transform" style="font-size: 20px; width: 20px; height: 20px;">thumb_up</mat-icon>
              <span class="text-sm font-bold text-[#1d1d1f] dark:text-white">{{ article.reactions?.['like'] || 0 }}</span>
            </button>
            
            <button (click)="toggleReaction('love')" [class.bg-red-100]="currentReaction() === 'love'" [class.dark:bg-red-900]="currentReaction() === 'love'" [class.border-red-300]="currentReaction() === 'love'" [class.dark:border-red-700]="currentReaction() === 'love'" class="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 group">
              <mat-icon [class.text-red-600]="currentReaction() === 'love'" [class.dark:text-red-400]="currentReaction() === 'love'" class="text-gray-500 dark:text-gray-400 group-hover:-translate-y-0.5 transition-transform" style="font-size: 20px; width: 20px; height: 20px;">favorite</mat-icon>
              <span class="text-sm font-bold text-[#1d1d1f] dark:text-white">{{ article.reactions?.['love'] || 0 }}</span>
            </button>
            
            <button (click)="toggleReaction('fire')" [class.bg-orange-100]="currentReaction() === 'fire'" [class.dark:bg-orange-900]="currentReaction() === 'fire'" [class.border-orange-300]="currentReaction() === 'fire'" [class.dark:border-orange-700]="currentReaction() === 'fire'" class="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 group">
              <mat-icon [class.text-orange-600]="currentReaction() === 'fire'" [class.dark:text-orange-400]="currentReaction() === 'fire'" class="text-gray-500 dark:text-gray-400 group-hover:-translate-y-0.5 transition-transform" style="font-size: 20px; width: 20px; height: 20px;">local_fire_department</mat-icon>
              <span class="text-sm font-bold text-[#1d1d1f] dark:text-white">{{ article.reactions?.['fire'] || 0 }}</span>
            </button>

            <button (click)="toggleReaction('insight')" [class.bg-amber-100]="currentReaction() === 'insight'" [class.dark:bg-amber-900]="currentReaction() === 'insight'" [class.border-amber-300]="currentReaction() === 'insight'" [class.dark:border-amber-700]="currentReaction() === 'insight'" class="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 group">
              <mat-icon [class.text-amber-600]="currentReaction() === 'insight'" [class.dark:text-amber-400]="currentReaction() === 'insight'" class="text-gray-500 dark:text-gray-400 group-hover:-translate-y-0.5 transition-transform" style="font-size: 20px; width: 20px; height: 20px;">lightbulb</mat-icon>
              <span class="text-sm font-bold text-[#1d1d1f] dark:text-white">{{ article.reactions?.['insight'] || 0 }}</span>
            </button>
            
            <button (click)="toggleReaction('rocket')" [class.bg-purple-100]="currentReaction() === 'rocket'" [class.dark:bg-purple-900]="currentReaction() === 'rocket'" [class.border-purple-300]="currentReaction() === 'rocket'" [class.dark:border-purple-700]="currentReaction() === 'rocket'" class="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 group">
              <mat-icon [class.text-purple-600]="currentReaction() === 'rocket'" [class.dark:text-purple-400]="currentReaction() === 'rocket'" class="text-gray-500 dark:text-gray-400 group-hover:-translate-y-0.5 transition-transform" style="font-size: 20px; width: 20px; height: 20px;">rocket_launch</mat-icon>
              <span class="text-sm font-bold text-[#1d1d1f] dark:text-white">{{ article.reactions?.['rocket'] || 0 }}</span>
            </button>
          </div>

          <!-- Bottom Action & Sharing Bar for Readers -->
          <div class="mt-8 sm:mt-12 p-6 sm:p-8 rounded-3xl bg-gray-50 dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-white mb-1">
                  Share this Story
                </h3>
                <p class="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60">
                  Forward story summary and link directly to WhatsApp.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <!-- WhatsApp Forward Button -->
                <button 
                  (click)="shareToWhatsApp(article)"
                  [disabled]="isSharing()"
                  class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white hover:bg-[#20ba5a] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-[#25D366]/20 active:scale-95 border border-[#25D366]"
                  title="Forward article and image to WhatsApp">
                  @if (isSharing()) {
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="animate-spin">sync</mat-icon>
                    <span>Preparing Image...</span>
                  } @else {
                    <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>Share to WhatsApp</span>
                  }
                </button>

                <!-- Facebook Share Button -->
                <button 
                  (click)="shareToFacebook(article)"
                  class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-[#1877F2]/20 active:scale-95 border border-[#1877F2]"
                  title="Share article on Facebook">
                  <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                  <span>Share</span>
                </button>

                <!-- Copy Link -->
                <button 
                  (click)="copyLink()"
                  class="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1d1d1f] dark:text-white font-bold text-xs transition-all cursor-pointer border border-black/5 dark:border-white/10 active:scale-95">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">share</mat-icon>
                  <span>{{ copySuccess() ? 'Copied Link!' : 'Copy Link' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Related Articles Section (සබැඳි පුවත්) -->
          @if (relatedArticles().length > 0) {
            <section class="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-black/5 dark:border-white/10 animate-fade-in-up">
              <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 sm:mb-10">
                <div>
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2.5 border border-blue-100 dark:border-blue-900/30">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">auto_stories</mat-icon>
                    <span>Recommended Stories</span>
                  </div>
                  <h2 class="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                    සබැඳි පුවත් <span class="text-[#1d1d1f]/40 dark:text-white/40 font-serif italic text-base sm:text-xl font-normal">&bull; Related Articles</span>
                  </h2>
                </div>
                <a routerLink="/" class="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all group shrink-0">
                  <span>සියලු පුවත් (View All)</span>
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
                </a>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                @for (rel of relatedArticles(); track rel.id; let i = $index) {
                  <article [routerLink]="['/article', rel.slug || rel.id]" class="group bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-blue-950/20 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col h-full border border-black/5 dark:border-white/10 relative overflow-hidden" [style.animation-delay]="(0.1 + (i * 0.1)) + 's'">
                    <div class="aspect-[16/10] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 relative mb-4 sm:mb-5 shadow-inner">
                      <img [src]="rel.imageUrl" [alt]="rel.title" referrerpolicy="no-referrer" loading="lazy"
                           #relImg (load)="relImg.classList.remove('opacity-0', 'blur-xl', 'scale-110'); relImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                           class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-out opacity-0 blur-xl scale-110" />
                      <button 
                        (click)="$event.stopPropagation(); bookmarkManager.toggleBookmark(rel.id)"
                        class="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-md text-[#1d1d1f] dark:text-white hover:scale-110 transition-transform cursor-pointer border border-black/5 dark:border-white/10"
                        [title]="bookmarkManager.isBookmarked(rel.id) ? 'Remove bookmark' : 'Bookmark article'">
                        <mat-icon style="font-size: 15px; width: 15px; height: 15px;" [class.text-blue-600]="bookmarkManager.isBookmarked(rel.id)">
                          {{ bookmarkManager.isBookmarked(rel.id) ? 'bookmark' : 'bookmark_border' }}
                        </mat-icon>
                      </button>
                    </div>

                    <div class="flex flex-col flex-grow">
                      <div class="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase text-[#1d1d1f]/40 dark:text-white/40">
                        <span class="text-blue-600 font-extrabold">{{ rel.category }}</span>
                        @if (rel.authorType !== 'human') {
                          <span class="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-full text-[9px]">
                            <mat-icon style="font-size: 10px; width: 10px; height: 10px;">auto_awesome</mat-icon> AI
                          </span>
                        }
                        <span class="w-1 h-1 rounded-full bg-black/10 dark:bg-white/20"></span>
                        <span>{{ rel.date }}</span>
                      </div>

                      <h3 class="text-base sm:text-lg font-black tracking-tight text-[#1d1d1f] dark:text-white mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {{ rel.title }}
                      </h3>

                      <p class="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 font-serif italic line-clamp-2 mb-4 flex-grow leading-relaxed">
                        {{ rel.summary }}
                      </p>

                      <div class="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 text-[10px] sm:text-xs font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase mt-auto">
                        <span class="flex items-center gap-1">
                          <mat-icon style="font-size: 13px; width: 13px; height: 13px;">schedule</mat-icon>
                          {{ rel.readTime }}
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
          }

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

  readonly isAdmin = signal(false);
  readonly showDeleteConfirmModal = signal(false);
  readonly isDeletingArticle = signal(false);

  private articleId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  readonly article = computed(() => {
    const id = this.articleId();
    if (!id) return null;
    return this.articleService.articles().find(a => a.slug === id || a.id === id) || null;
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
  }

  async toggleReaction(reactionId: string) {
    const art = this.article();
    if (!art) return;

    const current = this.currentReaction();
    let newReaction: string | null = reactionId;
    let oldReaction: string | null = current;

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

  readonly isSpeaking = signal(false);
  readonly isPaused = signal(false);
  readonly isLoadingAudio = signal(false);
  private currentAudioElement: HTMLAudioElement | null = null;
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
      ? 'https://myfeedlk.web.app'
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
      ? 'https://myfeedlk.web.app'
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
      this.showToast('Speech synthesis is not supported on this device.');
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

  ngOnDestroy() {
    this.stopSpeech();
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
}

