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
         class="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
         (click)="closeDrawer()">
      <div class="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300"
           [class.translate-x-0]="showDrawer"
           [class.translate-x-full]="!showDrawer"
           (click)="$event.stopPropagation()">
        <div class="p-6">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-xl font-display font-bold text-gray-900">Filtros</h2>
            <button (click)="closeDrawer()"
                    aria-label="Fechar filtros"
                    class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-8">
            <ng-container *ngTemplateOutlet="filterSection"></ng-container>
          </div>
          
          <div class="mt-8 pt-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white pb-6">
            <button (click)="clearFilters()"
                    class="flex-1 py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200">
              Limpar
            </button>
            <button (click)="applyFilters()"
                    class="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <div *ngIf="!isMobile && !showDrawer" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 transition-all duration-300 hover:shadow-md">
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div class="p-2 bg-primary/5 rounded-lg text-primary">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <h2 class="text-lg font-display font-bold text-gray-900">Filtros</h2>
      </div>
      
      <div class="space-y-8">
        <ng-container *ngTemplateOutlet="filterSection"></ng-container>
      </div>
      
      <button (click)="clearFilters()"
              class="w-full mt-8 py-3 px-4 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 border border-gray-200 transition-all hover:text-gray-900 group">
        <span class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Limpar Filtros
        </span>
      </button>
    </div>

    <!-- Filter Section Template -->
    <ng-template #filterSection>
      <!-- Category Filter -->
      <div>
        <label class="block text-sm font-bold text-gray-900 mb-3">Categoria</label>
        
        <div *ngIf="loadingCategories" class="animate-pulse space-y-2">
          <div class="h-10 bg-gray-100 rounded-lg w-full"></div>
        </div>

        <div *ngIf="!loadingCategories" class="relative">
          <select [(ngModel)]="filters.category"
                  (ngModelChange)="onFilterChange()"
                  class="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer hover:bg-gray-100">
            <option value="">Todas as categorias</option>
            <option *ngFor="let cat of categories" [value]="cat.name">
              {{ cat.name }} ({{ cat.count }})
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <!-- Type Filter -->
      <div>
        <label class="block text-sm font-bold text-gray-900 mb-3">Tipo de Pedido</label>
        <div class="space-y-3">
          <label class="flex items-center group cursor-pointer">
            <div class="relative flex items-center">
              <input type="radio" 
                     [(ngModel)]="filters.type"
                     (ngModelChange)="onFilterChange()"
                     value=""
                     name="type"
                     class="peer sr-only">
              <div class="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-primary peer-checked:border-[6px] transition-all"></div>
            </div>
            <span class="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Todos</span>
          </label>
          
          <label class="flex items-center group cursor-pointer">
            <div class="relative flex items-center">
              <input type="radio" 
                     [(ngModel)]="filters.type"
                     (ngModelChange)="onFilterChange()"
                     value="subscription"
                     name="type"
                     class="peer sr-only">
              <div class="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-primary peer-checked:border-[6px] transition-all"></div>
            </div>
            <span class="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Apenas Assinaturas</span>
          </label>
          
          <label class="flex items-center group cursor-pointer">
            <div class="relative flex items-center">
              <input type="radio" 
                     [(ngModel)]="filters.type"
                     (ngModelChange)="onFilterChange()"
                     value="single_order"
                     name="type"
                     class="peer sr-only">
              <div class="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-primary peer-checked:border-[6px] transition-all"></div>
            </div>
            <span class="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Apenas Pedidos Únicos</span>
          </label>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div>
        <label class="block text-sm font-bold text-gray-900 mb-3">Faixa de Preço</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Mínimo</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
              <input type="number"
                     [(ngModel)]="filters.minPrice"
                     (ngModelChange)="onFilterChange()"
                     placeholder="0"
                     min="0"
                     class="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all">
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Máximo</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
              <input type="number"
                     [(ngModel)]="filters.maxPrice"
                     (ngModelChange)="onFilterChange()"
                     placeholder="Max"
                     min="0"
                     class="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all">
            </div>
          </div>
        </div>
        <div *ngIf="filters.minPrice || filters.maxPrice" class="mt-2 text-xs font-medium text-primary bg-primary/5 py-1 px-2 rounded inline-block">
          {{ formatPriceRange() }}
        </div>
      </div>

      <!-- Distance Filter -->
      <div>
        <label class="block text-sm font-bold text-gray-900 mb-3">Distância</label>
        <div class="relative">
          <input type="range"
                 [(ngModel)]="filters.distance"
                 (ngModelChange)="onFilterChange()"
                 min="1"
                 max="50"
                 step="1"
                 class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
          <div class="flex justify-between mt-2 text-xs text-gray-500 font-medium">
            <span>1km</span>
            <span class="text-primary">{{ filters.distance || 'Sem limite' }} {{ filters.distance ? 'km' : '' }}</span>
            <span>50km</span>
          </div>
        </div>
      </div>

      <!-- Rating Filter -->
      <div>
        <label class="block text-sm font-bold text-gray-900 mb-3">Avaliação</label>
        <div class="relative">
          <select [(ngModel)]="filters.rating"
                  (ngModelChange)="onFilterChange()"
                  class="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer hover:bg-gray-100">
            <option [value]="undefined">Todas as avaliações</option>
            <option [value]="4">⭐⭐⭐⭐ 4+ estrelas</option>
            <option [value]="3">⭐⭐⭐ 3+ estrelas</option>
            <option [value]="2">⭐⭐ 2+ estrelas</option>
            <option [value]="1">⭐ 1+ estrela</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <!-- Subscription Club Filter -->
      <div>
        <label class="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
          <div class="relative flex items-center">
            <input type="checkbox"
                   [(ngModel)]="filters.hasSubscriptionClub"
                   (ngModelChange)="onFilterChange()"
                   class="peer sr-only">
            <div class="w-5 h-5 border-2 border-gray-300 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
              <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
          <div class="ml-3">
            <span class="block text-sm font-medium text-gray-900">Clube VIP</span>
            <span class="block text-xs text-gray-500">Apenas com assinatura</span>
          </div>
        </label>
      </div>

      <!-- Sort Options -->
      <div>
        <label class="block text-sm font-bold text-gray-900 mb-3">Ordenar por</label>
        <div class="relative">
          <select [(ngModel)]="filters.sortBy"
                  (ngModelChange)="onFilterChange()"
                  class="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer hover:bg-gray-100">
            <option value="relevance">Relevância</option>
            <option value="distance">Menor Distância</option>
            <option value="rating">Melhor Avaliação</option>
            <option value="price">Menor Preço</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
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
