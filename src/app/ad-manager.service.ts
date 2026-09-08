import {Injectable, signal} from '@angular/core';
import {collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy} from 'firebase/firestore';
import {db} from './firebase';

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  placement: string;
  createdAt: unknown;
}

export interface AdSlotDefinition {
  id: string;
  name: string;
  page: string;
  dimension: string;
  recommendedSize: string;
}

export const AVAILABLE_AD_SLOTS: AdSlotDefinition[] = [
  { id: 'home-top', name: 'Home - Top Leaderboard (මුල් පිටුව ප්‍රධාන ඉහළ බැනරය)', page: 'Home', dimension: 'Leaderboard', recommendedSize: '728 × 90 px / 1200 × 250 px' },
  { id: 'home-feed-1', name: 'Home - In-Feed Native Ad 1 (පුවත් අතර මුල් දැන්වීම)', page: 'Home', dimension: 'In-Feed', recommendedSize: 'Responsive Card / 800 × 400 px' },
  { id: 'home-feed-2', name: 'Home - In-Feed Native Ad 2 (පුවත් අතර දෙවන දැන්වීම)', page: 'Home', dimension: 'In-Feed', recommendedSize: 'Responsive Card / 800 × 400 px' },
  { id: 'home-sidebar-1', name: 'Home - Mid-Page Banner (මැද දැන්වීම් අවකාශය)', page: 'Home', dimension: 'Banner', recommendedSize: '728 × 90 px / 970 × 250 px' },
  { id: 'home-bottom', name: 'Home - Bottom Leaderboard (මුල් පිටුව පහළ බැනරය)', page: 'Home', dimension: 'Leaderboard', recommendedSize: '728 × 90 px / 1200 × 200 px' },
  { id: 'article-top', name: 'Article - Top Header Banner (ලිපි ආරම්භක දැන්වීම)', page: 'Article', dimension: 'Leaderboard', recommendedSize: '728 × 90 px / 800 × 200 px' },
  { id: 'article-inline', name: 'Article - Mid-Content Inline (ලිපිය අභ්‍යන්තර දැන්වීම - High CTR)', page: 'Article', dimension: 'In-Article', recommendedSize: 'Responsive Banner / 728 × 180 px' },
  { id: 'article-bottom', name: 'Article - Footer Ad (ලිපිය අවසාන දැන්වීම)', page: 'Article', dimension: 'Leaderboard', recommendedSize: '728 × 90 px / 800 × 250 px' },
  { id: 'bytes-feed', name: 'Tech Bytes - Sponsored Reel (Shorts දැන්වීම් අවකාශය)', page: 'Bytes', dimension: 'Vertical Card', recommendedSize: '9:16 / 1080 × 1920 px' },
  { id: 'quizzes-finish', name: 'Quizzes - Results Screen Banner (ප්‍රශ්නාවලි අවසන් බැනරය)', page: 'Quizzes', dimension: 'Card Banner', recommendedSize: '600 × 200 px' },
  { id: 'learn-top', name: 'Academy - Header Ad (පාඨමාලා ප්‍රධාන බැනරය)', page: 'Academy', dimension: 'Leaderboard', recommendedSize: '728 × 90 px / 1200 × 200 px' },
  { id: 'learn-bottom', name: 'Academy - Bottom Ad (පාඨමාලා පහළ බැනරය)', page: 'Academy', dimension: 'Leaderboard', recommendedSize: '728 × 90 px / 1200 × 200 px' },
];

@Injectable({
  providedIn: 'root'
})
export class AdManagerService {
  ads = signal<Ad[]>([]);
  readonly availableSlots = AVAILABLE_AD_SLOTS;

  constructor() {
    this.listenToAds();
  }

  private listenToAds() {
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      const adsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ad));
      this.ads.set(adsList);
    });
  }

  async addAd(ad: Omit<Ad, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'ads'), {
      ...ad,
      createdAt: serverTimestamp()
    });
  }

  async updateAd(id: string, data: Partial<Ad>) {
    await updateDoc(doc(db, 'ads', id), data);
  }

  async deleteAd(id: string) {
    await deleteDoc(doc(db, 'ads', id));
  }
}
