import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClasses()" [attr.aria-label]="ariaLabel">
      <ng-content></ng-content>
      <span *ngIf="!hasContent">{{ label }}</span>
      <button 
        *ngIf="removable" 
        (click)="onRemove($event)"
        class="ml-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1"
        [attr.aria-label]="'Remover ' + (label || 'badge')">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: BadgeSize = 'md';
  @Input() label: string = '';
  @Input() removable: boolean = false;
  @Input() hasContent: boolean = false;
  @Input() ariaLabel?: string;
  
  @Output() removed = new EventEmitter<void>();

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit();
  }

  getBadgeClasses(): string {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    const variantClasses = {
      success: 'bg-success/10 text-success border border-success/20',
      warning: 'bg-warning/10 text-warning border border-warning/20',
      error: 'bg-error/10 text-error border border-error/20',
      info: 'bg-info/10 text-info border border-info/20',
      primary: 'bg-primary/10 text-primary border border-primary/20',
      secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
      accent: 'bg-accent/10 text-accent border border-accent/20',
      neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-caption',
      md: 'px-2.5 py-1 text-body-sm',
      lg: 'px-3 py-1.5 text-body',
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
  }
}

