import { Routes } from '@angular/router';
import { HomeComponent } from '../components/home/home.component';
import { LoginComponent } from '../components/login/login.component';
import { CreateuserComponent } from '../components/createuser/createuser.component';
import { GameComponent } from '../components/game/game.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent, title: 'Home' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'createUser', component: CreateuserComponent, title: 'Create User' },
  { path: 'game/:id', component: GameComponent },
];
