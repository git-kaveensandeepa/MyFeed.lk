import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ArticleService, Article, getCuratedTopicImages, FactCheckData, extractDomain} from './article.service';
import {SubscriberService} from './subscriber.service';
import {AdManagerService, Ad} from './ad-manager.service';
import {AnalyticsService} from './analytics.service';
import {AudioService, MorningEdition, ChapterMark} from './audio.service';
import {collection, addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs, updateDoc} from 'firebase/firestore';
import {db, auth} from './firebase';
import {signInWithEmailAndPassword, signOut, onAuthStateChanged, User} from 'firebase/auth';
import {UserProfile} from './auth.service';

export interface TrendingNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  source?: string;
  categoryHint?: string;
}

export interface GeneratedStudioArticle {
  sinhalaTitle: string;
  sinhalaDescription: string;
  sinhalaFullContent: string;
  suggestedCategory: string;
  keyTakeaways?: string[];
  faqList?: { question: string; answer: string }[];
  lkrPriceAnalysis?: string;
  tags?: string[];
  readTime?: string;
  socialShareText?: string;
  imageUrl?: string;
  visualPrompt?: string;
}

export interface PolishedResult {
  polishedTitle?: string;
  polishedSummary?: string;
  polishedContent?: string;
  suggestedCategory?: string;
  whatsappMessage?: string;
  socialShareText?: string;
  tags?: string[];
  faqList?: { question: string; answer: string }[];
  keyTakeaways?: string[];
  detectedErrors?: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin',
  imports: [MatIconModule, RouterLink, FormsModule],
  template: `
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-[calc(100vh-200px)]">
      @if (loading()) {
        <div class="flex justify-center items-center py-32 animate-pulse">
          <div class="w-10 h-10 rounded-full border-3 border-[#007AFF]/30 border-t-[#007AFF] animate-spin"></div>
        </div>
      } @else if (!user()) {
        <!-- Apple Inspired Login Box -->
        <div class="max-w-md mx-auto mt-8 p-8 sm:p-10 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl text-center">
          <div class="w-16 h-16 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <mat-icon style="font-size: 32px; width: 32px; height: 32px;">admin_panel_settings</mat-icon>
          </div>
          <h1 class="text-2xl font-bold mb-1 text-[#1d1d1f] dark:text-white tracking-tight">Admin Console</h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8 text-xs font-medium">Sign in with authorized administrator credentials to manage MyFeed.</p>

          <!-- Email & Password Form for Admin -->
          <form (ngSubmit)="loginWithEmail()" class="space-y-4 mb-6 text-left">
            <div>
              <label for="adminEmailInput" class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                id="adminEmailInput"
                [(ngModel)]="adminEmailInput" 
                name="adminEmailInput" 
                required 
                placeholder="mail.kaveensandeepa@gmail.com" 
                class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none font-medium text-gray-900 dark:text-white transition-all" />
            </div>
            <div>
              <label for="adminPasswordInput" class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                id="adminPasswordInput"
                [(ngModel)]="adminPasswordInput" 
                name="adminPasswordInput" 
                required 
                placeholder="••••••••" 
                class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none font-medium text-gray-900 dark:text-white transition-all" />
            </div>
            @if (adminAuthError()) {
              <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {{ adminAuthError() }}
              </div>
            }
            <button 
              type="submit" 
              [disabled]="loading() || !adminEmailInput || !adminPasswordInput" 
              class="w-full py-3.5 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-[#007AFF]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">lock_open</mat-icon>
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        </div>
      } @else {
        <!-- Modern Apple-Style Admin Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-black/5 dark:border-white/10">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shadow-sm">
              <mat-icon style="font-size: 26px; width: 26px; height: 26px;">shield</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">Admin Portal</h1>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Live</span>
              </div>
              <p class="text-xs text-gray-500 font-medium mt-0.5">{{ user()?.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 w-full md:w-auto">
            @if (activeTab() === 'articles' || activeTab() === 'ads') {
              <button (click)="isAdding.set(true)" class="flex-1 md:flex-none px-5 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#007AFF]/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">add_circle</mat-icon>
                <span>New {{ activeTab() === 'ads' ? 'Campaign' : 'Story' }}</span>
              </button>
            }
            <button (click)="logout()" class="px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">logout</mat-icon>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <!-- Apple Glass Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <!-- Live Visitors -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Active Visitors
              </span>
              <div class="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">group</mat-icon>
              </div>
            </div>
            <div class="text-3xl sm:text-4xl font-extrabold text-[#1d1d1f] dark:text-white tracking-tight">{{ analyticsService.todayLiveVisitors() }}</div>
            <p class="text-[11px] text-gray-400 font-medium mt-1">Unique devices logged today</p>
          </div>
          
          <!-- Total Articles -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                Stories Published
              </span>
              <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">article</mat-icon>
              </div>
            </div>
            <div class="text-3xl sm:text-4xl font-extrabold text-[#1d1d1f] dark:text-white tracking-tight">{{ articleService.articles().length }}</div>
            <p class="text-[11px] text-gray-400 font-medium mt-1">Live articles in catalog</p>
          </div>
          
          <!-- Subscribers -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden group">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                Subscribers
              </span>
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mark_email_read</mat-icon>
              </div>
            </div>
            <div class="text-3xl sm:text-4xl font-extrabold text-[#1d1d1f] dark:text-white tracking-tight">{{ subscriberService.subscribers().length }}</div>
            <p class="text-[11px] text-gray-400 font-medium mt-1">Email & Web push alerts active</p>
          </div>
        </div>

        <!-- iOS Style Segmented Control Tab Bar -->
        <div class="bg-gray-100/90 dark:bg-[#1c1c1e]/90 p-1.5 rounded-2xl mb-8 flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none border border-black/5 dark:border-white/10 shadow-inner">
          <button 
            (click)="setActiveTab('articles')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'articles'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'articles'"
            [class.text-[#007AFF]]="activeTab() === 'articles'"
            [class.shadow-sm]="activeTab() === 'articles'"
            [class.text-gray-600]="activeTab() !== 'articles'"
            [class.dark:text-gray-400]="activeTab() !== 'articles'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">article</mat-icon>
            <span>Articles ({{ articleService.articles().length }})</span>
          </button>

          <button 
            (click)="setActiveTab('auto-studio')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 relative"
            [class.bg-white]="activeTab() === 'auto-studio'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'auto-studio'"
            [class.text-indigo-600]="activeTab() === 'auto-studio'"
            [class.shadow-sm]="activeTab() === 'auto-studio'"
            [class.text-gray-600]="activeTab() !== 'auto-studio'"
            [class.dark:text-gray-400]="activeTab() !== 'auto-studio'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-indigo-500">auto_awesome</mat-icon>
            <span>✨ AI Studio</span>
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          </button>

          <button 
            (click)="setActiveTab('audio')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 relative"
            [class.bg-white]="activeTab() === 'audio'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'audio'"
            [class.text-blue-600]="activeTab() === 'audio'"
            [class.shadow-sm]="activeTab() === 'audio'"
            [class.text-gray-600]="activeTab() !== 'audio'"
            [class.dark:text-gray-400]="activeTab() !== 'audio'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-blue-500">podcasts</mat-icon>
            <span>🎙️ Morning Audio</span>
          </button>

          <button 
            (click)="setActiveTab('subscribers')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'subscribers'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'subscribers'"
            [class.text-[#007AFF]]="activeTab() === 'subscribers'"
            [class.shadow-sm]="activeTab() === 'subscribers'"
            [class.text-gray-600]="activeTab() !== 'subscribers'"
            [class.dark:text-gray-400]="activeTab() !== 'subscribers'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">mark_email_read</mat-icon>
            <span>Subscribers</span>
          </button>

          <button 
            (click)="setActiveTab('users')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'users'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'users'"
            [class.text-[#007AFF]]="activeTab() === 'users'"
            [class.shadow-sm]="activeTab() === 'users'"
            [class.text-gray-600]="activeTab() !== 'users'"
            [class.dark:text-gray-400]="activeTab() !== 'users'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">people</mat-icon>
            <span>Users</span>
          </button>

          <button 
            (click)="setActiveTab('ads')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'ads'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'ads'"
            [class.text-[#007AFF]]="activeTab() === 'ads'"
            [class.shadow-sm]="activeTab() === 'ads'"
            [class.text-gray-600]="activeTab() !== 'ads'"
            [class.dark:text-gray-400]="activeTab() !== 'ads'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">campaign</mat-icon>
            <span>Ads</span>
          </button>

          <button 
            (click)="setActiveTab('notify')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'notify'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'notify'"
            [class.text-purple-600]="activeTab() === 'notify'"
            [class.shadow-sm]="activeTab() === 'notify'"
            [class.text-gray-600]="activeTab() !== 'notify'"
            [class.dark:text-gray-400]="activeTab() !== 'notify'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">notifications_active</mat-icon>
            <span>Notify</span>
          </button>

          <button 
            (click)="setActiveTab('whatsapp')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'whatsapp'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'whatsapp'"
            [class.text-emerald-600]="activeTab() === 'whatsapp'"
            [class.shadow-sm]="activeTab() === 'whatsapp'"
            [class.text-gray-600]="activeTab() !== 'whatsapp'"
            [class.dark:text-gray-400]="activeTab() !== 'whatsapp'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-emerald-500">chat</mat-icon>
            <span>WhatsApp</span>
          </button>

          <button 
            (click)="setActiveTab('facebook')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'facebook'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'facebook'"
            [class.text-blue-600]="activeTab() === 'facebook'"
            [class.shadow-sm]="activeTab() === 'facebook'"
            [class.text-gray-600]="activeTab() !== 'facebook'"
            [class.dark:text-gray-400]="activeTab() !== 'facebook'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-blue-600">share</mat-icon>
            <span>Facebook Page</span>
          </button>

          <button 
            (click)="setActiveTab('deploy')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'deploy'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'deploy'"
            [class.text-[#007AFF]]="activeTab() === 'deploy'"
            [class.shadow-sm]="activeTab() === 'deploy'"
            [class.text-gray-600]="activeTab() !== 'deploy'"
            [class.dark:text-gray-400]="activeTab() !== 'deploy'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">rocket_launch</mat-icon>
            <span>Deploy</span>
          </button>
          
          <button 
            (click)="setActiveTab('analytics')"
            class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            [class.bg-white]="activeTab() === 'analytics'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'analytics'"
            [class.text-[#007AFF]]="activeTab() === 'analytics'"
            [class.shadow-sm]="activeTab() === 'analytics'"
            [class.text-gray-600]="activeTab() !== 'analytics'"
            [class.dark:text-gray-400]="activeTab() !== 'analytics'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">insights</mat-icon>
            <span>Analytics</span>
          </button>
        </div>

        @if (activeTab() === 'articles') {

        @if (isAdding()) {
          <div class="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border border-black/5 dark:border-white/10 mb-12">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                  <mat-icon style="font-size: 22px; width: 22px; height: 22px;">{{ editingId() ? 'edit_note' : 'post_add' }}</mat-icon>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-[#1d1d1f] dark:text-white tracking-tight">{{ editingId() ? 'Edit Story' : 'Create New Story' }}</h2>
                  <p class="text-xs text-gray-500 font-medium">Publish or revise news article with rich metadata</p>
                </div>
              </div>
              <button type="button" (click)="cancelEdit()" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <!-- AI Long Article Generator Box -->
            @if (!editingId()) {
              <div class="p-5 sm:p-6 bg-gradient-to-r from-[#007AFF]/5 to-indigo-500/5 dark:from-[#007AFF]/10 dark:to-indigo-500/10 rounded-2xl border border-[#007AFF]/20 dark:border-white/10 mb-6">
                <div class="flex items-center gap-2 mb-1.5">
                  <mat-icon class="text-[#007AFF]" style="font-size: 20px; width: 20px; height: 20px;">auto_awesome</mat-icon>
                  <h3 class="font-bold text-xs uppercase tracking-wider text-[#007AFF] dark:text-blue-400">AI Assistant (සිංහලෙන් දීර්ඝ ලිපි නිර්මාණය)</h3>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-300 mb-4">ඔබට අවශ්‍ය පුවතේ මාතෘකාව හෝ පුවත් ලින්ක් එකක් (News URL) ලබා දී AI මඟින් පූර්ණ සිංහල ලිපියක් සකසා ගන්න.</p>
                
                <div class="flex flex-col gap-3">
                  <!-- From Topic -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="text" [(ngModel)]="aiTopicPrompt" [ngModelOptions]="{standalone: true}" placeholder="මාතෘකාවක් දෙන්න (e.g., Apple Vision Pro 2)" class="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none text-gray-900 dark:text-white">
                    <button type="button" (click)="generateWithAI()" [disabled]="isGeneratingAi()" class="px-5 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-sm">
                      @if (isGeneratingAi()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">bolt</mat-icon>
                        <span>From Topic</span>
                      }
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-4 my-0.5">
                    <div class="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
                    <div class="h-px bg-gray-200 dark:bg-white/10 flex-1"></div>
                  </div>

                  <!-- From URL -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" [(ngModel)]="aiUrlPrompt" [ngModelOptions]="{standalone: true}" placeholder="පුවත් ලින්ක් එක මෙතනට දාන්න (e.g., https://news.google.com/...)" class="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none text-gray-900 dark:text-white">
                    <button type="button" (click)="generateFromUrl()" [disabled]="isGeneratingAi()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-sm">
                      @if (isGeneratingAi()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">link</mat-icon>
                        <span>From URL</span>
                      }
                    </button>
                  </div>
                </div>
              </div>
            }

            <form (ngSubmit)="saveArticle()" class="flex flex-col gap-5">
              
              <div>
                <label for="formTitle" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" id="formTitle" [(ngModel)]="formTitle" name="title" required class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] outline-none font-bold text-base text-gray-900 dark:text-white" placeholder="Article Title (Sinhala/English)">
              </div>
              
              <div>
                <label for="formSummary" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Summary</label>
                <textarea id="formSummary" [(ngModel)]="formSummary" name="summary" required rows="2" class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] outline-none text-sm text-gray-900 dark:text-white font-medium" placeholder="Short summary"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="formCategory" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Category</label>
                  <select id="formCategory" [(ngModel)]="formCategory" name="category" required class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] outline-none text-sm font-semibold text-gray-900 dark:text-white">
                    <option value="" disabled selected>Select Category</option>
                    <option value="AI">AI</option>
                    <option value="Tech">Tech</option>
                    <option value="Local">Local</option>
                    <option value="Global">Global</option>
                    <option value="Business">Business</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label for="formAuthorType" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Attribution</label>
                  <select id="formAuthorType" [(ngModel)]="formAuthorType" name="authorType" required class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] outline-none text-sm font-semibold text-gray-900 dark:text-white">
                    <option value="ai">MyFeed AI Desk</option>
                    <option value="human">Written by Kaveen Sandeepa</option>
                  </select>
                </div>
                <div>
                  <label for="formReadTime" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Read Time</label>
                  <input type="text" id="formReadTime" [(ngModel)]="formReadTime" name="readTime" required class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] outline-none text-sm text-gray-900 dark:text-white font-medium" placeholder="e.g. 5 min">
                </div>
              </div>

              <!-- Source URL (Optional) & Original Source Image Extractor -->
              <div class="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <label for="formSourceUrl" class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-[#007AFF]">link</mat-icon>
                    <span>Original Source URL</span>
                  </label>
                  <span class="text-[11px] text-gray-400 font-medium">The Verge, GSM Arena, Ada Derana, etc.</span>
                </div>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="url" 
                    id="formSourceUrl" 
                    [(ngModel)]="formSourceUrl" 
                    name="sourceUrl" 
                    placeholder="https://www.theverge.com/2025/..." 
                    class="flex-1 px-4 py-2.5 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none text-gray-900 dark:text-white"
                  />
                  <button 
                    type="button" 
                    (click)="extractImageFromFormSourceUrl()"
                    [disabled]="isExtractingFormSourceImage() || !formSourceUrl.trim()"
                    class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <mat-icon [class.animate-spin]="isExtractingFormSourceImage()" style="font-size: 16px; width: 16px; height: 16px;">
                      {{ isExtractingFormSourceImage() ? 'refresh' : 'image_search' }}
                    </mat-icon>
                    <span>{{ isExtractingFormSourceImage() ? 'Extracting...' : 'Extract Image' }}</span>
                  </button>
                </div>
              </div>

              <!-- Fact-Check & Credibility Meter Settings -->
              <div class="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">verified</mat-icon>
                    </div>
                    <div>
                      <h4 class="text-xs font-black uppercase tracking-widest text-emerald-950">Fact-Check & Credibility Meter (තොරතුරු සත්‍යාපනය)</h4>
                      <p class="text-[11px] text-emerald-800/80 font-medium">මූලාශ්‍ර සත්‍යාපන මට්ටම (100% නැතිනම් හේතුව සඳහන් කරන්න)</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-sm"
                       [class.bg-emerald-600]="formFactScore >= 95"
                       [class.text-white]="formFactScore >= 95"
                       [class.bg-amber-500]="formFactScore < 95"
                       [class.text-amber-950]="formFactScore < 95">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">{{ formFactScore >= 95 ? 'verified' : 'pending_actions' }}</mat-icon>
                    <span>{{ formFactScore }}% {{ formFactScore >= 95 ? 'Verified' : 'Developing' }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label for="formFactScore" class="block text-[11px] font-bold text-emerald-900 mb-1 uppercase tracking-wider">Credibility Score (0-100%)</label>
                    <input 
                      type="number" 
                      id="formFactScore" 
                      [(ngModel)]="formFactScore" 
                      name="factScore" 
                      min="0" 
                      max="100"
                      class="w-full px-4 py-2.5 bg-white rounded-xl border border-emerald-300 text-sm font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label for="formPrimarySourceName" class="block text-[11px] font-bold text-emerald-900 mb-1 uppercase tracking-wider">Primary Source Name (මූලාශ්‍ර ආයතනයේ නම)</label>
                    <input 
                      type="text" 
                      id="formPrimarySourceName" 
                      [(ngModel)]="formPrimarySourceName" 
                      name="primarySourceName" 
                      placeholder="e.g. Apple Newsroom, The Verge, Reuters, Ada Derana"
                      class="w-full px-4 py-2.5 bg-white rounded-xl border border-emerald-300 text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label for="formFactReason" class="block text-[11px] font-bold text-emerald-900 mb-1 uppercase tracking-wider">
                    {{ formFactScore >= 95 ? 'Verification Reasoning (100% සනාථ කළ ආකාරය)' : 'Status / Missing Verification Reason (100% නැතිනම් හේතුව)' }}
                  </label>
                  <input 
                    type="text" 
                    id="formFactReason" 
                    [(ngModel)]="formFactReason" 
                    name="factReason" 
                    [placeholder]="formFactScore >= 95 ? 'ප්‍රධාන නිල මූලාශ්‍ර සහ මාධ්‍ය නිවේදන මඟින් 100% ක් සනාථ කර ඇත.' : 'සමාගමේ නිල නිවේදනය තවමත් බලාපොරොත්තුවේ. මූලික කාන්දුවීම් (leaks) මත පදනම් වේ.'"
                    class="w-full px-4 py-2.5 bg-white rounded-xl border border-emerald-300 text-sm text-emerald-950 focus:ring-2 focus:ring-emerald-600 outline-none font-sans"
                  />
                </div>
              </div>

              <div>
                <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label for="imageUpload" class="block text-sm font-bold text-gray-700 uppercase tracking-widest">Cover Image</label>
                  <button 
                    type="button" 
                    (click)="generateImageFromTitle()"
                    [disabled]="isGeneratingImage() || !formTitle.trim()"
                    class="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    <mat-icon [class.animate-spin]="isGeneratingImage()" style="font-size: 16px; width: 16px; height: 16px;">
                      {{ isGeneratingImage() ? 'autorenew' : 'auto_awesome' }}
                    </mat-icon>
                    <span>{{ isGeneratingImage() ? 'AI Image එක සාදමින් පවතී...' : '🎨 Title එකෙන් AI Image සාදන්න' }}</span>
                  </button>
                </div>

                @if (generatedImagePrompt()) {
                  <div class="mb-3 p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-800 flex items-start gap-2">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-purple-600 shrink-0 mt-0.5">info</mat-icon>
                    <div>
                      <span class="font-bold">AI Visual Prompt:</span> {{ generatedImagePrompt() }}
                    </div>
                  </div>
                }

                <div class="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                  @if (formImageUrl) {
                    <div class="relative w-full h-56 rounded-xl overflow-hidden mb-4 bg-gray-100">
                      <img [src]="formImageUrl" alt="Preview" loading="lazy"
                           #previewImg (load)="previewImg.classList.remove('opacity-0', 'blur-sm', 'scale-105'); previewImg.classList.add('opacity-100', 'blur-0', 'scale-100')"
                           class="w-full h-full object-cover transition-all duration-700 ease-out opacity-0 blur-sm scale-105">
                      <div class="absolute top-2 right-2 flex items-center gap-2 z-10">
                        <button type="button" (click)="generateImageFromTitle()" [disabled]="isGeneratingImage() || !formTitle.trim()" class="px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-full backdrop-blur-md flex items-center gap-1 shadow transition-all">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">refresh</mat-icon>
                          Regenerate
                        </button>
                        <button type="button" (click)="formImageUrl = ''; generatedImagePrompt.set('')" class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="py-8">
                      <mat-icon class="text-gray-400 mb-2" style="font-size: 48px; width: 48px; height: 48px;">add_photo_alternate</mat-icon>
                      <p class="text-sm font-bold text-gray-500 mb-1">Click to upload image or use AI Image Generator</p>
                      <p class="text-xs text-gray-400 font-medium">JPEG, PNG, WEBP (Max 2MB) or generated AI visual</p>
                    </div>
                  }
                  <input type="file" id="imageUpload" accept="image/*" (change)="onImageUpload($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" [required]="!formImageUrl">
                </div>

                <!-- Curated Suggested Images Gallery for Form -->
                <div class="mt-3">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center justify-between">
                    <span class="flex items-center gap-1">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-blue-600">auto_awesome</mat-icon>
                      Recommended High-Definition Photos for this Story (1-Click Select):
                    </span>
                  </div>
                  <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    @for (sug of getFormCuratedImages(); track sug) {
                      <button type="button" (click)="formImageUrl = sug"
                              class="relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all group cursor-pointer"
                              [class.border-blue-600]="formImageUrl === sug"
                              [class.border-transparent]="formImageUrl !== sug">
                        <img [src]="sug" alt="Curated" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        @if (formImageUrl === sug) {
                          <div class="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                            <mat-icon class="text-white drop-shadow" style="font-size: 18px; width: 18px; height: 18px;">check_circle</mat-icon>
                          </div>
                        }
                      </button>
                    }
                  </div>
                </div>

                <!-- Hidden input to still bind to the form model -->
                <input type="hidden" [(ngModel)]="formImageUrl" name="imageUrl">
              </div>

              <div>
                <label for="formContent" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Content</label>
                <textarea id="formContent" [(ngModel)]="formContent" name="content" required rows="10" class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-serif text-lg" placeholder="Full article content (paragraphs separated by blank lines)"></textarea>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 py-2 flex-wrap">
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="autoAlertPhone" [(ngModel)]="autoAlertPhone" name="autoAlertPhone" class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600">
                  <label for="autoAlertPhone" class="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">notifications_active</mat-icon>
                    Alert My Phone
                  </label>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="notifySubscribers" [(ngModel)]="notifySubscribers" name="notifySubscribers" class="w-4 h-4 rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF]">
                  <label for="notifySubscribers" class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Notify subscribers (Email)</label>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="autoPostWhatsApp" [(ngModel)]="autoPostWhatsApp" name="autoPostWhatsApp" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600">
                  <label for="autoPostWhatsApp" class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">chat</mat-icon>
                    Auto-Post to WhatsApp Channel
                  </label>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="autoPostFacebook" [(ngModel)]="autoPostFacebook" name="autoPostFacebook" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
                  <label for="autoPostFacebook" class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">share</mat-icon>
                    Auto-Post to Facebook Page
                  </label>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="submit" class="px-6 py-3 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-2xl font-bold tracking-wider uppercase text-xs transition-all shadow-md shadow-[#007AFF]/20 w-full sm:w-auto cursor-pointer active:scale-95">
                  {{ editingId() ? 'Update Story' : 'Publish Story' }}
                </button>
                <button type="button" (click)="cancelEdit()" class="px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-2xl font-bold tracking-wider uppercase text-xs hover:bg-gray-200 dark:hover:bg-white/20 transition-all w-full sm:w-auto cursor-pointer active:scale-95">
                  Cancel
                </button>
              </div>

            </form>
          </div>
        }

        <!-- ARTICLES MANAGEMENT SECTION -->
        <div class="space-y-4">
          <!-- Top Search & Filter Bar -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <!-- Search input -->
            <div class="relative flex-1">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">search</mat-icon>
              <input 
                type="text" 
                [(ngModel)]="searchArticleQuery" 
                placeholder="Search articles by title, category, or summary..." 
                class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] outline-none text-xs sm:text-sm font-medium text-gray-900 dark:text-white transition-all"
              />
              @if (searchArticleQuery()) {
                <button (click)="searchArticleQuery.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
                </button>
              }
            </div>

            <!-- Category Filter Tabs / Selector -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <select 
                [(ngModel)]="filterCategory" 
                class="px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-[#007AFF] cursor-pointer">
                <option value="ALL">All Categories</option>
                <option value="AI">AI</option>
                <option value="Tech">Tech</option>
                <option value="Local">Local</option>
                <option value="Global">Global</option>
                <option value="Business">Business</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Sports">Sports</option>
              </select>

              @if (selectedArticleIds().length > 0) {
                <button 
                  (click)="openBulkDeleteModal()" 
                  class="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete_sweep</mat-icon>
                  <span>Delete ({{ selectedArticleIds().length }})</span>
                </button>
              }
            </div>
          </div>

          <!-- Articles Table Card -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
            <!-- Header bar with counter & quick actions -->
            <div class="p-5 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <span>Published Stories</span>
                  <span class="px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-bold">{{ filteredArticles().length }}</span>
                </h2>
              </div>

              <div class="flex items-center gap-2">
                @if (selectedArticleIds().length > 0) {
                  <button 
                    (click)="clearSelection()" 
                    class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-xs font-semibold transition-all cursor-pointer">
                    Clear Selection ({{ selectedArticleIds().length }})
                  </button>
                }
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr class="bg-gray-50/50 dark:bg-white/5 border-b border-black/5 dark:border-white/10 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th class="py-3.5 px-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        [checked]="isAllSelected()" 
                        (change)="toggleSelectAll()" 
                        class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#007AFF] focus:ring-[#007AFF] cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th class="py-3.5 px-4">Story</th>
                    <th class="py-3.5 px-4">Category</th>
                    <th class="py-3.5 px-4">Date</th>
                    <th class="py-3.5 px-4 text-center">Views</th>
                    <th class="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-black/5 dark:divide-white/5">
                  @if (filteredArticles().length === 0) {
                    <tr>
                      <td colspan="6" class="p-12 text-center text-gray-400">
                        <mat-icon style="font-size: 32px; width: 32px; height: 32px;" class="mb-2 opacity-50">search_off</mat-icon>
                        <p class="font-bold text-sm text-gray-700 dark:text-gray-300">No articles found</p>
                        <p class="text-xs text-gray-400 mt-0.5">Try a different search term or category filter.</p>
                      </td>
                    </tr>
                  } @else {
                    @for (article of filteredArticles(); track article.id) {
                      <tr 
                        class="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors"
                        [class.bg-[#007AFF]/5]="isArticleSelected(article.id)">
                        <!-- Checkbox -->
                        <td class="py-3.5 px-4 text-center">
                          <input 
                            type="checkbox" 
                            [checked]="isArticleSelected(article.id)" 
                            (change)="toggleSelectArticle(article.id)" 
                            class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#007AFF] focus:ring-[#007AFF] cursor-pointer"
                          />
                        </td>

                        <!-- Title + Thumbnail -->
                        <td class="py-3.5 px-4">
                          <div class="flex items-center gap-3 max-w-md">
                            @if (article.imageUrl) {
                              <img 
                                [src]="article.imageUrl" 
                                [alt]="article.title" 
                                class="w-11 h-11 rounded-xl object-cover shrink-0 border border-black/5 dark:border-white/10 bg-gray-100 dark:bg-white/5" 
                                referrerpolicy="no-referrer"
                              />
                            }
                            <div class="min-w-0">
                              <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="font-bold text-xs sm:text-sm text-[#1d1d1f] dark:text-white hover:text-[#007AFF] transition-colors line-clamp-1">
                                {{ article.title }}
                              </a>
                              <p class="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{{ article.summary }}</p>
                            </div>
                          </div>
                        </td>

                        <!-- Category -->
                        <td class="py-3.5 px-4">
                          <span class="px-2.5 py-1 bg-[#007AFF]/10 text-[#007AFF] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {{ article.category }}
                          </span>
                        </td>

                        <!-- Date -->
                        <td class="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">{{ article.date }}</td>

                        <!-- Views -->
                        <td class="py-3.5 px-4 text-center">
                          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                            <mat-icon style="font-size: 12px; width: 12px; height: 12px;">visibility</mat-icon>
                            {{ article.views || 0 }}
                          </span>
                        </td>

                        <!-- Actions -->
                        <td class="py-3.5 px-4 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <!-- View live -->
                            <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-all active:scale-95" title="View Story">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">visibility</mat-icon>
                            </a>
                            <!-- Phone alert -->
                            <button (click)="sendPhoneAlertForArticle(article)" [disabled]="isSendingAlertForId() === article.id" class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50" title="Push Alert">
                              @if (isSendingAlertForId() === article.id) {
                                <div class="w-3 h-3 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                              } @else {
                                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">notifications_active</mat-icon>
                              }
                            </button>
                            <!-- WhatsApp -->
                            <button (click)="openWhatsAppModal(article)" class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer" title="WhatsApp Channel">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">chat</mat-icon>
                            </button>
                            <!-- Facebook -->
                            <button (click)="openFacebookModal(article)" class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer" title="Facebook Page">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">share</mat-icon>
                            </button>
                            <!-- Quick Image -->
                            <button (click)="openQuickImageModal(article)" class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer" title="Change Image">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">photo_camera</mat-icon>
                            </button>
                            <!-- Edit -->
                            <button (click)="editArticle(article)" class="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer" title="Edit">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                            </button>
                            <!-- Delete -->
                            <button 
                              (click)="openDeleteModal(article)" 
                              class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer" 
                              title="Delete Story">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        } @else if (activeTab() === 'auto-studio') {
          <!-- AUTO CONTENT GENERATION STUDIO -->
          <div class="space-y-6 animate-fade-in pb-12">
            <!-- Studio Hero Banner -->
            <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-[#121420] text-white relative overflow-hidden shadow-xl border border-white/10">
              <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-2.5">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">auto_awesome</mat-icon>
                    <span>Gemini 2.5 Pro Studio • Automated News Engine</span>
                  </div>
                  <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight text-white">Automated Content Studio</h2>
                  <p class="text-indigo-100/80 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                    Scan live tech trends, draft rich Sinhala stories, generate AI visuals, and dispatch WhatsApp channel updates with one click.
                  </p>
                </div>
                
                <div class="flex flex-wrap items-center gap-3 shrink-0">
                  <button 
                    type="button" 
                    (click)="loadTrendingNews()" 
                    [disabled]="isLoadingTrending()"
                    class="px-4 py-2.5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 active:scale-95">
                    <mat-icon [class.animate-spin]="isLoadingTrending()" style="font-size: 16px; width: 16px; height: 16px;">refresh</mat-icon>
                    <span>{{ isLoadingTrending() ? 'Scanning Feeds...' : 'Refresh Trends' }}</span>
                  </button>
                </div>
              </div>

              <!-- Sub-Navigation Switcher -->
              <div class="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('trending')" 
                  class="px-3.5 py-2 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  [class.bg-[#007AFF]]="autoStudioSubTab() === 'trending'"
                  [class.text-white]="autoStudioSubTab() === 'trending'"
                  [class.shadow-md]="autoStudioSubTab() === 'trending'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'trending'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'trending'">
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">radar</mat-icon>
                  <span>1. Live Trends ({{ trendingNews().length }})</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('topic')" 
                  class="px-3.5 py-2 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  [class.bg-[#007AFF]]="autoStudioSubTab() === 'topic'"
                  [class.text-white]="autoStudioSubTab() === 'topic'"
                  [class.shadow-md]="autoStudioSubTab() === 'topic'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'topic'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'topic'">
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">edit_note</mat-icon>
                  <span>2. Topic Studio</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('url')" 
                  class="px-3.5 py-2 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  [class.bg-[#007AFF]]="autoStudioSubTab() === 'url'"
                  [class.text-white]="autoStudioSubTab() === 'url'"
                  [class.shadow-md]="autoStudioSubTab() === 'url'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'url'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'url'">
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">link</mat-icon>
                  <span>3. URL to Story</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('polish')" 
                  class="px-3.5 py-2 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                  [class.bg-[#007AFF]]="autoStudioSubTab() === 'polish'"
                  [class.text-white]="autoStudioSubTab() === 'polish'"
                  [class.shadow-md]="autoStudioSubTab() === 'polish'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'polish'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'polish'">
                  <mat-icon style="font-size: 15px; width: 15px; height: 15px;">auto_fix_high</mat-icon>
                  <span>4. Content Polisher</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('autopilot'); loadAutoPilotStatus()" 
                  class="px-3.5 py-2 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer relative group"
                  [class.bg-emerald-600]="autoStudioSubTab() === 'autopilot'"
                  [class.text-white]="autoStudioSubTab() === 'autopilot'"
                  [class.shadow-md]="autoStudioSubTab() === 'autopilot'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'autopilot'"
                  [class.text-emerald-300]="autoStudioSubTab() !== 'autopilot'">
                  <div class="relative flex items-center justify-center">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">schedule</mat-icon>
                    <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <span>5. Auto-Pilot 24/7</span>
                  <span class="px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold tracking-tight">1-Hr</span>
                </button>
              </div>
            </div>

            <!-- SUB-TAB 1: LIVE TECH TRENDS & 1-CLICK AUTO-PUBLISHER -->
            @if (autoStudioSubTab() === 'trending') {
              <div class="space-y-6">
                <!-- Action & Controls Bar -->
                <div class="p-6 bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 class="font-black text-gray-900 text-lg flex items-center gap-2">
                      <mat-icon class="text-indigo-600">trending_up</mat-icon>
                      <span>Live Tech Feeds & Trends Radar</span>
                    </h3>
                    <p class="text-xs text-gray-500 mt-0.5">TechCrunch AI, The Verge, Google News AI, Wired, Daily FT පුවත් ස්වයංක්‍රීයව පරිලෝකනය වේ.</p>
                  </div>

                  <!-- Automation Options & Batch Trigger -->
                  <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button 
                      type="button"
                      (click)="toggleSelectAllTrending()"
                      class="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                      {{ selectedTrendingIds().length === trendingNews().length && trendingNews().length > 0 ? 'Deselect All' : 'Select All (' + trendingNews().length + ')' }}
                    </button>

                    <button 
                      type="button" 
                      (click)="batchGenerateAndPublishSelected()" 
                      [disabled]="selectedTrendingIds().length === 0 || isBatchGenerating()"
                      class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-40">
                      @if (isBatchGenerating()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        <span>Publishing {{ batchProgress().current }}/{{ batchProgress().total }}...</span>
                      } @else {
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bolt</mat-icon>
                        <span>Batch Auto-Publish ({{ selectedTrendingIds().length }})</span>
                      }
                    </button>
                  </div>
                </div>

                <!-- Batch Progress Alert -->
                @if (isBatchGenerating()) {
                  <div class="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl animate-pulse flex flex-col gap-2">
                    <div class="flex justify-between items-center text-xs font-bold text-indigo-900">
                      <span>{{ batchProgress().message }}</span>
                      <span>{{ batchProgress().current }} / {{ batchProgress().total }} Completed</span>
                    </div>
                    <div class="w-full h-2.5 bg-indigo-200 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-600 transition-all duration-300" [style.width.%]="(batchProgress().current / (batchProgress().total || 1)) * 100"></div>
                    </div>
                  </div>
                }

                <!-- Trending Feed Cards Grid -->
                @if (isLoadingTrending()) {
                  <div class="p-16 text-center bg-white rounded-3xl border border-black/5 shadow-sm space-y-4">
                    <div class="w-12 h-12 rounded-full border-4 border-indigo-600/30 border-t-indigo-600 animate-spin mx-auto"></div>
                    <p class="text-sm font-bold text-gray-700">Scanning top global & local tech feeds with live AI...</p>
                  </div>
                } @else if (trendingNews().length === 0) {
                  <div class="p-16 text-center bg-white rounded-3xl border border-black/5 shadow-sm space-y-4">
                    <mat-icon class="text-gray-300" style="font-size: 48px; width: 48px; height: 48px;">feed</mat-icon>
                    <h4 class="text-base font-bold text-gray-700">No trending items loaded yet</h4>
                    <button type="button" (click)="loadTrendingNews()" class="px-6 py-3 rounded-full bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider">
                      Fetch Latest Tech News Feeds
                    </button>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @for (item of trendingNews(); track item.id) {
                      <div 
                        class="bg-white rounded-3xl border transition-all duration-200 p-5 flex flex-col justify-between group shadow-sm hover:shadow-md"
                        [class.border-indigo-500]="isTrendingSelected(item.id)"
                        [class.bg-indigo-50/20]="isTrendingSelected(item.id)"
                        [class.border-black/5]="!isTrendingSelected(item.id)">
                        <div>
                          <!-- Card Header: Source & Selection -->
                          <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
                              {{ item.source }}
                            </span>
                            
                            <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-500 hover:text-indigo-600">
                              <input 
                                type="checkbox" 
                                [checked]="isTrendingSelected(item.id)" 
                                (change)="toggleSelectTrending(item.id)"
                                class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer">
                              <span>Select</span>
                            </label>
                          </div>

                          <!-- Thumbnail -->
                          @if (item.imageUrl) {
                            <div class="w-full h-36 rounded-2xl bg-gray-100 overflow-hidden mb-3.5 border border-black/5">
                              <img [src]="item.imageUrl" [alt]="item.title" referrerpolicy="no-referrer" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            </div>
                          }

                          <h4 class="font-bold text-[#1d1d1f] text-sm leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                            {{ item.title }}
                          </h4>
                          
                          <p class="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4">
                            {{ item.description }}
                          </p>
                        </div>

                        <!-- Card Action Buttons -->
                        <div class="pt-3 border-t border-gray-100 space-y-2">
                          <div class="flex gap-2">
                            <button 
                              type="button" 
                              (click)="generateAndReviewTrending(item)"
                              [disabled]="isGeneratingStudioArticle()"
                              class="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                              <mat-icon style="font-size: 15px; width: 15px; height: 15px;">edit_note</mat-icon>
                              <span>Draft & Review</span>
                            </button>

                            <button 
                              type="button" 
                              (click)="autoPublishSingleTrending(item)"
                              [disabled]="isGeneratingStudioArticle() || isBatchGenerating()"
                              class="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                              <mat-icon style="font-size: 15px; width: 15px; height: 15px;">rocket_launch</mat-icon>
                              <span>1-Click Publish</span>
                            </button>
                          </div>

                          @if (item.url) {
                            <a [href]="item.url" target="_blank" class="text-[10px] text-gray-400 hover:text-indigo-500 block text-center truncate">
                              Source URL: {{ item.url }}
                            </a>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- SUB-TAB 2: ADVANCED TOPIC & KEYWORD STUDIO -->
            @if (autoStudioSubTab() === 'topic') {
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <!-- Topic Form Controls (5 cols) -->
                <div class="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <mat-icon>psychology</mat-icon>
                    </div>
                    <div>
                      <h3 class="font-black text-gray-900 text-lg">Topic & Custom Angle</h3>
                      <p class="text-xs text-gray-500">පුවත් මාතෘකාව හෝ සටහන් ලබා දෙන්න</p>
                    </div>
                  </div>

                  <!-- Topic Input -->
                  <div>
                    <label for="studioTopic" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Main Topic / News Headline *</label>
                    <input 
                      id="studioTopic" 
                      type="text" 
                      [(ngModel)]="studioTopic" 
                      name="studioTopic" 
                      placeholder="e.g. Starlink Internet Launches in Sri Lanka with TRCSL Approval" 
                      class="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-semibold text-gray-900">
                  </div>

                  <!-- Additional Background Context -->
                  <div>
                    <label for="studioContext" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rough Notes / Key Specs / Context (Optional)</label>
                    <textarea 
                      id="studioContext" 
                      rows="3" 
                      [(ngModel)]="studioContext" 
                      name="studioContext" 
                      placeholder="e.g. Monthly subscription around Rs. 15,000, hardware kit Rs. 95,000, speeds up to 250 Mbps..." 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-xs text-gray-800 leading-relaxed"></textarea>
                  </div>

                  <!-- Options Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="studioTone" class="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Writing Tone</label>
                      <select id="studioTone" [(ngModel)]="studioTone" name="studioTone" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none">
                        <option value="journalistic">Journalistic News (මාධ්‍යවේදී පුවත්)</option>
                        <option value="deep_review">Deep Tech Review (ගැඹුරු විශ්ලේෂණ)</option>
                        <option value="beginner_guide">Beginner Guide (සරල පැහැදිලි කිරීමක්)</option>
                        <option value="breaking">Breaking Alert (හදිසි පුවත්)</option>
                      </select>
                    </div>

                    <div>
                      <label for="studioLength" class="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Article Length</label>
                      <select id="studioLength" [(ngModel)]="studioLength" name="studioLength" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none">
                        <option value="short">Short Flash (400-600 වචන)</option>
                        <option value="standard">Standard News (700-1000 වචන)</option>
                        <option value="comprehensive">Comprehensive Long Form (1200+ වචන)</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="studioAudience" class="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Target Audience</label>
                      <select id="studioAudience" [(ngModel)]="studioAudience" name="studioAudience" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 outline-none">
                        <option value="sri_lanka">Sri Lanka Tech Community (දේශීය)</option>
                        <option value="general">General Public (සාමාන්‍ය පාඨක)</option>
                        <option value="developers">Developers / Geeks (තාක්ෂණවේදීන්)</option>
                      </select>
                    </div>

                    <div class="flex items-center pt-5">
                      <label class="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="studioIncludeLkr" name="studioIncludeLkr" class="w-4 h-4 rounded text-indigo-600 border-gray-300">
                        <span>Include LKR (රුපියල්) Pricing Estimates</span>
                      </label>
                    </div>
                  </div>

                  <!-- Generate Button -->
                  <button 
                    type="button" 
                    (click)="generateStudioTopicArticle()" 
                    [disabled]="isGeneratingStudioArticle() || !studioTopic.trim()"
                    class="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    @if (isGeneratingStudioArticle()) {
                      <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Generating Full Sinhala Story & AI Art...</span>
                    } @else {
                      <mat-icon>auto_awesome</mat-icon>
                      <span>Generate Full News Article</span>
                    }
                  </button>
                </div>

                <!-- Live Generated Article Output Preview (7 cols) -->
                <div class="lg:col-span-7">
                  @if (generatedStudioArticle(); as art) {
                    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-6 animate-fade-in">
                      <div class="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div class="flex items-center gap-2">
                          <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                            Ready for Publishing
                          </span>
                          <span class="text-xs text-gray-400 font-bold">{{ art.suggestedCategory || 'Tech' }} • {{ art.readTime || '5 min' }}</span>
                        </div>

                        <div class="flex gap-2">
                          <button (click)="regenerateStudioImage()" [disabled]="isGeneratingImage()" class="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">image</mat-icon>
                            <span>New Art</span>
                          </button>
                        </div>
                      </div>

                      <!-- Title & Summary -->
                      <div>
                        <input 
                          [(ngModel)]="art.sinhalaTitle" 
                          class="w-full text-xl sm:text-2xl font-black text-gray-900 border-b border-dashed border-gray-200 focus:border-indigo-600 outline-none pb-1" />
                        <textarea 
                          [(ngModel)]="art.sinhalaDescription" 
                          rows="2" 
                          class="w-full text-xs sm:text-sm text-gray-600 mt-2 border border-gray-100 p-2.5 rounded-xl focus:ring-1 focus:ring-indigo-600 outline-none leading-relaxed"></textarea>
                      </div>

                      <!-- AI Image Preview -->
                      @if (art.imageUrl) {
                        <div class="relative rounded-2xl overflow-hidden bg-gray-100 max-h-64 border border-black/5">
                          <img [src]="art.imageUrl" [alt]="art.sinhalaTitle" class="w-full h-full object-cover">
                        </div>
                      }

                      <!-- Formatted Article Content Preview -->
                      <div class="space-y-2">
                        <div class="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <span>Article Content (Formatted Sinhala HTML)</span>
                          <span class="text-[10px] text-gray-400">Rendered Preview</span>
                        </div>
                        <div 
                          class="max-h-72 overflow-y-auto p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed font-sans prose prose-sm max-w-none"
                          [innerHTML]="art.sinhalaFullContent">
                        </div>
                      </div>

                      <!-- Social / WhatsApp Copy Box -->
                      @if (art.socialShareText) {
                        <div class="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 space-y-2">
                          <div class="flex items-center justify-between text-emerald-900 font-bold text-xs">
                            <span class="flex items-center gap-1.5"><mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-emerald-600">chat</mat-icon> WhatsApp / Social Media Copy</span>
                            <button (click)="copyToClipboard(art.socialShareText, 'WhatsApp snippet copied!')" class="px-2.5 py-1 rounded bg-white text-emerald-700 text-[10px] font-black uppercase hover:bg-emerald-100 border border-emerald-200">
                              Copy Text
                            </button>
                          </div>
                          <p class="text-[11px] text-emerald-900/80 font-mono whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">{{ art.socialShareText }}</p>
                        </div>
                      }

                      <!-- Final Action Buttons -->
                      <div class="flex flex-col sm:flex-row gap-3 pt-2">
                        <button 
                          type="button" 
                          (click)="publishStudioArticleDirectly()" 
                          [disabled]="isDirectPublishing()"
                          class="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                          @if (isDirectPublishing()) {
                            <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>Publishing to Live Site...</span>
                          } @else {
                            <mat-icon>rocket_launch</mat-icon>
                            <span>🚀 1-Click Publish to MyFeed</span>
                          }
                        </button>

                        <button 
                          type="button" 
                          (click)="loadStudioArticleIntoMainEditor()" 
                          class="px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <mat-icon>edit</mat-icon>
                          <span>Open in Full Editor</span>
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="p-16 text-center bg-white rounded-3xl border border-black/5 shadow-sm space-y-4">
                      <div class="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <mat-icon style="font-size: 32px; width: 32px; height: 32px;">psychology</mat-icon>
                      </div>
                      <h4 class="text-base font-bold text-gray-700">Enter a topic and click "Generate Full News Article"</h4>
                      <p class="text-xs text-gray-400 max-w-sm mx-auto">
                        Gemini AI will automatically craft the headline, summary, deep content sections with subheadings, generate an AI image prompt, and create a ready-to-share WhatsApp snippet.
                      </p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- SUB-TAB 3: NEWS URL TO ARTICLE -->
            @if (autoStudioSubTab() === 'url') {
              <div class="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-black/5 shadow-sm space-y-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <mat-icon style="font-size: 24px; width: 24px; height: 24px;">link</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-gray-900">Foreign or Local News URL to Sinhala Article</h3>
                    <p class="text-xs text-gray-500">ඕනෑම Tech / News වෙබ් ලින්ක් එකකින් තත්පර ගණනකින් සිංහල පුවතක් සකසන්න</p>
                  </div>
                </div>

                <div>
                  <label for="studioUrl" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Web Article URL</label>
                  <input 
                    id="studioUrl" 
                    type="url" 
                    [(ngModel)]="studioUrl" 
                    placeholder="https://www.theverge.com/2026/... or https://techcrunch.com/..." 
                    class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-mono text-gray-900">
                </div>

                <div class="flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button" 
                    (click)="generateStudioUrlArticle()" 
                    [disabled]="isGeneratingStudioArticle() || !studioUrl.trim()" 
                    class="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    @if (isGeneratingStudioArticle()) {
                      <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Reading URL & Transcompiling to Sinhala...</span>
                    } @else {
                      <mat-icon>bolt</mat-icon>
                      <span>Fetch & Generate Sinhala Article</span>
                    }
                  </button>
                </div>
              </div>
            }

            <!-- SUB-TAB 4: CONTENT POLISHER & AI FORMATTER -->
            @if (autoStudioSubTab() === 'polish') {
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <!-- Input Box (6 cols) -->
                <div class="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <mat-icon>auto_fix_high</mat-icon>
                    </div>
                    <div>
                      <h3 class="font-black text-gray-900 text-lg">Smart Content Polisher</h3>
                      <p class="text-xs text-gray-500">අක්ෂර වින්‍යාසය, උපශීර්ෂ (h2), සහ WhatsApp post සැකසීම</p>
                    </div>
                  </div>

                  <div>
                    <label for="polishTitle" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Article Title (Optional)</label>
                    <input id="polishTitle" type="text" [(ngModel)]="polishTitle" placeholder="Article Title" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-900 outline-none">
                  </div>

                  <div>
                    <label for="polishInput" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Draft Content (Sinhala or English Notes) *</label>
                    <textarea 
                      id="polishInput" 
                      rows="8" 
                      [(ngModel)]="polishInput" 
                      placeholder="Paste your rough text, raw news notes, or draft here..." 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none text-xs leading-relaxed text-gray-800 font-sans"></textarea>
                  </div>

                  <!-- Action Buttons -->
                  <div class="grid grid-cols-2 gap-2 pt-2">
                    <button 
                      type="button" 
                      (click)="runContentPolish('polish_all')" 
                      [disabled]="isPolishingContent() || !polishInput.trim()"
                      class="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">sparkles</mat-icon>
                      <span>Full Polish & Format</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="runContentPolish('social_copy')" 
                      [disabled]="isPolishingContent() || !polishInput.trim()"
                      class="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">chat</mat-icon>
                      <span>WhatsApp Copy Only</span>
                    </button>
                  </div>
                </div>

                <!-- Polish Output (6 cols) -->
                <div class="lg:col-span-6">
                  @if (polishedContentResult(); as res) {
                    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-purple-100 shadow-xl space-y-5 animate-fade-in">
                      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
                        <span class="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider">
                          Polished Output
                        </span>
                        <button (click)="applyPolishedToEditor()" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold uppercase hover:bg-indigo-700 transition-all flex items-center gap-1">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">check</mat-icon>
                          <span>Apply to Post</span>
                        </button>
                      </div>

                      @if (res.polishedTitle) {
                        <div>
                          <div class="text-[10px] font-bold uppercase text-gray-400">Polished Headline</div>
                          <div class="text-base font-black text-gray-900">{{ res.polishedTitle }}</div>
                        </div>
                      }

                      @if (res.polishedContent) {
                        <div>
                          <div class="text-[10px] font-bold uppercase text-gray-400 mb-1">Formatted HTML Content</div>
                          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-800 max-h-56 overflow-y-auto leading-relaxed" [innerHTML]="res.polishedContent"></div>
                        </div>
                      }

                      @if (res.socialShareText) {
                        <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1.5">
                          <div class="flex justify-between items-center text-xs font-bold text-emerald-900">
                            <span>WhatsApp Channel Post</span>
                            <button (click)="copyToClipboard(res.socialShareText, 'WhatsApp copy saved to clipboard!')" class="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">Copy</button>
                          </div>
                          <p class="text-xs text-emerald-900 font-mono whitespace-pre-wrap">{{ res.socialShareText }}</p>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="p-16 text-center bg-white rounded-3xl border border-black/5 shadow-sm space-y-4">
                      <mat-icon class="text-purple-300" style="font-size: 48px; width: 48px; height: 48px;">auto_fix_high</mat-icon>
                      <h4 class="text-base font-bold text-gray-700">Paste your text & choose a polish action</h4>
                      <p class="text-xs text-gray-400 max-w-xs mx-auto">Enhance spelling, grammar, convert raw paragraphs into structured headings, or generate WhatsApp posts.</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- SUB-TAB 5: AUTO-PILOT 24/7 HOURLY NEWS ENGINE -->
            @if (autoStudioSubTab() === 'autopilot') {
              <div class="space-y-8 animate-fade-in">
                <!-- Status & Control Header Banner -->
                <div class="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 text-white border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                  <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div class="space-y-2 max-w-2xl">
                      <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider">
                          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" [class.animate-pulse]="autoPilotEnabled"></span>
                          <span>{{ autoPilotEnabled ? 'AUTO-PILOT ACTIVE (24/7)' : 'AUTO-PILOT PAUSED' }}</span>
                        </div>
                        <span class="text-xs text-gray-400 font-mono">Interval: {{ autoPilotIntervalMinutes }} Minutes</span>
                      </div>
                      <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight">පැයෙන් පැයට ස්වයංක්‍රීය පුවත් එන්ජිම (1-Hour Auto Sync)</h3>
                      <p class="text-sm text-gray-300 leading-relaxed">
                        ලොව ප්‍රමුඛ පෙළේ AI සහ තාක්ෂණ පුවත් මූලාශ්‍ර (TechCrunch, The Verge, Wired, Google News) ස්වයංක්‍රීයව පරිලෝකනය කර, අලුත්ම පුවත් තෝරාගෙන, Gemini AI මඟින් පූර්ණ සිංහල වාර්තා සකස් කර Firestore වෙත Publish කරයි.
                      </p>
                    </div>

                    <!-- Actions & Countdown -->
                    <div class="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 shrink-0">
                      <!-- Next Sync Countdown Box -->
                      <div class="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between gap-4">
                        <div>
                          <div class="text-[10px] uppercase font-bold tracking-widest text-gray-400">Next Scheduled Sync</div>
                          <div class="text-lg font-black text-emerald-400 font-mono">{{ autoPilotCountdown() }}</div>
                        </div>
                        <mat-icon class="text-emerald-400" style="font-size: 24px; width: 24px; height: 24px;">timelapse</mat-icon>
                      </div>

                      <button 
                        type="button" 
                        (click)="triggerAutoPilotNow()" 
                        [disabled]="isTriggeringAutoPilot()"
                        class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        @if (isTriggeringAutoPilot()) {
                          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Scanning & Publishing Now...</span>
                        } @else {
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bolt</mat-icon>
                          <span>⚡ Sync Now (දැන්ම පුවත් Sync කරන්න)</span>
                        }
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 2-Column Controls: Settings + 24/7 Cloud Webhook Setup -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <!-- Configuration Panel (6 cols) -->
                  <div class="lg:col-span-6 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-black/5 space-y-6">
                    <div class="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-indigo-600">schedule</mat-icon>
                        <h4 class="text-base font-bold text-[#1d1d1f]">Auto-Pilot කාලසටහන (Schedule Settings)</h4>
                      </div>
                      <button (click)="loadAutoPilotStatus()" class="text-xs text-gray-500 hover:text-indigo-600 font-bold flex items-center gap-1">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">refresh</mat-icon> Refresh
                      </button>
                    </div>

                    <div class="space-y-5">
                      <!-- Enable Toggle -->
                      <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div class="text-sm font-bold text-gray-900">Auto-Pilot Active State</div>
                          <div class="text-xs text-gray-500">ස්වයංක්‍රීය පුවත් පද්ධතිය ක්‍රියාත්මක තත්ත්වය</div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="autoPilotEnabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <!-- Schedule Mode Switcher -->
                      <div>
                        <div class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">පුවත් පළවන ආකාරය (Schedule Mode)</div>
                        <div class="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                          <button 
                            type="button" 
                            (click)="autoPilotScheduleMode = 'interval'" 
                            class="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            [class.bg-white]="autoPilotScheduleMode === 'interval'"
                            [class.text-indigo-600]="autoPilotScheduleMode === 'interval'"
                            [class.shadow-sm]="autoPilotScheduleMode === 'interval'"
                            [class.text-gray-600]="autoPilotScheduleMode !== 'interval'">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">timelapse</mat-icon>
                            <span>Interval Loop (පැයෙන් පැයට)</span>
                          </button>

                          <button 
                            type="button" 
                            (click)="autoPilotScheduleMode = 'exact_times'" 
                            class="py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            [class.bg-white]="autoPilotScheduleMode === 'exact_times'"
                            [class.text-indigo-600]="autoPilotScheduleMode === 'exact_times'"
                            [class.shadow-sm]="autoPilotScheduleMode === 'exact_times'"
                            [class.text-gray-600]="autoPilotScheduleMode !== 'exact_times'">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">alarm</mat-icon>
                            <span>Exact Times (නියමිත වේලාවන්)</span>
                          </button>
                        </div>
                      </div>

                      <!-- OPTION A: INTERVAL MODE -->
                      @if (autoPilotScheduleMode === 'interval') {
                        <div class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                          <label for="adminAutoPilotInterval" class="block text-xs font-bold text-indigo-900 uppercase tracking-wider">Sync Frequency (කාල පරතරය)</label>
                          <select id="adminAutoPilotInterval" [(ngModel)]="autoPilotIntervalMinutes" class="w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none">
                            <option [value]="30">Every 30 Minutes (මිනිත්තු 30 කට වරක්)</option>
                            <option [value]="60">Every 1 Hour (පැයෙන් පැයට - නිර්දේශිතයි)</option>
                            <option [value]="120">Every 2 Hours (පැය 2 කට වරක්)</option>
                            <option [value]="180">Every 3 Hours (පැය 3 කට වරක්)</option>
                            <option [value]="240">Every 4 Hours (පැය 4 කට වරක්)</option>
                            <option [value]="360">Every 6 Hours (පැය 6 කට වරක්)</option>
                          </select>
                          <p class="text-[11px] text-indigo-700">පද්ධතිය ස්වයංක්‍රීයව තෝරාගත් මිනිත්තු සංඛ්‍යාවෙන් සංඛ්‍යාවට අලුත්ම පුවත් පරිලෝකනය කරයි.</p>
                        </div>
                      }

                      <!-- OPTION B: EXACT DAILY CLOCK TIMES MODE -->
                      @if (autoPilotScheduleMode === 'exact_times') {
                        <div class="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
                          <div class="flex items-center justify-between">
                            <div class="block text-xs font-bold text-emerald-950 uppercase tracking-wider">දවසේ පුවත් පළවන නියමිත වේලාවන් (Asia/Colombo 🇱🇰)</div>
                            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">{{ autoPilotScheduledDailyTimes.length }} Times/Day</span>
                          </div>

                          <!-- Current Active Scheduled Times Badges -->
                          <div class="flex flex-wrap gap-2">
                            @for (t of autoPilotScheduledDailyTimes; track t) {
                              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl shadow-xs text-xs font-bold text-gray-800">
                                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-emerald-600">access_time</mat-icon>
                                <span>{{ formatTimeDisplay(t) }}</span>
                                <button type="button" (click)="removeScheduledTime(t)" class="text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Remove this time">
                                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">close</mat-icon>
                                </button>
                              </div>
                            }
                          </div>

                          <!-- Add Custom Time Input -->
                          <div class="flex items-center gap-2 pt-1">
                            <input 
                              id="adminAutoPilotNewTime"
                              type="time" 
                              [(ngModel)]="autoPilotNewTimeInput" 
                              class="px-3 py-2 bg-white rounded-xl border border-emerald-300 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-600" />
                            <button 
                              type="button" 
                              (click)="addScheduledTime()" 
                              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon> Add Time (වේලාවක් එකතු කරන්න)
                            </button>
                          </div>

                          <!-- 1-Click Presets -->
                          <div class="space-y-1.5 pt-2 border-t border-emerald-200/60">
                            <div class="text-[10px] uppercase font-bold text-emerald-800">Quick 1-Click Presets:</div>
                            <div class="flex flex-wrap gap-1.5">
                              <button type="button" (click)="applySchedulePreset('fourteen_times')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs">
                                🌟 14x Round-the-Clock (12:17 AM, 1:43 AM, 3:08 AM, 5:52 AM, 7:26 AM, 9:41 AM, 11:13 AM, 12:58 PM, 2:34 PM, 4:19 PM, 6:47 PM, 8:22 PM, 10:36 PM, 11:51 PM)
                              </button>
                              <button type="button" (click)="applySchedulePreset('four_times')" class="px-2.5 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold transition-all cursor-pointer">
                                ⚡ 4x Day (08:00 AM, 12:00 PM, 04:00 PM, 08:00 PM)
                              </button>
                              <button type="button" (click)="applySchedulePreset('six_times')" class="px-2.5 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold transition-all cursor-pointer">
                                🚀 6x Day (07:00 AM, 10:30 AM, 02:00 PM, 05:30 PM, 08:30 PM, 11:00 PM)
                              </button>
                              <button type="button" (click)="applySchedulePreset('morning_evening')" class="px-2.5 py-1 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold transition-all cursor-pointer">
                                🌅 2x Day (08:30 AM, 07:30 PM Prime)
                              </button>
                            </div>
                          </div>
                        </div>
                      }

                      <!-- Max Articles per Run -->
                      <div>
                        <label for="adminAutoPilotMaxArticles" class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Max Articles Per Sync Cycle</label>
                        <select id="adminAutoPilotMaxArticles" [(ngModel)]="autoPilotMaxArticles" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none">
                          <option [value]="1">1 Breaking Article per run</option>
                          <option [value]="2">2 Breaking Articles per run (Recommended)</option>
                          <option [value]="3">3 Breaking Articles per run</option>
                        </select>
                      </div>

                      <!-- Direct Live Publish vs Draft -->
                      <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div class="text-sm font-bold text-gray-900">Direct Live Publishing</div>
                          <div class="text-xs text-gray-500">Publish directly to feed vs save to drafts</div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="autoPilotAutoPublish" class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <!-- Phone Alert Notification -->
                      <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div class="text-sm font-bold text-gray-900">Mobile Phone Alert (ntfy.sh)</div>
                          <div class="text-xs text-gray-500">Send push notification to your phone</div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="autoPilotNotifyPhone" class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <!-- WhatsApp Auto Post -->
                      <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div class="text-sm font-bold text-gray-900">WhatsApp Channel Auto-Post</div>
                          <div class="text-xs text-gray-500">Send formatted post to WhatsApp webhook</div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="autoPilotPostWhatsApp" class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      <!-- Facebook Page Auto Post -->
                      <div class="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div>
                          <div class="text-sm font-bold text-gray-900">Facebook Page Auto-Post</div>
                          <div class="text-xs text-gray-500">Send post & original cover photo to Facebook webhook</div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" [(ngModel)]="autoPilotPostFacebook" class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <!-- Save Configuration Button -->
                      <button 
                        type="button" 
                        (click)="saveAutoPilotConfig()" 
                        [disabled]="isSavingAutoPilotConfig()"
                        class="w-full py-3.5 rounded-2xl bg-[#1d1d1f] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md">
                        @if (isSavingAutoPilotConfig()) {
                          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving Settings...</span>
                        } @else {
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">save</mat-icon>
                          <span>Save Auto-Pilot Settings</span>
                        }
                      </button>
                    </div>
                  </div>

                  <!-- 24/7 Cloud Webhook Cron Setup Guide (6 cols) -->
                  <div class="lg:col-span-6 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-black/5 space-y-6 flex flex-col justify-between">
                    <div class="space-y-4">
                      <div class="flex items-center gap-2 pb-4 border-b border-gray-100">
                        <mat-icon class="text-emerald-600">cloud_sync</mat-icon>
                        <h4 class="text-base font-bold text-[#1d1d1f]">24/7 Autonomous Cloud Trigger (Userla නැතත් 100% ක්‍රියාත්මකයි)</h4>
                      </div>

                      <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                        <mat-icon class="text-amber-600 shrink-0 mt-0.5" style="font-size: 18px; width: 18px; height: 18px;">info</mat-icon>
                        <div>
                          <strong>User කෙනෙක් Website එකේ නොසිටියත්</strong> නියමිත වේලාවටම (හෝ පැයෙන් පැයට) Server එක Wake වී AI එකෙන් News generate වී Live Publish වීමට පහත Webhook URL එක <strong>නොමිලේ Cloud Cron</strong> එකකට සම්බන්ධ කරන්න.
                        </div>
                      </div>

                      <!-- Webhook Endpoint Box -->
                      <div class="p-4 rounded-2xl bg-gray-900 text-white space-y-2">
                        <div class="flex items-center justify-between text-xs text-gray-400">
                          <span class="font-mono text-emerald-400 font-bold">CRON TRIGGER WEBHOOK URL:</span>
                          <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">GET / POST</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <input type="text" readonly [value]="cronWebhookUrl" class="w-full bg-transparent font-mono text-xs text-emerald-300 outline-none truncate" />
                          <button (click)="copyToClipboard(cronWebhookUrl, 'Cron Webhook URL copied!')" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1">
                            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">content_copy</mat-icon> Copy
                          </button>
                        </div>
                      </div>

                      <!-- 3-Step Simple Setup Instructions -->
                      <div class="space-y-3 pt-2">
                        <div class="text-xs font-bold uppercase tracking-wider text-gray-700">නොමිලේ 1 Minute එකෙන් Set කරගන්නා ආකාරය:</div>
                        
                        <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div class="text-xs text-gray-700">
                            <strong>cron-job.org</strong> (නොමිලේ Cloud Cron සේවාවකට) පිවිස Account එකක් සාදන්න.
                          </div>
                        </div>

                        <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div class="text-xs text-gray-700">
                            <strong>Create Cronjob</strong> ක්ලික් කර, URL එකට ඉහත Webhook URL එක Paste කරන්න.
                          </div>
                        </div>

                        <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div class="text-xs text-gray-700">
                            Schedule එක <strong>"Every 1 hour"</strong> හෝ ඔබට අවශ්‍ය <strong>නියමිත වේලාවන් (Exact Times)</strong> තෝරා <strong>Save</strong> කරන්න.
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Security & Specs Footer Note -->
                    <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 flex items-center gap-3 mt-4">
                      <mat-icon class="text-emerald-600 shrink-0">verified</mat-icon>
                      <span>Anti-Duplicate Shield සක්‍රීයයි: එකම පුවත නැවත පළ නොවන සේ 100% ක් Title & URL deduplication සිදු කෙරේ.</span>
                    </div>
                  </div>
                </div>

                <!-- Live Auto-Pilot Activity & Sync Logs -->
                <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-black/5 space-y-6">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-indigo-600">history</mat-icon>
                      <h4 class="text-base font-bold text-[#1d1d1f]">Live Execution History & Sync Logs</h4>
                      <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">
                        {{ autoPilotLogs().length }} events
                      </span>
                    </div>
                    <button (click)="loadAutoPilotStatus()" class="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 self-start sm:self-auto">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">refresh</mat-icon> Refresh Logs
                    </button>
                  </div>

                  @if (autoPilotLogs().length === 0) {
                    <div class="p-12 text-center text-gray-400 space-y-3">
                      <mat-icon style="font-size: 40px; width: 40px; height: 40px;" class="text-gray-300">hourglass_empty</mat-icon>
                      <div class="text-sm font-medium">No sync events recorded yet. Click "⚡ Sync Now" to run the first check.</div>
                    </div>
                  } @else {
                    <div class="space-y-3">
                      @for (log of autoPilotLogs(); track log.id) {
                        <div class="p-4 sm:p-5 rounded-2xl border transition-all"
                             [class.bg-emerald-50/50]="log.status === 'success'"
                             [class.border-emerald-200]="log.status === 'success'"
                             [class.bg-amber-50/40]="log.status === 'warning'"
                             [class.border-amber-200]="log.status === 'warning'"
                             [class.bg-red-50/40]="log.status === 'error'"
                             [class.border-red-200]="log.status === 'error'">
                          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                              @if (log.status === 'success') {
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span class="text-xs font-bold text-emerald-800 uppercase tracking-wide">Sync Successful</span>
                              } @else if (log.status === 'warning') {
                                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span class="text-xs font-bold text-amber-800 uppercase tracking-wide">Up to Date</span>
                              } @else {
                                <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                <span class="text-xs font-bold text-red-800 uppercase tracking-wide">Sync Error</span>
                              }
                              <span class="text-xs text-gray-500 font-mono">({{ log.triggerType }})</span>
                            </div>

                            <div class="flex items-center gap-3 text-xs text-gray-500 font-mono">
                              <span>⏱️ {{ log.durationMs }}ms</span>
                              <span>•</span>
                              <span>{{ log.timestamp }}</span>
                            </div>
                          </div>

                          <p class="text-xs text-gray-700 font-medium mb-3">{{ log.message }}</p>

                          <!-- Published Articles from this run -->
                          @if (log.publishedArticles && log.publishedArticles.length > 0) {
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-black/5">
                              @for (pub of log.publishedArticles; track pub.title) {
                                <div class="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 border border-black/5">
                                  <img [src]="pub.imageUrl" alt="Thumb" referrerpolicy="no-referrer" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                                  <div class="min-w-0 flex-1">
                                    <div class="text-xs font-bold text-gray-900 truncate">{{ pub.title }}</div>
                                    <div class="text-[10px] text-gray-500 flex items-center gap-2">
                                      <span class="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold">{{ pub.category }}</span>
                                      @if (pub.url) {
                                        <a [href]="pub.url" target="_blank" class="text-blue-600 hover:underline">View Article ↗</a>
                                      }
                                    </div>
                                  </div>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else if (activeTab() === 'subscribers') {
          <!-- Subscribers Tab -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
            <div class="p-5 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
              <div>
                <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <span>Newsletter Subscribers</span>
                  <span class="px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-bold">{{ subscriberService.subscribers().length }}</span>
                </h2>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr class="bg-gray-50/50 dark:bg-white/5 border-b border-black/5 dark:border-white/10 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th class="py-3 px-5">Email Address</th>
                    <th class="py-3 px-5">Status</th>
                    <th class="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-black/5 dark:divide-white/5">
                  @if (subscriberService.subscribers().length === 0) {
                    <tr>
                      <td colspan="3" class="p-10 text-center text-gray-400 font-medium text-xs">
                        No newsletter subscribers found yet.
                      </td>
                    </tr>
                  } @else {
                    @for (sub of subscriberService.subscribers(); track sub.id) {
                      <tr class="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                        <td class="py-3 px-5 font-bold text-xs sm:text-sm text-[#1d1d1f] dark:text-white flex items-center gap-2.5">
                          <div class="w-7 h-7 rounded-lg bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                            <mat-icon style="font-size: 15px; width: 15px; height: 15px;">email</mat-icon>
                          </div>
                          {{ sub.email }}
                        </td>
                        <td class="py-3 px-5">
                          <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold">Active</span>
                        </td>
                        <td class="py-3 px-5 text-right">
                          <button (click)="deleteSubscriber(sub.id)" class="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white inline-flex items-center justify-center transition-colors active:scale-95">
                            <mat-icon style="font-size: 15px; width: 15px; height: 15px;">delete</mat-icon>
                          </button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else if (activeTab() === 'ads') {
          <!-- ADS MANAGEMENT SECTION -->
          @if (isAdding()) {
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-sm border border-black/5 dark:border-white/10 mb-8">
              <h2 class="text-lg font-bold text-[#1d1d1f] dark:text-white mb-6">{{ editingAdId() ? 'Edit' : 'Create' }} Campaign</h2>
              <form (ngSubmit)="saveAd()" class="flex flex-col gap-4">
                <div>
                  <label for="adFormTitle" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Brand / Ad Title</label>
                  <input id="adFormTitle" type="text" [(ngModel)]="adFormTitle" name="title" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-[#007AFF] outline-none text-xs sm:text-sm font-medium text-gray-900 dark:text-white" placeholder="Brand Name or Offer Title">
                </div>
                <div>
                  <label for="adFormLink" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Target URL</label>
                  <input id="adFormLink" type="url" [(ngModel)]="adFormLink" name="link" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-[#007AFF] outline-none text-xs sm:text-sm font-medium text-gray-900 dark:text-white" placeholder="https://www.example.com">
                </div>
                <div>
                  <label for="adFormImageFile" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Banner Image</label>
                  <div class="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative">
                    @if (adFormImageUrl) {
                      <div class="relative w-full h-32 rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-white/5">
                        <img [src]="adFormImageUrl" alt="Ad Preview" class="w-full h-full object-contain">
                        <div class="absolute top-2 right-2 flex items-center gap-2 z-10">
                          <button type="button" (click)="adFormImageUrl = ''" class="w-7 h-7 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-white shadow-sm transition-all">
                            <mat-icon style="font-size: 15px; width: 15px; height: 15px;">close</mat-icon>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="py-3">
                        <mat-icon class="text-gray-400 mb-1" style="font-size: 32px; width: 32px; height: 32px;">add_photo_alternate</mat-icon>
                        <p class="text-xs font-bold text-gray-500">Upload banner image</p>
                      </div>
                    }
                    <input id="adFormImageFile" type="file" accept="image/*" (change)="onAdImageUpload($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" [required]="!adFormImageUrl">
                  </div>
                </div>
                <div>
                  <label for="adFormPlacement" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">Placement Slot</label>
                  <select id="adFormPlacement" [(ngModel)]="adFormPlacement" name="placement" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#2c2c2e] focus:ring-2 focus:ring-[#007AFF] outline-none text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    <option value="home-top">Home Page - Top Banner</option>
                    <option value="home-bottom">Home Page - Bottom</option>
                    <option value="article-inline">Inside Article (Inline)</option>
                    <option value="sidebar">Sidebar / Additional</option>
                  </select>
                </div>
                <div class="flex items-center gap-2 py-1">
                  <input type="checkbox" id="adIsActive" [(ngModel)]="adFormIsActive" name="isActive" class="w-4 h-4 rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF]">
                  <label for="adIsActive" class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer">Ad is Active</label>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 mt-3">
                  <button type="submit" class="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl font-bold tracking-wider uppercase text-xs transition-all shadow-md shadow-[#007AFF]/20 w-full sm:w-auto active:scale-95">
                    {{ editingAdId() ? 'Update' : 'Publish' }} Ad
                  </button>
                  <button type="button" (click)="cancelAdEdit()" class="px-6 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold tracking-wider uppercase text-xs hover:bg-gray-200 dark:hover:bg-white/20 transition-all w-full sm:w-auto active:scale-95">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          } @else {
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
              <div class="p-5 flex justify-between items-center border-b border-black/5 dark:border-white/10">
                <h3 class="text-base font-bold text-[#1d1d1f] dark:text-white">Active & Inactive Campaigns</h3>
              </div>
              <div class="divide-y divide-black/5 dark:divide-white/5">
                @for (ad of adService.ads(); track ad.id) {
                  <div class="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <div class="w-20 h-16 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                      <img [src]="ad.imageUrl" alt="Ad" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{{ ad.title }}</h4>
                        <span class="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{{ ad.placement }}</span>
                      </div>
                      <p class="text-xs text-gray-400 truncate max-w-sm">{{ ad.link }}</p>
                      <div class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                           [class.bg-emerald-500/10]="ad.isActive" [class.text-emerald-600]="ad.isActive"
                           [class.bg-gray-100]="!ad.isActive" [class.text-gray-500]="!ad.isActive">
                        {{ ad.isActive ? 'Active' : 'Inactive' }}
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5 self-end sm:self-center">
                      <button (click)="toggleAdStatus(ad)" class="px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
                        Toggle
                      </button>
                      <button (click)="editAd(ad)" class="w-8 h-8 flex items-center justify-center text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit</mat-icon>
                      </button>
                      <button (click)="deleteAd(ad.id)" class="w-8 h-8 flex items-center justify-center text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
                @if (adService.ads().length === 0) {
                  <div class="p-10 text-center text-gray-400 font-medium text-xs">
                    No ads created yet.
                  </div>
                }
              </div>
            </div>
          }
        } @else if (activeTab() === 'notify') {
          <!-- Notify Tab -->
          <div class="max-w-4xl mx-auto space-y-6">
            
            <!-- Browser Web Push Notifications Card -->
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-5 sm:p-7">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <mat-icon style="font-size: 22px; width: 22px; height: 22px;">podcasts</mat-icon>
                  </div>
                  <div>
                    <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white">Web Push Notifications</h2>
                    <p class="text-xs text-gray-500">Delivered to Chrome, Safari & Android browsers</p>
                  </div>
                </div>
                <div class="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 self-start sm:self-center">
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>{{ webPushSubscriberCount() }} Active Subscribers</span>
                </div>
              </div>

              <!-- Web Push Quick Test -->
              <div class="space-y-3">
                <div class="p-4 sm:p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label for="webPushTitle" class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Push Alert Title</label>
                      <input id="webPushTitle" [(ngModel)]="webPushTitle" name="webPushTitle" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="📰 MyFeed.lk Breaking News" />
                    </div>
                    <div class="space-y-1">
                      <label for="webPushBody" class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Message Body</label>
                      <input id="webPushBody" [(ngModel)]="webPushBody" name="webPushBody" class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="New story published on MyFeed.lk" />
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button type="button" (click)="sendTestWebPush()" [disabled]="isTestingWebPush()" class="flex-1 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#0062cc] transition-all shadow-md shadow-[#007AFF]/20 disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95">
                      @if (isTestingWebPush()) {
                        <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Dispatching...</span>
                      } @else {
                        <mat-icon style="font-size: 15px; width: 15px; height: 15px;">send</mat-icon>
                        <span>Send Test Push</span>
                      }
                    </button>

                    <button type="button" (click)="loadWebPushSubscribersCount()" class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95">
                      <mat-icon style="font-size: 15px; width: 15px; height: 15px;">refresh</mat-icon>
                      <span>Refresh</span>
                    </button>
                  </div>

                  @if (webPushTestSuccess()) {
                    <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                      <span>{{ webPushTestSuccess() }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Phone Push Alerts Card -->
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-5 sm:p-7">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 22px; width: 22px; height: 22px;">notifications_active</mat-icon>
                </div>
                <div>
                  <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white">Instant Phone Push Alerts</h2>
                  <p class="text-xs text-gray-500">Alerts via ntfy.sh instant mobile notifications</p>
                </div>
              </div>

              <!-- Topic Settings & Test Dispatch -->
              <div class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="space-y-1">
                    <label for="phoneTopic" class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Topic Name</label>
                    <input id="phoneTopic" [(ngModel)]="phoneTopic" name="phoneTopic" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-purple-600 text-xs font-mono font-bold text-gray-900 dark:text-white outline-none" placeholder="myfeedlk_news" />
                  </div>
                  <div class="space-y-1">
                    <label for="siteDomain" class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target URL</label>
                    <input id="siteDomain" [(ngModel)]="siteDomain" name="siteDomain" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-purple-600 text-xs font-mono font-bold text-gray-900 dark:text-white outline-none" placeholder="https://myfeedlk.com" />
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button type="button" (click)="sendTestPhoneAlert()" [disabled]="isTestingPhoneAlert() || !phoneTopic.trim()" class="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95">
                    @if (isTestingPhoneAlert()) {
                      <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Sending...</span>
                    } @else {
                      <mat-icon style="font-size: 15px; width: 15px; height: 15px;">notifications_active</mat-icon>
                      <span>Send Test Phone Alert</span>
                    }
                  </button>

                  <button type="button" (click)="savePhoneSettings()" [disabled]="isSavingPhoneSettings()" class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50 active:scale-95">
                    {{ isSavingPhoneSettings() ? 'Saving...' : 'Save Settings' }}
                  </button>
                </div>

                @if (phoneAlertSuccess()) {
                  <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                    <span>Test alert sent successfully!</span>
                  </div>
                }
              </div>
            </div>

            <!-- Email Subscribers Broadcast Card -->
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-5 sm:p-7">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-11 h-11 rounded-xl bg-blue-500/10 text-[#007AFF] flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 22px; width: 22px; height: 22px;">mail</mat-icon>
                </div>
                <div>
                  <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white">Email Subscribers Broadcast</h2>
                  <p class="text-xs text-gray-500">Notify all {{ subscriberService.subscribers().length }} subscribers</p>
                </div>
              </div>

              <form (ngSubmit)="sendBroadcast()" class="space-y-3">
                <div>
                  <label for="broadcastSubject" class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Subject</label>
                  <input id="broadcastSubject" [(ngModel)]="broadcastSubject" name="subject" required class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none" placeholder="News Update" />
                </div>

                <div>
                  <label for="broadcastMessage" class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">Message</label>
                  <textarea id="broadcastMessage" [(ngModel)]="broadcastMessage" name="message" required rows="5" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#007AFF] text-xs sm:text-sm font-medium leading-relaxed text-gray-900 dark:text-white outline-none" placeholder="Write your broadcast..."></textarea>
                </div>

                <button type="submit" [disabled]="isBroadcasting() || !broadcastSubject || !broadcastMessage" class="w-full py-3 rounded-xl bg-[#007AFF] text-white font-bold uppercase tracking-wider text-xs hover:bg-[#0062cc] transition-all shadow-md shadow-[#007AFF]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                  @if (isBroadcasting()) {
                    <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Broadcast...</span>
                  } @else {
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">send</mat-icon>
                    <span>Send Broadcast</span>
                  }
                </button>
              </form>

              @if (broadcastSuccess()) {
                <div class="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                  <span>Broadcast Sent successfully.</span>
                </div>
              }
            </div>
          </div>
        } @else if (activeTab() === 'whatsapp') {
          <!-- WhatsApp Channel Tab -->
          <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-5 sm:p-7">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 22px; width: 22px; height: 22px;">chat</mat-icon>
                </div>
                <div>
                  <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white">WhatsApp Channel Automation</h2>
                  <p class="text-xs text-gray-500">Auto-post stories to WhatsApp subscribers</p>
                </div>
              </div>

              <!-- Integration Settings -->
              <div class="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-6 space-y-3">
                <h3 class="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Webhook Settings</h3>
                <div class="flex flex-col sm:flex-row gap-2.5">
                  <input [(ngModel)]="waWebhookUrl" placeholder="https://hook.eu2.make.com/... or Evolution API" class="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-600 outline-none text-xs font-mono text-gray-900 dark:text-white" />
                  <button (click)="saveWaSettings()" [disabled]="isSavingWaSettings()" class="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all disabled:opacity-50 shrink-0 active:scale-95">
                    {{ isSavingWaSettings() ? 'Saving...' : 'Save Webhook' }}
                  </button>
                </div>
              </div>

              <!-- Direct Post Composer -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Compose Message</h3>
                  <button (click)="loadLatestArticleForWa()" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">autorenew</mat-icon> Load Latest Story
                  </button>
                </div>

                <textarea [(ngModel)]="waCustomMessage" rows="6" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-600 outline-none text-xs sm:text-sm font-sans leading-relaxed text-gray-900 dark:text-white" placeholder="*🚀 NEW ON MYFEED.LK*&#10;&#10;*Article Title Here*..."></textarea>

                <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button (click)="dispatchWhatsAppPost()" [disabled]="isDispatchingWa() || !waCustomMessage.trim()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95">
                    @if (isDispatchingWa()) {
                      <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Dispatching...</span>
                    } @else {
                      <mat-icon style="font-size: 15px; width: 15px; height: 15px;">send</mat-icon>
                      <span>Post to Channel</span>
                    }
                  </button>

                  <button (click)="openDirectWhatsAppShare()" [disabled]="!waCustomMessage.trim()" class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">share</mat-icon>
                    <span>Open in Web</span>
                  </button>
                </div>

                @if (waPostSuccess()) {
                  <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                    <span>{{ waSuccessMessage() }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'facebook') {
          <!-- Facebook Page Tab -->
          <div class="max-w-4xl mx-auto space-y-6">
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-5 sm:p-7">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 22px; width: 22px; height: 22px;">share</mat-icon>
                </div>
                <div>
                  <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white">Facebook Page Automation</h2>
                  <p class="text-xs text-gray-500">Auto-post stories and full cover photos directly to your Facebook Page</p>
                </div>
              </div>

              <!-- Integration Settings -->
              <div class="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-6 space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Facebook Webhook Settings (Make.com / Zapier / Relay)</h3>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">Facebook Dedicated</span>
                </div>
                <div class="flex flex-col sm:flex-row gap-2.5">
                  <input [(ngModel)]="fbWebhookUrl" placeholder="https://hook.eu1.make.com/... (Make.com Custom Webhook URL)" class="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-600 outline-none text-xs font-mono text-gray-900 dark:text-white" />
                  <div class="flex gap-2">
                    <button (click)="saveFbSettings()" [disabled]="isSavingFbSettings()" class="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 shrink-0 active:scale-95 flex items-center gap-1.5">
                      <mat-icon style="font-size: 15px; width: 15px; height: 15px;">save</mat-icon>
                      <span>{{ isSavingFbSettings() ? 'Saving...' : 'Save Webhook' }}</span>
                    </button>
                    <button (click)="sendTestFbWebhook()" [disabled]="isTestingFbWebhook() || !fbWebhookUrl.trim()" class="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-all disabled:opacity-50 shrink-0 active:scale-95 flex items-center gap-1.5">
                      @if (isTestingFbWebhook()) {
                        <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Sending...</span>
                      } @else {
                        <mat-icon style="font-size: 15px; width: 15px; height: 15px;">send_and_archive</mat-icon>
                        <span>Send Test Data</span>
                      }
                    </button>
                  </div>
                </div>
                <div class="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                  <p class="font-bold text-blue-700 dark:text-blue-400">📌 Make.com Error එක ("Exceeded maximum wait time") විසඳා ගන්නා අයුරු:</p>
                  <p>1. Make.com හි <strong>Custom Webhook</strong> මොඩියුලය උඩ Click කර ලැබෙන Webhook URL එක Copy කර ඉහත කොටුවේ Paste කර <strong>Save Webhook</strong> ඔබන්න.</p>
                  <p>2. Make.com හි වම්පස පහළ ඇති <strong>Run once (Play button)</strong> ඔබන්න. එවිට එය <em>"Waiting for data..."</em> ලෙස දිස්වේ.</p>
                  <p>3. වහාම මෙහි ඇති <strong>Send Test Data</strong> කහ පාට බොත්තම ඔබන්න. Make.com වෙත Data ගොස් structure එක සාර්ථකව හඳුනාගනී.</p>
                  <p>4. දෙවන මොඩියුලය ලෙස <strong>Facebook Pages ➡️ Create a Post with Photos</strong> තෝරා URL සඳහා <code>imageUrl</code> ද, Caption සඳහා <code>caption</code> ද තෝරන්න.</p>
                  <p>5. අවසානයේ Make.com හි පහළ ඇති <strong>Immediately as data arrives (ON)</strong> switch එක ON කරන්න.</p>
                </div>
              </div>

              <!-- Direct Post Composer -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h3 class="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">Compose Facebook Post</h3>
                  <button (click)="loadLatestArticleForFb()" class="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">autorenew</mat-icon> Load Latest Story
                  </button>
                </div>

                @if (fbSelectedImageUrl) {
                  <div class="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <img [src]="fbSelectedImageUrl" alt="Cover Image" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                    <div class="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                      <mat-icon style="font-size: 12px; width: 12px; height: 12px;">photo</mat-icon>
                      <span>Original Cover Photo Attached</span>
                    </div>
                  </div>
                }

                <textarea [(ngModel)]="fbCustomMessage" rows="6" class="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-600 outline-none text-xs sm:text-sm font-sans leading-relaxed text-gray-900 dark:text-white" placeholder="📰 Article Title Here...&#10;&#10;Summary details...&#10;&#10;🔗 Read more: https://myfeedlk.com/...&#10;&#10;#MyFeedLK #TechNews #SriLanka"></textarea>

                <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button (click)="dispatchFacebookPost()" [disabled]="isDispatchingFb() || !fbCustomMessage.trim()" class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95">
                    @if (isDispatchingFb()) {
                      <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Posting to Facebook...</span>
                    } @else {
                      <mat-icon style="font-size: 15px; width: 15px; height: 15px;">send</mat-icon>
                      <span>Post to Facebook Page</span>
                    }
                  </button>

                  <button (click)="openDirectFacebookShare()" [disabled]="!fbCustomMessage.trim()" class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">open_in_new</mat-icon>
                    <span>Open in Facebook</span>
                  </button>
                </div>

                @if (fbPostSuccess()) {
                  <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold animate-fade-in">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                    <span>{{ fbSuccessMessage() }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'users') {
          <!-- Users Management Tab -->
          <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden mb-8">
            <div class="p-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
              <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <span>User Management</span>
                <span class="px-2 py-0.5 bg-[#007AFF]/10 text-[#007AFF] rounded-full text-[11px] font-bold">Total: {{ usersList().length }}</span>
              </h2>
            </div>

            @if (loadingUsers()) {
              <div class="py-12 flex justify-center">
                <div class="w-8 h-8 rounded-full border-3 border-[#007AFF]/30 border-t-[#007AFF] animate-spin"></div>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr class="bg-gray-50/50 dark:bg-white/5 border-b border-black/5 dark:border-white/10 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <th class="py-3 px-5">User</th>
                      <th class="py-3 px-5">Birthday</th>
                      <th class="py-3 px-5">Last Seen</th>
                      <th class="py-3 px-5">Role</th>
                      <th class="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-black/5 dark:divide-white/5">
                    @for (user of usersList(); track user.uid) {
                      <tr class="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                        <td class="py-3 px-5">
                          <div class="flex items-center gap-3">
                            <div class="relative w-9 h-9 shrink-0">
                              <div class="w-full h-full rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-xs overflow-hidden">
                                @if (user.photoURL) {
                                  <img [src]="user.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                                } @else {
                                  {{ (user.displayName || user.email || 'U').substring(0,2).toUpperCase() }}
                                }
                              </div>
                            </div>
                            <div class="min-w-0">
                              <p class="text-xs sm:text-sm font-bold text-[#1d1d1f] dark:text-white flex items-center gap-1.5 truncate">
                                {{ user.displayName || 'Unnamed User' }}
                                @if (user.banned) {
                                  <span class="px-1.5 py-0.2 bg-rose-500/10 text-rose-600 rounded text-[9px] uppercase tracking-wider font-bold">Banned</span>
                                }
                              </p>
                              <p class="text-[11px] text-gray-400 truncate">{{ user.email }}</p>
                            </div>
                          </div>
                        </td>
                        <td class="py-3 px-5">
                          <span class="text-xs text-gray-600 dark:text-gray-300 font-mono">{{ user.birthday || 'N/A' }}</span>
                        </td>
                        <td class="py-3 px-5">
                          <span class="text-xs text-gray-500">{{ formatDate(user.lastSeen) }}</span>
                        </td>
                        <td class="py-3 px-5">
                          <span class="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" 
                                [class.bg-blue-500/10]="user.role === 'admin'"
                                [class.text-blue-600]="user.role === 'admin'"
                                [class.bg-gray-100]="user.role !== 'admin'"
                                [class.text-gray-600]="user.role !== 'admin'">
                            {{ user.role }}
                          </span>
                        </td>
                        <td class="py-3 px-5 text-right">
                          <button 
                            (click)="toggleBanStatus(user)"
                            class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 active:scale-95"
                            [class.bg-rose-500/10]="!user.banned"
                            [class.text-rose-600]="!user.banned"
                            [class.bg-emerald-500/10]="user.banned"
                            [class.text-emerald-600]="user.banned"
                            [disabled]="user.role === 'admin'">
                            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">
                              {{ user.banned ? 'check_circle' : 'block' }}
                            </mat-icon>
                            {{ user.banned ? 'Unban' : 'Ban' }}
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="py-10 text-center text-gray-400 text-xs">
                          No users found.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        } @else if (activeTab() === 'deploy') {
          <!-- Deploy Tab -->
          <div class="max-w-2xl mx-auto">
            <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 p-6 sm:p-8">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 22px; width: 22px; height: 22px;">rocket_launch</mat-icon>
                </div>
                <div>
                  <h2 class="text-base font-bold text-[#1d1d1f] dark:text-white">Deployment Hook</h2>
                  <p class="text-xs text-gray-500">Trigger production build & sync</p>
                </div>
              </div>

              <!-- Settings -->
              <div class="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2">
                <label for="netlifyHookUrl" class="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Build Hook URL</label>
                <div class="flex gap-2">
                  <input id="netlifyHookUrl" [(ngModel)]="netlifyHookUrl" name="netlifyHookUrl" class="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-xs font-mono text-gray-900 dark:text-white" placeholder="https://api.netlify.com/build_hooks/..." />
                  <button (click)="saveDeploySettings()" [disabled]="isSavingSettings()" class="px-4 py-2 rounded-xl bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 active:scale-95">
                    {{ isSavingSettings() ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </div>

              <div class="text-center">
                <button (click)="triggerNetlifyBuild()" [disabled]="isDeploying() || !netlifyHookUrl" class="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                  @if (isDeploying()) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deploying...
                  } @else {
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">cloud_upload</mat-icon>
                    Trigger Production Build
                  }
                </button>

                @if (deploySuccess()) {
                  <div class="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-fade-in">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">done_all</mat-icon>
                    <span>Build Triggered Successfully</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'analytics') {
          <!-- Analytics Tab -->
          <div class="max-w-6xl mx-auto space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Top Viewed Articles -->
              <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
                <div class="p-5 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                  <div class="w-9 h-9 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">trending_up</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white">Top Viewed Articles</h3>
                    <p class="text-xs text-gray-400">Most read stories</p>
                  </div>
                </div>
                <div class="divide-y divide-black/5 dark:divide-white/5">
                  @for (art of topViewedArticles(); track art.id; let i = $index) {
                    <div class="p-4 flex items-center gap-3.5 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                      <div class="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">{{ i + 1 }}</div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-xs sm:text-sm text-[#1d1d1f] dark:text-white truncate">{{ art.title }}</h4>
                        <div class="text-[11px] text-gray-400 mt-0.5">{{ art.date }}</div>
                      </div>
                      <div class="shrink-0 text-right">
                        <div class="font-bold text-[#007AFF] text-xs flex items-center gap-1 justify-end">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility</mat-icon>
                          {{ art.views || 0 }}
                        </div>
                      </div>
                    </div>
                  }
                  @if (topViewedArticles().length === 0) {
                    <div class="p-6 text-center text-gray-400 text-xs">No data available yet.</div>
                  }
                </div>
              </div>

              <!-- Top Reacted Articles -->
              <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
                <div class="p-5 flex items-center gap-3 border-b border-black/5 dark:border-white/10">
                  <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">local_fire_department</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white">Most Engaging Stories</h3>
                    <p class="text-xs text-gray-400">Based on reader reactions</p>
                  </div>
                </div>
                <div class="divide-y divide-black/5 dark:divide-white/5">
                  @for (art of topReactedArticles(); track art.id; let i = $index) {
                    <div class="p-4 flex items-center gap-3.5 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                      <div class="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">{{ i + 1 }}</div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-xs sm:text-sm text-[#1d1d1f] dark:text-white truncate">{{ art.title }}</h4>
                        <div class="flex flex-wrap gap-1.5 mt-1">
                          @if (art.reactions?.['like']) { <span class="text-[10px] font-medium text-blue-600 bg-blue-500/10 px-1.5 py-0.2 rounded flex items-center gap-1"><mat-icon style="font-size: 10px; width: 10px; height: 10px;">thumb_up</mat-icon> {{ art.reactions?.['like'] }}</span> }
                          @if (art.reactions?.['love']) { <span class="text-[10px] font-medium text-rose-600 bg-rose-500/10 px-1.5 py-0.2 rounded flex items-center gap-1"><mat-icon style="font-size: 10px; width: 10px; height: 10px;">favorite</mat-icon> {{ art.reactions?.['love'] }}</span> }
                          @if (art.reactions?.['fire']) { <span class="text-[10px] font-medium text-orange-600 bg-orange-500/10 px-1.5 py-0.2 rounded flex items-center gap-1"><mat-icon style="font-size: 10px; width: 10px; height: 10px;">local_fire_department</mat-icon> {{ art.reactions?.['fire'] }}</span> }
                        </div>
                      </div>
                      <div class="shrink-0 text-right">
                        <div class="font-bold text-orange-600 text-sm">
                          {{ art._totalReactions || 0 }}
                        </div>
                        <div class="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Total</div>
                      </div>
                    </div>
                  }
                  @if (topReactedArticles().length === 0) {
                    <div class="p-6 text-center text-gray-400 text-xs">No reactions yet.</div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'audio') {
          <!-- Audio Briefs Tab (24-Hour 15-Minute Morning Commute Explainer) -->
          <div class="max-w-6xl mx-auto space-y-8">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
              <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div class="relative z-10 max-w-2xl">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">commute</mat-icon>
                  Morning Commute Audio Studio (15-Min Daily)
                </div>
                <h2 class="text-2xl sm:text-3xl font-black tracking-tight mb-2">පසුගිය පැය 24 පුවත් විනාඩි 15න්</h2>
                <p class="text-white/80 text-xs sm:text-sm leading-relaxed">
                  සෑම උදෑසනකම රැකියාවට හෝ ගමන් බිමන් යන ශ්‍රී ලාංකිකයන් වෙනුවෙන් (4:00 AM – 4:00 AM) කාලයේ වෙබ් අඩවියේ පළවූ සියලුම ප්‍රධාන තාක්ෂණික පුවත් එක්තැන් කළ විනාඩි 15ක ශ්‍රව්‍ය සංග්‍රහය මෙතැනින් කළමනාකරණය කරන්න.
                </p>
              </div>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Morning Editions</span>
                  <mat-icon class="text-blue-500" style="font-size: 20px; width: 20px; height: 20px;">library_music</mat-icon>
                </div>
                <div class="text-3xl font-black text-[#1d1d1f] dark:text-white">{{ audioService.editions().length }}</div>
                <p class="text-[11px] text-gray-400 mt-1">Total recorded daily wraps</p>
              </div>

              <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Commute Listens</span>
                  <mat-icon class="text-emerald-500" style="font-size: 20px; width: 20px; height: 20px;">headphones</mat-icon>
                </div>
                <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {{ totalAudioListens() }}
                </div>
                <p class="text-[11px] text-gray-400 mt-1">Plays across car mode & web</p>
              </div>

              <div class="bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Today</span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <div class="text-sm font-bold text-[#1d1d1f] dark:text-white truncate">
                  {{ audioService.latestEdition()?.title || 'No active brief' }}
                </div>
                <p class="text-[11px] text-blue-500 font-semibold mt-1">
                  {{ audioService.latestEdition()?.timeWindowText || '4:00 AM - 4:00 AM' }}
                </p>
              </div>
            </div>

            <!-- Toast Notification for Audio Pipeline -->
            @if (audioPipelineToast()) {
              <div class="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center justify-between gap-3 animate-fade-in">
                <div class="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
                  <mat-icon style="font-size: 20px; width: 20px; height: 20px;">info</mat-icon>
                  <span>{{ audioPipelineToast() }}</span>
                </div>
                <button (click)="audioPipelineToast.set(null)" class="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
                </button>
              </div>
            }

            <!-- 🤖 AUTOMATED AI AUDIO PIPELINE CONTROL CENTER (3:30 AM -> 4:00 AM) -->
            <div class="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-indigo-500/20 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/5 space-y-6">
              <!-- Top Banner & Colombo Clock -->
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                    <mat-icon style="font-size: 26px; width: 26px; height: 26px;">podcasts</mat-icon>
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <h3 class="text-xl font-black text-[#1d1d1f] dark:text-white">Automated AI Audio Pipeline</h3>
                      <span class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                        3:30 AM → 4:00 AM Daily
                      </span>
                      @if (audioPipelineStatus()?.enabled) {
                        <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Active Scheduled
                        </span>
                      } @else {
                        <span class="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                          Paused
                        </span>
                      }
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">
                      Asia/Colombo Timezone Automated 24-Hour (4 AM - 4 AM) News Audio Synthesis & Push Broadcast
                    </p>
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                  <button 
                    type="button" 
                    (click)="triggerAudioDraftGenerationNow()" 
                    [disabled]="isGeneratingAudioDraft() || audioPipelineStatus()?.isGenerating"
                    class="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50">
                    @if (isGeneratingAudioDraft() || audioPipelineStatus()?.isGenerating) {
                      <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Synthesizing (3:30 AM)...</span>
                    } @else {
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">bolt</mat-icon>
                      <span>⚡ Generate Draft (3:30 AM)</span>
                    }
                  </button>

                  <button 
                    type="button" 
                    (click)="triggerAudioPublishNow()" 
                    [disabled]="isPublishingAudioEdition() || audioPipelineStatus()?.isPublishing"
                    class="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50">
                    @if (isPublishingAudioEdition() || audioPipelineStatus()?.isPublishing) {
                      <div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Publishing (4:00 AM)...</span>
                    } @else {
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">rocket_launch</mat-icon>
                      <span>🚀 Publish Live (4:00 AM)</span>
                    }
                  </button>

                  <button 
                    type="button" 
                    (click)="loadAudioPipelineStatus()" 
                    [disabled]="loadingAudioPipeline()"
                    class="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 transition-all cursor-pointer">
                    <mat-icon [class.animate-spin]="loadingAudioPipeline()" style="font-size: 18px; width: 18px; height: 18px;">refresh</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Two-Step Pipeline Schedule Card -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Step 1: 3:30 AM Generation -->
                <div class="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 relative overflow-hidden">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-indigo-600/30">
                        1
                      </div>
                      <div>
                        <div class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                          Step 1: Daily Synthesis
                        </div>
                        <div class="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>03:30 AM</span>
                          <span class="text-xs text-gray-500 font-normal">(Sri Lanka Time)</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-[10px] uppercase font-bold text-gray-400">Next Gen In</div>
                      <div class="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {{ audioPipelineNextGenCountdown() }}
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    පසුගිය පැය 24 (4:00 AM – 4:00 AM) පළවූ සියලුම පුවත් ස්වයංක්‍රීයව එක්තැන් කර, Gemini AI මගින් විනාඩි 15ක Sinhala Voice Briefing පිටපත සහ Timestamped Chapters සාදයි.
                  </p>
                </div>

                <!-- Step 2: 4:00 AM Publish -->
                <div class="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 relative overflow-hidden">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-md shadow-emerald-600/30">
                        2
                      </div>
                      <div>
                        <div class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Step 2: Commute Broadcast
                        </div>
                        <div class="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>04:00 AM</span>
                          <span class="text-xs text-gray-500 font-normal">(Sri Lanka Time)</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-[10px] uppercase font-bold text-gray-400">Next Publish In</div>
                      <div class="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {{ audioPipelineNextPubCountdown() }}
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    සකස් කළ ශ්‍රව්‍ය සංග්‍රහය වෙබ් අඩවියේ Featured Morning Edition ලෙස Live කර, සියලුම Subscriber ලා වෙත Instant Web Push සහ Phone Notification යවයි.
                  </p>
                </div>
              </div>

              <!-- Ready Draft Preview (If Available) -->
              @if (audioPipelineStatus()?.draftSummary; as draft) {
                <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5 dark:border-white/10">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                        Latest Generated Draft
                      </span>
                      <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ draft.title }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button 
                        (click)="generateAiVoiceOver(draft.fullNarrationScriptSinhala || draft.summarySinhala)"
                        [disabled]="isSynthesizingVoice()"
                        class="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">mic</mat-icon>
                        <span>{{ isSynthesizingVoice() ? 'Generating Voice...' : '🎙️ Synthesize AI Voice' }}</span>
                      </button>
                      <button 
                        (click)="applyDraftToForm(draft)" 
                        class="px-3 py-1 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">edit_note</mat-icon>
                        <span>Load in Form Below</span>
                      </button>
                      <button 
                        (click)="triggerAudioPublishNow()" 
                        [disabled]="isPublishingAudioEdition()"
                        class="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;">publish</mat-icon>
                        <span>Publish This Draft Now</span>
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span class="text-gray-400 text-[10px] uppercase font-bold block">Duration</span>
                      <span class="font-bold text-gray-800 dark:text-gray-200">{{ draft.durationFormatted }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400 text-[10px] uppercase font-bold block">Chapters</span>
                      <span class="font-bold text-gray-800 dark:text-gray-200">{{ draft.chaptersCount }} markers</span>
                    </div>
                    <div>
                      <span class="text-gray-400 text-[10px] uppercase font-bold block">Narrator</span>
                      <span class="font-bold text-gray-800 dark:text-gray-200 truncate block">{{ draft.narratorName }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400 text-[10px] uppercase font-bold block">Audio Source</span>
                      <a [href]="draft.audioUrl" target="_blank" class="text-blue-600 hover:underline font-mono truncate block">Preview Link ↗</a>
                    </div>
                  </div>
                </div>
              }

              <!-- Pipeline Settings & Toggles -->
              <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-4">
                <div class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Pipeline Automation Preferences</span>
                  <span class="text-[11px] text-gray-400 font-normal">Auto-saved to Cloud Configuration</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <!-- Toggle 1: Enabled -->
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 cursor-pointer hover:border-indigo-500/50 transition-all">
                    <input 
                      type="checkbox" 
                      [checked]="audioPipelineStatus()?.enabled" 
                      (change)="saveAudioPipelineConfig({ enabled: $any($event.target).checked })"
                      class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
                    <div class="text-xs">
                      <span class="font-bold block text-gray-900 dark:text-white">Pipeline Active</span>
                      <span class="text-[10px] text-gray-500">Run automatically</span>
                    </div>
                  </label>

                  <!-- Toggle 2: Auto-Publish -->
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 cursor-pointer hover:border-emerald-500/50 transition-all">
                    <input 
                      type="checkbox" 
                      [checked]="audioPipelineStatus()?.autoPublish" 
                      (change)="saveAudioPipelineConfig({ autoPublish: $any($event.target).checked })"
                      class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500">
                    <div class="text-xs">
                      <span class="font-bold block text-gray-900 dark:text-white">Auto-Publish at 4 AM</span>
                      <span class="text-[10px] text-gray-500">Publish without manual click</span>
                    </div>
                  </label>

                  <!-- Toggle 3: Web Push -->
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 cursor-pointer hover:border-blue-500/50 transition-all">
                    <input 
                      type="checkbox" 
                      [checked]="audioPipelineStatus()?.autoWebPush" 
                      (change)="saveAudioPipelineConfig({ autoWebPush: $any($event.target).checked })"
                      class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                    <div class="text-xs">
                      <span class="font-bold block text-gray-900 dark:text-white">Web Push on Publish</span>
                      <span class="text-[10px] text-gray-500">Browser push to listeners</span>
                    </div>
                  </label>

                  <!-- Toggle 4: Phone Alert -->
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 cursor-pointer hover:border-purple-500/50 transition-all">
                    <input 
                      type="checkbox" 
                      [checked]="audioPipelineStatus()?.autoPhonePush" 
                      (change)="saveAudioPipelineConfig({ autoPhonePush: $any($event.target).checked })"
                      class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500">
                    <div class="text-xs">
                      <span class="font-bold block text-gray-900 dark:text-white">Phone Alerts (ntfy)</span>
                      <span class="text-[10px] text-gray-500">Direct mobile broadcast</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Pipeline Execution History & Audit Logs -->
              <div class="space-y-3 pt-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-indigo-600" style="font-size: 18px; width: 18px; height: 18px;">history</mat-icon>
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Audio Pipeline Execution Logs</span>
                  </div>
                  <span class="text-[11px] text-gray-400 font-mono">{{ (audioPipelineStatus()?.logs || []).length }} events recorded</span>
                </div>

                @if (!audioPipelineStatus()?.logs || audioPipelineStatus()?.logs?.length === 0) {
                  <div class="p-6 text-center text-gray-400 text-xs rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                    No execution events recorded yet. Click "⚡ Generate Draft (3:30 AM)" to run an immediate test.
                  </div>
                } @else {
                  <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                    @for (log of audioPipelineStatus()?.logs; track log.timestamp) {
                      <div class="p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                           [class.bg-emerald-50]="log.status === 'success'"
                           [class.border-emerald-200]="log.status === 'success'"
                           [class.dark:bg-emerald-950/20]="log.status === 'success'"
                           [class.dark:border-emerald-800/40]="log.status === 'success'"
                           [class.bg-red-50]="log.status === 'error'"
                           [class.border-red-200]="log.status === 'error'"
                           [class.dark:bg-red-950/20]="log.status === 'error'"
                           [class.dark:border-red-800/40]="log.status === 'error'">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="log.status === 'success'" [class.bg-red-500]="log.status === 'error'"></span>
                          <span class="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">{{ log.step }}</span>
                          <span class="text-gray-700 dark:text-gray-300">{{ log.message }}</span>
                        </div>
                        <span class="text-[11px] text-gray-500 font-mono shrink-0">{{ log.timestamp }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Create / Edit Form -->
            <div class="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-black/5 dark:border-white/10 mb-6 gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <mat-icon style="font-size: 22px; width: 22px; height: 22px;">mic</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-lg font-black text-[#1d1d1f] dark:text-white">නව Morning Edition එකක් එක් කරන්න</h3>
                    <p class="text-xs text-gray-500">Publish 24-Hour 15-Minute Audio Brief</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  (click)="autoPopulateChaptersFromArticles()" 
                  class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">auto_fix_high</mat-icon>
                  <span>Auto-Fill Chapters From Latest News</span>
                </button>
              </div>

              <form (ngSubmit)="saveMorningEdition()" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label for="adminAudioTitleInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Edition Title / නම</label>
                    <input 
                      id="adminAudioTitleInput"
                      type="text" 
                      [(ngModel)]="audioEditionTitle" 
                      name="audioEditionTitle" 
                      required 
                      placeholder="MyFeed Morning Tech Wrap" 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label for="adminAudioTimeWindowInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Time Window / ආවරණය වන කාලය</label>
                    <input 
                      id="adminAudioTimeWindowInput"
                      type="text" 
                      [(ngModel)]="audioTimeWindowText" 
                      name="audioTimeWindowText" 
                      required 
                      placeholder="2026/08/26 4:00 AM – 2026/08/27 4:00 AM" 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <!-- AI Voice Over Generation Studio -->
                <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-blue-50/80 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-blue-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-4">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">graphic_eq</mat-icon>
                      </div>
                      <div>
                        <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">🎙️ Gemini AI Voice Over Studio (Sinhala / English)</h4>
                        <p class="text-[11px] text-gray-500">Generate studio-quality spoken audio from your script using Gemini 2.5 Speech</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- Voice Selector -->
                      <select 
                        [(ngModel)]="selectedTtsVoice" 
                        name="selectedTtsVoice"
                        class="px-3 py-1.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-gray-800 dark:text-gray-200 outline-none cursor-pointer">
                        <option value="Puck">👦 Puck (Energetic Male)</option>
                        <option value="Kore">👩 Kore (Warm Studio Female)</option>
                        <option value="Fenrir">🎙️ Fenrir (Deep Resonance)</option>
                        <option value="Charon">📻 Charon (Classic Radio)</option>
                        <option value="Aoede">🌸 Aoede (Smooth Narrative)</option>
                      </select>

                      <button 
                        type="button" 
                        (click)="generateAiVoiceOver()" 
                        [disabled]="isSynthesizingVoice()"
                        class="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                        @if (isSynthesizingVoice()) {
                          <mat-icon class="animate-spin" style="font-size: 14px; width: 14px; height: 14px;">sync</mat-icon>
                          <span>Synthesizing Voice...</span>
                        } @else {
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">auto_awesome</mat-icon>
                          <span>Generate Voice Over</span>
                        }
                      </button>
                    </div>
                  </div>

                  @if (ttsPreviewAudioUrl()) {
                    <div class="p-3 rounded-xl bg-white/90 dark:bg-black/40 border border-indigo-200 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400">✨ Generated Voice Ready for Commute Player</span>
                      </div>
                      <audio controls [src]="ttsPreviewAudioUrl()" class="h-8 max-w-xs"></audio>
                    </div>
                  }
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div class="sm:col-span-2">
                    <label for="adminAudioUrlInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Audio MP3 Direct URL / Stream Link</label>
                    <input 
                      id="adminAudioUrlInput"
                      type="url" 
                      [(ngModel)]="audioUrlInput" 
                      name="audioUrlInput" 
                      required 
                      placeholder="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label for="adminAudioDurationInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (e.g. 15:15)</label>
                    <input 
                      id="adminAudioDurationInput"
                      type="text" 
                      [(ngModel)]="audioDurationFormatted" 
                      name="audioDurationFormatted" 
                      required 
                      placeholder="15:15" 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label for="adminAudioNarratorInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Narrator / Host Name</label>
                    <input 
                      id="adminAudioNarratorInput"
                      type="text" 
                      [(ngModel)]="audioNarrator" 
                      name="audioNarrator" 
                      required 
                      placeholder="Kaveen Sandeepa & MyFeed Audio Studio" 
                      class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <span class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Set as Featured / Default Daily</span>
                    <div class="flex items-center gap-3 pt-2">
                      <label for="adminAudioIsFeaturedInput" class="relative inline-flex items-center cursor-pointer">
                        <input id="adminAudioIsFeaturedInput" type="checkbox" [(ngModel)]="audioIsFeatured" name="audioIsFeatured" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Set as today's active commute brief</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label for="adminAudioSummaryInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Brief Summary (Sinhala)</label>
                  <textarea 
                    id="adminAudioSummaryInput"
                    rows="2" 
                    [(ngModel)]="audioSummarySinhala" 
                    name="audioSummarySinhala" 
                    placeholder="පසුගිය පැය 24 තුළ වාර්තා වූ ප්‍රධාන පුවත් පිළිබඳ සංක්ෂිප්ත සටහන..."
                    class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <div>
                  <label for="adminAudioFullScriptInput" class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Voice Over Script (Sinhala)</label>
                  <textarea 
                    id="adminAudioFullScriptInput"
                    rows="8" 
                    [(ngModel)]="audioFullScriptSinhala" 
                    name="audioFullScriptSinhala" 
                    placeholder="Complete broadcast script to be synthesized into audio..."
                    class="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <!-- Chapters Section -->
                <div class="p-5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-blue-500" style="font-size: 18px; width: 18px; height: 18px;">format_list_numbered</mat-icon>
                      <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Audio Chapters & News Timestamps ({{ audioChapters.length }})</span>
                    </div>
                    <button type="button" (click)="addChapterRow()" class="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-all">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">add</mat-icon>
                      <span>Add Chapter</span>
                    </button>
                  </div>

                  <div class="space-y-3">
                    @for (chap of audioChapters; track $index; let i = $index) {
                      <div class="flex flex-col sm:flex-row items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/10 shadow-xs">
                        <div class="w-24 shrink-0">
                          <input 
                            type="number" 
                            [(ngModel)]="chap.time" 
                            [name]="'chap_time_' + i" 
                            placeholder="Secs" 
                            class="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-mono text-center font-bold" />
                        </div>
                        <div class="flex-1 min-w-0 w-full">
                          <input 
                            type="text" 
                            [(ngModel)]="chap.title" 
                            [name]="'chap_title_' + i" 
                            placeholder="Chapter title in Sinhala or English" 
                            class="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold" />
                        </div>
                        <button type="button" (click)="removeChapterRow(i)" class="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete_outline</mat-icon>
                        </button>
                      </div>
                    }
                  </div>
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button 
                    type="submit" 
                    [disabled]="isSavingAudioEdition() || !audioEditionTitle || !audioUrlInput" 
                    class="px-8 py-3.5 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-[#007AFF]/20 flex items-center gap-2 cursor-pointer active:scale-[0.98]">
                    @if (isSavingAudioEdition()) {
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Publishing Edition...</span>
                    } @else {
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">publish</mat-icon>
                      <span>Publish Morning Audio Edition</span>
                    }
                  </button>
                </div>
              </form>
            </div>

            <!-- Existing Editions List -->
            <div class="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-sm">
              <div class="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10 mb-6">
                <h3 class="text-base font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <mat-icon class="text-blue-500" style="font-size: 20px; width: 20px; height: 20px;">queue_music</mat-icon>
                  <span>Published Morning Editions ({{ audioService.editions().length }})</span>
                </h3>
              </div>

              <div class="space-y-4">
                @for (ed of audioService.editions(); track ed.id) {
                  <div class="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-start gap-4 flex-1 min-w-0">
                      <button (click)="audioService.playEdition(ed)" class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 hover:scale-105 transition-transform shrink-0 cursor-pointer">
                        <mat-icon style="font-size: 24px; width: 24px; height: 24px;">
                          {{ audioService.currentEdition()?.id === ed.id && audioService.isPlaying() ? 'pause' : 'play_arrow' }}
                        </mat-icon>
                      </button>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                          <span class="font-bold text-sm sm:text-base text-[#1d1d1f] dark:text-white">{{ ed.title }}</span>
                          <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">{{ ed.durationFormatted }}</span>
                          @if (ed.isFeatured) {
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Active Today</span>
                          }
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">{{ ed.summary }}</p>
                        <div class="flex items-center gap-3 text-[11px] text-gray-400">
                          <span class="flex items-center gap-1"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">calendar_today</mat-icon> {{ ed.timeWindowText }}</span>
                          <span class="flex items-center gap-1"><mat-icon style="font-size: 14px; width: 14px; height: 14px;">headphones</mat-icon> {{ ed.listenCount }} listens</span>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <button (click)="audioService.playEdition(ed)" class="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">play_circle</mat-icon>
                        <span>Listen</span>
                      </button>
                      <button (click)="deleteAudioEdition(ed.id)" class="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
                @if (audioService.editions().length === 0) {
                  <div class="p-8 text-center text-gray-400 text-sm">
                    No morning editions published yet. Fill in the form above to publish your first daily brief.
                  </div>
                }
              </div>
            </div>
          </div>
        }
      }

      <!-- SINGLE ARTICLE DELETE CONFIRMATION MODAL -->
      @if (articlePendingDelete(); as art) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 animate-scale-in">
            <!-- Modal Header -->
            <div class="flex items-center gap-3 mb-5">
              <div class="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <mat-icon style="font-size: 26px; width: 26px; height: 26px;">delete_forever</mat-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#1d1d1f]">පුවත Delete කිරීම තහවුරු කරන්න</h3>
                <p class="text-xs text-gray-500">Confirm News Article Deletion</p>
              </div>
            </div>

            <!-- Warning Alert -->
            <div class="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-xs sm:text-sm font-medium mb-5 leading-relaxed">
              <strong>අවවාදයයි:</strong> මෙම පුවත සම්පූර්ණයෙන්ම Firestore database එකෙන් සහ වෙබ් අඩවියෙන් ඉවත් කෙරේ. මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.
            </div>

            <!-- Article Details Preview Box -->
            <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6 flex items-start gap-3.5">
              @if (art.imageUrl) {
                <img [src]="art.imageUrl" [alt]="art.title" referrerpolicy="no-referrer" class="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-200 border border-black/5" />
              }
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">{{ art.category }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ art.date }}</span>
                </div>
                <h4 class="font-bold text-xs sm:text-sm text-[#1d1d1f] line-clamp-2 leading-snug">{{ art.title }}</h4>
                <p class="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{{ art.summary }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                (click)="cancelDelete()" 
                [disabled]="isDeleting()"
                class="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
                Cancel (අවලංගු කරන්න)
              </button>
              <button 
                type="button" 
                (click)="confirmDeleteSingle()" 
                [disabled]="isDeleting()"
                class="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                @if (isDeleting()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                } @else {
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
                  <span>Delete Permanently</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- BULK ARTICLES DELETE CONFIRMATION MODAL -->
      @if (showBulkDeleteConfirm()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-black/10 animate-scale-in">
            <!-- Modal Header -->
            <div class="flex items-center gap-3 mb-5">
              <div class="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <mat-icon style="font-size: 26px; width: 26px; height: 26px;">delete_sweep</mat-icon>
              </div>
              <div>
                <h3 class="text-lg font-black text-[#1d1d1f]">තෝරාගත් ලිපි {{ selectedArticleIds().length }} ම Delete කිරීම</h3>
                <p class="text-xs text-gray-500">Batch Delete {{ selectedArticleIds().length }} Articles</p>
              </div>
            </div>

            <!-- Warning Alert -->
            <div class="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 text-xs sm:text-sm font-medium mb-4 leading-relaxed">
              <strong>අවවාදයයි:</strong> ඔබ තෝරාගත් පුවත් ලිපි <strong>{{ selectedArticleIds().length }}</strong> ම ස්ථිරවම ඉවත් කරනු ඇත.
            </div>

            <!-- Selected Items List Preview -->
            <div class="max-h-48 overflow-y-auto p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-6 space-y-2">
              @for (artId of selectedArticleIds(); track artId) {
                @if (getArticleById(artId); as item) {
                  <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-gray-100 text-xs">
                    <span class="font-bold text-[#1d1d1f] line-clamp-1 flex-1">{{ item.title }}</span>
                    <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold shrink-0">{{ item.category }}</span>
                  </div>
                }
              }
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
              <button 
                type="button" 
                (click)="cancelDelete()" 
                [disabled]="isDeleting()"
                class="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
                Cancel
              </button>
              <button 
                type="button" 
                (click)="confirmDeleteBulk()" 
                [disabled]="isDeleting()"
                class="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                @if (isDeleting()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting {{ selectedArticleIds().length }} Items...</span>
                } @else {
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete_sweep</mat-icon>
                  <span>Delete All {{ selectedArticleIds().length }} Articles</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- QUICK COVER IMAGE EDITOR MODAL -->
      @if (quickImageArticle(); as qArticle) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div class="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-black/10 animate-scale-in my-8">
            <!-- Modal Header -->
            <div class="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 26px; width: 26px; height: 26px;">photo_camera</mat-icon>
                </div>
                <div class="min-w-0">
                  <h3 class="text-lg font-black text-[#1d1d1f] truncate">Cover Image වෙනස් කරන්න</h3>
                  <p class="text-xs text-gray-500 truncate max-w-md">{{ qArticle.title }}</p>
                </div>
              </div>
              <button (click)="closeQuickImageModal()" class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-all cursor-pointer shrink-0">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <!-- Current / Selected Image Live Preview -->
            <div class="mb-5">
              <div class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center justify-between">
                <span>Selected Image Preview (තෝරාගත් පින්තූරය):</span>
                @if (quickImageUrl()) {
                  <span class="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <mat-icon style="font-size: 14px; width: 14px; height: 14px;">check_circle</mat-icon> Ready to save
                  </span>
                }
              </div>
              <div class="w-full aspect-[16/9] sm:aspect-[2.2/1] rounded-2xl overflow-hidden bg-gray-100 border border-black/5 relative shadow-inner">
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
              <div class="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center justify-between">
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

            <!-- Alternative Options: AI Generate or Custom URL or Local File or Source URL -->
            <div class="space-y-3 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <!-- Original Web Source Image Extraction Option -->
              @if (qArticle.sourceUrl) {
                <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-emerald-600">travel_explore</mat-icon>
                      <span>Original Source Website එකෙන් Image එක ගන්න</span>
                    </div>
                    <div class="text-[11px] text-gray-500 truncate max-w-sm">{{ qArticle.sourceUrl }}</div>
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
              <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
                <div>
                  <div class="text-xs font-bold text-gray-800">Generate with Gemini AI</div>
                  <div class="text-[11px] text-gray-500">පුවතේ මාතෘකාවට අදාළව AI මඟින් නව visual එකක් සාදන්න</div>
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
                  <label for="quickAdminDirectUrl" class="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Paste Direct Image URL</label>
                  <input id="quickAdminDirectUrl" type="text" [value]="quickImageUrl()" (input)="quickImageUrl.set($any($event.target).value)"
                         placeholder="https://images.unsplash.com/..." class="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
                <div>
                  <label for="quickAdminFileUpload" class="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">Or Upload From Device</label>
                  <input id="quickAdminFileUpload" type="file" accept="image/*" (change)="onQuickImageFileUpload($event)" class="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>
            </div>

            <!-- Footer Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" (click)="closeQuickImageModal()" [disabled]="isQuickImageUpdating()"
                      class="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
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

      <!-- TOAST NOTIFICATION -->
      @if (deleteToast(); as toastMsg) {
        <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#1d1d1f] text-white shadow-2xl border border-white/10 text-xs sm:text-sm font-semibold max-w-[90vw] animate-fade-in-up">
          <mat-icon style="font-size: 20px; width: 20px; height: 20px;" class="text-emerald-400 shrink-0">check_circle</mat-icon>
          <span>{{ toastMsg }}</span>
          <button (click)="deleteToast.set(null)" class="ml-2 text-white/50 hover:text-white p-1">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">close</mat-icon>
          </button>
        </div>
      }
    </main>
  `
})
export class AdminComponent {
  readonly articleService = inject(ArticleService);
  readonly subscriberService = inject(SubscriberService);
  readonly analyticsService = inject(AnalyticsService);
  readonly audioService = inject(AudioService);
  adService = inject(AdManagerService);
  
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  
  readonly activeTab = signal<'articles' | 'auto-studio' | 'audio' | 'subscribers' | 'notify' | 'whatsapp' | 'facebook' | 'deploy' | 'ads' | 'analytics' | 'users'>('articles');
  
