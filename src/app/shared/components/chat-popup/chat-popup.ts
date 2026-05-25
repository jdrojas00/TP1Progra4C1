import { Component, inject, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ChatService } from '../../../core/services/chat';

@Component({
  selector: 'app-chat-popup',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './chat-popup.html',
  styleUrl: './chat-popup.css'
})
export class ChatPopup {
  protected auth = inject(AuthService);
  protected chat = inject(ChatService);

  isOpen = signal(false);
  message = signal('');
  initialized = signal(false);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor() {
    effect(() => {
      this.chat.messages();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  async toggle(): Promise<void> {
    this.isOpen.update(v => !v);

    if (this.isOpen()) {
      if (!this.initialized()) {
        await this.chat.init();
        this.initialized.set(true);
      }
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  async send(): Promise<void> {
    if (!this.message().trim()) return;
    await this.chat.sendMessage(this.message());
    this.message.set('');
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  isOwn(userId: string): boolean {
    return this.auth.currentUser()?.id === userId;
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}