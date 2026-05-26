import { Component, inject, signal, computed, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { GameResultsService } from '../../../core/services/game-results';
import { getRandomWord } from '../../../core/data/wordle-words';
import { WordleRow, WordleLetter, LetterState, KeyState } from '../../../core/models/wordle';

const WORD_LENGTH  = 5;
const MAX_ATTEMPTS = 6;
const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['ENTER','Z','X','C','V','B','N','M','⌫']
];

@Component({
  selector:    'app-wordle',
  standalone:  true,
  imports:     [RouterLink, DatePipe],
  templateUrl: './wordle.html',
  styleUrl:    './wordle.css'
})
export class Wordle implements OnInit, OnDestroy {
  private auth        = inject(AuthService);
  private gameResults = inject(GameResultsService);

  readonly keyboardRows  = KEYBOARD_ROWS;
  readonly maxAttempts   = MAX_ATTEMPTS;

  targetWord    = signal('');
  grid          = signal<WordleRow[]>([]);
  currentRow    = signal(0);
  currentInput  = signal('');
  keyStates     = signal<KeyState>({});
  gameOver      = signal(false);
  won           = signal(false);
  shakeRow      = signal<number | null>(null);
  revealingRow  = signal<number | null>(null);
  elapsedTime   = signal(0);
  message       = signal<string | null>(null);

  score = computed(() => {
    if (!this.won()) return 0;
    const attemptBonus = (MAX_ATTEMPTS - this.currentRow() + 1) * 100;
    const timeBonus    = Math.max(0, 300 - this.elapsedTime());
    return attemptBonus + timeBonus;
  });

  private timer?:        ReturnType<typeof setInterval>;
  private startTime      = Date.now();
  private messageTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit():    void { this.startGame(); }
  ngOnDestroy(): void { clearInterval(this.timer); }

  startGame(): void {
    const word = getRandomWord();
    this.targetWord.set(word);

    this.grid.set(Array.from({ length: MAX_ATTEMPTS }, () => ({
      letters:  Array.from({ length: WORD_LENGTH }, () => ({ letter: '', state: 'empty' as LetterState })),
      revealed: false
    })));

    this.currentRow.set(0);
    this.currentInput.set('');
    this.keyStates.set({});
    this.gameOver.set(false);
    this.won.set(false);
    this.shakeRow.set(null);
    this.revealingRow.set(null);
    this.elapsedTime.set(0);
    this.message.set(null);
    this.startTime = Date.now();
    this.startTimer();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.gameOver() || this.revealingRow() !== null) return;

