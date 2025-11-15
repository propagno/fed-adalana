import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from localStorage
  const token = localStorage.getItem('access_token');
  
  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle response
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Try to refresh token
          return authService.refreshToken().pipe(
            switchMap((response) => {
              // Retry original request with new token
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, logout user
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token, logout
          authService.logout();
          router.navigate(['/login']);
        }
      }

      // Handle 403 Forbidden (insufficient permissions)
      if (error.status === 403) {
        const user = authService.getCurrentUser();
        if (user) {
          const role = user.role.toLowerCase();
          // Redirect based on role
          if (role === 'customer') {
            router.navigate(['/catalog']);
          } else if (role === 'super_admin') {
            router.navigate(['/super-admin']);
          } else if (role === 'admin' || role === 'operator') {
            router.navigate(['/admin']);
          } else if (role === 'deliverer') {
            router.navigate(['/deliverer']);
          } else {
            router.navigate(['/login']);
          }
        } else {
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};

