import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-audio-mini-player',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (audioService.currentEdition()) {
      <div 
        class="fixed z-50 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md w-auto transition-all duration-300 transform"
        [class.bottom-20]="true"
        [class.lg:bottom-6]="true">
        
        <div class="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-2xl p-3 sm:p-3.5 text-[#1d1d1f] dark:text-white">
          
          <!-- Top Interactive Progress Scrub Bar -->
          <div 
            class="absolute top-0 left-0 right-0 h-1.5 bg-black/5 dark:bg-white/10 cursor-pointer group"
            role="slider"
            tabindex="0"
            aria-label="Seek audio"
            [attr.aria-valuenow]="audioService.currentTime()"
            [attr.aria-valuemin]="0"
            [attr.aria-valuemax]="audioService.duration()"
            (keydown.arrowright)="audioService.skipForward(10)"
            (keydown.arrowleft)="audioService.skipBackward(10)"
            (click)="onScrubBarClick($event)">
            <div 
              class="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-100 relative"
              [style.width.%]="audioService.progressPercent()">
              <span class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-1">
            
            <!-- Cover / Waveform Artwork Button (Click opens /radio) -->
            <a 
              routerLink="/radio" 
              class="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden ios-touch group cursor-pointer">
              
              <!-- Equalizer animation when playing -->
              @if (audioService.isPlaying()) {
                <div class="flex items-end gap-0.5 h-5">
                  <span class="w-1 bg-white rounded-full animate-bounce" style="height: 100%; animation-duration: 0.6s;"></span>
                  <span class="w-1 bg-white rounded-full animate-bounce" style="height: 60%; animation-duration: 0.8s;"></span>
                  <span class="w-1 bg-white rounded-full animate-bounce" style="height: 90%; animation-duration: 0.5s;"></span>
                  <span class="w-1 bg-white rounded-full animate-bounce" style="height: 40%; animation-duration: 0.7s;"></span>
                </div>
              } @else {
                <mat-icon style="font-size: 24px; width: 24px; height: 24px;">podcasts</mat-icon>
              }

              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">open_in_full</mat-icon>
              </div>
            </a>

            <!-- Text & Chapter Details -->
            <div class="flex-1 min-w-0 pr-1">
              <div class="flex items-center gap-1.5 mb-0.5">
                <span class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider">
                  <span class="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                  15-MIN COMMUTE
                </span>
                <span class="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                  {{ audioService.currentEdition()?.timeWindowText || '4:00 AM - 4:00 AM' }}
                </span>
              </div>

              <!-- Title & Current Chapter -->
              <a routerLink="/radio" class="block group cursor-pointer">
                <h4 class="text-xs font-bold truncate text-[#1d1d1f] dark:text-white group-hover:text-blue-500 transition-colors">
                  {{ audioService.currentChapter()?.title || audioService.currentEdition()?.title }}
                </h4>
                <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  {{ audioService.formattedCurrentTime() }} / {{ audioService.currentEdition()?.durationFormatted }} &bull; {{ audioService.currentEdition()?.narratorName }}
                </p>
              </a>
            </div>

            <!-- Action Controls -->
            <div class="flex items-center gap-1">
              
              <!-- Skip -15s -->
              <button 
                type="button"
                (click)="audioService.skip(-15)"
                title="Rewind 15 seconds"
                class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">replay_10</mat-icon>
              </button>

              <!-- Main Play / Pause Button -->
              <button 
                type="button"
                (click)="audioService.togglePlay()"
                [title]="audioService.isPlaying() ? 'Pause' : 'Play'"
                class="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer">
                <mat-icon style="font-size: 24px; width: 24px; height: 24px;">
                  {{ audioService.isPlaying() ? 'pause' : 'play_arrow' }}
                </mat-icon>
              </button>

              <!-- Skip +15s -->
              <button 
                type="button"
                (click)="audioService.skip(15)"
                title="Forward 15 seconds"
                class="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">forward_15</mat-icon>
              </button>

              <!-- Speed Pill Toggle -->
              <button 
                type="button"
                (click)="audioService.cycleSpeed()"
                title="Playback Speed"
                class="px-1.5 py-1 rounded-md text-[10px] font-black bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer ml-0.5">
                {{ audioService.playbackRate() }}x
              </button>

            </div>

          </div>

        </div>
      </div>
    }
  `
})
export class AudioMiniPlayerComponent {
  readonly audioService = inject(AudioService);

  onScrubBarClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
    this.audioService.seekToPercent(percentage);
  }
}
