import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CatalogService, Company, Product, CatalogSearchResponse, SearchFilters } from '../../core/services/catalog.service';
import { AuthService } from '../../core/services/auth.service';
import { SEOService } from '../../core/services/seo.service';
import { PerformanceService } from '../../core/services/performance.service';
import { FormatUtil } from '../../shared/utils/format.util';
import { environment } from '../../../environments/environment';
import { CartIndicatorComponent } from './cart-indicator/cart-indicator.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LazyImageDirective } from '../../shared/directives/lazy-image.directive';
import { TrackClickDirective } from '../../shared/directives/track-click.directive';
import { CatalogSearchComponent } from './catalog-search/catalog-search.component';
import { CatalogFiltersComponent } from './catalog-filters/catalog-filters.component';
import { ButtonComponent } from '../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../shared/components/icons/map-pin-icon.component';
import { MarketplaceNavbarComponent } from '../../shared/components/navbar/marketplace-navbar.component';
import { CompanyCardComponent } from '../../shared/components/company/company-card.component';
import { ProductCardComponent } from '../../shared/components/product/product-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, CartIndicatorComponent, SkeletonLoaderComponent, EmptyStateComponent, LazyImageDirective, TrackClickDirective, CatalogSearchComponent, CatalogFiltersComponent, ButtonComponent, CardComponent, BadgeComponent, MapPinIconComponent, MarketplaceNavbarComponent, CompanyCardComponent, ProductCardComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>

              <main id="main-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8" tabindex="-1" role="main">
                <!-- Hero Section with Search -->
                <div class="mb-6 md:mb-8 lg:mb-12 text-center animate-fade-in">
                  <div class="mb-4 md:mb-6">
                    <h1 class="text-2xl md:text-h1 lg:text-display font-display font-bold text-gray-900 mb-2 md:mb-4">Encontre os Melhores Produtos</h1>
                    <p class="text-body md:text-body-lg text-gray-600 mb-4 md:mb-6 lg:mb-8 max-w-2xl mx-auto px-2">Explore nosso catálogo de empresas parceiras e descubra produtos incríveis para você</p>
                  </div>
          
          <!-- Search Bar - Full width on mobile -->
          <div class="w-full md:max-w-3xl mx-auto mb-4 md:mb-6 lg:mb-8">
            <app-catalog-search 
              (searchChange)="onSearchQueryChange($event)"
              (searchSubmit)="onSearchSubmit($event)">
            </app-catalog-search>
          </div>
          
          <!-- Mobile Filter Button -->
          <div class="md:hidden mb-4">
            <app-button 
              variant="outline"
              size="md"
              [label]="'Filtros' + (hasActiveFilters() ? ' (' + getActiveFiltersCount() + ')' : '')"
              (clicked)="showFiltersDrawer = true"
              [fullWidth]="true">
            </app-button>
          </div>
        </div>

        <!-- Results Layout - Mobile-first -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          <!-- Filters Sidebar (Desktop) -->
          <aside class="hidden lg:block" aria-label="Filtros de busca">
            <app-catalog-filters
              [isMobile]="false"
              [showDrawer]="false"
              (filtersChange)="onFiltersChange($event)">
            </app-catalog-filters>
          </aside>

          <!-- Results -->
          <div class="lg:col-span-3">

            <!-- Search Results Summary -->
            <app-card *ngIf="searchResults" variant="highlighted" [elevation]="0" padding="md" customClass="mb-6">
              <div class="flex items-center gap-2">
                <app-map-pin-icon size="sm" variant="filled" color="text-primary-light"></app-map-pin-icon>
                <p class="text-body text-primary">
                  <span class="font-semibold">{{ searchResults.total_results }}</span> resultado(s) encontrado(s)
                  <span *ngIf="searchResults.total_companies > 0"> - {{ searchResults.total_companies }} empresa(s)</span>
                  <span *ngIf="searchResults.total_products > 0"> - {{ searchResults.total_products }} produto(s)</span>
                </p>
              </div>
            </app-card>

            <!-- Companies Section -->
            <section class="mb-6 md:mb-8" *ngIf="(!searchResults && filteredCompanies && filteredCompanies.length > 0) || (searchResults && searchResults.companies.length > 0)">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">
                <div>
                  <h2 class="text-xl md:text-h1 font-display font-semibold text-gray-900">Empresas</h2>
                  <p class="text-body-sm md:text-body text-gray-600 mt-1">Explore nossos parceiros e seus produtos</p>
                </div>
                <app-badge 
                  variant="info" 
                  size="md"
                  [label]="((searchResults?.companies || filteredCompanies)?.length || 0) + ' ' + (((searchResults?.companies || filteredCompanies)?.length || 0) === 1 ? 'empresa' : 'empresas')">
                </app-badge>
              </div>

              <div *ngIf="loadingCompanies || loadingSearch" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <app-skeleton-loader *ngFor="let i of [1,2,3,4,5,6]" type="product-card"></app-skeleton-loader>
              </div>

              <app-empty-state *ngIf="!loadingCompanies && !loadingSearch && (!searchResults || (searchResults.companies.length === 0 && searchResults.products.length === 0)) && (!filteredCompanies || filteredCompanies.length === 0)"
                               title="Nenhum Resultado Encontrado"
                               message="Não encontramos empresas ou produtos que correspondam à sua busca. Tente outros termos ou ajuste os filtros."
                               [actionLabel]="'Limpar Filtros'"
                               [actionHandler]="clearAllFilters.bind(this)">
              </app-empty-state>

              <div *ngIf="!loadingCompanies && !loadingSearch && (searchResults?.companies || filteredCompanies) && (searchResults?.companies || filteredCompanies)!.length > 0" 
                   class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <app-company-card 
                  *ngFor="let company of (searchResults?.companies || filteredCompanies)"
                  [company]="company"
                  (viewProducts)="selectCompany(company)"
                  [appTrackClick]="'Company Card Click'"
                  [trackCategory]="'Catalog'"
                  [trackLabel]="company.company_name">
                </app-company-card>
              </div>
              
              <!-- Pagination - Mobile optimized -->
              <div *ngIf="totalPages > 1 && !loadingCompanies && !loadingSearch" 
                   class="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4 md:pt-6">
                <div class="text-body-sm text-gray-700 text-center sm:text-left">
                  Mostrando <span class="font-medium">{{ ((currentPage - 1) * pageSize) + 1 }}</span>
                  até <span class="font-medium">{{ Math.min(currentPage * pageSize, totalResults) }}</span>
                  de <span class="font-medium">{{ totalResults }}</span> empresas
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <app-button
                    variant="outline"
                    size="sm"
                    label="Anterior"
                    [disabled]="currentPage === 1"
                    (clicked)="previousPage()">
                  </app-button>
                  <div class="flex items-center gap-1 overflow-x-auto">
                    <button
                      *ngFor="let page of getPageNumbers()"
                      (click)="goToPage(page)"
                      [class.bg-primary]="page === currentPage"
                      [class.text-white]="page === currentPage"
                      [class.bg-white]="page !== currentPage"
                      [class.text-gray-700]="page !== currentPage"
                      class="min-w-[44px] min-h-[44px] px-3 py-2 text-sm font-medium border border-gray-300 rounded-medium active:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:bg-gray-50 transition-all">
                      {{ page }}
                    </button>
                  </div>
                  <app-button
                    variant="outline"
                    size="sm"
                    label="Próxima"
                    [disabled]="currentPage === totalPages"
                    (clicked)="nextPage()">
                  </app-button>
                </div>
              </div>
            </section>

                    <!-- Products Section -->
                    <section class="mb-6 md:mb-12" *ngIf="searchResults && searchResults.products.length > 0">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">
                        <div>
                          <h2 class="text-xl md:text-h1 font-display font-semibold text-gray-900">Produtos</h2>
                          <p class="text-body-sm md:text-body text-gray-600 mt-1">Produtos encontrados na busca</p>
                        </div>
                <app-badge 
                  variant="secondary" 
                  size="md"
                  [label]="searchResults.products.length + ' ' + (searchResults.products.length === 1 ? 'produto' : 'produtos')">
                </app-badge>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <app-product-card 
                  *ngFor="let product of searchResults.products"
                  [product]="convertProductToCardData(product)"
                  [accountId]="getCurrentAccountId() || undefined"
                  (addToCart)="onProductAddToCart($event)"
                  (viewDetails)="goToProductDetails($event)">
                </app-product-card>
              </div>
            </section>
          </div>
        </div>

        <!-- Mobile Filters Drawer -->
        <app-catalog-filters
          [isMobile]="true"
          [showDrawer]="showFiltersDrawer"
          (filtersChange)="onFiltersChange($event)"
          (drawerClose)="showFiltersDrawer = false">
        </app-catalog-filters>

      </main>
    </div>
  `,
  styles: []
})
export class CatalogComponent implements OnInit, OnDestroy {
  companies: Company[] | null = null;
  filteredCompanies: Company[] | null = null;
  searchResults: CatalogSearchResponse | null = null;
  loadingCompanies = false;
  loadingSearch = false;
  error: string | null = null;
  isAuthenticated = false;
  searchTerm = '';
  showFiltersDrawer = false;
  currentFilters: SearchFilters = {};
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  totalResults = 0;
  
  // Company appearances cache
  companyAppearances: Map<string, Company['appearance']> = new Map();
  
  // Expose Math to template
  Math = Math;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService,
    public router: Router,
    private seoService: SEOService,
    private performanceService: PerformanceService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Update SEO
    this.seoService.updateTags({
      title: 'Catálogo de Empresas - Adalana',
      description: 'Explore nosso catálogo de empresas parceiras e encontre os melhores produtos e serviços',
      url: window.location.href
    });
    
    // Track page load performance
    this.performanceService.measurePerformance('Catalog Page Load', () => {
      this.loadCompanies();
    });
    
    // Setup debounced search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentFilters.query = term;
      this.performSearch();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  loadCompanies(): void {
    this.loadingCompanies = true;
    this.catalogService.getActiveCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.totalResults = companies.length;
        this.totalPages = Math.ceil(companies.length / this.pageSize);
        this.applyPagination();
        this.loadCompanyAppearances(this.filteredCompanies || []);
        this.loadingCompanies = false;
      },
      error: (err) => {
        console.error('Error loading companies', err);
        this.error = 'Erro ao carregar empresas';
        this.loadingCompanies = false;
      }
    });
  }

  onSearchQueryChange(query: string): void {
    this.currentFilters.query = query;
    this.searchSubject.next(query);
  }

  onSearchSubmit(query: string): void {
    this.currentFilters.query = query;
    this.performSearch();
  }

  onFiltersChange(filters: SearchFilters): void {
    this.currentFilters = { ...this.currentFilters, ...filters };
    this.currentPage = 1; // Reset to first page when filters change
    this.performSearch();
  }

  performSearch(): void {
    // Check if we have any active filters or search query
    const hasFilters = this.currentFilters.query || 
                      this.currentFilters.category || 
                      this.currentFilters.type || 
                      this.currentFilters.minPrice !== undefined || 
                      this.currentFilters.maxPrice !== undefined ||
                      this.currentFilters.distance !== undefined ||
                      this.currentFilters.rating !== undefined ||
                      this.currentFilters.hasSubscriptionClub !== undefined;

    if (hasFilters) {
      this.loadingSearch = true;
      this.searchResults = null;
      
      // Add pagination to filters
      const searchFilters: SearchFilters = {
        ...this.currentFilters,
        page: this.currentPage,
        size: this.pageSize
      };
      
      this.catalogService.search(searchFilters).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.totalResults = results.total_results;
          this.totalPages = Math.ceil(results.total_companies / this.pageSize);
          this.loadingSearch = false;
          
          // Load company appearances
          this.loadCompanyAppearances(results.companies);
          
          // Apply sorting if specified
          if (this.currentFilters.sortBy) {
            this.applySorting(results);
          }
        },
        error: (err) => {
          console.error('Error performing search', err);
          this.error = 'Erro ao realizar busca';
          this.loadingSearch = false;
        }
      });
    } else {
      // No filters, show all companies with pagination
      this.searchResults = null;
      if (this.companies) {
        this.totalResults = this.companies.length;
        this.totalPages = Math.ceil(this.companies.length / this.pageSize);
        this.applyPagination();
        this.loadCompanyAppearances(this.filteredCompanies || []);
      }
    }
  }
  
  loadCompanyAppearances(companies: Company[]): void {
    companies.forEach(company => {
      if (!this.companyAppearances.has(company.id)) {
        this.catalogService.getCompanyAppearance(company.id).subscribe({
          next: (appearance) => {
            this.companyAppearances.set(company.id, appearance);
            // Update company object
            const companyIndex = this.companies?.findIndex(c => c.id === company.id);
            if (companyIndex !== undefined && companyIndex >= 0 && this.companies) {
              this.companies[companyIndex].appearance = appearance;
            }
            if (this.filteredCompanies) {
              const filteredIndex = this.filteredCompanies.findIndex(c => c.id === company.id);
              if (filteredIndex >= 0) {
                this.filteredCompanies[filteredIndex].appearance = appearance;
              }
            }
            if (this.searchResults) {
              const searchIndex = this.searchResults.companies.findIndex(c => c.id === company.id);
              if (searchIndex >= 0) {
                this.searchResults.companies[searchIndex].appearance = appearance;
              }
            }
          },
          error: () => {
            // Silently fail - appearance is optional
          }
        });
      }
    });
  }
  
  applyPagination(): void {
    if (!this.companies) return;
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredCompanies = this.companies.slice(startIndex, endIndex);
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.performSearch();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  applySorting(results: CatalogSearchResponse): void {
    if (!this.currentFilters.sortBy) return;

    switch (this.currentFilters.sortBy) {
      case 'price':
        results.products.sort((a, b) => a.price_cents - b.price_cents);
        results.companies.sort((a, b) => {
          const aPrice = a.averagePrice ? parseFloat(a.averagePrice.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
          const bPrice = b.averagePrice ? parseFloat(b.averagePrice.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
          return aPrice - bPrice;
        });
        break;
      case 'distance':
        results.companies.sort((a, b) => {
          const aDist = a.distance || Infinity;
          const bDist = b.distance || Infinity;
          return aDist - bDist;
        });
        break;
      case 'rating':
        results.companies.sort((a, b) => {
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          return bRating - aRating; // Descending
        });
        break;
      case 'relevance':
        // Keep original order (server-side relevance)
        break;
    }
  }

  clearAllFilters(): void {
    this.currentFilters = {};
    this.searchTerm = '';
    this.searchResults = null;
    this.currentPage = 1;
    if (this.companies) {
      this.totalResults = this.companies.length;
      this.totalPages = Math.ceil(this.companies.length / this.pageSize);
      this.applyPagination();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.currentFilters.category || 
              this.currentFilters.type || 
              this.currentFilters.minPrice !== undefined || 
              this.currentFilters.maxPrice !== undefined ||
              this.currentFilters.sortBy ||
              this.currentFilters.distance !== undefined ||
              this.currentFilters.rating !== undefined ||
              this.currentFilters.hasSubscriptionClub !== undefined);
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.currentFilters.category) count++;
    if (this.currentFilters.type) count++;
    if (this.currentFilters.minPrice !== undefined) count++;
    if (this.currentFilters.maxPrice !== undefined) count++;
    if (this.currentFilters.sortBy) count++;
    if (this.currentFilters.distance !== undefined) count++;
    if (this.currentFilters.rating !== undefined) count++;
    if (this.currentFilters.hasSubscriptionClub !== undefined) count++;
    return count;
  }
  
  getCompanyCardStyle(company: Company): any {
    const appearance = company.appearance || this.companyAppearances.get(company.id);
    if (!appearance) return {};
    
    return {
      '--company-primary': appearance.primaryColor || '#3B82F6',
      '--company-secondary': appearance.secondaryColor || '#60A5FA',
      '--company-accent': appearance.accentColor || '#F472B6'
    };
  }
  
  getCompanyCardClasses(company: Company): string {
    const appearance = company.appearance || this.companyAppearances.get(company.id);
    if (!appearance) return '';
    
    return appearance.theme === 'dark' ? 'dark-theme' : '';
  }

  selectCompany(company: Company): void {
    // Navigate to company page instead of showing products inline
    this.router.navigate(['/catalog/companies', company.id]);
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
      img.style.display = 'none';
      // The fallback div with initial letter will be shown automatically
    }
  }

  getCurrentAccountId(): string | null {
    // Try to get accountId from route or first company
    if (this.companies && this.companies.length > 0) {
      return this.companies[0].id;
    }
    return null;
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
    // Navigate to company page or add to cart
    if (productCardData.companyId) {
      this.router.navigate(['/catalog/companies', productCardData.companyId]);
    }
  }
}
