import {Routes, CanActivateFn, Router} from '@angular/router';
import {HomeComponent} from './home';
import {ArticleComponent} from './article';
import {DeveloperComponent} from './developer';
import {AboutComponent} from './about';
import {PrivacyComponent} from './privacy';
import {TermsComponent} from './terms';
import {AdminComponent} from './admin';
import {AuthComponent} from './auth';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';

const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAdmin()) {
    return true;
  }
  
  router.navigate(['/auth']);
  return false;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'auth', component: AuthComponent },
  { path: 'article/:id', component: ArticleComponent },
  { path: 'about', component: AboutComponent },
  { path: 'developer', component: DeveloperComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: '' }
];
