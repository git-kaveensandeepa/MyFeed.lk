import {Component, Input, computed, inject} from '@angular/core';
import {AdManagerService} from './ad-manager.service';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-ad',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (activeAds().length > 0) {
      <div class="w-full relative group">
        @if (showLabel) {
          <div class="flex items-center gap-2 mb-3">
            <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Sponsored</span>
            <div class="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
        }
        
        <div class="grid grid-cols-1 gap-4" [class.sm:grid-cols-2]="activeAds().length > 1 && placement === 'home-top'" [class.lg:grid-cols-3]="activeAds().length > 2 && placement === 'home-top'">
          @for (ad of activeAds().slice(0, maxAds); track ad.id) {
            <a [href]="ad.link" target="_blank" rel="noopener noreferrer" class="block group/ad relative rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-all h-32 sm:h-40 md:h-48 w-full bg-gray-50">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              <img [src]="ad.imageUrl" [alt]="ad.title" class="absolute inset-0 w-full h-full object-cover transform group-hover/ad:scale-105 transition-transform duration-700 ease-out">
              <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
                <h4 class="text-white font-bold text-sm sm:text-lg leading-tight mb-0.5 sm:mb-1 drop-shadow-md truncate">{{ ad.title }}</h4>
                <span class="inline-flex items-center gap-1 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider group-hover/ad:text-white transition-colors">
                  Visit Now <mat-icon style="font-size: 14px; width: 14px; height: 14px;">arrow_forward</mat-icon>
                </span>
              </div>
            </a>
          }
        </div>
      </div>
    }
  `
})
export class AdComponent {
  @Input() placement = 'default';
  @Input() maxAds = 3;
  @Input() showLabel = true;

  private adService = inject(AdManagerService);

  activeAds = computed(() => {
    const ads = this.adService.ads();
    return ads.filter(ad => ad.isActive && (ad.placement === this.placement || this.placement === 'all'));
  });
}
