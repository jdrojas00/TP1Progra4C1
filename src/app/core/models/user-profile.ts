export interface UserProfile {
  id?: string;
  email: string;
  nombre: string;
  apellido: string;
  edad: number;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
