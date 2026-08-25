import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ArticleService, Article, getCuratedTopicImages} from './article.service';
import {SubscriberService} from './subscriber.service';
import {AdManagerService, Ad} from './ad-manager.service';
import {AnalyticsService} from './analytics.service';
import {collection, addDoc, serverTimestamp, doc, setDoc, getDoc} from 'firebase/firestore';
import {db, auth} from './firebase';
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from 'firebase/auth';

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
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 min-h-[calc(100vh-200px)]">
      @if (loading()) {
        <div class="flex justify-center items-center py-32 animate-pulse">
          <div class="w-12 h-12 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin"></div>
        </div>
      } @else if (!user()) {
        <div class="max-w-md mx-auto text-center mt-20">
          <h1 class="text-4xl font-black mb-6">Admin Login</h1>
          <p class="text-gray-500 mb-8">Sign in with your Google account to manage articles.</p>
          <button (click)="login()" class="px-8 py-4 bg-[#1d1d1f] text-white rounded-full font-bold tracking-widest uppercase hover:bg-black transition-all shadow-xl active:scale-95 w-full flex items-center justify-center gap-3">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      } @else {
        <header class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 class="text-4xl font-black text-[#1d1d1f] mb-2">Dashboard</h1>
            <p class="text-gray-500 font-medium">Logged in as {{ user()?.email }}</p>
          </div>
          <div class="flex flex-wrap justify-center gap-4">
            @if (activeTab() === 'articles' || activeTab() === 'ads') {
              <button (click)="isAdding.set(true)" class="px-6 py-3 bg-blue-600 text-white rounded-full font-bold tracking-widest uppercase hover:bg-blue-700 transition-all flex items-center gap-2">
                <mat-icon>add</mat-icon> New Post
              </button>
            }
            <button (click)="logout()" class="px-6 py-3 bg-gray-200 text-[#1d1d1f] rounded-full font-bold tracking-widest uppercase hover:bg-gray-300 transition-all">
              Logout
            </button>
          </div>
        </header>

        <!-- Live Dashboard Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -top-4 -right-4 p-6 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <mat-icon style="font-size: 100px; width: 100px; height: 100px;">group</mat-icon>
            </div>
            <h3 class="text-blue-100 font-bold uppercase tracking-wider mb-2 relative z-10 flex items-center gap-2 text-sm md:text-base">
              <span class="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
              Live Today's Visitors
            </h3>
            <div class="text-5xl md:text-6xl font-black relative z-10 mt-2 mb-1 tracking-tighter">{{ analyticsService.todayLiveVisitors() }}</div>
            <p class="text-sm text-blue-200 relative z-10 font-medium">Unique devices today</p>
          </div>
          
          <div class="bg-[#1d1d1f] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -top-4 -right-4 p-6 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <mat-icon style="font-size: 100px; width: 100px; height: 100px;">article</mat-icon>
            </div>
            <h3 class="text-gray-400 font-bold uppercase tracking-wider mb-2 relative z-10 text-sm md:text-base">Total Articles</h3>
            <div class="text-5xl md:text-6xl font-black relative z-10 mt-2 mb-1 tracking-tighter">{{ articleService.articles().length }}</div>
            <p class="text-sm text-gray-400 relative z-10 font-medium">Published on site</p>
          </div>
          
          <div class="bg-gray-100 rounded-3xl p-6 md:p-8 text-[#1d1d1f] shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div class="absolute -top-4 -right-4 p-6 opacity-5 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <mat-icon style="font-size: 100px; width: 100px; height: 100px;">mark_email_read</mat-icon>
            </div>
            <h3 class="text-gray-500 font-bold uppercase tracking-wider mb-2 relative z-10 text-sm md:text-base">Total Subscribers</h3>
            <div class="text-5xl md:text-6xl font-black relative z-10 mt-2 mb-1 tracking-tighter">{{ subscriberService.subscribers().length }}</div>
            <p class="text-sm text-gray-500 relative z-10 font-medium">Email alerts active</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-gray-200 mb-8 gap-4 md:gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide no-scrollbar pb-1" style="-ms-overflow-style: none; scrollbar-width: none;">
          <button 
            (click)="activeTab.set('articles')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-blue-600]="activeTab() === 'articles'"
            [class.text-gray-400]="activeTab() !== 'articles'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">article</mat-icon>
            <span>Articles ({{ articleService.articles().length }})</span>
            @if (activeTab() === 'articles') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>

          <button 
            (click)="activeTab.set('auto-studio')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-indigo-600]="activeTab() === 'auto-studio'"
            [class.text-gray-400]="activeTab() !== 'auto-studio'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-indigo-600">auto_awesome</mat-icon>
            <span>✨ ස්වයංක්‍රීය AI Studio</span>
            @if (activeTab() === 'auto-studio') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>
            }
          </button>

          <button 
            (click)="activeTab.set('subscribers')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-blue-600]="activeTab() === 'subscribers'"
            [class.text-gray-400]="activeTab() !== 'subscribers'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mark_email_read</mat-icon>
            <span>Subscribers</span>
            @if (activeTab() === 'subscribers') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>

          <button 
            (click)="activeTab.set('ads')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-blue-600]="activeTab() === 'ads'"
            [class.text-gray-400]="activeTab() !== 'ads'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">campaign</mat-icon>
            <span>Ads</span>
            @if (activeTab() === 'ads') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>

          <button 
            (click)="activeTab.set('notify')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-blue-600]="activeTab() === 'notify'"
            [class.text-gray-400]="activeTab() !== 'notify'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">notifications_active</mat-icon>
            <span>Notify</span>
            @if (activeTab() === 'notify') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>

          <button 
            (click)="activeTab.set('whatsapp')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-emerald-600]="activeTab() === 'whatsapp'"
            [class.text-gray-400]="activeTab() !== 'whatsapp'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-emerald-500">chat</mat-icon>
            <span>WhatsApp</span>
            @if (activeTab() === 'whatsapp') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></div>
            }
          </button>

          <button 
            (click)="activeTab.set('deploy')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-blue-600]="activeTab() === 'deploy'"
            [class.text-gray-400]="activeTab() !== 'deploy'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">rocket_launch</mat-icon>
            <span>Deploy</span>
            @if (activeTab() === 'deploy') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          
          <button 
            (click)="activeTab.set('analytics')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5 cursor-pointer"
            [class.text-blue-600]="activeTab() === 'analytics'"
            [class.text-gray-400]="activeTab() !== 'analytics'">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">insights</mat-icon>
            <span>Analytics</span>
            @if (activeTab() === 'analytics') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
        </div>

        @if (activeTab() === 'articles') {

        @if (isAdding()) {
          <div class="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-black/5 mb-16">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 class="text-2xl font-black">{{ editingId() ? 'Edit' : 'Create' }} Article</h2>
            </div>

            <!-- AI Long Article Generator Box -->
            @if (!editingId()) {
              <div class="p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100 mb-8">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon class="text-blue-600" style="font-size: 20px; width: 20px; height: 20px;">auto_awesome</mat-icon>
                  <h3 class="font-bold text-xs uppercase tracking-wider text-blue-900">AI Long Article Assistant (සිංහලෙන් දීර්ඝ ලිපි නිර්මාණය)</h3>
                </div>
                <p class="text-xs text-blue-700/70 mb-4">ඔබට අවශ්‍ය පුවතේ මාතෘකාව හෝ පුවත් ලින්ක් එකක් (News URL) ලබා දී AI මඟින් පූර්ණ සිංහල ලිපියක් සකසා ගන්න.</p>
                
                <div class="flex flex-col gap-3">
                  <!-- From Topic -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="text" [(ngModel)]="aiTopicPrompt" [ngModelOptions]="{standalone: true}" placeholder="මාතෘකාවක් දෙන්න (e.g., Apple Vision Pro 2)" class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                    <button type="button" (click)="generateWithAI()" [disabled]="isGeneratingAi()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50">
                      @if (isGeneratingAi()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bolt</mat-icon>
                        <span>From Topic</span>
                      }
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-4 my-1">
                    <div class="h-px bg-blue-200/60 flex-1"></div>
                    <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">OR</span>
                    <div class="h-px bg-blue-200/60 flex-1"></div>
                  </div>

                  <!-- From URL -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" [(ngModel)]="aiUrlPrompt" [ngModelOptions]="{standalone: true}" placeholder="පුවත් ලින්ක් එක මෙතනට දාන්න (e.g., https://news.google.com/...)" class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                    <button type="button" (click)="generateFromUrl()" [disabled]="isGeneratingAi()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50">
                      @if (isGeneratingAi()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">link</mat-icon>
                        <span>From URL</span>
                      }
                    </button>
                  </div>
                </div>
              </div>
            }

            <form (ngSubmit)="saveArticle()" class="flex flex-col gap-6">
              
              <div>
                <label for="formTitle" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Title</label>
                <input type="text" id="formTitle" [(ngModel)]="formTitle" name="title" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans text-lg" placeholder="Article Title (Sinhala/English)">
              </div>
              
              <div>
                <label for="formSummary" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Summary</label>
                <textarea id="formSummary" [(ngModel)]="formSummary" name="summary" required rows="2" class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-serif text-lg" placeholder="Short summary"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label for="formCategory" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Category</label>
                  <select id="formCategory" [(ngModel)]="formCategory" name="category" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans appearance-none bg-white">
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
                  <label for="formAuthorType" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Attribution (Author)</label>
                  <select id="formAuthorType" [(ngModel)]="formAuthorType" name="authorType" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans appearance-none bg-white">
                    <option value="ai">MyFeed AI Desk (AI-Assisted Story)</option>
                    <option value="human">Written by Kaveen Sandeepa (Editor-in-Chief)</option>
                  </select>
                </div>
                <div>
                  <label for="formReadTime" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Read Time</label>
                  <input type="text" id="formReadTime" [(ngModel)]="formReadTime" name="readTime" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans" placeholder="e.g. 5 min">
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
                  <input type="checkbox" id="autoAlertPhone" [(ngModel)]="autoAlertPhone" name="autoAlertPhone" class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600">
                  <label for="autoAlertPhone" class="text-sm font-bold text-purple-700 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">notifications_active</mat-icon>
                    Alert My Phone
                  </label>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="notifySubscribers" [(ngModel)]="notifySubscribers" name="notifySubscribers" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
                  <label for="notifySubscribers" class="text-sm font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Notify subscribers (Email)</label>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="autoPostWhatsApp" [(ngModel)]="autoPostWhatsApp" name="autoPostWhatsApp" class="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600">
                  <label for="autoPostWhatsApp" class="text-sm font-bold text-emerald-700 uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">chat</mat-icon>
                    Auto-Post to WhatsApp Channel
                  </label>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-4 mt-4">
                <button type="submit" class="px-8 py-4 bg-[#1d1d1f] text-white rounded-full font-bold tracking-widest uppercase hover:bg-black transition-all shadow-lg w-full md:w-auto">
                  {{ editingId() ? 'Update' : 'Publish' }} Post
                </button>
                <button type="button" (click)="cancelEdit()" class="px-8 py-4 bg-gray-100 text-gray-600 rounded-full font-bold tracking-widest uppercase hover:bg-gray-200 transition-all w-full md:w-auto">
                  Cancel
                </button>
              </div>

            </form>
          </div>
        }

        <!-- ARTICLES MANAGEMENT SECTION -->
        <div class="space-y-6">
          <!-- Top Search & Filter Bar -->
          <div class="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <!-- Search input -->
            <div class="relative flex-1">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</mat-icon>
              <input 
                type="text" 
                [(ngModel)]="searchArticleQuery" 
                placeholder="ලිපි සොයන්න (Search by title, summary, or category)..." 
                class="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none text-sm font-medium transition-all"
              />
              @if (searchArticleQuery()) {
                <button (click)="searchArticleQuery.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                </button>
              }
            </div>

            <!-- Category Filter Tabs / Selector -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span class="text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-1 hidden sm:inline">Category:</span>
              <select 
                [(ngModel)]="filterCategory" 
                class="px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                <option value="ALL">All Categories (සියලු වර්ග)</option>
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
                  class="px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer shrink-0 animate-fade-in">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete_sweep</mat-icon>
                  <span>Delete Selected ({{ selectedArticleIds().length }})</span>
                </button>
              }
            </div>
          </div>

          <!-- Articles Table Card -->
          <div class="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
            <!-- Header bar with counter & quick actions -->
            <div class="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 class="text-xl font-bold text-[#1d1d1f] flex items-center gap-2">
                  <span>පුවත් කළමනාකරණය (Published News Articles)</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black">{{ filteredArticles().length }}</span>
                </h2>
                <p class="text-xs text-gray-500 mt-1">
                  ඔබට අවශ්‍ය පුවත පහසුවෙන්ම Edit කිරීමට හෝ Delete කිරීමට මෙතැනින් හැක.
                </p>
              </div>

              <div class="flex items-center gap-2">
                @if (selectedArticleIds().length > 0) {
                  <button 
                    (click)="clearSelection()" 
                    class="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition-all cursor-pointer">
                    Clear Selection ({{ selectedArticleIds().length }})
                  </button>
                }
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                    <th class="p-5 w-12 text-center">
                      <input 
                        type="checkbox" 
                        [checked]="isAllSelected()" 
                        (change)="toggleSelectAll()" 
                        class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th class="p-5 font-bold">News Article</th>
                    <th class="p-5 font-bold">Category</th>
                    <th class="p-5 font-bold">Date</th>
                    <th class="p-5 font-bold text-center">Views</th>
                    <th class="p-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredArticles().length === 0) {
                    <tr>
                      <td colspan="6" class="p-12 text-center text-gray-400">
                        <mat-icon style="font-size: 36px; width: 36px; height: 36px;" class="mb-2 opacity-50">search_off</mat-icon>
                        <p class="font-bold text-sm">ලිපි කිසිවක් හමු නොවීය (No matching articles found)</p>
                        <p class="text-xs text-gray-400 mt-1">කරුණාකර වෙනත් නමකින් සොයන්න හෝ Filter වෙනස් කරන්න.</p>
                      </td>
                    </tr>
                  } @else {
                    @for (article of filteredArticles(); track article.id) {
                      <tr 
                        class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        [class.bg-blue-50/40]="isArticleSelected(article.id)">
                        <!-- Checkbox -->
                        <td class="p-5 text-center">
                          <input 
                            type="checkbox" 
                            [checked]="isArticleSelected(article.id)" 
                            (change)="toggleSelectArticle(article.id)" 
                            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                          />
                        </td>

                        <!-- Title + Thumbnail -->
                        <td class="p-5">
                          <div class="flex items-center gap-3.5 max-w-md">
                            @if (article.imageUrl) {
                              <img 
                                [src]="article.imageUrl" 
                                [alt]="article.title" 
                                class="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/5 bg-gray-100" 
                                referrerpolicy="no-referrer"
                              />
                            }
                            <div>
                              <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="font-bold text-sm text-[#1d1d1f] hover:text-blue-600 transition-colors line-clamp-2">
                                {{ article.title }}
                              </a>
                              <p class="text-xs text-gray-400 line-clamp-1 mt-0.5">{{ article.summary }}</p>
                            </div>
                          </div>
                        </td>

                        <!-- Category -->
                        <td class="p-5">
                          <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                            {{ article.category }}
                          </span>
                        </td>

                        <!-- Date -->
                        <td class="p-5 text-xs text-gray-500 whitespace-nowrap">{{ article.date }}</td>

                        <!-- Views -->
                        <td class="p-5 text-center">
                          <span class="inline-flex items-center gap-1 text-xs font-bold text-[#1d1d1f]/60 bg-gray-100 px-2.5 py-1 rounded-full">
                            <mat-icon style="font-size: 14px; width: 14px; height: 14px;">visibility</mat-icon>
                            {{ article.views || 0 }}
                          </span>
                        </td>

                        <!-- Actions (View, Phone Alert, WhatsApp, Edit, Delete) -->
                        <td class="p-5 text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <!-- View live -->
                            <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all hover:scale-105" title="View Live Story">
                              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">visibility</mat-icon>
                            </a>
                            <!-- Phone alert -->
                            <button (click)="sendPhoneAlertForArticle(article)" [disabled]="isSendingAlertForId() === article.id" class="w-9 h-9 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50" title="Send Push Alert">
                              @if (isSendingAlertForId() === article.id) {
                                <div class="w-3.5 h-3.5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                              } @else {
                                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">notifications_active</mat-icon>
                              }
                            </button>
                            <!-- WhatsApp -->
                            <button (click)="openWhatsAppModal(article)" class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all hover:scale-105" title="Share to WhatsApp">
                              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">chat</mat-icon>
                            </button>
                            <!-- Quick Change Image Button -->
                            <button (click)="openQuickImageModal(article)" class="w-9 h-9 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-all hover:scale-105" title="Change Cover Image (පින්තූරය වෙනස් කරන්න)">
                              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">photo_camera</mat-icon>
                            </button>
                            <!-- Edit -->
                            <button (click)="editArticle(article)" class="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all hover:scale-105" title="Edit Story">
                              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">edit</mat-icon>
                            </button>
                            <!-- Delete Button (Red) -->
                            <button 
                              (click)="openDeleteModal(article)" 
                              class="w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-sm" 
                              title="Delete News Article (පුවත ඉවත් කරන්න)">
                              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">delete</mat-icon>
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
          <div class="space-y-8 animate-fade-in pb-12">
            <!-- Studio Hero Banner -->
            <div class="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-[#121420] text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
              <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3.5">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">auto_awesome</mat-icon>
                    <span>Gemini 2.5 Pro Studio • Automated News Engine</span>
                  </div>
                  <h2 class="text-2xl sm:text-4xl font-black tracking-tight text-white">ස්වයංක්‍රීය Article & Content Generation</h2>
                  <p class="text-indigo-100/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                    සජීවී Tech පුවත් අධ්‍යයනය කර තත්පර ගණනකින් උසස් තත්ත්වයේ සිංහල ලිපි, AI ඡායාරූප, සහ WhatsApp Channel Posts නිර්මාණය කර 1-Click එකෙන් පළ කරන්න.
                  </p>
                </div>
                
                <div class="flex flex-wrap items-center gap-3 shrink-0">
                  <button 
                    type="button" 
                    (click)="loadTrendingNews()" 
                    [disabled]="isLoadingTrending()"
                    class="px-5 py-3 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50">
                    <mat-icon [class.animate-spin]="isLoadingTrending()" style="font-size: 18px; width: 18px; height: 18px;">refresh</mat-icon>
                    <span>{{ isLoadingTrending() ? 'Scanning Live RSS...' : 'Refresh Trends' }}</span>
                  </button>
                </div>
              </div>

              <!-- Sub-Navigation Switcher -->
              <div class="flex flex-wrap gap-2 sm:gap-3 mt-8 pt-6 border-t border-white/10">
                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('trending')" 
                  class="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  [class.bg-indigo-600]="autoStudioSubTab() === 'trending'"
                  [class.text-white]="autoStudioSubTab() === 'trending'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'trending'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'trending'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">radar</mat-icon>
                  <span>1. Live Tech Trends ({{ trendingNews().length }})</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('topic')" 
                  class="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  [class.bg-indigo-600]="autoStudioSubTab() === 'topic'"
                  [class.text-white]="autoStudioSubTab() === 'topic'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'topic'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'topic'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">edit_note</mat-icon>
                  <span>2. Topic & Keyword Studio</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('url')" 
                  class="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  [class.bg-indigo-600]="autoStudioSubTab() === 'url'"
                  [class.text-white]="autoStudioSubTab() === 'url'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'url'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'url'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">link</mat-icon>
                  <span>3. News URL to Article</span>
                </button>

                <button 
                  type="button" 
                  (click)="autoStudioSubTab.set('polish')" 
                  class="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  [class.bg-indigo-600]="autoStudioSubTab() === 'polish'"
                  [class.text-white]="autoStudioSubTab() === 'polish'"
                  [class.bg-white/10]="autoStudioSubTab() !== 'polish'"
                  [class.text-gray-300]="autoStudioSubTab() !== 'polish'">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">auto_fix_high</mat-icon>
                  <span>4. Content Polisher & Formatter</span>
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
          </div>
        } @else if (activeTab() === 'subscribers') {
          <!-- Subscribers Tab -->
          <div class="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
            <div class="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-[#1d1d1f]">Newsletter Subscribers</h2>
                <p class="text-sm text-gray-500">Total active subscribers: {{ subscriberService.subscribers().length }}</p>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                    <th class="p-6 font-bold">Email Address</th>
                    <th class="p-6 font-bold">Status</th>
                    <th class="p-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (subscriberService.subscribers().length === 0) {
                    <tr>
                      <td colspan="3" class="p-12 text-center text-gray-400 font-medium">
                        No newsletter subscribers found yet.
                      </td>
                    </tr>
                  } @else {
                    @for (sub of subscriberService.subscribers(); track sub.id) {
                      <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td class="p-6 font-bold text-[#1d1d1f] flex items-center gap-3">
                          <mat-icon class="text-blue-600">email</mat-icon>
                          {{ sub.email }}
                        </td>
                        <td class="p-6">
                          <span class="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">Active</span>
                        </td>
                        <td class="p-6 text-right">
                          <button (click)="deleteSubscriber(sub.id)" class="w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center justify-center transition-colors">
                            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">delete</mat-icon>
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
            <div class="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-black/5 mb-16">
              <h2 class="text-2xl font-black mb-8">{{ editingAdId() ? 'Edit' : 'Create' }} Ad Campaign</h2>
              <form (ngSubmit)="saveAd()" class="flex flex-col gap-6">
                <div>
                  <label for="adFormTitle" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Brand / Ad Title</label>
                  <input id="adFormTitle" type="text" [(ngModel)]="adFormTitle" name="title" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none font-sans text-lg" placeholder="Brand Name or Offer Title">
                </div>
                <div>
                  <label for="adFormLink" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Target URL (Link)</label>
                  <input id="adFormLink" type="url" [(ngModel)]="adFormLink" name="link" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none font-sans text-lg" placeholder="https://www.example.com">
                </div>
                <div>
                  <label for="adFormImageFile" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Ad Image</label>
                  <div class="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                    @if (adFormImageUrl) {
                      <div class="relative w-full h-32 md:h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
                        <img [src]="adFormImageUrl" alt="Ad Preview" class="w-full h-full object-contain">
                        <div class="absolute top-2 right-2 flex items-center gap-2 z-10">
                          <button type="button" (click)="adFormImageUrl = ''" class="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all">
                            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="py-4">
                        <mat-icon class="text-gray-400 mb-2" style="font-size: 40px; width: 40px; height: 40px;">add_photo_alternate</mat-icon>
                        <p class="text-sm font-bold text-gray-500 mb-1">Click to upload ad banner image</p>
                      </div>
                    }
                    <input id="adFormImageFile" type="file" accept="image/*" (change)="onAdImageUpload($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" [required]="!adFormImageUrl">
                  </div>
                </div>
                <div>
                  <label for="adFormPlacement" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Ad Placement (Slot)</label>
                  <select id="adFormPlacement" [(ngModel)]="adFormPlacement" name="placement" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none font-sans text-lg bg-white">
                    <option value="home-top">Home Page - Top (Banner)</option>
                    <option value="home-bottom">Home Page - Bottom</option>
                    <option value="article-inline">Inside Article (Inline)</option>
                    <option value="sidebar">Sidebar / Additional</option>
                  </select>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="adIsActive" [(ngModel)]="adFormIsActive" name="isActive" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
                  <label for="adIsActive" class="text-sm font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Ad is Active (Visible on site)</label>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 mt-4">
                  <button type="submit" class="px-8 py-4 bg-blue-600 text-white rounded-full font-bold tracking-widest uppercase hover:bg-blue-700 transition-all shadow-lg w-full md:w-auto">
                    {{ editingAdId() ? 'Update' : 'Publish' }} Ad
                  </button>
                  <button type="button" (click)="cancelAdEdit()" class="px-8 py-4 bg-gray-100 text-gray-600 rounded-full font-bold tracking-widest uppercase hover:bg-gray-200 transition-all w-full md:w-auto">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          } @else {
            <div class="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
              <div class="p-6 md:p-8 flex justify-between items-center border-b border-gray-100">
                <h3 class="text-xl font-black">Active & Inactive Ads</h3>
              </div>
              <div class="divide-y divide-gray-100">
                @for (ad of adService.ads(); track ad.id) {
                  <div class="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
                    <div class="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      <img [src]="ad.imageUrl" alt="Ad" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 text-center md:text-left">
                      <h4 class="font-bold text-lg text-gray-900 mb-1">{{ ad.title }} <span class="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{{ ad.placement }}</span></h4>
                      <p class="text-sm text-gray-500 mb-2 truncate max-w-xs md:max-w-md">{{ ad.link }}</p>
                      <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                           [class.bg-green-100]="ad.isActive" [class.text-green-700]="ad.isActive"
                           [class.bg-gray-100]="!ad.isActive" [class.text-gray-500]="!ad.isActive">
                        {{ ad.isActive ? 'Active' : 'Inactive' }}
                      </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3">
                      <button (click)="toggleAdStatus(ad)" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-gray-200">
                        Toggle
                      </button>
                      <button (click)="editAd(ad)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button (click)="deleteAd(ad.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-full">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
                @if (adService.ads().length === 0) {
                  <div class="p-12 text-center text-gray-400 font-medium">
                    No ads created yet. Click "New Post" (or New Ad) to add one.
                  </div>
                }
              </div>
            </div>
          }
        } @else if (activeTab() === 'notify') {
          <!-- Notify Tab -->
          <div class="max-w-3xl mx-auto space-y-8">
            
            <!-- Phone Push Alerts Card (100% Free Instant Mobile Alerts via ntfy.sh) -->
            <div class="bg-white rounded-[3rem] shadow-xl shadow-black/5 border border-black/5 p-8 sm:p-12">
              <div class="flex items-center gap-6 mb-8">
                <div class="w-16 h-16 rounded-[2rem] bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">notifications_active</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f]">Instant Phone Push Notifications</h2>
                  <p class="text-sm text-gray-500">Get breaking news alerts directly on your phone the moment an article is published</p>
                </div>
              </div>

              <!-- Quick Setup Steps -->
              <div class="p-6 rounded-[2rem] bg-purple-50/60 border border-purple-100 mb-8 space-y-3">
                <div class="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <mat-icon style="font-size: 20px; width: 20px; height: 20px;">smartphone</mat-icon>
                  How to receive notifications on your phone (30 Seconds):
                </div>
                <ol class="text-xs text-purple-800 space-y-1.5 list-decimal list-inside leading-relaxed font-medium">
                  <li>Install the free <strong>ntfy</strong> app on your Phone (Available on Google Play Store & iOS App Store), OR open <a [href]="'https://ntfy.sh/' + phoneTopic" target="_blank" class="underline font-bold">ntfy.sh/{{ phoneTopic }}</a> in Safari / Chrome.</li>
                  <li>In the app, tap <strong>"+" (Subscribe to topic)</strong> and enter topic name: <strong class="bg-white px-2 py-0.5 rounded border border-purple-200 font-mono text-purple-900">{{ phoneTopic }}</strong></li>
                  <li>Tap <strong>"Send Test Alert"</strong> below &mdash; your phone will ring and vibrate instantly! 🔔</li>
                </ol>
              </div>

              <!-- Topic Settings & Test Dispatch -->
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="phoneTopic" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Notification Topic Name</label>
                    <input id="phoneTopic" [(ngModel)]="phoneTopic" name="phoneTopic" class="w-full px-6 py-4 rounded-2xl bg-black/[0.03] border border-black/5 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono font-bold text-sm" placeholder="myfeedlk_kaveen" />
                  </div>
                  <div class="space-y-2">
                    <label for="siteDomain" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Target Website URL (To Open on Tap)</label>
                    <input id="siteDomain" [(ngModel)]="siteDomain" name="siteDomain" class="w-full px-6 py-4 rounded-2xl bg-black/[0.03] border border-black/5 focus:outline-none focus:ring-2 focus:ring-purple-600 font-mono font-bold text-sm" placeholder="https://myfeedlk.web.app" />
                  </div>
                </div>

                <div class="flex justify-end">
                  <button type="button" (click)="savePhoneSettings()" [disabled]="isSavingPhoneSettings()" class="px-6 py-3 rounded-2xl bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                    {{ isSavingPhoneSettings() ? 'Saving...' : 'Save Notification Settings' }}
                  </button>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 pt-2">
                  <button type="button" (click)="sendTestPhoneAlert()" [disabled]="isTestingPhoneAlert() || !phoneTopic.trim()" class="flex-1 py-4 rounded-full bg-purple-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    @if (isTestingPhoneAlert()) {
                      <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Sending Test Alert...</span>
                    } @else {
                      <mat-icon>notifications_active</mat-icon>
                      <span>Send Test Alert to My Phone</span>
                    }
                  </button>

                  <a [href]="'https://ntfy.sh/' + phoneTopic" target="_blank" class="px-6 py-4 rounded-full bg-black/[0.05] hover:bg-black/10 text-[#1d1d1f] font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                    <mat-icon>open_in_new</mat-icon>
                    <span>Open Channel Web App</span>
                  </a>
                </div>

                @if (phoneAlertSuccess()) {
                  <div class="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800 animate-fade-in-up">
                    <mat-icon class="text-emerald-500">check_circle</mat-icon>
                    <span class="text-xs font-bold">Test alert sent successfully! Check your phone.</span>
                  </div>
                }
              </div>
            </div>

            <!-- Email Subscribers Broadcast Card -->
            <div class="bg-white rounded-[3rem] shadow-xl shadow-black/5 border border-black/5 p-8 sm:p-12 overflow-hidden">
              <div class="flex items-center gap-6 mb-10">
                <div class="w-16 h-16 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">mail</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f]">Email Subscribers Broadcast</h2>
                  <p class="text-sm text-gray-500">Notify all {{ subscriberService.subscribers().length }} newsletter subscribers</p>
                </div>
              </div>

              <form (ngSubmit)="sendBroadcast()" class="space-y-6">
                <div class="space-y-2">
                  <label for="broadcastSubject" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Subject</label>
                  <input id="broadcastSubject" [(ngModel)]="broadcastSubject" name="subject" required class="w-full px-6 py-4 rounded-3xl bg-black/[0.03] border border-black/5 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-black text-lg" placeholder="News Update" />
                </div>

                <div class="space-y-2">
                  <label for="broadcastMessage" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Message Content</label>
                  <textarea id="broadcastMessage" [(ngModel)]="broadcastMessage" name="message" required rows="8" class="w-full px-8 py-6 rounded-[2rem] bg-black/[0.03] border border-black/5 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-medium leading-relaxed" placeholder="Write your message to the audience..."></textarea>
                </div>

                <button type="submit" [disabled]="isBroadcasting() || !broadcastSubject || !broadcastMessage" class="w-full py-5 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  @if (isBroadcasting()) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Broadcast...
                  } @else {
                    <mat-icon>send</mat-icon>
                    Send to All Subscribers
                  }
                </button>
              </form>

              @if (broadcastSuccess()) {
                <div class="mt-8 p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center gap-4 text-emerald-800 animate-fade-in-up">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                  <div>
                    <div class="font-black text-sm uppercase tracking-widest">Broadcast Sent</div>
                    <p class="text-xs opacity-80">Notification recorded successfully.</p>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else if (activeTab() === 'whatsapp') {
          <!-- WhatsApp Channel Tab -->
          <div class="max-w-3xl mx-auto space-y-8">
            <div class="bg-white rounded-[3rem] shadow-xl shadow-black/5 border border-black/5 p-8 sm:p-12">
              <div class="flex items-center gap-6 mb-8">
                <div class="w-16 h-16 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">chat</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f]">WhatsApp Channel Automation</h2>
                  <p class="text-sm text-gray-500">Auto-post breaking tech stories directly to your subscribers</p>
                </div>
              </div>

              <!-- Integration Settings -->
              <div class="p-6 rounded-[2rem] bg-black/[0.02] border border-black/5 mb-8 space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-widest text-gray-600">WhatsApp Webhook / Channel Settings</h3>
                <p class="text-xs text-gray-500">Enter your WhatsApp Webhook URL (Zapier, Make, Evolution API, or Baileys service) to enable seamless 1-click & auto publishing:</p>
                
                <div class="flex flex-col sm:flex-row gap-3">
                  <input [(ngModel)]="waWebhookUrl" placeholder="https://hook.eu2.make.com/... or Evolution API" class="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-black/10 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-mono" />
                  <button (click)="saveWaSettings()" [disabled]="isSavingWaSettings()" class="px-6 py-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 shrink-0">
                    {{ isSavingWaSettings() ? 'Saving...' : 'Save Webhook' }}
                  </button>
                </div>
              </div>

              <!-- Direct Post Composer -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold uppercase tracking-widest text-gray-600">Compose or Broadcast WhatsApp Post</h3>
                  <button (click)="loadLatestArticleForWa()" class="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">autorenew</mat-icon> Fill from latest story
                  </button>
                </div>

                <textarea [(ngModel)]="waCustomMessage" rows="8" class="w-full px-6 py-4 rounded-2xl bg-black/[0.03] border border-black/10 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-sans leading-relaxed" placeholder="*🚀 NEW ON MYFEED.LK*&#10;&#10;*Article Title Here*&#10;&#10;Summary of story...&#10;&#10;🔗 Read: https://myfeed.lk/article/..."></textarea>

                <div class="flex flex-col sm:flex-row gap-4 pt-2">
                  <button (click)="dispatchWhatsAppPost()" [disabled]="isDispatchingWa() || !waCustomMessage.trim()" class="flex-1 py-4 rounded-full bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    @if (isDispatchingWa()) {
                      <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Dispatching to Channel...</span>
                    } @else {
                      <mat-icon>send</mat-icon>
                      <span>Auto-Post to Channel</span>
                    }
                  </button>

                  <button (click)="openDirectWhatsAppShare()" [disabled]="!waCustomMessage.trim()" class="px-6 py-4 rounded-full bg-black/[0.05] hover:bg-black/10 text-[#1d1d1f] font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                    <mat-icon>share</mat-icon>
                    <span>Open in WhatsApp Web</span>
                  </button>
                </div>

                @if (waPostSuccess()) {
                  <div class="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800 animate-fade-in-up">
                    <mat-icon class="text-emerald-500">check_circle</mat-icon>
                    <span class="font-bold text-sm">{{ waSuccessMessage() }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'deploy') {
          <!-- Deploy Tab -->
          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-[3rem] shadow-xl shadow-black/5 border border-black/5 p-8 sm:p-12">
              <div class="flex items-center gap-6 mb-10">
                <div class="w-16 h-16 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">rocket_launch</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f]">Netlify Deployment</h2>
                  <p class="text-sm text-gray-500">Trigger a production rebuild</p>
                </div>
              </div>

              <!-- Settings -->
              <div class="mb-12 p-8 rounded-[2rem] bg-black/[0.02] border border-black/5">
                <label for="netlifyHookUrl" class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 ml-2">Netlify Build Hook URL</label>
                <div class="flex gap-3">
                  <input id="netlifyHookUrl" [(ngModel)]="netlifyHookUrl" name="netlifyHookUrl" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-black/10 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium" placeholder="https://api.netlify.com/build_hooks/..." />
                  <button (click)="saveDeploySettings()" [disabled]="isSavingSettings()" class="px-6 py-4 rounded-2xl bg-[#1d1d1f] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50">
                    {{ isSavingSettings() ? 'Saving...' : 'Save' }}
                  </button>
                </div>
                <p class="mt-3 text-[10px] text-gray-400 ml-2">Obtain this from Netlify Site Settings > Build & Deploy > Build Hooks</p>
              </div>

              <div class="text-center">
                <p class="text-[#1d1d1f]/60 mb-8 font-medium">Triggering a build will pull the latest Firestore data and update the live site.</p>
                
                <button (click)="triggerNetlifyBuild()" [disabled]="isDeploying() || !netlifyHookUrl" class="w-full py-6 rounded-full bg-emerald-600 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  @if (isDeploying()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deploying to Production...
                  } @else {
                    <mat-icon>cloud_upload</mat-icon>
                    Trigger Netlify Build
                  }
                </button>

                @if (deploySuccess()) {
                  <div class="mt-8 p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-4 text-emerald-800 animate-fade-in-up">
                    <mat-icon class="text-emerald-500">done_all</mat-icon>
                    <span class="font-black text-sm uppercase tracking-widest">Build Triggered Successfully</span>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'analytics') {
          <!-- Analytics Tab -->
          <div class="max-w-6xl mx-auto space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Top Viewed Articles -->
              <div class="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
                <div class="p-6 md:p-8 flex items-center gap-4 border-b border-gray-100">
                  <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <mat-icon>trending_up</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-gray-900">Top Viewed Articles</h3>
                    <p class="text-sm text-gray-500">Most read stories</p>
                  </div>
                </div>
                <div class="divide-y divide-gray-100">
                  @for (art of topViewedArticles(); track art.id; let i = $index) {
                    <div class="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-black shrink-0">{{ i + 1 }}</div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-[#1d1d1f] truncate text-sm sm:text-base">{{ art.title }}</h4>
                        <div class="text-xs text-gray-500 mt-1">{{ art.date }}</div>
                      </div>
                      <div class="shrink-0 text-right">
                        <div class="font-black text-blue-600 flex items-center gap-1.5 justify-end">
                          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">visibility</mat-icon>
                          {{ art.views || 0 }}
                        </div>
                        <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Views</div>
                      </div>
                    </div>
                  }
                  @if (topViewedArticles().length === 0) {
                    <div class="p-8 text-center text-gray-400">No data available yet.</div>
                  }
                </div>
              </div>

              <!-- Top Reacted Articles -->
              <div class="bg-white rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
                <div class="p-6 md:p-8 flex items-center gap-4 border-b border-gray-100">
                  <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <mat-icon>local_fire_department</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-gray-900">Most Engaging Articles</h3>
                    <p class="text-sm text-gray-500">Based on reader reactions</p>
                  </div>
                </div>
                <div class="divide-y divide-gray-100">
                  @for (art of topReactedArticles(); track art.id; let i = $index) {
                    <div class="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-black shrink-0">{{ i + 1 }}</div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-[#1d1d1f] truncate text-sm sm:text-base">{{ art.title }}</h4>
                        <div class="flex flex-wrap gap-2 mt-2">
                          @if (art.reactions?.['like']) { <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1"><mat-icon style="font-size: 12px; width: 12px; height: 12px;">thumb_up</mat-icon> {{ art.reactions?.['like'] }}</span> }
                          @if (art.reactions?.['love']) { <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1"><mat-icon style="font-size: 12px; width: 12px; height: 12px;">favorite</mat-icon> {{ art.reactions?.['love'] }}</span> }
                          @if (art.reactions?.['fire']) { <span class="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1"><mat-icon style="font-size: 12px; width: 12px; height: 12px;">local_fire_department</mat-icon> {{ art.reactions?.['fire'] }}</span> }
                          @if (art.reactions?.['insight']) { <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1"><mat-icon style="font-size: 12px; width: 12px; height: 12px;">lightbulb</mat-icon> {{ art.reactions?.['insight'] }}</span> }
                          @if (art.reactions?.['rocket']) { <span class="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1"><mat-icon style="font-size: 12px; width: 12px; height: 12px;">rocket_launch</mat-icon> {{ art.reactions?.['rocket'] }}</span> }
                        </div>
                      </div>
                      <div class="shrink-0 text-right">
                        <div class="font-black text-orange-600 text-lg">
                          {{ art._totalReactions || 0 }}
                        </div>
                        <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total</div>
                      </div>
                    </div>
                  }
                  @if (topReactedArticles().length === 0) {
                    <div class="p-8 text-center text-gray-400">No reactions yet.</div>
                  }
                </div>
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

            <!-- Alternative Options: AI Generate or Custom URL or Local File -->
            <div class="space-y-3 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
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
  adService = inject(AdManagerService);
  
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  
  readonly activeTab = signal<'articles' | 'auto-studio' | 'subscribers' | 'notify' | 'whatsapp' | 'deploy' | 'ads' | 'analytics'>('articles');
  
  // Auto Studio signals & state
  readonly autoStudioSubTab = signal<'trending' | 'topic' | 'url' | 'polish'>('trending');
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

  // Phone Push Notifications (via ntfy.sh)
  phoneTopic = 'myfeedlk_kaveen';
  siteDomain = 'https://myfeedlk.web.app';
  autoAlertPhone = true;
  readonly isSavingPhoneSettings = signal(false);
  readonly isTestingPhoneAlert = signal(false);
  readonly phoneAlertSuccess = signal(false);
  readonly isSendingAlertForId = signal<string | null>(null);

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
  formReadTime = '';
  formAuthorType: 'ai' | 'human' = 'ai';
  
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
        this.loadPhoneSettings();
      }
    });
  }

  async login() {
    this.loading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to allow switching if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Login failed', error);
      if (error.code === 'auth/network-request-failed') {
        alert('Login failed: Network request blocked. Please ensure your browser allows popups and that you are not using an ad-blocker. If the issue persists, try opening the app in a new tab.');
      } else {
        alert('Login failed: ' + (error.message || 'Unknown error'));
      }
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
    this.formReadTime = article.readTime || '5 min';
    this.formAuthorType = article.authorType === 'human' ? 'human' : 'ai';
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
      
      if (data.visualPrompt) {
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
      
      const payload: Partial<Article> = {
        title: this.formTitle,
        summary: this.formSummary,
        content: this.formContent,
        category: this.formCategory,
        imageUrl: this.formImageUrl,
        readTime: this.formReadTime,
        date: dateStr,
        authorType: this.formAuthorType,
        isAiGenerated: this.formAuthorType === 'ai',
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
    this.formReadTime = '';
    this.formAuthorType = 'ai';
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

_Curated with precision by MyFeed.lk Sri Lanka_`;
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

  getArticleUrl(slugOrId: string): string {
    const domain = (this.siteDomain || 'https://myfeedlk.web.app').trim().replace(/\/+$/, '');
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
      const cleanDomain = (this.siteDomain || 'https://myfeedlk.web.app').trim().replace(/\/+$/, '');
      
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
      const targetUrl = (this.siteDomain || 'https://myfeedlk.web.app').trim().replace(/\/+$/, '');
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

  
  async triggerWebPushNotification(data: { title: string; summary: string; articleUrl: string; imageUrl?: string }): Promise<boolean> {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      const colRef = collection(db, 'web_push_subscriptions');
      const snap = await getDocs(colRef);
      const subscriptions = snap.docs.map(d => d.data());
      
      if (subscriptions.length === 0) return true;

      const payload = {
        title: data.title,
        summary: data.summary,
        articleUrl: data.articleUrl,
        subscriptions
      };

      const res = await fetch('/api/notify/webpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      const safeUrl = (data.articleUrl || this.siteDomain || 'https://myfeedlk.web.app').trim();

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
        imageUrl: generated.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
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
              imageUrl: generated.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
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
        imageUrl: art.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
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
}
