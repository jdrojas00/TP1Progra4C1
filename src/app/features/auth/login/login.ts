import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

interface QuickUser {
  label: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  quickUsers: QuickUser[] = [
    { label: 'Usuario 1', email: 'joserojas061804@gmail.com', password: 'Password123!' },
    { label: 'Usuario 2', email: 'test1@gmail.com', password: 'Password123!' },
    { label: 'Usuario 3', email: 'test2@gmail.com', password: 'Test1234!' },
  ];

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.value;
    const result = await this.auth.login(email!, password!);

    if (!result.success) this.errorMessage.set(result.error ?? 'Error al iniciar sesión');
    this.loading.set(false);
  }

  quickLogin(user: QuickUser): void {
    this.form.patchValue({
      email: user.email,
      password: user.password
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}