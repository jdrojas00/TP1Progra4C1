import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';
import { UserProfile, AuthUser } from '../models/user-profile';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private supabase = inject(SupabaseService).getClient();

  currentUser = signal<AuthUser | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isLogged = computed(() => !!this.currentUser());

  async checkSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error || !data.session) { this.clearModels(); return; }

    const { id, email } = data.session.user;
    this.currentUser.set({ id, email: email ?? '' });
    await this.loadUserProfile(id);
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    if (data.user?.email) {
      this.currentUser.set({ id: data.user.id, email: data.user.email });
      await this.loadUserProfile(data.user.id);
      this.router.navigate(['/home']);
      return { success: true };
    }
    return { success: false, error: 'Error inesperado' };
  }

  async register(
    email: string, password: string,
    nombre: string, apellido: string, edad: number
  ): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };

    if (data.user) {
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({ id: data.user.id, email, nombre, apellido, edad });

      if (profileError) return { success: false, error: profileError.message };

      this.currentUser.set({ id: data.user.id, email });
      await this.loadUserProfile(data.user.id);
      this.router.navigate(['/home']);
    }
    return { success: true };
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.clearModels();
    this.router.navigate(['/login']);
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) { this.clearModels(); return; }
    if (data) this.userProfile.set(data);
  }

  private clearModels(): void {
    this.currentUser.set(null);
    this.userProfile.set(null);
  }
}