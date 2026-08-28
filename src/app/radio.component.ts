import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f2f2f7] dark:bg-[#000000] text-[#000000] dark:text-white transition-colors duration-300 pb-36 pt-3 sm:pt-6">
      
      <main class="max-w-3xl w-full mx-auto px-4 sm:px-6">
        
        <!-- Navigation Bar Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <a routerLink="/" class="inline-flex items-center gap-1 text-xs font-bold text-[#007AFF] hover:opacity-80 transition-opacity ios-touch">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">chevron_left</mat-icon>
              <span>Journal</span>
            </a>
          </div>
          
          <div class="text-center">
            <h1 class="text-base sm:text-lg font-bold text-[#000000] dark:text-white tracking-tight flex items-center justify-center gap-1.5">
              <mat-icon class="text-[#007AFF]" style="font-size: 20px; width: 20px; height: 20px;">podcasts</mat-icon>
              <span>Audio &amp; Podcasts</span>
            </h1>
          </div>

          <div class="w-12"></div>
        </div>

        <!-- Coming Soon Hero Card -->
        <div class="relative overflow-hidden rounded-[26px] bg-white dark:bg-[#1c1c1e] text-[#000000] dark:text-white p-6 sm:p-10 shadow-sm border border-black/[0.06] dark:border-white/[0.08] text-center mb-8 ios-card">
          
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-5 shadow-inner">
            <mat-icon style="font-size: 36px; width: 36px; height: 36px;">graphic_eq</mat-icon>
          </div>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
            <span>Coming Soon</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Audio News &amp; Tech Podcasts
          </h2>

          <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-6">
            තාක්ෂණික පුවත් සහ ලිපි සිංහල AI හඬින් ශ්‍රවණය කිරීමේ පහසුකම (Sinhala AI Voiceovers) සහ ශ්‍රී ලාංකික Tech Podcasts ඉක්මනින්ම බලාපොරොත්තු වන්න.
          </p>

          <!-- What to expect list -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto mb-8">
            <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <mat-icon class="text-blue-500 mb-1" style="font-size: 20px; width: 20px; height: 20px;">record_voice_over</mat-icon>
              <div class="text-xs font-bold text-gray-900 dark:text-white">AI Sinhala Voice</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Listen to articles on the go</div>
            </div>

            <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <mat-icon class="text-purple-500 mb-1" style="font-size: 20px; width: 20px; height: 20px;">podcasts</mat-icon>
              <div class="text-xs font-bold text-gray-900 dark:text-white">Tech Podcasts</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Sri Lankan developer stories</div>
            </div>

            <div class="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
              <mat-icon class="text-emerald-500 mb-1" style="font-size: 20px; width: 20px; height: 20px;">speed</mat-icon>
              <div class="text-xs font-bold text-gray-900 dark:text-white">Speed &amp; Background</div>
              <div class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Lock-screen &amp; 1.5x/2x playback</div>
            </div>
          </div>

          <!-- CTA -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href="https://whatsapp.com/channel/0029Vb92r0OEawdtkqTARr2V" 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all ios-touch cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span>Get WhatsApp Updates When Launched</span>
            </a>
          </div>
        </div>

      </main>

    </div>
  `
})
export class RadioComponent {}
