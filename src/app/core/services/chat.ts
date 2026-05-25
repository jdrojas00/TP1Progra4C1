import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { Message } from '../models/message';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private listening = false;
  loading = signal(false);

  messages = signal<Message[]>([]);

  async init(): Promise<void> {
    this.loading.set(true);
    await this.getMessages();
    await this.listenMessagesInRealTime();
    this.loading.set(false);
  }

  async getMessages(): Promise<void> {
    const { data: messages, error } = await this.supabase.getClient()
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) { console.error(error.message); return; }
    if (!messages) return;

    const userIds = [...new Set(messages.map(m => m.user_id))];
    const { data: profiles } = await this.supabase.getClient()
      .from('profiles')
      .select('id, nombre, apellido')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

    this.messages.set(messages.map(m => ({
      ...m,
      profiles: profileMap.get(m.user_id)
    })));

    console.log('Mensajes cargados:', this.messages());
  }

  async listenMessagesInRealTime(): Promise<void> {
    if (this.listening) return;
    this.listening = true;

    this.supabase.getClient()
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const msg = payload.new;

          const { data: profile } = await this.supabase.getClient()
            .from('profiles')
            .select('*')
            .eq('id', msg['user_id'])
            .single();

          this.messages.update(m => [...m, {
            id: msg['id'],
            mensaje: msg['mensaje'],
            user_id: msg['user_id'],
            created_at: msg['created_at'],
            profiles: profile ?? undefined
          }]);
        }
      )
      .subscribe();
  }

  async sendMessage(message: string): Promise<void> {
    const user = this.auth.currentUser();
    if (!user || !message.trim()) return;

    try {
      await this.supabase.getClient()
        .from('messages')
        .insert({ user_id: user.id, mensaje: message.trim() });
    } catch (err) {
      console.error('Error al enviar mensaje', err);
    }
  }
}