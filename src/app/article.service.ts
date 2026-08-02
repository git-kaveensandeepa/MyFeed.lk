import { Injectable, signal } from '@angular/core';
import { collection, query, orderBy, getDocs, doc, addDoc, serverTimestamp, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Article {
  id: string;
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

  readonly articles = this._articles.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.loadArticles();
  }

  async loadArticles() {
    this._loading.set(true);
    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedArticles: Article[] = [];
      querySnapshot.forEach((doc) => {
        loadedArticles.push({ id: doc.id, ...doc.data() } as Article);
      });
      
      if (loadedArticles.length === 0) {
        await this.seedData();
        return;
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
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedArticles: Article[] = [];
      querySnapshot.forEach((doc) => {
        loadedArticles.push({ id: doc.id, ...doc.data() } as Article);
      });
      this._articles.set(loadedArticles);
    } catch (error) {
      console.error('Error seeding data:', error);
      const { ARTICLES } = await import('./data');
      this._articles.set(ARTICLES as unknown as Article[]);
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
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
