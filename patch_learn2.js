const fs = require('fs');
let code = fs.readFileSync('src/app/learn.component.ts', 'utf8');

// Quiz Card padding
code = code.replace(
  '<div class="rounded-[28px] ios-card p-6 sm:p-8 border border-white/80 dark:border-white/10 shadow-xl mb-6">',
  '<div class="rounded-[24px] sm:rounded-[28px] ios-card p-5 sm:p-8 border border-white/80 dark:border-white/10 shadow-xl mb-6">'
);

// Quiz Options mobile padding
code = code.replace(
  'class="w-full text-left p-4 rounded-2xl text-sm font-semibold transition-all border border-black/5 dark:border-white/10 flex items-center justify-between group-hover:border-[#007AFF]/30"',
  'class="w-full text-left p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all border border-black/5 dark:border-white/10 flex items-center justify-between group-hover:border-[#007AFF]/30"'
);

// 60-Second Byte Cards - make them a grid but maybe adjust padding
code = code.replace(
  '<div class="group rounded-[24px] ios-card p-5 flex flex-col justify-between transition-all hover:scale-[1.02] border border-white/70 dark:border-white/10 shadow-md">',
  '<div class="group rounded-[20px] sm:rounded-[24px] ios-card p-4 sm:p-5 flex flex-col justify-between transition-all hover:scale-[1.02] border border-white/70 dark:border-white/10 shadow-md">'
);

// For the Tabs themselves, since they are pills, horizontal scroll works well on mobile. 
// We can add snap behavior.
code = code.replace(
  '<div class="flex items-center gap-2 p-1.5 rounded-2xl ios-glass-thick mb-8 overflow-x-auto scrollbar-hide max-w-lg mx-auto">',
  '<div class="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl ios-glass-thick mb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide max-w-lg mx-auto -mx-2 px-2 sm:mx-auto sm:px-1.5">'
);
code = code.replace(
  'class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">',
  'class="snap-center shrink-0 flex-1 py-2.5 px-4 sm:px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">'
);
code = code.replace(
  'class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">',
  'class="snap-center shrink-0 flex-1 py-2.5 px-4 sm:px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">'
);
code = code.replace(
  'class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">',
  'class="snap-center shrink-0 flex-1 py-2.5 px-4 sm:px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ios-touch cursor-pointer whitespace-nowrap">'
);

// Category filter bar (Courses tab) -> add snap to center elements beautifully
code = code.replace(
  '<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">',
  '<div class="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">'
);
code = code.replace(
  'class="px-4 py-2 rounded-full text-xs font-bold transition-all ios-touch shrink-0 cursor-pointer flex items-center gap-1.5">',
  'class="snap-start sm:snap-center px-4 py-2 rounded-full text-xs font-bold transition-all ios-touch shrink-0 cursor-pointer flex items-center gap-1.5">'
);


fs.writeFileSync('src/app/learn.component.ts', code);
