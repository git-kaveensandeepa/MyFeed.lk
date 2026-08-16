import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-terms',
  template: `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 min-h-[calc(100vh-200px)]">
      <header class="mb-12">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-4">
          Terms of Use
        </h1>
        <p class="text-lg text-[#1d1d1f]/60 font-medium">
          Last updated: August 1, 2026
        </p>
      </header>

      <div class="prose prose-lg md:prose-xl max-w-none text-[#1d1d1f]/80 leading-relaxed font-serif pb-20">
        <p>
          Welcome to MyFeed.lk. By accessing or using our website, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, you must not use our website.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">1. Intellectual Property Rights</h2>
        <p>
          Other than the content you own, under these Terms, MyFeed.lk and/or its licensors own all the intellectual property rights and materials contained in this website. You are granted limited license only for purposes of viewing the material contained on this website.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">2. Restrictions</h2>
        <p>
          You are specifically restricted from all of the following:
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li>Publishing any website material in any other media without prior consent.</li>
          <li>Selling, sublicensing, and/or otherwise commercializing any website material.</li>
          <li>Publicly performing and/or showing any website material.</li>
          <li>Using this website in any way that is or may be damaging to this website.</li>
          <li>Using this website in any way that impacts user access to this website.</li>
          <li>Using this website contrary to applicable laws and regulations, or in any way may cause harm to the website, or to any person or business entity.</li>
          <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this website.</li>
        </ul>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">3. Your Content</h2>
        <p>
          In these Website Standard Terms and Conditions, "Your Content" shall mean any audio, video text, images, or other material you choose to display on this website. By displaying Your Content, you grant MyFeed.lk a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate, and distribute it in any and all media.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">4. AI Content Policy & Transparency Compliance</h2>
        <p>
          In accordance with global AI governance frameworks (including the EU AI Act Article 50 transparency requirements and Sri Lanka's digital development policies), MyFeed.lk clearly labels content that is generated or assisted by artificial intelligence. Automated or AI-assisted articles carry the <em>MyFeed AI Intelligence Desk</em> attribution and an <em>AI-Assisted Story</em> disclosure. All AI-curated journalism is maintained under editorial supervision by human editors to ensure reliability and factual accuracy.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">5. No Warranties</h2>
        <p>
          This website is provided "as is," with all faults, and MyFeed.lk expresses no representations or warranties, of any kind related to this website or the materials contained on this website. Also, nothing contained on this website shall be interpreted as advising you.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">6. Limitation of Liability</h2>
        <p>
          In no event shall MyFeed.lk, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website, whether such liability is under contract. MyFeed.lk, including its officers, directors, and employees, shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.
        </p>

        <h2 class="text-2xl font-bold text-[#1d1d1f] mt-10 mb-4 font-sans">7. Contact Us</h2>
        <p>
          If you have any questions or concerns about these Terms of Use, please reach out to us:
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
export class TermsComponent {}
