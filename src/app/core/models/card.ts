export type Suit = 'picas' | 'corazones' | 'diamantes' | 'treboles';

export interface Card {
  value:    number;
  label:    string;
  suit:     Suit;
  color:    'red' | 'black';
}