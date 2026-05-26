import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GameResultsService } from '../../core/services/game-results';
import { AuthService } from '../../core/services/auth';
import { GameResult } from '../../core/models/game-result';

type GameTab = 'ahorcado' | 'mayor-o-menor' | 'preguntados' | 'wordle';

interface TabConfig {
  id:    GameTab;
  label: string;
  icon:  string;
}

@Component({
  selector:    'app-results',
  standalone:  true,
  imports:     [RouterLink, DatePipe],
  templateUrl: './results.html',
  styleUrl:    './results.css'
})
export class Results implements OnInit {
  private gameResults = inject(GameResultsService);
  protected auth = inject(AuthService);

  activeTab = signal<GameTab>('ahorcado');
  loading   = signal(false);
  results   = signal<GameResult[]>([]);
  elapsedTime = signal(0);

  tabs: TabConfig[] = [
    { id: 'ahorcado',      label: 'Ahorcado',       icon: 'pi-exclamation-triangle'        },
    { id: 'mayor-o-menor', label: 'Mayor o Menor',  icon: 'pi-sort-alt'                    },
    { id: 'preguntados',   label: 'Preguntados',    icon: 'pi-question-circle'             },
    { id: 'wordle',        label: 'Wordle',         icon: 'pi-align-left'                  },
  ];

  ngOnInit(): void { this.loadResults(); }

  async selectTab(tab: GameTab): Promise<void> {
    this.activeTab.set(tab);
    await this.loadResults();
  }

  private async loadResults(): Promise<void> {
    this.loading.set(true);
    const data = await this.gameResults.getResultsByGame(this.activeTab());
    this.results.set(data);
    this.loading.set(false);
  }

  isOwnResult(result: GameResult): boolean {
    return result.user_id === this.auth.currentUser()?.id;
  }

  getPlayerName(result: GameResult): string {
    if (!result.profiles) return 'Desconocido';
    return `${result.profiles.nombre} ${result.profiles.apellido}`;
  }

  getDetail(result: GameResult): string {
    const d = result.detalles;
    if (!d) return '-';

    switch (result.juego) {
      case 'ahorcado':
        return `${d['errores']}/6 errores · Pista: ${d['pista_usada'] ? 'Sí' : 'No'}`;
      case 'mayor-o-menor':
        return `${d['aciertos']}/${d['rondas_jugadas']} aciertos · ${d['vidas_restantes']} vidas`;
      case 'preguntados':
        return `${d['preguntas_correctas']}/${d['total_preguntas']} correctas · ${d['dificultad']}`;
      case 'wordle':
        return `${d['intentos']}/6 intentos · ${d['palabra']}`;
      default:
        return '-';
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}