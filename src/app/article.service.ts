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
  increment,
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

function getTopicFallbackImage(title = '', category = ''): string {
  const t = (title + ' ' + category).toLowerCase();
  
  // 1. Apple & iPhone Ecosystem (Must be before general 'fold' or other mobile terms)
  if (
    t.includes('apple') || 
    t.includes('iphone') || 
    t.includes('macbook') || 
    t.includes('ipad') || 
    t.includes('ios') || 
    t.includes('vision pro') || 
    t.includes('airpods') ||
    t.includes('ඇපල්') || 
    t.includes('අයිෆෝන්') || 
    t.includes('අයිපෑඩ්') || 
    t.includes('මැක්බුක්')
  ) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80';
  }

  // 2. Samsung Galaxy
  if (
    t.includes('samsung') || 
    t.includes('galaxy') || 
    t.includes('z fold') || 
    t.includes('z flip') || 
    t.includes('s24') || 
    t.includes('s25') ||
    t.includes('සැම්සුන්') || 
    t.includes('ගැලැක්සි')
  ) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80';
  }

  // 3. Google Pixel & Android
  if (
    t.includes('pixel') || 
    t.includes('android') || 
    t.includes('google phone') || 
    t.includes('ගූගල්') || 
    t.includes('ඇන්ඩ්‍රොයිඩ්')
  ) {
    return 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80';
  }

  // 4. General Foldable / Smartphones (no specific brand mentioned)
  if (t.includes('foldable') || t.includes('flip phone') || t.includes('නැවෙන සුළු') || t.includes('smartphone')) {
    return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80';
  }

  // 5. Artificial Intelligence & Generative AI
  if (
    t.includes('ai') || 
    t.includes('gpt') || 
    t.includes('chatgpt') || 
    t.includes('openai') || 
    t.includes('claude') || 
    t.includes('gemini') || 
    t.includes('deepseek') || 
    t.includes('intelligence') || 
    t.includes('llm') || 
    t.includes('bot') || 
    t.includes('කෘත්‍රිම බුද්ධිය') || 
    t.includes('ඒඅයි') || 
    t.includes('ජෙමිනයි')
  ) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80';
  }

  // 6. Robotics & Automation
  if (
    t.includes('robot') || 
    t.includes('humanoid') || 
    t.includes('automation') || 
    t.includes('boston dynamics') || 
    t.includes('රොබෝ')
  ) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80';
  }

  // 7. Cybersecurity & Privacy
  if (
    t.includes('cyber') || 
    t.includes('hack') || 
    t.includes('security') || 
    t.includes('malware') || 
    t.includes('privacy') || 
    t.includes('breach') || 
    t.includes('සයිබර්') || 
    t.includes('හැක්')
  ) {
    return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';
  }

  // 8. Semiconductor, Chips & Hardware
  if (
    t.includes('chip') || 
    t.includes('nvidia') || 
    t.includes('semiconductor') || 
    t.includes('intel') || 
    t.includes('amd') || 
    t.includes('qualcomm') || 
    t.includes('gpu') || 
    t.includes('processor') || 
    t.includes('චිප්') || 
    t.includes('ප්‍රොසෙසර්')
  ) {
    return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  }

  // 9. Gaming & Consoles
  if (
    t.includes('game') || 
    t.includes('gaming') || 
    t.includes('playstation') || 
    t.includes('xbox') || 
    t.includes('nintendo') || 
    t.includes('gta') || 
    t.includes('ගේමින්') || 
    t.includes('ප්ලේස්ටේෂන්')
  ) {
    return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';
  }

  // 10. Space, NASA & Astronomy
  if (
    t.includes('space') || 
    t.includes('nasa') || 
    t.includes('spacex') || 
    t.includes('mars') || 
    t.includes('satellite') || 
    t.includes('orbit') || 
    t.includes('අභ්‍යවකාශ') || 
    t.includes('නාසා')
  ) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
  }

  // 11. Electric Vehicles & Tesla
  if (
    t.includes('tesla') || 
    t.includes('ev') || 
    t.includes('electric vehicle') || 
    t.includes('car') || 
    t.includes('auto') || 
    t.includes('ටෙස්ලා') || 
    t.includes('විදුලි වාහන')
  ) {
    return 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80';
  }

  // 12. Sri Lanka / Local
  if (
    t.includes('sri lanka') || 
    t.includes('colombo') || 
    t.includes('lka') || 
    t.includes('ශ්‍රී ලංකා') || 
    t.includes('ලංකා') || 
    category?.toLowerCase() === 'local'
  ) {
    return 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80';
}

function sanitizeArticleImage(rawUrl: string | undefined, title = '', category = '', originalTitle = ''): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
    return getTopicFallbackImage(title || originalTitle, category);
  }

  const lower = rawUrl.toLowerCase();
  // Filter out Google News icons, Google User Content logos, favicons, avatars, and generic placeholders
  if (
    lower.includes('googleusercontent.com') ||
    lower.includes('news.google.com') ||
    lower.includes('gstatic.com') ||
    lower.includes('google.com/favicon') ||
    lower.includes('avatar') ||
    lower.includes('logo') ||
    lower.includes('icon') ||
    lower.includes('1x1') ||
    lower.includes('pixel') ||
    lower.includes('badge') ||
    lower.includes('spinner') ||
    lower.includes('placeholder') ||
    lower.includes('blank') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  ) {
    return getTopicFallbackImage(title || originalTitle, category);
  }

  return rawUrl;
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

          const rawImg = data['imageUrl'] as string | undefined;
          const title = (data['title'] as string) || '';
          const category = (data['category'] as string) || '';
          const originalTitle = (data['originalTitle'] as string) || '';
          const safeImageUrl = sanitizeArticleImage(rawImg, title, category, originalTitle);

          list.push({
            id: docSnap.id,
            ...data,
            imageUrl: safeImageUrl,
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
        
        const rawImg = data['imageUrl'] as string | undefined;
        const title = (data['title'] as string) || '';
        const category = (data['category'] as string) || '';
        const originalTitle = (data['originalTitle'] as string) || '';
        const safeImageUrl = sanitizeArticleImage(rawImg, title, category, originalTitle);

        list.push({
          id: docSnap.id,
          ...data,
          imageUrl: safeImageUrl,
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
        const rawImg = data['imageUrl'] as string | undefined;
        const title = (data['title'] as string) || '';
        const category = (data['category'] as string) || '';
        const originalTitle = (data['originalTitle'] as string) || '';
        const safeImageUrl = sanitizeArticleImage(rawImg, title, category, originalTitle);

        return { id: docSnap.id, ...data, imageUrl: safeImageUrl, uploadTimeStr } as unknown as Article;
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

  async incrementViews(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, { views: increment(1) });
    } catch (error) {
      console.error('Error incrementing views in Firestore:', error);
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


