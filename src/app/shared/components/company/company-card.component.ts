import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from '../design-system/card/card.component';
import { BadgeComponent } from '../design-system/badge/badge.component';
import { ButtonComponent } from '../design-system/button/button.component';
import { MapPinIconComponent } from '../icons/map-pin-icon.component';
import { Company } from '../../../core/services/catalog.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent, MapPinIconComponent],
  template: `
    <app-card 
      variant="interactive"
      [elevation]="1"
      padding="none"
      [interactive]="true"
      [ngStyle]="getCompanyCardStyle()"
      [ngClass]="getCompanyCardClasses()"
      (click)="onCardClick()"
      (keydown.enter)="onCardClick()"
      (keydown.space)="onCardClick(); $event.preventDefault()"
      [attr.aria-label]="'Empresa ' + company.company_name"
      tabindex="0"
      role="button"
      class="cursor-pointer overflow-hidden transition-all duration-200 active:shadow-elevation-0 active:scale-[0.98] focus:ring-2 focus:ring-primary focus:ring-offset-2 lg:hover:shadow-elevation-3 lg:hover:scale-[1.01] marketplace-card">
      
      <!-- Company Banner/Image -->
      <div class="h-40 sm:h-48 relative overflow-hidden" 
           [style.background]="getBannerStyle()"
           [style.background-size]="'cover'"
           [style.background-position]="'center'">
        <div *ngIf="!hasBannerImage()" 
             class="absolute inset-0 flex items-center justify-center">
          <div class="text-white text-4xl md:text-display font-display opacity-30">{{ company.company_name.charAt(0).toUpperCase() }}</div>
        </div>
        
        <!-- Badges -->
        <div class="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-10">
          <app-badge *ngIf="company.category" variant="neutral" size="sm" [label]="company.category" class="!bg-white !text-primary !border-white/50"></app-badge>
          <app-badge *ngIf="company.hasSubscriptionClub" variant="accent" size="sm" label="Clube VIP" class="!bg-accent !text-white !border-accent"></app-badge>
        </div>
        
        <div *ngIf="company.distance" class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10">
          <app-badge variant="secondary" size="sm" [label]="company.distance + ' km'"></app-badge>
        </div>
      </div>
      
      <!-- Company Info -->
      <div class="p-4 md:p-6">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg md:text-h4 font-display font-semibold mb-1 text-gray-900">
              {{ company.company_name }}
            </h3>
            <p *ngIf="getTagline()" 
               class="text-body-sm text-gray-600 mt-1 line-clamp-1">
              {{ getTagline() }}
            </p>
          </div>
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0 ml-2"
               fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span class="sr-only">Ver detalhes</span>
        </div>
        
        <!-- Company Details -->
        <div class="space-y-2 mb-4">
          <div *ngIf="company.phone" class="flex items-center text-body-sm text-gray-600">
            <svg class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{{ company.phone }}</span>
          </div>
          <div *ngIf="company.address" class="flex items-start text-body-sm text-gray-600">
            <app-map-pin-icon size="sm" variant="filled" color="text-primary" class="mr-2 mt-0.5 flex-shrink-0"></app-map-pin-icon>
            <span class="line-clamp-2">{{ company.address }}</span>
          </div>
          <div *ngIf="company.rating" class="flex items-center text-body-sm text-gray-600">
            <svg class="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="font-medium">{{ company.rating }}</span>
            <span *ngIf="company.deliveryTime" class="text-gray-400 ml-1">({{ company.deliveryTime }})</span>
          </div>
        </div>
        
        <!-- Action Button -->
        <app-button 
          variant="primary" 
          size="md"
          label="Ver Produtos"
          [fullWidth]="true"
          [ngStyle]="{'--button-bg': getCompanyPrimaryColor()}"
          (clicked)="onViewProducts($event)">
        </app-button>
      </div>
    </app-card>
  `,
  styles: []
})
export class CompanyCardComponent {
  @Input() company!: Company;
  @Output() viewProducts = new EventEmitter<string>();

  constructor(private router: Router) {}

  onCardClick(): void {
    this.router.navigate(['/catalog/companies', this.company.id]);
  }

  onViewProducts(event: Event): void {
    event.stopPropagation();
    this.viewProducts.emit(this.company.id);
    this.router.navigate(['/catalog/companies', this.company.id]);
  }

  getBannerStyle(): string {
    const appearance = this.company.appearance;
    if (appearance?.bannerImageUrl) {
      return `url(${this.getImageUrl(appearance.bannerImageUrl)})`;
    }
    if (appearance?.primaryColor && appearance?.secondaryColor) {
      return `linear-gradient(135deg, ${appearance.primaryColor} 0%, ${appearance.secondaryColor} 100%)`;
    }
    return 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)';
  }

  hasBannerImage(): boolean {
    return !!(this.company.appearance?.bannerImageUrl || this.company.image_url);
  }

  getCompanyCardStyle(): any {
    const appearance = this.company.appearance;
    if (!appearance) return {};
    
    return {
      '--company-primary': appearance.primaryColor || '#3B82F6',
      '--company-secondary': appearance.secondaryColor || '#60A5FA',
      '--company-accent': appearance.accentColor || '#F472B6'
    };
  }

  getCompanyCardClasses(): string {
    const appearance = this.company.appearance;
    if (!appearance) return '';
    return appearance.theme === 'dark' ? 'dark-theme' : '';
  }

  getCompanyPrimaryColor(): string {
    return this.company.appearance?.primaryColor || '#1E40AF';
  }

  getCompanyAccentColor(): string {
    return this.company.appearance?.accentColor || '#60A5FA';
  }

  getTagline(): string | null {
    return this.company.appearance?.tagline || null;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/api/files/')) {
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}${imageUrl}`;
    }
    const parts = imageUrl.split('/');
    if (parts.length >= 2) {
      const type = parts[0];
      const filename = parts[parts.length - 1];
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}/api/files/${type}/${filename}`;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}/api/files/accounts/${imageUrl}`;
  }
}

