import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLogged()) return true;

  await auth.checkSession();

  if (auth.currentUser()) return true;

  return router.navigate(['/login']);
};