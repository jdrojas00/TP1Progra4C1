export function decodeHtml(text: string): string {
  return decodeURIComponent(text);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy:   'Fácil',
  medium: 'Media',
  hard:   'Difícil'
};

export const DIFFICULTY_POINTS: Record<string, number> = {
  easy:   100,
  medium: 200,
  hard:   300,
};