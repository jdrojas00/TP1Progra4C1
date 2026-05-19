import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GithubUser } from '../models/github-user';

@Injectable({
  providedIn: 'root',
})

export class GithubService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.github.com/users/jdrojas00';

  profile = signal<GithubUser | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<GithubUser>(this.apiUrl)
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el perfil de GitHub');
          this.loading.set(false);
        }
      });
  }
}