  // Audio Studio Signals & State
  audioEditionTitle = 'MyFeed Morning Tech Wrap';
  audioTimeWindowText = '2026/08/26 4:00 AM – 2026/08/27 4:00 AM';
  audioUrlInput = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=news-ambient-112199.mp3';
  audioDurationFormatted = '15:15';
  audioNarrator = 'Kaveen Sandeepa & MyFeed Audio Studio';
  audioSummarySinhala = 'පසුගිය පැය 24 (4:00 AM සිට 4:00 AM) තුළ MyFeed.lk හි පළවූ තාක්ෂණික පුවත් පිළිබඳ විනාඩි 15ක සම්පූර්ණ විග්‍රහය.';
  audioFullScriptSinhala = '';
  audioIsFeatured = true;
  audioChapters: ChapterMark[] = [
    { time: 0, title: 'Introduction & Morning Headlines' },
    { time: 90, title: 'Top Sri Lanka Tech & Business Stories' },
    { time: 380, title: 'Global AI & Smartphone Announcements' },
    { time: 660, title: 'Market, Telecom & Startup Insights' },
    { time: 840, title: 'Editor Wrap-up & Commute Forecast' }
  ];
  readonly isSavingAudioEdition = signal(false);

  // Automated AI Audio Pipeline (3:30 AM Generate -> 4:00 AM Publish) Signals
  readonly audioPipelineStatus = signal<{
    enabled: boolean;
    generationTimeColombo: string;
    publishTimeColombo: string;
    autoPublish: boolean;
    autoWebPush: boolean;
    autoPhonePush: boolean;
    narratorName: string;
    currentTimeColombo: string;
    nextGenerationColombo: string;
    nextPublishColombo: string;
    isGenerating: boolean;
    isPublishing: boolean;
    hasDraft: boolean;
    draftSummary: any;
    logs: any[];
    config: any;
  } | null>(null);
  readonly loadingAudioPipeline = signal<boolean>(false);
  readonly isGeneratingAudioDraft = signal<boolean>(false);
  readonly isPublishingAudioEdition = signal<boolean>(false);
  readonly isSavingAudioConfig = signal<boolean>(false);
  readonly audioPipelineToast = signal<string | null>(null);
  readonly audioPipelineNextGenCountdown = signal<string>('--:--');
  readonly audioPipelineNextPubCountdown = signal<string>('--:--');
  private audioPipelineCountdownInterval: ReturnType<typeof setInterval> | null = null;

