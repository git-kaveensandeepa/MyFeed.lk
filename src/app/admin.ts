import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ArticleService, Article} from './article.service';
import {SubscriberService} from './subscriber.service';
import {AuthService} from './auth.service';
import {collection, addDoc, serverTimestamp, doc, setDoc, getDoc} from 'firebase/firestore';
import {db} from './firebase';

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
      } @else if (!authService.isAdmin()) {
        <div class="max-w-md mx-auto text-center mt-20">
          <div class="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <mat-icon style="font-size: 40px; width: 40px; height: 40px;">lock</mat-icon>
          </div>
          <h1 class="text-3xl font-black mb-4 dark:text-white">Restricted Access</h1>
          <p class="text-slate-500 dark:text-slate-400 mb-8 font-serif italic">Only authorized administrators can access this dashboard.</p>
          <a routerLink="/auth" class="px-8 py-4 bg-blue-600 text-white rounded-full font-bold tracking-widest uppercase hover:bg-blue-700 transition-all shadow-xl active:scale-95 inline-block">
            Sign in as Admin
          </a>
        </div>
      } @else {
        <header class="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 class="text-4xl font-black text-[#1d1d1f] dark:text-white mb-2">Dashboard</h1>
            <p class="text-gray-500 dark:text-gray-400 font-medium">Logged in as {{ authService.user()?.email }}</p>
          </div>
          <div class="flex gap-4">
            @if (activeTab() === 'articles') {
              <button (click)="isAdding.set(true)" class="px-6 py-3 bg-blue-600 text-white rounded-full font-bold tracking-widest uppercase hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                <mat-icon>add</mat-icon> New Post
              </button>
            }
            <button (click)="authService.logout()" class="px-6 py-3 bg-slate-200 dark:bg-white/10 text-[#1d1d1f] dark:text-white rounded-full font-bold tracking-widest uppercase hover:bg-slate-300 dark:hover:bg-white/20 transition-all">
              Logout
            </button>
          </div>
        </header>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-gray-200 dark:border-white/10 mb-10 gap-8 overflow-x-auto">
          <button 
            (click)="activeTab.set('articles')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative shrink-0"
            [class.text-blue-600]="activeTab() === 'articles'"
            [class.text-gray-400]="activeTab() !== 'articles'">
            Articles ({{ articleService.articles().length }})
            @if (activeTab() === 'articles') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('subscribers')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative shrink-0"
            [class.text-blue-600]="activeTab() === 'subscribers'"
            [class.text-gray-400]="activeTab() !== 'subscribers'">
            Subscribers ({{ subscriberService.subscribers().length }})
            @if (activeTab() === 'subscribers') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('notify')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative shrink-0"
            [class.text-blue-600]="activeTab() === 'notify'"
            [class.text-gray-400]="activeTab() !== 'notify'">
            Notify
            @if (activeTab() === 'notify') {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            }
          </button>
          <button 
            (click)="activeTab.set('deploy')"
            class="pb-4 font-bold text-sm tracking-wider uppercase transition-all relative shrink-0"
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
            <div class="bg-white dark:bg-[#111] p-8 md:p-12 rounded-[3rem] shadow-xl border border-black/5 dark:border-white/5 mb-16">
              <h2 class="text-2xl font-black mb-8 dark:text-white">{{ editingId() ? 'Edit' : 'Create' }} Article</h2>
              <form (ngSubmit)="saveArticle()" class="flex flex-col gap-6">
                
                <div>
                  <label for="formTitle" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Title</label>
                  <input type="text" id="formTitle" [(ngModel)]="formTitle" name="title" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans text-lg" placeholder="Article Title (Sinhala/English)">
                </div>
                
                <div>
                  <label for="formSummary" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Summary</label>
                  <textarea id="formSummary" [(ngModel)]="formSummary" name="summary" required rows="2" class="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-serif text-lg" placeholder="Short summary"></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="formCategory" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Category</label>
                    <select id="formCategory" [(ngModel)]="formCategory" name="category" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans appearance-none">
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
                    <label for="formReadTime" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Read Time</label>
                    <input type="text" id="formReadTime" [(ngModel)]="formReadTime" name="readTime" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans" placeholder="e.g. 5 min">
                  </div>
                </div>

                <div>
                  <label for="imageUpload" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Cover Image</label>
                  <div class="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative">
                    @if (formImageUrl) {
                      <div class="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-white/5">
                        <img [src]="formImageUrl" alt="Preview" class="w-full h-full object-cover">
                        <button type="button" (click)="formImageUrl = ''" class="absolute top-2 right-2 w-8 h-8 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white dark:hover:bg-black shadow-sm transition-all z-10">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                        </button>
                      </div>
                    } @else {
                      <div class="py-8">
                        <mat-icon class="text-gray-400 mb-2" style="font-size: 48px; width: 48px; height: 48px;">add_photo_alternate</mat-icon>
                        <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Click to upload image</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">JPEG, PNG, WEBP (Max 2MB)</p>
                      </div>
                    }
                    <input type="file" id="imageUpload" accept="image/*" (change)="onImageUpload($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" [required]="!formImageUrl">
                  </div>
                  <input type="hidden" [(ngModel)]="formImageUrl" name="imageUrl">
                </div>

                <div>
                  <label for="formContent" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Content</label>
                  <textarea id="formContent" [(ngModel)]="formContent" name="content" required rows="10" class="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-serif text-lg" placeholder="Full article content (HTML supported)"></textarea>
                </div>

                <div class="flex items-center gap-3 py-2">
                  <input type="checkbox" id="notifySubscribers" [(ngModel)]="notifySubscribers" name="notifySubscribers" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
                  <label for="notifySubscribers" class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest cursor-pointer">Notify subscribers about this post</label>
                </div>
                
                <div class="flex gap-4 mt-4">
                  <button type="submit" class="px-8 py-4 bg-blue-600 text-white rounded-full font-bold tracking-widest uppercase hover:bg-blue-700 transition-all shadow-lg w-full md:w-auto">
                    {{ editingId() ? 'Update' : 'Publish' }} Post
                  </button>
                  <button type="button" (click)="cancelEdit()" class="px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full font-bold tracking-widest uppercase hover:bg-slate-200 dark:hover:bg-white/10 transition-all w-full md:w-auto">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          }

          <div class="bg-white dark:bg-[#111] rounded-[3rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    <th class="p-6 font-bold">Title</th>
                    <th class="p-6 font-bold">Category</th>
                    <th class="p-6 font-bold">Date</th>
                    <th class="p-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (article of articleService.articles(); track article.id) {
                    <tr class="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors">
                      <td class="p-6 font-bold text-[#1d1d1f] dark:text-white">{{ article.title }}</td>
                      <td class="p-6">
                        <span class="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">{{ article.category }}</span>
                      </td>
                      <td class="p-6 text-sm text-gray-500 dark:text-gray-400">{{ article.date }}</td>
                      <td class="p-6 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">visibility</mat-icon>
                          </a>
                          <button (click)="editArticle(article)" class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <mat-icon style="font-size: 20px; width: 20px; height: 20px;">edit</mat-icon>
                          </button>
                          <button (click)="deleteArticle(article.id)" class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
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
          <div class="bg-white dark:bg-[#111] rounded-[3rem] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
            <div class="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-[#1d1d1f] dark:text-white">Newsletter Subscribers</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Total active subscribers: {{ subscriberService.subscribers().length }}</p>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    <th class="p-6 font-bold">Email Address</th>
                    <th class="p-6 font-bold">Status</th>
                    <th class="p-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (subscriberService.subscribers().length === 0) {
                    <tr>
                      <td colspan="3" class="p-12 text-center text-gray-400 font-medium">No newsletter subscribers found yet.</td>
                    </tr>
                  } @else {
                    @for (sub of subscriberService.subscribers(); track sub.id) {
                      <tr class="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors">
                        <td class="p-6 font-bold text-[#1d1d1f] dark:text-white flex items-center gap-3">
                          <mat-icon class="text-blue-600">email</mat-icon>
                          {{ sub.email }}
                        </td>
                        <td class="p-6">
                          <span class="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Active</span>
                        </td>
                        <td class="p-6 text-right">
                          <button (click)="deleteSubscriber(sub.id)" class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 inline-flex items-center justify-center transition-colors">
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
          <div class="max-w-2xl mx-auto">
            <div class="bg-white dark:bg-[#111] rounded-[3rem] shadow-xl border border-black/5 dark:border-white/5 p-8 sm:p-12">
              <div class="flex items-center gap-6 mb-10">
                <div class="w-16 h-16 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">notifications_active</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f] dark:text-white">Broadcast Update</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Notify all {{ subscriberService.subscribers().length }} subscribers</p>
                </div>
              </div>

              <form (ngSubmit)="sendBroadcast()" class="space-y-6">
                <div class="space-y-2">
                  <label for="broadcastSubject" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Subject</label>
                  <input id="broadcastSubject" [(ngModel)]="broadcastSubject" name="subject" required class="w-full px-6 py-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-[#1a1a1a] transition-all font-black text-lg text-slate-900 dark:text-white" placeholder="News Update" />
                </div>

                <div class="space-y-2">
                  <label for="broadcastMessage" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Message Content</label>
                  <textarea id="broadcastMessage" [(ngModel)]="broadcastMessage" name="message" required rows="8" class="w-full px-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white dark:focus:bg-[#1a1a1a] transition-all font-medium leading-relaxed text-slate-900 dark:text-white" placeholder="Write your message to the audience..."></textarea>
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
                <div class="mt-8 p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-4 text-emerald-800 dark:text-emerald-400 animate-fade-in-up">
                  <mat-icon class="text-emerald-500">check_circle</mat-icon>
                  <div>
                    <div class="font-black text-sm uppercase tracking-widest">Broadcast Sent</div>
                    <p class="text-xs opacity-80">Notification recorded successfully.</p>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else if (activeTab() === 'deploy') {
          <div class="max-w-2xl mx-auto">
            <div class="bg-white dark:bg-[#111] rounded-[3rem] shadow-xl border border-black/5 dark:border-white/5 p-8 sm:p-12">
              <div class="flex items-center gap-6 mb-10">
                <div class="w-16 h-16 rounded-[2rem] bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">rocket_launch</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f] dark:text-white">Deployment</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Trigger a production rebuild</p>
                </div>
              </div>

              <div class="mb-12 p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <label for="netlifyHookUrl" class="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 ml-2">Build Hook URL</label>
                <div class="flex flex-col sm:flex-row gap-3">
                  <input id="netlifyHookUrl" [(ngModel)]="netlifyHookUrl" name="netlifyHookUrl" class="flex-1 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-medium text-slate-900 dark:text-white" placeholder="https://api.netlify.com/build_hooks/..." />
                  <button (click)="saveDeploySettings()" [disabled]="isSavingSettings()" class="px-6 py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">
                    {{ isSavingSettings() ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </div>

              <div class="text-center">
                <p class="text-slate-600 dark:text-slate-400 mb-8 font-medium">Triggering a build will update the live site with the latest data.</p>
                <button (click)="triggerNetlifyBuild()" [disabled]="isDeploying() || !netlifyHookUrl" class="w-full py-6 rounded-full bg-emerald-600 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  @if (isDeploying()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deploying...
                  } @else {
                    <mat-icon>cloud_upload</mat-icon>
                    Trigger Build
                  }
                </button>

                @if (deploySuccess()) {
                  <div class="mt-8 p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center gap-4 text-emerald-800 dark:text-emerald-400 animate-fade-in-up">
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
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  
  readonly loading = signal(false);
  readonly activeTab = signal<'articles' | 'subscribers' | 'notify' | 'deploy'>('articles');
  private http = inject(HttpClient);

  // Deployment signals
  netlifyHookUrl = '';
  readonly isDeploying = signal(false);
  readonly deploySuccess = signal(false);
  readonly isSavingSettings = signal(false);

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

  constructor() {
    if (this.authService.isAdmin()) {
      this.subscriberService.loadSubscribers();
      this.loadDeploySettings();
    }
  }

  editArticle(article: Article) {
    this.editingId.set(article.id);
    this.formTitle = article.title;
    this.formSummary = article.summary;
    this.formContent = article.content;
    this.formCategory = article.category;
    this.formImageUrl = article.imageUrl;
    this.formReadTime = article.readTime || '5 min';
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
          this.formImageUrl = canvas.toDataURL('image/jpeg', 0.8);
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
    this.resetForm();
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
        slug: this.formTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      };

      if (this.editingId()) {
        await this.articleService.updateArticle(this.editingId()!, payload);
      } else {
        await this.articleService.addArticle(payload as Omit<Article, 'id' | 'createdAt'>);
        
        if (this.notifySubscribers) {
          await addDoc(collection(db, 'notifications'), {
            subject: `New Article: ${this.formTitle}`,
            message: `Check out our latest update: "${this.formTitle}" under ${this.formCategory}. Read it now on MyFeed!`,
            sentAt: serverTimestamp(),
            recipientCount: this.subscriberService.subscribers().length,
            status: 'delivered'
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
        alert('Failed to trigger Netlify build. Please verify your Hook URL.');
        this.isDeploying.set(false);
      }
    });
  }
}

