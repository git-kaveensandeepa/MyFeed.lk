import {Injectable, signal} from '@angular/core';
import {collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, orderBy} from 'firebase/firestore';
import {db} from './firebase';

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  placement: string; // e.g., 'home-top', 'home-bottom', 'article-inline', 'sidebar'
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdManagerService {
  ads = signal<Ad[]>([]);

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
