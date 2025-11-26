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
      class="group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-md marketplace-card h-full flex flex-col bg-white">
      
      <!-- Product Image -->
      <div class="relative aspect-square bg-gray-50 overflow-hidden">
        <img *ngIf="getImageUrl(product.image_url) && !imageError" 
             [src]="getImageUrl(product.image_url)" 
             [alt]="'Imagem do produto ' + product.name"
             (error)="onImageError($event)"
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
             loading="lazy">
             
        <div *ngIf="!getImageUrl(product.image_url) || imageError" class="w-full h-full flex items-center justify-center bg-gray-50">
          <div class="text-gray-300 text-4xl font-display opacity-50">{{ product.name.charAt(0).toUpperCase() }}</div>
        </div>
        
        <!-- Badges -->
        <div class="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          <app-badge *ngIf="product.isNew" variant="success" size="sm" label="Novo" class="shadow-sm"></app-badge>
          <app-badge *ngIf="product.isPromotion && product.discountPercentage" variant="error" size="sm" [label]="'-' + product.discountPercentage + '%'" class="shadow-sm"></app-badge>
        </div>
        
        <!-- Quick Add Overlay (Desktop) -->
        <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:flex justify-center">
          <button 
            (click)="onAddToCart($event)"
            class="w-full bg-white text-primary font-bold py-2 px-4 rounded-full shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Adicionar
          </button>
        </div>
      </div>
      
      <!-- Product Info -->
      <div class="p-4 flex-1 flex flex-col">
        <div class="mb-2">
          <div class="flex justify-between items-start gap-2">
            <h3 class="text-base font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {{ product.name }}
            </h3>
            <!-- Rating Mini -->
            <div *ngIf="product.rating" class="flex items-center gap-0.5 text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
              <svg class="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {{ product.rating.toFixed(1) }}
            </div>
          </div>
          
          <p *ngIf="product.description" class="text-xs text-gray-500 line-clamp-2 mt-1">
            {{ product.description }}
          </p>
        </div>
        
        <div class="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
          <div class="flex flex-col">
            <span *ngIf="product.isPromotion && originalPrice" class="text-xs text-gray-400 line-through">
              {{ formatCurrency(originalPrice) }}
            </span>
            <span class="text-lg font-bold text-primary leading-none">
              {{ formatCurrency(product.price_cents) }}
            </span>
          </div>
          
          <!-- Mobile Add Button (Visible only on mobile) -->
          <button 
            (click)="onAddToCart($event)"
            class="lg:hidden w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </button>
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

