import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { SkeletonLoaderComponent } from '../../skeleton/skeleton-loader.component';
import { EmptyStateComponent } from '../../empty-state/empty-state.component';

@Component({
  selector: 'app-data-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    InputComponent, 
    ButtonComponent, 
    SkeletonLoaderComponent, 
    EmptyStateComponent
  ],
  template: `
    <div class="space-y-4">
      <!-- Filters Bar -->
      <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm" *ngIf="showFilters || showSearch">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1" *ngIf="showSearch">
            <app-input 
              [placeholder]="searchPlaceholder"
              [fullWidth]="true"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch($event)">
            </app-input>
          </div>
          <div class="flex gap-2 items-end overflow-x-auto pb-1 md:pb-0">
            <ng-content select="[filters]"></ng-content>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="relative min-h-[200px]">
        <!-- Loading -->
        <div *ngIf="loading" class="space-y-4">
          <app-skeleton-loader *ngFor="let i of [1,2,3]" type="card"></app-skeleton-loader>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && items.length === 0">
          <app-empty-state
            [title]="emptyTitle"
            [message]="emptyMessage"
            [actionLabel]="emptyActionLabel"
            (action)="emptyAction.emit()">
          </app-empty-state>
        </div>

        <!-- Data -->
        <div *ngIf="!loading && items.length > 0">
          <div class="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm" *ngIf="tableTemplate">
             <ng-container *ngTemplateOutlet="tableTemplate; context: { $implicit: items }"></ng-container>
          </div>
          
          <!-- Mobile View / Card View -->
          <div class="md:hidden space-y-4" *ngIf="cardTemplate">
             <ng-container *ngFor="let item of items">
               <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
             </ng-container>
          </div>
          
          <!-- Fallback if no templates provided -->
          <div *ngIf="!tableTemplate && !cardTemplate" class="p-4 text-center text-gray-500">
            No template provided for data display.
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && items.length > 0 && totalPages > 1" class="flex justify-between items-center pt-4 border-t border-gray-200">
        <div class="text-sm text-gray-600">
          Página {{ currentPage + 1 }} de {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <app-button 
            variant="ghost" 
            size="sm" 
            label="Anterior" 
            [disabled]="currentPage === 0"
            (clicked)="pageChange.emit(currentPage - 1)">
          </app-button>
          <app-button 
            variant="ghost" 
            size="sm" 
            label="Próxima" 
            [disabled]="currentPage >= totalPages - 1"
            (clicked)="pageChange.emit(currentPage + 1)">
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class DataListComponent {
  @Input() items: any[] = [];
  @Input() loading = false;
  @Input() showFilters = true;
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() emptyTitle = 'Nenhum item encontrado';
  @Input() emptyMessage = 'Não encontramos dados para exibir.';
  @Input() emptyActionLabel = '';
  
  @Input() currentPage = 0;
  @Input() totalPages = 0;

  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() emptyAction = new EventEmitter<void>();

  @ContentChild('tableTemplate') tableTemplate?: TemplateRef<any>;
  @ContentChild('cardTemplate') cardTemplate?: TemplateRef<any>;

  searchTerm = '';

  onSearch(term: string) {
    this.search.emit(term);
  }
}

