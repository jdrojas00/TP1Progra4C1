import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';
import { GameResult } from '../models/game-result';

@Injectable({ providedIn: 'root' })
export class GameResultsService {
  private supabase = inject(SupabaseService).getClient();

  async save(result: Omit<GameResult, 'id' | 'played_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('game_results')
      .insert(result);

    if (error) console.error('Error guardando resultado:', error.message);
  }

  async getResultsByGame(juego: string): Promise<GameResult[]> {
    const { data: results, error } = await this.supabase
      .from('game_results')
      .select('*')
      .eq('juego', juego)
      .order('puntaje', { ascending: false });

    if (error) { console.error(error.message); return []; }
    if (!results?.length) return [];

    const userIds = [...new Set(results.map(r => r.user_id))];
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, nombre, apellido')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

    return results.map(r => ({
      ...r,
      profiles: profileMap.get(r.user_id)
    }));
  }
}