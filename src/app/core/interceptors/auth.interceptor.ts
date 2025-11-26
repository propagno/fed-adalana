import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Flag global para evitar múltiplas requisições de refresh simultâneas
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> | null = null;

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
        const url = error.url || '';
        const isLoginEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
        const isRefreshEndpoint = url.includes('/auth/refresh');
        
        // Se for erro de login/registro, não fazer logout (usuário nem está logado)
        if (isLoginEndpoint) {
          return throwError(() => error);
        }
        
        // Se for erro na própria requisição de refresh, fazer logout para evitar loop
        if (isRefreshEndpoint) {
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }
        
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // Se já está fazendo refresh, aguardar o resultado
          if (isRefreshing && refreshTokenSubject) {
            return refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap((newToken) => {
                // Retry original request with new token
                const newAuthReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(newAuthReq);
              })
            );
          }
          
          // Iniciar processo de refresh
          isRefreshing = true;
          refreshTokenSubject = new BehaviorSubject<string | null>(null);
          
          return authService.refreshToken().pipe(
            switchMap((response) => {
              // Atualizar flag e subject
              isRefreshing = false;
              refreshTokenSubject?.next(response.access_token);
              refreshTokenSubject?.complete();
              refreshTokenSubject = null;
              
              // Retry original request with new token
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access_token}`
                }
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              // Refresh failed, limpar flags e fazer logout
              isRefreshing = false;
              refreshTokenSubject?.next(null);
              refreshTokenSubject?.complete();
              refreshTokenSubject = null;
              
              authService.logout();
              router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token, logout
          authService.logout();
          router.navigate(['/auth/login']);
        }
      }

      // Handle 403 Forbidden (insufficient permissions)
      if (error.status === 403) {
        const user = authService.getCurrentUser();
        if (user) {
          const role = user.role.toLowerCase();
          // Only redirect if it's a critical permission issue
          // Don't logout or redirect for cart/catalog endpoints that might fail gracefully
          const url = error.url || '';
          const isCatalogOrCartEndpoint = url.includes('/catalog/') || url.includes('/cart/');
          
          if (!isCatalogOrCartEndpoint) {
            // Redirect based on role for non-catalog/cart endpoints
            if (role === 'customer') {
              router.navigate(['/catalog']);
            } else if (role === 'super_admin') {
              router.navigate(['/super-admin']);
            } else if (role === 'admin' || role === 'operator') {
              router.navigate(['/admin']);
            } else if (role === 'deliverer') {
              router.navigate(['/deliverer']);
            } else {
              authService.logout();
              router.navigate(['/login']);
            }
          }
          // For catalog/cart endpoints, just let the error propagate (component will handle it)
        } else {
          authService.logout();
          router.navigate(['/login']);
        }
      }

      // Handle 404 Not Found - don't logout for customer endpoints (customer may not exist yet in that account)
      if (error.status === 404) {
        const url = error.url || '';
        const isCustomerEndpoint = url.includes('/customers/me');
        // Don't logout for customer endpoints - customer may not exist yet in that account
        // Components will handle 404 errors appropriately
        if (!isCustomerEndpoint) {
          // For other 404s, let them propagate normally
        }
      }

      return throwError(() => error);
    })
  );
};

