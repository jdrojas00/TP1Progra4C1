import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PreguntadosApiResponse, PreguntadosQuestion, Difficulty } from '../models/preguntados';
import { decodeHtml, shuffleArray } from '../utils/preguntados';

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://opentdb.com/api.php';

  async getQuestions(difficulty: Difficulty, amount = 10): Promise<PreguntadosQuestion[]> {
    const url = `${this.baseUrl}?amount=${amount}&difficulty=${difficulty}&type=multiple&encode=url3986`;

    const response = await firstValueFrom(
      this.http.get<PreguntadosApiResponse>(url)
    );

    if (response.response_code !== 0) {
      throw new Error('No se pudieron obtener las preguntas.');
    }

    return response.results.map(q => ({
      ...q,
      category:         decodeHtml(q.category),
      question:         decodeHtml(q.question),
      correct_answer:   decodeHtml(q.correct_answer),
      incorrect_answers: q.incorrect_answers.map(decodeHtml),
      options: shuffleArray([
        decodeHtml(q.correct_answer),
        ...q.incorrect_answers.map(decodeHtml)
      ])
    }));
  }
}