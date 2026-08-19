import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-developer',
  imports: [MatIconModule, RouterLink],
  template: `
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 min-h-[calc(100vh-200px)] animate-fade-in-up">
      <a routerLink="/" class="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white transition-all mb-8 sm:mb-12 cursor-pointer group">
        <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
        <span>Back to Feed</span>
      </a>

      <div class="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-12 md:p-16 lg:p-20 shadow-[0_30px_80px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.4)] border border-black/[0.06] dark:border-white/10 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-12 md:gap-16 relative overflow-hidden">
        <!-- Ambient decorative blurs -->
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/50 dark:bg-indigo-950/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Avatar Image with floating angle -->
        <div class="w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 shrink-0 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-white/10 shadow-2xl relative z-10 border-4 sm:border-8 border-white dark:border-[#2a2a2a] -rotate-2 hover:rotate-0 transition-transform duration-500">
          <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700 ease-out" />
          <div class="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
        </div>
        
        <div class="flex flex-col items-center md:items-start mt-2 relative z-10 text-[#1d1d1f] dark:text-white">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/40 backdrop-blur text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6 border border-blue-100 dark:border-blue-900/40">
            <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Available for Collaborations</span>
          </div>
          
          <h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-[#1d1d1f] dark:text-white mb-2 sm:mb-3">
            Kaveen Sandeepa
          </h1>
          
          <h2 class="text-lg sm:text-2xl md:text-3xl text-[#1d1d1f]/50 dark:text-white/50 font-serif italic mb-6">
            Software Developer & Founder &bull; MyFeed.lk
          </h2>
          
          <p class="text-sm sm:text-base md:text-lg text-[#1d1d1f]/70 dark:text-white/70 font-medium leading-relaxed max-w-2xl mb-8">
            Hello! I am Kaveen Sandeepa, the developer and editor-in-chief behind MyFeed.lk. I specialize in building modern, performant, and beautifully designed web architectures with automated AI intelligence feeds.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center md:justify-start items-center">
            <a href="mailto:mail.kaveensandeepa@gmail.com" class="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#121212] text-xs sm:text-sm tracking-widest font-bold uppercase hover:bg-black dark:hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0">
              <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mail</mat-icon>
              <span>Email Me</span>
            </a>
            
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <a href="https://wa.me/94710947871" target="_blank" rel="noopener noreferrer" class="w-11 h-11 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white border border-black/10 dark:border-white/10 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="WhatsApp (+94710947871)" title="WhatsApp">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
              <a href="https://www.facebook.com/share/1USfMgpv23/" target="_blank" rel="noopener noreferrer" class="w-11 h-11 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white border border-black/10 dark:border-white/10 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="Facebook" title="Facebook">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@tt.kaveensandeepa?_r=1&_t=ZS-98YOabeHMxO" target="_blank" rel="noopener noreferrer" class="w-11 h-11 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white border border-black/10 dark:border-white/10 hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="TikTok" title="TikTok">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.25-.8 4.46-2.07 6.22-1.39 1.93-3.41 3.33-5.71 3.86-2.58.6-5.34.25-7.66-1.04-2.19-1.22-3.8-3.23-4.5-5.59-.65-2.2-.55-4.63.36-6.73 1.01-2.31 2.96-4.14 5.31-4.99 1.7-.62 3.57-.75 5.37-.36 0 1.34.02 2.68-.01 4.02-.91-.25-1.87-.22-2.76.08-1.23.41-2.26 1.35-2.71 2.54-.42 1.13-.37 2.45.19 3.53.51.98 1.39 1.7 2.46 1.96 1.3.32 2.74.05 3.81-.74 1.25-.91 1.97-2.38 2.02-3.93.1-4.92.05-9.85.06-14.78.01-1.34 0-2.67 0-4.01Z"/></svg>
              </a>
              <a href="https://youtube.com/@yt.kaveensandeepa?si=aWabFdMMUleXuVvL" target="_blank" rel="noopener noreferrer" class="w-11 h-11 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white border border-black/10 dark:border-white/10 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="YouTube" title="YouTube">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class DeveloperComponent {}
