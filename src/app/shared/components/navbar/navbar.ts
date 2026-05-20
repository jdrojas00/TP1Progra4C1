import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

interface NavLink {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})

export class Navbar {
  auth = inject(AuthService);
  menuOpen = signal(false);

  links: NavLink[] = [
    { label: 'Inicio',    path: '/home',     icon: 'pi pi-home' },
    { label: 'Quién Soy', path: '/who-am-i', icon: 'pi pi-user' },
    
  ];

  guestLinks: NavLink[] = [
    { label: 'Ingresar',  path: '/login',    icon: 'pi pi-sign-in' },
    { label: 'Registro',  path: '/register', icon: 'pi pi-user-plus' }
  ]

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}