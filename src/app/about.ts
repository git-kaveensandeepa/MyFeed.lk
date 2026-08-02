import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-about',
  imports: [MatIconModule, RouterLink],
  template: `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 min-h-[calc(100vh-200px)] animate-fade-in-up">
      <!-- Breadcrumb -->
      <a routerLink="/" class="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/40 dark:text-white/40 hover:text-[#1d1d1f] dark:hover:text-white transition-all cursor-pointer group mb-12 sm:mb-20">
        <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
        Back to Journal
      </a>

      <header class="mb-16 sm:mb-24">
        <h1 class="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-[#1d1d1f] dark:text-white mb-8 leading-[0.9]">
          Redefining the <span class="text-blue-600">Digital Feed.</span>
        </h1>
        <p class="text-xl sm:text-3xl text-[#1d1d1f]/60 dark:text-white/60 font-serif italic leading-relaxed">
          MyFeed.lk is a curated editorial platform dedicated to the intersection of technology, culture, and high-fidelity design.
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20 mb-24">
        <section>
          <h2 class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6">Our Philosophy</h2>
          <div class="prose prose-lg dark:prose-invert text-[#1d1d1f]/80 dark:text-white/80 font-medium leading-relaxed">
            <p class="mb-6">
              In an era of information overload, we believe in the power of curation. Most platforms optimize for attention; we optimize for depth and aesthetic clarity.
            </p>
            <p>
              Every story featured on MyFeed.lk is selected not just for its relevance, but for its potential to inspire and inform through a premium reading experience.
            </p>
          </div>
        </section>

        <section>
          <h2 class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6">The Experience</h2>
          <div class="prose prose-lg dark:prose-invert text-[#1d1d1f]/80 dark:text-white/80 font-medium leading-relaxed">
            <p class="mb-6">
              We've built an interface that disappears, leaving only the content. With support for both Light and Dark themes, and a secure local Bookmark system, your reading journey is personal and private.
            </p>
            <p>
              No trackers, no intrusive ads—just pure editorial excellence delivered through modern web technology.
            </p>
          </div>
        </section>
      </div>

      <!-- Stats / Highlights -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-8 py-12 border-y border-black/5 dark:border-white/10 mb-24">
        <div>
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">2026</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase tracking-widest">Launched</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">100%</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase tracking-widest">Ad-Free</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">Local</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase tracking-widest">Persistence</div>
        </div>
        <div>
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">Zero</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/40 dark:text-white/40 uppercase tracking-widest">Trackers</div>
        </div>
      </div>

      <div class="bg-black/[0.02] dark:bg-white/[0.02] rounded-[3rem] p-8 sm:p-16 border border-black/[0.05] dark:border-white/10 text-center">
        <h3 class="text-2xl sm:text-4xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-6">Stay part of the story.</h3>
        <p class="text-[#1d1d1f]/60 dark:text-white/60 mb-10 max-w-lg mx-auto font-medium">
          Join our growing community of readers who value quality over quantity.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/" class="px-8 py-4 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#121212] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95 cursor-pointer">
            Explore Journal
          </a>
          <a routerLink="/developer" class="px-8 py-4 rounded-full bg-white dark:bg-[#1a1a1a] text-[#1d1d1f] dark:text-white font-black uppercase tracking-widest text-xs border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
            Meet the Developer
          </a>
        </div>
      </div>
    </main>
  `
})
export class AboutComponent {}
