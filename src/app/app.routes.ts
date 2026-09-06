import {Routes} from '@angular/router';
import {HomeComponent} from './home';
import {ArticleComponent} from './article';
import {DeveloperComponent} from './developer';
import {AboutComponent} from './about';
import {PrivacyComponent} from './privacy';
import {TermsComponent} from './terms';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'article', redirectTo: '', pathMatch: 'full' },
  { path: 'article/:id', component: ArticleComponent },
  { path: 'admin', loadComponent: () => import('./admin').then(m => m.AdminComponent) },
  { path: 'profile', loadComponent: () => import('./profile').then(m => m.ProfileComponent) },
  { path: 'learn', loadComponent: () => import('./learn.component').then(m => m.LearnComponent) },
  { path: 'learn/:courseId', loadComponent: () => import('./lesson-player.component').then(m => m.LessonPlayer) },
  { path: 'learn/:courseId/:lessonId', loadComponent: () => import('./lesson-player.component').then(m => m.LessonPlayer) },
  { path: 'radio', redirectTo: 'learn', pathMatch: 'full' },
  { path: 'academy', redirectTo: 'learn', pathMatch: 'full' },
  { path: 'quizzes', loadComponent: () => import('./quizzes.component').then(m => m.QuizzesComponent) },
  { path: 'store', loadComponent: () => import('./store.component').then(m => m.StoreComponent) },
  { path: 'shorts', redirectTo: 'quizzes', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'developer', component: DeveloperComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: '' }
];
