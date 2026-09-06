import { ChangeDetectionStrategy, Component, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { BookmarkManager } from './bookmark';
import { ThemeManager, ThemeMode } from './theme';
import { ArticleService } from './article.service';
import { WebPushService } from './web-push.service';
import { SubscriberService } from './subscriber.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#f2f2f7] dark:bg-[#000000] text-[#000000] dark:text-white transition-colors duration-300 pb-20 pt-3 sm:pt-6">
      
      <main class="max-w-3xl w-full mx-auto px-4 sm:px-6">
        
        <!-- iOS Navigation Bar Header -->
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <div class="flex items-center gap-2">
            <a routerLink="/" class="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] hover:opacity-80 transition-opacity ios-touch">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">chevron_left</mat-icon>
              <span>Journal</span>
            </a>
          </div>
          <h1 class="text-base sm:text-lg font-bold text-[#000000] dark:text-white tracking-tight">
            Account &amp; Settings
          </h1>
          <div class="w-12"></div> <!-- Spacer for optical balance -->
        </div>

        <!-- ========================================== -->
        <!-- 1. USER PROFILE CARD (APPLE ID STYLE) -->
        <!-- ========================================== -->
        <section class="mb-6">
          @if (authService.currentUser()) {
            <div class="bg-white dark:bg-[#1c1c1e] rounded-[22px] p-4 sm:p-5 shadow-xs border border-black/[0.06] dark:border-white/[0.08] ios-card">
              <div class="flex items-center gap-3.5 sm:gap-4">
                
                <!-- Avatar -->
                <div class="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                  <div class="w-full h-full rounded-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
                    @if (authService.userProfile()?.photoURL) {
                      <img [src]="authService.userProfile()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                    } @else {
                      <div class="w-full h-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xl sm:text-2xl">
                        {{ authService.userInitials() }}
                      </div>
                    }
                  </div>

                  <!-- Online Status Dot -->
                  <div class="absolute bottom-0 right-0 w-4 h-4 bg-[#34C759] border-2 border-white dark:border-[#1c1c1e] rounded-full z-10" title="Online"></div>

                  <!-- Verified / Admin Badge -->
                  @if (authService.userProfile()?.verified || authService.isAdmin()) {
                    <div class="absolute -top-1 -right-1 z-10 bg-white dark:bg-[#1c1c1e] rounded-full p-0.5 shadow-xs" title="{{ authService.isAdmin() ? 'Administrator' : 'Verified Member' }}">
                      <mat-icon class="{{ authService.isAdmin() ? 'text-amber-500' : 'text-[#007AFF]' }}" style="font-size: 18px; width: 18px; height: 18px;">
                        {{ authService.isAdmin() ? 'shield' : 'verified' }}
                      </mat-icon>
                    </div>
                  }
                </div>

                <!-- Info Column -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h2 class="text-lg sm:text-xl font-bold text-[#000000] dark:text-white truncate">
                      {{ authService.displayName() }}
                    </h2>
                    @if (authService.isAdmin()) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Admin
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#007AFF]/10 text-[#007AFF]">
                        Reader
                      </span>
                    }
                  </div>

                  <p class="text-xs text-[#8e8e93] truncate font-sans mt-0.5">
                    {{ authService.email() }}
                  </p>

                  @if (authService.userProfile()?.bio) {
                    <p class="text-xs text-[#3a3a3c] dark:text-[#aeaeb2] mt-1.5 line-clamp-2 leading-relaxed italic">
                      "{{ authService.userProfile()?.bio }}"
                    </p>
                  }
                </div>

                <!-- Edit Button -->
                <button 
                  (click)="startEditingProfile()"
                  class="px-3.5 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] hover:bg-black/[0.08] dark:hover:bg-white/[0.15] text-[#007AFF] font-bold text-xs transition-colors shrink-0 ios-touch cursor-pointer">
                  Edit
                </button>
              </div>

              <!-- Extra Meta Row -->
              <div class="mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <div class="text-[10px] text-[#8e8e93] uppercase font-semibold">Birthday</div>
                  <div class="font-bold text-[#000000] dark:text-white mt-0.5 truncate">
                    {{ authService.birthday() || 'Not specified' }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-[#8e8e93] uppercase font-semibold">Sign-in Method</div>
                  <div class="font-bold text-[#000000] dark:text-white mt-0.5 truncate">
                    {{ authService.currentUser()?.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email & Password' }}
                  </div>
                </div>
                <div class="col-span-2 sm:col-span-1">
                  <div class="text-[10px] text-[#8e8e93] uppercase font-semibold">Saved Articles</div>
                  <div class="font-bold text-[#007AFF] mt-0.5">
                    {{ bookmarkManager.bookmarkedIds().length }} Items
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <!-- Apple Style Not Signed In Hero -->
            <div class="bg-white dark:bg-[#1c1c1e] rounded-[22px] p-6 sm:p-8 text-center shadow-xs border border-black/[0.06] dark:border-white/[0.08] ios-card">
              <div class="w-16 h-16 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-3.5">
                <mat-icon style="font-size: 32px; width: 32px; height: 32px;">account_circle</mat-icon>
              </div>
              <h2 class="text-xl font-bold text-[#000000] dark:text-white mb-1">
                Sign in to My Feed LK
              </h2>
              <p class="text-xs text-[#8e8e93] max-w-sm mx-auto mb-5 leading-relaxed">
                Save your favorite stories, sync bookmarks, join community discussions, and customize your tech reading experience.
              </p>
              <button 
                (click)="authService.openAuthModal('login')"
                class="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white font-bold text-xs rounded-full shadow-sm ios-touch cursor-pointer transition-all active:scale-95">
                Sign In / Create Account
              </button>
            </div>
          }
        </section>

        <!-- ========================================== -->
        <!-- 2. APPEARANCE / THEME CHANGER (SEGMENTED) -->
        <!-- ========================================== -->
        <section class="mb-6">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
            Appearance &amp; Display
          </h2>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] p-3.5 shadow-xs border border-black/[0.06] dark:border-white/[0.08] ios-card">
            <div class="flex items-center justify-between mb-3 px-1">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-[8px] bg-[#5856D6] text-white flex items-center justify-center">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">palette</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Color Theme</div>
                  <div class="text-[10px] text-[#8e8e93]">Choose light, dark, or system default</div>
                </div>
              </div>
              <span class="text-xs font-bold text-[#007AFF] capitalize">
                {{ themeManager.currentMode() }}
              </span>
            </div>

            <!-- iOS Segmented Control -->
            <div class="grid grid-cols-3 gap-1.5 p-1 bg-black/[0.05] dark:bg-white/[0.08] rounded-[14px]">
              
              <!-- Light Option -->
              <button 
                (click)="setTheme('light')"
                [class.bg-white]="themeManager.currentMode() === 'light'"
                [class.dark:bg-[#2c2c2e]]="themeManager.currentMode() === 'light'"
                [class.text-[#000000]]="themeManager.currentMode() === 'light'"
                [class.dark:text-white]="themeManager.currentMode() === 'light'"
                [class.shadow-xs]="themeManager.currentMode() === 'light'"
                [class.text-[#8e8e93]]="themeManager.currentMode() !== 'light'"
                class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-bold transition-all ios-touch cursor-pointer">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-amber-500">light_mode</mat-icon>
                <span>Light</span>
              </button>

              <!-- Dark Option -->
              <button 
                (click)="setTheme('dark')"
                [class.bg-white]="themeManager.currentMode() === 'dark'"
                [class.dark:bg-[#2c2c2e]]="themeManager.currentMode() === 'dark'"
                [class.text-[#000000]]="themeManager.currentMode() === 'dark'"
                [class.dark:text-white]="themeManager.currentMode() === 'dark'"
                [class.shadow-xs]="themeManager.currentMode() === 'dark'"
                [class.text-[#8e8e93]]="themeManager.currentMode() !== 'dark'"
                class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-bold transition-all ios-touch cursor-pointer">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-indigo-400">dark_mode</mat-icon>
                <span>Dark</span>
              </button>

              <!-- System Option -->
              <button 
                (click)="setTheme('system')"
                [class.bg-white]="themeManager.currentMode() === 'system'"
                [class.dark:bg-[#2c2c2e]]="themeManager.currentMode() === 'system'"
                [class.text-[#000000]]="themeManager.currentMode() === 'system'"
                [class.dark:text-white]="themeManager.currentMode() === 'system'"
                [class.shadow-xs]="themeManager.currentMode() === 'system'"
                [class.text-[#8e8e93]]="themeManager.currentMode() !== 'system'"
                class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[10px] text-xs font-bold transition-all ios-touch cursor-pointer">
                <mat-icon style="font-size: 15px; width: 15px; height: 15px;" class="text-[#007AFF]">settings_brightness</mat-icon>
                <span>System</span>
              </button>

            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- 3. SAVED ARTICLES (BOOKMARKS) INSET GROUP -->
        <!-- ========================================== -->
        <section class="mb-6">
          <div class="flex items-center justify-between px-3 mb-2">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              Saved Articles (කියවීමේ ලැයිස්තුව)
            </h2>
            <span class="text-xs font-bold text-[#007AFF]">
              {{ bookmarkedArticles().length }} Saved
            </span>
          </div>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ios-card">
            @if (bookmarkedArticles().length > 0) {
              <div class="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                @for (art of bookmarkedArticles(); track art.id) {
                  <div class="p-3.5 sm:p-4 flex items-center gap-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group">
                    
                    <!-- Article Thumbnail -->
                    <a [routerLink]="['/article', art.slug || art.id]" class="w-16 h-16 sm:w-20 sm:h-20 rounded-[12px] overflow-hidden bg-black/[0.03] dark:bg-white/[0.05] shrink-0 relative block">
                      <img [src]="art.imageUrl" [alt]="art.title" referrerpolicy="no-referrer" loading="lazy"
                           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </a>

                    <!-- Article Info -->
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5 text-[10px] font-bold text-[#8e8e93] uppercase mb-0.5">
                        <span class="text-[#007AFF]">{{ art.category }}</span>
                        <span>&bull;</span>
                        <span>{{ art.date }}</span>
                      </div>
                      <a [routerLink]="['/article', art.slug || art.id]" class="text-xs sm:text-sm font-bold text-[#000000] dark:text-white line-clamp-2 hover:text-[#007AFF] transition-colors leading-snug">
                        {{ art.title }}
                      </a>
                      <div class="flex items-center gap-2 mt-1 text-[11px] text-[#8e8e93]">
                        <span class="flex items-center gap-0.5">
                          <mat-icon style="font-size: 12px; width: 12px; height: 12px;">schedule</mat-icon>
                          {{ art.readTime }}
                        </span>
                      </div>
                    </div>

                    <!-- Remove Bookmark Action -->
                    <button 
                      (click)="bookmarkManager.toggleBookmark(art.id)"
                      class="p-2 rounded-full text-[#8e8e93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors ios-touch cursor-pointer shrink-0"
                      title="Remove from saved articles">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bookmark_remove</mat-icon>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <!-- Empty Saved Articles State -->
              <div class="p-8 text-center">
                <div class="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#8e8e93] flex items-center justify-center mx-auto mb-2.5">
                  <mat-icon style="font-size: 24px; width: 24px; height: 24px;">bookmark_border</mat-icon>
                </div>
                <h3 class="text-sm font-bold text-[#000000] dark:text-white mb-0.5">
                  No Saved Articles Yet
                </h3>
                <p class="text-xs text-[#8e8e93] max-w-xs mx-auto mb-4">
                  Tap the bookmark icon on any story to save it here for reading anytime.
                </p>
                <a routerLink="/" class="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold hover:bg-[#007AFF]/20 transition-colors ios-touch">
                  <span>Browse Latest Stories</span>
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">arrow_forward</mat-icon>
                </a>
              </div>
            }
          </div>
        </section>

        <!-- ========================================== -->
        <!-- 3.5 SERVICES & REWARDS MARKETPLACE         -->
        <!-- ========================================== -->
        <section class="mb-6">
          <div class="flex items-center justify-between px-3 mb-2">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              Services &amp; Rewards
            </h2>
          </div>
          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ios-card">
            <a routerLink="/store" class="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-touch cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-gradient-to-tr from-[#FF9500] to-[#FFCC00] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">storefront</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Quiz Marketplace</div>
                  <div class="text-[11px] text-[#8e8e93]">Exchange points for items</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-[#FF9500]/10 text-[#FF9500] rounded-full text-[10px] font-bold">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;">stars</mat-icon>
                  {{ authService.userProfile()?.quizPoints || 0 }} Pts
                </span>
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;" class="text-[#8e8e93] group-hover:translate-x-0.5 transition-transform">chevron_right</mat-icon>
              </div>
            </a>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- 4. OFFICIAL SOCIAL MEDIA CHANNELS (My Feed LK) -->
        <!-- ========================================== -->
        <section class="mb-6">
          <div class="flex items-center justify-between px-3 mb-2">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
              Official Channels (අපගේ සමාජ මාධ්‍ය ජාල)
            </h2>
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] px-2 py-0.5 rounded-full bg-[#007AFF]/10">
              Follow Us
            </span>
          </div>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.08] ios-card">
            
            <!-- Facebook Page Row -->
            <a 
              href="https://www.facebook.com/share/14rTT4XAjpi/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors ios-touch cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-[12px] bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1877F2]/20 group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <div>
                  <div class="text-sm font-bold text-[#000000] dark:text-white flex items-center gap-2">
                    <span>Facebook Page</span>
                    <span class="text-[11px] text-[#8e8e93] font-mono">&#64;myfeedlk</span>
                  </div>
                  <div class="text-xs text-[#8e8e93] mt-0.5">Follow our official Facebook page for latest updates</div>
                </div>
              </div>
              <div class="flex items-center gap-1 text-[#1877F2] font-bold text-xs">
                <span>Follow</span>
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">open_in_new</mat-icon>
              </div>
            </a>

            <!-- Instagram Page Row -->
            <a 
              href="https://www.instagram.com/My Feed LK?igsi=bmluczhwZHJpZ3Ez" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-colors ios-touch cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </div>
                <div>
                  <div class="text-sm font-bold text-[#000000] dark:text-white flex items-center gap-2">
                    <span>Instagram Profile</span>
                    <span class="text-[11px] text-[#8e8e93] font-mono">&#64;My Feed LK</span>
                  </div>
                  <div class="text-xs text-[#8e8e93] mt-0.5">Visual tech news, reels &amp; product reviews</div>
                </div>
              </div>
              <div class="flex items-center gap-1 text-[#E1306C] font-bold text-xs">
                <span>Follow</span>
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">open_in_new</mat-icon>
              </div>
            </a>

          </div>
        </section>

        <!-- ========================================== -->
        <!-- 5. SUBSCRIPTION & NOTIFICATIONS INSET -->
        <!-- ========================================== -->
        <section class="mb-6">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
            Subscriptions &amp; Alerts
          </h2>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.08] ios-card">
            
            <!-- Newsletter Subscription Row -->
            <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mail</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">MyFeed Tech Newsletter</div>
                  <div class="text-[11px] text-[#8e8e93]">Get daily tech &amp; AI briefings delivered to your inbox</div>
                </div>
              </div>

              <!-- Quick Subscribe Form -->
              <div class="flex items-center gap-2">
                <input 
                  type="email" 
                  [(ngModel)]="subscriberEmail" 
                  placeholder="name@email.com" 
                  class="px-3 py-1.5 rounded-[12px] bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs text-[#000000] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] w-44" />
                
                <button 
                  (click)="handleSubscribe()" 
                  [disabled]="isSubscribing() || !subscriberEmail"
                  class="px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white font-bold text-xs transition-colors shrink-0 ios-touch cursor-pointer">
                  @if (isSubscribing()) {
                    <span>...</span>
                  } @else {
                    <span>{{ subscribeSuccess() ? 'Subscribed!' : 'Join' }}</span>
                  }
                </button>
              </div>
            </div>

            <!-- Web Push Notifications Row -->
            <div class="p-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#FF9500] text-white flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">notifications_active</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Push Notifications</div>
                  <div class="text-[11px] text-[#8e8e93]">Instant alerts for breaking tech news &amp; launches</div>
                </div>
              </div>

              <!-- iOS Toggle Switch -->
              <button 
                (click)="togglePushNotifications()"
                class="w-12 h-7 rounded-full transition-colors relative p-0.5 cursor-pointer ios-touch shrink-0"
                [class.bg-[#34C759]]="webPushService.isSubscribed()"
                [class.bg-black/20]="!webPushService.isSubscribed()"
                [class.dark:bg-white/20]="!webPushService.isSubscribed()">
                <div class="w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
                     [class.translate-x-5]="webPushService.isSubscribed()"
                     [class.translate-x-0]="!webPushService.isSubscribed()"></div>
              </button>
            </div>

          </div>
        </section>

        <!-- ========================================== -->
        <!-- 5. WHATSAPP HELP, SUPPORT & FEEDBACK (iOS GROUP) -->
        <!-- ========================================== -->
        <section class="mb-6">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
            Help &amp; Feedback (සහය සහ ප්‍රතිචාර)
          </h2>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.08] ios-card">
            
            <!-- Direct WhatsApp Chat Row -->
            <a 
              href="https://wa.me/94710947871?text=Hello%20My Feed LK%20Team!%20I%20need%20support%20or%20have%20an%20inquiry." 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-touch cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#25D366]/20">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">chat</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white flex items-center gap-1.5">
                    <span>WhatsApp Direct Support</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#25D366]/10 text-[#25D366]">071 094 7871</span>
                  </div>
                  <div class="text-[11px] text-[#8e8e93]">Instant direct chat with editorial &amp; developer desk</div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 text-[#25D366] font-bold text-xs">
                <span>Chat</span>
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">open_in_new</mat-icon>
              </div>
            </a>

            <!-- Interactive WhatsApp Feedback & Suggestions Row -->
            <button 
              (click)="openWhatsAppFeedbackModal()"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-touch cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#007AFF]/20">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">rate_review</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Send Feedback &amp; Suggestions</div>
                  <div class="text-[11px] text-[#8e8e93]">Submit feature ideas, bug reports or news tips via WhatsApp</div>
                </div>
              </div>
              <mat-icon class="text-[#8e8e93] group-hover:translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
            </button>

            <!-- Direct Hotline Call Row -->
            <a 
              href="tel:+94710947871"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-touch cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#34C759] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#34C759]/20">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">call</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Editorial Phone Hotline</div>
                  <div class="text-[11px] text-[#8e8e93]">Voice call support: +94 71 094 7871</div>
                </div>
              </div>
              <mat-icon class="text-[#8e8e93]" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
            </a>

          </div>
        </section>

        <!-- ========================================== -->
        <!-- 6. ABOUT US & EDITORIAL MISSION INSET -->
        <!-- ========================================== -->
        <section class="mb-6">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
            About &amp; Editorial Standards
          </h2>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden divide-y divide-black/[0.06] dark:divide-white/[0.08] ios-card">
            
            <!-- About Us Row -->
            <button 
              (click)="openAboutModal()"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-touch cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#34C759] text-white flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">info</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">About My Feed LK</div>
                  <div class="text-[11px] text-[#8e8e93]">Sri Lanka's leading tech news &amp; AI journalism hub</div>
                </div>
              </div>
              <mat-icon class="text-[#8e8e93]" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
            </button>

            <!-- Terms & Privacy Row -->
            <button 
              (click)="openTermsModal()"
              class="w-full p-4 flex items-center justify-between text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors ios-touch cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#AF52DE] text-white flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">policy</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Terms &amp; Privacy Policy</div>
                  <div class="text-[11px] text-[#8e8e93]">User privacy, AI transparency &amp; editorial ethics</div>
                </div>
              </div>
              <mat-icon class="text-[#8e8e93]" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
            </button>

            <!-- Storage & Offline Cache Row -->
            <div class="p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-[#8e8e93] text-white flex items-center justify-center shrink-0">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">cached</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Offline Cache &amp; Storage</div>
                  <div class="text-[11px] text-[#8e8e93]">{{ cacheStatusText() }}</div>
                </div>
              </div>
              <button 
                (click)="clearOfflineCache()"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-xs font-bold text-[#007AFF] hover:bg-black/[0.08] dark:hover:bg-white/[0.15] transition-colors ios-touch cursor-pointer">
                Clear
              </button>
            </div>

            <!-- Version Info -->
            <div class="p-4 flex items-center justify-between text-xs">
              <span class="text-[#8e8e93]">Application Version</span>
              <span class="font-bold text-[#000000] dark:text-white font-mono">v2.4.0 (iOS Edition)</span>
            </div>

          </div>
        </section>

                <!-- ========================================== -->
        <!-- DEVELOPER PROFILE -->
        <!-- ========================================== -->
        <section class="mb-6">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
            Creator & Developer
          </h2>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ios-card">
            <a routerLink="/developer" class="p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">code</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Developer Profile</div>
                  <div class="text-[11px] text-[#8e8e93]">Kaveen Sandeepa</div>
                </div>
              </div>
              <mat-icon class="text-purple-500 group-hover:translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
            </a>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- 6. ADMIN CONTROL LINK (IF ADMIN) -->
        <!-- ========================================== -->
        @if (authService.isAdmin()) {
          <section class="mb-6">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
              Management &amp; Controls
            </h2>

            <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ios-card">
              <a routerLink="/admin" class="p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-[9px] bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">admin_panel_settings</mat-icon>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-[#000000] dark:text-white">Admin Control Dashboard</div>
                    <div class="text-[11px] text-[#8e8e93]">Publish news, AI autopilot, and analytics</div>
                  </div>
                </div>
                <mat-icon class="text-[#007AFF] group-hover:translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">chevron_right</mat-icon>
              </a>
            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 7. ACCOUNT ACTIONS (DESTRUCTIVE / LOGOUT) -->
        <!-- ========================================== -->
        @if (authService.currentUser()) {
          <section class="mb-8">
            <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ios-card">
              <button 
                (click)="handleLogout()"
                class="w-full p-4 text-center font-bold text-xs sm:text-sm text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-colors ios-touch cursor-pointer flex items-center justify-center gap-1.5">
                <mat-icon style="font-size: 17px; width: 17px; height: 17px;">logout</mat-icon>
                <span>Sign Out of Account</span>
              </button>
            </div>
          </section>
        }

      </main>

      <!-- ========================================== -->
      <!-- MODAL: EDIT PROFILE SHEET (iOS STYLE) -->
      <!-- ========================================== -->
      @if (isEditingProfile()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white dark:bg-[#1c1c1e] rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.1] relative animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-bold text-[#000000] dark:text-white">
                Edit Profile
              </h3>
              <button (click)="cancelEditingProfile()" class="p-1.5 rounded-full text-[#8e8e93] hover:text-[#000000] dark:hover:text-white ios-touch cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <form (ngSubmit)="saveProfileChanges()" class="space-y-4">
              
              <!-- Avatar Upload -->
              <div>
                <span class="block text-[11px] font-bold text-[#8e8e93] uppercase mb-2">
                  Profile Photo
                </span>
                <div class="flex items-center gap-3.5">
                  <div class="w-16 h-16 rounded-full overflow-hidden bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shrink-0">
                    @if (editPhotoURL) {
                      <img [src]="editPhotoURL" alt="Preview" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-[#007AFF] font-bold text-xl bg-[#007AFF]/10">
                        {{ authService.userInitials() }}
                      </div>
                    }
                  </div>
                  <div>
                    <input type="file" id="photoInput" accept="image/*" class="hidden" (change)="onFileSelected($event)">
                    <label for="photoInput" class="px-3.5 py-1.5 bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] rounded-full text-xs font-bold cursor-pointer transition-colors inline-block ios-touch">
                      Change Photo
                    </label>
                    <p class="text-[10px] text-[#8e8e93] mt-1">Image will be auto-optimized.</p>
                  </div>
                </div>
              </div>

              <!-- Display Name -->
              <div>
                <label for="editName" class="block text-[11px] font-bold text-[#8e8e93] uppercase mb-1.5">
                  Display Name
                </label>
                <input 
                  type="text" 
                  id="editName"
                  [(ngModel)]="editName" 
                  name="editName" 
                  required
                  class="w-full px-4 py-2.5 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#000000] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
              </div>

              <!-- Birthday -->
              <div>
                <label for="editBirthday" class="block text-[11px] font-bold text-[#8e8e93] uppercase mb-1.5">
                  Birthday (උපන් දිනය)
                </label>
                <input 
                  type="date" 
                  id="editBirthday"
                  [(ngModel)]="editBirthday" 
                  name="editBirthday" 
                  max="2020-01-01"
                  min="1920-01-01"
                  class="w-full px-4 py-2.5 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#000000] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
              </div>

              <!-- Bio -->
              <div>
                <label for="editBio" class="block text-[11px] font-bold text-[#8e8e93] uppercase mb-1.5">
                  Short Bio
                </label>
                <textarea 
                  id="editBio"
                  [(ngModel)]="editBio" 
                  name="editBio" 
                  rows="2"
                  placeholder="A few words about your tech interests..."
                  class="w-full px-4 py-2.5 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#000000] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"></textarea>
              </div>

              <!-- Modal Actions -->
              <div class="flex items-center gap-2.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button 
                  type="submit" 
                  [disabled]="authService.isProcessing() || !editName"
                  class="flex-1 py-2.5 px-4 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm ios-touch cursor-pointer">
                  @if (authService.isProcessing()) {
                    <mat-icon class="animate-spin" style="font-size: 15px; width: 15px; height: 15px;">sync</mat-icon>
                    <span>Saving...</span>
                  } @else {
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">save</mat-icon>
                    <span>Save Changes</span>
                  }
                </button>
                <button 
                  type="button" 
                  (click)="cancelEditingProfile()"
                  class="py-2.5 px-4 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[#000000] dark:text-white font-bold text-xs ios-touch cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: ABOUT US (iOS DETAIL SHEET) -->
      <!-- ========================================== -->
      @if (showAboutModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white dark:bg-[#1c1c1e] rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.1] relative animate-scale-up max-h-[85vh] overflow-y-auto">
            
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-[10px] bg-[#34C759] text-white flex items-center justify-center font-bold">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">info</mat-icon>
                </div>
                <div>
                  <h3 class="text-base font-bold text-[#000000] dark:text-white">About My Feed LK</h3>
                  <p class="text-[10px] text-[#8e8e93]">Sri Lanka's Premier Tech Journalism Hub</p>
                </div>
              </div>
              <button (click)="closeAboutModal()" class="p-1 rounded-full text-[#8e8e93] hover:text-[#000000] dark:hover:text-white ios-touch cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <div class="space-y-3.5 text-xs text-[#3a3a3c] dark:text-[#d1d1d6] leading-relaxed">
              <p>
                <strong>My Feed LK</strong> is dedicated to delivering accurate, fast, and insightful technology news, AI developments, gadget reviews, and startup stories to Sri Lanka and the global tech community.
              </p>
              
              <div class="p-3.5 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
                <div class="text-[11px] font-bold text-[#000000] dark:text-white mb-1">Editorial Leadership</div>
                <p class="text-[11px] text-[#8e8e93]">
                  Founded &amp; Directed by <strong>Kaveen Sandeepa</strong> (Editor-in-Chief). Supervised by an experienced technical editorial desk committed to journalistic integrity and source fact-checking.
                </p>
              </div>

              <div class="p-3.5 rounded-[16px] bg-[#007AFF]/5 border border-[#007AFF]/15">
                <div class="text-[11px] font-bold text-[#007AFF] mb-1">AI-Powered Journalism with Human Oversight</div>
                <p class="text-[11px] text-[#8e8e93]">
                  We utilize advanced Gemini AI models for multilingual synthesis, fact-verification indexing, and intelligent summarization — always audited under stringent editorial standards.
                </p>
              </div>

              <div class="text-[11px] text-[#8e8e93] pt-2">
                Have a tip, partnership, or story? Contact us at: <span class="font-bold text-[#007AFF]">contact&#64;My Feed LK</span>
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
              <button (click)="closeAboutModal()" class="px-5 py-2 rounded-full bg-[#007AFF] text-white font-bold text-xs ios-touch cursor-pointer">
                Done
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: TERMS & PRIVACY (iOS DETAIL SHEET) -->
      <!-- ========================================== -->
      @if (showTermsModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white dark:bg-[#1c1c1e] rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.1] relative animate-scale-up max-h-[85vh] overflow-y-auto">
            
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-[10px] bg-[#AF52DE] text-white flex items-center justify-center font-bold">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">policy</mat-icon>
                </div>
                <div>
                  <h3 class="text-base font-bold text-[#000000] dark:text-white">Terms &amp; Privacy Policy</h3>
                  <p class="text-[10px] text-[#8e8e93]">User Rights, Data Protection &amp; Guidelines</p>
                </div>
              </div>
              <button (click)="closeTermsModal()" class="p-1 rounded-full text-[#8e8e93] hover:text-[#000000] dark:hover:text-white ios-touch cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <div class="space-y-3.5 text-xs text-[#3a3a3c] dark:text-[#d1d1d6] leading-relaxed">
              <div>
                <h4 class="font-bold text-[#000000] dark:text-white mb-1">1. User Privacy &amp; Advertising Standards</h4>
                <p class="text-[#8e8e93] text-[11px]">
                  My Feed LK (www.myfeedlk.com) values your privacy. We store essential authentication credentials and local preferences securely. We use Google AdSense to serve non-intrusive, relevant advertisements. Google may use DART cookies to serve ads based on browsing activity. You can customize ad settings via Google Ads Preferences.
                </p>
              </div>

              <div>
                <h4 class="font-bold text-[#000000] dark:text-white mb-1">2. AI Transparency &amp; Content Ethics</h4>
                <p class="text-[#8e8e93] text-[11px]">
                  All AI-assisted articles feature transparent metadata disclosures, original source citations, and editorial verification to maintain maximum journalistic integrity in Sinhala and English.
                </p>
              </div>

              <div>
                <h4 class="font-bold text-[#000000] dark:text-white mb-1">3. Community Guidelines &amp; Comments</h4>
                <p class="text-[#8e8e93] text-[11px]">
                  Readers must maintain respectful, constructive dialogue in discussion threads. Defamatory, spam, or malicious posts are automatically filtered and removed by moderators.
                </p>
              </div>

              <div>
                <h4 class="font-bold text-[#000000] dark:text-white mb-1">4. Full Legal Disclosures</h4>
                <p class="text-[#8e8e93] text-[11px]">
                  For our comprehensive policies, read our full <a routerLink="/privacy" (click)="closeTermsModal()" class="text-[#007AFF] underline font-semibold">Privacy Policy</a> and <a routerLink="/terms" (click)="closeTermsModal()" class="text-[#007AFF] underline font-semibold">Terms &amp; Conditions</a>.
                </p>
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex justify-end">
              <button (click)="closeTermsModal()" class="px-5 py-2 rounded-full bg-[#007AFF] text-white font-bold text-xs ios-touch cursor-pointer">
                I Understand
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- MODAL: WHATSAPP FEEDBACK & SUPPORT SHEET -->
      <!-- ========================================== -->
      @if (showWhatsAppFeedbackModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white dark:bg-[#1c1c1e] rounded-[28px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.1] relative animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-[11px] bg-[#25D366] text-white flex items-center justify-center font-bold shadow-md shadow-[#25D366]/20">
                  <mat-icon style="font-size: 20px; width: 20px; height: 20px;">chat</mat-icon>
                </div>
                <div>
                  <h3 class="text-base font-bold text-[#000000] dark:text-white flex items-center gap-1.5">
                    <span>WhatsApp Help &amp; Feedback</span>
                  </h3>
                  <p class="text-[10px] text-[#8e8e93]">Direct Contact: +94 71 094 7871</p>
                </div>
              </div>
              <button (click)="closeWhatsAppFeedbackModal()" class="p-1 rounded-full text-[#8e8e93] hover:text-[#000000] dark:hover:text-white ios-touch cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">close</mat-icon>
              </button>
            </div>

            <!-- Feedback Form -->
            <div class="space-y-4">
              
              <!-- Quick Category Chips -->
              <div>
                <span class="block text-[11px] font-bold text-[#8e8e93] uppercase mb-2">
                  Category (වර්ගය)
                </span>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    (click)="setFeedbackCategory('Feature Suggestion / Idea')"
                    [class.bg-[#007AFF]]="feedbackCategory === 'Feature Suggestion / Idea'"
                    [class.text-white]="feedbackCategory === 'Feature Suggestion / Idea'"
                    [class.border-transparent]="feedbackCategory === 'Feature Suggestion / Idea'"
                    class="p-2.5 rounded-[12px] border border-black/[0.08] dark:border-white/[0.1] text-[11px] font-bold text-left transition-all ios-touch cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">lightbulb</mat-icon>
                    <span>💡 Feature Idea</span>
                  </button>

                  <button 
                    type="button"
                    (click)="setFeedbackCategory('Bug Report / Issue')"
                    [class.bg-[#FF3B30]]="feedbackCategory === 'Bug Report / Issue'"
                    [class.text-white]="feedbackCategory === 'Bug Report / Issue'"
                    [class.border-transparent]="feedbackCategory === 'Bug Report / Issue'"
                    class="p-2.5 rounded-[12px] border border-black/[0.08] dark:border-white/[0.1] text-[11px] font-bold text-left transition-all ios-touch cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">bug_report</mat-icon>
                    <span>🐞 Bug Report</span>
                  </button>

                  <button 
                    type="button"
                    (click)="setFeedbackCategory('Submit News Tip / Story')"
                    [class.bg-[#AF52DE]]="feedbackCategory === 'Submit News Tip / Story'"
                    [class.text-white]="feedbackCategory === 'Submit News Tip / Story'"
                    [class.border-transparent]="feedbackCategory === 'Submit News Tip / Story'"
                    class="p-2.5 rounded-[12px] border border-black/[0.08] dark:border-white/[0.1] text-[11px] font-bold text-left transition-all ios-touch cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">newspaper</mat-icon>
                    <span>📰 News Tip</span>
                  </button>

                  <button 
                    type="button"
                    (click)="setFeedbackCategory('General Support & Help')"
                    [class.bg-[#25D366]]="feedbackCategory === 'General Support & Help'"
                    [class.text-white]="feedbackCategory === 'General Support & Help'"
                    [class.border-transparent]="feedbackCategory === 'General Support & Help'"
                    class="p-2.5 rounded-[12px] border border-black/[0.08] dark:border-white/[0.1] text-[11px] font-bold text-left transition-all ios-touch cursor-pointer flex items-center gap-1.5">
                    <mat-icon style="font-size: 15px; width: 15px; height: 15px;">support_agent</mat-icon>
                    <span>💬 General Help</span>
                  </button>
                </div>
              </div>

              <!-- Message Input -->
              <div>
                <label for="feedbackMsg" class="block text-[11px] font-bold text-[#8e8e93] uppercase mb-1.5">
                  Your Message / Feedback (ඔබේ අදහස හෝ ගැටලුව)
                </label>
                <textarea 
                  id="feedbackMsg"
                  [(ngModel)]="feedbackMessage" 
                  rows="3"
                  placeholder="Type your message, suggestion or issue here..."
                  class="w-full px-4 py-2.5 rounded-[14px] bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs sm:text-sm text-[#000000] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"></textarea>
              </div>

              <!-- Info Card -->
              <div class="p-3 rounded-[14px] bg-[#25D366]/10 border border-[#25D366]/20 flex items-start gap-2.5 text-[11px] text-[#25D366] dark:text-[#34D399]">
                <mat-icon class="shrink-0" style="font-size: 18px; width: 18px; height: 18px;">security</mat-icon>
                <span>Tapping send will open WhatsApp with your formatted message ready to deliver directly to the editorial team.</span>
              </div>

              <!-- Modal Actions -->
              <div class="flex items-center gap-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button 
                  type="button" 
                  (click)="sendWhatsAppFeedback()"
                  class="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full font-bold text-xs transition-all shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 ios-touch cursor-pointer active:scale-98">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">send</mat-icon>
                  <span>Open &amp; Send in WhatsApp</span>
                </button>
                <button 
                  type="button" 
                  (click)="closeWhatsAppFeedbackModal()"
                  class="py-3 px-4 rounded-full bg-black/[0.05] dark:bg-white/[0.1] text-[#000000] dark:text-white font-bold text-xs ios-touch cursor-pointer">
                  Cancel
                </button>
              </div>

            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  readonly bookmarkManager = inject(BookmarkManager);
  readonly themeManager = inject(ThemeManager);
  readonly articleService = inject(ArticleService);
  readonly webPushService = inject(WebPushService);
  readonly subscriberService = inject(SubscriberService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isEditingProfile = signal(false);
  showAboutModal = signal(false);
  showTermsModal = signal(false);
  showWhatsAppFeedbackModal = signal(false);
  
  feedbackCategory = 'Feature Suggestion / Idea';
  feedbackMessage = '';
  
  editName = '';
  editBirthday = '';
  editBio = '';
  editPhotoURL = '';

  subscriberEmail = '';
  isSubscribing = signal(false);
  subscribeSuccess = signal(false);
  cacheStatusText = signal('Active & Up to date');

  readonly bookmarkedArticles = computed(() => {
    const ids = this.bookmarkManager.bookmarkedIds();
    return this.articleService.articles().filter(a => ids.includes(a.id));
  });

  setTheme(mode: ThemeMode) {
    this.themeManager.setMode(mode);
  }

  startEditingProfile() {
    this.editName = this.authService.displayName();
    this.editBirthday = this.authService.birthday();
    this.editBio = this.authService.userProfile()?.bio || '';
    this.editPhotoURL = this.authService.userProfile()?.photoURL || '';
    this.isEditingProfile.set(true);
  }

  cancelEditingProfile() {
    this.isEditingProfile.set(false);
  }

  openAboutModal() {
    this.showAboutModal.set(true);
  }

  closeAboutModal() {
    this.showAboutModal.set(false);
  }

  openTermsModal() {
    this.showTermsModal.set(true);
  }

  closeTermsModal() {
    this.showTermsModal.set(false);
  }

  openWhatsAppFeedbackModal() {
    this.showWhatsAppFeedbackModal.set(true);
  }

  closeWhatsAppFeedbackModal() {
    this.showWhatsAppFeedbackModal.set(false);
  }

  setFeedbackCategory(category: string) {
    this.feedbackCategory = category;
  }

  sendWhatsAppFeedback() {
    const userName = this.authService.displayName() || 'Reader';
    const userEmail = this.authService.currentUser()?.email || 'Guest';
    const msg = this.feedbackMessage.trim() || 'No specific text provided.';

    const formattedText = `*My Feed LK Feedback & Support Request*\n\n` +
      `📌 *Category:* ${this.feedbackCategory}\n` +
      `👤 *User:* ${userName} (${userEmail})\n\n` +
      `💬 *Message:* \n${msg}\n\n` +
      `📱 *Sent from:* My Feed LK iOS Web App`;

    const encoded = encodeURIComponent(formattedText);
    const waUrl = `https://wa.me/94710947871?text=${encoded}`;
    
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
    this.closeWhatsAppFeedbackModal();
    this.feedbackMessage = '';
  }

  async togglePushNotifications() {
    if (this.webPushService.isSubscribed()) {
      await this.webPushService.unsubscribe();
    } else {
      await this.webPushService.subscribe();
    }
    this.cdr.markForCheck();
  }

  async handleSubscribe() {
    if (!this.subscriberEmail || !this.subscriberEmail.includes('@')) return;
    this.isSubscribing.set(true);
    try {
      await this.subscriberService.subscribe(this.subscriberEmail);
      this.subscribeSuccess.set(true);
      this.subscriberEmail = '';
      setTimeout(() => {
        this.subscribeSuccess.set(false);
      }, 4000);
    } catch (e) {
      console.error('Subscription error', e);
    } finally {
      this.isSubscribing.set(false);
      this.cdr.markForCheck();
    }
  }

  clearOfflineCache() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('myfeed_cached_articles');
        sessionStorage.clear();
        this.cacheStatusText.set('Cache Cleared ✓');
        setTimeout(() => {
          this.cacheStatusText.set('Active & Up to date');
          this.cdr.markForCheck();
        }, 3000);
      } catch (e) {
        console.error('Error clearing cache', e);
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
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
          this.editPhotoURL = canvas.toDataURL('image/jpeg', 0.8);
          this.cdr.markForCheck();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      input.value = '';
    }
  }

  async saveProfileChanges() {
    if (!this.editName) return;
    const ok = await this.authService.updateProfileDetails({
      displayName: this.editName,
      birthday: this.editBirthday,
      bio: this.editBio,
      photoURL: this.editPhotoURL
    });
    if (ok) {
      this.isEditingProfile.set(false);
    }
  }

  async handleLogout() {
    await this.authService.signOutUser();
    this.router.navigate(['/']);
  }
}
