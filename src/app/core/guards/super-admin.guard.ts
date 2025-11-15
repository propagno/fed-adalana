import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const role = user.role.toLowerCase();
  if (role !== 'super_admin') {
    // Redirect based on user role
    if (role === 'customer') {
      router.navigate(['/catalog']);
    } else if (role === 'admin' || role === 'operator') {
      router.navigate(['/admin']);
    } else if (role === 'deliverer') {
      router.navigate(['/deliverer']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // SUPER_ADMIN must have accountId as null
  if (user.accountId !== null) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

