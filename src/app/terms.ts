import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-terms',
  imports: [MatIconModule, RouterLink],
  template: `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 min-h-[calc(100vh-200px)] animate-fade-in-up">
      <!-- Back Link -->
      <a routerLink="/" class="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white transition-all mb-8 sm:mb-12 cursor-pointer group">
        <mat-icon class="group-hover:-translate-x-1 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">keyboard_backspace</mat-icon>
        <span>Back to Feed</span>
      </a>

      <header class="mb-10 sm:mb-14">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100 dark:border-blue-900/40">
          <span>Legal & Compliance</span>
        </div>
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-3">
          Terms of Service
        </h1>
        <p class="text-sm sm:text-base text-[#1d1d1f]/60 dark:text-white/60 font-medium">
          Last updated: August 2026 &bull; Fair use and content distribution guidelines
        </p>
      </header>

      <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm border border-black/[0.06] dark:border-white/10 text-[#1d1d1f]/80 dark:text-white/80 leading-relaxed font-sans space-y-8">
        <p class="text-base sm:text-lg font-serif italic text-[#1d1d1f]/70 dark:text-white/70">
          Welcome to MyFeed.lk. By accessing or using our website, you agree to be bound by these Terms of Service and our editorial guidelines.
        </p>

        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 1. Editorial Integrity & Intellectual Property
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            Content published on MyFeed.lk includes original reporting, synthesized digests, and curated news from reputable global sources with clear attribution. Users may share links and excerpts with appropriate back-links. Commercial reproduction without consent is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 2. AI Content Attribution & Transparency
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            In accordance with international AI governance best practices, MyFeed.lk visibly discloses AI-assisted reporting. Stories compiled with machine intelligence carry the <em>MyFeed AI Intelligence Desk</em> tag. All automated feeds are subject to editorial oversight to ensure accuracy and community standards.
          </p>
        </section>

        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 3. Disclaimer of Warranties
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            This website and its publications are provided on an "as is" and "as available" basis. While we make every effort to verify news accuracy, MyFeed.lk makes no warranties, express or implied, regarding commercial fitness or exhaustive timeliness.
          </p>
        </section>

        <section class="pt-6 border-t border-black/5 dark:border-white/10">
          <h2 class="text-lg font-black text-[#1d1d1f] dark:text-white mb-3">4. Editorial Inquiries</h2>
          <div class="bg-black/[0.02] dark:bg-white/[0.03] p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1.5 text-xs sm:text-sm">
            <p class="font-bold text-[#1d1d1f] dark:text-white">Kaveen Sandeepa (Founder & Editor-in-Chief)</p>
            <p>Email: <a href="mailto:mail.kaveensandeepa@gmail.com" class="text-blue-600 hover:underline">mail.kaveensandeepa@gmail.com</a></p>
            <p>Direct / WhatsApp: <a href="https://wa.me/94710947861" target="_blank" class="text-blue-600 hover:underline font-mono">+94 71 094 7861</a></p>
          </div>
        </section>
      </div>
    </main>
  `
})
export class TermsComponent {}
