import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { WhoAmI } from './features/who-am-i/who-am-i';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { Ahorcado } from './features/games/ahorcado/ahorcado';
import { MayorMenor } from './features/games/mayor-menor/mayor-menor';
import { Preguntados } from './features/games/preguntados/preguntados';
import { Wordle } from './features/games/wordle/wordle';
import { Chat } from './features/chat/chat';
import { Results } from './features/results/results';


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
    path: 'login',
    canActivate: [guestGuard],
    component: Login
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    component: Register
  },
  {
    path: 'who-am-i', component: WhoAmI
  },
  {
    path: 'games',
    canActivate: [authGuard],
    children: [
      {
        path: 'ahorcado',
        component: Ahorcado
      },
      {
        path: 'mayor-menor',
        component: MayorMenor
      },
      {
        path: 'preguntados',
        component: Preguntados
      },
      {
        path: 'wordle',
        component: Wordle
      }
    ]
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    component: Chat
  },
  {
    path: 'results',
    canActivate: [authGuard],
    component: Results
  },
  {
    path: '**', redirectTo: 'home'
  }
];