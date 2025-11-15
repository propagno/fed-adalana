import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
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
  const isAdmin = role === 'admin' || role === 'operator';

  if (!isAdmin) {
    // Redirect based on user role
    if (role === 'customer') {
      router.navigate(['/catalog']);
    } else if (role === 'super_admin') {
      router.navigate(['/super-admin']);
    } else if (role === 'deliverer') {
      router.navigate(['/deliverer']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // Verify accountId is not null (required for ADMIN/OPERATOR)
  if (!user.accountId) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

