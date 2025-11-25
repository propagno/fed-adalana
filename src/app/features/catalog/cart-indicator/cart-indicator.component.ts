import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartResponse } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-cart-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button (click)="toggleDropdown()"
              [attr.aria-label]="'Carrinho de compras' + (cart && cart.totalQuantity ? ' com ' + cart.totalQuantity + ' itens' : ' vazio')"
              [attr.aria-expanded]="showDropdown"
              [attr.aria-haspopup]="'true'"
              class="relative flex items-center justify-center p-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 group">
        <svg class="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span *ngIf="cart && cart.totalQuantity > 0" 
              class="absolute -top-1 -right-1 bg-gradient-to-br from-secondary to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md ring-2 ring-white"
              aria-label="Número de itens no carrinho">
          {{ cart.totalQuantity }}
        </span>
      </button>

      <!-- Dropdown -->
      <div *ngIf="showDropdown" 
           role="menu"
           aria-label="Carrinho de compras"
           class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
        <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary-light/5">
          <h3 class="font-semibold text-primary text-body">Carrinho</h3>
          <p class="text-body-sm text-gray-500 mt-0.5">{{ cart?.itemCount || 0 }} {{ (cart?.itemCount || 0) === 1 ? 'item' : 'itens' }}</p>
        </div>

        <div *ngIf="loadingCart" class="p-4 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        </div>

        <div *ngIf="!loadingCart && cart && cart.items && cart.items.length > 0" class="divide-y divide-gray-100">
          <div *ngFor="let item of cart.items" class="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
            <div class="flex-1">
              <p class="font-medium text-body-sm text-gray-900">{{ item.productName || 'Produto' }}</p>
              <p class="text-body-xs text-gray-500 mt-0.5">Qtd: {{ item.quantity }}</p>
              <p class="text-body-sm font-semibold text-primary mt-1">{{ formatCurrency(item.subtotalCents) }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="!loadingCart && (!cart || !cart.items || cart.items.length === 0)" class="p-8 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-500 text-body-sm">Carrinho vazio</p>
        </div>

        <div *ngIf="!loadingCart && cart && cart.items && cart.items.length > 0" class="p-4 border-t border-gray-100 bg-gradient-to-r from-primary/5 to-primary-light/5">
          <div class="flex justify-between items-center mb-3">
            <span class="text-body-sm font-semibold text-gray-700">Total:</span>
            <span class="text-h4 font-bold text-primary">{{ formatCurrency(cart.totalAmountCents) }}</span>
          </div>
          <button (click)="goToCartReview()"
                  aria-label="Ir para revisão do carrinho"
                  class="w-full py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2">
            Ver Carrinho
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CartIndicatorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() accountId: string | null = null;
  
  cart: CartResponse | null = null;
  loadingCart = false;
  showDropdown = false;
  isAuthenticated = false;
  private cartSubscription?: Subscription;
  private refreshSubscription?: Subscription;
  private cartUpdatedSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Load cart for both authenticated users and guests
    if (this.accountId) {
      this.loadCart(this.accountId);
      
      // Subscribe to cart updates from CartService
      this.cartUpdatedSubscription = this.cartService.cartUpdated$.pipe(
        filter(event => event.accountId === this.accountId)
      ).subscribe(event => {
        // Immediately update cart when it's modified
        this.cart = event.cart;
      });
      
      // Poll for cart updates every 5 seconds (fallback)
      this.refreshSubscription = interval(5000).subscribe(() => {
        if (this.accountId) {
          this.loadCart(this.accountId);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountId'] && this.accountId) {
      this.loadCart(this.accountId);
      
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
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.cartUpdatedSubscription) {
      this.cartUpdatedSubscription.unsubscribe();
    }
  }

  loadCart(accountId: string): void {
    if (!accountId) return;
    
    this.loadingCart = true;
    this.cartSubscription = this.cartService.getCart(accountId).subscribe({
      next: (cart: CartResponse) => {
        this.cart = cart;
        this.loadingCart = false;
      },
      error: (err: any) => {
        // 404 is expected when cart doesn't exist yet - don't log as error
        if (err.status === 404) {
          this.cart = null;
        } else {
          console.error('Error loading cart', err);
        }
        this.loadingCart = false;
      }
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown && this.accountId && !this.cart) {
      this.loadCart(this.accountId);
    }
  }

  goToCartReview(): void {
    if (this.accountId) {
      this.router.navigate(['/catalog/cart-review'], { 
        queryParams: { accountId: this.accountId } 
      });
      this.showDropdown = false;
    }
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }
}

