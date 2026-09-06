const fs = require('fs');
let code = fs.readFileSync('src/app/learn.component.ts', 'utf8');

// 1. Audience selector UI - Make it horizontally scrollable on mobile
code = code.replace(
  '<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">',
  '<div class="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">'
);
code = code.replace(
  'class="p-3.5 rounded-2xl text-left transition-all ios-touch cursor-pointer flex flex-col justify-between gap-2 border border-black/5 dark:border-white/10">',
  'class="w-[75%] sm:w-auto shrink-0 snap-center p-4 rounded-2xl text-left transition-all ios-touch cursor-pointer flex flex-col justify-between gap-3 border border-black/5 dark:border-white/10">'
);

// 2. Adjust Hero Learning Status Card padding for mobile
code = code.replace(
  '<div class="relative overflow-hidden rounded-[28px] ios-card p-6 sm:p-8 mb-8 border border-white/80 dark:border-white/10 shadow-xl">',
  '<div class="relative overflow-hidden rounded-[24px] sm:rounded-[28px] ios-card p-5 sm:p-8 mb-8 border border-white/80 dark:border-white/10 shadow-xl">'
);

// 3. Make Course track cards slightly more mobile friendly
code = code.replace(
  '<div class="group rounded-[28px] ios-card p-6 flex flex-col justify-between transition-all hover:-translate-y-1.5 hover:shadow-2xl border border-white/70 dark:border-white/10 relative overflow-hidden">',
  '<div class="group rounded-[24px] sm:rounded-[28px] ios-card p-5 sm:p-6 flex flex-col justify-between transition-all hover:-translate-y-1.5 hover:shadow-2xl border border-white/70 dark:border-white/10 relative overflow-hidden">'
);

// 4. Quick Progress Stats Capsule layout
code = code.replace(
  '<div class="w-full md:w-auto shrink-0 flex items-center justify-around sm:justify-end gap-3 p-3 rounded-2xl ios-glass-thin border border-black/5 dark:border-white/10">',
  '<div class="w-full md:w-auto shrink-0 flex items-center justify-around sm:justify-end gap-2 sm:gap-3 p-3 sm:p-4 rounded-[20px] ios-glass-thin border border-black/5 dark:border-white/10">'
);

fs.writeFileSync('src/app/learn.component.ts', code);
