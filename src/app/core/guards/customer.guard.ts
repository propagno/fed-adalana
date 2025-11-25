import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const customerGuard: CanActivateFn = (route, state) => {
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
  if (role !== 'customer') {
    // Redirect based on user role
    if (role === 'super_admin') {
      router.navigate(['/super-admin']);
    } else if (role === 'admin' || role === 'operator') {
      router.navigate(['/admin']);
    } else if (role === 'deliverer') {
      router.navigate(['/deliverer']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  // CUSTOMER users can have accountId as null because they can shop from multiple accounts
  // The accountId in the token is optional for CUSTOMER role
  return true;
};

