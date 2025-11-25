import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntersectionObserverService {
  private observer?: IntersectionObserver;
  private callbacks = new WeakMap<Element, (entries: IntersectionObserverEntry[]) => void>();

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback([entry]);
          }
        });
      });
    }
  }

  observe(
    element: Element,
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver | undefined {
    if (!this.observer) {
      // Fallback: load immediately if IntersectionObserver is not supported
      callback([{ isIntersecting: true } as IntersectionObserverEntry]);
      return undefined;
    }

    // Update observer options if provided
    if (options) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback([entry]);
          }
        });
      }, options);
    }

    this.callbacks.set(element, callback);
    this.observer.observe(element);
    return this.observer;
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.callbacks.delete(element);
    }
  }
}

