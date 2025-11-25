import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'accent' | 'white';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [class]="getContainerClasses()">
      <div [class]="getSpinnerClasses()" role="status" aria-label="Carregando">
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="sr-only">Carregando...</span>
      </div>
      <p *ngIf="label" class="ml-3 text-body text-gray-600">{{ label }}</p>
    </div>
  `,
  styles: []
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'md';
  @Input() variant: SpinnerVariant = 'primary';
  @Input() label?: string;
  @Input() fullScreen: boolean = false;

  getContainerClasses(): string {
    const classes: string[] = [];
    if (this.fullScreen) {
      classes.push('fixed', 'inset-0', 'bg-surface-overlay', 'z-50');
    }
    return classes.join(' ');
  }

  getSpinnerClasses(): string {
    const classes = ['animate-spin'];
    
    // Size classes
    switch (this.size) {
      case 'sm':
        classes.push('w-4', 'h-4');
        break;
      case 'lg':
        classes.push('w-12', 'h-12');
        break;
      case 'xl':
        classes.push('w-16', 'h-16');
        break;
      case 'md':
      default:
        classes.push('w-8', 'h-8');
        break;
    }

    // Variant classes
    switch (this.variant) {
      case 'primary':
        classes.push('text-primary');
        break;
      case 'secondary':
        classes.push('text-primary-light');
        break;
      case 'accent':
        classes.push('text-secondary');
        break;
      case 'white':
        classes.push('text-white');
        break;
    }

    return classes.join(' ');
  }
}

