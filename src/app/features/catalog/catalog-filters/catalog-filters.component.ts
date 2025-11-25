import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService, Category, SearchFilters } from '../../../core/services/catalog.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-catalog-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Mobile Drawer -->
    <div *ngIf="isMobile && showDrawer" 
         class="fixed inset-0 z-50 lg:hidden"
         (click)="closeDrawer()">
      <div class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
           (click)="$event.stopPropagation()">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Filtros</h2>
            <button (click)="closeDrawer()"
                    aria-label="Fechar filtros"
                    class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-6">
            <ng-container *ngTemplateOutlet="filterSection"></ng-container>
          </div>
          
          <div class="mt-8 flex gap-3">
            <button (click)="clearFilters()"
                    class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Limpar
            </button>
            <button (click)="applyFilters()"
                    class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <div *ngIf="!isMobile && !showDrawer" class="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 sticky top-24">
      <div class="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 class="text-h3 font-display font-semibold text-primary">Filtros</h2>
      </div>
      
      <div class="space-y-6">
        <ng-container *ngTemplateOutlet="filterSection"></ng-container>
      </div>
      
      <button (click)="clearFilters()"
              class="w-full mt-6 py-2.5 px-4 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 border border-gray-200 transition-all hover:border-gray-300">
        <span class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar Filtros
        </span>
      </button>
    </div>

    <!-- Filter Section Template -->
    <ng-template #filterSection>
      <!-- Category Filter -->
      <div>
        <label class="block text-body-sm font-semibold text-primary mb-2">Categoria</label>
        <select [(ngModel)]="filters.category"
                (ngModelChange)="onFilterChange()"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary transition-all text-body-sm">
          <option value="">Todas as categorias</option>
          <option *ngFor="let cat of categories" [value]="cat.name">
            {{ cat.name }} ({{ cat.count }})
          </option>
        </select>
      </div>

      <!-- Type Filter -->
      <div>
        <label class="block text-body-sm font-semibold text-primary mb-2">Tipo</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" 
                   [(ngModel)]="filters.type"
                   (ngModelChange)="onFilterChange()"
                   value=""
                   name="type"
                   class="mr-2">
            <span>Todos</span>
          </label>
          <label class="flex items-center">
            <input type="radio" 
                   [(ngModel)]="filters.type"
                   (ngModelChange)="onFilterChange()"
                   value="subscription"
                   name="type"
                   class="mr-2">
            <span>Apenas Assinaturas</span>
          </label>
          <label class="flex items-center">
            <input type="radio" 
                   [(ngModel)]="filters.type"
                   (ngModelChange)="onFilterChange()"
                   value="single_order"
                   name="type"
                   class="mr-2">
            <span>Apenas Pedidos Únicos</span>
          </label>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Faixa de Preço</label>
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Preço Mínimo (centavos)</label>
            <input type="number"
                   [(ngModel)]="filters.minPrice"
                   (ngModelChange)="onFilterChange()"
                   placeholder="0"
                   min="0"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Preço Máximo (centavos)</label>
            <input type="number"
                   [(ngModel)]="filters.maxPrice"
                   (ngModelChange)="onFilterChange()"
                   placeholder="Sem limite"
                   min="0"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>
        <div *ngIf="filters.minPrice || filters.maxPrice" class="mt-2 text-xs text-gray-500">
          {{ formatPriceRange() }}
        </div>
      </div>

      <!-- Distance Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Distância Máxima (km)</label>
        <input type="number"
               [(ngModel)]="filters.distance"
               (ngModelChange)="onFilterChange()"
               placeholder="Sem limite"
               min="0"
               step="1"
               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>

      <!-- Rating Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Avaliação Mínima</label>
        <select [(ngModel)]="filters.rating"
                (ngModelChange)="onFilterChange()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option [value]="undefined">Todas</option>
          <option [value]="4">4+ estrelas</option>
          <option [value]="3">3+ estrelas</option>
          <option [value]="2">2+ estrelas</option>
          <option [value]="1">1+ estrela</option>
        </select>
      </div>

      <!-- Subscription Club Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Clube de Assinatura</label>
        <label class="flex items-center">
          <input type="checkbox"
                 [(ngModel)]="filters.hasSubscriptionClub"
                 (ngModelChange)="onFilterChange()"
                 class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
          <span>Apenas empresas com clube de assinatura</span>
        </label>
      </div>

      <!-- Sort Options -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Ordenar por</label>
        <select [(ngModel)]="filters.sortBy"
                (ngModelChange)="onFilterChange()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="relevance">Relevância</option>
          <option value="distance">Distância</option>
          <option value="rating">Avaliação</option>
          <option value="price">Preço</option>
        </select>
      </div>
    </ng-template>
  `,
  styles: []
})
export class CatalogFiltersComponent implements OnInit {
  @Input() isMobile = false;
  @Input() showDrawer = false;
  @Output() filtersChange = new EventEmitter<SearchFilters>();
  @Output() drawerClose = new EventEmitter<void>();
  
  filters: SearchFilters = {};
  categories: Category[] = [];
  loadingCategories = false;

  constructor(private catalogService: CatalogService) {}

  ngOnInit(): void {
    this.loadCategories();
    // Only detect mobile if isMobile was not explicitly set via @Input
    // The parent component should control this via @Input
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.catalogService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.loadingCategories = false;
      }
    });
  }

  onFilterChange(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  applyFilters(): void {
    this.filtersChange.emit({ ...this.filters });
    this.closeDrawer();
  }

  clearFilters(): void {
    this.filters = {
      sortBy: 'relevance' // Keep default sort
    };
    this.filtersChange.emit({ ...this.filters });
    if (this.isMobile) {
      this.closeDrawer();
    }
  }

  closeDrawer(): void {
    this.drawerClose.emit();
  }

  formatPriceRange(): string {
    const min = this.filters.minPrice ? FormatUtil.formatCurrency(this.filters.minPrice) : 'R$ 0';
    const max = this.filters.maxPrice ? FormatUtil.formatCurrency(this.filters.maxPrice) : 'Sem limite';
    return `${min} - ${max}`;
  }
}