  // Gemini AI Voice Synthesizer Signals
  readonly isSynthesizingVoice = signal<boolean>(false);
  selectedTtsVoice = 'Puck';
  readonly ttsPreviewAudioUrl = signal<string | null>(null);

  readonly totalAudioListens = computed(() => {
    return this.audioService.editions().reduce((sum, ed) => sum + (ed.listenCount || 0), 0);
  });
  
  // Auto Studio signals & state
  readonly autoStudioSubTab = signal<'trending' | 'topic' | 'url' | 'polish' | 'autopilot'>('trending');
  readonly trendingNews = signal<TrendingNewsItem[]>([]);
  readonly isLoadingTrending = signal(false);
  readonly selectedTrendingIds = signal<string[]>([]);
  readonly isGeneratingStudioArticle = signal(false);
  readonly isBatchGenerating = signal(false);
  readonly batchProgress = signal<{ current: number; total: number; message: string }>({ current: 0, total: 0, message: '' });
  readonly generatedStudioArticle = signal<GeneratedStudioArticle | null>(null);
  readonly isDirectPublishing = signal(false);

  // Topic Studio inputs
  studioTopic = '';
  studioContext = '';
  studioTone = 'journalistic';
  studioLength = 'standard';
  studioAudience = 'sri_lanka';
  studioIncludeLkr = true;

