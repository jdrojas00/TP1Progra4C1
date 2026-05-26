export const WORDLE_WORDS: string[] = [
  'CALOR', 'PLAYA', 'REINO', 'JUEGO', 'MONTE',
  'FRESA', 'GLOBO', 'PIANO', 'TIGRE', 'LIMON',
  'SABIO', 'CAMPO', 'DULCE', 'VERDE', 'CIELO',
  'TORRE', 'FIRMA', 'PLAZA', 'NEGRO', 'BARCO',
  'FUEGO', 'NIETO', 'CLARO', 'BELLO', 'MOSCA',
  'PERLA', 'GRANO', 'SUAVE', 'RATON', 'VIDRO',
  'TRIGO', 'SALSA', 'CUERO', 'PANAL', 'BRISA',
  'LINEA', 'CISNE', 'BRAZO', 'FLOTA', 'GENIO',
  'QUESO', 'PLOMO', 'ZORRA', 'HIELO', 'PRISA',
  'COBRE', 'DANZA', 'FANGO', 'GRUTA', 'JARDIN',
];

export function getRandomWord(): string {
  return WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
}