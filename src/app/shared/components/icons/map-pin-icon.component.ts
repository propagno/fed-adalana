import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MapPinVariant = 'filled' | 'outline';
export type MapPinSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-map-pin-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      [class]="getIconClasses()"
      [attr.width]="getSize()"
      [attr.height]="getSize()"
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      [attr.aria-label]="ariaLabel || 'Localização'"
      [attr.aria-hidden]="!ariaLabel">
      <!-- Pin de mapa baseado no logo Adalana -->
      <path 
        *ngIf="variant === 'filled'"
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path 
        *ngIf="variant === 'filled'"
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      <circle 
        *ngIf="variant === 'filled'"
        cx="12" 
        cy="11" 
        r="3" 
        fill="currentColor" />
      
      <!-- Outline variant -->
      <path 
        *ngIf="variant === 'outline'"
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path 
        *ngIf="variant === 'outline'"
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    
    <!-- Badge numérico opcional -->
    <span 
      *ngIf="badge"
      class="absolute -top-1 -right-1 bg-secondary text-white rounded-full flex items-center justify-center text-caption font-bold min-w-[18px] h-[18px] px-1"
      [attr.aria-label]="badge + ' itens'">
      {{ badge > 9 ? '9+' : badge }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      position: relative;
    }
  `]
})
export class MapPinIconComponent {
  @Input() variant: MapPinVariant = 'filled';
  @Input() size: MapPinSize = 'md';
  @Input() color: string = 'text-primary';
  @Input() badge?: number;
  @Input() ariaLabel?: string;

  getIconClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    };

    return `${sizeClasses[this.size]} ${this.color}`;
  }

  getSize(): number {
    const sizes = {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
    };
    return sizes[this.size];
  }
}

