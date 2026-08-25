import {Component, ChangeDetectionStrategy, input} from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="skeleton-loader-container" class="w-full">
      @switch (type()) {
        @case ('featured') {
          <!-- Featured / Lead Article Skeleton -->
          <div id="skeleton-featured-card" class="rounded-[2.5rem] bg-white dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/10 overflow-hidden shadow-xl sm:shadow-2xl shadow-black/5 flex flex-col lg:flex-row relative">
            <div class="w-full lg:w-[54%] min-h-[260px] sm:min-h-[360px] lg:min-h-[440px] bg-slate-200/80 dark:bg-zinc-800/80 relative overflow-hidden">
              <div class="shimmer-effect"></div>
            </div>
            <div class="w-full lg:w-[46%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <!-- Meta tags skeleton -->
                <div class="flex items-center gap-3">
                  <div class="h-6 w-20 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                  <div class="h-4 w-28 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                </div>
                <!-- Title skeleton (3 lines) -->
                <div class="space-y-2.5 pt-2">
                  <div class="h-7 sm:h-9 w-11/12 rounded-xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                  <div class="h-7 sm:h-9 w-4/5 rounded-xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                </div>
                <!-- Summary skeleton -->
                <div class="space-y-2 pt-2">
                  <div class="h-4 w-full rounded-lg bg-slate-100 dark:bg-zinc-800/60 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                  <div class="h-4 w-5/6 rounded-lg bg-slate-100 dark:bg-zinc-800/60 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                  <div class="h-4 w-2/3 rounded-lg bg-slate-100 dark:bg-zinc-800/60 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                </div>
              </div>
              <!-- Bottom metadata skeleton -->
              <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div class="h-4 w-24 rounded-lg bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                  <div class="shimmer-effect"></div>
                </div>
                <div class="h-8 w-28 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                  <div class="shimmer-effect"></div>
                </div>
              </div>
            </div>
          </div>
        }

        @case ('grid') {
          <!-- Grid Articles Skeleton -->
          <div id="skeleton-grid-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            @for (item of [1, 2, 3, 4, 5, 6]; track item) {
              <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-5 sm:p-6 border border-black/[0.06] dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
                <div class="space-y-4">
                  <!-- Thumbnail Skeleton -->
                  <div class="aspect-[16/10] w-full rounded-2xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden shadow-inner">
                    <div class="shimmer-effect"></div>
                  </div>
                  <!-- Category & Date Skeleton -->
                  <div class="flex items-center justify-between">
                    <div class="h-4 w-16 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                      <div class="shimmer-effect"></div>
                    </div>
                    <div class="h-3 w-20 rounded-full bg-slate-100 dark:bg-zinc-800/60 relative overflow-hidden">
                      <div class="shimmer-effect"></div>
                    </div>
                  </div>
                  <!-- Title Skeleton -->
                  <div class="space-y-2">
                    <div class="h-5 w-full rounded-lg bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                      <div class="shimmer-effect"></div>
                    </div>
                    <div class="h-5 w-4/5 rounded-lg bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                      <div class="shimmer-effect"></div>
                    </div>
                  </div>
                  <!-- Summary Skeleton -->
                  <div class="space-y-1.5">
                    <div class="h-3.5 w-full rounded bg-slate-100 dark:bg-zinc-800/50 relative overflow-hidden">
                      <div class="shimmer-effect"></div>
                    </div>
                    <div class="h-3.5 w-3/4 rounded bg-slate-100 dark:bg-zinc-800/50 relative overflow-hidden">
                      <div class="shimmer-effect"></div>
                    </div>
                  </div>
                </div>
                <!-- Footer Skeleton -->
                <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <div class="h-3 w-16 rounded bg-slate-100 dark:bg-zinc-800/60 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                  <div class="h-4 w-12 rounded bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                    <div class="shimmer-effect"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @case ('article-detail') {
          <!-- Single Article Reader Skeleton -->
          <div id="skeleton-article-detail" class="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-24 space-y-8 animate-pulse">
            <!-- Breadcrumbs -->
            <div class="h-4 w-40 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
              <div class="shimmer-effect"></div>
            </div>
            
            <!-- Header Badges -->
            <div class="flex items-center gap-3">
              <div class="h-6 w-24 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
              <div class="h-6 w-32 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
            </div>

            <!-- Main Headline -->
            <div class="space-y-3">
              <div class="h-8 sm:h-12 w-full rounded-2xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
              <div class="h-8 sm:h-12 w-3/4 rounded-2xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
            </div>

            <!-- Author & Metadata Row -->
            <div class="flex items-center gap-4 py-4 border-y border-slate-100 dark:border-zinc-800">
              <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                  <div class="shimmer-effect"></div>
                </div>
                <div class="h-3 w-48 rounded bg-slate-100 dark:bg-zinc-800/60 relative overflow-hidden">
                  <div class="shimmer-effect"></div>
                </div>
              </div>
            </div>

            <!-- Hero Image Skeleton -->
            <div class="aspect-[16/9] sm:aspect-[2.2/1] w-full rounded-3xl sm:rounded-[2.5rem] bg-slate-200 dark:bg-zinc-800 relative overflow-hidden shadow-xl">
              <div class="shimmer-effect"></div>
            </div>

            <!-- Body Paragraphs -->
            <div class="space-y-4 pt-4">
              <div class="h-4 w-full rounded bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
              <div class="h-4 w-11/12 rounded bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
              <div class="h-4 w-full rounded bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
              <div class="h-4 w-4/5 rounded bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
            </div>
          </div>
        }

        @default {
          <!-- Compact List Skeleton -->
          <div class="space-y-4">
            @for (item of [1, 2, 3]; track item) {
              <div class="h-24 w-full rounded-2xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                <div class="shimmer-effect"></div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .shimmer-effect {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 1.8s infinite;
    }

    :host-context(.dark) .shimmer-effect {
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0) 100%
      );
    }

    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  readonly type = input<'featured' | 'grid' | 'article-detail' | 'list'>('grid');
}
