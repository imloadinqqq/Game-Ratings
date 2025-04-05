import { Routes } from '@angular/router';
import { GameviewComponent } from '../components/gameview/gameview.component';
import { LoginComponent } from '../components/login/login.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'home', component: GameviewComponent, title: 'Home' },
  { path: 'login', component: LoginComponent, title: 'Login' }
];
