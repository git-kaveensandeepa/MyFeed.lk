const fs = require('fs');
let code = fs.readFileSync('src/app/profile.ts', 'utf8');

const devProfileHtml = `        <!-- ========================================== -->
        <!-- DEVELOPER PROFILE -->
        <!-- ========================================== -->
        <section class="mb-6">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-[#8e8e93] px-3 mb-2">
            Creator & Developer
          </h2>

          <div class="bg-white dark:bg-[#1c1c1e] rounded-[20px] shadow-xs border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ios-card">
            <a href="https://kaveensandeepa.com" target="_blank" rel="noopener noreferrer" class="p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-[9px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <mat-icon style="font-size: 18px; width: 18px; height: 18px;">code</mat-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-[#000000] dark:text-white">Developer Profile</div>
                  <div class="text-[11px] text-[#8e8e93]">Kaveen Sandeepa</div>
                </div>
              </div>
              <mat-icon class="text-purple-500 group-hover:translate-x-0.5 transition-transform" style="font-size: 18px; width: 18px; height: 18px;">open_in_new</mat-icon>
            </a>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- 6. ADMIN CONTROL LINK (IF ADMIN) -->`;

code = code.replace('<!-- ========================================== -->\n        <!-- 6. ADMIN CONTROL LINK (IF ADMIN) -->', devProfileHtml);

fs.writeFileSync('src/app/profile.ts', code);
