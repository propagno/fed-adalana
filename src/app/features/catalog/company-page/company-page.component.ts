import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Company, Product } from '../../../core/services/catalog.service';
import { SubscriptionClubService } from '../../../core/services/subscription-club.service';
import { AuthService } from '../../../core/services/auth.service';
import { SEOService } from '../../../core/services/seo.service';
import { PromotionService, Promotion } from '../../../core/services/promotion.service';
import { CartService } from '../../../core/services/cart.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';
import { CartIndicatorComponent } from '../cart-indicator/cart-indicator.component';
import { ToastService } from '../../../shared/services/toast.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { ProductCardComponent } from '../../../shared/components/product/product-card.component';
import { LazyImageDirective } from '../../../shared/directives/lazy-image.directive';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CartIndicatorComponent,
    SkeletonLoaderComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    MapPinIconComponent,
    EmptyStateComponent,
    MarketplaceNavbarComponent,
    ProductCardComponent,
    LazyImageDirective
  ],
  templateUrl: './company-page.component.html',
  styles: []
})
export class CompanyPageComponent implements OnInit {
  company: Company | null = null;
  products: Product[] | null = null;
  promotions: Promotion[] | null = null;
  loading = true;
  loadingProducts = false;
  loadingPromotions = false;
  loadingClubs = false;
  error: string | null = null;
  isAuthenticated = false;
  companyId: string | null = null;
  companyAppearance: Company['appearance'] | null = null;
  subscriptionClub: any = null;
  subscriptionClubs: any[] = [];

  selectedProducts: { [productId: string]: boolean } = {};
  productQuantities: { [productId: string]: number } = {};
  
  tabs = [
    { id: 'products', label: 'Produtos', count: 0 },
    { id: 'clubs', label: 'Clubes VIP', count: 0 },
    { id: 'promotions', label: 'Promoções', count: 0 }
  ];
  activeTab = 'products';

  constructor(
    private catalogService: CatalogService,
    private subscriptionClubService: SubscriptionClubService,
    private authService: AuthService,
    private seoService: SEOService,
    private promotionService: PromotionService,
    private cartService: CartService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.route.params.subscribe(params => {
      this.companyId = params['id'];
      if (this.companyId) {
        this.loadCompany();
        this.loadProducts();
        this.loadPromotions();
        this.loadSubscriptionClubs();
      }
    });
  }

