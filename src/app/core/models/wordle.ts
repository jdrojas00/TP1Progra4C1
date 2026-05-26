export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'active';

export interface WordleLetter {
  letter: string;
  state:  LetterState;
}

export interface WordleRow {
  letters:  WordleLetter[];
  revealed: boolean;
}

export type KeyState = Record<string, LetterState>;