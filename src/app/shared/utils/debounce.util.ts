import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Utility function to create a debounced observable from a subject
 * @param delay Time in milliseconds to debounce
 * @returns Observable that emits values after the delay
 */
export function createDebouncedObservable<T>(delay: number = 300): {
  subject: Subject<T>;
  observable: Observable<T>;
} {
  const subject = new Subject<T>();
  const observable = subject.pipe(
    debounceTime(delay),
    distinctUntilChanged()
  );
  return { subject, observable };
}

/**
 * Debounce function for direct use
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

