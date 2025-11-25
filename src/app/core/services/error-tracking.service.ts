import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AnalyticsService } from './analytics.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ErrorTrackingService implements ErrorHandler {
  private analyticsService?: AnalyticsService;

  constructor(private injector: Injector) {
    // Use injector to avoid circular dependency
    setTimeout(() => {
      this.analyticsService = this.injector.get(AnalyticsService);
    });
  }

  handleError(error: Error | HttpErrorResponse): void {
    // Ignore Angular's ExpressionChangedAfterItHasBeenCheckedError (NG0100)
    // This is a development-only check that doesn't affect functionality
    if (error && (error as any).message && (error as any).message.includes('NG0100')) {
      return; // Silently ignore this specific error
    }

    let errorMessage = '';
    let errorStack = '';
    let errorContext = '';

    if (error instanceof HttpErrorResponse) {
      // Server-side error
      errorMessage = `HTTP Error: ${error.status} - ${error.message}`;
      errorContext = error.url || 'Unknown URL';
      
      if (error.error) {
        errorMessage += ` - ${JSON.stringify(error.error)}`;
      }
    } else {
      // Client-side error
      errorMessage = error.message || 'Unknown error';
      errorStack = error.stack || '';
      errorContext = 'Client-side';
    }

    // Log to console in development
    if (!environment.production) {
      console.error('Error caught by ErrorTrackingService:', {
        message: errorMessage,
        stack: errorStack,
        context: errorContext,
        error: error
      });
    }

    // Track error in analytics
    if (this.analyticsService) {
      this.analyticsService.trackError(
        new Error(errorMessage),
        errorContext
      );
    }

    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (environment.production) {
      // Example: Send to error tracking service
      // this.sendToErrorTrackingService(errorMessage, errorStack, errorContext);
    }
  }

  /**
   * Track unhandled promise rejections
   */
  trackUnhandledRejection(reason: any): void {
    const errorMessage = reason?.message || 'Unhandled Promise Rejection';
    
    if (this.analyticsService) {
      this.analyticsService.trackError(
        new Error(errorMessage),
        'Unhandled Promise Rejection'
      );
    }
  }
}

