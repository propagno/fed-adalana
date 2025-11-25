import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Product, CreateSubscriptionRequest } from '../../../core/services/catalog.service';
import { OrderService, CreateSingleOrderRequest } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeliveryService, DeliveryCalculationResponse } from '../../../core/services/delivery.service';
import { CustomerAddressService, CustomerAddress } from '../../../core/services/customer-address.service';
import { ToastService } from '../../../shared/services/toast.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';

@Component({
  selector: 'app-product-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SkeletonLoaderComponent, ButtonComponent, CardComponent, InputComponent, MapPinIconComponent],
  template: `
    <div class="min-h-screen bg-background px-4 py-12">
      <div class="w-full max-w-4xl mx-auto">
        <!-- Logo Adalana -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-between mb-4">
            <app-button
              variant="ghost"
              size="md"
              label="Voltar"
              (clicked)="goBack()"
              ariaLabel="Voltar">
            </app-button>
            <div class="flex items-center justify-center gap-1 flex-1">
              <div class="relative">
                <span class="text-display font-display text-primary-light">A</span>
                <app-map-pin-icon 
                  size="md" 
                  variant="filled" 
                  color="text-primary"
                  class="absolute -top-1 left-1/2 transform -translate-x-1/2">
                </app-map-pin-icon>
              </div>
              <div class="flex items-baseline gap-0.5">
                <span class="text-display font-display text-primary">dalan</span>
                <span class="text-display font-display text-secondary">A</span>
              </div>
            </div>
            <div class="w-20"></div>
          </div>
          <p class="text-body-lg text-gray-600">Finalize seu pedido</p>
        </div>


        <!-- Loading State -->
        <app-card *ngIf="loading" [elevation]="2" padding="lg">
          <app-skeleton-loader type="card"></app-skeleton-loader>
        </app-card>

        <!-- Error Message -->
        <app-card *ngIf="error && !loading && !product" variant="highlighted" [elevation]="0" padding="md" customClass="mb-4 border-l-4 border-error">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-body-sm text-error">{{ error }}</p>
          </div>
        </app-card>

        <div *ngIf="product && !loading">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form Section -->
          <div class="lg:col-span-2">
            <app-card [elevation]="3" padding="lg" customClass="mb-6">
              <h2 class="text-h2 font-display text-primary mb-6">Dados do Pedido</h2>
              
              <form (ngSubmit)="submitOrder()" #checkoutForm="ngForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <app-input
                    label="Nome Completo"
                    inputId="customerName"
                    type="text"
                    [(ngModel)]="formData.customerName"
                    name="customerName"
                    [required]="true"
                    placeholder="Seu nome completo">
                  </app-input>

                  <app-input
                    label="Email"
                    inputId="customerEmail"
                    type="email"
                    [(ngModel)]="formData.customerEmail"
                    name="customerEmail"
                    placeholder="seu@email.com">
                  </app-input>

                  <app-input
                    label="Telefone"
                    inputId="customerPhone"
                    type="tel"
                    [(ngModel)]="formData.customerPhone"
                    name="customerPhone"
                    [required]="true"
                    placeholder="(00) 00000-0000">
                  </app-input>

                  <app-input
                    label="Quantidade"
                    inputId="quantity"
                    type="number"
                    [(ngModel)]="formData.quantity"
                    name="quantity"
                    [min]="1"
                    [required]="true"
                    (input)="updateTotal()"
                    placeholder="1">
                  </app-input>

                  <div *ngIf="orderType === 'subscription'">
                    <label class="block text-body-sm font-medium text-primary mb-2">Data de Início *</label>
                    <input type="date"
                           [(ngModel)]="formData.startDate"
                           name="startDate"
                           [min]="minDate"
                           required
                           class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
                  </div>
                </div>

                <!-- Subscription-specific fields -->
                <app-card *ngIf="orderType === 'subscription' && product" variant="highlighted" [elevation]="0" padding="md" customClass="border-l-4 border-primary-light">
                  <h3 class="text-h3 font-display text-primary mb-4">Preferências de Entrega</h3>
                  
                  <!-- Preferred Delivery Day -->
                  <div class="mb-4">
                    <label class="block text-body-sm font-medium text-primary mb-2">Melhor Dia para Entrega *</label>
                    <select [(ngModel)]="formData.preferredDeliveryDay" 
                            name="preferredDeliveryDay"
                            required
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all">
                      <option value="">Selecione...</option>
                      <ng-container *ngIf="getIntervalType() === 'weekly' || getIntervalType() === 'biweekly'">
                        <option [value]="1">Segunda-feira</option>
                        <option [value]="2">Terça-feira</option>
                        <option [value]="3">Quarta-feira</option>
                        <option [value]="4">Quinta-feira</option>
                        <option [value]="5">Sexta-feira</option>
                        <option [value]="6">Sábado</option>
                        <option [value]="7">Domingo</option>
                      </ng-container>
                      <ng-container *ngIf="getIntervalType() === 'monthly'">
                        <option *ngFor="let day of getMonthDays()" [value]="day">{{ day }}</option>
                      </ng-container>
                    </select>
                  </div>

                  <!-- Preferred Delivery Time -->
                  <div>
                    <label class="block text-body-sm font-medium text-primary mb-2">Horário Preferido *</label>
                    <div class="grid grid-cols-3 gap-3">
                      <label class="flex items-center p-3 border-2 rounded-medium cursor-pointer transition-colors"
                             [class.border-primary-light]="formData.preferredDeliveryTime === 'morning'"
                             [class.bg-primary-light-blue-50]="formData.preferredDeliveryTime === 'morning'"
                             [class.border-gray-300]="formData.preferredDeliveryTime !== 'morning'">
                        <input type="radio" 
                               [(ngModel)]="formData.preferredDeliveryTime" 
                               name="preferredDeliveryTime"
                               value="morning"
                               required
                               class="mr-2">
                        <span class="text-body-sm font-medium">Manhã</span>
                      </label>
                      <label class="flex items-center p-3 border-2 rounded-medium cursor-pointer transition-colors"
                             [class.border-primary-light]="formData.preferredDeliveryTime === 'afternoon'"
                             [class.bg-primary-light-blue-50]="formData.preferredDeliveryTime === 'afternoon'"
                             [class.border-gray-300]="formData.preferredDeliveryTime !== 'afternoon'">
                        <input type="radio" 
                               [(ngModel)]="formData.preferredDeliveryTime" 
                               name="preferredDeliveryTime"
                               value="afternoon"
                               required
                               class="mr-2">
                        <span class="text-body-sm font-medium">Tarde</span>
                      </label>
                      <label class="flex items-center p-3 border-2 rounded-medium cursor-pointer transition-colors"
                             [class.border-primary-light]="formData.preferredDeliveryTime === 'evening'"
                             [class.bg-primary-light-blue-50]="formData.preferredDeliveryTime === 'evening'"
                             [class.border-gray-300]="formData.preferredDeliveryTime !== 'evening'">
                        <input type="radio" 
                               [(ngModel)]="formData.preferredDeliveryTime" 
                               name="preferredDeliveryTime"
                               value="evening"
                               required
                               class="mr-2">
                        <span class="text-body-sm font-medium">Noite</span>
                      </label>
                    </div>
                  </div>
                </app-card>

                <!-- Single Order-specific fields -->
                <app-card *ngIf="orderType === 'single'" variant="highlighted" [elevation]="0" padding="md" customClass="border-l-4 border-success">
                  <h3 class="text-h3 font-display text-primary mb-4">Agendamento de Entrega</h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-body-sm font-medium text-primary mb-2">Data de Entrega *</label>
                      <input type="date"
                             [(ngModel)]="formData.deliveryDate"
                             name="deliveryDate"
                             [min]="minDate"
                             required
                             (change)="onDeliveryDateChange()"
                             class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
                    </div>

                    <div>
                      <label class="block text-body-sm font-medium text-primary mb-2">Horário de Entrega *</label>
                      <input type="time"
                             [(ngModel)]="formData.deliveryTime"
                             name="deliveryTime"
                             required
                             class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
                    </div>
                  </div>
                  <p class="text-body-sm text-gray-600">Selecione a data e horário desejados para entrega. Horários disponíveis serão validados no momento da confirmação.</p>
                </app-card>
                
                <!-- Saved Addresses -->
                <app-card *ngIf="savedAddresses.length > 0" variant="highlighted" [elevation]="0" padding="md" customClass="mb-4 border-l-4 border-primary-light">
                  <label class="block text-body-sm font-medium text-primary mb-3 flex items-center gap-2">
                    <app-map-pin-icon size="sm" variant="filled" color="text-primary-light"></app-map-pin-icon>
                    Endereços Salvos
                  </label>
                  <div class="space-y-2">
                    <app-card *ngFor="let address of savedAddresses"
                              variant="interactive"
                              [elevation]="0"
                              padding="md"
                              [class.border-primary-light]="selectedAddressId === address.id"
                              [class.border-gray-200]="selectedAddressId !== address.id"
                              class="border-2 cursor-pointer transition-all"
                              (click)="selectAddress(address.id)">
                      <label class="flex items-start gap-3 cursor-pointer">
                        <input type="radio" 
                               [(ngModel)]="selectedAddressId"
                               [value]="address.id"
                               name="selectedAddress"
                               (change)="selectAddress(address.id)"
                               class="mt-1">
                        <div class="flex-1">
                          <p class="text-h4 text-primary font-semibold">{{ address.label || 'Endereço' }}</p>
                          <p class="text-body-sm text-gray-600">{{ formatAddress(address) }}</p>
                        </div>
                      </label>
                    </app-card>
                  </div>
                </app-card>
                
                <!-- Address Input -->
                <div>
                  <label class="block text-body-sm font-medium text-primary mb-2 flex items-center gap-2">
                    <app-map-pin-icon size="sm" variant="filled" color="text-primary-light"></app-map-pin-icon>
                    Endereço Completo *
                  </label>
                  <textarea [(ngModel)]="formData.customerAddress" 
                            name="customerAddress" 
                            required 
                            (input)="onAddressChange()"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all" 
                            rows="3"
                            placeholder="Rua, número, complemento, bairro, cidade, estado"></textarea>
                  
                  <!-- Freight Calculation -->
                  <div *ngIf="calculatingFreight" class="mt-2 text-body-sm text-gray-600">
                    Calculando frete...
                  </div>
                  <app-card *ngIf="freightCalculation && !calculatingFreight" variant="highlighted" [elevation]="0" padding="md" customClass="mt-2 border-l-4 border-primary-light">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-body-sm font-medium text-primary">Frete</p>
                        <p class="text-caption text-gray-600" *ngIf="freightCalculation.distanceKm">
                          Distância: {{ freightCalculation.distanceKm.toFixed(1) }} km
                        </p>
                      </div>
                      <p class="text-h3 font-semibold text-primary-light">
                        {{ formatCurrency(freightCalculation.freightValue ?? 0) }}
                      </p>
                    </div>
                    <p *ngIf="!freightCalculation.available" class="text-body-sm text-error mt-2">
                      {{ freightCalculation.message }}
                    </p>
                  </app-card>
                </div>
                
                <div>
                  <label class="block text-body-sm font-medium text-primary mb-2">Observações (opcional)</label>
                  <textarea [(ngModel)]="formData.notes" 
                            name="notes" 
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all" 
                            rows="3"
                            placeholder="Instruções especiais para entrega..."></textarea>
                </div>

                <!-- Error Message in Form -->
                <app-card *ngIf="error" variant="highlighted" [elevation]="0" padding="md" customClass="border-l-4 border-error">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-body-sm text-error">{{ error }}</p>
                  </div>
                </app-card>

                <div class="pt-4 border-t border-gray-200">
                  <app-button
                    type="submit"
                    variant="accent"
                    size="lg"
                    [label]="submitting ? 'Processando...' : (orderType === 'subscription' ? 'Finalizar Assinatura' : 'Finalizar Pedido')"
                    [loading]="submitting"
                    [disabled]="submitting || !checkoutForm.valid"
                    [fullWidth]="true">
                  </app-button>
                </div>
              </form>
            </app-card>
          </div>

          <!-- Order Summary (Sticky Sidebar) -->
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-4">
              <app-card [elevation]="3" padding="lg">
                <h3 class="text-h2 font-display text-primary mb-6">Resumo do Pedido</h3>
                
                <div class="mb-4">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-16 h-16 rounded-medium overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <img *ngIf="product.image_url" 
                           [src]="getImageUrl(product.image_url)" 
                           [alt]="product.name"
                           class="w-full h-full object-cover">
                      <span *ngIf="!product.image_url" class="text-gray-400 text-h1 font-display">
                        {{ product.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <p class="text-h4 font-semibold text-primary">{{ product.name }}</p>
                      <p class="text-body-sm text-gray-600" *ngIf="product.unit_type">{{ product.unit_type }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div class="flex justify-between text-body-sm">
                    <span class="text-gray-600">Quantidade:</span>
                    <span class="font-semibold text-primary">{{ formData.quantity || 1 }}</span>
                  </div>
                  <div class="flex justify-between text-body-sm">
                    <span class="text-gray-600">Preço unitário:</span>
                    <span class="font-semibold text-primary">{{ formatCurrency(product.price_cents) }}</span>
                  </div>
                  <div class="flex justify-between text-body-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-semibold text-primary">{{ formatCurrency(getProductTotal()) }}</span>
                  </div>
                  <div class="flex justify-between text-body-sm" *ngIf="freightCalculation">
                    <span class="text-gray-600">Frete:</span>
                    <span class="font-semibold text-primary">{{ formatCurrency(getFreightValue()) }}</span>
                  </div>
                  <div class="flex justify-between text-body-sm">
                    <span class="text-gray-600">Tipo:</span>
                    <span class="font-semibold text-primary">
                      {{ orderType === 'subscription' ? 'Assinatura' : 'Entrega Avulsa' }}
                    </span>
                  </div>
                </div>

                <div class="mb-6">
                  <div class="flex justify-between items-baseline">
                    <span class="text-h3 font-semibold text-primary">Total:</span>
                    <span class="text-h1 font-bold text-primary-light">{{ formatTotal() }}</span>
                  </div>
                </div>

                <app-card variant="highlighted" [elevation]="0" padding="md" customClass="border-l-4 border-primary-light">
                  <p class="text-body-sm text-primary">
                    <strong>Pagamento:</strong> O pagamento será realizado na entrega.
                  </p>
                </app-card>
              </app-card>
            </div>
          </div>
        </div>
        </div>

      <!-- Error State -->
      <app-card *ngIf="error && !loading && !product" variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-error text-center">
        <p class="text-h3 text-error font-semibold mb-2">Erro ao carregar produto</p>
        <p class="text-body text-error mb-6">{{ error }}</p>
        <app-button
          variant="primary"
          size="md"
          label="Voltar"
          (clicked)="goBack()">
        </app-button>
      </app-card>
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
  
  // Delivery
  freightCalculation: any | null = null;
  calculatingFreight = false;
  savedAddresses: CustomerAddress[] = [];
  selectedAddressId: string | null = null;
  showAddressForm = false;
  
  formData = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    quantity: 1,
    deliveryDate: '',
    deliveryTime: '', // For single orders: specific time
    startDate: '',
    preferredDeliveryDay: undefined as number | undefined, // For subscriptions: day of week (1-7) or day of month (1-31)
    preferredDeliveryTime: '' as string | undefined, // For subscriptions: "morning", "afternoon", "evening"
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
    private authService: AuthService,
    private deliveryService: DeliveryService,
    private customerAddressService: CustomerAddressService,
    private toastService: ToastService
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
        this.loadSavedAddresses();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.error = 'Erro ao carregar produto: ' + (err.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }
  
  loadSavedAddresses(): void {
    if (!this.authService.isAuthenticated() || !this.product) return;
    
    this.customerAddressService.getAddresses(this.product.account_id).subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
        // Select first address if available
        if (addresses.length > 0 && !this.selectedAddressId) {
          this.selectAddress(addresses[0].id);
        }
      },
      error: (err) => {
        console.error('Error loading saved addresses', err);
      }
    });
  }
  
  selectAddress(addressId: string): void {
    this.selectedAddressId = addressId;
    const address = this.savedAddresses.find(a => a.id === addressId);
    if (address) {
      this.formData.customerAddress = this.formatAddress(address);
      this.calculateFreight();
    }
  }
  
  formatAddress(address: CustomerAddress): string {
    // CustomerAddress only has an 'address' field (string), not separate fields
    return address.address || '';
  }
  
  calculateFreight(): void {
    if (!this.product || !this.formData.customerAddress) return;
    
    this.calculatingFreight = true;
    this.deliveryService.calculateFreight({
      accountId: this.product.account_id,
      destinationAddress: this.formData.customerAddress
    }).subscribe({
      next: (calculation: any) => {
        this.freightCalculation = calculation;
        this.calculatingFreight = false;
        
        if (!calculation.available) {
          this.toastService.warning(calculation.message || 'Entrega não disponível para este endereço');
        }
      },
      error: (err: any) => {
        console.error('Error calculating freight', err);
        this.calculatingFreight = false;
        this.toastService.error('Erro ao calcular frete');
      }
    });
  }
  
  onAddressChange(): void {
    // Debounce freight calculation
    setTimeout(() => {
      if (this.formData.customerAddress && this.formData.customerAddress.length > 10) {
        this.calculateFreight();
      }
    }, 1000);
  }

  updateTotal(): void {
    // Trigger change detection for total calculation
  }

  formatTotal(): string {
    if (!this.product) return 'R$ 0,00';
    const quantity = this.formData.quantity || 1;
    const productTotal = this.product.price_cents * quantity;
    const freight = this.freightCalculation?.freightValue || 0;
    const totalCents = productTotal + freight;
    return FormatUtil.formatCurrency(totalCents);
  }
  
  getFreightValue(): number {
    return this.freightCalculation?.freightValue || 0;
  }
  
  getProductTotal(): number {
    if (!this.product) return 0;
    const quantity = this.formData.quantity || 1;
    return this.product.price_cents * quantity;
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
      quantity: this.formData.quantity,
      preferredDeliveryDay: this.formData.preferredDeliveryDay,
      preferredDeliveryTime: this.formData.preferredDeliveryTime
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

    // Combine date and time into datetime string
    const deliveryDateTime = this.formData.deliveryDate && this.formData.deliveryTime
      ? `${this.formData.deliveryDate}T${this.formData.deliveryTime}:00`
      : undefined;

    const request: CreateSingleOrderRequest = {
      account_id: this.product.account_id,
      product_id: this.product.id,
      customer_name: this.formData.customerName,
      customer_email: this.formData.customerEmail,
      customer_phone: this.formData.customerPhone,
      customer_address: this.formData.customerAddress,
      delivery_date: this.formData.deliveryDate,
      delivery_datetime: deliveryDateTime,
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

  getIntervalType(): string {
    if (!this.product) return '';
    return this.product.interval || '';
  }

  getMonthDays(): number[] {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  }

  onDeliveryDateChange(): void {
    // Reset time when date changes (optional)
    // this.formData.deliveryTime = '';
  }

}


