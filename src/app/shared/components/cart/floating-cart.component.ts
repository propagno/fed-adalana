import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartResponse, CartItem } from '../../../core/services/cart.service';
import { FormatUtil } from '../../utils/format.util';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Cart Button -->
    <button *ngIf="accountId && cart && cart.totalQuantity > 0"
            (click)="toggleDrawer()"
            [attr.aria-label]="'Carrinho com ' + cart.totalQuantity + ' itens'"
            class="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-elevation-4 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-light focus:ring-offset-2 animate-fade-in"
            [class.hidden]="showDrawer">
      <div class="relative">
        <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span *ngIf="cart.totalQuantity > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
          {{ cart.totalQuantity > 99 ? '99+' : cart.totalQuantity }}
        </span>
      </div>
    </button>

    <!-- Drawer Overlay -->
    <div *ngIf="showDrawer"
         (click)="closeDrawer()"
         class="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 animate-fade-in"
         [attr.aria-hidden]="!showDrawer"
         aria-label="Fechar carrinho">
    </div>

    <!-- Drawer Content -->
    <div *ngIf="showDrawer"
         class="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white z-50 shadow-elevation-4 transform transition-transform duration-300 animate-slide-right"
         [attr.aria-label]="'Carrinho de compras'"
         role="dialog"
         aria-modal="true">
      <div class="flex flex-col h-full">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div>
            <h2 class="text-h3 font-display text-primary">Carrinho</h2>
            <p class="text-body-sm text-gray-500 mt-1">
              {{ cart?.itemCount || 0 }} {{ (cart?.itemCount || 0) === 1 ? 'item' : 'itens' }}
            </p>
          </div>
          <button (click)="closeDrawer()"
                  [attr.aria-label]="'Fechar carrinho'"
                  class="p-2 text-gray-400 hover:text-gray-600 rounded-medium hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loadingCart" class="flex-1 flex items-center justify-center p-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent"></div>
        </div>

        <!-- Cart Items -->
        <div *ngIf="!loadingCart && cart && cart.items && cart.items.length > 0" 
             class="flex-1 overflow-y-auto p-4 md:p-6">
          <div class="space-y-4">
            <div *ngFor="let item of cart.items" 
                 class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-body text-gray-900 mb-1 truncate">
                  {{ item.productName || 'Produto' }}
                </h3>
                <p *ngIf="item.productSku" class="text-body-sm text-gray-500 mb-2">
                  SKU: {{ item.productSku }}
                </p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <button (click)="decreaseQuantity(item.productId)"
                            [disabled]="item.quantity <= 1"
                            [attr.aria-label]="'Diminuir quantidade de ' + item.productName"
                            class="w-7 h-7 bg-white border border-gray-300 rounded-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="w-8 text-center font-semibold text-body">{{ item.quantity }}</span>
                    <button (click)="increaseQuantity(item.productId)"
                            [attr.aria-label]="'Aumentar quantidade de ' + item.productName"
                            class="w-7 h-7 bg-white border border-gray-300 rounded-medium hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-body text-primary-light">{{ formatCurrency(item.subtotalCents) }}</p>
                    <p class="text-caption text-gray-500">{{ formatCurrency(item.unitPriceCents) }} cada</p>
                  </div>
                </div>
              </div>
              <button (click)="removeItem(item.productId)"
                      [attr.aria-label]="'Remover ' + item.productName + ' do carrinho'"
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-medium transition-colors flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="!loadingCart && (!cart || !cart.items || cart.items.length === 0)"
             class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-h4 text-gray-600 mb-2">Carrinho vazio</p>
          <p class="text-body-sm text-gray-500">Adicione produtos para continuar</p>
        </div>

        <!-- Cart Footer -->
        <div *ngIf="!loadingCart && cart && cart.items && cart.items.length > 0"
             class="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <div class="space-y-3 mb-4">
            <div class="flex justify-between text-body-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-semibold">{{ formatCurrency(cart.subtotalCents) }}</span>
            </div>
            <div *ngIf="cart.discountAmountCents > 0" class="flex justify-between text-body-sm text-success">
              <span>Desconto</span>
              <span class="font-semibold">-{{ formatCurrency(cart.discountAmountCents) }}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-gray-300">
              <span class="text-h4 font-bold text-gray-900">Total</span>
              <span class="text-h3 font-bold text-primary-light">{{ formatCurrency(cart.totalAmountCents) }}</span>
            </div>
          </div>
          <button (click)="goToCartReview()"
                  [attr.aria-label]="'Ir para revisão do carrinho'"
                  class="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-light focus:ring-offset-2">
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FloatingCartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() accountId?: string | null;
  
  cart: CartResponse | null = null;
  loadingCart = false;
  showDrawer = false;
  private refreshInterval?: any;
  private cartUpdatedSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.accountId) {
      this.loadCart();
      
      // Subscribe to cart updates from CartService
      this.cartUpdatedSubscription = this.cartService.cartUpdated$.pipe(
        filter(event => event.accountId === this.accountId)
      ).subscribe(event => {
        // Immediately update cart when it's modified
        this.cart = event.cart;
      });
      
      // Refresh cart every 5 seconds (fallback, only when drawer is open)
      this.refreshInterval = setInterval(() => {
        if (this.accountId && this.showDrawer) {
          this.loadCart();
        }
      }, 5000);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountId'] && this.accountId) {
      this.loadCart();
      
      // Resubscribe to cart updates if accountId changes
      if (this.cartUpdatedSubscription) {
        this.cartUpdatedSubscription.unsubscribe();
      }
      this.cartUpdatedSubscription = this.cartService.cartUpdated$.pipe(
        filter(event => event.accountId === this.accountId)
      ).subscribe(event => {
        this.cart = event.cart;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.cartUpdatedSubscription) {
      this.cartUpdatedSubscription.unsubscribe();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showDrawer) {
      this.closeDrawer();
    }
  }

  loadCart(): void {
    if (!this.accountId) return;
    
    this.loadingCart = true;
    this.cartService.getCart(this.accountId).subscribe({
      next: (cart: CartResponse) => {
        this.cart = cart;
        this.loadingCart = false;
      },
      error: (err: any) => {
        console.error('Error loading cart', err);
        this.loadingCart = false;
      }
    });
  }

  toggleDrawer(): void {
    this.showDrawer = !this.showDrawer;
    if (this.showDrawer && this.accountId && !this.cart) {
      this.loadCart();
    }
    // Prevent body scroll when drawer is open
    if (this.showDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeDrawer(): void {
    this.showDrawer = false;
    document.body.style.overflow = '';
  }

  increaseQuantity(productId: string): void {
    if (!this.accountId || !this.cart || !productId || productId === 'undefined') return;
    
    const item = this.cart.items.find((i: CartItem) => i.productId === productId);
    if (item) {
      // Cart will be updated via cartUpdated$ subscription
      this.cartService.updateItemQuantity(this.accountId, productId, item.quantity + 1).subscribe({
        error: (err: any) => {
          console.error('Error updating quantity', err);
        }
      });
    }
  }

  decreaseQuantity(productId: string): void {
    if (!this.accountId || !this.cart || !productId || productId === 'undefined') return;
    
    const item = this.cart.items.find((i: CartItem) => i.productId === productId);
    if (item && item.quantity > 1) {
      // Cart will be updated via cartUpdated$ subscription
      this.cartService.updateItemQuantity(this.accountId, productId, item.quantity - 1).subscribe({
        error: (err: any) => {
          console.error('Error updating quantity', err);
        }
      });
    }
  }

  removeItem(productId: string): void {
    if (!this.accountId || !this.cart || !productId || productId === 'undefined') return;
    
    // Cart will be updated via cartUpdated$ subscription
    this.cartService.removeItemFromCart(this.accountId, productId).subscribe({
      next: (cart: CartResponse) => {
        // Check if cart is empty after removal
        if (cart.items.length === 0) {
          this.closeDrawer();
        }
      },
      error: (err: any) => {
        console.error('Error removing item', err);
      }
    });
  }

  goToCartReview(): void {
    if (this.accountId) {
      this.closeDrawer();
      this.router.navigate(['/catalog/cart-review'], { 
        queryParams: { accountId: this.accountId } 
      });
    }
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }
}

