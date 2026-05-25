import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { GameResultsService } from '../../../core/services/game-results';
import { AHORCADO_WORDS, WordEntry } from '../../../core/data/words';
import { RouterLink } from '@angular/router';

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const MAX_ERRORS = 6;

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css'
})
export class Ahorcado implements OnInit {
  private auth = inject(AuthService);
  private gameResults = inject(GameResultsService);

  readonly alphabet = ALPHABET;
  readonly maxErrors = MAX_ERRORS;

  currentWord = signal<WordEntry>({ word: '', hint: '' });
  guessedLetters = signal<Set<string>>(new Set());
  errors = signal(0);
  gameOver = signal(false);
  won = signal(false);
  showHint = signal(false);
  hintUsed = signal(false);
  startTime = signal<number>(Date.now());
  elapsedTime = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  displayWord = computed(() =>
    this.currentWord().word.split('').map(l => ({
      letter: l,
      revealed: l === ' ' || this.guessedLetters().has(l)
    }))
  );

  wrongLetters = computed(() =>
    [...this.guessedLetters()].filter(l => !this.currentWord().word.includes(l))
  );

  isLetterUsed = (l: string) => this.guessedLetters().has(l);
  isLetterWrong = (l: string) => this.wrongLetters().includes(l);
  isLetterCorrect = (l: string) =>
    this.guessedLetters().has(l) && this.currentWord().word.includes(l);

  score = computed(() => {
    const base = Math.max(0, 1000 - this.errors() * 100 - (this.hintUsed() ? 50 : 0));
    return this.won() ? base : 0;
  });

  ngOnInit(): void { this.startGame(); }

  startGame(): void {
    const entry = AHORCADO_WORDS[Math.floor(Math.random() * AHORCADO_WORDS.length)];
    this.currentWord.set(entry);
    this.guessedLetters.set(new Set());
    this.errors.set(0);
    this.gameOver.set(false);
    this.won.set(false);
    this.showHint.set(false);
    this.hintUsed.set(false);
    this.elapsedTime.set(0);
    this.startTime.set(Date.now());
    this.startTimer();
  }

  guess(letter: string): void {
    if (this.gameOver() || this.guessedLetters().has(letter)) return;

    const next = new Set(this.guessedLetters());
    next.add(letter);
    this.guessedLetters.set(next);

    if (!this.currentWord().word.includes(letter)) {
      this.errors.update(e => e + 1);
      if (this.errors() >= MAX_ERRORS) this.endGame(false);
    } else {
      const allRevealed = this.currentWord().word
        .split('')
        .every(l => next.has(l));
      if (allRevealed) this.endGame(true);
    }
  }

  useHint(): void {
    if (this.hintUsed() || this.gameOver()) return;
    this.showHint.set(true);
    this.hintUsed.set(true);
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
      user_id: userId,
      juego: 'ahorcado',
      ganador: playerWon,
      duracion_segundos: this.elapsedTime(),
      puntaje: this.score(),
      detalles: {
        palabra: this.currentWord().word,
        errores: this.errors(),
        letras_adivinadas: [...this.guessedLetters()],
        pista_usada: this.hintUsed(),
      }
    });
  }
}