import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DialogModule, ButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);

  loading      = signal(false);
  showPassword = signal(false);
  modalVisible = signal(false);
  modalMessage = signal('');

  form = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    edad:     [null as number | null, [Validators.required, Validators.min(1), Validators.max(120)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { email, password, nombre, apellido, edad } = this.form.value;

    const result = await this.auth.register(
      email!, password!, nombre!, apellido!, edad!
    );

    if (!result.success) {
      this.modalMessage.set(result.error ?? 'Error al registrarse');
      this.modalVisible.set(true);
    }
    this.loading.set(false);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}