  // URL Studio input
  studioUrl = '';

  // Content Polisher inputs & state
  polishTitle = '';
  polishInput = '';
  readonly isPolishingContent = signal(false);
  readonly polishedContentResult = signal<PolishedResult | null>(null);
  
  // Analytics Computed Signals
  readonly topViewedArticles = computed(() => {
    return [...this.articleService.articles()]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  });
  
  readonly topReactedArticles = computed(() => {
    return [...this.articleService.articles()]
      .map(article => {
        const reactionsObj = article.reactions || {};
        const totalReactions = Object.values(reactionsObj).reduce((sum, count) => sum + count, 0);
        return { ...article, _totalReactions: totalReactions };
      })
      .sort((a, b) => b._totalReactions - a._totalReactions)
      .slice(0, 5);
  });
  
  private http = inject(HttpClient);

  // Article Search, Filter & Bulk Selection signals
  searchArticleQuery = signal('');
  filterCategory = signal('ALL');
  selectedArticleIds = signal<string[]>([]);

  readonly filteredArticles = computed(() => {
    const q = this.searchArticleQuery().trim().toLowerCase();
    const cat = this.filterCategory();
    return this.articleService.articles().filter(article => {
      const matchCat = cat === 'ALL' || article.category?.toLowerCase() === cat.toLowerCase();
      const matchQuery = !q || 
        article.title?.toLowerCase().includes(q) || 
        article.summary?.toLowerCase().includes(q) ||
        article.category?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  });

  readonly isAllSelected = computed(() => {
    const list = this.filteredArticles();
    const selected = this.selectedArticleIds();
    return list.length > 0 && list.every(a => selected.includes(a.id));
  });

  // Delete Modals & Toast State
  readonly articlePendingDelete = signal<Article | null>(null);
  readonly showBulkDeleteConfirm = signal(false);
  readonly isDeleting = signal(false);
  readonly deleteToast = signal<string | null>(null);

  // Quick Cover Image Editor Signals
  readonly quickImageArticle = signal<Article | null>(null);
  readonly quickImageUrl = signal<string>('');
  readonly quickImageSuggestions = signal<string[]>([]);
  readonly isQuickImageUpdating = signal(false);
  readonly isGeneratingQuickAiImage = signal(false);
  readonly isExtractingQuickSourceImage = signal(false);
  readonly isExtractingFormSourceImage = signal(false);

  // Deployment signals
  netlifyHookUrl = '';
  readonly isDeploying = signal(false);
  readonly deploySuccess = signal(false);
  readonly isSavingSettings = signal(false);

  // WhatsApp Automation signals & state
  waWebhookUrl = '';
  waCustomMessage = '';
  readonly isSavingWaSettings = signal(false);
  readonly isDispatchingWa = signal(false);
  readonly waPostSuccess = signal(false);
  readonly waSuccessMessage = signal('Post sent to WhatsApp Channel successfully!');
  autoPostWhatsApp = true;

  // Facebook Page Automation signals & state
  fbWebhookUrl = '';
  fbCustomMessage = '';
  fbSelectedImageUrl = '';
  readonly isSavingFbSettings = signal(false);
  readonly isTestingFbWebhook = signal(false);
  readonly isDispatchingFb = signal(false);
  readonly fbPostSuccess = signal(false);
  readonly fbSuccessMessage = signal('Post sent to Facebook Page successfully!');
  autoPostFacebook = true;
  autoPilotPostFacebook = true;

  // Phone Push Notifications (via ntfy.sh)
  phoneTopic = 'myfeedlk_alerts';
  siteDomain = 'https://myfeedlk.com';
  autoAlertPhone = true;
  readonly isSavingPhoneSettings = signal(false);
  readonly isTestingPhoneAlert = signal(false);
  readonly phoneAlertSuccess = signal(false);
  readonly isSendingAlertForId = signal<string | null>(null);

  // Auto-Pilot 24/7 Engine Signals & State
  autoPilotEnabled = true;
  autoPilotScheduleMode: 'interval' | 'exact_times' = 'exact_times';
  autoPilotIntervalMinutes = 60;
  autoPilotScheduledDailyTimes: string[] = [
    '00:17', // 12:17 AM
    '01:43', // 1:43 AM
    '03:08', // 3:08 AM
    '05:52', // 5:52 AM
    '07:26', // 7:26 AM
    '09:41', // 9:41 AM
    '11:13', // 11:13 AM
    '12:58', // 12:58 PM
    '14:34', // 2:34 PM
    '16:19', // 4:19 PM
    '18:47', // 6:47 PM
    '20:22', // 8:22 PM
    '22:36', // 10:36 PM
    '23:51'  // 11:51 PM
  ];
  autoPilotNewTimeInput = '09:00';
  autoPilotMaxArticles = 1;
  autoPilotAutoPublish = true;
  autoPilotNotifyPhone = true;
  autoPilotPostWhatsApp = true;
  readonly autoPilotLogs = signal<{
    id: string;
    timestamp: string;
    durationMs: number;
    sourcesScanned: number;
    newArticlesFound: number;
    publishedArticles: { title: string; category: string; imageUrl: string; url?: string }[];
    status: 'success' | 'warning' | 'error';
    message: string;
    triggerType: string;
  }[]>([]);
  readonly autoPilotCountdown = signal<string>('--:--');
  readonly isTriggeringAutoPilot = signal(false);
  readonly isSavingAutoPilotConfig = signal(false);
  readonly isLoadingAutoPilot = signal(false);
  cronWebhookUrl = 'https://myfeedlk.com/api/cron/sync-news';
  private autoPilotNextTargetTime = Date.now() + 60 * 60 * 1000;
  private autoPilotCountdownInterval: ReturnType<typeof setInterval> | null = null;

  // Web Push Browser Notifications State
  webPushTitle = '📰 MyFeed.lk Breaking News';
  webPushBody = 'නව පුවතක් MyFeed.lk හි ප්‍රකාශයට පත් කෙරිණි. දැන්ම කියවන්න!';
  readonly webPushSubscriberCount = signal<number>(0);
  readonly isTestingWebPush = signal(false);
  readonly webPushTestSuccess = signal<string | null>(null);

  // Broadcast signals
  broadcastSubject = '';
  broadcastMessage = '';
  readonly isBroadcasting = signal(false);
  readonly broadcastSuccess = signal(false);
  readonly isAdding = signal(false);
  readonly editingId = signal<string | null>(null);

  notifySubscribers = false;
  formTitle = '';
  formSummary = '';
  formContent = '';
  formCategory = '';
  formImageUrl = '';
  formSourceUrl = '';
  formReadTime = '';
  formAuthorType: 'ai' | 'human' = 'ai';
  formFactScore = 100;
  formFactReason = '';
  formPrimarySourceName = '';
  
  editingAdId = signal<string | null>(null);
  adFormTitle = '';
  adFormLink = '';
  adFormImageUrl = '';
  adFormIsActive = true;
  adFormPlacement = 'home-top';

  aiTopicPrompt = '';
  aiUrlPrompt = '';
  readonly isGeneratingAi = signal(false);
  readonly isGeneratingImage = signal(false);
  readonly generatedImagePrompt = signal('');

  // Admin Email Login State
  adminEmailInput = 'mail.kaveensandeepa@gmail.com';
  adminPasswordInput = '';
  readonly adminAuthError = signal<string | null>(null);

  constructor() {
    onAuthStateChanged(auth, async user => {
      if (user && user.email !== 'mail.kaveensandeepa@gmail.com') {
        await signOut(auth);
        this.user.set(null);
        alert('Unauthorized access. Only the authorized admin can access the dashboard.');
      } else {
        this.user.set(user);
      }
      this.loading.set(false);
      if (this.user()) {
        this.subscriberService.loadSubscribers();
        this.analyticsService.listenToTodayVisitors();
        this.loadDeploySettings();
        this.loadWaSettings();
        this.loadFbSettings();
        this.loadPhoneSettings();
        this.loadWebPushSubscribersCount();
        this.loadAutoPilotStatus();
        this.startAutoPilotCountdown();
        this.loadAudioPipelineStatus();
        this.startAudioPipelineCountdown();
      }
    });
  }

  async loginWithEmail() {
    if (!this.adminEmailInput || !this.adminPasswordInput) return;
    this.loading.set(true);
    this.adminAuthError.set(null);

    try {
      const userCred = await signInWithEmailAndPassword(auth, this.adminEmailInput.trim(), this.adminPasswordInput);
      if (userCred.user.email !== 'mail.kaveensandeepa@gmail.com') {
        await signOut(auth);
        this.user.set(null);
        this.adminAuthError.set('Unauthorized access. Only the administrator account is permitted in this dashboard.');
      }
    } catch (err: unknown) {
      console.error('Admin email login failed', err);
      const error = err as { message?: string };
      this.adminAuthError.set(error.message || 'Login failed. Please verify credentials.');
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    await signOut(auth);
  }

  editArticle(article: Article) {
    this.editingId.set(article.id);
    this.formTitle = article.title;
    this.formSummary = article.summary;
    this.formContent = article.content;
    this.formCategory = article.category;
    this.formImageUrl = article.imageUrl;
    this.formSourceUrl = article.sourceUrl || '';
    this.formReadTime = article.readTime || '5 min';
    this.formAuthorType = article.authorType === 'human' ? 'human' : 'ai';
    this.formFactScore = article.factCheck?.score ?? (article.sourceUrl ? 100 : 95);
    this.formFactReason = article.factCheck?.reason ?? '';
    this.formPrimarySourceName = article.factCheck?.sources?.[0]?.name ?? '';
    this.isAdding.set(true);
  }

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize and compress
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Get compressed base64 string
          this.formImageUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          // Trigger change detection since we're not using NgModel for the file input directly
          input.value = '';
        };
        img.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  }

  editAd(ad: Ad) {
    this.editingAdId.set(ad.id);
    this.adFormTitle = ad.title;
    this.adFormLink = ad.link;
    this.adFormImageUrl = ad.imageUrl;
    this.adFormIsActive = ad.isActive;
    this.adFormPlacement = ad.placement || 'home-top';
    this.isAdding.set(true);
  }

  async saveAd() {
    if (!this.adFormTitle || !this.adFormLink || !this.adFormImageUrl) {
      alert('Please fill all required fields');
      return;
    }
    
    const adData = {
      title: this.adFormTitle,
      link: this.adFormLink,
      imageUrl: this.adFormImageUrl,
      isActive: this.adFormIsActive,
      placement: this.adFormPlacement
    };

    if (this.editingAdId()) {
      await this.adService.updateAd(this.editingAdId()!, adData);
    } else {
      await this.adService.addAd(adData);
    }
    
    this.cancelAdEdit();
  }

  cancelAdEdit() {
    this.editingAdId.set(null);
    this.adFormTitle = '';
    this.adFormLink = '';
    this.adFormImageUrl = '';
    this.adFormIsActive = true;
    this.adFormPlacement = 'home-top';
    this.isAdding.set(false);
  }

  async toggleAdStatus(ad: Ad) {
    await this.adService.updateAd(ad.id, { isActive: !ad.isActive });
  }

  async deleteAd(id: string) {
    if (confirm('Are you sure you want to delete this ad?')) {
      await this.adService.deleteAd(id);
    }
  }

  onAdImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.adFormImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelEdit() {
    if (this.activeTab() === 'ads') {
      this.cancelAdEdit();
      return;
    }
    this.isAdding.set(false);
    this.editingId.set(null);
    this.aiTopicPrompt = '';
    this.generatedImagePrompt.set('');
    this.resetForm();
  }

  async generateImageFromTitle() {
    const topic = (this.formTitle || this.aiTopicPrompt).trim();
    if (!topic) {
      alert('කරුණාකර Image එකක් සෑදීමට මාතෘකාවක් (Title) ඇතුළත් කරන්න.');
      return;
    }

    this.isGeneratingImage.set(true);
    try {
      const res = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic,
          category: this.formCategory || 'Tech'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate AI image');
      }

      const data = await res.json();
      if (data.imageUrl) {
        this.formImageUrl = data.imageUrl;
        this.generatedImagePrompt.set(data.prompt || '');
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert('AI Image Generation Error: ' + (err.message || String(e)));
    } finally {
      this.isGeneratingImage.set(false);
    }
  }

  getFormCuratedImages(): string[] {
    return getCuratedTopicImages(this.formTitle || this.aiTopicPrompt || '', this.formCategory || 'Tech');
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

  async extractImageFromFormSourceUrl() {
    const url = (this.formSourceUrl || '').trim();
    if (!url || !url.startsWith('http')) {
      alert('කරුණාකර වලංගු Source URL (Web Link) එකක් ඇතුළත් කරන්න.');
      return;
    }

    this.isExtractingFormSourceImage.set(true);
    try {
      const res = await fetch('/api/extract-source-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to extract original image');
      }

      const data = await res.json();
      if (data.originalImageUrl) {
        this.formImageUrl = data.originalImageUrl;
        this.deleteToast.set('Original Source Image එක සාර්ථකව load කරගන්නා ලදී! 📸');
        setTimeout(() => this.deleteToast.set(null), 4000);
      } else if (data.imageUrl) {
        this.formImageUrl = data.imageUrl;
      } else {
        alert('මෙම Source Website එකෙන් Image එකක් හමු නොවීය.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Extraction Error: ' + (e.message || String(err)));
    } finally {
      this.isExtractingFormSourceImage.set(false);
    }
  }

  async saveQuickImage() {
    const article = this.quickImageArticle();
    const newUrl = this.quickImageUrl().trim();
    if (!article || !newUrl) return;

    this.isQuickImageUpdating.set(true);
    try {
      await this.articleService.updateArticle(article.id, { imageUrl: newUrl });
      this.deleteToast.set(`"${article.title.substring(0, 30)}..." Cover Image සාර්ථකව update කරන ලදී!`);
      setTimeout(() => this.deleteToast.set(null), 4000);
      this.closeQuickImageModal();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Failed to update article image: ' + (e.message || String(err)));
    } finally {
      this.isQuickImageUpdating.set(false);
    }
  }

  async generateWithAI() {
    if (!this.aiTopicPrompt.trim()) {
      alert('කරුණාකර ඔබට අවශ්‍ය පුවතේ මාතෘකාව ඇතුළත් කරන්න.');
      return;
    }

    this.isGeneratingAi.set(true);
    try {
      const res = await fetch('/api/generate-ai-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: this.aiTopicPrompt })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate article with AI');
      }

      const data = await res.json();
      this.formTitle = data.sinhalaTitle || this.aiTopicPrompt;
      this.formSummary = data.sinhalaDescription || '';
      this.formContent = data.sinhalaFullContent || '';
      if (data.suggestedCategory) this.formCategory = data.suggestedCategory;
      if (data.readTime) this.formReadTime = data.readTime;
      if (data.factCheckScore !== undefined) this.formFactScore = data.factCheckScore;
      if (data.factCheckReason) this.formFactReason = data.factCheckReason;
      
      // Generate matching AI image tailored to the newly generated title
      if (!this.formImageUrl) {
        await this.generateImageFromTitle();
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert('AI Generation Error: ' + (err.message || String(e)));
    } finally {
      this.isGeneratingAi.set(false);
    }
  }

  async generateFromUrl() {
    if (!this.aiUrlPrompt.trim()) return;
    this.isGeneratingAi.set(true);

    try {
      const res = await fetch('/api/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: this.aiUrlPrompt })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      this.formTitle = data.sinhalaTitle || '';
      this.formSummary = data.sinhalaDescription || '';
      this.formContent = data.sinhalaFullContent || '';
      this.formCategory = data.suggestedCategory || 'Tech';
      this.formReadTime = data.readTime || '4 min read';
      this.formAuthorType = 'ai';
      this.formSourceUrl = this.aiUrlPrompt;
      if (data.factCheckScore !== undefined) this.formFactScore = data.factCheckScore;
      if (data.factCheckReason) this.formFactReason = data.factCheckReason;
      
      if (data.originalImageUrl) {
        this.formImageUrl = data.originalImageUrl;
      } else if (data.imageUrl) {
        this.formImageUrl = data.imageUrl;
      } else if (data.visualPrompt) {
        this.generatedImagePrompt.set(data.visualPrompt);
        // Automatically trigger image generation
        this.generateImageFromTitle();
      }

      alert('News Article successfully generated from the provided URL!');
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('URL generation error:', error);
      alert('Error: ' + (err.message || String(error)));
    } finally {
      this.isGeneratingAi.set(false);
    }
  }

  async saveArticle() {
    this.loading.set(true);
    try {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const fcScore = typeof this.formFactScore === 'number' ? this.formFactScore : 100;
      const sourceName = this.formPrimarySourceName.trim() || (this.formSourceUrl ? extractDomain(this.formSourceUrl).name : 'Primary Verified Source');
      const fcReason = this.formFactReason.trim() || (fcScore >= 95 
        ? 'ප්‍රධාන නිල මූලාශ්‍ර සහ මාධ්‍ය නිවේදන මඟින් 100% ක් සනාථ කර ඇත.' 
        : 'සමාගමේ නිල නිවේදනය තවමත් බලාපොරොත්තුවේ. මූලික කාන්දුවීම් (leaks) මත පදනම් වේ.');

      const factCheckObj: FactCheckData = {
        score: fcScore,
        status: fcScore >= 95 ? 'verified_100' : 'developing',
        statusBadge: fcScore >= 95 ? '100% සත්‍යාපිත මූලාශ්‍රයකි (Fully Verified)' : `${fcScore}% සත්‍යාපිතයි (Developing Story)`,
        reason: fcReason,
        sources: [
          {
            name: sourceName,
            url: this.formSourceUrl || undefined,
            isPrimary: true
          }
        ],
        metrics: {
          sourceReliability: fcScore >= 95 ? 100 : 90,
          factualAccuracy: fcScore >= 95 ? 100 : 85,
          editorialReview: fcScore >= 95 ? 100 : 95
        },
        checkedBy: 'MyFeed Fact-Check Desk'
      };

      const payload: Partial<Article> = {
        title: this.formTitle,
        summary: this.formSummary,
        content: this.formContent,
        category: this.formCategory,
        imageUrl: this.formImageUrl,
        sourceUrl: this.formSourceUrl || undefined,
        readTime: this.formReadTime,
        date: dateStr,
        authorType: this.formAuthorType,
        isAiGenerated: this.formAuthorType === 'ai',
        factCheck: factCheckObj,
        slug: this.formTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      };

      if (this.editingId()) {
        await this.articleService.updateArticle(this.editingId()!, payload);
      } else {
        const newDocId = await this.articleService.addArticle(payload as Omit<Article, 'id' | 'createdAt'>);
        const articleUrl = this.getArticleUrl(payload.slug || newDocId);
        
        // Auto-notify if selected and it's a new post
        if (this.notifySubscribers) {
          await addDoc(collection(db, 'notifications'), {
            subject: `New Article: ${this.formTitle}`,
            message: `Check out our latest update: "${this.formTitle}" under ${this.formCategory}. Read it now on MyFeed!`,
            sentAt: serverTimestamp(),
            recipientCount: this.subscriberService.subscribers().length,
            status: 'delivered'
          });
        }

        // Auto-post to WhatsApp Channel if enabled
        if (this.autoPostWhatsApp) {
          this.triggerWhatsAppChannelPost({
            title: this.formTitle,
            summary: this.formSummary,
            category: this.formCategory,
            readTime: this.formReadTime,
            imageUrl: this.formImageUrl,
            articleUrl
          });
        }

        // Auto-post to Facebook Page if enabled
        if (this.autoPostFacebook) {
          this.triggerFacebookPagePost({
            title: this.formTitle,
            summary: this.formSummary,
            category: this.formCategory,
            readTime: this.formReadTime,
            imageUrl: this.formImageUrl,
            articleUrl,
            slug: payload.slug
          });
        }

        // Auto-alert Phone if enabled (ntfy.sh push alert)
        if (this.autoAlertPhone) {
          await this.triggerPhonePushNotification({
            title: this.formTitle,
            summary: this.formSummary,
            imageUrl: this.formImageUrl,
            articleUrl
          });
        }
        
        // Auto-alert Web Push
        await this.triggerWebPushNotification({
          title: this.formTitle,
          summary: this.formSummary,
          imageUrl: this.formImageUrl,
          articleUrl
        });
      }
      
      this.cancelEdit();
    } catch (error) {
      console.error('Failed to save', error);
    } finally {
      this.loading.set(false);
    }
  }

  isArticleSelected(id: string): boolean {
    return this.selectedArticleIds().includes(id);
  }

  toggleSelectAll() {
    const list = this.filteredArticles();
    if (this.isAllSelected()) {
      const currentListIds = new Set(list.map(a => a.id));
      this.selectedArticleIds.update(ids => ids.filter(id => !currentListIds.has(id)));
    } else {
      const existing = new Set(this.selectedArticleIds());
      list.forEach(a => existing.add(a.id));
      this.selectedArticleIds.set(Array.from(existing));
    }
  }

  toggleSelectArticle(id: string) {
    this.selectedArticleIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(item => item !== id);
      } else {
        return [...ids, id];
      }
    });
  }

