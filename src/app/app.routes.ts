import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { WhoAmI } from './features/who-am-i/who-am-i';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home', component: Home
  },
  {
    path: 'login', component: Login
  },
  {
    path: 'register', component: Register
  },
  {
    path: 'who-am-i', component: WhoAmI
  },
  {
    path: '**', redirectTo: 'home'
  }
];