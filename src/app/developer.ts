import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-developer',
  imports: [MatIconModule, RouterLink],
  template: `
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 min-h-[calc(100vh-200px)] animate-fade-in-up">
      <a routerLink="/" class="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/40 hover:text-[#1d1d1f] transition-all mb-12 cursor-pointer group">
        <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
        Back to Feed
      </a>

      <div class="bg-white rounded-[3.5rem] p-10 md:p-16 lg:p-20 shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-black/[0.03] text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-16 relative overflow-hidden">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-56 h-56 md:w-72 md:h-72 shrink-0 rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-2xl relative z-10 border-8 border-white -rotate-3 hover:rotate-0 transition-transform duration-500">
          <img src="/kaveen.jpg" alt="Kaveen Sandeepa" referrerpolicy="no-referrer" class="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700 ease-out" />
          <div class="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/10"></div>
        </div>
        
        <div class="flex flex-col items-center md:items-start mt-4 relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur text-blue-600 text-xs font-bold tracking-widest uppercase mb-6 border border-blue-100">
            <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Available for Work
          </div>
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-[#1d1d1f] mb-4">
            Kaveen Sandeepa
          </h1>
          <h2 class="text-2xl md:text-3xl text-[#1d1d1f]/50 font-serif italic mb-8">
            Software Developer & Designer
          </h2>
          
          <p class="text-xl text-[#1d1d1f]/70 font-medium leading-relaxed max-w-2xl mb-10">
            Hello! I am Kaveen Sandeepa, the developer behind MyFeed.lk. I specialize in building modern, performant, and beautifully designed web applications. With a passion for technology and user experience, I strive to create digital solutions that make a meaningful impact.
          </p>

          <div class="flex flex-col xl:flex-row gap-8 w-full justify-center md:justify-start items-center">
            <a href="mailto:mail.kaveensandeepa@gmail.com" class="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-[#1d1d1f] text-white text-sm tracking-widest font-bold uppercase hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 cursor-pointer shrink-0">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">mail</mat-icon>
              Email Me
            </a>
            
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <a href="#" class="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#1d1d1f] border border-black/10 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" class="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#1d1d1f] border border-black/10 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
              <a href="#" class="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#1d1d1f] border border-black/10 hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" class="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#1d1d1f] border border-black/10 hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.25-.8 4.46-2.07 6.22-1.39 1.93-3.41 3.33-5.71 3.86-2.58.6-5.34.25-7.66-1.04-2.19-1.22-3.8-3.23-4.5-5.59-.65-2.2-.55-4.63.36-6.73 1.01-2.31 2.96-4.14 5.31-4.99 1.7-.62 3.57-.75 5.37-.36 0 1.34.02 2.68-.01 4.02-.91-.25-1.87-.22-2.76.08-1.23.41-2.26 1.35-2.71 2.54-.42 1.13-.37 2.45.19 3.53.51.98 1.39 1.7 2.46 1.96 1.3.32 2.74.05 3.81-.74 1.25-.91 1.97-2.38 2.02-3.93.1-4.92.05-9.85.06-14.78.01-1.34 0-2.67 0-4.01Z"/></svg>
              </a>
              <a href="#" class="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#1d1d1f] border border-black/10 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all active:scale-95 cursor-pointer shadow-sm" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class DeveloperComponent {}
