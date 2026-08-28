import { ChangeDetectionStrategy, Component, signal, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shorts',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Full Height Container (minus navbar) -->
    <div class="h-[calc(100dvh-120px)] lg:h-[calc(100vh-112px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide relative">
      
      @for (short of mockShorts; track short.id; let i = $index) {
        <div class="relative w-full h-full snap-start snap-always flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
          
          <!-- Desktop Blurred Background (Premium Feel) -->
          <div class="hidden sm:block absolute inset-0 z-0">
            <video [src]="short.videoUrl" [poster]="short.posterUrl" autoplay loop muted playsinline class="w-full h-full object-cover blur-3xl opacity-30 scale-125"></video>
          </div>

          <!-- Mobile-sized Video Container -->
          <div class="relative w-full sm:max-w-[400px] h-full bg-black z-10 sm:shadow-2xl sm:shadow-blue-900/20 sm:my-4 sm:rounded-[2rem] sm:h-[calc(100%-2rem)] overflow-hidden group">
            
            <video #videoElement [src]="short.videoUrl" [poster]="short.posterUrl" loop playsinline [muted]="isMuted()" (click)="togglePlay(videoElement)" class="w-full h-full object-cover cursor-pointer bg-gray-900"></video>
            
            <!-- Gradient Overlays for Text Readability -->
            <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
            <div class="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

            <!-- Top Header (Inside Video) -->
            <div class="absolute top-4 sm:top-6 left-4 right-4 flex items-center justify-between z-20">
              <div class="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <mat-icon style="font-size: 14px; width: 14px; height: 14px;" class="text-purple-400">bolt</mat-icon>
                MyFeed Bites
              </div>
              <button (click)="toggleMute()" class="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ isMuted() ? 'volume_off' : 'volume_up' }}</mat-icon>
              </button>
            </div>

            <!-- Right Action Buttons -->
            <div class="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
              <!-- Like -->
              <button (click)="toggleLike(short)" class="group/btn flex flex-col items-center gap-1 hover:-translate-y-1 transition-transform">
                <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all shadow-lg" [class.bg-red-500]="short.isLiked" [class.border-red-500]="short.isLiked">
                  <mat-icon [class.text-red-500]="short.isLiked" [class.fill-current]="short.isLiked" style="font-size: 24px; width: 24px; height: 24px;">{{ short.isLiked ? 'favorite' : 'favorite_border' }}</mat-icon>
                </div>
                <span class="text-white text-xs font-bold drop-shadow-md">{{ short.likes }}</span>
              </button>
              
              <!-- Bookmark -->
              <button (click)="toggleBookmark(short)" class="group/btn flex flex-col items-center gap-1 hover:-translate-y-1 transition-transform">
                <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all shadow-lg" [class.bg-blue-600]="short.isBookmarked" [class.border-blue-500]="short.isBookmarked">
                  <mat-icon style="font-size: 24px; width: 24px; height: 24px;">{{ short.isBookmarked ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                </div>
                <span class="text-white text-xs font-bold drop-shadow-md">Save</span>
              </button>

              <!-- Share -->
              <button class="group/btn flex flex-col items-center gap-1 hover:-translate-y-1 transition-transform">
                <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all shadow-lg">
                  <mat-icon style="font-size: 24px; width: 24px; height: 24px;">share</mat-icon>
                </div>
                <span class="text-white text-xs font-bold drop-shadow-md">Share</span>
              </button>
            </div>

            <!-- Bottom Info Section -->
            <div class="absolute left-4 bottom-6 right-20 z-20 flex flex-col gap-3">
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest">{{ short.category }}</span>
              </div>
              <h3 class="text-white text-lg sm:text-xl font-black leading-tight drop-shadow-xl text-balance">
                {{ short.title }}
              </h3>
              
              <!-- Read Article Button -->
              <button class="mt-2 group/article relative overflow-hidden rounded-2xl p-[1px] w-fit shadow-xl cursor-pointer">
                <span class="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl opacity-80 group-hover/article:opacity-100 transition-opacity animate-pulse-glow"></span>
                <div class="relative bg-black/70 backdrop-blur-xl px-5 py-3 rounded-2xl flex items-center gap-2 group-hover/article:bg-black/50 transition-colors">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;" class="text-purple-400 group-hover/article:scale-110 transition-transform">article</mat-icon>
                  <span class="text-white text-sm font-bold tracking-wide">Read Full Article</span>
                </div>
              </button>
            </div>
            
            <!-- Progress Bar at the very bottom -->
            <div class="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30 overflow-hidden sm:rounded-b-[2rem]">
               <div class="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-1/3 rounded-r-full"></div>
            </div>

          </div>
        </div>
      }
    </div>
  `
})
export class ShortsComponent implements AfterViewInit {
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;
  
  isMuted = signal(true);

  mockShorts = [
    {
      id: 1,
      title: 'How Google Gemini 2.0 is changing coding forever. 🤯',
      category: 'AI Trends',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41655-large.mp4',
      posterUrl: '',
      likes: 1240,
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      title: 'Robotics in 2026: The New Automation Era',
      category: 'Future Tech',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robotic-arm-operating-on-a-surface-3286-large.mp4',
      posterUrl: '',
      likes: 856,
      isLiked: false,
      isBookmarked: true
    },
    {
      id: 3,
      title: 'Cybersecurity: Are your passwords actually safe?',
      category: 'Security',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-in-a-dark-room-4054-large.mp4',
      posterUrl: '',
      likes: 3290,
      isLiked: true,
      isBookmarked: false
    }
  ];

  ngAfterViewInit() {
    // Autoplay the video that is currently in view
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => console.log('Autoplay blocked'));
          } else {
            video.pause();
            video.currentTime = 0; // Reset video when scrolled out of view
          }
        });
      }, { threshold: 0.6 });

      this.videoElements.forEach(videoRef => {
        observer.observe(videoRef.nativeElement);
      });
    }
  }

  toggleMute() {
    this.isMuted.update(v => !v);
  }

  togglePlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  toggleLike(short: any) {
    short.isLiked = !short.isLiked;
    short.likes += short.isLiked ? 1 : -1;
  }

  toggleBookmark(short: any) {
    short.isBookmarked = !short.isBookmarked;
  }
}
