import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent } from '../design-system/card/card.component';
import { BadgeComponent } from '../design-system/badge/badge.component';
import { ButtonComponent } from '../design-system/button/button.component';
import { FormatUtil } from '../../utils/format.util';
import { environment } from '../../../../environments/environment';

export interface ProductCardData {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  image_url?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isPromotion?: boolean;
  discountPercentage?: number;
  freeShipping?: boolean;
  bestSeller?: boolean;
  category?: string;
  companyId?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <app-card 
      variant="interactive"
      [elevation]="1"
      padding="none"
      [interactive]="true"
      (click)="onCardClick()"
      (keydown.enter)="onCardClick()"
      (keydown.space)="onCardClick(); $event.preventDefault()"
      [attr.aria-label]="'Produto ' + product.name"
      tabindex="0"
      role="button"
      class="group cursor-pointer overflow-hidden transition-all duration-200 active:shadow-elevation-0 active:scale-[0.98] focus:ring-2 focus:ring-primary focus:ring-offset-2 lg:hover:shadow-elevation-3 lg:hover:scale-[1.01] marketplace-card">
      
      <!-- Product Image -->
      <div class="relative aspect-square bg-gray-100 overflow-hidden">
        <img *ngIf="getImageUrl(product.image_url) && !imageError" 
             [src]="getImageUrl(product.image_url)" 
             [alt]="'Imagem do produto ' + product.name"
             (error)="onImageError($event)"
             class="w-full h-full object-cover"
             loading="lazy">
        <div *ngIf="!getImageUrl(product.image_url) || imageError" class="w-full h-full flex items-center justify-center bg-gray-50">
          <div class="text-gray-400 text-4xl font-display opacity-50">{{ product.name.charAt(0).toUpperCase() }}</div>
        </div>
        
        <!-- Badges -->
        <div class="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          <app-badge *ngIf="product.isNew" variant="success" size="sm" label="Novo"></app-badge>
          <app-badge *ngIf="product.isPromotion && product.discountPercentage" variant="error" size="sm" [label]="'-' + product.discountPercentage + '%'"></app-badge>
          <app-badge *ngIf="product.bestSeller" variant="warning" size="sm" label="Mais Vendido"></app-badge>
        </div>
        
        <div class="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <app-badge *ngIf="product.freeShipping" variant="info" size="sm" label="Frete Grátis"></app-badge>
          <app-badge *ngIf="product.category" variant="secondary" size="sm" [label]="product.category"></app-badge>
        </div>
      </div>
      
      <!-- Product Info -->
      <div class="p-4 md:p-6">
        <div class="mb-3">
          <h3 class="text-h4 font-display font-semibold text-gray-900 mb-1 line-clamp-2">
            {{ product.name }}
          </h3>
          <p *ngIf="product.description" class="text-body-sm text-gray-600 line-clamp-2 mt-1">
            {{ product.description }}
          </p>
        </div>
        
        <!-- Rating -->
        <div *ngIf="product.rating" class="flex items-center gap-1 mb-3">
          <div class="flex items-center">
            <svg *ngFor="let i of [1,2,3,4,5]" 
                 class="w-4 h-4"
                 [class.text-yellow-400]="i <= getRoundedRating()"
                 [class.text-gray-300]="i > getRoundedRating()"
                 fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="text-body-sm text-gray-600 ml-1">
            {{ getFormattedRating() }}
            <span *ngIf="product.reviewCount" class="text-gray-400">({{ product.reviewCount }})</span>
          </span>
        </div>
        
        <!-- Price -->
        <div class="flex items-baseline gap-2 mb-4">
          <span class="text-2xl md:text-h2 font-bold text-primary">{{ formatCurrency(product.price_cents) }}</span>
          <span *ngIf="product.isPromotion && originalPrice" class="text-body-sm text-gray-500 line-through">
            {{ formatCurrency(originalPrice) }}
          </span>
        </div>
        
        <!-- SKU -->
        <p *ngIf="product.sku" class="text-caption text-gray-500 mb-3">SKU: {{ product.sku }}</p>
        
        <!-- Action Buttons - Always visible in mobile -->
        <div class="flex flex-col sm:flex-row gap-2">
          <app-button 
            variant="primary"
            size="sm"
            label="Adicionar"
            [fullWidth]="true"
            (clicked)="onAddToCart($event)"
            ariaLabel="Adicionar ao carrinho">
          </app-button>
          <app-button 
            variant="outline"
            size="sm"
            label="Detalhes"
            [fullWidth]="true"
            (clicked)="onViewDetails($event)"
            ariaLabel="Ver detalhes do produto">
          </app-button>
        </div>
      </div>
    </app-card>
  `,
  styles: []
})
export class ProductCardComponent implements OnChanges {
  @Input() product!: ProductCardData;
  @Input() accountId?: string;
  imageError = false;
  @Output() addToCart = new EventEmitter<ProductCardData>();
  @Output() viewDetails = new EventEmitter<string>();

  originalPrice: number | null = null;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      // Reset image error when product changes
      this.imageError = false;
      
      if (this.product) {
        if (this.product.isPromotion && this.product.discountPercentage) {
          const discount = this.product.discountPercentage / 100;
          this.originalPrice = Math.round(this.product.price_cents / (1 - discount));
        } else {
          this.originalPrice = null;
        }
      }
    }
  }

  getRoundedRating(): number {
    return this.product?.rating ? Math.round(this.product.rating) : 0;
  }

  getFormattedRating(): string {
    return this.product?.rating ? this.product.rating.toFixed(1) : '0.0';
  }

  onCardClick(): void {
    this.router.navigate(['/catalog/products', this.product.id]);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.product.id);
    this.router.navigate(['/catalog/products', this.product.id]);
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
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
    return `${apiBaseUrl}/api/files/products/${imageUrl}`;
  }

  onImageError(event: Event): void {
    this.imageError = true;
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}

