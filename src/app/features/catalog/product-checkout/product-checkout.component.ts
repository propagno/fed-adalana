import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Product, CreateSubscriptionRequest } from '../../../core/services/catalog.service';
import { OrderService, CreateSingleOrderRequest } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <!-- Header -->
      <header class="bg-white shadow-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <button (click)="goBack()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Voltar</span>
            </button>
            <h1 class="text-xl font-bold text-gray-900">Finalizar Pedido</h1>
            <div class="w-20"></div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="product">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form Section -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Dados do Pedido</h2>
              
              <form (ngSubmit)="submitOrder()" #checkoutForm="ngForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input [(ngModel)]="formData.customerName" 
                           name="customerName" 
                           required 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" 
                           [(ngModel)]="formData.customerEmail" 
                           name="customerEmail" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <input [(ngModel)]="formData.customerPhone" 
                           name="customerPhone" 
                           required 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="(00) 00000-0000">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                    <input type="number" 
                           [(ngModel)]="formData.quantity" 
                           name="quantity" 
                           min="1" 
                           required 
                           (input)="updateTotal()"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div *ngIf="orderType === 'single'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Data de Entrega *</label>
                    <input type="date" 
                           [(ngModel)]="formData.deliveryDate" 
                           name="deliveryDate" 
                           [min]="minDate"
                           required 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div *ngIf="orderType === 'subscription'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
                    <input type="date" 
                           [(ngModel)]="formData.startDate" 
                           name="startDate" 
                           [min]="minDate"
                           required 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Endereço Completo *</label>
                  <textarea [(ngModel)]="formData.customerAddress" 
                            name="customerAddress" 
                            required 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Rua, número, complemento, bairro, cidade, estado"></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Observações (opcional)</label>
                  <textarea [(ngModel)]="formData.notes" 
                            name="notes" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            rows="3"
                            placeholder="Instruções especiais para entrega..."></textarea>
                </div>

                <div class="pt-4 border-t border-gray-200">
                  <button type="submit" 
                          [disabled]="submitting || !checkoutForm.valid" 
                          class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ submitting ? 'Processando...' : (orderType === 'subscription' ? 'Finalizar Assinatura' : 'Finalizar Pedido') }}
                  </button>
                </div>
                
                <div *ngIf="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {{ error }}
                </div>
              </form>
            </div>
          </div>

          <!-- Order Summary (Sticky Sidebar) -->
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-24">
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h3>
                
                <div class="mb-4">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <img *ngIf="product.image_url" 
                           [src]="getImageUrl(product.image_url)" 
                           [alt]="product.name"
                           class="w-full h-full object-cover">
                      <span *ngIf="!product.image_url" class="text-gray-400 text-2xl font-bold">
                        {{ product.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-gray-900">{{ product.name }}</p>
                      <p class="text-sm text-gray-600" *ngIf="product.unit_type">{{ product.unit_type }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Quantidade:</span>
                    <span class="font-semibold text-gray-900">{{ formData.quantity || 1 }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Preço unitário:</span>
                    <span class="font-semibold text-gray-900">{{ formatCurrency(product.price_cents) }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tipo:</span>
                    <span class="font-semibold text-gray-900">
                      {{ orderType === 'subscription' ? 'Assinatura' : 'Entrega Avulsa' }}
                    </span>
                  </div>
                </div>

                <div class="mb-6">
                  <div class="flex justify-between items-baseline">
                    <span class="text-lg font-semibold text-gray-900">Total:</span>
                    <span class="text-2xl font-bold text-blue-600">{{ formatTotal() }}</span>
                  </div>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-800">
                    <strong>Pagamento:</strong> O pagamento será realizado na entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p class="text-gray-600 text-lg">Carregando...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading && !product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-800 font-semibold mb-2">Erro ao carregar produto</p>
          <p class="text-red-600 text-sm mb-4">{{ error }}</p>
          <button (click)="goBack()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Voltar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductCheckoutComponent implements OnInit {
  product: Product | null = null;
  orderType: 'subscription' | 'single' = 'subscription';
  loading = false;
  submitting = false;
  error: string | null = null;
  
  formData = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    quantity: 1,
    deliveryDate: '',
    startDate: '',
    notes: ''
  };

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    const type = this.route.snapshot.queryParamMap.get('type');
    
    if (type === 'single' || type === 'subscription') {
      this.orderType = type;
    }
    
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.error = 'ID do produto não fornecido';
    }

    // Set default dates
    const today = new Date();
    this.formData.deliveryDate = today.toISOString().split('T')[0];
    this.formData.startDate = today.toISOString().split('T')[0];
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;
    this.catalogService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.error = 'Erro ao carregar produto: ' + (err.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }

  updateTotal(): void {
    // Trigger change detection for total calculation
  }

  formatTotal(): string {
    if (!this.product) return 'R$ 0,00';
    const quantity = this.formData.quantity || 1;
    const totalCents = this.product.price_cents * quantity;
    return FormatUtil.formatCurrency(totalCents);
  }

  submitOrder(): void {
    if (!this.product) {
      this.error = 'Produto não carregado';
      return;
    }

    this.submitting = true;
    this.error = null;

    if (this.orderType === 'subscription') {
      this.createSubscription();
    } else {
      this.createSingleOrder();
    }
  }

  createSubscription(): void {
    if (!this.product) return;

    const request: CreateSubscriptionRequest = {
      accountId: this.product.account_id,
      productId: this.product.id,
      customerName: this.formData.customerName,
      customerEmail: this.formData.customerEmail,
      customerPhone: this.formData.customerPhone,
      customerAddress: this.formData.customerAddress,
      startDate: this.formData.startDate,
      quantity: this.formData.quantity
    };

    this.catalogService.createSubscription(request).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/catalog'], { 
          queryParams: { success: 'subscription' } 
        });
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating subscription', err);
        this.error = 'Erro ao criar assinatura: ' + (err.error?.message || 'Erro desconhecido');
      }
    });
  }

  createSingleOrder(): void {
    if (!this.product) return;

    const request: CreateSingleOrderRequest = {
      account_id: this.product.account_id,
      product_id: this.product.id,
      customer_name: this.formData.customerName,
      customer_email: this.formData.customerEmail,
      customer_phone: this.formData.customerPhone,
      customer_address: this.formData.customerAddress,
      delivery_date: this.formData.deliveryDate,
      quantity: this.formData.quantity,
      notes: this.formData.notes
    };

    this.orderService.createSingleOrder(request).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/catalog'], { 
          queryParams: { success: 'order' } 
        });
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating order', err);
        this.error = 'Erro ao criar pedido: ' + (err.error?.message || 'Erro desconhecido');
      }
    });
  }

  goBack(): void {
    if (this.product) {
      this.router.navigate(['/catalog/products', this.product.id]);
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  formatCurrency(cents: number): string {
    return FormatUtil.formatCurrency(cents);
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}${imageUrl}`;
  }
}

