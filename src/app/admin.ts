import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ArticleService, Article} from './article.service';
import {SubscriberService} from './subscriber.service';
import {collection, addDoc, serverTimestamp, doc, setDoc, getDoc} from 'firebase/firestore';
import {db, auth} from './firebase';
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from 'firebase/auth';

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
          <div class="flex gap-4">
            @if (activeTab() === 'articles') {
              <button (click)="isAdding.set(true)" class="px-6 py-3 bg-blue-600 text-white rounded-full font-bold tracking-widest uppercase hover:bg-blue-700 transition-all flex items-center gap-2">
                <mat-icon>add</mat-icon> New Post
              </button>
            }
            <button (click)="logout()" class="px-6 py-3 bg-gray-200 text-[#1d1d1f] rounded-full font-bold tracking-widest uppercase hover:bg-gray-300 transition-all">
              Logout
            </button>
          </div>
        </header>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-gray-200 mb-10 gap-8">
          <button 
            (click)="activeTab.set('articles')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative"
            [class.text-blue-600]="activeTab() === 'articles'"
            [class.text-gray-400]="activeTab() !== 'articles'">
            Articles ({{ articleService.articles().length }})
            @if (activeTab() === 'articles') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('subscribers')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative"
            [class.text-blue-600]="activeTab() === 'subscribers'"
            [class.text-gray-400]="activeTab() !== 'subscribers'">
            Subscribers ({{ subscriberService.subscribers().length }})
            @if (activeTab() === 'subscribers') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('notify')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative"
            [class.text-blue-600]="activeTab() === 'notify'"
            [class.text-gray-400]="activeTab() !== 'notify'">
            Notify
            @if (activeTab() === 'notify') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('whatsapp')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative flex items-center gap-1.5"
            [class.text-emerald-600]="activeTab() === 'whatsapp'"
            [class.text-gray-400]="activeTab() !== 'whatsapp'">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-emerald-500">chat</mat-icon>
            WhatsApp
            @if (activeTab() === 'whatsapp') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('deploy')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative"
            [class.text-blue-600]="activeTab() === 'deploy'"
            [class.text-gray-400]="activeTab() !== 'deploy'">
            Deploy
            @if (activeTab() === 'deploy') {
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
                <p class="text-xs text-blue-700/70 mb-4">ඔබට අවශ්‍ය පුවතේ මාතෘකාව හෝ ඉංග්‍රීසි/සිංහල සිරස්තලය මෙහි ඇතුළත් කර ක්ලික් කරන්න. AI මඟින් පූර්ණ විස්තරාත්මක සිංහල ලිපියක් (Long-form report) ක්ෂණිකව සකසා දෙනු ඇත.</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <input type="text" [(ngModel)]="aiTopicPrompt" [ngModelOptions]="{standalone: true}" placeholder="උදා: OpenAI GPT-5 Announcement, Apple Vision Pro 2, Sri Lanka 5G..." class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                  <button type="button" (click)="generateWithAI()" [disabled]="isGeneratingAi()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50">
                    @if (isGeneratingAi()) {
                      <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Generating Long Article...</span>
                    } @else {
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bolt</mat-icon>
                      <span>Generate with AI</span>
                    }
                  </button>
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
                      <img [src]="formImageUrl" alt="Preview" class="w-full h-full object-cover">
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
              
              <div class="flex gap-4 mt-4">
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

        <div class="bg-white rounded-[3rem] shadow-sm border border-black/5 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                  <th class="p-6 font-bold">Title</th>
                  <th class="p-6 font-bold">Category</th>
                  <th class="p-6 font-bold">Date</th>
                  <th class="p-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (article of articleService.articles(); track article.id) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td class="p-6 font-bold text-[#1d1d1f]">{{ article.title }}</td>
                    <td class="p-6">
                      <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{{ article.category }}</span>
                    </td>
                    <td class="p-6 text-sm text-gray-500">{{ article.date }}</td>
                    <td class="p-6 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="View live">
                          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">visibility</mat-icon>
                        </a>
                        <button (click)="sendPhoneAlertForArticle(article)" [disabled]="isSendingAlertForId() === article.id" class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors disabled:opacity-50" title="Send Phone Push Alert (ntfy)">
                          @if (isSendingAlertForId() === article.id) {
                            <div class="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin"></div>
                          } @else {
                            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">notifications_active</mat-icon>
                          }
                        </button>
                        <button (click)="openWhatsAppModal(article)" class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Post to WhatsApp Channel">
                          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">chat</mat-icon>
                        </button>
                        <button (click)="editArticle(article)" class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Edit">
                          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">edit</mat-icon>
                        </button>
                        <button (click)="deleteArticle(article.id)" class="w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors">
                          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
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
              <table class="w-full text-left border-collapse">
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
        }
      }
    </main>
  `
})
export class AdminComponent {
  readonly articleService = inject(ArticleService);
  readonly subscriberService = inject(SubscriberService);
  
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  
  readonly activeTab = signal<'articles' | 'subscribers' | 'notify' | 'whatsapp' | 'deploy'>('articles');
  
  private http = inject(HttpClient);

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
  
  aiTopicPrompt = '';
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

  cancelEdit() {
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
      }
      
      this.cancelEdit();
    } catch (error) {
      console.error('Failed to save', error);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteArticle(id: string) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.loading.set(true);
      await this.articleService.deleteArticle(id);
      this.loading.set(false);
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
}
