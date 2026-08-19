import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-privacy',
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
          <span>Trust & Privacy</span>
        </div>
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p class="text-sm sm:text-base text-[#1d1d1f]/60 dark:text-white/60 font-medium">
          Last updated: August 2026 &bull; Compliant with global AI transparency standards
        </p>
      </header>

      <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm border border-black/[0.06] dark:border-white/10 text-[#1d1d1f]/80 dark:text-white/80 leading-relaxed font-sans space-y-8">
        <p class="text-base sm:text-lg font-serif italic text-[#1d1d1f]/70 dark:text-white/70">
          At MyFeed.lk, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
        </p>

        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 1. Information We Collect
          </h2>
          <p class="mb-3 text-sm sm:text-base">
            We collect minimal information necessary to deliver a fast, frictionless news experience:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            <li><strong>Subscriber Email:</strong> If you voluntarily subscribe to our newsletter, your email address is securely stored for digest dispatch.</li>
            <li><strong>Local Bookmarks:</strong> Your saved reading list is stored client-side in your browser's Local Storage for private, tracker-free offline persistence.</li>
            <li><strong>Technical Telemetry:</strong> Standard non-identifying access metrics (such as browser type and load performance) to maintain platform uptime.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 2. AI Data Processing & Transparency
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            MyFeed.lk utilizes generative artificial intelligence systems to summarize and localize global technology news into accessible Sinhala and English formats. We do not use user personal data to train proprietary machine learning models. All AI-assisted stories are processed strictly through compliant enterprise AI APIs adhering to international privacy frameworks.
          </p>
        </section>

        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 3. Security of Your Information
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            We use administrative, technical, and physical security measures to help protect your personal information. Database records are secured with strict Firestore security rules and encrypted communication protocols.
          </p>
        </section>

        <section class="pt-6 border-t border-black/5 dark:border-white/10">
          <h2 class="text-lg font-black text-[#1d1d1f] dark:text-white mb-3">4. Direct Inquiries & Contact</h2>
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
export class PrivacyComponent {}