    const key = event.key.toUpperCase();
    if (key === 'ENTER')     this.submitGuess();
    else if (key === 'BACKSPACE') this.deleteLetter();
    else if (/^[A-ZÁÉÍÓÚÑ]$/.test(key)) this.addLetter(key);
  }

  onKeyPress(key: string): void {
    if (this.gameOver() || this.revealingRow() !== null) return;
    if (key === 'ENTER')  this.submitGuess();
    else if (key === '⌫') this.deleteLetter();
    else                  this.addLetter(key);
  }

  addLetter(letter: string): void {
    if (this.currentInput().length >= WORD_LENGTH) return;
    const next = this.currentInput() + letter;
    this.currentInput.set(next);
    this.updateGridRow(next);
  }

  deleteLetter(): void {
    if (!this.currentInput().length) return;
    const next = this.currentInput().slice(0, -1);
    this.currentInput.set(next);
    this.updateGridRow(next);
  }

  submitGuess(): void {
    if (this.currentInput().length < WORD_LENGTH) {
      this.showMessage('Palabra incompleta');
      this.triggerShake();
      return;
    }

    const guess  = this.currentInput();
    const target = this.targetWord();
    const row    = this.currentRow();

    const result = this.evaluateGuess(guess, target);
    this.revealingRow.set(row);

    const newGrid = [...this.grid()];
    newGrid[row] = { letters: result, revealed: true };
    this.grid.set(newGrid);

    setTimeout(() => {
      this.updateKeyStates(result);
      this.revealingRow.set(null);

      const isWon = result.every(l => l.state === 'correct');
      if (isWon) {
        this.endGame(true);
      } else if (row + 1 >= MAX_ATTEMPTS) {
        this.endGame(false);
      } else {
        this.currentRow.update(r => r + 1);
        this.currentInput.set('');
      }
    }, WORD_LENGTH * 350 + 200);
  }

  private evaluateGuess(guess: string, target: string): WordleLetter[] {
    const result: WordleLetter[]  = Array(WORD_LENGTH).fill(null).map((_, i) => ({
      letter: guess[i],
      state:  'absent' as LetterState
    }));
    const targetArr  = target.split('');
    const guessArr   = guess.split('');
    const usedTarget = Array(WORD_LENGTH).fill(false);
    const usedGuess  = Array(WORD_LENGTH).fill(false);

    // Primero correctas
    guessArr.forEach((l, i) => {
      if (l === targetArr[i]) {
        result[i].state = 'correct';
        usedTarget[i]   = true;
        usedGuess[i]    = true;
      }
    });

    // Luego presentes
    guessArr.forEach((l, i) => {
      if (usedGuess[i]) return;
      const ti = targetArr.findIndex((tl, j) => tl === l && !usedTarget[j]);
      if (ti !== -1) {
        result[i].state = 'present';
        usedTarget[ti]  = true;
      }
    });

    return result;
  }

  private updateKeyStates(result: WordleLetter[]): void {
    const next = { ...this.keyStates() };
    const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, empty: 0, active: 0 };

    result.forEach(({ letter, state }) => {
      const current = next[letter];
      if (!current || priority[state] > priority[current]) {
        next[letter] = state;
      }
    });
    this.keyStates.set(next);
  }

  private updateGridRow(input: string): void {
    const newGrid = [...this.grid()];
    const row     = this.currentRow();
    newGrid[row]  = {
      ...newGrid[row],
      letters: Array.from({ length: WORD_LENGTH }, (_, i) => ({
        letter: input[i] ?? '',
        state:  input[i] ? 'active' : 'empty'
      }))
    };
    this.grid.set(newGrid);
  }

  private triggerShake(): void {
    this.shakeRow.set(this.currentRow());
    setTimeout(() => this.shakeRow.set(null), 600);
  }

  private showMessage(msg: string): void {
    clearTimeout(this.messageTimeout);
    this.message.set(msg);
    this.messageTimeout = setTimeout(() => this.message.set(null), 2000);
  }

  private startTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.gameOver())
        this.elapsedTime.set(Math.floor((Date.now() - this.startTime) / 1000));
    }, 1000);
  }

  private async endGame(playerWon: boolean): Promise<void> {
    clearInterval(this.timer);
    this.elapsedTime.set(Math.floor((Date.now() - this.startTime) / 1000));
    this.won.set(playerWon);
    this.gameOver.set(true);

    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    await this.gameResults.save({
      user_id:           userId,
      juego:             'wordle',
      ganador:           playerWon,
      duracion_segundos: this.elapsedTime(),
      puntaje:           this.score(),
      detalles: {
        palabra:   this.targetWord(),
        intentos:  this.currentRow() + (playerWon ? 1 : 0),
      }
    });
  }

  getLetterClass(letter: WordleLetter, rowIndex: number, colIndex: number): string {
    const isRevealing = this.revealingRow() === rowIndex;
    const isCurrentRow = this.currentRow() === rowIndex && !this.grid()[rowIndex].revealed;

    if (isCurrentRow && letter.letter) return 'cell-active';
    if (!this.grid()[rowIndex].revealed) return 'cell-empty';
    if (isRevealing) return `cell-reveal-${letter.state} delay-${colIndex}`;
    return `cell-${letter.state}`;
  }

  getKeyClass(key: string): string {
    const state = this.keyStates()[key];
    if (state === 'correct') return 'key-correct';
    if (state === 'present') return 'key-present';
    if (state === 'absent')  return 'key-absent';
    return 'key-default';
  }
}