import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ErrorHandler } from '@angular/core';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { cacheInterceptor } from './app/core/interceptors/cache.interceptor';
import { ErrorTrackingService } from './app/core/services/error-tracking.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, cacheInterceptor])
    ),
    {
      provide: ErrorHandler,
      useClass: ErrorTrackingService
    }
  ]
}).catch(err => console.error(err));

// Track unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // ErrorTrackingService will handle this through Angular's ErrorHandler
  });
}

