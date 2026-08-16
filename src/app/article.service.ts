import { Injectable, signal, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs, 
  doc, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Article {
  id: string;
  slug?: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  sourceUrl?: string;
  originalTitle?: string;
  authorType?: 'ai' | 'human' | 'editorial';
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  isAiGenerated?: boolean;
  createdAt?: unknown;
  uploadTimeStr?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService implements OnDestroy {
  private _articles = signal<Article[]>([]);
  private _loading = signal<boolean>(true);
  private platformId = inject(PLATFORM_ID);
  private unsubscribeSnapshot: Unsubscribe | null = null;

  readonly articles = this._articles.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.initRealtimeArticles();
  }

  private processAndDeduplicate(rawList: Article[]): Article[] {
    const uniqueList: Article[] = [];
    const seenKeys = new Set<string>();

    for (const art of rawList) {
      const title = (art.title || '').trim();
      if (!title) continue;

      // Filter out untranslated English test fallback articles
      const isEnglishOnly = /^[A-Za-z0-9\s:,'’.?|/&-]+$/.test(title);
      if (isEnglishOnly) {
        continue;
      }

      // Generate a deduplication key
      let dedupKey = '';
      if (art.sourceUrl) {
        dedupKey = 'url:' + art.sourceUrl.trim().toLowerCase();
      } else if (art.imageUrl && !art.imageUrl.startsWith('data:image')) {
        dedupKey = 'img:' + art.imageUrl.split('?')[0].trim().toLowerCase();
      } else if (title.includes('Pixel 11')) {
        dedupKey = 'topic:pixel11';
      } else if (title.includes('ෆීබී ගේට්ස්') || title.includes('බිල් ගේට්ස්')) {
        dedupKey = 'topic:phoebe_gates';
      } else if (title.includes('Dynamic Color') || title.includes('Android 17')) {
        dedupKey = 'topic:android17_dynamic_color';
      } else {
        dedupKey = 'title:' + title.slice(0, 35).toLowerCase();
      }

      if (!seenKeys.has(dedupKey)) {
        seenKeys.add(dedupKey);
        uniqueList.push(art);
      }
    }

    return uniqueList;
  }

  /**
   * Initializes real-time listener for Firestore articles.
   * Loads from Cloud Firestore cache/network in milliseconds.
   */
  private initRealtimeArticles() {
    this._loading.set(true);

    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));

      if (isPlatformBrowser(this.platformId)) {
        // Use onSnapshot on browser for instant loading + real-time cloud updates
        this.unsubscribeSnapshot = onSnapshot(
          q,
          (querySnapshot) => {
            const list: Article[] = [];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data() as Record<string, any>;
              let uploadTimeStr: string | undefined = undefined;
              
              if (data['createdAt'] && typeof data['createdAt'].toDate === 'function') {
                uploadTimeStr = data['createdAt'].toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              } else if (data['createdAt']) {
                uploadTimeStr = new Date(data['createdAt']).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              }

              list.push({
                id: docSnap.id,
                ...data,
                uploadTimeStr
              } as Article);
            });

            this._articles.set(this.processAndDeduplicate(list));
            this._loading.set(false);
          },
          (error) => {
            console.error('Firestore real-time subscription error:', error);
            this.fallbackGetDocs(q);
          }
        );
      } else {
        // In SSR, execute a fast one-time getDocs
        this.fallbackGetDocs(q);
      }
    } catch (err) {
      console.error('Error initializing articles query:', err);
      this._loading.set(false);
    }
  }

  private async fallbackGetDocs(q: any) {
    try {
      const querySnapshot = await getDocs(q);
      const list: Article[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, any>;
        let uploadTimeStr: string | undefined = undefined;
        if (data['createdAt'] && typeof data['createdAt'].toDate === 'function') {
          uploadTimeStr = data['createdAt'].toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (data['createdAt']) {
          uploadTimeStr = new Date(data['createdAt']).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        list.push({
          id: docSnap.id,
          ...data,
          uploadTimeStr
        } as Article);
      });
      this._articles.set(this.processAndDeduplicate(list));
    } catch (e) {
      console.error('Error fetching articles via getDocs:', e);
    } finally {
      this._loading.set(false);
    }
  }

  async loadArticles() {
    // Re-fetch manually if needed
    const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
    await this.fallbackGetDocs(q);
  }

  async getArticleById(id: string): Promise<Article | null> {
    const localArticle = this._articles().find(a => a.id === id || a.slug === id);
    if (localArticle) {
      return localArticle;
    }

    try {
      const docRef = doc(db, 'articles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Record<string, any>;
        let uploadTimeStr = undefined;
        if (data['createdAt'] && typeof data['createdAt'].toDate === 'function') {
          uploadTimeStr = data['createdAt'].toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (data['createdAt']) {
          uploadTimeStr = new Date(data['createdAt']).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        return { id: docSnap.id, ...data, uploadTimeStr } as Article;
      }
      return null;
    } catch (error) {
      console.error('Error getting article by id:', error);
      return null;
    }
  }

  async addArticle(article: Omit<Article, 'id' | 'createdAt'>) {
    try {
      const colRef = collection(db, 'articles');
      await addDoc(colRef, {
        ...article,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  }

  async updateArticle(id: string, article: Partial<Article>) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, { ...article });
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  async deleteArticle(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }
}
