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
}