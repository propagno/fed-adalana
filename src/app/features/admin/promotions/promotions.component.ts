import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion, CreatePromotionRequest } from '../../../core/services/promotion.service';
import { AccountService } from '../../../core/services/account.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DataListComponent } from '../../../shared/components/design-system/data-list/data-list.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/design-system/badge/badge.component';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    DataListComponent,
    ModalComponent,
    CardComponent,
    ButtonComponent,
    BadgeComponent
  ],
  templateUrl: './promotions.component.html',
  styles: []
})
export class PromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  products: Product[] = [];
  loading = false;
  saving = false;
  showCreateForm = false;
  accountId: string | null = null;
  promotionType: 'general' | 'product' | 'combo' = 'general';
  selectedProductIds: string[] = [];
  minPurchaseAmount: number | null = null;
  maxUses: number | null = null;
  comboPrice: number | null = null;

  promotionFormData: CreatePromotionRequest = {
    account_id: '',
    code: '',
    name: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    start_date: '',
    end_date: ''
  };

  comboFormData = {
    combo_name: '',
    combo_price_cents: 0,
    items: [] as Array<{ product_id: string; quantity: number }>
  };

  constructor(
    private promotionService: PromotionService,
    private accountService: AccountService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadAccountAndData();
  }

  loadAccountAndData(): void {
    this.accountService.getMyAccount().subscribe({
      next: (account) => {
        this.accountId = account.id;
        this.promotionFormData.account_id = account.id;
        this.loadPromotions();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error loading account', err);
      }
    });
  }

  loadPromotions(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    this.promotionService.getPromotionsByAccount(this.accountId).subscribe({
      next: (promotions) => {
        this.promotions = promotions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading promotions', err);
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    if (!this.accountId) return;
    
    this.productService.getProductsByAccount(this.accountId).subscribe({
      next: (products: Product[]) => {
        this.products = products;
      },
      error: (err: any) => {
        console.error('Error loading products', err);
      }
    });
  }

  onDiscountTypeChange(): void {
    // Reset discount value when type changes
    this.promotionFormData.discount_value = 0;
  }

  onPromotionTypeChange(): void {
    this.selectedProductIds = [];
    this.comboFormData = {
      combo_name: '',
      combo_price_cents: 0,
      items: []
    };
  }

  updateMinPurchaseAmount(): void {
    this.promotionFormData.min_purchase_amount = this.minPurchaseAmount 
      ? Math.round(this.minPurchaseAmount * 100) 
      : undefined;
  }

  updateMaxUses(): void {
    this.promotionFormData.max_uses = this.maxUses || undefined;
  }

  updateComboPrice(): void {
    this.comboFormData.combo_price_cents = this.comboPrice 
      ? Math.round(this.comboPrice * 100) 
      : 0;
  }

  addComboItem(): void {
    this.comboFormData.items.push({ product_id: '', quantity: 1 });
  }

  removeComboItem(index: number): void {
    this.comboFormData.items.splice(index, 1);
  }

  savePromotion(): void {
    if (!this.accountId) return;

    this.saving = true;

    // Prepare request
    const request: CreatePromotionRequest = {
      ...this.promotionFormData,
      account_id: this.accountId,
      code: this.promotionFormData.code.toUpperCase().trim()
    };

    // Add product IDs if product promotion
    if (this.promotionType === 'product' && this.selectedProductIds.length > 0) {
      request.product_ids = this.selectedProductIds;
    }

    // Add combo if combo promotion
    if (this.promotionType === 'combo' && this.comboFormData.items.length > 0) {
      request.combo = {
        combo_name: this.comboFormData.combo_name,
        combo_price_cents: this.comboFormData.combo_price_cents,
        items: this.comboFormData.items
      };
    }

    this.promotionService.createPromotion(request).subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();
        this.loadPromotions();
      },
      error: (err) => {
        console.error('Error creating promotion', err);
        this.saving = false;
        alert('Erro ao criar promoção: ' + (err.error?.message || 'Erro desconhecido'));
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.promotionFormData = {
      account_id: this.accountId || '',
      code: '',
      name: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      start_date: '',
      end_date: ''
    };
    this.promotionType = 'general';
    this.selectedProductIds = [];
    this.minPurchaseAmount = null;
    this.maxUses = null;
    this.comboPrice = null;
    this.comboFormData = {
      combo_name: '',
      combo_price_cents: 0,
      items: []
    };
  }

  togglePromotionStatus(promotion: Promotion): void {
    // TODO: Implement activate/deactivate endpoint
    alert('Funcionalidade de ativar/desativar será implementada em breve');
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Calcula o status real da promoção considerando:
   * - Se está ativa manualmente (active flag)
   * - Se está dentro do período de validade (start_date e end_date)
   * - Se já venceu (end_date passou)
   */
  getPromotionStatus(promotion: Promotion): { label: string; variant: BadgeVariant } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(promotion.start_date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(promotion.end_date);
    endDate.setHours(23, 59, 59, 999);

    // Se não está ativa manualmente
    if (!promotion.active) {
      return { label: 'Inativa', variant: 'error' };
    }

    // Se ainda não começou
    if (today < startDate) {
      return { label: 'Aguardando', variant: 'warning' };
    }

    // Se já venceu
    if (today > endDate) {
      return { label: 'Vencida', variant: 'error' };
    }

    // Se está dentro do período e ativa
    return { label: 'Ativa', variant: 'success' };
  }

  /**
   * Verifica se a promoção pode ser desativada (não está vencida)
   */
  canTogglePromotion(promotion: Promotion): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(promotion.end_date);
    endDate.setHours(23, 59, 59, 999);

    // Se já venceu, não pode mais ser ativada/desativada
    return today <= endDate;
  }
}

