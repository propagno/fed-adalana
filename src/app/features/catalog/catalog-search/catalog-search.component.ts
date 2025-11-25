import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CatalogService, SearchFilters } from '../../../core/services/catalog.service';

@Component({
  selector: 'app-catalog-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="relative">
        <input 
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          (focus)="showSuggestions = true"
          (blur)="onBlur()"
          placeholder="Buscar empresas e produtos..."
          aria-label="Buscar no catalogo"
          class="w-full pl-12 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 text-body placeholder:text-gray-400 shadow-sm hover:shadow-md"
          [class.border-primary]="showSuggestions && suggestions.length > 0"
          [class.bg-white]="showSuggestions">
        <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button 
          *ngIf="searchQuery"
          (click)="clearSearch()"
          aria-label="Limpar busca"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-0.5">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div *ngIf="showSuggestions && suggestions.length > 0" class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto">
        <div class="p-2">
          <ng-container *ngFor="let suggestion of suggestions; let i = index">
            <div [class]="'px-4 py-2.5 hover:bg-primary/5 cursor-pointer rounded-lg transition-all duration-150 ' + (highlightedIndex === i ? 'bg-primary/10' : '')" (click)="selectSuggestion(suggestion)" tabindex="0">
              <div class="flex items-center gap-3">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span class="text-gray-900 text-body-sm">{{ suggestion }}</span>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
      
      <div *ngIf="showSuggestions && suggestions.length === 0 && recentSearches.length > 0 && !searchQuery" class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100">
        <div class="p-4">
          <h3 class="text-body-sm font-semibold text-gray-700 mb-3">Buscas Recentes</h3>
          <div class="space-y-1">
            <button *ngFor="let recent of recentSearches"
                    (click)="selectSuggestion(recent)"
                    class="w-full text-left px-3 py-2 text-body-sm text-gray-600 hover:bg-primary/5 hover:text-primary rounded-lg transition-all duration-150">
              {{ recent }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CatalogSearchComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Buscar empresas e produtos...';
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  
  searchQuery = '';
  showSuggestions = false;
  suggestions: string[] = [];
  recentSearches: string[] = [];
  highlightedIndex = -1;
  
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private readonly RECENT_SEARCHES_KEY = 'catalog_recent_searches';
  private readonly MAX_RECENT_SEARCHES = 5;

  constructor(private catalogService: CatalogService) {}

  ngOnInit(): void {
    this.loadRecentSearches();
    
    // Debounce search input
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchChange.emit(query);
      this.generateSuggestions(query);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
    this.highlightedIndex = -1;
    
    if (query.trim().length > 0) {
      this.showSuggestions = true;
    }
  }

  generateSuggestions(query: string): void {
    if (!query || query.trim().length < 2) {
      this.suggestions = [];
      return;
    }

    // Simple suggestion generation based on recent searches
    // In a real app, this would call an autocomplete API
    const queryLower = query.toLowerCase();
    this.suggestions = this.recentSearches
      .filter(recent => recent.toLowerCase().includes(queryLower))
      .slice(0, 5);
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.saveRecentSearch(suggestion);
    this.searchSubmit.emit(suggestion);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.searchChange.emit('');
  }

  onBlur(): void {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  highlightNext(event: Event, index: number): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    if (this.suggestions.length > 0) {
      this.highlightedIndex = Math.min(index + 1, this.suggestions.length - 1);
    }
  }

  highlightPrevious(event: Event, index: number): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.highlightedIndex = Math.max(index - 1, -1);
  }

  getSuggestionAriaLabel(suggestion: string): string {
    return 'Sugestao: ' + suggestion;
  }

  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem(this.RECENT_SEARCHES_KEY);
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading recent searches', e);
    }
  }

  private saveRecentSearch(search: string): void {
    if (!search || search.trim().length === 0) return;
    
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => s !== search);
    
    // Add to beginning
    this.recentSearches.unshift(search.trim());
    
    // Keep only max items
    this.recentSearches = this.recentSearches.slice(0, this.MAX_RECENT_SEARCHES);
    
    try {
      localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    } catch (e) {
      console.error('Error saving recent searches', e);
    }
  }
}