  clearSelection() {
    this.selectedArticleIds.set([]);
  }

  getArticleById(id: string): Article | undefined {
    return this.articleService.articles().find(a => a.id === id);
  }

  openDeleteModal(article: Article) {
    this.articlePendingDelete.set(article);
  }

  cancelDelete() {
    this.articlePendingDelete.set(null);
    this.showBulkDeleteConfirm.set(false);
  }

  async confirmDeleteSingle() {
    const art = this.articlePendingDelete();
    if (!art) return;
    this.isDeleting.set(true);
    try {
      await this.articleService.deleteArticle(art.id);
      this.selectedArticleIds.update(ids => ids.filter(id => id !== art.id));
      this.showToast(`"${art.title.slice(0, 30)}..." පුවත සාර්ථකව Delete කරන ලදී.`);
      this.articlePendingDelete.set(null);
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('Failed to delete article. Please check your network or permissions.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  openBulkDeleteModal() {
    if (this.selectedArticleIds().length === 0) return;
    this.showBulkDeleteConfirm.set(true);
  }

  async confirmDeleteBulk() {
    const ids = this.selectedArticleIds();
    if (ids.length === 0) return;
    this.isDeleting.set(true);
    try {
      await this.articleService.deleteMultipleArticles(ids);
      const count = ids.length;
      this.selectedArticleIds.set([]);
      this.showToast(`තෝරාගත් පුවත් ${count} ම සාර්ථකව Delete කරන ලදී.`);
      this.showBulkDeleteConfirm.set(false);
    } catch (err) {
      console.error('Failed to batch delete articles:', err);
      alert('Failed to delete selected articles.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  private showToast(msg: string) {
    this.deleteToast.set(msg);
    setTimeout(() => {
      this.deleteToast.set(null);
    }, 4000);
  }

  async deleteArticle(id: string) {
    const art = this.getArticleById(id);
    if (art) {
      this.openDeleteModal(art);
    } else {
      if (confirm('Are you sure you want to delete this article?')) {
        this.loading.set(true);
        await this.articleService.deleteArticle(id);
        this.loading.set(false);
      }
    }
  }

  async deleteSubscriber(id: string) {
    if (confirm('Are you sure you want to remove this subscriber?')) {
      await this.subscriberService.deleteSubscriber(id);
    }
  }

  private resetForm() {
    this.notifySubscribers = false;
    this.formTitle = '';
    this.formSummary = '';
    this.formContent = '';
    this.formCategory = '';
    this.formImageUrl = '';
    this.formSourceUrl = '';
    this.formReadTime = '';
    this.formAuthorType = 'ai';
    this.formFactScore = 100;
    this.formFactReason = '';
    this.formPrimarySourceName = '';
  }

  async sendBroadcast() {
    if (!this.broadcastSubject || !this.broadcastMessage) return;

    this.isBroadcasting.set(true);
    this.broadcastSuccess.set(false);

    try {
      await addDoc(collection(db, 'notifications'), {
        subject: this.broadcastSubject,
        message: this.broadcastMessage,
        sentAt: serverTimestamp(),
        recipientCount: this.subscriberService.subscribers().length,
        status: 'delivered'
      });

      this.broadcastSuccess.set(true);
      this.broadcastSubject = '';
      this.broadcastMessage = '';
      
      setTimeout(() => this.broadcastSuccess.set(false), 5000);
    } catch (error) {
      console.error('Broadcast failed', error);
      alert('Failed to send broadcast notification.');
    } finally {
      this.isBroadcasting.set(false);
    }
  }

  async loadDeploySettings() {
    try {
      const docRef = doc(db, 'settings', 'deploy');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.netlifyHookUrl = docSnap.data()['netlifyHookUrl'] || '';
      }
    } catch (error) {
      console.error('Error loading settings', error);
    }
  }

  async saveDeploySettings() {
    if (!this.netlifyHookUrl) return;
    this.isSavingSettings.set(true);
    try {
      await setDoc(doc(db, 'settings', 'deploy'), {
        netlifyHookUrl: this.netlifyHookUrl,
        updatedAt: serverTimestamp()
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings', error);
      alert('Failed to save settings');
    } finally {
      this.isSavingSettings.set(false);
    }
  }

  async loadWaSettings() {
    try {
      const docRef = doc(db, 'settings', 'whatsapp');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.waWebhookUrl = docSnap.data()['webhookUrl'] || '';
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings', error);
    }
  }

  async saveWaSettings() {
    this.isSavingWaSettings.set(true);
    try {
      await setDoc(doc(db, 'settings', 'whatsapp'), {
        webhookUrl: this.waWebhookUrl,
        updatedAt: serverTimestamp()
      });
      alert('WhatsApp webhook settings saved successfully');
    } catch (error) {
      console.error('Error saving WhatsApp settings', error);
      alert('Failed to save WhatsApp settings');
    } finally {
      this.isSavingWaSettings.set(false);
    }
  }

  openWhatsAppModal(article: Article) {
    const articleUrl = this.getArticleUrl(article.slug || article.id);
    this.waCustomMessage = `*🚀 NEW ON MYFEED.LK (${article.category})*

*${article.title}*

${article.summary}

⏱️ ${article.readTime || '3 min read'}
🔗 *Read full story:* ${articleUrl}

_Curated with precision by My Feed Lk Sri Lanka_`;
    this.activeTab.set('whatsapp');
  }

  loadLatestArticleForWa() {
    const articles = this.articleService.articles();
    if (articles.length > 0) {
      this.openWhatsAppModal(articles[0]);
    }
  }

  async triggerWhatsAppChannelPost(data: { title: string; summary: string; category: string; readTime: string; articleUrl: string; imageUrl?: string }) {
    try {
      await fetch('/api/whatsapp/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Auto WhatsApp dispatch background error:', err);
    }
  }

  async triggerWhatsAppDispatch(data: { id: string; title: string; summary: string; imageUrl?: string; url: string; category: string; customSnippet?: string }) {
    try {
      await fetch('/api/whatsapp/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
          imageUrl: data.imageUrl,
          articleUrl: data.url,
          category: data.category,
          customMessage: data.customSnippet
        })
      });
    } catch (err) {
      console.warn('WhatsApp dispatch warning:', err);
    }
  }

  async dispatchWhatsAppPost() {
    if (!this.waCustomMessage.trim()) return;

    this.isDispatchingWa.set(true);
    this.waPostSuccess.set(false);

    try {
      const res = await fetch('/api/whatsapp/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage: this.waCustomMessage })
      });

      const data = await res.json();
      if (data.mode === 'webhook') {
        this.waSuccessMessage.set('Dispatched successfully to WhatsApp Webhook endpoint!');
      } else if (data.mode === 'formatted_payload') {
        this.waSuccessMessage.set('Post prepared! You can also click "Open in WhatsApp Web" for instant channel broadcast.');
      } else {
        this.waSuccessMessage.set('Post published to WhatsApp Channel successfully!');
      }

      this.waPostSuccess.set(true);
      setTimeout(() => this.waPostSuccess.set(false), 6000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert('WhatsApp dispatch failed: ' + (err.message || String(e)));
    } finally {
      this.isDispatchingWa.set(false);
    }
  }

  openDirectWhatsAppShare() {
    if (!this.waCustomMessage.trim()) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(this.waCustomMessage)}`;
    window.open(url, '_blank');
  }

  async loadFbSettings() {
    try {
      const localFbHook = localStorage.getItem('myfeed_fb_webhook_url');
      if (localFbHook) {
        this.fbWebhookUrl = localFbHook;
      }
      const docRef = doc(db, 'settings', 'facebook');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data['webhookUrl']) {
          this.fbWebhookUrl = data['webhookUrl'];
        }
      }
    } catch (error) {
      console.error('Error loading Facebook settings', error);
    }
  }

  async saveFbSettings() {
    this.isSavingFbSettings.set(true);
    try {
      try {
        localStorage.setItem('myfeed_fb_webhook_url', this.fbWebhookUrl);
      } catch (storageErr) {
        console.warn('LocalStorage save error:', storageErr);
      }

      await setDoc(doc(db, 'settings', 'facebook'), {
        webhookUrl: this.fbWebhookUrl,
        updatedAt: serverTimestamp()
      });

      // Also sync to server autopilot config
      await fetch('/api/admin/autopilot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fbWebhookUrl: this.fbWebhookUrl
        })
      }).catch((fetchErr) => {
        console.warn('Sync autopilot fb config error:', fetchErr);
      });

      alert('Facebook webhook settings saved successfully!');
    } catch (error) {
      console.error('Error saving Facebook settings', error);
      alert('Failed to save Facebook settings');
    } finally {
      this.isSavingFbSettings.set(false);
    }
  }

  async sendTestFbWebhook() {
    if (!this.fbWebhookUrl.trim()) {
      alert('කරුණාකර පළමුව Make.com Webhook URL එක ඇතුළත් කරන්න!');
      return;
    }
    this.isTestingFbWebhook.set(true);
    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'MyFeed.lk Test Breaking News',
          summary: 'මෙය MyFeed.lk සහ Make.com Facebook Webhook සම්බන්ධතාවය සහ Post structure එක පරික්ෂා කිරීම සඳහා යැවූ Test පණිවිඩයකි.',
          articleUrl: (this.siteDomain || 'https://myfeedlk.com').trim() + '/news/test-post',
          category: 'Tech',
          readTime: '2 min read',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
          webhookUrl: this.fbWebhookUrl.trim()
        })
      });
      const result = await res.json();
      if (res.ok && (result.success || result.mode === 'webhook')) {
        alert('✅ Test Data සාර්ථකව Make.com වෙත යවන ලදී! දැන් Make.com Scenario එකේ fields auto-detect වී ඇති බව පරීක්ෂා කරන්න.');
      } else {
        alert('⚠️ Webhook response: ' + (result.error || JSON.stringify(result)));
      }
    } catch (err: any) {
      alert('Failed to send test webhook: ' + (err?.message || err));
    } finally {
      this.isTestingFbWebhook.set(false);
    }
  }

  openFacebookModal(article: Article) {
    const articleUrl = this.getArticleUrl(article.slug || article.id);
    this.fbSelectedImageUrl = article.imageUrl || '';
    this.fbCustomMessage = `📰 ${article.title}

${article.summary}

🔗 සම්පූර්ණ විස්තරය කියවන්න: ${articleUrl}

#MyFeedLK #TechNews #SriLanka #${(article.category || 'Tech').replace(/\s+/g, '')}`;
    this.activeTab.set('facebook');
  }

  loadLatestArticleForFb() {
    const articles = this.articleService.articles();
    if (articles.length > 0) {
      this.openFacebookModal(articles[0]);
    }
  }

  async triggerFacebookPagePost(data: { title: string; summary: string; category: string; readTime: string; articleUrl: string; imageUrl?: string; slug?: string }) {
    try {
      await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          webhookUrl: this.fbWebhookUrl
        })
      });
    } catch (err) {
      console.warn('Auto Facebook dispatch background error:', err);
    }
  }

  async triggerFacebookDispatch(data: { id: string; title: string; summary: string; imageUrl?: string; url: string; category: string; customSnippet?: string }) {
    try {
      await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
          imageUrl: data.imageUrl,
          articleUrl: data.url,
          category: data.category,
          customMessage: data.customSnippet,
          webhookUrl: this.fbWebhookUrl
        })
      });
    } catch (err) {
      console.warn('Facebook dispatch warning:', err);
    }
  }

  async dispatchFacebookPost() {
    if (!this.fbCustomMessage.trim()) return;

    this.isDispatchingFb.set(true);
    this.fbPostSuccess.set(false);

    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customMessage: this.fbCustomMessage,
          imageUrl: this.fbSelectedImageUrl,
          webhookUrl: this.fbWebhookUrl
        })
      });

      const data = await res.json();
      if (data.mode === 'webhook') {
        this.fbSuccessMessage.set('Dispatched successfully to Facebook Webhook endpoint!');
      } else if (data.mode === 'formatted_payload') {
        this.fbSuccessMessage.set('Post prepared! You can also click "Open in Facebook" for web posting.');
      } else {
        this.fbSuccessMessage.set('Post published to Facebook Page successfully!');
      }

      this.fbPostSuccess.set(true);
      setTimeout(() => this.fbPostSuccess.set(false), 6000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert('Facebook dispatch failed: ' + (err.message || String(e)));
    } finally {
      this.isDispatchingFb.set(false);
    }
  }

  openDirectFacebookShare() {
    if (!this.fbCustomMessage.trim()) return;
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(this.fbCustomMessage)}`;
    window.open(url, '_blank');
  }

  getArticleUrl(slugOrId: string): string {
    const domain = (this.siteDomain || 'https://myfeedlk.com').trim().replace(/\/+$/, '');
    return slugOrId ? `${domain}/article/${slugOrId}` : domain;
  }

  async loadPhoneSettings() {
    // 1. Load instantly from localStorage if available
    try {
      const localTopic = localStorage.getItem('myfeed_phone_topic');
      if (localTopic) {
        this.phoneTopic = localTopic;
      }
      const localDomain = localStorage.getItem('myfeed_site_domain');
      if (localDomain) {
        this.siteDomain = localDomain;
      }
    } catch {
      // ignore
    }

    // 2. Sync with Firestore settings
    try {
      const docRef = doc(db, 'settings', 'phone_alerts');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data['topic']) {
          this.phoneTopic = data['topic'];
          try { 
            localStorage.setItem('myfeed_phone_topic', this.phoneTopic); 
          } catch {
            // ignore storage errors
          }
        }
        if (data && data['siteDomain']) {
          this.siteDomain = data['siteDomain'];
          try { 
            localStorage.setItem('myfeed_site_domain', this.siteDomain); 
          } catch {
            // ignore storage errors
          }
        }
      }
    } catch (e) {
      console.warn('Could not load phone settings from Firestore', e);
    }
  }

  async savePhoneSettings() {
    if (!this.phoneTopic.trim()) return;
    this.isSavingPhoneSettings.set(true);
    try {
      const cleanTopic = this.phoneTopic.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'myfeedlk_kaveen';
      const cleanDomain = (this.siteDomain || 'https://myfeedlk.com').trim().replace(/\/+$/, '');
      
      try {
        localStorage.setItem('myfeed_phone_topic', cleanTopic);
        localStorage.setItem('myfeed_site_domain', cleanDomain);
      } catch {
        // ignore storage errors
      }

      const docRef = doc(db, 'settings', 'phone_alerts');
      await setDoc(docRef, {
        topic: cleanTopic,
        siteDomain: cleanDomain,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert('Phone alert & website settings saved successfully!');
    } catch (error) {
      console.error('Error saving phone settings', error);
      alert('Settings saved locally. (Firestore notice: ' + (error instanceof Error ? error.message : String(error)) + ')');
    } finally {
      this.isSavingPhoneSettings.set(false);
    }
  }

  async sendTestPhoneAlert() {
    const cleanTopic = (this.phoneTopic || 'myfeedlk_kaveen').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'myfeedlk_kaveen';
    this.isTestingPhoneAlert.set(true);
    this.phoneAlertSuccess.set(false);

    try {
      const targetUrl = (this.siteDomain || 'https://myfeedlk.com').trim().replace(/\/+$/, '');
      const payload = {
        topic: cleanTopic,
        title: '🔥 Test Alert from MyFeed.lk',
        message: 'Phone Push Notifications are active and working! Tap here to open MyFeed.',
        click: targetUrl,
        priority: 4,
        tags: ['newspaper', 'bell', 'rocket']
      };

      // 1. Direct fetch to ntfy.sh (Supported natively in browser with CORS)
      const directRes = await fetch('https://ntfy.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 2. Also dispatch via backend API route
      fetch('/api/notify/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.warn('Backend proxy notify warning:', e));

      if (directRes.ok) {
        this.phoneAlertSuccess.set(true);
        setTimeout(() => this.phoneAlertSuccess.set(false), 8000);
      } else {
        const text = await directRes.text();
        alert('ntfy.sh responded: ' + text);
      }
    } catch (e) {
      console.error('Test alert error', e);
      alert('Could not dispatch test notification: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      this.isTestingPhoneAlert.set(false);
    }
  }

  
  async loadWebPushSubscribersCount() {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const snap = await getDocs(collection(db, 'web_push_subscriptions'));
      this.webPushSubscriberCount.set(snap.size);
    } catch {
      this.webPushSubscriberCount.set(0);
    }
  }

  async sendTestWebPush() {
    this.isTestingWebPush.set(true);
    this.webPushTestSuccess.set(null);
    try {
      const res = await fetch('/api/notify/webpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: this.webPushTitle || 'MyFeed.lk Test Notification',
          summary: this.webPushBody || 'This is a test notification from MyFeed.lk',
          articleUrl: '/'
        })
      });
      const data = await res.json();
      if (res.ok) {
        this.webPushTestSuccess.set(`✅ Web Push sent! ${data.sent ?? data.count ?? 0} delivered (Total subscribers: ${data.total ?? this.webPushSubscriberCount()})`);
        await this.loadWebPushSubscribersCount();
      } else {
        throw new Error(data.error || 'Failed to send test web push');
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert('Web Push Test Error: ' + (err.message || String(e)));
    } finally {
      this.isTestingWebPush.set(false);
    }
  }
  
  async triggerWebPushNotification(data: { title: string; summary: string; articleUrl: string; imageUrl?: string; category?: string }): Promise<boolean> {
    try {
      const res = await fetch('/api/notify/webpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          summary: data.summary,
          articleUrl: data.articleUrl,
          imageUrl: data.imageUrl,
          category: data.category
        })
      });
      return res.ok;
    } catch (e) {
      console.warn('Web Push Dispatch Error', e);
      return false;
    }
  }

  async triggerPhonePushNotification(data: { title: string; summary: string; articleUrl: string; imageUrl?: string }): Promise<boolean> {

    try {
      const cleanTopic = (this.phoneTopic || 'myfeedlk_kaveen').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'myfeedlk_kaveen';
      const safeTitle = (data.title ? `📰 ${data.title}` : '📰 MyFeed.lk: New Story').slice(0, 120);
      const safeMessage = (data.summary ? `${data.summary}\n\n🔗 Tap to read full story →` : 'A new article has just been published on MyFeed.lk. Tap to read!').slice(0, 800);
      const safeUrl = (data.articleUrl || this.siteDomain || 'https://myfeedlk.com').trim();

      const payload: Record<string, unknown> = {
        topic: cleanTopic,
        title: safeTitle,
        message: safeMessage,
        click: safeUrl,
        priority: 4,
        tags: ['newspaper', 'rocket']
      };

      // Only attach if it's a valid remote HTTP/HTTPS URL and NOT a data URL
      if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.startsWith('http') && !data.imageUrl.startsWith('data:')) {
        payload['attach'] = data.imageUrl;
      }

      // 1. Direct fetch to ntfy.sh
      let directRes = await fetch('https://ntfy.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      // If failed with attachment, retry immediately without attachment
      if ((!directRes || !directRes.ok) && payload['attach']) {
        delete payload['attach'];
        directRes = await fetch('https://ntfy.sh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }

      // 2. Also dispatch via backend API proxy for high reliability
      fetch('/api/notify/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.warn('Backend proxy notify warning:', e));

      return directRes ? directRes.ok : true;
    } catch (err) {
      console.warn('Auto phone push dispatch background error:', err);
      return false;
    }
  }

  async sendPhoneAlertForArticle(article: Article) {
    this.isSendingAlertForId.set(article.id);
    try {
      const articleUrl = this.getArticleUrl(article.slug || article.id);
      const success = await this.triggerPhonePushNotification({
        title: article.title,
        summary: article.summary,
        imageUrl: article.imageUrl,
        articleUrl
      });

      if (success) {
        alert(`🔔 Phone Push Alert dispatched to topic: ${this.phoneTopic || 'myfeedlk_kaveen'} for "${article.title}"`);
      } else {
        alert(`Notification sent to topic ${this.phoneTopic || 'myfeedlk_kaveen'}. Please check your phone.`);
      }
    } catch (e) {
      alert('Alert error: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      this.isSendingAlertForId.set(null);
    }
  }

  triggerNetlifyBuild() {
    if (!this.netlifyHookUrl || this.isDeploying()) return;
    
    this.isDeploying.set(true);
    this.deploySuccess.set(false);

    this.http.post(this.netlifyHookUrl, {}).subscribe({
      next: () => {
        this.deploySuccess.set(true);
        this.isDeploying.set(false);
        setTimeout(() => this.deploySuccess.set(false), 5000);
      },
      error: (err) => {
        console.error('Netlify trigger failed', err);
        // Netlify build hooks usually return 200/202, but even if it fails we show an alert
        alert('Failed to trigger Netlify build. Please verify your Hook URL.');
        this.isDeploying.set(false);
      }
    });
  }

  // ==========================================
  // AUTO AI STUDIO AUTOMATION METHODS
  // ==========================================

  isTrendingSelected(id: string): boolean {
    return this.selectedTrendingIds().includes(id);
  }

  toggleSelectTrending(id: string) {
    const curr = this.selectedTrendingIds();
    if (curr.includes(id)) {
      this.selectedTrendingIds.set(curr.filter(x => x !== id));
    } else {
      this.selectedTrendingIds.set([...curr, id]);
    }
  }

  toggleSelectAllTrending() {
    const all = this.trendingNews().map(i => i.id);
    if (this.selectedTrendingIds().length === all.length && all.length > 0) {
      this.selectedTrendingIds.set([]);
    } else {
      this.selectedTrendingIds.set(all);
    }
  }

  async loadTrendingNews() {
    this.isLoadingTrending.set(true);
    try {
      const res = await fetch('/api/admin/trending-news');
      if (!res.ok) {
        throw new Error('Failed to scan live tech trends');
      }
      const data = await res.json();
      this.trendingNews.set(data.items || []);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Trending fetch error:', err);
      alert('Error fetching live trending feeds: ' + (e.message || String(err)));
    } finally {
      this.isLoadingTrending.set(false);
    }
  }

  async generateAndReviewTrending(item: TrendingNewsItem) {
    this.isGeneratingStudioArticle.set(true);
    this.studioTopic = item.title;
    this.studioContext = item.description || '';
    try {
      const res = await fetch('/api/admin/generate-full-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'trending',
          topic: item.title,
          rawContent: item.description,
          url: item.url,
          imageUrl: item.imageUrl,
          tone: this.studioTone,
          length: this.studioLength,
          targetAudience: this.studioAudience,
          includeLkr: this.studioIncludeLkr
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate article');
      }

      const generated = await res.json();
      this.generatedStudioArticle.set(generated);
      this.autoStudioSubTab.set('topic');
      this.deleteToast.set('✨ Full Sinhala Article & AI Visual Generated! Review below.');
      setTimeout(() => this.deleteToast.set(null), 5000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Generation error: ' + (e.message || String(err)));
    } finally {
      this.isGeneratingStudioArticle.set(false);
    }
  }

  async autoPublishSingleTrending(item: TrendingNewsItem) {
    if (!confirm(`Do you want to 1-Click Generate & Publish:\n"${item.title}"?`)) return;

    this.isGeneratingStudioArticle.set(true);
    try {
      // 1. Generate full article with Gemini
      const genRes = await fetch('/api/admin/generate-full-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'trending',
          topic: item.title,
          rawContent: item.description,
          url: item.url,
          imageUrl: item.imageUrl,
          tone: 'journalistic',
          length: 'standard',
          targetAudience: 'sri_lanka',
          includeLkr: true
        })
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate content');
      }

      const generated = await genRes.json();
      
      // 2. Publish to Firestore
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newArticlePayload: Partial<Article> = {
        title: generated.sinhalaTitle || item.title,
        summary: generated.sinhalaDescription || item.description,
        content: generated.sinhalaFullContent || `<p>${generated.sinhalaDescription}</p>`,
        category: generated.suggestedCategory || 'Tech',
        imageUrl: generated.imageUrl || item.imageUrl || '',
        readTime: generated.readTime || '4 min read',
        date: dateStr,
        authorType: 'ai',
        createdAt: new Date(),
        views: 0
      };

      const docRef = await addDoc(collection(db, 'articles'), newArticlePayload);
      const articleUrl = this.getArticleUrl(docRef.id);

      // 3. Dispatch Phone Alert
      if (this.autoAlertPhone) {
        this.triggerPhonePushNotification({
          title: newArticlePayload.title || '',
          summary: newArticlePayload.summary || '',
          imageUrl: newArticlePayload.imageUrl || '',
          articleUrl
        });
      }

      // 4. Dispatch WhatsApp if enabled
      if (this.autoPostWhatsApp && this.waWebhookUrl) {
        this.triggerWhatsAppDispatch({
          id: docRef.id,
          title: newArticlePayload.title || '',
          summary: newArticlePayload.summary || '',
          imageUrl: newArticlePayload.imageUrl || '',
          url: articleUrl,
          category: newArticlePayload.category || 'Tech',
          customSnippet: generated.socialShareText
        });
      }

      // 4.1. Dispatch Facebook if enabled
      if (this.autoPostFacebook && this.fbWebhookUrl) {
        this.triggerFacebookDispatch({
          id: docRef.id,
          title: newArticlePayload.title || '',
          summary: newArticlePayload.summary || '',
          imageUrl: newArticlePayload.imageUrl || '',
          url: articleUrl,
          category: newArticlePayload.category || 'Tech',
          customSnippet: generated.socialShareText
        });
      }

      // 5. Dispatch Web Push to all browser subscribers
      this.triggerWebPushNotification({
        title: newArticlePayload.title || '',
        summary: newArticlePayload.summary || '',
        imageUrl: newArticlePayload.imageUrl || '',
        articleUrl,
        category: newArticlePayload.category || 'Tech'
      });

      this.deleteToast.set(`🚀 Published "${newArticlePayload.title}" successfully!`);
      setTimeout(() => this.deleteToast.set(null), 6000);
      this.selectedTrendingIds.set(this.selectedTrendingIds().filter(id => id !== item.id));
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('1-Click Publish Error: ' + (e.message || String(err)));
    } finally {
      this.isGeneratingStudioArticle.set(false);
    }
  }

  async batchGenerateAndPublishSelected() {
    const selected = this.selectedTrendingIds();
    if (selected.length === 0) return;

    if (!confirm(`Are you sure you want to Batch Generate and 1-Click Publish ${selected.length} articles?`)) return;

    this.isBatchGenerating.set(true);
    const itemsToProcess = this.trendingNews().filter(i => selected.includes(i.id));
    const total = itemsToProcess.length;
    let completed = 0;

    this.batchProgress.set({ current: 0, total, message: `Starting batch automation for ${total} items...` });

    try {
      for (const item of itemsToProcess) {
        this.batchProgress.set({ 
          current: completed, 
          total, 
          message: `[${completed + 1}/${total}] Generating & Publishing: ${item.title}...` 
        });

        try {
          const genRes = await fetch('/api/admin/generate-full-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'trending',
              topic: item.title,
              rawContent: item.description,
              url: item.url,
              imageUrl: item.imageUrl,
              tone: 'journalistic',
              length: 'standard',
              targetAudience: 'sri_lanka',
              includeLkr: true
            })
          });

          if (genRes.ok) {
            const generated = await genRes.json();
            const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            const newArticlePayload: Partial<Article> = {
              title: generated.sinhalaTitle || item.title,
              summary: generated.sinhalaDescription || item.description,
              content: generated.sinhalaFullContent || `<p>${generated.sinhalaDescription}</p>`,
              category: generated.suggestedCategory || 'Tech',
              imageUrl: generated.imageUrl || item.imageUrl || '',
              readTime: generated.readTime || '4 min read',
              date: dateStr,
              authorType: 'ai',
              createdAt: new Date(),
              views: 0
            };

            const docRef = await addDoc(collection(db, 'articles'), newArticlePayload);
            const articleUrl = this.getArticleUrl(docRef.id);

            // Trigger Phone Alert
            if (this.autoAlertPhone) {
              this.triggerPhonePushNotification({
                title: newArticlePayload.title || '',
                summary: newArticlePayload.summary || '',
                imageUrl: newArticlePayload.imageUrl || '',
                articleUrl
              });
            }

            // WhatsApp Webhook
            if (this.autoPostWhatsApp && this.waWebhookUrl) {
              this.triggerWhatsAppDispatch({
                id: docRef.id,
                title: newArticlePayload.title || '',
                summary: newArticlePayload.summary || '',
                imageUrl: newArticlePayload.imageUrl || '',
                url: articleUrl,
                category: newArticlePayload.category || 'Tech',
                customSnippet: generated.socialShareText
              });
            }

            // Facebook Webhook
            if (this.autoPostFacebook && this.fbWebhookUrl) {
              this.triggerFacebookDispatch({
                id: docRef.id,
                title: newArticlePayload.title || '',
                summary: newArticlePayload.summary || '',
                imageUrl: newArticlePayload.imageUrl || '',
                url: articleUrl,
                category: newArticlePayload.category || 'Tech',
                customSnippet: generated.socialShareText
              });
            }

            // Web Push notification to subscribers
            this.triggerWebPushNotification({
              title: newArticlePayload.title || '',
              summary: newArticlePayload.summary || '',
              imageUrl: newArticlePayload.imageUrl || '',
              articleUrl,
              category: newArticlePayload.category || 'Tech'
            });
          }
        } catch (itemErr) {
          console.error('Batch item error:', itemErr);
        }

        completed++;
        this.batchProgress.set({ 
          current: completed, 
          total, 
          message: `Completed ${completed} of ${total} articles.` 
        });
      }

      this.selectedTrendingIds.set([]);
      this.deleteToast.set(`🎉 Batch processing complete! ${completed} articles published to MyFeed.`);
      setTimeout(() => this.deleteToast.set(null), 8000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Batch Generation Error: ' + (e.message || String(err)));
    } finally {
      this.isBatchGenerating.set(false);
    }
  }

  async generateStudioTopicArticle() {
    if (!this.studioTopic.trim()) {
      alert('Please enter a topic headline.');
      return;
    }

    this.isGeneratingStudioArticle.set(true);
    try {
      const res = await fetch('/api/admin/generate-full-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'topic',
          topic: this.studioTopic,
          rawContent: this.studioContext,
          tone: this.studioTone,
          length: this.studioLength,
          targetAudience: this.studioAudience,
          includeLkr: this.studioIncludeLkr
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate article');
      }

      const generated = await res.json();
      this.generatedStudioArticle.set(generated);
      this.deleteToast.set('✨ Full Sinhala Article generated successfully!');
      setTimeout(() => this.deleteToast.set(null), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Generation error: ' + (e.message || String(err)));
    } finally {
      this.isGeneratingStudioArticle.set(false);
    }
  }

  async generateStudioUrlArticle() {
    if (!this.studioUrl.trim()) {
      alert('Please enter a valid News URL.');
      return;
    }

    this.isGeneratingStudioArticle.set(true);
    try {
      const res = await fetch('/api/admin/generate-full-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'url',
          url: this.studioUrl,
          tone: 'journalistic',
          length: 'standard',
          targetAudience: 'sri_lanka',
          includeLkr: true
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to transcompile URL into article');
      }

      const generated = await res.json();
      this.generatedStudioArticle.set(generated);
      this.studioTopic = generated.sinhalaTitle || '';
      this.autoStudioSubTab.set('topic');
      this.deleteToast.set('✨ Transcompiled URL into full Sinhala Article!');
      setTimeout(() => this.deleteToast.set(null), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('URL Extraction error: ' + (e.message || String(err)));
    } finally {
      this.isGeneratingStudioArticle.set(false);
    }
  }

  async regenerateStudioImage() {
    const art = this.generatedStudioArticle();
    if (!art) return;

    this.isGeneratingImage.set(true);
    try {
      const res = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: art.sinhalaTitle, prompt: art.visualPrompt })
      });

      if (!res.ok) throw new Error('Failed to generate image');
      const data = await res.json();
      if (data.imageUrl) {
        this.generatedStudioArticle.set({
          ...art,
          imageUrl: data.imageUrl
        });
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Image error: ' + (e.message || String(err)));
    } finally {
      this.isGeneratingImage.set(false);
    }
  }

  async publishStudioArticleDirectly() {
    const art = this.generatedStudioArticle();
    if (!art) return;

    this.isDirectPublishing.set(true);
    try {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newArticlePayload: Partial<Article> = {
        title: art.sinhalaTitle,
        summary: art.sinhalaDescription,
        content: art.sinhalaFullContent,
        category: art.suggestedCategory || 'Tech',
        imageUrl: art.imageUrl || '',
        readTime: art.readTime || '5 min read',
        date: dateStr,
        authorType: 'ai',
        createdAt: new Date(),
        views: 0
      };

      const docRef = await addDoc(collection(db, 'articles'), newArticlePayload);
      const articleUrl = this.getArticleUrl(docRef.id);

      // Trigger phone alert
      if (this.autoAlertPhone) {
        this.triggerPhonePushNotification({
          title: newArticlePayload.title || '',
          summary: newArticlePayload.summary || '',
          imageUrl: newArticlePayload.imageUrl || '',
          articleUrl
        });
      }

      // Trigger WhatsApp
      if (this.autoPostWhatsApp && this.waWebhookUrl) {
        this.triggerWhatsAppDispatch({
          id: docRef.id,
          title: newArticlePayload.title || '',
          summary: newArticlePayload.summary || '',
          imageUrl: newArticlePayload.imageUrl || '',
          url: articleUrl,
          category: newArticlePayload.category || 'Tech',
          customSnippet: art.socialShareText
        });
      }

      // Trigger Web Push to Browser Subscribers
      this.triggerWebPushNotification({
        title: newArticlePayload.title || '',
        summary: newArticlePayload.summary || '',
        imageUrl: newArticlePayload.imageUrl || '',
        articleUrl,
        category: newArticlePayload.category || 'Tech'
      });

      this.deleteToast.set(`🚀 "${newArticlePayload.title}" Published Successfully!`);
      setTimeout(() => this.deleteToast.set(null), 6000);
      this.generatedStudioArticle.set(null);
      this.studioTopic = '';
      this.studioContext = '';
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Publish Error: ' + (e.message || String(err)));
    } finally {
      this.isDirectPublishing.set(false);
    }
  }

  loadStudioArticleIntoMainEditor() {
    const art = this.generatedStudioArticle();
    if (!art) return;

    this.formTitle = art.sinhalaTitle || '';
    this.formSummary = art.sinhalaDescription || '';
    this.formContent = art.sinhalaFullContent || '';
    this.formCategory = art.suggestedCategory || 'Tech';
    this.formImageUrl = art.imageUrl || '';
    this.formReadTime = art.readTime || '4 min read';
    this.formAuthorType = 'ai';
    this.editingId.set(null);
    this.isAdding.set(true);
    this.activeTab.set('articles');
  }

  async runContentPolish(action: string) {
    if (!this.polishInput.trim()) {
      alert('Please enter or paste content to polish.');
      return;
    }

    this.isPolishingContent.set(true);
    try {
      const res = await fetch('/api/admin/polish-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: this.polishInput,
          title: this.polishTitle,
          action
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to polish content');
      }

      const data = await res.json();
      this.polishedContentResult.set(data);
      this.deleteToast.set('✨ Content Polished & Formatted!');
      setTimeout(() => this.deleteToast.set(null), 4000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Polish error: ' + (e.message || String(err)));
    } finally {
      this.isPolishingContent.set(false);
    }
  }

  applyPolishedToEditor() {
    const pol = this.polishedContentResult();
    if (!pol) return;

    if (pol.polishedTitle) this.formTitle = pol.polishedTitle;
    if (pol.polishedSummary) this.formSummary = pol.polishedSummary;
    if (pol.polishedContent) this.formContent = pol.polishedContent;
    if (pol.suggestedCategory) this.formCategory = pol.suggestedCategory;

    this.isAdding.set(true);
    this.activeTab.set('articles');
  }

  copyToClipboard(text: string, successMessage = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
      this.deleteToast.set(successMessage);
      setTimeout(() => this.deleteToast.set(null), 3000);
    }).catch(() => {
      alert('Copy failed');
    });
  }

  // ==========================================
  // AUTO-PILOT 24/7 ENGINE METHODS
  // ==========================================

  addScheduledTime(timeStr?: string) {
    const t = (timeStr || this.autoPilotNewTimeInput).trim();
    if (!/^\d{1,2}:\d{2}$/.test(t)) {
      alert('කරුණාකර නිවැරදි වේලාවක් (උදා: 08:30) ඇතුළත් කරන්න.');
      return;
    }
    const formatted = t.length === 4 ? `0${t}` : t;
    if (!this.autoPilotScheduledDailyTimes.includes(formatted)) {
      this.autoPilotScheduledDailyTimes = [...this.autoPilotScheduledDailyTimes, formatted].sort();
    }
  }

  removeScheduledTime(timeStr: string) {
    this.autoPilotScheduledDailyTimes = this.autoPilotScheduledDailyTimes.filter(t => t !== timeStr);
    if (this.autoPilotScheduledDailyTimes.length === 0) {
      this.autoPilotScheduledDailyTimes = ['08:00', '12:00', '16:00', '20:00'];
    }
  }

  applySchedulePreset(preset: 'morning_evening' | 'four_times' | 'six_times' | 'tech_rush' | 'fourteen_times') {
    if (preset === 'fourteen_times') {
      this.autoPilotScheduledDailyTimes = [
        '00:17', '01:43', '03:08', '05:52', '07:26', '09:41', '11:13',
        '12:58', '14:34', '16:19', '18:47', '20:22', '22:36', '23:51'
      ];
    } else if (preset === 'morning_evening') {
      this.autoPilotScheduledDailyTimes = ['08:30', '19:30'];
    } else if (preset === 'four_times') {
      this.autoPilotScheduledDailyTimes = ['08:00', '12:00', '16:00', '20:00'];
    } else if (preset === 'six_times') {
      this.autoPilotScheduledDailyTimes = ['07:00', '10:30', '14:00', '17:30', '20:30', '23:00'];
    } else if (preset === 'tech_rush') {
      this.autoPilotScheduledDailyTimes = ['09:00', '13:00', '18:00', '21:30'];
    }
  }

  formatTimeDisplay(timeStr: string): string {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m.toString().padStart(2, '0');
    return `${displayH}:${displayM} ${ampm}`;
  }

  async loadAutoPilotStatus() {
    this.isLoadingAutoPilot.set(true);
    try {
      if (typeof window !== 'undefined') {
        this.cronWebhookUrl = `${window.location.origin}/api/cron/sync-news`;
      }
      const res = await fetch('/api/admin/autopilot/status');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          this.autoPilotEnabled = data.config.enabled ?? true;
          this.autoPilotScheduleMode = data.config.scheduleMode || 'interval';
          this.autoPilotIntervalMinutes = data.config.intervalMinutes ?? 60;
          if (Array.isArray(data.config.scheduledDailyTimes)) {
            this.autoPilotScheduledDailyTimes = data.config.scheduledDailyTimes;
          }
          this.autoPilotAutoPublish = data.config.autoPublish ?? true;
          this.autoPilotNotifyPhone = data.config.notifyPhone ?? true;
          this.autoPilotPostWhatsApp = data.config.postWhatsApp ?? true;
          this.autoPilotPostFacebook = data.config.postFacebook ?? true;
          this.autoPilotMaxArticles = data.config.maxArticlesPerRun ?? 2;
        }
        if (data.logs) {
          this.autoPilotLogs.set(data.logs);
        }
        if (data.nextRunTime) {
          this.autoPilotNextTargetTime = data.nextRunTime;
          this.updateAutoPilotCountdown();
        }
      }
    } catch (err) {
      console.warn('Failed to fetch auto-pilot status:', err);
    } finally {
      this.isLoadingAutoPilot.set(false);
    }
  }

  async saveAutoPilotConfig() {
    this.isSavingAutoPilotConfig.set(true);
    try {
      const res = await fetch('/api/admin/autopilot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: this.autoPilotEnabled,
          scheduleMode: this.autoPilotScheduleMode,
          intervalMinutes: Number(this.autoPilotIntervalMinutes),
          scheduledDailyTimes: this.autoPilotScheduledDailyTimes,
          autoPublish: this.autoPilotAutoPublish,
          notifyPhone: this.autoPilotNotifyPhone,
          postWhatsApp: this.autoPilotPostWhatsApp,
          postFacebook: this.autoPilotPostFacebook,
          phoneTopic: this.phoneTopic,
          waWebhookUrl: this.waWebhookUrl,
          fbWebhookUrl: this.fbWebhookUrl,
          maxArticlesPerRun: Number(this.autoPilotMaxArticles)
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save auto-pilot config');
      }

      const data = await res.json();
      if (data.nextRunTime) {
        this.autoPilotNextTargetTime = data.nextRunTime;
        this.updateAutoPilotCountdown();
      }

      this.deleteToast.set('⚙️ Auto-Pilot Settings Saved Successfully!');
      setTimeout(() => this.deleteToast.set(null), 4000);
      await this.loadAutoPilotStatus();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Save Error: ' + (e.message || String(err)));
    } finally {
      this.isSavingAutoPilotConfig.set(false);
    }
  }

  async triggerAutoPilotNow() {
    this.isTriggeringAutoPilot.set(true);
    try {
      const res = await fetch('/api/admin/autopilot/sync-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Auto-pilot sync failed');
      }

      if (data.count > 0) {
        this.deleteToast.set(`🚀 Synced & Published ${data.count} New Articles on Auto-Pilot!`);
        this.articleService.loadArticles(); // Refresh article list in dashboard
      } else {
        this.deleteToast.set(`ℹ️ Feeds Scanned: All current stories are already published & synced.`);
      }
      setTimeout(() => this.deleteToast.set(null), 5000);
      await this.loadAutoPilotStatus();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert('Auto-Pilot Error: ' + (e.message || String(err)));
    } finally {
      this.isTriggeringAutoPilot.set(false);
    }
  }

  private startAutoPilotCountdown() {
    if (typeof window === 'undefined') return;
    if (this.autoPilotCountdownInterval) {
      clearInterval(this.autoPilotCountdownInterval);
    }
    this.updateAutoPilotCountdown();
    this.autoPilotCountdownInterval = setInterval(() => {
      this.updateAutoPilotCountdown();
    }, 1000);
  }

  private updateAutoPilotCountdown() {
    if (!this.autoPilotEnabled) {
      this.autoPilotCountdown.set('PAUSED');
      return;
    }

    const now = Date.now();
    const diff = Math.max(0, this.autoPilotNextTargetTime - now);

    if (diff === 0) {
      this.autoPilotCountdown.set('Syncing Now...');
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.autoPilotCountdown.set(formatted);
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================
  readonly usersList = signal<UserProfile[]>([]);
  readonly loadingUsers = signal<boolean>(false);

  setActiveTab(tabName: 'articles' | 'auto-studio' | 'audio' | 'subscribers' | 'notify' | 'whatsapp' | 'facebook' | 'deploy' | 'ads' | 'analytics' | 'users') {
    this.activeTab.set(tabName);
    if (tabName === 'users') {
      this.fetchUsers();
    } else if (tabName === 'audio') {
      this.loadAudioPipelineStatus();
    }
  }

  // ==========================================
  // AUDIO 15-MINUTE MORNING COMMUTE METHODS
  // ==========================================
  addChapterRow() {
    const lastChapter = this.audioChapters[this.audioChapters.length - 1];
    const lastTime = lastChapter ? ((lastChapter.time ?? lastChapter.seconds ?? 0) + 120) : 0;
    this.audioChapters.push({
      time: Math.min(lastTime, 900),
      title: 'New Story Chapter'
    });
  }

  removeChapterRow(index: number) {
    if (this.audioChapters.length > 1) {
      this.audioChapters.splice(index, 1);
    }
  }

  autoPopulateChaptersFromArticles() {
    const articles = this.articleService.articles().slice(0, 6);
    if (articles.length === 0) return;

    const chapters: ChapterMark[] = [
      { time: 0, title: '🌅 Commute Opening & Highlights Overview' }
    ];

    // Spread timestamps across ~15 minutes (900 seconds)
    const step = Math.floor(840 / Math.max(articles.length, 1));
    articles.forEach((art, idx) => {
      chapters.push({
        time: 60 + (idx * step),
        title: art.title.length > 55 ? art.title.substring(0, 52) + '...' : art.title,
        articleId: art.id
      });
    });

    chapters.push({
      time: 870,
      title: '📊 Market Brief & Commute Sign-off'
    });

    this.audioChapters = chapters;
  }

  async saveMorningEdition() {
    if (!this.audioEditionTitle || !this.audioUrlInput) return;
    this.isSavingAudioEdition.set(true);

    try {
      // Calculate duration seconds from "MM:SS"
      let durationSecs = 915; // default ~15 mins
      if (this.audioDurationFormatted.includes(':')) {
        const parts = this.audioDurationFormatted.split(':');
        const mins = parseInt(parts[0], 10) || 0;
        const secs = parseInt(parts[1], 10) || 0;
        durationSecs = (mins * 60) + secs;
      }

      const edition: Omit<MorningEdition, 'id'> = {
        title: this.audioEditionTitle,
        timeWindowText: this.audioTimeWindowText,
        audioUrl: this.audioUrlInput,
        durationSeconds: durationSecs,
        durationFormatted: this.audioDurationFormatted || '15:15',
        narratorName: this.audioNarrator || 'Kaveen Sandeepa & MyFeed Audio Studio',
        summarySinhala: this.audioSummarySinhala || 'පසුගිය පැය 24 පුවත් විනාඩි 15ක විග්‍රහය.',
        summary: this.audioSummarySinhala || 'පසුගිය පැය 24 පුවත් විනාඩි 15ක විග්‍රහය.',
        date: new Date().toISOString().split('T')[0],
        listenCount: 0,
        isFeatured: this.audioIsFeatured,
        chapters: this.audioChapters.filter(c => c.title.trim().length > 0)
      };

      await this.audioService.saveEdition(edition);
      alert('Morning Audio Edition published successfully!');
    } catch (err) {
      console.error('Error saving audio edition:', err);
      alert('Failed to publish audio edition.');
    } finally {
      this.isSavingAudioEdition.set(false);
    }
  }

  async deleteAudioEdition(id: string) {
    if (confirm('මෙම Morning Audio Edition එක delete කිරීමට අවශ්‍යද?')) {
      await this.audioService.deleteEdition(id);
    }
  }

  // ==========================================
  // AUTOMATED AI AUDIO PIPELINE (3:30 AM -> 4:00 AM) METHODS
  // ==========================================
  async loadAudioPipelineStatus() {
    this.loadingAudioPipeline.set(true);
    try {
      const res = await fetch('/api/admin/audio-pipeline/status');
      if (res.ok) {
        const data = await res.json();
        this.audioPipelineStatus.set(data);
      }
    } catch (e) {
      console.warn('Failed to load audio pipeline status:', e);
    } finally {
      this.loadingAudioPipeline.set(false);
    }
  }

  startAudioPipelineCountdown() {
    if (typeof window === 'undefined') return;
    if (this.audioPipelineCountdownInterval) {
      clearInterval(this.audioPipelineCountdownInterval);
    }
    this.updateAudioPipelineCountdown();
    this.audioPipelineCountdownInterval = setInterval(() => {
      this.updateAudioPipelineCountdown();
    }, 1000);
  }

  private updateAudioPipelineCountdown() {
    const status = this.audioPipelineStatus();
    if (!status || !status.enabled) {
      this.audioPipelineNextGenCountdown.set('PAUSED');
      this.audioPipelineNextPubCountdown.set('PAUSED');
      return;
    }

    const now = new Date();
    // Calculate Colombo time (UTC + 5:30)
    const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const colomboNow = new Date(nowUtc + (5.5 * 3600000));
    
    // Parse 03:30 target
    const [genH, genM] = (status.generationTimeColombo || '03:30').split(':').map(Number);
    const targetGen = new Date(colomboNow);
    targetGen.setHours(genH, genM, 0, 0);
    if (targetGen.getTime() <= colomboNow.getTime()) {
      targetGen.setDate(targetGen.getDate() + 1);
    }
    const genDiff = Math.max(0, targetGen.getTime() - colomboNow.getTime());
    const genMins = Math.floor(genDiff / 60000);
    const genSecs = Math.floor((genDiff % 60000) / 1000);
    const genHrs = Math.floor(genMins / 60);
    const remGenMins = genMins % 60;
    this.audioPipelineNextGenCountdown.set(`${genHrs.toString().padStart(2, '0')}h ${remGenMins.toString().padStart(2, '0')}m ${genSecs.toString().padStart(2, '0')}s`);

    // Parse 04:00 target
    const [pubH, pubM] = (status.publishTimeColombo || '04:00').split(':').map(Number);
    const targetPub = new Date(colomboNow);
    targetPub.setHours(pubH, pubM, 0, 0);
    if (targetPub.getTime() <= colomboNow.getTime()) {
      targetPub.setDate(targetPub.getDate() + 1);
    }
    const pubDiff = Math.max(0, targetPub.getTime() - colomboNow.getTime());
    const pubMins = Math.floor(pubDiff / 60000);
    const pubSecs = Math.floor((pubDiff % 60000) / 1000);
    const pubHrs = Math.floor(pubMins / 60);
    const remPubMins = pubMins % 60;
    this.audioPipelineNextPubCountdown.set(`${pubHrs.toString().padStart(2, '0')}h ${remPubMins.toString().padStart(2, '0')}m ${pubSecs.toString().padStart(2, '0')}s`);
  }

  async saveAudioPipelineConfig(configUpdates: Record<string, unknown>) {
    this.isSavingAudioConfig.set(true);
    try {
      const current = this.audioPipelineStatus()?.config || {};
      const payload = { ...current, ...configUpdates };
      const res = await fetch('/api/admin/audio-pipeline/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await this.loadAudioPipelineStatus();
        this.audioPipelineToast.set('✅ Audio Pipeline settings updated successfully!');
        setTimeout(() => this.audioPipelineToast.set(null), 4000);
      }
    } catch (e) {
      console.error('Error saving audio pipeline config:', e);
      alert('Failed to save audio pipeline config');
    } finally {
      this.isSavingAudioConfig.set(false);
    }
  }

  async triggerAudioDraftGenerationNow() {
    this.isGeneratingAudioDraft.set(true);
    try {
      const res = await fetch('/api/admin/audio-pipeline/generate-now', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        this.audioPipelineToast.set('🎙️ 3:30 AM Commute Draft synthesized successfully!');
        await this.loadAudioPipelineStatus();
        if (data.draft) {
          this.applyDraftToForm(data.draft);
        }
      } else {
        alert('Generation failed: ' + (data.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Error triggering audio generation: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      this.isGeneratingAudioDraft.set(false);
      setTimeout(() => this.audioPipelineToast.set(null), 6000);
    }
  }

  async triggerAudioPublishNow() {
    this.isPublishingAudioEdition.set(true);
    try {
      const res = await fetch('/api/admin/audio-pipeline/publish-now', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        this.audioPipelineToast.set('🚀 4:00 AM Morning Edition Published to App & Web Push Dispatched!');
        await this.loadAudioPipelineStatus();
        await this.audioService.loadEditions();
      } else {
        alert('Publish failed: ' + (data.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Error publishing audio edition: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      this.isPublishingAudioEdition.set(false);
      setTimeout(() => this.audioPipelineToast.set(null), 6000);
    }
  }

  applyDraftToForm(customDraft?: any) {
    const draft = customDraft || this.audioPipelineStatus()?.draftSummary;
    if (!draft) return;
    if (draft.title) this.audioEditionTitle = draft.title;
    if (draft.windowStart && draft.windowEnd) this.audioTimeWindowText = `${draft.windowStart} – ${draft.windowEnd}`;
    if (draft.audioUrl) {
      this.audioUrlInput = draft.audioUrl;
      if (draft.audioUrl.startsWith('/api/audio/file/')) {
        this.ttsPreviewAudioUrl.set(draft.audioUrl);
      }
    }
    if (draft.durationFormatted) this.audioDurationFormatted = draft.durationFormatted;
    if (draft.narratorName) this.audioNarrator = draft.narratorName;
    if (draft.summarySinhala) this.audioSummarySinhala = draft.summarySinhala;
    if (draft.fullNarrationScriptSinhala) this.audioFullScriptSinhala = draft.fullNarrationScriptSinhala;
    if (Array.isArray(draft.chapters)) {
      this.audioChapters = draft.chapters.map((c: any) => ({
        time: typeof c.seconds === 'number' ? c.seconds : (c.time || 0),
        title: c.title || 'Story Chapter',
        articleId: c.articleId
      }));
    }
    this.audioPipelineToast.set('📥 Draft loaded into manual edition editor!');
    setTimeout(() => this.audioPipelineToast.set(null), 4000);
  }

  async generateAiVoiceOver(customScript?: string) {
    const textToSynthesize = (customScript || this.audioFullScriptSinhala || this.audioSummarySinhala || this.audioPipelineStatus()?.draftSummary?.fullNarrationScriptSinhala || this.audioPipelineStatus()?.draftSummary?.summarySinhala || this.audioEditionTitle).trim();

    if (!textToSynthesize) {
      alert('කරුණාකර Voice Over එකක් සෑදීමට Summary එකක් හෝ Script එකක් ඇතුළත් කරන්න.');
      return;
    }

    this.isSynthesizingVoice.set(true);
    this.audioPipelineToast.set(`🎙️ Synthesizing Studio Voice Over with Gemini (${this.selectedTtsVoice})...`);

    try {
      const res = await fetch('/api/audio/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: textToSynthesize,
          title: this.audioEditionTitle || 'MyFeed Morning Tech Wrap',
          voiceName: this.selectedTtsVoice
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.audioUrl) {
        this.audioUrlInput = data.audioUrl;
        if (data.durationFormatted) {
          this.audioDurationFormatted = data.durationFormatted;
        }
        this.ttsPreviewAudioUrl.set(data.audioUrl);
        this.audioPipelineToast.set('✨ Gemini AI Voice Over Generated & Attached Successfully!');
        await this.loadAudioPipelineStatus();
      } else {
        alert('Voice synthesis failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error generating voice: ' + (err?.message || String(err)));
    } finally {
      this.isSynthesizingVoice.set(false);
      setTimeout(() => this.audioPipelineToast.set(null), 5000);
    }
  }

  async fetchUsers() {
    this.loadingUsers.set(true);
    try {
      // Fetch all users
      const snapshot = await getDocs(collection(db, 'users'));
      const users: UserProfile[] = [];
      snapshot.forEach(d => {
        users.push(d.data() as UserProfile);
      });
      
      // Sort manually by lastSeen (descending)
      users.sort((a, b) => {
        const timeA = (a.lastSeen as { seconds?: number })?.seconds || 0;
        const timeB = (b.lastSeen as { seconds?: number })?.seconds || 0;
        return timeB - timeA;
      });
      
      this.usersList.set(users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      this.loadingUsers.set(false);
    }
  }

  async toggleBanStatus(user: UserProfile) {
    if (user.role === 'admin') {
      alert('Cannot ban an administrator.');
      return;
    }
    
    try {
      const newStatus = !user.banned;
      await updateDoc(doc(db, 'users', user.uid), { banned: newStatus });
      
      const currentList = this.usersList();
      const updatedList = currentList.map(u => 
        u.uid === user.uid ? { ...u, banned: newStatus } : u
      );
      this.usersList.set(updatedList);
    } catch (err) {
      console.error('Error toggling ban status', err);
      alert('Failed to update user ban status.');
    }
  }

  formatDate(timestamp: unknown) {
    if (!timestamp) return 'N/A';
    try {
      const ts = timestamp as { toDate?: () => Date, seconds?: number };
      if (ts.toDate) return ts.toDate().toLocaleString('si-LK');
      if (timestamp instanceof Date) return timestamp.toLocaleString('si-LK');
      if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString('si-LK');
    } catch {
      // ignore
    }
    return 'N/A';
  }
}
