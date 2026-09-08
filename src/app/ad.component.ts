import {Component, Input, computed, inject} from '@angular/core';
import {AdManagerService} from './ad-manager.service';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-ad',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  template: `
    @if (activeAd()) {
      <!-- ACTIVE SPONSORED CAMPAIGN -->
      <div class="w-full relative group">
        @if (showLabel) {
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8e8e93] bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-0.5 rounded-full">
                <mat-icon style="font-size: 13px; width: 13px; height: 13px;">verified</mat-icon>
                Sponsored &bull; අනුග්‍රාහක දැන්වීම
              </span>
              <div class="h-px flex-1 bg-gradient-to-r from-black/10 dark:from-white/10 to-transparent"></div>
            </div>
            <span class="text-[10px] text-[#8e8e93] font-medium hidden sm:inline-block">MyFeed.lk Verified Partner</span>
          </div>
        }

        <a [href]="activeAd()!.link" target="_blank" rel="noopener noreferrer" 
           class="block group/ad relative rounded-[20px] sm:rounded-[24px] overflow-hidden border border-black/[0.08] dark:border-white/[0.1] shadow-sm hover:shadow-md transition-all duration-300 w-full bg-black/5 dark:bg-white/5"
           [class.h-28]="format === 'compact'"
           [class.sm:h-36]="format === 'compact'"
           [class.h-36]="format === 'leaderboard' || format === 'in-article'"
           [class.sm:h-44]="format === 'leaderboard' || format === 'in-article'"
           [class.md:h-52]="format === 'leaderboard' || format === 'in-article'"
           [class.h-56]="format === 'rectangle'"
           [class.sm:h-64]="format === 'rectangle'"
           [class.h-40]="format === 'in-feed'"
           [class.sm:h-48]="format === 'in-feed'">
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-10"></div>
          
          <img [src]="activeAd()!.imageUrl" [alt]="activeAd()!.title" referrerpolicy="no-referrer"
               class="absolute inset-0 w-full h-full object-cover transform group-hover/ad:scale-105 transition-transform duration-700 ease-out">
          
          <div class="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5 z-20 flex items-end justify-between gap-3">
            <div class="min-w-0 flex-1">
              <span class="inline-block text-[10px] font-bold text-amber-300 uppercase tracking-widest mb-1">
                Featured Partner
              </span>
              <h4 class="text-white font-bold text-sm sm:text-lg md:text-xl leading-snug drop-shadow-md line-clamp-1">
                {{ activeAd()!.title }}
              </h4>
            </div>

            <span class="shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-black text-xs font-bold backdrop-blur-md transition-all duration-200 shadow-sm group-hover/ad:bg-[#007AFF] group-hover/ad:text-white">
              <span>Visit Now</span>
              <mat-icon style="font-size: 15px; width: 15px; height: 15px;">arrow_forward</mat-icon>
            </span>
          </div>
        </a>
      </div>
    } @else if (showPlaceholder) {
      <!-- PROFESSIONAL AD SLOT PLACEHOLDER (දැන්වීම් අවකාශය) -->
      <div class="w-full relative rounded-[20px] sm:rounded-[24px] border-2 border-dashed border-black/15 dark:border-white/15 hover:border-[#007AFF]/40 bg-black/[0.015] dark:bg-white/[0.02] transition-all duration-300 p-4 sm:p-6 overflow-hidden group">
        
        <!-- Slot Identifier Header -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
              <mat-icon style="font-size: 14px; width: 14px; height: 14px;">campaign</mat-icon>
            </div>
            <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#000000] dark:text-white">
              {{ slotTitle() }}
            </span>
          </div>

          <span class="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#8e8e93] text-[10px] font-mono font-semibold">
            {{ slotSize() }}
          </span>
        </div>

        <!-- Ad Slot Message & Call To Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-0.5">
            <p class="text-xs sm:text-sm font-semibold text-[#000000] dark:text-white">
              ඔබේ ව්‍යාපාරය හෝ නිෂ්පාදන MyFeed.lk පාඨකයින් වෙත ප්‍රචාරය කරන්න
            </p>
            <p class="text-[11px] sm:text-xs text-[#8e8e93]">
              Reach thousands of daily tech enthusiasts, developers, and Sri Lankan readers.
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <a [href]="waContactUrl()" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold tracking-tight shadow-sm hover:shadow transition-all ios-touch cursor-pointer active:scale-95">
              <mat-icon style="font-size: 15px; width: 15px; height: 15px;">chat</mat-icon>
              <span>Advertise Here &bull; විමසන්න</span>
            </a>
          </div>
        </div>

      </div>
    }
  `
})
export class AdComponent {
  @Input() placement = 'home-top';
  @Input() format: 'leaderboard' | 'rectangle' | 'in-feed' | 'in-article' | 'compact' = 'leaderboard';
  @Input() slotName?: string;
  @Input() showLabel = true;
  @Input() showPlaceholder = true;

  private adService = inject(AdManagerService);

  activeAd = computed(() => {
    const ads = this.adService.ads();
    return ads.find(ad => ad.isActive && (ad.placement === this.placement || ad.placement === 'all'));
  });

  slotTitle = computed(() => {
    if (this.slotName) return this.slotName;
    const names: Record<string, string> = {
      'home-top': 'Top Leaderboard &bull; ප්‍රධාන දැන්වීම් අවකාශය',
      'home-feed-1': 'In-Feed Sponsored Slot 1 &bull; පුවත් අතර දැන්වීම',
      'home-feed-2': 'In-Feed Sponsored Slot 2 &bull; පුවත් අතර දැන්වීම',
      'home-sidebar-1': 'Sidebar Banner &bull; පැති දැන්වීම් අවකාශය',
      'home-sidebar-2': 'Sticky Sidebar &bull; ස්ථාවර දැන්වීම් අවකාශය',
      'home-bottom': 'Footer Leaderboard &bull; පහළ ප්‍රධාන බැනරය',
      'article-top': 'Article Header Ad &bull; ලිපි ආරම්භක දැන්වීම',
      'article-inline': 'In-Article Inline Ad &bull; ලිපිය අභ්‍යන්තර දැන්වීම් අවකාශය',
      'article-bottom': 'Article Footer Ad &bull; ලිපිය අවසාන දැන්වීම',
      'article-sidebar': 'Article Sidebar &bull; පැති දැන්වීම් අවකාශය',
      'bytes-feed': 'Tech Bytes Sponsored &bull; Shorts දැන්වීම් අවකාශය',
      'quizzes-finish': 'Quiz Results Ad &bull; ප්‍රශ්නාවලි අවසන් බැනරය',
      'learn-top': 'Academy Header Ad &bull; පාඨමාලා ප්‍රධාන බැනරය',
      'learn-bottom': 'Academy Bottom Ad &bull; පාඨමාලා පහළ බැනරය',
    };
    return names[this.placement] || 'Advertisement Slot &bull; දැන්වීම් අවකාශය';
  });

  slotSize = computed(() => {
    if (this.format === 'rectangle') return '300 × 250 Medium Rectangle';
    if (this.format === 'in-feed') return 'Responsive In-Feed Card';
    if (this.format === 'in-article') return 'Responsive In-Article Banner';
    if (this.format === 'compact') return '728 × 90 Leaderboard';
    return '728 × 90 / Responsive Mobile Leaderboard';
  });

  waContactUrl = computed(() => {
    const msg = `Hi MyFeed.lk! I am interested in advertising on MyFeed.lk in the [${this.placement}] slot (${this.slotSize()}). Please provide pricing and availability.`;
    return `https://wa.me/94710947871?text=${encodeURIComponent(msg)}`;
  });
}
