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
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ios-glass-thin text-[#007AFF] dark:text-[#0A84FF] text-xs font-bold uppercase tracking-wider mb-4">
          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">verified_user</mat-icon>
          <span>Trust, Privacy & Advertising Standards</span>
        </div>
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#1d1d1f] dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p class="text-sm sm:text-base text-[#1d1d1f]/60 dark:text-white/60 font-medium">
          Last updated: August 2026 &bull; Compliant with Google AdSense & International Privacy Regulations
        </p>
      </header>

      <div class="ios-glass-card p-6 sm:p-10 md:p-14 text-[#1d1d1f]/80 dark:text-white/80 leading-relaxed font-sans space-y-8">
        <p class="text-base sm:text-lg font-serif italic text-[#1d1d1f]/70 dark:text-white/70">
          At <strong>My Feed LK</strong> (www.myfeedlk.com), accessible from https://www.myfeedlk.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information collected and recorded by My Feed LK and how we use it.
        </p>

        <!-- Section 1 -->
        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#007AFF]"></span> 1. Information We Collect & Use
          </h2>
          <p class="mb-3 text-sm sm:text-base">
            We collect only the essential information needed to provide a high-quality news and technology discovery platform:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            <li><strong>Personal Information:</strong> If you voluntarily create an account, subscribe to our newsletter, or submit contact requests, we may collect your name, email address, and profile photo (if authenticated via Google).</li>
            <li><strong>Log Files & Analytics:</strong> My Feed LK follows standard procedure for using log files and Google Analytics. This information includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts to analyze trends and administer the site.</li>
            <li><strong>Local Storage:</strong> Your theme preferences (Dark/Light mode), read articles, and saved bookmarks are stored securely on your local device.</li>
          </ul>
        </section>

        <!-- Section 2 - Google AdSense & Cookies (MANDATORY FOR ADSENSE APPROVAL) -->
        <section class="ios-glass-thin p-6 rounded-2xl">
          <h2 class="text-xl sm:text-2xl font-black text-[#007AFF] dark:text-[#0A84FF] mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#007AFF]"></span> 2. Google AdSense & DoubleClick DART Cookies
          </h2>
          <p class="text-sm sm:text-base mb-3 text-[#1d1d1f]/80 dark:text-white/80">
            Google is one of the third-party vendors on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.myfeedlk.com and other sites on the internet.
          </p>
          <ul class="list-disc pl-6 space-y-2 text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
            <li>Visitors may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-semibold">Google Ads Settings</a>.</li>
            <li>Alternatively, you can opt out of third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-semibold">www.aboutads.info</a>.</li>
          </ul>
        </section>

        <!-- Section 3 - Third Party Privacy Policies -->
        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 3. Third-Party Privacy Policies
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            My Feed LK's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers (such as Google AdSense) for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
        </section>

        <!-- Section 4 - AI Transparency -->
        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 4. AI Curation & Editorial Standards
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70">
            My Feed LK utilizes automated intelligence systems for content translation, multi-source aggregation, and summarization to make news accessible to Sinhala and English readers. No personal visitor data is utilized to train AI language models.
          </p>
        </section>

        <!-- Section 5 - GDPR & CCPA Rights -->
        <section>
          <h2 class="text-xl sm:text-2xl font-black text-[#1d1d1f] dark:text-white mb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span> 5. CCPA & GDPR Data Protection Rights
          </h2>
          <p class="text-sm sm:text-base text-[#1d1d1f]/70 dark:text-white/70 mb-3">
            We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul class="list-disc pl-6 space-y-1.5 text-sm text-[#1d1d1f]/70 dark:text-white/70">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request correction of inaccurate data.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.</li>
          </ul>
        </section>

        <!-- Section 6 - Contact -->
        <section class="pt-6 border-t border-black/5 dark:border-white/10">
          <h2 class="text-lg font-black text-[#1d1d1f] dark:text-white mb-3">6. Contact & Data Controller Inquiries</h2>
          <div class="bg-black/[0.02] dark:bg-white/[0.03] p-5 rounded-2xl border border-black/5 dark:border-white/10 space-y-1.5 text-xs sm:text-sm">
            <p class="font-bold text-[#1d1d1f] dark:text-white">Kaveen Sandeepa (Founder & Editor-in-Chief)</p>
            <p>Platform: <strong>My Feed LK</strong> (<a href="https://www.myfeedlk.com" class="text-blue-600 hover:underline">www.myfeedlk.com</a>)</p>
            <p>Email: <a href="mailto:mail.kaveensandeepa@gmail.com" class="text-blue-600 hover:underline">mail.kaveensandeepa@gmail.com</a></p>
            <p>Direct / WhatsApp: <a href="https://wa.me/94710947861" target="_blank" class="text-blue-600 hover:underline font-mono">+94 71 094 7861</a></p>
          </div>
        </section>
      </div>
    </main>
  `
})
export class PrivacyComponent {}
