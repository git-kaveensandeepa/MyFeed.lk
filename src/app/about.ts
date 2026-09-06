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
          My Feed LK is a curated editorial platform dedicated to the intersection of technology, culture, and high-fidelity design.
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
        <section class="ios-glass-card p-8 sm:p-10">
          <h2 class="text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] uppercase tracking-widest mb-4 flex items-center gap-2">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">auto_awesome</mat-icon>
            Our Philosophy
          </h2>
          <div class="prose prose-lg dark:prose-invert text-[#1d1d1f]/80 dark:text-white/80 font-medium leading-relaxed">
            <p class="mb-4">
              In an era of information overload, we believe in the power of curation. Most platforms optimize for attention; we optimize for depth and aesthetic clarity.
            </p>
            <p>
              Every story featured on My Feed LK is selected not just for its relevance, but for its potential to inspire and inform through a premium reading experience.
            </p>
          </div>
        </section>

        <section class="ios-glass-card p-8 sm:p-10">
          <h2 class="text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] uppercase tracking-widest mb-4 flex items-center gap-2">
            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">dashboard_customize</mat-icon>
            The Experience
          </h2>
          <div class="prose prose-lg dark:prose-invert text-[#1d1d1f]/80 dark:text-white/80 font-medium leading-relaxed">
            <p class="mb-4">
              We've built an interface that disappears, leaving only the content. With support for both Light and Dark themes, and a secure local Bookmark system, your reading journey is personal and private.
            </p>
            <p>
              No trackers, no intrusive ads—just pure editorial excellence delivered through modern web technology.
            </p>
          </div>
        </section>
      </div>

      <!-- Stats / Highlights -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 ios-glass-card mb-16">
        <div class="p-3 text-center">
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">2026</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/50 uppercase tracking-widest">Launched</div>
        </div>
        <div class="p-3 text-center">
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">100%</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/50 uppercase tracking-widest">Ad-Free</div>
        </div>
        <div class="p-3 text-center">
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">Local</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/50 uppercase tracking-widest">Persistence</div>
        </div>
        <div class="p-3 text-center">
          <div class="text-3xl sm:text-4xl font-black text-[#1d1d1f] dark:text-white mb-1">Zero</div>
          <div class="text-[10px] font-bold text-[#1d1d1f]/50 dark:text-white/50 uppercase tracking-widest">Trackers</div>
        </div>
      </div>

      <section class="mb-16 text-center max-w-2xl mx-auto ios-glass-card p-8 sm:p-12">
        <h2 class="text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] uppercase tracking-widest mb-4">Contact & Support</h2>
        <p class="text-[#1d1d1f]/80 dark:text-white/80 font-medium leading-relaxed mb-6">
          Have questions, feedback, or need assistance? You can reach out directly to the administrator via WhatsApp.
        </p>
        <a href="https://wa.me/94710947871" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#25D366] hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-500/20 ios-touch cursor-pointer">
          <mat-icon>chat</mat-icon>
          WhatsApp Admin (071 094 7871)
        </a>
      </section>

      <div class="ios-glass-card rounded-[28px] p-8 sm:p-14 text-center">
        <h3 class="text-2xl sm:text-4xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-4">Stay part of the story.</h3>
        <p class="text-[#1d1d1f]/60 dark:text-white/60 mb-8 max-w-lg mx-auto font-medium text-sm sm:text-base">
          Join our growing community of readers who value quality over quantity.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/" class="px-8 py-4 rounded-full bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-[#007AFF]/25 ios-touch cursor-pointer">
            Explore Journal
          </a>
          <a routerLink="/developer" class="px-8 py-4 rounded-full ios-glass-btn text-[#1d1d1f] dark:text-white font-black uppercase tracking-widest text-xs transition-all ios-touch cursor-pointer">
            Meet the Developer
          </a>
        </div>
      </div>
    </main>
  `
})
export class AboutComponent {}
