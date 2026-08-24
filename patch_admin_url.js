const fs = require('fs');
let code = fs.readFileSync('src/app/admin.ts', 'utf8');

// 1. Add aiUrlPrompt state
code = code.replace(
  "aiTopicPrompt = '';",
  "aiTopicPrompt = '';\n  aiUrlPrompt = '';"
);

// 2. Add generateFromUrl method right after generateWithAI
const genWithAiMethodEnd = `      this.isGeneratingAi.set(false);
    }
  }`;

const generateFromUrlMethod = `

  async generateFromUrl() {
    if (!this.aiUrlPrompt.trim()) return;
    this.isGeneratingAi.set(true);

    try {
      const res = await fetch('/api/generate-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: this.aiUrlPrompt })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      this.formTitle = data.sinhalaTitle || '';
      this.formSummary = data.sinhalaDescription || '';
      this.formContent = data.sinhalaFullContent || '';
      this.formCategory = data.suggestedCategory || 'Tech';
      this.formReadTime = data.readTime || '4 min read';
      this.formAuthorType = 'ai';
      
      if (data.visualPrompt) {
        this.generatedImagePrompt.set(data.visualPrompt);
        // Automatically trigger image generation
        this.generateImageFromTitle();
      }

      alert('News Article successfully generated from the provided URL!');
    } catch (error: any) {
      console.error('URL generation error:', error);
      alert('Error: ' + error.message);
    } finally {
      this.isGeneratingAi.set(false);
    }
  }`;

code = code.replace(genWithAiMethodEnd, genWithAiMethodEnd + generateFromUrlMethod);

// 3. Update the template
const oldHtml = `                <p class="text-xs text-blue-700/70 mb-4">ඔබට අවශ්‍ය පුවතේ මාතෘකාව හෝ ඉංග්‍රීසි/සිංහල සිරස්තලය මෙහි ඇතුළත් කර ක්ලික් කරන්න. AI මඟින් පූර්ණ විස්තරාත්මක සිංහල ලිපියක් (Long-form report) ක්ෂණිකව සකසා දෙනු ඇත.</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <input type="text" [(ngModel)]="aiTopicPrompt" [ngModelOptions]="{standalone: true}" placeholder="උදා: OpenAI GPT-5 Announcement, Apple Vision Pro 2, Sri Lanka 5G..." class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                  <button type="button" (click)="generateWithAI()" [disabled]="isGeneratingAi()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50">
                    @if (isGeneratingAi()) {
                      <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Generating Long Article...</span>
                    } @else {
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bolt</mat-icon>
                      <span>Generate with AI</span>
                    }
                  </button>
                </div>`;

const newHtml = `                <p class="text-xs text-blue-700/70 mb-4">ඔබට අවශ්‍ය පුවතේ මාතෘකාව හෝ පුවත් ලින්ක් එකක් (News URL) ලබා දී AI මඟින් පූර්ණ සිංහල ලිපියක් සකසා ගන්න.</p>
                
                <div class="flex flex-col gap-3">
                  <!-- From Topic -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="text" [(ngModel)]="aiTopicPrompt" [ngModelOptions]="{standalone: true}" placeholder="මාතෘකාවක් දෙන්න (e.g., Apple Vision Pro 2)" class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                    <button type="button" (click)="generateWithAI()" [disabled]="isGeneratingAi()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50">
                      @if (isGeneratingAi()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">bolt</mat-icon>
                        <span>From Topic</span>
                      }
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-4 my-1">
                    <div class="h-px bg-blue-200/60 flex-1"></div>
                    <span class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">OR</span>
                    <div class="h-px bg-blue-200/60 flex-1"></div>
                  </div>

                  <!-- From URL -->
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" [(ngModel)]="aiUrlPrompt" [ngModelOptions]="{standalone: true}" placeholder="පුවත් ලින්ක් එක මෙතනට දාන්න (e.g., https://news.google.com/...)" class="flex-1 px-4 py-3 bg-white rounded-xl border border-blue-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none">
                    <button type="button" (click)="generateFromUrl()" [disabled]="isGeneratingAi()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50">
                      @if (isGeneratingAi()) {
                        <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      } @else {
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">link</mat-icon>
                        <span>From URL</span>
                      }
                    </button>
                  </div>
                </div>`;

code = code.replace(oldHtml, newHtml);

fs.writeFileSync('src/app/admin.ts', code);
console.log('Patched admin.ts to support URL generation');
