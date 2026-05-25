import { Card, Suit } from '../models/card';

const SUITS: Suit[]       = ['picas', 'corazones', 'diamantes', 'treboles'];
const SUIT_SYMBOLS        = { picas: '♠', corazones: '♥', diamantes: '♦', treboles: '♣' };
const SUIT_COLORS         = { picas: 'black', corazones: 'red', diamantes: 'red', treboles: 'black' } as const;
const LABELS              = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export const SUIT_SYMBOL = (suit: Suit) => SUIT_SYMBOLS[suit];

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    LABELS.forEach((label, i) => {
      deck.push({ value: i + 1, label, suit, color: SUIT_COLORS[suit] });
    });
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}