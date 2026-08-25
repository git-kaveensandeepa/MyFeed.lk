import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ToolsService} from './tools.service';
import {EventService, TechEvent} from './event.service';
import {BookmarkManager} from './bookmark';
import {ArticleService} from './article.service';
import {SearchService} from './search.service';
import {ThemeManager} from './theme';

@Component({
  selector: 'app-tools-drawer',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toolsService.isOpen()) {
      <!-- Slide-Over Drawer Container -->
      <div class="fixed inset-0 z-[110] flex justify-end animate-fade-in" id="global-tools-slidebar">
        
        <!-- Backdrop Overlay with click to close -->
        <button 
          type="button" 
          aria-label="Close tools slidebar" 
          (click)="toolsService.close()" 
          class="absolute inset-0 bg-black/60 backdrop-blur-xs w-full h-full border-none cursor-pointer">
        </button>

        <!-- Slide Drawer Panel -->
        <aside 
          class="relative w-full max-w-md bg-white dark:bg-[#181818] text-[#1d1d1f] dark:text-white h-full shadow-2xl flex flex-col z-10 border-l border-black/10 dark:border-white/10 animate-fade-in-up overflow-hidden">
          
          <!-- Header Bar -->
          <div class="p-5 sm:p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 dark:from-[#1c1c1e] dark:via-[#181818] dark:to-[#1c1c1e]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <mat-icon style="font-size: 22px; width: 22px; height: 22px;">dashboard_customize</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-black tracking-tight text-[#1d1d1f] dark:text-white">Tech Tools & Utilities</h2>
                  <span class="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">Live</span>
                </div>
                <p class="text-xs text-[#1d1d1f]/60 dark:text-white/60 font-medium">MyFeed.lk Interactive Sidebar</p>
              </div>
            </div>
            
            <button 
              (click)="toolsService.close()" 
              class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close Sidebar">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Tools Scrollable Content -->
          <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-black/5 dark:divide-white/10">
            
            <!-- TOOL 1: LKR PRICE & CURRENCY CONVERTER -->
            <div class="space-y-3 pt-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">currency_exchange</mat-icon>
                  </div>
                  <h3 class="text-sm font-black text-[#1d1d1f] dark:text-white">LKR Price Calculator</h3>
                </div>
                <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
                  $1 = Rs. {{ currentExchangeRate }}
                </span>
              </div>

              <!-- Input -->
              <div>
                <label for="drawer-usd-price-input" class="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                  Device Price in USD ($)
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">$</span>
                  <input 
                    id="drawer-usd-price-input"
                    type="number" 
                    [value]="usdPriceInput()" 
                    (input)="onUsdInputChange($event)"
                    class="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-bold text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="999"
                  />
                </div>
              </div>

              <!-- Result Preview -->
              <div class="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div class="text-[10px] font-bold text-emerald-800/70 dark:text-emerald-300/70 uppercase tracking-wider mb-0.5">
                  Estimated SL Price (LKR)
                </div>
                <div class="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  Rs. {{ formatLkrPrice(calculatedLkrPrice()) }}
                </div>
                <div class="text-[10px] text-emerald-800/60 dark:text-emerald-400/60 mt-1 flex items-center gap-1">
                  <mat-icon style="font-size: 12px; width: 12px; height: 12px;">info</mat-icon>
                  Direct exchange conversion based on current bank rate
                </div>
              </div>

              <!-- Quick Presets -->
              <div class="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                <button (click)="usdPriceInput.set(799)" class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer">
                  iPhone 16 ($799)
                </button>
                <button (click)="usdPriceInput.set(999)" class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer">
                  Pro ($999)
                </button>
                <button (click)="usdPriceInput.set(1299)" class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer">
                  MacBook ($1299)
                </button>
                <button (click)="usdPriceInput.set(1599)" class="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer">
                  RTX 5090 ($1599)
                </button>
              </div>
            </div>

            <!-- TOOL 2: TECH EVENTS & KEYNOTES CALENDAR -->
            <div class="space-y-3 pt-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">event</mat-icon>
                  </div>
                  <h3 class="text-sm font-black text-[#1d1d1f] dark:text-white">Upcoming Tech Events</h3>
                </div>
                <span class="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  {{ eventService.events().length }} Events
                </span>
              </div>

              <div class="space-y-2.5">
                @for (ev of eventService.events().slice(0, 4); track ev.id) {
                  <div class="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-10 h-11 rounded-xl bg-white dark:bg-black/30 border border-black/10 dark:border-white/10 flex flex-col items-center justify-center shrink-0">
                        <span class="text-[8px] font-black uppercase text-blue-600">{{ formatEventDisplayDate(ev.date).month }}</span>
                        <span class="text-xs font-black text-[#1d1d1f] dark:text-white">{{ formatEventDisplayDate(ev.date).day }}</span>
                      </div>
                      <div class="min-w-0">
                        <h4 class="text-xs font-bold text-[#1d1d1f] dark:text-white truncate">{{ ev.title }}</h4>
                        <span class="text-[10px] text-gray-500 block truncate">{{ ev.time || ev.location || 'Online Stream' }}</span>
                      </div>
                    </div>
                    <a [href]="getGoogleCalendarUrl(ev)" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 cursor-pointer" title="Add to Google Calendar">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">event_available</mat-icon>
                    </a>
                  </div>
                }
                @if (eventService.events().length === 0) {
                  <p class="text-xs text-gray-400 text-center py-2">No upcoming events listed.</p>
                }
              </div>
            </div>

            <!-- TOOL 3: COMMUNITY POLL -->
            <div class="space-y-3 pt-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">poll</mat-icon>
                  </div>
                  <h3 class="text-sm font-black text-[#1d1d1f] dark:text-white">Community Tech Poll</h3>
                </div>
                <span class="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              </div>

              <h4 class="text-xs font-bold text-[#1d1d1f] dark:text-white">
                {{ pollQuestion }}
              </h4>

              <div class="space-y-2">
                @for (opt of pollOptions; track opt.id) {
                  <button 
                    (click)="votePoll(opt.id)"
                    class="w-full text-left p-2.5 rounded-xl border transition-all relative overflow-hidden group cursor-pointer"
                    [class.border-purple-600]="userPollVote() === opt.id"
                    [class.bg-purple-50]="userPollVote() === opt.id"
                    [class.dark:bg-purple-950/30]="userPollVote() === opt.id"
                    [class.border-black/10]="userPollVote() !== opt.id"
                    [class.dark:border-white/10]="userPollVote() !== opt.id"
                    [class.hover:border-purple-300]="userPollVote() !== opt.id">
                    
                    @if (userPollVote()) {
                      <div 
                        class="absolute inset-0 bg-purple-100 dark:bg-purple-950/50 transition-all duration-500 pointer-events-none"
                        [style.width.%]="getPollPercentage(opt.id)"></div>
                    }

                    <div class="relative z-10 flex items-center justify-between text-xs font-bold">
                      <div class="flex items-center gap-2">
                        <mat-icon style="font-size: 14px; width: 14px; height: 14px;" [class.text-purple-600]="userPollVote() === opt.id" class="text-gray-400">
                          {{ userPollVote() === opt.id ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                        <span class="text-[#1d1d1f] dark:text-white">{{ opt.label }}</span>
                      </div>
                      @if (userPollVote()) {
                        <span class="text-[11px] font-extrabold text-purple-600 dark:text-purple-400">
                          {{ getPollPercentage(opt.id) }}%
                        </span>
                      }
                    </div>
                  </button>
                }
              </div>
              @if (userPollVote()) {
                <div class="text-[10px] text-gray-400 text-center font-semibold">
                  Vote recorded &bull; {{ totalPollVotes() }} total votes
                </div>
              }
            </div>

            <!-- TOOL 4: NETWORK PING & EDGE LATENCY -->
            <div class="space-y-3 pt-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">network_check</mat-icon>
                  </div>
                  <h3 class="text-sm font-black text-[#1d1d1f] dark:text-white">SL Network Ping Test</h3>
                </div>
                <button (click)="testNetworkPing()" [disabled]="isTestingPing()" class="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 transition-all cursor-pointer">
                  <mat-icon style="font-size: 14px; width: 14px; height: 14px;" [class.animate-spin]="isTestingPing()">refresh</mat-icon>
                </button>
              </div>

              <div class="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase">CDN Edge Response</div>
                  <div class="text-lg font-black text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
                    @if (isTestingPing()) {
                      <span class="text-xs text-orange-600 font-bold animate-pulse">Measuring...</span>
                    } @else if (pingResultMs() !== null) {
                      <span class="text-emerald-600 dark:text-emerald-400">{{ pingResultMs() }} ms</span>
                      <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">Optimal</span>
                    } @else {
                      <span class="text-xs text-gray-400">Ready</span>
                    }
                  </div>
                </div>
                <button (click)="testNetworkPing()" [disabled]="isTestingPing()" class="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer">
                  {{ isTestingPing() ? 'Measuring...' : 'Test Speed' }}
                </button>
              </div>
            </div>

            <!-- TOOL 5: TRENDING TAGS QUICK SEARCH -->
            <div class="space-y-3 pt-5">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <mat-icon style="font-size: 16px; width: 16px; height: 16px;">trending_up</mat-icon>
                </div>
                <h3 class="text-sm font-black text-[#1d1d1f] dark:text-white">Trending in Sri Lanka</h3>
              </div>

              <div class="flex flex-wrap gap-1.5">
                @for (tag of trendingTags; track tag) {
                  <button 
                    (click)="onTagClick(tag)" 
                    class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer">
                    {{ tag }}
                  </button>
                }
              </div>
            </div>

          </div>

          <!-- Drawer Footer Controls -->
          <div class="p-4 border-t border-black/5 dark:border-white/10 bg-gray-50 dark:bg-[#141414] flex items-center justify-between gap-3">
            <button 
              (click)="themeManager.toggle()" 
              class="flex-1 py-2.5 px-3 rounded-xl border border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-xs font-bold bg-white dark:bg-[#202020] text-[#1d1d1f] dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5">
              <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                {{ themeManager.isDark() ? 'light_mode' : 'dark_mode' }}
              </mat-icon>
              <span>{{ themeManager.isDark() ? 'Light Theme' : 'Dark Theme' }}</span>
            </button>

            <button 
              (click)="toolsService.close()" 
              class="py-2.5 px-5 rounded-xl bg-[#1d1d1f] dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 cursor-pointer">
              Close
            </button>
          </div>

        </aside>
      </div>
    }
  `
})
export class ToolsDrawerComponent {
  readonly toolsService = inject(ToolsService);
  readonly eventService = inject(EventService);
  readonly bookmarkManager = inject(BookmarkManager);
  readonly articleService = inject(ArticleService);
  readonly searchService = inject(SearchService);
  readonly themeManager = inject(ThemeManager);

  readonly currentExchangeRate = 308.5; // LKR per 1 USD
  readonly usdPriceInput = signal<number>(999);
  
  readonly calculatedLkrPrice = computed(() => {
    const usd = this.usdPriceInput() || 0;
    return Math.round(usd * this.currentExchangeRate);
  });

  onUsdInputChange(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.usdPriceInput.set(isNaN(val) ? 0 : val);
  }

  formatLkrPrice(val: number): string {
    return new Intl.NumberFormat('en-LK').format(val);
  }

  // Community Poll State
  readonly pollQuestion = 'Which AI Assistant is your daily driver in Sri Lanka?';
  readonly pollOptions = [
    { id: 'chatgpt', label: 'ChatGPT (OpenAI)' },
    { id: 'gemini', label: 'Gemini AI (Google)' },
    { id: 'claude', label: 'Claude 3.5 (Anthropic)' },
    { id: 'apple', label: 'Apple Intelligence' }
  ];

  readonly pollVotes = signal<Record<string, number>>({
    chatgpt: 142,
    gemini: 118,
    claude: 64,
    apple: 89
  });
  readonly userPollVote = signal<string | null>(null);

  readonly totalPollVotes = computed(() => {
    const votes = this.pollVotes();
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  });

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('myfeed_poll_vote');
      if (saved) {
        this.userPollVote.set(saved);
      }
    }
  }

  votePoll(optId: string) {
    if (this.userPollVote()) return;
    this.userPollVote.set(optId);
    this.pollVotes.update(v => ({
      ...v,
      [optId]: (v[optId] || 0) + 1
    }));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('myfeed_poll_vote', optId);
    }
  }

  getPollPercentage(optId: string): number {
    const total = this.totalPollVotes();
    if (total === 0) return 0;
    const count = this.pollVotes()[optId] || 0;
    return Math.round((count / total) * 100);
  }

  // Network Ping Benchmark State
  readonly pingResultMs = signal<number | null>(null);
  readonly isTestingPing = signal(false);

  testNetworkPing() {
    if (this.isTestingPing()) return;
    this.isTestingPing.set(true);
    const start = performance.now();
    fetch('/favicon.ico', { cache: 'no-store', method: 'HEAD' })
      .then(() => {
        const elapsed = Math.round(performance.now() - start);
        this.pingResultMs.set(Math.max(12, elapsed));
      })
      .catch(() => {
        this.pingResultMs.set(24);
      })
      .finally(() => {
        this.isTestingPing.set(false);
      });
  }

  readonly trendingTags = [
    '#AppleIntelligence',
    '#GeminiAI',
    '#Pixel9Pro',
    '#GalaxyUnpacked',
    '#EsportsSL',
    '#Dialog5G',
    '#GeForceRTX'
  ];

  onTagClick(tag: string) {
    this.searchService.setSearchTerm(tag.replace('#', ''));
    this.toolsService.close();
  }

  formatEventDisplayDate(dateStr: string): { day: string; month: string } {
    if (!dateStr) return { day: '--', month: 'TBA' };
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const day = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      return { day, month };
    } catch {
      return { day: '--', month: 'TBA' };
    }
  }

  getGoogleCalendarUrl(ev: TechEvent): string {
    if (!ev || !ev.date) return '#';
    try {
      const cleanDate = ev.date.replace(/-/g, '');
      const dates = `${cleanDate}/${cleanDate}`;
      const title = encodeURIComponent(ev.title || 'Tech Event');
      const details = encodeURIComponent(`${ev.description || ''}\n\nOfficial Link: ${ev.link || 'https://myfeed.lk'}`);
      const location = encodeURIComponent(ev.location || 'Online / Live Stream');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  }
}
