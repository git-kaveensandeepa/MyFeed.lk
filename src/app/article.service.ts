import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, query, orderBy, getDocs, doc, addDoc, serverTimestamp, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
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
  createdAt?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private _articles = signal<Article[]>([]);
  private _loading = signal<boolean>(true);
  private platformId = inject(PLATFORM_ID);

  readonly articles = this._articles.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.loadArticles();
  }

  async loadArticles() {
    this._loading.set(true);
    try {
      // 1. Load from Firestore
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      let loadedArticles: Article[] = [];
      querySnapshot.forEach((doc) => {
        loadedArticles.push({ id: doc.id, ...doc.data() } as Article);
      });
      
      if (loadedArticles.length === 0) {
        await this.seedData();
        return;
      }

      // 2. Fetch fresh automatic news from our backend integration (NewsAPI + Gemini)
      // Only run this on the client side to avoid absolute URL issues in SSR context
      if (isPlatformBrowser(this.platformId)) {
        try {
          const response = await fetch('/api/news');
          if (response.ok) {
            const dynamicNews = await response.json();
            if (Array.isArray(dynamicNews)) {
              let newlyAdded = false;
              const existingTitles = new Set(loadedArticles.map(a => a.title));
              const colRef = collection(db, 'articles');

              for (const dynamicItem of dynamicNews) {
                // If it's a completely new translated article, save it to Firebase
                if (!existingTitles.has(dynamicItem.title) && !dynamicItem.content.includes('translation currently unavailable')) {
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...dataToSave } = dynamicItem;
                    await addDoc(colRef, {
                      ...dataToSave,
                      createdAt: serverTimestamp()
                    });
                    newlyAdded = true;
                    existingTitles.add(dynamicItem.title);
                  } catch (e) {
                    console.error('Error saving dynamic news to Firebase:', e);
                  }
                }
              }

              // If we added new news to Firebase, reload the list from Firestore
              if (newlyAdded) {
                const freshQ = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
                const freshSnapshot = await getDocs(freshQ);
                loadedArticles = [];
                freshSnapshot.forEach((doc) => {
                  loadedArticles.push({ id: doc.id, ...doc.data() } as Article);
                });
              }
            }
          }
        } catch (newsError) {
          console.warn('Could not fetch dynamic news:', newsError);
        }
      }

      this._articles.set(loadedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      const { ARTICLES } = await import('./data');
      this._articles.set(ARTICLES as unknown as Article[]);
    } finally {
      this._loading.set(false);
    }
  }

  private async seedData() {
    try {
      const { ARTICLES } = await import('./data');
      const colRef = collection(db, 'articles');
      for (const article of ARTICLES) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...data } = article;
        await addDoc(colRef, {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      // Reload after seeding
      await this.loadArticles();
    } catch (error) {
      console.error('Error seeding data:', error);
      const { ARTICLES } = await import('./data');
      this._articles.set(ARTICLES as unknown as Article[]);
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    // Check locally first (for dynamic API news that aren't in Firestore)
    const localArticle = this._articles().find(a => a.id === id);
    if (localArticle) {
      return localArticle;
    }

    try {
      const docRef = doc(db, 'articles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Article;
      }
      return null;
    } catch (error) {
      console.error('Error getting article:', error);
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
      await this.loadArticles();
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  }

  async updateArticle(id: string, article: Partial<Article>) {
    try {
      const docRef = doc(db, 'articles', id);
      await updateDoc(docRef, { ...article });
      await this.loadArticles();
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  async deleteArticle(id: string) {
    try {
      const docRef = doc(db, 'articles', id);
      await deleteDoc(docRef);
      await this.loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
}