  loadCompany(): void {
    if (!this.companyId) return;
    
    this.loading = true;
    this.error = null;
    this.catalogService.getCompanyById(this.companyId).subscribe({
      next: (company) => {
        this.company = company;
        this.loadCompanyAppearance();
        
        this.seoService.updateTags({
          title: `${company.company_name} - Adalana`,
          description: company.appearance?.tagline || `Conheça ${company.company_name} e seus produtos`,
          url: window.location.href
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading company', err);
        this.error = 'Erro ao carregar informações da empresa';
        this.loading = false;
      }
    });
  }
  
  loadCompanyAppearance(): void {
    if (!this.companyId) return;
    
    this.catalogService.getCompanyAppearance(this.companyId).subscribe({
      next: (appearance) => {
        this.companyAppearance = appearance;
        if (this.company) {
          this.company.appearance = appearance;
        }
      },
      error: () => { }
    });
  }
  
  getCompanyBannerStyle(): any {
    if (!this.companyAppearance) return {};
    
    if (this.companyAppearance.bannerImageUrl) {
      return {
        'background-image': `url(${this.getImageUrl(this.companyAppearance.bannerImageUrl)})`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    }
    
    return {
      'background': `linear-gradient(135deg, ${this.companyAppearance.primaryColor || '#3B82F6'} 0%, ${this.companyAppearance.secondaryColor || '#60A5FA'} 100%)`
    };
  }
  
  getCompanyTextColor(): string {
    return this.companyAppearance?.primaryColor || '#1E40AF';
  }
  
  getCompanyAccentColor(): string {
    return this.companyAppearance?.accentColor || '#60A5FA';
  }

  loadProducts(): void {
    if (!this.companyId) return;
    
    this.loadingProducts = true;
    this.catalogService.getCompanyProducts(this.companyId).subscribe({
      next: (products) => {
        this.products = products;
        this.updateTabCount('products', products?.length || 0);
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.updateTabCount('products', 0);
        this.loadingProducts = false;
      }
    });
  }

  loadPromotions(): void {
    if (!this.companyId) return;
    
    this.loadingPromotions = true;
    this.promotionService.getActivePromotionsByAccount(this.companyId).subscribe({
      next: (promotions) => {
        this.promotions = promotions;
        this.updateTabCount('promotions', promotions?.length || 0);
        this.loadingPromotions = false;
      },
      error: (err) => {
        console.error('Error loading promotions', err);
        this.promotions = [];
        this.updateTabCount('promotions', 0);
        this.loadingPromotions = false;
      }
    });
  }
  
  loadSubscriptionClubs(): void {
    if (!this.companyId) return;
    
    this.loadingClubs = true;
    this.subscriptionClubService.getClubs(this.companyId).subscribe({
      next: (clubs) => {
        this.subscriptionClubs = clubs.filter(club => club.active);
        this.updateTabCount('clubs', this.subscriptionClubs.length);
        this.loadingClubs = false;
      },
      error: (err) => {
        console.error('Error loading subscription clubs', err);
        this.subscriptionClubs = [];
        this.updateTabCount('clubs', 0);
        this.loadingClubs = false;
      }
    });
  }
  
  selectTab(tabId: string): void {
    this.activeTab = tabId;
  }
  
  updateTabCount(tabId: string, count: number): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.count = count;
    }
  }
  
  subscribeToClub(club: any): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { 
          returnUrl: `/catalog/clubs/${club.id}/subscribe`,
          accountId: this.companyId 
        }
      });
      return;
    }

    // Navigate to subscription flow
    this.router.navigate(['/catalog/clubs', club.id, 'subscribe'], {
      queryParams: { accountId: this.companyId }
    });
  }
  
  applyPromotion(promotion: Promotion): void {
    if (promotion.code) {
      navigator.clipboard.writeText(promotion.code).then(() => {
        this.toastService.success(`Cupom ${promotion.code} copiado! Use no checkout.`);
      }).catch(() => {
        this.toastService.info(`Cupom: ${promotion.code} - Use no checkout`);
      });
    }
  }

  goToProductDetails(productId: string): void {
    this.router.navigate(['/catalog/products', productId]);
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }
  
  goToSubscriptionClub(): void {
    this.toastService.info('Funcionalidade em desenvolvimento');
  }

  getIntervalLabel(interval: string, customDays?: number): string {
    const labels: { [key: string]: string } = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      custom: customDays ? `${customDays} dias` : 'Personalizado'
    };
    return labels[interval] || interval;
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }

  formatCurrencyFromReais(value: number): string {
    return FormatUtil.formatCurrencyFromReais(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
  
  formatPhone(phone: string): string {
    return FormatUtil.formatPhone(phone);
  }

  onProductSelectionChange(product: Product): void {
    const isSelected = this.selectedProducts[product.id] === true;
    if (isSelected) {
      if (!this.productQuantities[product.id]) {
        this.productQuantities[product.id] = 1;
      }
      const quantity = this.productQuantities[product.id] || 1;
      this.addToCart(product.id, quantity);
    } else {
      this.removeFromCart(product.id);
      delete this.productQuantities[product.id];
    }
  }

  onQuantityChange(product: Product): void {
    const quantity = this.productQuantities[product.id] || 1;
    if (quantity < 1) {
      this.productQuantities[product.id] = 1;
    }
    const isSelected = this.selectedProducts[product.id] === true;
    if (isSelected) {
      const finalQuantity = this.productQuantities[product.id] || 1;
      this.updateCartQuantity(product.id, finalQuantity);
    }
  }

  increaseQuantity(productId: string): void {
    if (!this.productQuantities[productId]) {
      this.productQuantities[productId] = 1;
    } else {
      this.productQuantities[productId]++;
    }
    const isSelected = this.selectedProducts[productId] === true;
    if (isSelected) {
      const quantity = this.productQuantities[productId] || 1;
      this.updateCartQuantity(productId, quantity);
    }
  }

  decreaseQuantity(productId: string): void {
    const currentQuantity = this.productQuantities[productId] || 0;
    if (currentQuantity > 1) {
      this.productQuantities[productId] = currentQuantity - 1;
      const isSelected = this.selectedProducts[productId] === true;
      if (isSelected) {
        const newQuantity = this.productQuantities[productId] || 1;
        this.updateCartQuantity(productId, newQuantity);
      }
    }
  }

  addToCart(productId: string, quantity: number): void {
    if (!this.companyId) return;
    
    this.cartService.addItemToCart(this.companyId, {
      product_id: productId,
      quantity: quantity
    }).subscribe({
      next: () => {
        const product = this.products?.find(p => p.id === productId);
        const productName = product?.name || 'Produto';
        this.toastService.success(`${productName} adicionado ao carrinho!`);
      },
      error: (err: any) => {
        console.error('Error adding to cart', err);
        this.toastService.error(err.error?.message || 'Erro ao adicionar produto ao carrinho');
        this.selectedProducts[productId] = false;
      }
    });
  }

  removeFromCart(productId: string): void {
    if (!this.companyId) return;
    
    this.cartService.removeItemFromCart(this.companyId, productId).subscribe({
      next: () => {
        const product = this.products?.find(p => p.id === productId);
        const productName = product?.name || 'Produto';
        this.toastService.info(`${productName} removido do carrinho`);
      },
      error: (err: any) => {
        console.error('Error removing from cart', err);
        this.toastService.error(err.error?.message || 'Erro ao remover produto do carrinho');
      }
    });
  }

  updateCartQuantity(productId: string, quantity: number): void {
    if (!this.companyId || !productId || productId === 'undefined') {
      console.warn('Cannot update cart quantity: missing companyId or productId', { companyId: this.companyId, productId });
      return;
    }
    
    this.cartService.updateItemQuantity(this.companyId, productId, quantity).subscribe({
      next: () => {
        // Success - quantity updated (silent update)
      },
      error: (err: any) => {
        console.error('Error updating cart quantity', err);
        this.toastService.error(err.error?.message || 'Erro ao atualizar quantidade');
      }
    });
  }

  hasSelectedProducts(): boolean {
    return Object.keys(this.selectedProducts).some(id => this.selectedProducts[id] === true);
  }

  getSelectedItemsCount(): number {
    return Object.keys(this.selectedProducts)
      .filter(id => this.selectedProducts[id] === true)
      .reduce((sum, id) => sum + (this.productQuantities[id] || 1), 0);
  }

  goToCartReview(): void {
    if (!this.companyId) return;
    
    this.router.navigate(['/catalog/cart-review'], { 
      queryParams: { accountId: this.companyId } 
    });
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
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  convertProductToCardData(product: Product): any {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price_cents: product.price_cents,
      image_url: product.image_url,
      sku: product.sku,
      category: undefined,
      companyId: product.account_id
    };
  }

  onProductAddToCart(productCardData: any): void {
    if (this.companyId && productCardData.id) {
      this.addToCart(productCardData.id, 1);
    }
  }
}

