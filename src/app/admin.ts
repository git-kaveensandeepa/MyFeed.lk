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
            <h2 class="text-2xl font-black mb-8">{{ editingId() ? 'Edit' : 'Create' }} Article</h2>
            <form (ngSubmit)="saveArticle()" class="flex flex-col gap-6">
              
              <div>
                <label for="formTitle" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Title</label>
                <input type="text" id="formTitle" [(ngModel)]="formTitle" name="title" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans text-lg" placeholder="Article Title (Sinhala/English)">
              </div>
              
              <div>
                <label for="formSummary" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Summary</label>
                <textarea id="formSummary" [(ngModel)]="formSummary" name="summary" required rows="2" class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-serif text-lg" placeholder="Short summary"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label for="formReadTime" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Read Time</label>
                  <input type="text" id="formReadTime" [(ngModel)]="formReadTime" name="readTime" required class="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none font-sans" placeholder="e.g. 5 min">
                </div>
              </div>

              <div>
                <label for="imageUpload" class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Cover Image</label>
                <div class="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                  @if (formImageUrl) {
                    <div class="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
                      <img [src]="formImageUrl" alt="Preview" class="w-full h-full object-cover">
                      <button type="button" (click)="formImageUrl = ''" class="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all z-10">
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">close</mat-icon>
                      </button>
                    </div>
                  } @else {
                    <div class="py-8">
                      <mat-icon class="text-gray-400 mb-2" style="font-size: 48px; width: 48px; height: 48px;">add_photo_alternate</mat-icon>
                      <p class="text-sm font-bold text-gray-500 mb-1">Click to upload image</p>
                      <p class="text-xs text-gray-400 font-medium">JPEG, PNG, WEBP (Max 2MB)</p>
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

              <div class="flex items-center gap-3 py-2">
                <input type="checkbox" id="notifySubscribers" [(ngModel)]="notifySubscribers" name="notifySubscribers" class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600">
                <label for="notifySubscribers" class="text-sm font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Notify subscribers about this post</label>
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
                        <a [routerLink]="['/article', article.slug || article.id]" target="_blank" class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                          <mat-icon style="font-size: 20px; width: 20px; height: 20px;">visibility</mat-icon>
                        </a>
                        <button (click)="editArticle(article)" class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
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
          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-[3rem] shadow-xl shadow-black/5 border border-black/5 p-8 sm:p-12 overflow-hidden">
              <div class="flex items-center gap-6 mb-10">
                <div class="w-16 h-16 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px;">notifications_active</mat-icon>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-[#1d1d1f]">Broadcast Update</h2>
                  <p class="text-sm text-gray-500">Notify all {{ subscriberService.subscribers().length }} subscribers</p>
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
        // Netlify build hooks usually return 200/202, but even if it fails we show an alert
        alert('Failed to trigger Netlify build. Please verify your Hook URL.');
        this.isDeploying.set(false);
      }
    });
  }
}
