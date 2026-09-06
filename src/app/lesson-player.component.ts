import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ALL_COURSES } from './courses.data';

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#000000] dark:text-white transition-colors duration-300 pb-36 pt-3 sm:pt-6" [class.text-base]="fontSizeLevel() === 1" [class.text-lg]="fontSizeLevel() === 2" [class.text-sm]="fontSizeLevel() === 0">
      
      @if (course(); as c) {
        <main class="max-w-7xl w-full mx-auto px-4 sm:px-6">
          
          <!-- Top Breadcrumbs & Action Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <a routerLink="/learn" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full ios-glass-thick text-xs font-bold text-[#007AFF] hover:opacity-80 transition-opacity ios-touch">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">arrow_back</mat-icon>
                <span>පාඨමාලා (All Courses)</span>
              </a>

              <span class="text-xs text-[#8e8e93] font-bold">/</span>

              <span class="px-3 py-1 rounded-full ios-glass-thin text-[11px] font-bold text-[#8e8e93]">
                {{ c.targetAudienceLabel || c.tag }}
              </span>
            </div>

            <!-- Accessibility & Audio Tools & XP Counter -->
            <div class="flex items-center gap-2 sm:gap-3">
              
              <!-- Font Size Scaler for Elders and Kids -->
              <div class="flex items-center gap-1 p-1 rounded-full ios-glass-thin">
                <button 
                  type="button" 
                  (click)="decreaseFontSize()"
                  [disabled]="fontSizeLevel() <= 0"
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#8e8e93] hover:text-[#000000] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  title="අකුරු ප්‍රමාණය කුඩා කරන්න">
                  A-
                </button>
                <span class="text-[10px] font-mono text-[#8e8e93] px-1">{{ fontSizeLevel() === 0 ? 'Normal' : (fontSizeLevel() === 1 ? 'Medium' : 'Large') }}</span>
                <button 
                  type="button" 
                  (click)="increaseFontSize()"
                  [disabled]="fontSizeLevel() >= 2"
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#8e8e93] hover:text-[#000000] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  title="අකුරු ප්‍රමාණය විශාල කරන්න (Elders & Kids)">
                  A+
                </button>
              </div>

              <!-- XP Capsule -->
              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full ios-glass-thick">
                <mat-icon class="text-amber-500" style="font-size: 16px; width: 16px; height: 16px;">bolt</mat-icon>
                <span class="text-xs font-black text-amber-500 font-mono">{{ getCompletedCount() * 50 }} XP</span>
              </div>

              <div class="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                {{ getCompletedCount() }}/{{ c.lessons.length }} අවසන්
              </div>
            </div>
          </div>

          <!-- Beginner to Pro Journey Stepper Roadmap -->
          <div class="p-3.5 sm:p-4 rounded-2xl ios-glass-thick border border-black/5 dark:border-white/10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">timeline</mat-icon>
              </div>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-[#8e8e93]">Learning Progression:</span>
                <div class="text-xs font-black text-[#000000] dark:text-white">Beginner to Pro (ආරම්භකයේ සිට උසස් මට්ටම දක්වා සම්පූර්ණ මාවත)</div>
              </div>
            </div>

            <!-- Stages Pill Stepper -->
            <div class="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              @for (l of c.lessons; track l.id; let idx = $index) {
                <button 
                  type="button"
                  (click)="selectLesson(l.id)"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  [class.bg-emerald-500]="l.level === 'Beginner' && currentLesson()?.id === l.id"
                  [class.bg-amber-500]="l.level === 'Intermediate' && currentLesson()?.id === l.id"
                  [class.bg-purple-600]="l.level === 'Pro' && currentLesson()?.id === l.id"
                  [class.text-white]="currentLesson()?.id === l.id"
                  [class.ios-glass-thin]="currentLesson()?.id !== l.id"
                  [class.text-[#8e8e93]]="currentLesson()?.id !== l.id">
                  
                  <span class="w-2 h-2 rounded-full" 
                    [class.bg-emerald-400]="l.level === 'Beginner'" 
                    [class.bg-amber-400]="l.level === 'Intermediate'" 
                    [class.bg-purple-400]="l.level === 'Pro'"></span>
                  
                  <span>{{ l.level }} ({{ idx + 1 }})</span>

                  @if (isLessonCompleted(l.id)) {
                    <mat-icon class="text-white" style="font-size: 14px; width: 14px; height: 14px;">check_circle</mat-icon>
                  }
                </button>

                @if (idx < c.lessons.length - 1) {
                  <mat-icon class="text-[#8e8e93] shrink-0" style="font-size: 14px; width: 14px; height: 14px;">arrow_forward</mat-icon>
                }
              }
            </div>
          </div>

          <!-- 2-Column Professional Course Player Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- LEFT COLUMN: Active Lesson Focus & Interactive Workbench (8 cols) -->
            <div class="lg:col-span-8 space-y-6">
              
              @if (currentLesson(); as lesson) {
                <!-- Main Lesson Canvas Card -->
                <div class="rounded-[28px] ios-card p-6 sm:p-8 border border-white/80 dark:border-white/10 shadow-xl relative overflow-hidden animate-fade-in">
                  
                  <!-- Top Banner with Category Gradient Tint -->
                  <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10 mb-5">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0" [class]="c.gradient">
                        <mat-icon style="font-size: 20px; width: 20px; height: 20px;">{{ c.icon }}</mat-icon>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-0.5">
                          <!-- Level Pill Badge -->
                          <span 
                            class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                            [class.bg-emerald-600]="lesson.level === 'Beginner'"
                            [class.bg-amber-600]="lesson.level === 'Intermediate'"
                            [class.bg-purple-600]="lesson.level === 'Pro'">
                            {{ lesson.level }} Level
                          </span>
                          <span class="text-[10px] font-mono text-[#8e8e93]">
                            Lesson {{ currentLessonIndex() + 1 }} of {{ c.lessons.length }}
                          </span>
                        </div>
                        <h2 class="text-lg sm:text-xl font-black text-[#000000] dark:text-white leading-tight">
                          {{ lesson.title }}
                        </h2>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- Text-to-Speech (Read Aloud) Button -->
                      <button 
                        type="button"
                        (click)="toggleSpeech(lesson.summary + '. ' + (lesson.analogy ? 'සරල උපමාව: ' + lesson.analogy : ''))"
                        [class.bg-[#007AFF]]="isSpeaking()"
                        [class.text-white]="isSpeaking()"
                        [class.ios-glass-thin]="!isSpeaking()"
                        [class.text-[#007AFF]]="!isSpeaking()"
                        class="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ios-touch cursor-pointer shadow-xs">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">{{ isSpeaking() ? 'volume_off' : 'volume_up' }}</mat-icon>
                        <span>{{ isSpeaking() ? 'නවතන්න (Stop)' : 'හඬින් අසන්න (Listen)' }}</span>
                      </button>

                      <span class="px-3 py-1 rounded-full ios-glass-thin text-xs font-mono text-[#8e8e93] shrink-0">
                        {{ lesson.duration }}
                      </span>
                    </div>
                  </div>

                  <!-- Learning Mode Tabs -->
                  <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-6 border-b border-black/5 dark:border-white/10">
                    <button
                      type="button"
                      (click)="activeTab.set('guide')"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      [class.bg-[#007AFF]]="activeTab() === 'guide'"
                      [class.text-white]="activeTab() === 'guide'"
                      [class.ios-glass-thin]="activeTab() !== 'guide'"
                      [class.text-[#8e8e93]]="activeTab() !== 'guide'">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">menu_book</mat-icon>
                      <span>පාඩම (Lesson Guide)</span>
                    </button>

                    <button
                      type="button"
                      (click)="activeTab.set('deep_breakdown')"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      [class.bg-emerald-600]="activeTab() === 'deep_breakdown'"
                      [class.text-white]="activeTab() === 'deep_breakdown'"
                      [class.ios-glass-thin]="activeTab() !== 'deep_breakdown'"
                      [class.text-[#8e8e93]]="activeTab() !== 'deep_breakdown'">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">psychology</mat-icon>
                      <span>අකුරෙන් අකුර පියවරෙන් පියවර (Step-by-Step)</span>
                    </button>

                    @if (lesson.codeSnippet) {
                      <button
                        type="button"
                        (click)="activeTab.set('code_lab')"
                        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        [class.bg-amber-600]="activeTab() === 'code_lab'"
                        [class.text-white]="activeTab() === 'code_lab'"
                        [class.ios-glass-thin]="activeTab() !== 'code_lab'"
                        [class.text-[#8e8e93]]="activeTab() !== 'code_lab'">
                        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">terminal</mat-icon>
                        <span>Code Blueprint & Workbench</span>
                      </button>
                    }
                  </div>

                  <!-- TAB 1: MAIN LESSON GUIDE -->
                  @if (activeTab() === 'guide') {
                    <div class="space-y-6 animate-fade-in">
                      
                      <!-- Real-Life Analogy (සරල උපමාව) -->
                      @if (lesson.analogy) {
                        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30">
                          <div class="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400 mb-1.5">
                            <mat-icon style="font-size: 18px; width: 18px; height: 18px;">lightbulb</mat-icon>
                            <span class="uppercase tracking-wider">සරල උපමාවකින් තේරුම් ගනිමු (Real-Life Analogy):</span>
                          </div>
                          <p class="text-xs sm:text-sm text-[#000000] dark:text-gray-100 font-medium leading-relaxed">
                            {{ lesson.analogy }}
                          </p>
                        </div>
                      }

                      <!-- Executive Summary Box -->
                      <div class="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <div class="flex items-center gap-2 text-xs font-bold text-[#007AFF] mb-1.5">
                          <mat-icon style="font-size: 17px; width: 17px; height: 17px;">auto_awesome</mat-icon>
                          <span>පාඩමේ සාරාංශය (Overview):</span>
                        </div>
                        <p class="text-xs sm:text-sm text-[#1d1d1f] dark:text-gray-200 leading-relaxed font-normal">
                          {{ lesson.summary }}
                        </p>
                      </div>

                      <!-- Simplified Explanation (if available) -->
                      @if (lesson.simplifiedExplanation) {
                        <div class="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                          <div class="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">family_restroom</mat-icon>
                            <span>සරලව තේරුම් ගැනීමේ සටහන (Simplified):</span>
                          </div>
                          <p class="text-xs sm:text-sm text-[#1d1d1f] dark:text-gray-200 leading-relaxed">
                            {{ lesson.simplifiedExplanation }}
                          </p>
                        </div>
                      }

                      <!-- Detailed Content Points -->
                      <div class="space-y-3">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">list_alt</mat-icon>
                          <span>ඉගෙන ගත යුතු මූලික කරුණු (Study Topics):</span>
                        </h3>

                        <div class="grid grid-cols-1 gap-2.5">
                          @for (point of lesson.content; track $index) {
                            <div class="p-3.5 rounded-2xl ios-glass-thin border border-black/5 dark:border-white/10 flex items-start gap-3">
                              <div class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black">
                                {{ $index + 1 }}
                              </div>
                              <span class="text-xs sm:text-sm text-[#000000] dark:text-white font-medium">{{ point }}</span>
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Key Takeaways & Rules -->
                      <div class="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <h3 class="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">verified</mat-icon>
                          <span>Key Takeaways (මතක තබාගත යුතු ප්‍රධාන කරුණු):</span>
                        </h3>

                        <div class="space-y-2.5">
                          @for (takeaway of lesson.keyTakeaways; track $index) {
                            <div class="flex items-start gap-2.5 text-xs sm:text-sm text-[#1d1d1f] dark:text-gray-200">
                              <mat-icon class="text-emerald-500 shrink-0 mt-0.5" style="font-size: 16px; width: 16px; height: 16px;">check_circle</mat-icon>
                              <span class="leading-relaxed">{{ takeaway }}</span>
                            </div>
                          }
                        </div>
                      </div>

                    </div>
                  }

                  <!-- TAB 2: STEP-BY-STEP DEEP BREAKDOWN -->
                  @if (activeTab() === 'deep_breakdown') {
                    <div class="space-y-6 animate-fade-in">
                      <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <div class="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                          <mat-icon style="font-size: 18px; width: 18px; height: 18px;">foundation</mat-icon>
                          <span>අකුරෙන් අකුර මූලික පියවර මාලාව (Step-by-Step Fundamentals):</span>
                        </div>
                        <p class="text-xs sm:text-sm text-[#1d1d1f] dark:text-gray-200">
                          කිසිදු පූර්ව දැනුමක් නොමැති කෙනෙකුට වුවද මෙම පාඩම පියවරෙන් පියවර ග්‍රහණය කරගත හැකි පිළිවෙල මෙන්න:
                        </p>
                      </div>

                      <div class="space-y-4">
                        @for (point of lesson.content; track $index) {
                          <div class="p-4 sm:p-5 rounded-2xl ios-glass-thick border border-black/5 dark:border-white/10 relative overflow-hidden">
                            <div class="flex items-start gap-3">
                              <div class="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                                0{{ $index + 1 }}
                              </div>
                              <div class="space-y-1">
                                <h4 class="text-xs sm:text-sm font-bold text-[#000000] dark:text-white">
                                  පියවර {{ $index + 1 }}: {{ point.split(':')[0] || point }}
                                </h4>
                                <p class="text-xs text-[#8e8e93] leading-relaxed">
                                  {{ point.split(':')[1] || 'මෙම කොටස පිළිබඳ නිවැරදි ප්‍රායෝගික අවබෝධය ලබාගෙන ඊළඟ අදියරට යොමු වන්න.' }}
                                </p>
                              </div>
                            </div>
                          </div>
                        }
                      </div>

                    </div>
                  }

                  <!-- TAB 3: CODE BLUEPRINT & LIVE WORKBENCH -->
                  @if (activeTab() === 'code_lab' && lesson.codeSnippet) {
                    <div class="space-y-6 animate-fade-in">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
                          <mat-icon style="font-size: 16px; width: 16px; height: 16px;">code</mat-icon>
                          <span>Production Code Blueprint:</span>
                        </span>
                        
                        <button 
                          type="button" 
                          (click)="copySnippet(lesson.codeSnippet)"
                          class="px-3 py-1 rounded-lg ios-glass-thin text-xs font-bold text-[#007AFF] hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-1 cursor-pointer">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">content_copy</mat-icon>
                          <span>{{ copied() ? 'Copied!' : 'Copy Code' }}</span>
                        </button>
                      </div>

                      <div class="p-4 sm:p-5 rounded-2xl bg-[#1c1c1e] text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 shadow-inner">
                        <pre><code>{{ lesson.codeSnippet }}</code></pre>
                      </div>
                    </div>
                  }

                  <!-- Interactive Mini Coding / Prompt Exercise (Workbench) -->
                  @if (lesson.exercise) {
                    <div class="mt-8 p-5 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                      <div class="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-2">
                        <mat-icon style="font-size: 18px; width: 18px; height: 18px;">psychology</mat-icon>
                        <span>ස්වයං අභ්‍යාසය (Self-Check Challenge):</span>
                      </div>
                      <p class="text-xs sm:text-sm text-[#000000] dark:text-white font-medium mb-3">
                        {{ lesson.exercise.prompt }}
                      </p>

                      @if (!showHint()) {
                        <button 
                          type="button" 
                          (click)="showHint.set(true)"
                          class="text-xs text-[#007AFF] font-bold hover:underline flex items-center gap-1 cursor-pointer mb-2">
                          <mat-icon style="font-size: 14px; width: 14px; height: 14px;">lightbulb</mat-icon>
                          <span>Hint එක බලන්න</span>
                        </button>
                      } @else {
                        <div class="p-3 rounded-xl ios-glass-thin text-xs text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3 animate-fade-in">
                          <strong>💡 Hint:</strong> {{ lesson.exercise.hint }}
                        </div>
                      }

                      @if (showSolution()) {
                        <div class="p-3.5 rounded-xl bg-black/80 text-emerald-400 font-mono text-xs overflow-x-auto border border-white/10 animate-fade-in">
                          <pre><code>{{ lesson.exercise.solution }}</code></pre>
                        </div>
                      } @else {
                        <button 
                          type="button" 
                          (click)="showSolution.set(true)"
                          class="px-3 py-1.5 rounded-xl ios-glass-thick text-xs font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-all cursor-pointer">
                          <span>විසඳුම බලන්න (Show Solution)</span>
                        </button>
                      }
                    </div>
                  }

                  <!-- Bottom Lesson Navigation & Complete Action Bar -->
                  <div class="pt-6 mt-6 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    <button 
                      type="button" 
                      (click)="goToPreviousLesson()"
                      [disabled]="currentLessonIndex() === 0"
                      class="w-full sm:w-auto px-4 py-2.5 rounded-2xl ios-glass-thin text-xs font-bold text-[#8e8e93] hover:text-[#000000] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_back</mat-icon>
                      <span>පෙර පාඩම</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="toggleCompleteLesson(lesson.id)"
                      class="w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ios-touch"
                      [class.bg-emerald-600]="isLessonCompleted(lesson.id)"
                      [class.text-white]="isLessonCompleted(lesson.id)"
                      [class.bg-[#007AFF]]="!isLessonCompleted(lesson.id)"
                      [class.text-white]="!isLessonCompleted(lesson.id)">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">{{ isLessonCompleted(lesson.id) ? 'check_circle' : 'task_alt' }}</mat-icon>
                      <span>{{ isLessonCompleted(lesson.id) ? 'පාඩම අවසන් කළා (+50 XP ලැබුණා)' : 'පාඩම අවසන් කළ බව සලකුණු කරන්න (+50 XP)' }}</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="goToNextLesson()"
                      [disabled]="currentLessonIndex() === c.lessons.length - 1"
                      class="w-full sm:w-auto px-4 py-2.5 rounded-2xl ios-glass-thin text-xs font-bold text-[#007AFF] hover:opacity-80 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <span>මීළඟ පාඩම</span>
                      <mat-icon style="font-size: 16px; width: 16px; height: 16px;">arrow_forward</mat-icon>
                    </button>

                  </div>

                </div>
              }

            </div>

            <!-- RIGHT COLUMN: Course Syllabus & Sticky Track Info (4 cols) -->
            <div class="lg:col-span-4 space-y-6">
              
              <!-- Course Master Card -->
              <div class="rounded-[28px] ios-card p-6 border border-white/80 dark:border-white/10 shadow-xl">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md" [class]="c.gradient">
                    <mat-icon style="font-size: 24px; width: 24px; height: 24px;">{{ c.icon }}</mat-icon>
                  </div>
                  <div>
                    <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-[#007AFF]">
                      {{ c.targetAudienceLabel || c.level }}
                    </span>
                    <h3 class="text-base font-black text-[#000000] dark:text-white leading-tight mt-1">
                      {{ c.titleSinhala }}
                    </h3>
                  </div>
                </div>

                <p class="text-xs text-[#8e8e93] leading-relaxed mb-4">
                  {{ c.descriptionSinhala }}
                </p>

                <!-- Course Progress Bar -->
                <div class="space-y-1.5 mb-4">
                  <div class="flex items-center justify-between text-[11px] font-bold">
                    <span class="text-[#8e8e93]">පාඨමාලාවේ ප්‍රගතිය</span>
                    <span class="text-[#007AFF] font-mono">{{ getTrackProgressPercent() }}%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300" [style.width.%]="getTrackProgressPercent()"></div>
                  </div>
                </div>

                <!-- Reward Badge Teaser -->
                <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <mat-icon style="font-size: 18px; width: 18px; height: 18px;">military_tech</mat-icon>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Completion Reward:</div>
                    <div class="text-xs font-black text-[#000000] dark:text-white">{{ c.badgeName }} Badge</div>
                  </div>
                </div>
              </div>

              <!-- Course Syllabus Table of Contents with Levels -->
              <div class="rounded-[28px] ios-card p-6 border border-white/80 dark:border-white/10 shadow-xl">
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-black/5 dark:border-white/10">
                  <h4 class="text-xs font-black uppercase tracking-wider text-[#000000] dark:text-white flex items-center gap-1.5">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">format_list_numbered</mat-icon>
                    <span>පාඩම් මාලාව (Syllabus)</span>
                  </h4>
                  <span class="text-[11px] font-mono text-[#8e8e93]">{{ c.lessons.length }} Lessons</span>
                </div>

                <div class="space-y-2">
                  @for (lesson of c.lessons; track lesson.id; let idx = $index) {
                    <button 
                      type="button" 
                      (click)="selectLesson(lesson.id)"
                      class="w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-3 border cursor-pointer"
                      [class.bg-[#007AFF]/10]="currentLesson()?.id === lesson.id"
                      [class.border-[#007AFF]/40]="currentLesson()?.id === lesson.id"
                      [class.border-transparent]="currentLesson()?.id !== lesson.id"
                      [class.hover:bg-black/5]="currentLesson()?.id !== lesson.id"
                      [class.dark:hover:bg-white/5]="currentLesson()?.id !== lesson.id">
                      
                      <div class="flex items-center gap-3 min-w-0">
                        <div 
                          class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                          [class.bg-[#007AFF]]="currentLesson()?.id === lesson.id"
                          [class.text-white]="currentLesson()?.id === lesson.id"
                          [class.bg-black/5]="currentLesson()?.id !== lesson.id"
                          [class.dark:bg-white/10]="currentLesson()?.id !== lesson.id"
                          [class.text-[#8e8e93]]="currentLesson()?.id !== lesson.id">
                          {{ idx + 1 }}
                        </div>

                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5 mb-0.5">
                            <span 
                              class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded"
                              [class.bg-emerald-500/15]="lesson.level === 'Beginner'"
                              [class.text-emerald-600]="lesson.level === 'Beginner'"
                              [class.bg-amber-500/15]="lesson.level === 'Intermediate'"
                              [class.text-amber-600]="lesson.level === 'Intermediate'"
                              [class.bg-purple-500/15]="lesson.level === 'Pro'"
                              [class.text-purple-600]="lesson.level === 'Pro'">
                              {{ lesson.level }}
                            </span>
                            <span class="text-[10px] text-[#8e8e93] font-mono">{{ lesson.duration }}</span>
                          </div>
                          <p class="text-xs font-bold truncate text-[#000000] dark:text-white">
                            {{ lesson.title }}
                          </p>
                        </div>
                      </div>

                      @if (isLessonCompleted(lesson.id)) {
                        <mat-icon class="text-emerald-500 shrink-0" style="font-size: 18px; width: 18px; height: 18px;">check_circle</mat-icon>
                      } @else {
                        <mat-icon class="text-[#8e8e93]/40 shrink-0" style="font-size: 18px; width: 18px; height: 18px;">radio_button_unchecked</mat-icon>
                      }
                    </button>
                  }
                </div>
              </div>

            </div>

          </div>

        </main>
      }

    </div>
  `
})
export class LessonPlayer implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  courses = ALL_COURSES;
  courseId = signal<string>('ai-prompt-engineering');
  lessonId = signal<string>('');

  fontSizeLevel = signal<number>(0);
  isSpeaking = signal<boolean>(false);
  showHint = signal<boolean>(false);
  showSolution = signal<boolean>(false);
  copied = signal<boolean>(false);
  completedLessonIds = signal<string[]>([]);

  // Active learning tab: 'guide' | 'deep_breakdown' | 'code_lab'
  activeTab = signal<'guide' | 'deep_breakdown' | 'code_lab'>('guide');

  course = computed(() => {
    return this.courses.find(c => c.id === this.courseId()) || this.courses[0];
  });

  currentLessonIndex = computed(() => {
    const c = this.course();
    if (!c) return 0;
    const idx = c.lessons.findIndex(l => l.id === this.lessonId());
    return idx >= 0 ? idx : 0;
  });

  currentLesson = computed(() => {
    const c = this.course();
    if (!c || !c.lessons.length) return null;
    return c.lessons[this.currentLessonIndex()];
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const cId = params.get('courseId') || 'ai-prompt-engineering';
      const lId = params.get('lessonId');
      this.courseId.set(cId);

      const targetCourse = this.courses.find(c => c.id === cId) || this.courses[0];
      if (lId) {
        this.lessonId.set(lId);
      } else if (targetCourse.lessons.length > 0) {
        this.lessonId.set(targetCourse.lessons[0].id);
      }
      this.showHint.set(false);
      this.showSolution.set(false);
      this.activeTab.set('guide');
      this.stopSpeech();
    });

    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('myfeed_completed_lessons');
        if (saved) {
          this.completedLessonIds.set(JSON.parse(saved));
        }
        const savedFont = localStorage.getItem('myfeed_player_fontsize');
        if (savedFont) {
          this.fontSizeLevel.set(parseInt(savedFont, 10));
        }
      } catch (e) {
        console.warn('Failed to load completed lessons', e);
      }
    }
  }

  ngOnDestroy() {
    this.stopSpeech();
  }

  increaseFontSize() {
    if (this.fontSizeLevel() < 2) {
      const next = this.fontSizeLevel() + 1;
      this.fontSizeLevel.set(next);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('myfeed_player_fontsize', next.toString());
      }
    }
  }

  decreaseFontSize() {
    if (this.fontSizeLevel() > 0) {
      const next = this.fontSizeLevel() - 1;
      this.fontSizeLevel.set(next);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('myfeed_player_fontsize', next.toString());
      }
    }
  }

  toggleSpeech(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (this.isSpeaking()) {
      this.stopSpeech();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        this.isSpeaking.set(false);
      };
      utterance.onerror = () => {
        this.isSpeaking.set(false);
      };

      this.isSpeaking.set(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
      this.isSpeaking.set(false);
    }
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }

  selectLesson(id: string) {
    this.stopSpeech();
    this.lessonId.set(id);
    this.showHint.set(false);
    this.showSolution.set(false);
    this.activeTab.set('guide');
    this.router.navigate(['/learn', this.courseId(), id]);
  }

  goToPreviousLesson() {
    const c = this.course();
    if (!c) return;
    const prevIdx = this.currentLessonIndex() - 1;
    if (prevIdx >= 0) {
      this.selectLesson(c.lessons[prevIdx].id);
    }
  }

  goToNextLesson() {
    const c = this.course();
    if (!c) return;
    const nextIdx = this.currentLessonIndex() + 1;
    if (nextIdx < c.lessons.length) {
      this.selectLesson(c.lessons[nextIdx].id);
    }
  }

  isLessonCompleted(id: string): boolean {
    return this.completedLessonIds().includes(id);
  }

  getCompletedCount(): number {
    const c = this.course();
    if (!c) return 0;
    return c.lessons.filter(l => this.completedLessonIds().includes(l.id)).length;
  }

  getTrackProgressPercent(): number {
    const c = this.course();
    if (!c || c.lessons.length === 0) return 0;
    return Math.round((this.getCompletedCount() / c.lessons.length) * 100);
  }

  toggleCompleteLesson(id: string) {
    const current = this.completedLessonIds();
    let updated: string[];
    if (current.includes(id)) {
      updated = current.filter(x => x !== id);
    } else {
      updated = [...current, id];
    }
    this.completedLessonIds.set(updated);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('myfeed_completed_lessons', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save completed lessons', e);
      }
    }
  }

  copySnippet(code: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}
