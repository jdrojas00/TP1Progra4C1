export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PreguntadosQuestion {
  category:         string;
  difficulty:       Difficulty;
  question:         string;
  correct_answer:   string;
  incorrect_answers: string[];
  options?:         string[];
}

export interface PreguntadosApiResponse {
  response_code: number;
  results:       PreguntadosQuestion[];
}