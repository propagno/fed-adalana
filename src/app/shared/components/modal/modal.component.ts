import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../design-system/card/card.component';
import { ButtonComponent } from '../design-system/button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-modal flex items-center justify-center p-4 bg-surface-overlay backdrop-blur-sm animate-fade-in"
         (click)="onBackdropClick($event)"
         role="dialog"
         [attr.aria-modal]="true"
         [attr.aria-labelledby]="titleId"
         [attr.aria-describedby]="descriptionId">
      <app-card 
        [elevation]="4" 
        padding="lg" 
        class="max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h2 *ngIf="title" [id]="titleId" class="text-h2 font-display text-primary mb-2">
              {{ title }}
            </h2>
            <p *ngIf="description" [id]="descriptionId" class="text-body text-gray-600">
              {{ description }}
            </p>
          </div>
          <button 
            *ngIf="showCloseButton"
            (click)="close()"
            [attr.aria-label]="'Fechar modal'"
            class="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 rounded-medium p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="mb-6">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div *ngIf="showFooter" class="flex gap-3 justify-end">
          <app-button 
            *ngIf="cancelLabel"
            variant="ghost"
            size="md"
            [label]="cancelLabel"
            (clicked)="onCancel()">
          </app-button>
          <app-button 
            *ngIf="confirmLabel"
            [variant]="getButtonVariant()"
            size="md"
            [label]="confirmLabel"
            [loading]="loading"
            [disabled]="loading"
            (clicked)="onConfirm()">
          </app-button>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes scale-in {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() description?: string;
  @Input() showCloseButton: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() cancelLabel?: string;
  @Input() confirmLabel?: string;
  @Input() confirmVariant: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' = 'primary';
  @Input() loading: boolean = false;
  @Input() closeOnBackdropClick: boolean = true;
  @Input() closeOnEscape: boolean = true;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  titleId = `modal-title-${Math.random().toString(36).substring(2, 9)}`;
  descriptionId = `modal-description-${Math.random().toString(36).substring(2, 9)}`;

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen && this.closeOnEscape) {
      this.close();
    }
  }

  ngOnInit(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.closed.emit();
  }

  onBackdropClick(event: Event): void {
    if (this.closeOnBackdropClick && (event.target === event.currentTarget)) {
      this.close();
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  getButtonVariant(): 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger' {
    // Map 'warning' to 'outline' since ButtonComponent doesn't have 'warning'
    if (this.confirmVariant === 'warning') {
      return 'outline';
    }
    // Map other variants that ButtonComponent supports
    if (this.confirmVariant === 'primary' || this.confirmVariant === 'secondary' || 
        this.confirmVariant === 'accent' || this.confirmVariant === 'danger') {
      return this.confirmVariant;
    }
    return 'primary';
  }
}

