import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="onClick($event)"
      [attr.aria-label]="ariaLabel || label"
      [attr.aria-busy]="loading">
      <span *ngIf="loading" class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span *ngIf="loadingText">{{ loadingText }}</span>
      </span>
      <span *ngIf="!loading">
        <ng-content></ng-content>
        <span *ngIf="!hasContent">{{ label }}</span>
      </span>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() label: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() loadingText: string = '';
  @Input() fullWidth: boolean = false;
  @Input() ariaLabel?: string;
  @Input() hasContent: boolean = false;
  
  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  getButtonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]';
    
    // Mobile-first: active e focus para touch, hover apenas desktop
    const variantClasses = {
      primary: 'bg-primary text-white active:scale-95 active:bg-[#0E1117] focus:ring-primary lg:hover:shadow-elevation-3 lg:hover:scale-[1.02]',
      secondary: 'bg-secondary text-white active:scale-95 active:bg-[#E6392E] focus:ring-secondary lg:hover:shadow-elevation-3 lg:hover:scale-[1.02]',
      accent: 'bg-accent text-white active:scale-95 active:bg-[#E6B201] focus:ring-accent lg:hover:shadow-elevation-3 lg:hover:scale-[1.02]',
      danger: 'bg-error text-white active:scale-95 active:bg-[#E6392E] focus:ring-error lg:hover:shadow-elevation-3',
      ghost: 'bg-white/10 backdrop-blur-sm text-primary active:bg-white/20 focus:ring-primary lg:hover:bg-white/20',
      outline: 'bg-transparent border-2 border-primary text-primary active:bg-primary active:text-white active:scale-95 focus:ring-primary lg:hover:bg-primary lg:hover:text-white',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-body-sm min-h-[36px]',
      md: 'px-4 py-2 text-body min-h-[44px]',
      lg: 'px-6 py-3 text-body-lg min-h-[52px]',
    };

    const widthClass = this.fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${widthClass}`;
  }
}

