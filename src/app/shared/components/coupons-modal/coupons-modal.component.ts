import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionService, Promotion } from '../../../core/services/promotion.service';
import { FormatUtil } from '../../utils/format.util';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../design-system/button/button.component';
import { CardComponent } from '../design-system/card/card.component';
import { BadgeComponent } from '../design-system/badge/badge.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../skeleton/skeleton-loader.component';

@Component({
  selector: 'app-coupons-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    EmptyStateComponent,
    SkeletonLoaderComponent
  ],
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
         [class.opacity-0]="!isOpen"
         (click)="close()">
    </div>

    <!-- Modal - Bottom Sheet on Mobile, Centered on Desktop -->
    <div *ngIf="isOpen"
         class="fixed z-50 transition-all duration-300 ease-out"
         [ngClass]="{
           'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]': true,
           'md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2': true,
           'md:bottom-auto md:rounded-2xl md:max-w-2xl md:w-full md:max-h-[80vh]': true
         }"
         (click)="$event.stopPropagation()">
      
      <app-card variant="default" [elevation]="3" padding="none" customClass="bg-white h-full flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎟️</span>
            <h2 class="text-h2 font-display font-bold text-primary">Cupons Disponíveis</h2>
          </div>
          <button 
            (click)="close()"
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          <app-skeleton-loader *ngFor="let i of [1,2,3]" type="card"></app-skeleton-loader>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && coupons.length === 0" class="p-4 md:p-6 flex-1 flex items-center justify-center">
          <app-empty-state
            title="Nenhum cupom disponível"
            message="No momento não há cupons ativos. Fique de olho nas promoções!">
          </app-empty-state>
        </div>

        <!-- Coupons List -->
        <div *ngIf="!loading && coupons.length > 0" 
             class="p-4 md:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div *ngFor="let coupon of coupons" 
               class="border-2 rounded-large p-4 transition-all hover:border-accent hover:shadow-md"
               [ngClass]="{
                 'border-gray-200 bg-white': !isExpiringSoon(coupon),
                 'border-warning/30 bg-warning/5': isExpiringSoon(coupon)
               }">
            
            <!-- Coupon Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-h4 font-display font-bold text-primary mb-1">{{ coupon.name }}</h3>
                <p *ngIf="coupon.description" class="text-body-sm text-gray-600 line-clamp-2">
                  {{ coupon.description }}
                </p>
              </div>
              <app-badge 
                *ngIf="isExpiringSoon(coupon)"
                variant="warning"
                size="sm"
                label="Expira em breve">
              </app-badge>
            </div>

            <!-- Coupon Code -->
            <div class="flex items-center gap-3 p-3 bg-accent/5 border-2 border-dashed border-accent/30 rounded-medium mb-3">
              <div class="flex-1">
                <p class="text-xs text-gray-500 mb-1">Código do Cupom</p>
                <p class="text-h3 font-mono font-bold text-accent tracking-wider">
                  {{ coupon.code }}
                </p>
              </div>
              <button 
                (click)="copyCouponCode(coupon.code)"
                class="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-medium transition-colors flex items-center gap-2 min-h-[44px]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span class="text-body-sm font-semibold">Copiar</span>
              </button>
            </div>

            <!-- Coupon Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-2xl">💰</span>
                <span class="text-body font-semibold text-primary">
                  {{ formatDiscount(coupon) }}
                </span>
              </div>
              <div *ngIf="coupon.min_purchase_amount && coupon.min_purchase_amount > 0" 
                   class="flex items-center gap-2">
                <span class="text-xl">🛒</span>
                <span class="text-body-sm text-gray-600">
                  Valor mínimo: {{ formatCurrency(coupon.min_purchase_amount * 100) }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xl">📅</span>
                <span class="text-body-sm text-gray-600">
                  Válido até {{ formatDate(coupon.end_date) }}
                </span>
              </div>
              <div *ngIf="coupon.max_uses && coupon.max_uses > 0" 
                   class="flex items-center gap-2">
                <span class="text-xl">🎫</span>
                <span class="text-body-sm text-gray-600">
                  Usos: {{ coupon.current_uses }}/{{ coupon.max_uses }}
                </span>
              </div>
            </div>

            <!-- Apply Button -->
            <app-button 
              variant="primary"
              size="md"
              label="Aplicar Cupom"
              [fullWidth]="true"
              (clicked)="applyCoupon(coupon.code)">
            </app-button>
          </div>
        </div>

        <!-- Footer with Info -->
        <div class="p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div class="flex items-start gap-2">
            <span class="text-xl flex-shrink-0">ℹ️</span>
            <p class="text-body-sm text-gray-600">
              <strong class="text-primary">Dica:</strong> Cupons são aplicados automaticamente ao valor do carrinho. 
              Apenas um cupom pode ser usado por pedido.
            </p>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #2563eb;
    }

    /* Line clamp for description */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CouponsModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() accountId: string = '';
  @Output() closed = new EventEmitter<void>();
  @Output() couponApplied = new EventEmitter<string>();

  coupons: Promotion[] = [];
  loading = false;

  constructor(
    private promotionService: PromotionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.isOpen && this.accountId) {
      this.loadCoupons();
    }
  }

  ngOnChanges(): void {
    if (this.isOpen && this.accountId && this.coupons.length === 0) {
      this.loadCoupons();
    }
  }

  loadCoupons(): void {
    this.loading = true;
    this.promotionService.getActivePromotionsByAccount(this.accountId).subscribe({
      next: (promotions) => {
        // Filter only active promotions that haven't reached max uses
        this.coupons = promotions.filter(p => 
          p.active && 
          (!p.max_uses || p.current_uses < p.max_uses) &&
          new Date(p.end_date) > new Date()
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading coupons', err);
        this.toastService.error('Erro ao carregar cupons');
        this.loading = false;
      }
    });
  }

  copyCouponCode(code: string): void {
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success(`Código ${code} copiado!`);
    }).catch(() => {
      this.toastService.error('Erro ao copiar código');
    });
  }

  applyCoupon(code: string): void {
    this.couponApplied.emit(code);
    this.close();
    this.toastService.success(`Cupom ${code} aplicado!`);
  }

  close(): void {
    this.closed.emit();
  }

  formatDiscount(coupon: Promotion): string {
    if (coupon.discount_type === 'PERCENTAGE') {
      return `${coupon.discount_value}% de desconto`;
    } else {
      return `${FormatUtil.formatCurrency(coupon.discount_value * 100)} de desconto`;
    }
  }

  formatCurrency(cents: number): string {
    return FormatUtil.formatCurrency(cents);
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  isExpiringSoon(coupon: Promotion): boolean {
    const endDate = new Date(coupon.end_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  }
}

