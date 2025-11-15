import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-dark',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      danger: 'bg-error text-white hover:bg-red-600'
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }
}

