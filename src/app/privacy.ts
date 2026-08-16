import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-privacy',
  template: `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 min-h-[calc(100vh-200px)]">
      <header class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-4">
          Privacy Policy
        </h1>
        <p class="text-lg text-[#1d1d1f]/60 font-medium">
          Last updated: August 1, 2026
        </p>
      </header>

      <div class="prose prose-lg md:prose-xl max-w-none text-[#1d1d1f]/80 leading-relaxed font-serif pb-20">
        <p>
          At MyFeed.lk, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">1. Information We Collect</h2>
        <p>
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
        </ul>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">2. Use of Your Information</h2>
        <p>
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li>Create and manage your account.</li>
          <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
          <li>Email you regarding your account or order.</li>
          <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
          <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
        </ul>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">3. Disclosure of Your Information</h2>
        <p>
          We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
          <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
        </ul>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">4. AI Data Processing & Transparency Standards</h2>
        <p>
          MyFeed.lk utilizes generative artificial intelligence systems to summarize and localize global technology news. We do not use user personal data to train proprietary machine learning models without consent. All AI-assisted stories are processed strictly through compliant, enterprise-grade AI APIs adhering to international privacy frameworks and ethical content guidelines.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">5. Security of Your Information</h2>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">6. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact our founder and editor:
        </p>
        <div class="font-sans space-y-1 mt-3">
          <p class="font-bold text-[#1d1d1f]">Kaveen Sandeepa (Founder & Editor-in-Chief)</p>
          <p>Email: <a href="mailto:mail.kaveensandeepa@gmail.com" class="text-blue-600 hover:underline">mail.kaveensandeepa@gmail.com</a></p>
          <p>Direct / WhatsApp: <a href="tel:+94710947861" class="text-blue-600 hover:underline font-mono">+94 71 094 7861</a></p>
        </div>
      </div>
    </main>
  `
})
export class PrivacyComponent {}
