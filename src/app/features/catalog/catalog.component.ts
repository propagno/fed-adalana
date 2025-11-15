import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogService, Company, Product } from '../../core/services/catalog.service';
import { AuthService } from '../../core/services/auth.service';
import { FormatUtil } from '../../shared/utils/format.util';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <!-- Modern Header -->
      <header class="bg-white shadow-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Adalana</h1>
                <p class="text-xs text-gray-500">Catálogo de Empresas</p>
              </div>
            </div>
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

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Search and Filter Section -->
        <div *ngIf="!selectedCompany" class="mb-8">
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Empresas</label>
                <div class="relative">
                  <input type="text" 
                         [(ngModel)]="searchTerm" 
                         (input)="filterCompanies()"
                         placeholder="Digite o nome da empresa..."
                         class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Companies Section -->
        <section *ngIf="!selectedCompany" class="mb-8">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-3xl font-bold text-gray-900">Empresas Disponíveis</h2>
              <p class="text-gray-600 mt-1">Explore nossos parceiros e seus produtos</p>
            </div>
            <div class="text-sm text-gray-500">
              {{ filteredCompanies?.length || 0 }} {{ (filteredCompanies?.length || 0) === 1 ? 'empresa' : 'empresas' }}
            </div>
          </div>

          <div *ngIf="loadingCompanies" class="flex flex-col items-center justify-center py-20">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p class="text-gray-600 text-lg">Carregando empresas...</p>
          </div>

          <div *ngIf="filteredCompanies && !loadingCompanies && filteredCompanies.length > 0" 
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let company of filteredCompanies" 
                 (click)="selectCompany(company)"
                 class="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1">
              <!-- Company Image -->
              <div class="h-48 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 relative overflow-hidden">
                <img *ngIf="company.image_url" 
                     [src]="getImageUrl(company.image_url)" 
                     [alt]="company.company_name"
                     class="w-full h-full object-cover">
                <div *ngIf="!company.image_url" class="absolute inset-0 flex items-center justify-center">
                  <div class="text-white text-6xl font-bold opacity-30">{{ company.company_name.charAt(0).toUpperCase() }}</div>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-600">
                    {{ company.currency }}
                  </span>
                </div>
              </div>
              
              <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {{ company.company_name }}
                    </h3>
                  </div>
                  <svg class="w-6 h-6 text-blue-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">Fuso:</span>
                    <span class="ml-1">{{ company.timezone || 'Não informado' }}</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">Moeda:</span>
                    <span class="ml-1">{{ company.currency }}</span>
                  </div>
                </div>
                
                <button class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  Ver Produtos
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredCompanies && filteredCompanies.length === 0 && !loadingCompanies" 
               class="text-center py-20 bg-white rounded-xl shadow-md">
            <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-xl text-gray-600 mb-2">Nenhuma empresa encontrada</p>
            <p class="text-gray-500">Tente ajustar sua busca</p>
          </div>
        </section>

        <!-- Products Section -->
        <section *ngIf="selectedCompany && products" class="mb-8">
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex items-center gap-4">
              <button (click)="goBack()" 
                      class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div class="flex-1">
                <h2 class="text-3xl font-bold text-gray-900">{{ selectedCompany.company_name }}</h2>
                <p class="text-gray-600 mt-1">Explore nossos produtos e serviços</p>
              </div>
            </div>
          </div>

          <div *ngIf="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let product of products" 
                 class="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1">
              <!-- Product Image -->
              <div class="h-48 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 relative overflow-hidden">
                <img *ngIf="product.image_url" 
                     [src]="getImageUrl(product.image_url)" 
                     [alt]="product.name"
                     class="w-full h-full object-cover">
                <div *ngIf="!product.image_url" class="absolute inset-0 flex items-center justify-center">
                  <div class="text-white text-5xl font-bold opacity-30">{{ product.name.charAt(0).toUpperCase() }}</div>
                </div>
                <div class="absolute top-4 left-4">
                  <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-indigo-600">
                    {{ product.sku || 'SKU' }}
                  </span>
                </div>
              </div>
              
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h3>
                
                <div class="space-y-3 mb-4">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-blue-600">{{ formatCurrency(product.price_cents) }}</span>
                    <span class="text-sm text-gray-500">por entrega</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ getIntervalLabel(product.interval, product.custom_interval_days) }}</span>
                  </div>
                </div>
                
                <button *ngIf="isAuthenticated" 
                        (click)="goToProductDetails(product.id)" 
                        class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  Ver Detalhes
                </button>
                <div *ngIf="!isAuthenticated" class="text-center">
                  <p class="text-sm text-gray-500 mb-2">Faça login para assinar</p>
                  <button (click)="goToLogin()" 
                          class="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200">
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="products.length === 0" class="text-center py-20 bg-white rounded-xl shadow-md">
            <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-xl text-gray-600 mb-2">Nenhum produto disponível</p>
            <p class="text-gray-500">Esta empresa ainda não possui produtos cadastrados</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: []
})
export class CatalogComponent implements OnInit {
  companies: Company[] | null = null;
  filteredCompanies: Company[] | null = null;
  products: Product[] | null = null;
  selectedCompany: Company | null = null;
  loadingCompanies = false;
  loadingProducts = false;
  error: string | null = null;
  isAuthenticated = false;
  searchTerm = '';

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loadingCompanies = true;
    this.catalogService.getActiveCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.filteredCompanies = companies;
        this.loadingCompanies = false;
      },
      error: (err) => {
        console.error('Error loading companies', err);
        this.error = 'Erro ao carregar empresas';
        this.loadingCompanies = false;
      }
    });
  }

  filterCompanies(): void {
    if (!this.companies) return;
    
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCompanies = this.companies;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredCompanies = this.companies.filter(company => 
      company.company_name.toLowerCase().includes(term)
    );
  }

  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.error = null;
    this.catalogService.getCompanyProducts(company.id).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error = 'Erro ao carregar produtos';
      }
    });
  }

  goBack(): void {
    this.selectedCompany = null;
    this.products = null;
    this.error = null;
  }

  goToProductDetails(productId: string): void {
    this.router.navigate(['/catalog/products', productId]);
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

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'Usuário';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    const role = user.role.toLowerCase();
    const roleLabels: { [key: string]: string } = {
      customer: 'Cliente',
      admin: 'Administrador',
      operator: 'Operador',
      deliverer: 'Entregador',
      super_admin: 'Super Administrador'
    };
    return roleLabels[role] || role;
  }

  getUserInitial(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, prepend the API base URL
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}${imageUrl}`;
  }
}
