import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

// Cache storage (in-memory, can be replaced with localStorage for persistence)
const cache = new Map<string, CacheEntry>();

// Cache duration in milliseconds (default: 5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Check if request should be cached (add header 'X-Cache' to enable caching)
  const shouldCache = req.headers.get('X-Cache') === 'true';
  if (!shouldCache) {
    return next(req);
  }

  const url = req.urlWithParams;
  const cached = cache.get(url);

  // Check if cache is valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return of(cached.response.clone());
  }

  // Make request and cache response
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(url, {
          response: event.clone(),
          timestamp: Date.now()
        });
      }
    })
  );
};

