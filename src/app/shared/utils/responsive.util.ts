import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Utility functions for responsive design
 */
export class ResponsiveUtil {
  /**
   * Check if current viewport is mobile
   */
  static isMobile(breakpointObserver: BreakpointObserver): Observable<boolean> {
    return breakpointObserver.observe([Breakpoints.Handset])
      .pipe(map(result => result.matches));
  }

  /**
   * Check if current viewport is tablet
   */
  static isTablet(breakpointObserver: BreakpointObserver): Observable<boolean> {
    return breakpointObserver.observe([Breakpoints.Tablet])
      .pipe(map(result => result.matches));
  }

  /**
   * Check if current viewport is desktop
   */
  static isDesktop(breakpointObserver: BreakpointObserver): Observable<boolean> {
    return breakpointObserver.observe([Breakpoints.Web])
      .pipe(map(result => result.matches));
  }

  /**
   * Get current breakpoint
   */
  static getBreakpoint(breakpointObserver: BreakpointObserver): Observable<'mobile' | 'tablet' | 'desktop'> {
    return breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.Handset]) return 'mobile';
        if (result.breakpoints[Breakpoints.Tablet]) return 'tablet';
        if (result.breakpoints[Breakpoints.Web]) return 'desktop';
        return 'desktop';
      })
    );
  }
}

