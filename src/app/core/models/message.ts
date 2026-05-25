export interface Message {
  id:         string;
  user_id:    string;
  mensaje:    string;
  created_at: string;
  profiles?: {
    nombre:   string;
    apellido: string;
  };
}