import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { GameResultsService } from '../../../core/services/game-results';
import { Card } from '../../../core/models/card';
import { buildDeck, SUIT_SYMBOL } from '../../../core/data/deck';

const MAX_ROUNDS = 12;
const MAX_LIVES  = 5;
const POINTS     = {
  correctGuess:   100,
  correctEqual:   300,
  wrongGuess:     -50,
  wrongEqual:     -60,
} as const;

type Guess   = 'higher' | 'lower' | 'equal';
type Verdict = 'correct' | 'wrong' | null;

@Component({
  selector:    'app-mayor-menor',
  standalone:  true,
  imports:     [RouterLink, DatePipe],
  templateUrl: './mayor-menor.html',
  styleUrl:    './mayor-menor.css'
})
export class MayorMenor implements OnInit, OnDestroy {
  private auth        = inject(AuthService);
  private gameResults = inject(GameResultsService);
  readonly suitSymbol = SUIT_SYMBOL;

  deck          = signal<Card[]>([]);
  currentIndex  = signal(0);
  lives         = signal(MAX_LIVES);
  round         = signal(0);
  score         = signal(0);
  hits          = signal(0);
  gameOver      = signal(false);
  won           = signal(false);
  verdict       = signal<Verdict>(null);
  lastGuess     = signal<Guess | null>(null);
  revealing     = signal(false);
  startTime     = signal(Date.now());
  elapsedTime   = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  readonly maxRounds = MAX_ROUNDS;
  readonly maxLives  = MAX_LIVES;

  currentCard = computed(() => this.deck()[this.currentIndex()]);
  nextCard    = computed(() => this.deck()[this.currentIndex() + 1]);

  livesArray  = computed(() => Array.from({ length: MAX_LIVES }, (_, i) => i < this.lives()));

  ngOnInit():    void { this.startGame(); }
  ngOnDestroy(): void { clearInterval(this.timer); }

  startGame(): void {
    this.deck.set(buildDeck());
    this.currentIndex.set(0);
    this.lives.set(MAX_LIVES);
    this.round.set(0);
    this.score.set(0);
    this.hits.set(0);
    this.gameOver.set(false);
    this.won.set(false);
    this.verdict.set(null);
    this.lastGuess.set(null);
    this.revealing.set(false);
    this.elapsedTime.set(0);
    this.startTime.set(Date.now());
    this.startTimer();
  }

  guess(choice: Guess): void {
    if (this.gameOver() || this.revealing()) return;

    const curr = this.currentCard().value;
    const next = this.nextCard().value;
    const diff = next - curr;

    let correct: boolean;
    if (choice === 'equal') {
      correct = diff === 0;
    } else if (choice === 'higher') {
      correct = diff > 0;
    } else {
      correct = diff < 0;
    }

    const isEqualSituation = diff === 0;
    let points: number;

    if (correct) {
      points = choice === 'equal' ? POINTS.correctEqual : POINTS.correctGuess;
      this.hits.update(h => h + 1);
    } else {
      points = isEqualSituation || choice !== 'equal' ? POINTS.wrongGuess : POINTS.wrongEqual;
    }

    this.score.update(s => s + points);
    this.lastGuess.set(choice);
    this.verdict.set(correct ? 'correct' : 'wrong');
    this.revealing.set(true);

    if (!correct) this.lives.update(l => l - 1);

    setTimeout(() => {
      this.round.update(r => r + 1);
      this.currentIndex.update(i => i + 1);
      this.verdict.set(null);
      this.lastGuess.set(null);
      this.revealing.set(false);

      const roundsUp = this.round() >= MAX_ROUNDS;
      const livesUp  = this.lives() <= 0;

      if (roundsUp || livesUp) {
        this.endGame(roundsUp && this.lives() > 0);
      }
    }, 1200);
  }

  private startTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.gameOver())
        this.elapsedTime.set(Math.floor((Date.now() - this.startTime()) / 1000));
    }, 1000);
  }

  private async endGame(playerWon: boolean): Promise<void> {
    clearInterval(this.timer);
    this.elapsedTime.set(Math.floor((Date.now() - this.startTime()) / 1000));
    this.won.set(playerWon);
    this.gameOver.set(true);

    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    await this.gameResults.save({
      user_id:           userId,
      juego:             'mayor-o-menor',
      ganador:           playerWon,
      duracion_segundos: this.elapsedTime(),
      puntaje:           this.score(),
      detalles: {
        rondas_jugadas: this.round(),
        vidas_restantes: this.lives(),
        aciertos: this.hits()
      }
    });
  }
}