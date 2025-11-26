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
      class="group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md marketplace-card h-full flex flex-col">
      
      <!-- Company Banner/Image -->
      <div class="h-48 relative overflow-hidden bg-gray-100">
        <!-- Banner Image with Zoom Effect -->
        <div class="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
             [style.background]="getBannerStyle()"
             [style.background-size]="'cover'"
             [style.background-position]="'center'">
        </div>
        
        <!-- Overlay Gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        <div *ngIf="!hasBannerImage()" 
             class="absolute inset-0 flex items-center justify-center">
          <div class="text-white text-5xl font-display opacity-30">{{ company.company_name.charAt(0).toUpperCase() }}</div>
        </div>
        
        <!-- Badges -->
        <div class="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <app-badge *ngIf="company.hasSubscriptionClub" variant="accent" size="sm" label="Clube VIP" class="!bg-accent !text-white !border-accent shadow-sm"></app-badge>
          <span *ngIf="company.category" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white shadow-md backdrop-blur-sm border border-white/10">
            {{ company.category }}
          </span>        </div>
        
        <!-- Distance Badge -->
        <div *ngIf="company.distance" class="absolute bottom-3 right-3 z-10">
          <app-badge variant="secondary" size="sm" [label]="company.distance + ' km'" class="!bg-black/50 !text-white !backdrop-blur-md !border-white/20"></app-badge>
        </div>

        <!-- Status Indicator (Mockup) -->
        <div class="absolute top-3 left-3 z-10">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      </div>
      
      <!-- Company Info -->
      <div class="p-5 flex-1 flex flex-col">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-xl font-display font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">
            {{ company.company_name }}
          </h3>
        </div>

        <p *ngIf="getTagline()" class="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
          {{ getTagline() }}
        </p>
        
        <!-- Company Details -->
        <div class="mt-auto space-y-3">
          <div class="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
            <div *ngIf="company.rating" class="flex items-center font-medium text-gray-700">
              <svg class="w-4 h-4 mr-1 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {{ company.rating }}
              <span class="text-gray-400 font-normal ml-1">({{ company.deliveryTime || '30-45 min' }})</span>
            </div>
            
            <div class="text-primary font-medium text-xs uppercase tracking-wide">
              Ver Loja
            </div>
          </div>
        </div>
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

