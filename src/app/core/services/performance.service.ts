import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private performanceObserver?: PerformanceObserver;

  constructor(private analyticsService: AnalyticsService) {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }

    try {
      // Monitor navigation timing
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackNavigationTiming(navEntry);
          } else if (entry.entryType === 'paint') {
            const paintEntry = entry as PerformancePaintTiming;
            this.trackPaintTiming(paintEntry);
          } else if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as PerformanceEntry;
            this.trackLCP(lcpEntry);
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint']
      });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  /**
   * Track navigation timing metrics
   */
  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'DNS Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP Connection': entry.connectEnd - entry.connectStart,
      'TLS Negotiation': entry.secureConnectionStart > 0 
        ? entry.connectEnd - entry.secureConnectionStart 
        : 0,
      'TTFB': entry.responseStart - entry.requestStart,
      'Download': entry.responseEnd - entry.responseStart,
      'DOM Processing': entry.domComplete - entry.domInteractive,
      'Total Load Time': entry.loadEventEnd - entry.fetchStart
    };

    Object.entries(metrics).forEach(([metric, value]) => {
      this.analyticsService.trackPerformance(metric, Math.round(value));
    });
  }

  /**
   * Track paint timing (FCP, FMP)
   */
  private trackPaintTiming(entry: PerformanceEntry): void {
    if (entry.name === 'first-contentful-paint') {
      this.analyticsService.trackPerformance('First Contentful Paint', Math.round(entry.startTime));
    }
  }

  /**
   * Track Largest Contentful Paint (LCP)
   */
  private trackLCP(entry: PerformanceEntry): void {
    this.analyticsService.trackPerformance('Largest Contentful Paint', Math.round(entry.startTime));
  }

  /**
   * Measure custom performance
   */
  measurePerformance(name: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    this.analyticsService.trackPerformance(name, Math.round(duration));
  }

  /**
   * Get current page load metrics
   */
  getPageLoadMetrics(): {
    loadTime: number;
    domContentLoaded: number;
    firstPaint?: number;
  } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const firstPaint = paint.find(entry => entry.name === 'first-contentful-paint');

    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint: firstPaint ? firstPaint.startTime : undefined
    };
  }
}

