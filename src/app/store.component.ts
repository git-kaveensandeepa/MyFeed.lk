import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { doc, updateDoc, arrayUnion, increment, collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';

interface StoreItem {
  id: string;
  title: string;
  titleSinhala: string;
  description: string;
  points: number;
  icon: string;
  colorClass: string;
  bgClass: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-store',
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F2F2F7] dark:bg-black pt-16 sm:pt-20 pb-24 sm:pb-8 px-4 sm:px-6 animate-fade-in">
      <main class="max-w-2xl mx-auto">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <a routerLink="/profile" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors cursor-pointer active:scale-95">
              <mat-icon style="font-size: 20px; width: 20px; height: 20px;">arrow_back</mat-icon>
            </a>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-[#000000] dark:text-white">
              Rewards Store
            </h1>
          </div>
          
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 rounded-full text-[#FF9500]">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">stars</mat-icon>
            <span class="text-sm font-bold">{{ totalPoints() }} Pts</span>
          </div>
        </div>

        <p class="text-sm text-[#8E8E93] mb-8 font-medium">
          ඔබ Quizzes මගින් ලබාගත් ලකුණු (Points) භාවිතා කර පහත ත්‍යාගයන් ලබාගත හැක. මේවා ඔබගේ ලිපිනයටම එවනු ලැබේ.
        </p>

        @if (isProcessing()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        <!-- Items Grid (Replaced with Coming Soon) -->
        <div class="flex flex-col items-center justify-center p-10 bg-white dark:bg-[#1C1C1E] rounded-[28px] shadow-sm border border-black/[0.04] dark:border-white/[0.06] text-center max-w-lg mx-auto">
          <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FF9500] to-[#FFCC00] flex items-center justify-center text-white mb-6 shadow-md">
            <mat-icon style="font-size: 40px; width: 40px; height: 40px;">card_giftcard</mat-icon>
          </div>
          <h2 class="text-2xl font-black text-black dark:text-white mb-2">Coming Soon</h2>
          <p class="text-sm text-[#8E8E93] mb-6 font-medium leading-relaxed">
            ඉතා ඉක්මනින් ඔබගේ ලකුණු (Points) භාවිතා කර My Feed LK නිල T-shirts, Power Banks, Smart Bands වැනි වටිනා ත්‍යාගයන් ලබාගත හැකි වේ. දිගටම රැඳී සිටින්න!
          </p>
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold uppercase tracking-wider">
            <mat-icon style="font-size: 16px; width: 16px; height: 16px;">update</mat-icon>
            Stay Tuned
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class StoreComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  
  isProcessing = signal<boolean>(false);

  userProfile = this.authService.userProfile;
  totalPoints = computed(() => this.userProfile()?.quizPoints || 0);
  purchasedItems = computed(() => this.userProfile()?.purchasedItems || []);

  items = signal<StoreItem[]>([]);
  private unsub: any;

  ngOnInit() {
    const q = query(collection(db, 'store_items'));
    this.unsub = onSnapshot(q, (snapshot: any) => {
      const itemsArr: StoreItem[] = [];
      snapshot.forEach((doc: any) => {
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
      id: 'apple_airpods_pro',
      title: 'Apple AirPods Pro 2',
      titleSinhala: 'Apple AirPods Pro',
      description: 'Noise Cancellation සහිත Apple AirPods Pro අත්දැකීම ලබාගන්න.',
      points: 50000,
      icon: 'headphones',
      colorClass: 'text-[#000000]',
      bgClass: 'bg-gradient-to-tr from-gray-700 to-gray-900'
    },
    {
      id: 'jbl_go_3',
      title: 'JBL Go 3 Bluetooth Speaker',
      titleSinhala: 'JBL Go 3 ස්පීකරය',
      description: 'හොඳම Sound Quality එකක් තියෙන Original JBL Bluetooth Speaker එකක්.',
      points: 20000,
      icon: 'speaker',
      colorClass: 'text-[#FF3B30]',
      bgClass: 'bg-gradient-to-tr from-[#FF3B30] to-[#FF6B22]'
    },
    {
      id: 'mi_smart_band_8',
      title: 'Xiaomi Smart Band 8',
      titleSinhala: 'Xiaomi Smart Band 8',
      description: 'ඔබගේ සෞඛ්‍යය මැනගන්න හොඳම Smart Fitness Band එකක්.',
      points: 15000,
      icon: 'watch',
      colorClass: 'text-[#007AFF]',
      bgClass: 'bg-gradient-to-tr from-[#007AFF] to-[#34C759]'
    },
    {
      id: 'power_bank_10000',
      title: 'Baseus 10000mAh Power Bank',
      titleSinhala: 'Baseus 10000mAh Power Bank',
      description: 'Fast Charging පහසුකම සහිත 10000mAh පවර් බෑන්ක් එකක්.',
      points: 10000,
      icon: 'battery_charging_full',
      colorClass: 'text-[#FFCC00]',
      bgClass: 'bg-gradient-to-tr from-[#FF9500] to-[#FFCC00]'
    },
    {
      id: 'myfeed_tshirt',
      title: 'My Feed LK Official T-Shirt',
      titleSinhala: 'My Feed LK නිල T-Shirt එක',
      description: 'My Feed LK Logo එක සහිත විශේෂිත T-Shirt එකක්.',
      points: 5000,
      icon: 'checkroom',
      colorClass: 'text-[#5856D6]',
      bgClass: 'bg-gradient-to-tr from-[#5856D6] to-[#AF52DE]'
    }
  */

  purchasedStoreItems = computed(() => this.items().filter(i => this.purchasedItems().includes(i.id)));

  async purchaseItem(item: StoreItem) {
    const user = this.authService.currentUser();
    if (!user) {
      this.authService.openAuthModal('login');
      return;
    }

    if (this.totalPoints() < item.points || this.purchasedItems().includes(item.id)) {
      return; // Validation fails
    }

    this.isProcessing.set(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // We deduct points and add the item id to purchasedItems array
      await updateDoc(userRef, {
        purchasedItems: arrayUnion(item.id),
        quizPoints: increment(-item.points)
      });
      
      // Update local state to reflect UI changes instantly
      this.authService.userProfile.update(profile => {
        if (!profile) return profile;
        return {
          ...profile,
          purchasedItems: [...(profile.purchasedItems || []), item.id],
          quizPoints: (profile.quizPoints || 0) - item.points
        };
      });

    } catch (err) {
      console.error('Purchase failed', err);
      alert('ක්‍රියාවලිය අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
