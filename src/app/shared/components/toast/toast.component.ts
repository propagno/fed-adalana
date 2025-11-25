import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Toast Container - Mobile-First with fixed positioning -->
    <div class="fixed top-4 inset-x-0 md:top-4 md:right-4 md:left-auto z-[9999] space-y-2 max-w-md w-full px-4 md:px-0 pointer-events-none">
      <div
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        [class]="getToastClasses(toast.type)"
        [attr.data-toast-id]="toast.id"
        (touchstart)="onTouchStart($event, toast.id)"
        (touchmove)="onTouchMove($event, toast.id)"
        (touchend)="onTouchEnd($event, toast.id)"
        [style.transform]="getTransform(toast.id)"
        class="toast-item pointer-events-auto p-4 rounded-large shadow-lg flex items-start gap-3 transition-all duration-300 cursor-pointer select-none"
        role="alert"
        aria-live="polite">
        
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <svg *ngIf="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg *ngIf="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg *ngIf="toast.type === 'info'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg *ngIf="toast.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p class="text-body-sm font-medium break-words">{{ toast.message }}</p>
        </div>
        
        <!-- Close Button -->
        <button
          (click)="removeToast(toast.id)"
          type="button"
          class="flex-shrink-0 min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-medium hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          aria-label="Fechar notificação">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-item {
      animation: slideInFromRight 0.3s ease-out;
    }

    @keyframes slideInFromRight {
      from {
        transform: translateX(calc(100% + 1rem));
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Smooth transitions for swipe */
    .toast-item {
      will-change: transform;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();
  
  // Swipe tracking
  private swipeStates = new Map<string, {
    startX: number;
    currentX: number;
    isDragging: boolean;
  }>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
    this.swipeStates.delete(id);
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  getToastClasses(type: 'success' | 'error' | 'warning' | 'info'): string {
    const baseClasses = 'border-l-4';
    const typeClasses = {
      success: 'bg-success/10 border-success text-success-dark',
      error: 'bg-error/10 border-error text-error-dark',
      info: 'bg-primary-light/10 border-primary-light text-primary',
      warning: 'bg-warning/10 border-warning text-warning-dark'
    };
    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
  }

  // Swipe gesture handlers
  onTouchStart(event: TouchEvent, toastId: string): void {
    const touch = event.touches[0];
    this.swipeStates.set(toastId, {
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true
    });
  }

  onTouchMove(event: TouchEvent, toastId: string): void {
    const state = this.swipeStates.get(toastId);
    if (!state || !state.isDragging) return;

    const touch = event.touches[0];
    state.currentX = touch.clientX;
  }

  onTouchEnd(event: TouchEvent, toastId: string): void {
    const state = this.swipeStates.get(toastId);
    if (!state || !state.isDragging) return;

    const deltaX = state.currentX - state.startX;
    const swipeThreshold = 100; // 100px swipe to dismiss

    if (Math.abs(deltaX) > swipeThreshold) {
      // Swiped far enough, dismiss toast
      this.removeToast(toastId);
    } else {
      // Reset position
      state.currentX = state.startX;
    }

    state.isDragging = false;
  }

  getTransform(toastId: string): string {
    const state = this.swipeStates.get(toastId);
    if (!state || !state.isDragging) return 'translateX(0)';

    const deltaX = state.currentX - state.startX;
    const opacity = Math.max(0, 1 - Math.abs(deltaX) / 200);
    
    return `translateX(${deltaX}px)`;
  }
}
