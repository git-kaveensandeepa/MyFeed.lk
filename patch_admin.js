const fs = require('fs');
const file = 'src/app/admin.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Add type
code = code.replace(
  "readonly activeTab = signal<'articles' | 'auto-studio' | 'audio' | 'subscribers' | 'notify' | 'whatsapp' | 'facebook' | 'deploy' | 'ads' | 'analytics' | 'users'>('articles');",
  "readonly activeTab = signal<'articles' | 'auto-studio' | 'audio' | 'subscribers' | 'notify' | 'whatsapp' | 'facebook' | 'deploy' | 'ads' | 'analytics' | 'users' | 'store'>('articles');"
);

// 2. Add Tab Button
const tabsEnd = `            [class.text-gray-600]="activeTab() !== 'analytics'"
            [class.dark:text-gray-400]="activeTab() !== 'analytics'">
            <mat-icon class="w-5 h-5 flex-shrink-0" style="font-size: 20px; width: 20px; height: 20px;">query_stats</mat-icon>
            <span class="font-medium whitespace-nowrap">Analytics</span>
          </button>
        </nav>`;

const newTabButton = `            [class.text-gray-600]="activeTab() !== 'analytics'"
            [class.dark:text-gray-400]="activeTab() !== 'analytics'">
            <mat-icon class="w-5 h-5 flex-shrink-0" style="font-size: 20px; width: 20px; height: 20px;">query_stats</mat-icon>
            <span class="font-medium whitespace-nowrap">Analytics</span>
          </button>
          
          <button (click)="activeTab.set('store')"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all h-9"
            [class.bg-white]="activeTab() === 'store'"
            [class.dark:bg-[#2c2c2e]]="activeTab() === 'store'"
            [class.text-[#FF9500]]="activeTab() === 'store'"
            [class.shadow-sm]="activeTab() === 'store'"
            [class.text-gray-600]="activeTab() !== 'store'"
            [class.dark:text-gray-400]="activeTab() !== 'store'">
            <mat-icon class="w-5 h-5 flex-shrink-0" style="font-size: 20px; width: 20px; height: 20px;">store</mat-icon>
            <span class="font-medium whitespace-nowrap">Store</span>
          </button>
        </nav>`;

code = code.replace(tabsEnd, newTabButton);

// 3. Add Component Section
const newSection = `        } @else if (activeTab() === 'store') {
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Store Items</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Manage rewards available in the Quiz Marketplace.</p>
              </div>
              <button (click)="openStoreItemModal()" class="px-4 py-2 bg-[#FF9500] text-white rounded-lg text-sm font-semibold hover:bg-[#E08300] transition-colors flex items-center gap-2">
                <mat-icon style="font-size: 18px; width: 18px; height: 18px;">add</mat-icon>
                Add Item
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (item of storeItems(); track item.id) {
                <div class="bg-white dark:bg-[#1c1c1e] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" alt="Store Item Image" class="w-full h-32 object-cover rounded-lg mb-4" referrerpolicy="no-referrer">
                  }
                  <h3 class="font-bold text-gray-900 dark:text-white">{{ item.title }}</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">{{ item.titleSinhala }}</p>
                  <p class="text-sm text-[#FF9500] font-bold">{{ item.points }} Points</p>
                  
                  <div class="flex items-center gap-2 mt-4">
                    <button (click)="editStoreItem(item)" class="flex-1 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">Edit</button>
                    <button (click)="deleteStoreItem(item.id)" class="flex-1 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">Delete</button>
                  </div>
                </div>
              }
            </div>
          </div>
          
          <!-- Store Item Modal -->
          @if (isStoreItemModalOpen()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div class="bg-white dark:bg-[#1c1c1e] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {{ editingStoreItem() ? 'Edit Store Item' : 'New Store Item' }}
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID (Unique)</label>
                    <input type="text" [(ngModel)]="storeItemDraft().id" [disabled]="!!editingStoreItem()" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (English)</label>
                    <input type="text" [(ngModel)]="storeItemDraft().title" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (Sinhala)</label>
                    <input type="text" [(ngModel)]="storeItemDraft().titleSinhala" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea [(ngModel)]="storeItemDraft().description" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none"></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                      <input type="number" [(ngModel)]="storeItemDraft().points" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (Material)</label>
                      <input type="text" [(ngModel)]="storeItemDraft().icon" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Class</label>
                      <input type="text" [(ngModel)]="storeItemDraft().colorClass" placeholder="e.g. text-[#000]" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bg Class</label>
                      <input type="text" [(ngModel)]="storeItemDraft().bgClass" placeholder="e.g. bg-gray-900" class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (Optional)</label>
                    <input type="text" [(ngModel)]="storeItemDraft().imageUrl" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF9500] focus:border-transparent outline-none">
                  </div>
                </div>
                
                <div class="mt-6 flex justify-end gap-3">
                  <button (click)="isStoreItemModalOpen.set(false)" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                  <button (click)="saveStoreItem()" [disabled]="isSavingStoreItem()" class="px-4 py-2 bg-[#FF9500] text-white rounded-lg text-sm font-semibold hover:bg-[#E08300] transition-colors disabled:opacity-50">
                    {{ isSavingStoreItem() ? 'Saving...' : 'Save Item' }}
                  </button>
                </div>
              </div>
            </div>
          }
`;

const tabsConditionEnd = `        } @else if (activeTab() === 'audio') {
          <!-- Audio Dashboard HTML Content -->`;
code = code.replace(tabsConditionEnd, newSection + '\n' + tabsConditionEnd);

fs.writeFileSync(file, code);
