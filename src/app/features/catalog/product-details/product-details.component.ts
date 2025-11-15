import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService, Product, Company } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-details',
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
            <div class="flex items-center gap-4">
              <div *ngIf="isAuthenticated" class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ getUserName() }}</p>
                  <p class="text-xs text-gray-500">{{ getUserRole() }}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  {{ getUserInitial() }}
                </div>
              </div>
              <button *ngIf="!isAuthenticated" 
                      (click)="goToLogin()" 
                      class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Entrar
              </button>
              <button *ngIf="isAuthenticated" 
                      (click)="logout()" 
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="product">
        <!-- Hero Section -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <!-- Product Image -->
            <div class="relative">
              <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                <img *ngIf="product.image_url" 
                     [src]="getImageUrl(product.image_url)" 
                     [alt]="product.name"
                     class="w-full h-full object-cover">
                <div *ngIf="!product.image_url" class="w-full h-full flex items-center justify-center">
                  <div class="text-gray-400 text-6xl font-bold">{{ product.name.charAt(0).toUpperCase() }}</div>
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div class="flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-4">
                  <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Disponível
                  </span>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
                
                <div class="mb-6">
                  <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-4xl font-bold text-blue-600">{{ formatCurrency(product.price_cents) }}</span>
                    <span class="text-lg text-gray-500" *ngIf="product.unit_type">por {{ product.unit_type }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ getIntervalLabel(product.interval, product.custom_interval_days) }}</span>
                  </div>
                </div>

                <!-- Company Info -->
                <div *ngIf="company" class="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <img *ngIf="company.image_url" 
                           [src]="getImageUrl(company.image_url)" 
                           [alt]="company.company_name"
                           class="w-full h-full object-cover">
                      <span *ngIf="!company.image_url" class="text-white font-bold text-xl">
                        {{ company.company_name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Empresa</p>
                      <p class="font-semibold text-gray-900">{{ company.company_name }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button *ngIf="isAuthenticated && !product.allows_single_order" 
                        (click)="goToCheckout('subscription')" 
                        class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  Assinar Agora
                </button>
                <div *ngIf="isAuthenticated && product.allows_single_order" class="grid grid-cols-2 gap-3">
                  <button (click)="goToCheckout('subscription')" 
                          class="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    Assinar
                  </button>
                  <button (click)="goToCheckout('single')" 
                          class="py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    Pedir Agora
                  </button>
                </div>
                <div *ngIf="!isAuthenticated" class="text-center">
                  <p class="text-sm text-gray-500 mb-2">Faça login para continuar</p>
                  <button (click)="goToLogin()" 
                          class="w-full py-4 bg-gray-100 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-all duration-200">
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6" *ngIf="product.description">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Informações do Produto</h2>
          <div class="prose max-w-none">
            <p class="text-gray-700 whitespace-pre-line">{{ product.description }}</p>
          </div>
        </div>

        <!-- Delivery Intervals Section (if subscription) -->
        <div class="bg-white rounded-xl shadow-lg p-6" *ngIf="!product.allows_single_order">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Frequência de Entrega</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <p class="font-semibold text-blue-900">{{ getIntervalLabel(product.interval, product.custom_interval_days) }}</p>
              <p class="text-sm text-blue-700 mt-1">Frequência atual</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p class="text-gray-600 text-lg">Carregando produto...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  company: Company | null = null;
  loading = false;
  error: string | null = null;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private authService: AuthService
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
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.error = 'Erro ao carregar produto: ' + (err.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
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
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}${imageUrl}`;
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
}

