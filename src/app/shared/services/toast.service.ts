import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new Subject<Toast[]>();
  private toasts: Toast[] = [];
  private defaultDuration = 3000; // 3 seconds

  constructor() {}

  getToasts(): Observable<Toast[]> {
    return this.toastsSubject.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number): string {
    const id = this.generateId();
    const toast: Toast = {
      id,
      message,
      type,
      duration: duration !== undefined ? duration : this.defaultDuration
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration);
    }

    return id;
  }

  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration || 5000); // Errors stay longer
  }

  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  // Aliases for convenience
  showSuccess(message: string, duration?: number): string {
    return this.success(message, duration);
  }

  showError(message: string, duration?: number): string {
    return this.error(message, duration);
  }

  showWarning(message: string, duration?: number): string {
    return this.warning(message, duration);
  }

  showInfo(message: string, duration?: number): string {
    return this.info(message, duration);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

