import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { Navbar } from './shared/components/navbar/navbar';
import { ChatPopup } from './shared/components/chat-popup/chat-popup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ChatPopup],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App {
  protected readonly title = signal('app-sdj');
  private auth = inject(AuthService);

  constructor() {
    this.auth.checkSession();
  }
}
