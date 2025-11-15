import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const allowedRoles = route.data['roles'] as string[];
  if (!allowedRoles || allowedRoles.length === 0) {
    return true; // No role restriction
  }

  const user = authService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = user.role.toLowerCase();
  const hasRole = allowedRoles.some(role => role.toLowerCase() === userRole);

  if (!hasRole) {
    // Redirect based on user role
    if (userRole === 'customer') {
      router.navigate(['/catalog']);
    } else if (userRole === 'super_admin') {
      router.navigate(['/super-admin']);
    } else if (userRole === 'admin' || userRole === 'operator') {
      router.navigate(['/admin']);
    } else if (userRole === 'deliverer') {
      router.navigate(['/deliverer']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  return true;
};

