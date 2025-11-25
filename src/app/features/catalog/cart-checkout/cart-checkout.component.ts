import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CartService, CartResponse, CheckoutRequest } from '../../../core/services/cart.service';
import { CatalogService, Company } from '../../../core/services/catalog.service';
import { OrderPdfService } from '../../../core/services/order-pdf.service';
import { OrderResponse } from '../../../core/services/order.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerAddressService, CustomerAddress } from '../../../core/services/customer-address.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { CartAbandonmentTrackingService } from '../../../core/services/cart-abandonment-tracking.service';
import { DeliveryService, DeliveryFeeResponse } from '../../../core/services/delivery.service';
import { CustomerClubSubscriptionService, CustomerClubSubscription } from '../../../core/services/customer-club-subscription.service';
import { PromotionService, ValidatePromotionResponse } from '../../../core/services/promotion.service';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { ProgressIndicatorComponent, ProgressStep } from '../../../shared/components/progress/progress-indicator.component';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { CouponsModalComponent } from '../../../shared/components/coupons-modal/coupons-modal.component';
import { SelectComponent } from '../../../shared/components/design-system/select/select.component';

@Component({
  selector: 'app-cart-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonComponent, 
    CardComponent, 
    BadgeComponent, 
    InputComponent, 
    MapPinIconComponent, 
    ModalComponent, 
    MarketplaceNavbarComponent, 
    ProgressIndicatorComponent,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    CouponsModalComponent,
    SelectComponent
  ],
  templateUrl: './cart-checkout.component.html',
  styles: []
})
export class CartCheckoutComponent implements OnInit, OnDestroy {
  accountId: string | null = null;
  cart: CartResponse | null = null;
  company: Company | null = null;
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  orderNumber: string | null = null;
  processingOrder = false;
  deliveryDate: string = '';
  deliveryTime: string = '';
  isAuthenticated = false;
  customerDataLoaded = false;
  savedAddresses: CustomerAddress[] = [];
  defaultAddress: CustomerAddress | null = null;
  selectedAddressId: string | null = null;
  deliveryFee: number = 0; // in cents
  loadingFee = false;
  feeError: string | null = null;
  
  // Club subscription benefits
  clubSubscription: CustomerClubSubscription | null = null;
  loadingClubBenefits = false;
  clubDiscountAmount: number = 0; // in cents
  hasFreeShipping = false;
  
  // Coupon/Promo code
  couponCode: string = '';
  validatingCoupon = false;
  couponApplied = false;
  couponError: string | null = null;
  couponDiscountAmount: number = 0; // in cents
  showCouponsModal = false;
  
  // For debounced inputs
  private addressChangeSubject = new Subject<string>();
  private couponChangeSubject = new Subject<string>();
  
  progressSteps: ProgressStep[] = [
    { id: 'review', label: 'Revisar', completed: true },
    { id: 'scheduling', label: 'Agendar', completed: true },
    { id: 'checkout', label: 'Finalizar', completed: true }
  ];
  showLoginModal = false;

  formData = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'PENDING' as 'PIX' | 'CREDIT_CARD' | 'PENDING',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private catalogService: CatalogService,
    private orderPdfService: OrderPdfService,
    private authService: AuthService,
    private customerAddressService: CustomerAddressService,
    private toastService: ToastService,
    private abandonmentService: CartAbandonmentTrackingService,
    private deliveryService: DeliveryService,
    private validationService: ValidationService,
    private clubSubscriptionService: CustomerClubSubscriptionService,
    private promotionService: PromotionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Setup debounced address change listener
    this.addressChangeSubject.pipe(
      debounceTime(1000), // Wait 1 second after user stops typing
      distinctUntilChanged() // Only if address actually changed
    ).subscribe(address => {
      if (address && address.trim().length >= 15) {
        this.calculateDeliveryFee();
      }
    });
    
