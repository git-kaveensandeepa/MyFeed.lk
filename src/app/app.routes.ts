import {Routes} from '@angular/router';
import {HomeComponent} from './home';
import {ArticleComponent} from './article';
import {DeveloperComponent} from './developer';
import {AboutComponent} from './about';
import {PrivacyComponent} from './privacy';
import {TermsComponent} from './terms';
import {AdminComponent} from './admin';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'article/:id', component: ArticleComponent },
  { path: 'about', component: AboutComponent },
  { path: 'developer', component: DeveloperComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: '' }
];
