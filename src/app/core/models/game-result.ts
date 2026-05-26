export interface GameResult {
  id?:               string;
  user_id:           string;
  juego:             string;
  ganador:           boolean;
  duracion_segundos: number;
  puntaje:           number;
  detalles?:         Record<string, unknown>;
  played_at?:        string;
  profiles?: {
    nombre:   string;
    apellido: string;
  };
}