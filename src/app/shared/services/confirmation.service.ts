import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new Subject<{ options: ConfirmationOptions; resolve: (value: boolean) => void }>();
  
  confirm(options: ConfirmationOptions): Observable<boolean> {
    return new Observable(observer => {
      this.confirmationSubject.next({
        options: {
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel || 'Confirmar',
          cancelLabel: options.cancelLabel || 'Cancelar',
          confirmVariant: (options.confirmVariant || 'primary') as 'primary' | 'secondary' | 'accent' | 'danger' | 'warning'
        },
        resolve: (value: boolean) => {
          observer.next(value);
          observer.complete();
        }
      });
    });
  }

  getConfirmationRequests(): Observable<{ options: ConfirmationOptions; resolve: (value: boolean) => void }> {
    return this.confirmationSubject.asObservable();
  }
}

