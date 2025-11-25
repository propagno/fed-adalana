import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const authService = inject(AuthService);

  // Skip error handling for empty responses or network errors to prevent loops
  const url = req.url;
  const isLocalhostRoot = url === '/' || url === 'http://localhost:4200/' || url.includes('localhost:4200/');
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip handling for network errors (ERR_EMPTY_RESPONSE, status 0, etc.) to prevent loops
      if (error.status === 0 || error.message?.includes('ERR_EMPTY_RESPONSE') || error.message?.includes('Failed to fetch')) {
        // Silently return the error without showing toast to prevent loops
        return throwError(() => error);
      }

      // Skip handling for localhost root requests to prevent loops
      if (isLocalhostRoot) {
        return throwError(() => error);
      }

      // Skip error handling for club-subscriptions endpoint (404/500 are expected when customer has no subscription)
      const isClubSubscriptionEndpoint = url.includes('/club-subscriptions/my-subscription');
      if (isClubSubscriptionEndpoint && (error.status === 404 || error.status === 500)) {
        // Silently return the error - service will handle it
        return throwError(() => error);
      }

      let errorMessage = 'Ocorreu um erro inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requisição inválida. Verifique os dados informados.';
            break;
          case 401:
            // Don't show toast for 401, auth interceptor handles it
            // Just return the error
            return throwError(() => error);
          case 403:
            errorMessage = error.error?.message || 'Você não tem permissão para realizar esta ação.';
            break;
          case 404:
            errorMessage = error.error?.message || 'Recurso não encontrado.';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflito: este recurso já existe ou está em uso.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Dados inválidos. Verifique os campos do formulário.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
        }
      }

      // Show toast notification for errors
      toastService.error(errorMessage);

      return throwError(() => error);
    })
  );
};

