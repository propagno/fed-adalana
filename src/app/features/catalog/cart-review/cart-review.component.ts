import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService, CartResponse, CartItem } from '../../../core/services/cart.service';
import { CatalogService, Company } from '../../../core/services/catalog.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { ProgressIndicatorComponent, ProgressStep } from '../../../shared/components/progress/progress-indicator.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';

@Component({
  selector: 'app-cart-review',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, SkeletonLoaderComponent, MarketplaceNavbarComponent, ProgressIndicatorComponent, CardComponent, ButtonComponent, MapPinIconComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <!-- Progress Indicator - Compact on mobile -->
        <div class="mb-4 md:mb-6 lg:mb-8">
          <app-progress-indicator 
            [steps]="progressSteps"
            [currentStep]="'review'">
          </app-progress-indicator>
        </div>
        
        <!-- Header - Mobile optimized -->
        <div class="mb-6 md:mb-8">
          <div class="flex items-center justify-between mb-4">
            <app-button
              variant="ghost"
              size="md"
              label="Voltar"
              (clicked)="goBack()"
              ariaLabel="Voltar">
            </app-button>
            <div class="flex-1"></div>
          </div>
          <div class="text-center">
            <h1 class="text-xl md:text-h1 lg:text-display font-display font-semibold text-gray-900 mb-2">Revisar Carrinho</h1>
            <p class="text-body-sm md:text-body-lg text-gray-600">Revise seus itens antes de continuar</p>
          </div>
        </div>


        <div *ngIf="loading" class="space-y-6">
          <app-skeleton-loader type="card"></app-skeleton-loader>
        </div>

        <app-card *ngIf="error" variant="highlighted" [elevation]="0" padding="md" customClass="mb-6 border-l-4 border-error bg-error/10">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-body-sm text-error font-medium">{{ error }}</p>
          </div>
        </app-card>

        <div *ngIf="!loading && cart" class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4 md:space-y-6">
            <!-- Company Information Card -->
            <app-card *ngIf="company" [elevation]="1" padding="md" customClass="bg-white">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div *ngIf="company.image_url" class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img [src]="company.image_url" [alt]="company.company_name" class="w-full h-full object-cover">
                </div>
                <div *ngIf="!company.image_url" class="w-16 h-16 sm:w-20 sm:h-20 bg-primary-light/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl sm:text-3xl font-bold text-primary-light">{{ (company.company_name && company.company_name.charAt(0)) || 'E' }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg md:text-h3 font-semibold text-gray-900 mb-1">{{ company.company_name }}</h3>
                  <p *ngIf="company.category" class="text-body-sm text-gray-600 mb-1">{{ company.category }}</p>
                  <div *ngIf="company.phone" class="flex items-center gap-2 text-body-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{{ company.phone }}</span>
                  </div>
                  <div *ngIf="company.address" class="flex items-start gap-2 text-body-sm text-gray-600 mt-1">
                    <app-map-pin-icon size="sm" variant="outline" color="text-gray-500"></app-map-pin-icon>
                    <span class="flex-1">{{ company.address }}</span>
                  </div>
                </div>
              </div>
            </app-card>

            <!-- Cart Items Card -->
            <app-card [elevation]="1" padding="md" customClass="mb-4 md:mb-6 bg-white">
              <h2 class="text-lg md:text-h2 font-display font-semibold text-gray-900 mb-4 md:mb-6">Itens do Carrinho</h2>
              
              <app-empty-state *ngIf="cart.items && cart.items.length === 0"
                               title="Carrinho Vazio"
                               message="Seu carrinho está vazio. Adicione produtos para continuar."
                               [actionLabel]="'Explorar Produtos'"
                               [actionHandler]="goBack.bind(this)">
              </app-empty-state>

                  <div *ngIf="cart.items && cart.items.length > 0" class="space-y-3 md:space-y-4">
                <div *ngFor="let item of cart.items" class="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 md:p-4 bg-white rounded-lg border border-gray-200">
                  <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div class="flex-1 w-full sm:w-auto">
                    <h3 class="text-base md:text-h4 font-semibold text-gray-900 mb-1">{{ item.productName || 'Produto' }}</h3>
                    <p class="text-body-sm text-gray-500 mb-2" *ngIf="item.productSku">SKU: {{ item.productSku }}</p>
                    <p class="text-h4 font-bold text-primary-light">{{ formatCurrency(item.unitPriceCents) }}</p>
                  </div>
                  
                  <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                    <div class="flex items-center gap-2">
                      <button (click)="decreaseQuantity(item.productId)" 
                              [disabled]="item.quantity <= 1"
                              class="min-w-[44px] min-h-[44px] bg-white border border-gray-300 rounded-medium active:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:bg-gray-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-12 text-center font-semibold text-body">{{ item.quantity }}</span>
                      <button (click)="increaseQuantity(item.productId)" 
                              class="min-w-[44px] min-h-[44px] bg-white border border-gray-300 rounded-medium active:bg-gray-100 active:scale-95 flex items-center justify-center transition-all focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:bg-gray-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    
                    <div class="text-left sm:text-right min-w-[100px]">
                      <p class="text-lg md:text-h4 font-bold text-primary">{{ formatCurrency(item.subtotalCents) }}</p>
                    </div>
                    
                    <button (click)="removeItem(item.productId)" 
                            [attr.aria-label]="'Remover ' + item.productName"
                            class="min-w-[44px] min-h-[44px] p-2 text-red-600 active:text-red-800 active:bg-red-50 active:scale-95 rounded-medium transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-1 lg:hover:text-red-800 lg:hover:bg-red-50">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Summary - Sticky on mobile -->
          <div class="lg:col-span-1">
            <app-card [elevation]="1" padding="md" customClass="sticky top-20 md:top-24 bg-white">
              <h2 class="text-lg md:text-h2 font-display font-semibold text-gray-900 mb-4 md:mb-6">Resumo</h2>
              
              <div class="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div class="flex justify-between text-body-sm md:text-body">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-semibold text-gray-900">{{ formatCurrency(cart.subtotalCents) }}</span>
                </div>
                <div *ngIf="cart.discountAmountCents > 0" class="flex justify-between text-body-sm md:text-body text-success">
                  <span>Desconto</span>
                  <span class="font-semibold">-{{ formatCurrency(cart.discountAmountCents) }}</span>
                </div>
                <div class="border-t border-gray-300 pt-3 md:pt-4 flex justify-between">
                  <span class="text-lg md:text-h3 font-bold text-gray-900">Total</span>
                  <span class="text-xl md:text-h2 font-bold text-primary">{{ formatCurrency(cart.totalAmountCents) }}</span>
                </div>
              </div>
              
              <app-button 
                variant="primary"
                size="lg"
                label="Continuar para Agendamento"
                [fullWidth]="true"
                [disabled]="!cart || cart.items.length === 0"
                (clicked)="goToScheduling()"
                ariaLabel="Continuar para agendamento">
              </app-button>
              
              <app-button 
                variant="ghost"
                size="md"
                label="Voltar"
                (clicked)="goBack()"
                ariaLabel="Voltar"
                class="mt-3 w-full">
              </app-button>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CartReviewComponent implements OnInit {
  accountId: string | null = null;
  cart: CartResponse | null = null;
  loading = true;
  error: string | null = null;
  
  progressSteps: ProgressStep[] = [
    { id: 'review', label: 'Revisar', completed: true },
    { id: 'scheduling', label: 'Agendar', completed: false },
    { id: 'checkout', label: 'Finalizar', completed: false }
  ];

  company: Company | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.accountId = params['accountId'];
      if (this.accountId) {
        this.loadCart();
        this.loadCompany();
      } else {
        this.error = 'Account ID não fornecido';
        this.loading = false;
      }
    });
  }

  loadCompany(): void {
    if (!this.accountId) return;
    
    this.catalogService.getCompanyById(this.accountId).subscribe({
      next: (company) => {
        this.company = company;
      },
      error: (err: any) => {
        console.error('Error loading company', err);
      }
    });
  }


  loadCart(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    this.error = null;
    
    this.cartService.getCart(this.accountId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao carregar carrinho';
        this.loading = false;
      }
    });
  }

  increaseQuantity(productId: string): void {
    if (!this.accountId || !this.cart || !productId || productId === 'undefined') return;
    
    const item = this.cart.items.find((i: CartItem) => i.productId === productId);
    if (item) {
      this.cartService.updateItemQuantity(this.accountId, productId, item.quantity + 1).subscribe({
        next: (cart: CartResponse) => {
          this.cart = cart;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Erro ao atualizar quantidade';
        }
      });
    }
  }

  decreaseQuantity(productId: string): void {
    if (!this.accountId || !this.cart || !productId || productId === 'undefined') return;
    
    const item = this.cart.items.find((i: CartItem) => i.productId === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateItemQuantity(this.accountId, productId, item.quantity - 1).subscribe({
        next: (cart: CartResponse) => {
          this.cart = cart;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Erro ao atualizar quantidade';
        }
      });
    }
  }

  removeItem(productId: string): void {
    if (!this.accountId || !this.cart || !productId || productId === 'undefined') return;
    
    this.cartService.removeItemFromCart(this.accountId, productId).subscribe({
      next: (cart) => {
        this.cart = cart;
        if (cart.items.length === 0) {
          // Redirect to catalog if cart is empty
          setTimeout(() => this.goBack(), 2000);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao remover item';
      }
    });
  }

  goToScheduling(): void {
    if (!this.accountId) return;
    
    this.router.navigate(['/catalog/cart-scheduling'], { 
      queryParams: { accountId: this.accountId } 
    });
  }

  goBack(): void {
    if (this.accountId) {
      this.router.navigate(['/catalog/companies', this.accountId]);
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }
}

