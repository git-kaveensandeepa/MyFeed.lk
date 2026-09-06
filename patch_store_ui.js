const fs = require('fs');
const file = 'src/app/store.component.ts';
let code = fs.readFileSync(file, 'utf8');

// Update Interface
code = code.replace(
  "bgClass: string;\n}",
  "bgClass: string;\n  imageUrl?: string;\n}"
);

// Add initialization and Firestore subscription
const classStart = "export class StoreComponent {";
const newClassStart = `export class StoreComponent implements import('@angular/core').OnInit, import('@angular/core').OnDestroy {`;
code = code.replace(classStart, newClassStart);

const oldProps = `items: StoreItem[] = [
    {
      id: 'apple_airpods_pro',`;

const newProps = `items = signal<StoreItem[]>([]);
  private unsub: any;

  ngOnInit() {
    const q = query(collection(db, 'store_items'));
    this.unsub = onSnapshot(q, (snapshot) => {
      const itemsArr: StoreItem[] = [];
      snapshot.forEach(doc => {
        itemsArr.push(doc.data() as StoreItem);
      });
      this.items.set(itemsArr.sort((a,b) => b.points - a.points));
    });
  }

  ngOnDestroy() {
    if (this.unsub) this.unsub();
  }

  /*
    {
      id: 'apple_airpods_pro',`;

code = code.replace(oldProps, newProps);
code = code.replace("  purchasedStoreItems = computed(() => this.items.filter(i => this.purchasedItems().includes(i.id)));", "  purchasedStoreItems = computed(() => this.items().filter(i => this.purchasedItems().includes(i.id)));");
code = code.replace("  ];", "  */");
code = code.replace(/@for \(item of items;/g, "@for (item of items();");

// Update UI to show imageUrl if it exists
const oldIconTemplate = `<div class="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shadow-sm" [ngClass]="item.bgClass">
                  <mat-icon style="font-size: 20px; width: 20px; height: 20px;">{{ item.icon }}</mat-icon>
                </div>`;

const newIconTemplate = `@if (item.imageUrl) {
                  <div class="w-10 h-10 rounded-[12px] shadow-sm overflow-hidden bg-black/5 dark:bg-white/5 shrink-0 border border-black/5 dark:border-white/10">
                    <img [src]="item.imageUrl" alt="Reward image" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                  </div>
                } @else {
                  <div class="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shadow-sm shrink-0" [ngClass]="item.bgClass">
                    <mat-icon style="font-size: 20px; width: 20px; height: 20px;">{{ item.icon }}</mat-icon>
                  </div>
                }`;

code = code.replace(oldIconTemplate, newIconTemplate);

const oldPurchasedIcon = `<div class="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" [ngClass]="item.bgClass">
                      <mat-icon style="font-size: 20px; width: 20px; height: 20px;">{{ item.icon }}</mat-icon>
                    </div>`;

const newPurchasedIcon = `@if (item.imageUrl) {
                      <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                         <img [src]="item.imageUrl" alt="Reward image" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                      </div>
                    } @else {
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" [ngClass]="item.bgClass">
                        <mat-icon style="font-size: 20px; width: 20px; height: 20px;">{{ item.icon }}</mat-icon>
                      </div>
                    }`;
code = code.replace(oldPurchasedIcon, newPurchasedIcon);

fs.writeFileSync(file, code);