    // Setup debounced coupon validation listener
    this.couponChangeSubject.pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      distinctUntilChanged() // Only if coupon code actually changed
    ).subscribe(code => {
      if (code && code.trim().length >= 3) {
        this.validateCoupon();
      } else {
        // Clear coupon if code is removed
        this.clearCoupon();
      }
    });
    
    this.route.queryParams.subscribe(params => {
      this.accountId = params['accountId'];
      
      // Get delivery date and time from sessionStorage
      this.deliveryDate = sessionStorage.getItem('deliveryDate') || '';
      this.deliveryTime = sessionStorage.getItem('deliveryTime') || '';
      
      if (this.accountId) {
        this.loadCart();
        this.loadCompany();
        
        // Load customer data and addresses if authenticated
        // Load addresses first, then customer data (addresses have priority)
        if (this.isAuthenticated) {
          this.loadSavedAddresses();
          this.loadCustomerData();
          this.loadClubBenefits();
        }
      } else {
        this.error = 'Account ID não fornecido';
        this.loading = false;
      }
    });
  }
  
  ngOnDestroy(): void {
    this.addressChangeSubject.complete();
    this.couponChangeSubject.complete();
  }

  loadCart(): void {
    if (!this.accountId) return;
    
    this.cartService.getCart(this.accountId).subscribe({
      next: (cart: CartResponse) => {
        this.cart = cart;
        if (cart.items.length === 0) {
          this.error = 'Carrinho vazio. Por favor, adicione itens ao carrinho.';
          // Redirect to catalog after 2 seconds if cart is empty
          setTimeout(() => {
            this.router.navigate(['/catalog'], { queryParams: { accountId: this.accountId } });
          }, 2000);
        } else {
          // Track checkout_address stage with cart value
          this.abandonmentService.trackCheckoutStageWithValue(
            cart.id, 
            this.accountId!, 
            'checkout_address',
            cart.totalAmountCents / 100 // Convert cents to reais
          );
        }
        this.loading = false;
      },
      error: (err: any) => {
        // If cart not found (404) or empty cart, redirect to catalog
        if (err.status === 404 || err.error?.message?.includes('vazio') || err.error?.message?.includes('empty')) {
          this.error = 'Carrinho vazio. Por favor, adicione itens ao carrinho.';
          setTimeout(() => {
            this.router.navigate(['/catalog'], { queryParams: { accountId: this.accountId } });
          }, 2000);
        } else {
          this.error = err.error?.message || 'Erro ao carregar carrinho';
        }
        this.loading = false;
      }
    });
  }
  
  onPaymentMethodChange(): void {
    if (this.cart && this.accountId) {
      // Track checkout_payment stage with cart value
      this.abandonmentService.trackCheckoutStageWithValue(
        this.cart.id, 
        this.accountId, 
        'checkout_payment',
        this.cart.totalAmountCents / 100
      );
    }
  }
  
  onReviewStage(): void {
    if (this.cart && this.accountId) {
      // Track checkout_review stage with cart value
      this.abandonmentService.trackCheckoutStageWithValue(
        this.cart.id, 
        this.accountId, 
        'checkout_review',
        this.cart.totalAmountCents / 100
      );
    }
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

  loadCustomerData(): void {
    if (!this.accountId) return;
    
    // Only load customer data if authenticated
    if (!this.isAuthenticated) {
      return;
    }
    
    this.customerAddressService.getCurrentCustomer(this.accountId).subscribe({
      next: (customer) => {
        // Auto-fill form with customer data
        // Prioritize full_name if available, otherwise use name (which might be username/nickname)
        this.formData.customerName = customer.full_name || customer.name || '';
        this.formData.customerEmail = customer.email || '';
        this.formData.customerPhone = customer.phone || '';
        
        // Only set address from customer if no saved addresses are loaded yet
        // Saved addresses have priority
        if (this.savedAddresses.length === 0 && !this.selectedAddressId) {
          this.formData.customerAddress = customer.address || '';
        }
        
        this.customerDataLoaded = true;
        
        console.log('✅ Customer data loaded:', {
          name: this.formData.customerName,
          hasAddress: !!this.formData.customerAddress,
          addressLength: this.formData.customerAddress?.length,
          savedAddressesCount: this.savedAddresses.length
        });
        
        // Calculate delivery fee if address is available and no saved address is selected
        if (this.savedAddresses.length === 0 && this.formData.customerAddress && this.formData.customerAddress.length >= 15) {
          setTimeout(() => {
            console.log('🔄 Triggering delivery fee calculation from customer data');
            this.calculateDeliveryFee();
          }, 100);
        }
      },
      error: (err: any) => {
        // Silently fail - customer might not exist in this account yet
        if (err.status !== 404 && err.status !== 401) {
          console.debug('Customer data not available', err);
        }
        if (err.status === 401) {
          this.isAuthenticated = false;
        }
      }
    });
  }

  loadSavedAddresses(): void {
    // Only load saved addresses if authenticated
    if (!this.isAuthenticated) {
      console.log('⚠️ Not authenticated, skipping address load');
      return;
    }
    
    console.log('📦 Loading saved addresses...', { accountId: this.accountId });
    
    // Load addresses - if accountId is available, load account-specific addresses,
    // otherwise load user-level addresses (new system)
    this.customerAddressService.getAddresses(this.accountId || undefined).subscribe({
      next: (addresses) => {
        console.log('✅ Addresses loaded:', addresses);
        this.savedAddresses = addresses || [];
        
        if (this.savedAddresses.length > 0) {
          // Find and use the default address, or first address if no default
          this.defaultAddress = this.savedAddresses.find(a => a.is_default) || this.savedAddresses[0] || null;
          if (this.defaultAddress) {
            // Set the address in form data first
            this.formData.customerAddress = this.defaultAddress.address;
            
            // Use setTimeout to ensure the view is updated with addresses before setting selectedAddressId
            // This ensures the SelectComponent can find the option
            setTimeout(() => {
              this.selectedAddressId = this.defaultAddress!.id;
              console.log('✅ Default address loaded and selected:', {
                id: this.defaultAddress!.id,
                label: this.defaultAddress!.label,
                address: this.defaultAddress!.address,
                selectedAddressId: this.selectedAddressId
              });
              
              // Force change detection to update the view
              this.cdr.detectChanges();
              
              // Calculate delivery fee when default address is loaded
              setTimeout(() => {
                console.log('🔄 Triggering delivery fee calculation with address:', this.formData.customerAddress);
                this.calculateDeliveryFee();
              }, 100);
            }, 50);
          }
        } else {
          console.log('⚠️ No saved addresses found');
          this.defaultAddress = null;
          this.selectedAddressId = null;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('❌ Error loading addresses:', err);
        // Silently fail - addresses might not be available
        if (err.status !== 404 && err.status !== 401) {
          console.debug('Saved addresses not available', err);
        }
        if (err.status === 401) {
          this.isAuthenticated = false;
        }
        this.savedAddresses = [];
        this.defaultAddress = null;
        this.selectedAddressId = null;
      }
    });
  }

  /**
   * Load club subscription benefits for the current customer
   */
  loadClubBenefits(): void {
    if (!this.accountId || !this.isAuthenticated) return;

    this.loadingClubBenefits = true;
    console.log('🎁 Loading club subscription benefits...');

    this.clubSubscriptionService.getMyClubSubscription(this.accountId).subscribe({
      next: (subscription) => {
        this.clubSubscription = subscription;
        this.loadingClubBenefits = false;

        if (subscription && subscription.status === 'active') {
          console.log('✅ Active club subscription found:', subscription.club?.name);
          this.applyClubBenefits();
          
          // Show toast notification
          this.toastService.success(
            `🎉 Benefícios do ${subscription.club?.name || 'Clube'} aplicados!`
          );
        } else {
          console.log('ℹ️ No active club subscription found');
        }
      },
      error: (err) => {
        this.loadingClubBenefits = false;
        // Silently fail - customer might not have a club subscription
        console.debug('Club subscription not available', err);
      }
    });
  }

  /**
   * Apply club benefits to the order (free shipping and discount)
   */
  applyClubBenefits(): void {
    if (!this.clubSubscription || this.clubSubscription.status !== 'active') {
      return;
    }

    const club = this.clubSubscription.club;
    if (!club) return;

    // Check for free shipping benefit
    const hasFreeShippingBenefit = club.benefits?.some(benefit => 
      benefit.toLowerCase().includes('frete') && 
      (benefit.toLowerCase().includes('grátis') || benefit.toLowerCase().includes('gratis'))
    );

    if (hasFreeShippingBenefit) {
      this.hasFreeShipping = true;
      console.log('✅ Free shipping applied from club');
    }

    // Apply discount percentage
    if (club.discountPercentage && club.discountPercentage > 0 && this.cart) {
      // Calculate discount on cart subtotal (before shipping)
      this.clubDiscountAmount = Math.round((this.cart.totalAmountCents * club.discountPercentage) / 100);
      console.log(`✅ ${club.discountPercentage}% discount applied: ${this.clubDiscountAmount / 100} BRL`);
    }
  }

  /**
   * Get total amount with club benefits and coupon applied
   */
  getTotalWithClubBenefits(): number {
    if (!this.cart) return 0;

    let total = this.cart.totalAmountCents;

    // Apply club discount
    if (this.clubDiscountAmount > 0) {
      total -= this.clubDiscountAmount;
    }

    // Apply coupon discount
    if (this.couponDiscountAmount > 0) {
      total -= this.couponDiscountAmount;
    }

    // Add delivery fee (unless free shipping)
    if (!this.hasFreeShipping && this.deliveryFee > 0) {
      total += this.deliveryFee;
    }

    return Math.max(0, total); // Ensure non-negative
  }

  /**
   * Get final delivery fee (0 if free shipping)
   */
  getFinalDeliveryFee(): number {
    return this.hasFreeShipping ? 0 : this.deliveryFee;
  }

  /**
   * Handle coupon code input change (with debounce)
   */
  onCouponChange(): void {
    this.couponChangeSubject.next(this.couponCode);
  }

  /**
   * Validate coupon code
   */
  validateCoupon(): void {
    if (!this.couponCode || !this.cart) {
      return;
    }

    this.validatingCoupon = true;
    this.couponError = null;

    console.log('🎟️ Validating coupon:', this.couponCode);

    this.promotionService.validatePromotionCode({
      code: this.couponCode.trim().toUpperCase(),
      cart_amount_cents: this.cart.totalAmountCents
    }).subscribe({
      next: (response: ValidatePromotionResponse) => {
        this.validatingCoupon = false;

        if (response.valid && response.discount_amount_cents) {
          this.couponApplied = true;
          this.couponDiscountAmount = response.discount_amount_cents;
          this.couponError = null;
          
          console.log('✅ Coupon valid:', {
            code: this.couponCode,
            discount: response.discount_amount_cents / 100
          });

          this.toastService.success(
            `🎉 Cupom aplicado! Você economizou ${FormatUtil.formatCurrency(response.discount_amount_cents)}`
          );
        } else {
          this.couponApplied = false;
          this.couponDiscountAmount = 0;
          this.couponError = response.message || 'Cupom inválido';
          
          console.log('❌ Coupon invalid:', response.message);
          this.toastService.error(this.couponError);
        }
      },
      error: (err) => {
        this.validatingCoupon = false;
        this.couponApplied = false;
        this.couponDiscountAmount = 0;
        this.couponError = err.error?.message || 'Erro ao validar cupom';
        
        console.error('❌ Coupon validation error:', err);
        this.toastService.error(this.couponError || 'Erro ao validar cupom');
      }
    });
  }

  /**
   * Clear/Remove coupon
   */
  clearCoupon(): void {
    this.couponCode = '';
    this.couponApplied = false;
    this.couponDiscountAmount = 0;
    this.couponError = null;
    console.log('🗑️ Coupon cleared');
  }

  /**
   * Apply coupon manually (button click)
   */
  applyCoupon(): void {
    if (this.couponCode && this.couponCode.trim().length >= 3) {
      this.validateCoupon();
    } else {
      this.toastService.warning('Digite um código de cupom válido');
    }
  }

  /**
   * Open coupons modal
   */
  openCouponsModal(): void {
    this.showCouponsModal = true;
  }

  /**
   * Close coupons modal
   */
  closeCouponsModal(): void {
    this.showCouponsModal = false;
  }

  /**
   * Apply coupon from modal
   */
  applyCouponFromModal(code: string): void {
    this.couponCode = code;
    this.validateCoupon();
  }

  calculateDeliveryFee(): void {
    console.log('🚚 calculateDeliveryFee called:', {
      accountId: this.accountId,
      address: this.formData.customerAddress,
      addressLength: this.formData.customerAddress?.length
    });

    if (!this.accountId || !this.formData.customerAddress) {
      console.log('⚠️ Missing accountId or address, skipping calculation');
      this.deliveryFee = 0;
      return;
    }

    // Don't calculate if address is too short
    if (this.formData.customerAddress.trim().length < 15) {
      console.log('⚠️ Address too short (<15 chars), skipping calculation');
      this.deliveryFee = 0;
      return;
    }

    console.log('✅ Starting delivery fee calculation...');
    this.loadingFee = true;
    this.feeError = null;

    // Use the delivery address for geocoding and distance calculation
    this.deliveryService.calculateFee({
      accountId: this.accountId,
      deliveryAddress: this.formData.customerAddress
    }).subscribe({
      next: (response: DeliveryFeeResponse) => {
        console.log('📦 Delivery fee response:', response);
        
        if (response.available === false || response.error) {
          // Delivery not available or error occurred
          this.feeError = response.error || 'Entrega não disponível para este endereço';
          this.deliveryFee = 0;
          this.loadingFee = false;
          console.log('❌ Delivery not available:', this.feeError);
          return;
        }
        
        // Convert from BRL to cents (multiply by 100)
        this.deliveryFee = Math.round(response.totalFee * 100);
        this.loadingFee = false;
        
        console.log('✅ Delivery fee calculated:', {
          address: this.formData.customerAddress,
          distanceKm: response.distanceKm,
          feeBRL: response.totalFee,
          feeCents: this.deliveryFee
        });
      },
      error: (err: any) => {
        console.error('❌ Error calculating delivery fee:', err);
        this.feeError = err.error?.error || 'Não foi possível calcular o frete';
        this.deliveryFee = 0;
        this.loadingFee = false;
        // Don't block checkout if fee calculation fails
      }
    });
  }

  onAddressChange(): void {
    // Trigger debounced calculation
    this.addressChangeSubject.next(this.formData.customerAddress);
  }

  onAddressSelected(addressId: string): void {
    console.log('📍 Address selected:', addressId);
    
    if (!addressId || addressId === '') {
      this.selectedAddressId = null;
      this.formData.customerAddress = '';
      console.log('📍 Address selection cleared');
      return;
    }

    const selectedAddress = this.savedAddresses.find(a => a.id === addressId);
    if (selectedAddress) {
      this.selectedAddressId = selectedAddress.id;
      this.formData.customerAddress = selectedAddress.address;
      console.log('✅ Address selected and form updated:', {
        id: selectedAddress.id,
        label: selectedAddress.label,
        address: selectedAddress.address
      });
      // Calculate delivery fee when address is selected
      setTimeout(() => {
        this.calculateDeliveryFee();
      }, 100);
    } else {
      console.warn('⚠️ Selected address not found in saved addresses:', addressId);
    }
  }

  goToAddAddress(): void {
    // Navigate to customer profile page to add address
    this.router.navigate(['/customer/profile'], { 
      queryParams: { tab: 'addresses' },
      queryParamsHandling: 'merge'
    });
  }

  isFormValid(): boolean {
    // Validate address: if authenticated and has saved addresses, require selectedAddressId
    // Otherwise, require customerAddress text field with minimum length
    const hasValidAddress = this.isAuthenticated && this.savedAddresses.length > 0
      ? !!this.selectedAddressId && !!this.formData.customerAddress && this.formData.customerAddress.trim().length > 0
      : !!this.formData.customerAddress && this.formData.customerAddress.trim().length >= 15;
    
    // If authenticated, fields are optional (backend will auto-fill)
    // But address is always required
    if (this.isAuthenticated) {
      return !!this.deliveryDate && hasValidAddress;
    }
    
    // If not authenticated, all fields are required
    return !!(
      this.deliveryDate &&
      this.formData.customerName &&
      this.formData.customerEmail &&
      this.formData.customerPhone &&
      hasValidAddress
    );
  }

  onSubmit(): void {
    // Allow guest checkout - authentication will be handled by backend if required
    // Only show login modal if backend returns authentication error

    if (!this.accountId || !this.cart || this.cart.items.length === 0) {
      this.error = 'Carrinho vazio';
      return;
    }

    if (!this.deliveryDate) {
      this.error = 'Data de entrega não selecionada';
      return;
    }

    if (!this.isFormValid()) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.processingOrder = true;
    this.error = null;
    this.successMessage = null;

    // Build delivery datetime if time is provided
    let deliveryDateTime: string | undefined;
    if (this.deliveryDate && this.deliveryTime) {
      deliveryDateTime = this.buildDeliveryDateTime(this.deliveryDate, this.deliveryTime);
    }

    const request: CheckoutRequest = {
      account_id: this.accountId!, // Backend requires account_id
      delivery_date: this.deliveryDate,
      delivery_datetime: deliveryDateTime,
      customer_name: this.formData.customerName || undefined,
      customer_email: this.formData.customerEmail || undefined,
      customer_phone: this.formData.customerPhone || undefined,
      customer_address: this.formData.customerAddress || undefined,
      payment_method: this.formData.paymentMethod,
      notes: this.formData.notes?.trim() || undefined,
      promotion_code: this.cart.promotionCode,
      delivery_fee_cents: this.deliveryFee > 0 ? this.deliveryFee : undefined
    };

    this.cartService.checkout(this.accountId, request).subscribe({
      next: (order: OrderResponse) => {
        // Track cart completion
        if (this.cart && this.accountId) {
          this.abandonmentService.trackCartCompleted(this.cart.id, this.accountId);
        }
        
        this.successMessage = 'Pedido criado com sucesso!';
        this.orderNumber = order.order_number || null;
        this.processingOrder = false;
        const successMsg = order.order_number 
          ? `Pedido criado com sucesso! Número do pedido: ${order.order_number}`
          : 'Pedido criado com sucesso!';
        this.toastService.success(successMsg);
        
        // Clear sessionStorage (only delivery date/time, NOT cart data)
        sessionStorage.removeItem('deliveryDate');
        sessionStorage.removeItem('deliveryTime');
        
        // DO NOT clear cart session here - let user keep shopping
        // Cart will be cleared by backend after successful checkout
        
        // Generate PDF
        if (this.company) {
          this.orderPdfService.generateOrderPDF(order, this.company);
        }
        
        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/customer/orders']);
        }, 2000);
      },
      error: (err: any) => {
        this.processingOrder = false;
        // Check if error is authentication related
        let errorMessage: string;
        if (err.status === 401 || err.status === 403 || err.error?.message?.toLowerCase().includes('login') || err.error?.message?.toLowerCase().includes('autenticação')) {
          this.showLoginModal = true;
          errorMessage = 'É necessário fazer login para finalizar o pedido';
        } else {
          // Check if error is related to same-day delivery
          const errorMsg = err.error?.message || '';
          if (errorMsg.toLowerCase().includes('same-day delivery') || errorMsg.toLowerCase().includes('entrega no mesmo dia')) {
            errorMessage = 'Entrega no mesmo dia não está disponível para esta loja. Por favor, selecione uma data futura.';
            // Clear delivery date from session storage to force user to select a new date
            sessionStorage.removeItem('deliveryDate');
            sessionStorage.removeItem('deliveryTime');
            this.deliveryDate = '';
            this.deliveryTime = '';
            // Redirect to scheduling page after showing error
            setTimeout(() => {
              if (this.accountId) {
                this.router.navigate(['/catalog/cart-scheduling'], { queryParams: { accountId: this.accountId } });
              }
            }, 3000);
          } else {
            errorMessage = errorMsg || 'Erro ao processar pedido';
          }
        }
        this.error = errorMessage;
        this.toastService.error(errorMessage);
      }
    });
  }


  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const formatted = this.validationService.formatPhone(value);
    if (formatted !== input.value) {
      input.value = formatted;
      this.formData.customerPhone = formatted;
    }
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }

  goToLogin(): void {
    // Store current route to redirect back after login
    const returnUrl = this.router.url;
    sessionStorage.setItem('returnUrl', returnUrl);
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: returnUrl } 
    });
  }

  buildDeliveryDateTime(date: string, time: string): string {
    let hour = '12';
    let minute = '00';

    if (time === 'morning') hour = '10';
    else if (time === 'afternoon') hour = '15';
    else if (time === 'evening') hour = '20';
    else if (time.includes('-')) {
        // Handle "HH:mm-HH:mm" format from scheduler
        const startPart = time.split('-')[0]; // "HH:mm"
        const parts = startPart.split(':');
        if (parts.length >= 2) {
            hour = parts[0];
            minute = parts[1];
        }
    } else if (time.includes(':')) {
        // Handle "HH:mm" format
        const parts = time.split(':');
        if (parts.length >= 2) {
            hour = parts[0];
            minute = parts[1];
        }
    }
    
    // Ensure 2 digits
    hour = hour.toString().padStart(2, '0');
    minute = minute.toString().padStart(2, '0');

    return `${date}T${hour}:${minute}:00`;
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }

  getTotalWithDelivery(): number {
    if (!this.cart) return 0;
    return this.cart.totalAmountCents + this.deliveryFee;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // If dateString is YYYY-MM-DD, parse it manually to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getTimeLabel(time: string): string {
    switch (time) {
      case 'morning': return 'Manhã (08:00 - 12:00)';
      case 'afternoon': return 'Tarde (12:00 - 18:00)';
      case 'evening': return 'Noite (18:00 - 22:00)';
      default: return time;
    }
  }
}

