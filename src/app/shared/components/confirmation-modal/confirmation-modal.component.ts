import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationService, ConfirmationOptions } from '../../services/confirmation.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="currentOptions?.title"
      [description]="currentOptions?.message"
      [confirmLabel]="currentOptions?.confirmLabel"
      [cancelLabel]="currentOptions?.cancelLabel"
      [confirmVariant]="getConfirmVariant()"
      [showCloseButton]="false"
      [closeOnBackdropClick]="false"
      [closeOnEscape]="true"
      (confirmed)="onConfirm()"
      (cancelled)="onCancel()"
      (closed)="onCancel()">
    </app-modal>
  `,
  styles: []
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  currentOptions: ConfirmationOptions | null = null;
  private currentResolve: ((value: boolean) => void) | null = null;
  private subscription: Subscription | null = null;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.subscription = this.confirmationService.getConfirmationRequests().subscribe(request => {
      this.currentOptions = request.options;
      this.currentResolve = request.resolve;
      this.isOpen = true;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    if (this.currentResolve) {
      this.currentResolve(true);
      this.currentResolve = null;
    }
    this.isOpen = false;
    this.currentOptions = null;
  }

  onCancel(): void {
    if (this.currentResolve) {
      this.currentResolve(false);
      this.currentResolve = null;
    }
    this.isOpen = false;
    this.currentOptions = null;
  }

  getConfirmVariant(): 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' {
    const variant = this.currentOptions?.confirmVariant || 'primary';
    // TypeScript type assertion to ensure compatibility
    return variant as 'primary' | 'secondary' | 'accent' | 'danger' | 'warning';
  }
}

