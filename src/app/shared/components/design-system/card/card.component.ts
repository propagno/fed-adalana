import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'highlighted' | 'interactive' | 'product' | 'primary' | 'neutral';
export type CardElevation = 0 | 1 | 2 | 3 | 4;

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()" [style.background]="customStyles['background']" [style.color]="customStyles['color']" [attr.role]="interactive ? 'button' : null" [attr.tabindex]="interactive ? 0 : null">
      <!-- Header -->
      <div *ngIf="title || headerContent" class="mb-4 pb-4 border-b border-gray-200">
        <h3 *ngIf="title" class="text-h4 text-primary">{{ title }}</h3>
        <ng-content select="[slot=header]"></ng-content>
      </div>

      <!-- Content -->
      <div class="card-content">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div *ngIf="footerContent" class="mt-4 pt-4 border-t border-gray-200">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() elevation: CardElevation = 1;
  @Input() title?: string;
  @Input() interactive: boolean = false;
  @Input() headerContent: boolean = false;
  @Input() footerContent: boolean = false;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() customStyles: { [key: string]: string } = {};
  @Input() customClass: string = '';

  getCardClasses(): string {
    // Não aplicar bg-surface ou bg-gradient-card se há um background customizado
    const hasCustomBackground = this.customStyles && (this.customStyles['background'] || this.customStyles['background-color']);
    const baseClasses = hasCustomBackground ? 'rounded-large transition-all duration-200' : 'bg-white rounded-large transition-all duration-200';
    
    // Mobile-first: active para touch, hover apenas desktop
    const variantClasses = {
      default: '',
      highlighted: hasCustomBackground ? 'border-l-4 border-primary-light' : 'border-l-4 border-primary-light bg-gray-50',
      interactive: 'cursor-pointer active:shadow-elevation-0 active:scale-[0.98] focus:ring-2 focus:ring-primary focus:ring-offset-2 lg:hover:shadow-elevation-2 lg:hover:scale-[1.01]',
      product: 'overflow-hidden active:shadow-elevation-0 lg:hover:shadow-elevation-2',
      primary: 'border-primary bg-primary/5',
      neutral: 'bg-gray-50',
    };

    const elevationClasses = {
      0: 'shadow-elevation-0',
      1: 'shadow-elevation-1',
      2: 'shadow-elevation-2',
      3: 'shadow-elevation-3',
      4: 'shadow-elevation-4',
    };

    // Mobile-first padding: menor em mobile, maior em desktop
    const paddingClasses = {
      none: '',
      sm: 'p-3 md:p-4',
      md: 'p-4 md:p-6',
      lg: 'p-6 md:p-8',
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${elevationClasses[this.elevation]} ${paddingClasses[this.padding]} ${this.customClass}`.trim();
  }
}

