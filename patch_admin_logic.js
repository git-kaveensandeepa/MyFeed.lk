const fs = require('fs');
const file = 'src/app/admin.ts';
let code = fs.readFileSync(file, 'utf8');

const imports = "import { User } from 'firebase/auth';";
const newImports = "import { User } from 'firebase/auth';\nimport { setDoc } from 'firebase/firestore';";
code = code.replace(imports, newImports);

const methodsEnd = "  async generateAdAudio(adId: string) {";
const storeLogic = `
  // --- STORE ITEMS LOGIC ---
  storeItems = signal<any[]>([]);
  isStoreItemModalOpen = signal(false);
  editingStoreItem = signal<any | null>(null);
  isSavingStoreItem = signal(false);
  storeItemDraft = signal<any>({
    id: '', title: '', titleSinhala: '', description: '', points: 0,
    icon: '', colorClass: '', bgClass: '', imageUrl: ''
  });
  
  private storeItemsUnsub: any;
  
  openStoreItemModal() {
    this.editingStoreItem.set(null);
    this.storeItemDraft.set({
      id: '', title: '', titleSinhala: '', description: '', points: 0,
      icon: '', colorClass: '', bgClass: '', imageUrl: ''
    });
    this.isStoreItemModalOpen.set(true);
  }
  
  editStoreItem(item: any) {
    this.editingStoreItem.set(item);
    this.storeItemDraft.set({ ...item });
    this.isStoreItemModalOpen.set(true);
  }
  
  async saveStoreItem() {
    if (!this.storeItemDraft().id || !this.storeItemDraft().title) return;
    this.isSavingStoreItem.set(true);
    try {
      await setDoc(doc(db, 'store_items', this.storeItemDraft().id), this.storeItemDraft());
      this.isStoreItemModalOpen.set(false);
    } catch (err) {
      console.error(err);
      alert('Error saving store item');
    } finally {
      this.isSavingStoreItem.set(false);
    }
  }
  
  async deleteStoreItem(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'store_items', id));
      } catch (err) {
        console.error(err);
        alert('Error deleting item');
      }
    }
  }
  // --- END STORE ITEMS LOGIC ---
`;

const initStart = "  ngOnInit() {";
const storeInit = `    // Store items
    const storeQ = query(collection(db, 'store_items'));
    this.storeItemsUnsub = onSnapshot(storeQ, (snap) => {
      this.storeItems.set(snap.docs.map(d => d.data()));
    });
`;

const destroyStart = "  ngOnDestroy() {";
const storeDestroy = "    if (this.storeItemsUnsub) this.storeItemsUnsub();\n";

code = code.replace(methodsEnd, storeLogic + '\n' + methodsEnd);
code = code.replace(initStart, initStart + '\n' + storeInit);
code = code.replace(destroyStart, destroyStart + '\n' + storeDestroy);

fs.writeFileSync(file, code);
