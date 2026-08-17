import { Injectable, signal, PLATFORM_ID, inject, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  collection, 
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
  timestamp?: number;
  views?: number;
  likes?: number;
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
    this.clearLegacyStorage();
    this.initRealtimeArticles();
  }

  private clearLegacyStorage() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('myfeed_cached_articles_v3');
        localStorage.removeItem('myfeed_cached_articles_v2');
        localStorage.removeItem('myfeed_cached_articles');
      } catch {
        // ignore
      }
    }
  }

  private getDocTimestamp(docData: Record<string, unknown>): number {
    if (typeof docData['timestamp'] === 'number') return docData['timestamp'];
    const createdAt = docData['createdAt'] as { toMillis?: () => number; toDate?: () => Date } | string | undefined;
    if (createdAt) {
      if (typeof createdAt === 'object' && typeof createdAt.toMillis === 'function') return createdAt.toMillis();
      if (typeof createdAt === 'object' && typeof createdAt.toDate === 'function') return createdAt.toDate().getTime();
      const parsed = new Date(createdAt as string).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    const dateVal = docData['date'] as string | undefined;
    if (dateVal) {
      const parsed = new Date(dateVal).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  }

  /**
   * Initializes real-time listener strictly for Firestore 'articles' collection.
   * Only documents that exist in Firebase will be rendered.
   */
  private initRealtimeArticles() {
    this._loading.set(true);

    try {
      const articlesCol = collection(db, 'articles');

      // Realtime listener for Firestore collection
      this.unsubscribeSnapshot = onSnapshot(articlesCol, (snapshot) => {
        const list: Article[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          let uploadTimeStr: string | undefined = undefined;
          const createdAt = data['createdAt'] as { toDate?: () => Date } | string | undefined;
          if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
            uploadTimeStr = createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          } else if (typeof createdAt === 'string') {
            const d = new Date(createdAt);
            if (!isNaN(d.getTime())) {
              uploadTimeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
          }

          list.push({
            id: docSnap.id,
            ...data,
            uploadTimeStr
          } as unknown as Article);
        });

        // Sort descending by timestamp / date
        list.sort((a, b) => {
          const timeA = this.getDocTimestamp(a as unknown as Record<string, unknown>);
          const timeB = this.getDocTimestamp(b as unknown as Record<string, unknown>);
          return timeB - timeA;
        });

        // Strictly set only real Firestore articles
        this._articles.set(list);
        this._loading.set(false);
      }, (error) => {
        console.warn('Firestore realtime subscription notice:', error);
        this.fallbackGetDocs();
      });
    } catch (err) {
      console.warn('Error initializing articles query:', err);
      this.fallbackGetDocs();
    }
  }

  private async fallbackGetDocs() {
    try {
      const articlesCol = collection(db, 'articles');
      const querySnapshot = await getDocs(articlesCol);
      const list: Article[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        let uploadTimeStr: string | undefined = undefined;
        const createdAt = data['createdAt'] as { toDate?: () => Date } | string | undefined;
        if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
          uploadTimeStr = createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (typeof createdAt === 'string') {
          uploadTimeStr = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        list.push({
          id: docSnap.id,
          ...data,
          uploadTimeStr
        } as unknown as Article);
      });

      list.sort((a, b) => {
        const timeA = this.getDocTimestamp(a as unknown as Record<string, unknown>);
        const timeB = this.getDocTimestamp(b as unknown as Record<string, unknown>);
        return timeB - timeA;
      });

      this._articles.set(list);
    } catch (e) {
      console.error('Firestore getDocs failed:', e);
      this._articles.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  async loadArticles() {
    this._loading.set(true);
    await this.fallbackGetDocs();
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
        const data = docSnap.data() as Record<string, unknown>;
        let uploadTimeStr = undefined;
        const createdAt = data['createdAt'] as { toDate?: () => Date } | string | undefined;
        if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
          uploadTimeStr = createdAt.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (typeof createdAt === 'string') {
          uploadTimeStr = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
        return { id: docSnap.id, ...data, uploadTimeStr } as unknown as Article;
      }
      return null;
    } catch (error) {
      console.warn('Error getting article by id from Firestore:', error);
      return null;
    }
  }

  async addArticle(article: Omit<Article, 'id' | 'createdAt'>) {
    try {
      const colRef = collection(db, 'articles');
      const docRef = await addDoc(colRef, {
        ...article,
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding article to Firestore:', error);
      throw error;
    }
  }

  async updateArticle(id: string, article: Partial<Article>) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, { ...article, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Error updating article in Firestore:', error);
      throw error;
    }
  }

  async deleteArticle(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting article from Firestore:', error);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }
  }
}


