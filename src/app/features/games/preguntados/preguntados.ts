import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreguntadosService } from '../../../core/services/preguntados';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { GameResultsService } from '../../../core/services/game-results';
import { PreguntadosQuestion, Difficulty } from '../../../core/models/preguntados';
import { DIFFICULTY_LABELS, DIFFICULTY_POINTS } from '../../../core/utils/preguntados';

const QUESTION_TIME = 15;
const TOTAL_QUESTIONS = 10;

type GameState = 'selecting' | 'loading' | 'playing' | 'finished';

@Component({
  selector:    'app-preguntados',
  standalone:  true,
  imports:     [RouterLink, DatePipe],
  templateUrl: './preguntados.html',
  styleUrl:    './preguntados.css'
})
export class Preguntados implements OnDestroy {
  private preguntadosService = inject(PreguntadosService);
  private auth          = inject(AuthService);
  private gameResults   = inject(GameResultsService);

  readonly difficultyLabels  = DIFFICULTY_LABELS;
  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  readonly totalQuestions    = TOTAL_QUESTIONS;
  readonly questionTime      = QUESTION_TIME;

  gameState         = signal<GameState>('selecting');
  selectedDifficulty = signal<Difficulty>('easy');
  questions         = signal<PreguntadosQuestion[]>([]);
  currentIndex      = signal(0);
  score             = signal(0);
  correctCount      = signal(0);
  selectedOption    = signal<string | null>(null);
  timeLeft          = signal(QUESTION_TIME);
  elapsedTime       = signal(0);
  errorMessage      = signal<string | null>(null);

  private questionTimer?: ReturnType<typeof setInterval>;
  private globalTimer?:   ReturnType<typeof setInterval>;
  private startTime      = 0;

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  timerPercent    = computed(() => (this.timeLeft() / QUESTION_TIME) * 100);
  isAnswered      = computed(() => !!this.selectedOption());

  async startGame(): Promise<void> {
    this.gameState.set('loading');
    this.errorMessage.set(null);

    try {
      const qs = await this.preguntadosService.getQuestions(this.selectedDifficulty());
      this.questions.set(qs);
      this.currentIndex.set(0);
      this.score.set(0);
      this.correctCount.set(0);
      this.selectedOption.set(null);
      this.timeLeft.set(QUESTION_TIME);
      this.elapsedTime.set(0);
      this.startTime = Date.now();
      this.gameState.set('playing');
      this.startGlobalTimer();
      this.startQuestionTimer();
    } catch {
      this.errorMessage.set('No se pudieron cargar las preguntas. Intentá de nuevo en unos segundos.');
      this.gameState.set('selecting');
    }
  }

  selectOption(option: string): void {
    if (this.isAnswered()) return;
    this.selectedOption.set(option);
    clearInterval(this.questionTimer);

    const correct = option === this.currentQuestion().correct_answer;
    if (correct) {
      this.correctCount.update(c => c + 1);
      this.score.update(s => s + DIFFICULTY_POINTS[this.selectedDifficulty()]);
    }

    setTimeout(() => this.nextQuestion(), 1200);
  }

  private nextQuestion(): void {
    if (this.currentIndex() + 1 >= TOTAL_QUESTIONS) {
      this.endGame();
      return;
    }
    this.currentIndex.update(i => i + 1);
    this.selectedOption.set(null);
    this.timeLeft.set(QUESTION_TIME);
    this.startQuestionTimer();
  }

  private startQuestionTimer(): void {
    clearInterval(this.questionTimer);
    this.questionTimer = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        clearInterval(this.questionTimer);
        this.selectedOption.set('__timeout__');
        setTimeout(() => this.nextQuestion(), 1200);
      }
    }, 1000);
  }

  private startGlobalTimer(): void {
    clearInterval(this.globalTimer);
    this.globalTimer = setInterval(() => {
      this.elapsedTime.set(Math.floor((Date.now() - this.startTime) / 1000));
    }, 1000);
  }

  private async endGame(): Promise<void> {
    clearInterval(this.questionTimer);
    clearInterval(this.globalTimer);
    this.elapsedTime.set(Math.floor((Date.now() - this.startTime) / 1000));
    this.gameState.set('finished');

    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    await this.gameResults.save({
      user_id:           userId,
      juego:             'preguntados',
      ganador:           this.correctCount() >= 7,
      duracion_segundos: this.elapsedTime(),
      puntaje:           this.score(),
      detalles: {
        dificultad:        this.selectedDifficulty(),
        preguntas_correctas: this.correctCount(),
        total_preguntas:   TOTAL_QUESTIONS,
      }
    });
  }

  getOptionClass(option: string): string {
    if (!this.isAnswered()) return 'option-default';
    if (option === this.currentQuestion().correct_answer) return 'option-correct';
    if (option === this.selectedOption()) return 'option-wrong';
    return 'option-disabled';
  }

  ngOnDestroy(): void {
    clearInterval(this.questionTimer);
    clearInterval(this.globalTimer);
  }
}