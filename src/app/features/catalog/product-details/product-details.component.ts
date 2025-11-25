import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Product, Company } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { SEOService } from '../../../core/services/seo.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { CartService, CartResponse } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { ImageGalleryComponent } from '../../../shared/components/image/image-gallery.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonLoaderComponent, ButtonComponent, CardComponent, BadgeComponent, MapPinIconComponent, MarketplaceNavbarComponent, ImageGalleryComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-6">
          <app-skeleton-loader type="card"></app-skeleton-loader>
        </div>

        <div *ngIf="product && !loading" class="product-page grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
          <!-- Coluna Esquerda: Galeria de Imagens -->
          <div class="image-section">
            <app-image-gallery 
              [images]="productImages"
              [mainImage]="product.image_url"
              (imageSelected)="selectedImage = $event">
            </app-image-gallery>
          </div>
          
          <!-- Coluna Direita: Informações -->
          <div class="info-section">
            <h1 class="text-h1 font-bold text-primary mb-4">{{ product.name }}</h1>
            
            <div class="flex items-center gap-4 mb-6">
              <div class="flex items-center gap-1">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-h4 font-semibold">4.8</span>
                <span class="text-body-sm text-gray-500">(127 avaliações)</span>
              </div>
              <span class="text-body-sm text-gray-500">SKU: {{ product.sku }}</span>
            </div>
            
            <div class="price-section mb-6 p-6 bg-gradient-to-br from-primary-light/10 to-secondary/5 rounded-lg border border-primary-light/20">
              <div class="flex items-baseline gap-3">
                <span class="text-display font-bold text-primary">{{ formatCurrency(product.price_cents) }}</span>
                <span class="text-body text-gray-600" *ngIf="product.unit_type">por {{ product.unit_type }}</span>
              </div>
            </div>
            
            <div class="description mb-6">
              <h3 class="text-h3 font-semibold text-primary mb-3">Descrição</h3>
              <p class="text-body text-gray-700 whitespace-pre-line leading-relaxed">{{ product.description || 'Sem descrição disponível.' }}</p>
            </div>
            
            <!-- Seção de Ações Separadas -->
            <div class="actions-section space-y-4">
              <!-- Compra Avulsa -->
              <div *ngIf="allowsSingleOrder()" class="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h4 class="text-h4 font-semibold text-primary mb-4">Compra Avulsa</h4>
                <div class="flex gap-3">
                  <input type="number" 
                         [(ngModel)]="quantity"
                         min="1"
                         class="w-20 px-3 py-2 border border-gray-300 rounded-medium text-center focus:ring-2 focus:ring-primary-light focus:border-transparent"
                         [disabled]="addingToCart">
                  <app-button variant="outline" 
                              label="Adicionar ao Carrinho" 
                              [fullWidth]="true"
                              [loading]="addingToCart"
                              [disabled]="addingToCart"
                              (clicked)="addToCart()"></app-button>
                  <app-button variant="primary" 
                              label="Comprar Agora" 
                              [fullWidth]="true"
                              [disabled]="addingToCart"
                              (clicked)="buyNow()"></app-button>
                </div>
              </div>
              
              <!-- Assinatura Recorrente -->
              <div class="border-2 border-secondary/30 rounded-lg p-6 bg-gradient-to-br from-secondary/5 to-secondary/10">
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <h4 class="text-h4 font-semibold text-secondary">Receba Regularmente</h4>
                </div>
                <p class="text-body-sm text-gray-600 mb-4">
                  Crie sua assinatura personalizada e receba automaticamente
                </p>
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <button *ngFor="let interval of subscriptionIntervals"
                          [class.active]="selectedInterval === interval.value"
                          [class.bg-secondary]="selectedInterval === interval.value"
                          [class.text-white]="selectedInterval === interval.value"
                          [class.bg-white]="selectedInterval !== interval.value"
                          [class.text-gray-700]="selectedInterval !== interval.value"
                          (click)="selectInterval(interval.value)"
                          class="interval-button px-4 py-3 border border-gray-300 rounded-medium hover:border-secondary transition-colors text-center">
                    {{ interval.label }}
                  </button>
                </div>
                <app-button variant="accent" 
                            label="Criar Assinatura" 
                            [fullWidth]="true"
                            [disabled]="!selectedInterval"
                            (clicked)="createSubscription()"></app-button>
              </div>
              
              <!-- Clube de Assinantes (se houver) -->
              <div *ngIf="availableClub" class="border border-primary-light/30 rounded-lg p-6 bg-primary-light/5">
                <div class="flex items-center gap-2 mb-3">
                  <svg class="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h4 class="text-h4 text-primary-light">{{ availableClub.name }}</h4>
                </div>
                <p class="text-body-sm text-gray-600 mb-3">
                  {{ availableClub.description }}
                </p>
                <div class="flex items-center gap-2 mb-4">
                  <app-badge variant="success" label="-{{ availableClub.discountPercentage }}% desconto"></app-badge>
                  <span class="text-body-sm text-gray-600">R$ {{ availableClub.monthlyFee }}/mês</span>
                </div>
                <app-button variant="primary" 
                            label="Assinar Clube" 
                            [fullWidth]="true"
                            (clicked)="subscribeToClub()"></app-button>
              </div>
            </div>
          </div>
        </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-error">
          <div class="text-center">
            <p class="text-h3 text-error font-semibold mb-2">Erro ao carregar produto</p>
            <p class="text-body text-error mb-6">{{ error }}</p>
            <app-button 
              variant="primary"
              size="md"
              label="Voltar"
              (clicked)="goBack()">
            </app-button>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  company: Company | null = null;
  loading = false;
  error: string | null = null;
  isAuthenticated = false;
  showSubscriptionPreview = false;
  quantity = 1;
  addingToCart = false;
  
  // Image management
  selectedImage: string | null = null;
  productImages: string[] = [];
  
  // Subscription intervals
  subscriptionIntervals = [
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'BIWEEKLY', label: 'Quinzenal' },
    { value: 'MONTHLY', label: 'Mensal' }
  ];
  selectedInterval: string | null = null;
  
  // Subscription club
  availableClub: any = null; // Will be typed properly when backend is ready

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private authService: AuthService,
    private seoService: SEOService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.error = 'ID do produto não fornecido';
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;
    this.catalogService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loadCompany(product.account_id);
        
        // Setup images
        this.productImages = product.image_url ? [product.image_url] : [];
        this.selectedImage = null; // Will use main image by default
        
        // Load subscription club if available
        this.loadSubscriptionClub(product.account_id);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.error = 'Erro ao carregar produto: ' + (err.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }
  
  loadSubscriptionClub(accountId: string): void {
    // Load active subscription clubs for this account
    this.catalogService.getSubscriptionClubs(accountId).subscribe({
      next: (clubs) => {
        // Get the first active club, or null if none
        this.availableClub = clubs.find((club: any) => club.active) || null;
      },
      error: (err) => {
        console.error('Error loading subscription clubs', err);
        this.availableClub = null;
      }
    });
  }
  
  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }
  
  getOptimizedImageUrl(url: string | undefined, size: 'thumbnail' | 'medium' | 'large' = 'medium'): string {
    if (!url) return '';
    
    const baseUrl = this.getImageUrl(url);
    // In production, you could add size parameters or use a CDN that supports image resizing
    // For now, we'll use query parameters for potential future CDN integration
    const sizes = {
      thumbnail: '240x240',
      medium: '360x360',
      large: '720x720'
    };
    
    // If URL already has query parameters, append size; otherwise add it
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}size=${sizes[size]}`;
  }
  
  selectInterval(interval: string): void {
    this.selectedInterval = interval;
  }
  
  createSubscription(): void {
    if (!this.product || !this.selectedInterval) return;
    
    // Navigate to checkout with subscription type
    this.router.navigate(['/catalog/products', this.product.id, 'checkout'], {
      queryParams: { type: 'subscription', interval: this.selectedInterval }
    });
  }
  
  subscribeToClub(): void {
    if (!this.product || !this.availableClub) return;
    
    // Navigate to checkout with club subscription type
    this.router.navigate(['/catalog/products', this.product.id, 'checkout'], {
      queryParams: { type: 'subscription', clubId: this.availableClub.id }
    });
  }
  
  buyNow(): void {
    if (!this.product || !this.isAuthenticated) {
      this.goToLogin();
      return;
    }
    
    // Add to cart and go directly to checkout
    this.addToCart();
    // Navigate to cart checkout
    setTimeout(() => {
      this.router.navigate(['/catalog/cart/checkout']);
    }, 500);
  }

  loadCompany(accountId: string): void {
    this.catalogService.getCompanyById(accountId).subscribe({
      next: (company) => {
        this.company = company;
      },
      error: (err) => {
        console.error('Error loading company', err);
      }
    });
  }


  goToCheckout(orderType: 'subscription' | 'single'): void {
    if (!this.product) return;
    this.router.navigate(['/catalog/products', this.product.id, 'checkout'], {
      queryParams: { type: orderType }
    });
  }

  goBack(): void {
    this.router.navigate(['/catalog']);
  }

  goToCompany(): void {
    if (this.company) {
      this.router.navigate(['/catalog/companies', this.company.id]);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
  }

  formatCurrency(cents: number): string {
    return FormatUtil.formatCurrency(cents);
  }

  getIntervalLabel(interval: string, customDays?: number): string {
    const labels: { [key: string]: string } = {
      'daily': 'Diário',
      'weekly': 'Semanal',
      'biweekly': 'Quinzenal',
      'monthly': 'Mensal',
      'quarterly': 'Trimestral',
      'custom': customDays ? `A cada ${customDays} dias` : 'Personalizado'
    };
    return labels[interval] || interval;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it already starts with /api/files, just prepend the API base URL
    if (imageUrl.startsWith('/api/files/')) {
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}${imageUrl}`;
    }
    // If it's a relative path like "products/filename.jpg" or "accounts/filename.jpg"
    // Extract type and filename
    const parts = imageUrl.split('/');
    if (parts.length >= 2) {
      const type = parts[0]; // "products" or "accounts"
      const filename = parts[parts.length - 1];
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}/api/files/${type}/${filename}`;
    }
    // Fallback: assume it's a filename in products directory
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}/api/files/products/${imageUrl}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Hide the image and show placeholder content instead
      img.style.display = 'none';
      // The placeholder div will be shown by the template's *ngIf condition
    }
  }

  allowsSingleOrder(): boolean {
    // Explicitly check if allows_single_order is true
    // Treat undefined, null, or false as false
    return this.product?.allows_single_order === true;
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || user?.email?.split('@')[0] || 'Usuário';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    const roleLabels: { [key: string]: string } = {
      'customer': 'Cliente',
      'admin': 'Administrador',
      'operator': 'Operador',
      'deliverer': 'Entregador',
      'super_admin': 'Super Admin'
    };
    return roleLabels[user.role.toLowerCase()] || user.role;
  }

  getUserInitial(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '?';
    const name = user.name || user.email || 'U';
    return name.charAt(0).toUpperCase();
  }

  /**
   * Add product to cart (works for both authenticated and guest users)
   */
  addToCart(): void {
    if (!this.product || !this.product.account_id) {
      this.toastService.error('Erro: produto não encontrado');
      return;
    }

    if (this.quantity < 1) {
      this.toastService.warning('Quantidade deve ser pelo menos 1');
      return;
    }

    this.addingToCart = true;

    this.cartService.addItemToCart(this.product.account_id, {
      product_id: this.product.id,
      quantity: this.quantity
    }).subscribe({
      next: (cart: CartResponse) => {
        this.addingToCart = false;
        this.toastService.success(`✓ ${this.product?.name} adicionado ao carrinho!`);
        // Optionally navigate to cart review
        // this.router.navigate(['/catalog/cart-review'], { queryParams: { accountId: this.product.account_id } });
      },
      error: (err: any) => {
        this.addingToCart = false;
        this.toastService.error(err.error?.message || 'Erro ao adicionar ao carrinho');
      }
    });
  }

  /**
   * Calculate next delivery dates for subscription preview
   */
  getNextDeliveryDates(): Date[] {
    if (!this.product) return [];
    
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + 1); // Start from tomorrow
    
    // Calculate interval in days
    let intervalDays = 1;
    switch (this.product.interval) {
      case 'daily':
        intervalDays = 1;
        break;
      case 'weekly':
        intervalDays = 7;
        break;
      case 'biweekly':
        intervalDays = 14;
        break;
      case 'monthly':
        intervalDays = 30;
        break;
      case 'quarterly':
        intervalDays = 90;
        break;
      case 'custom':
        intervalDays = this.product.custom_interval_days || 7;
        break;
    }
    
    // Generate next 5 delivery dates
    for (let i = 0; i < 5; i++) {
      dates.push(new Date(nextDate));
      nextDate.setDate(nextDate.getDate() + intervalDays);
    }
    
    return dates;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

