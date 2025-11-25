import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../design-system/button/button.component';
import { MapPinIconComponent } from '../icons/map-pin-icon.component';

export type EmptyStateType = 'default' | 'no-results' | 'no-orders' | 'no-subscriptions' | 'no-products' | 'error';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MapPinIconComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-transparent rounded-lg border border-gray-100">
      <div class="mb-6 animate-fade-in">
        <div [ngSwitch]="type">
          <!-- Default Icon -->
          <svg *ngSwitchDefault class="w-32 h-32 mx-auto text-gray-300 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          
          <!-- No Results Icon -->
          <svg *ngSwitchCase="'no-results'" class="w-32 h-32 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <!-- No Orders Icon -->
          <div *ngSwitchCase="'no-orders'" class="w-32 h-32 mx-auto text-gray-300 flex items-center justify-center">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          
          <!-- No Subscriptions Icon -->
          <div *ngSwitchCase="'no-subscriptions'" class="w-32 h-32 mx-auto text-gray-300 flex items-center justify-center">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          
          <!-- No Products Icon -->
          <div *ngSwitchCase="'no-products'" class="w-32 h-32 mx-auto text-gray-300 flex items-center justify-center">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          
          <!-- Error Icon -->
          <div *ngSwitchCase="'error'" class="w-32 h-32 mx-auto text-error/30 flex items-center justify-center">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <!-- Custom Icon -->
          <div *ngIf="icon" [innerHTML]="icon" class="w-32 h-32 mx-auto text-gray-300"></div>
        </div>
      </div>
      
      <h3 class="text-h2 font-display text-primary mb-3">{{ title }}</h3>
      <p class="text-body-lg text-gray-600 mb-8 max-w-md">{{ message }}</p>
      
      <div *ngIf="actionLabel && actionHandler" class="flex flex-col sm:flex-row gap-3">
        <app-button 
          variant="primary"
          size="lg"
          [label]="actionLabel"
          (clicked)="actionHandler()">
        </app-button>
        <app-button 
          *ngIf="secondaryActionLabel && secondaryActionHandler"
          variant="ghost"
          size="lg"
          [label]="secondaryActionLabel"
          (clicked)="secondaryActionHandler()">
        </app-button>
      </div>
    </div>
  `,
  styles: []
})
export class EmptyStateComponent {
  @Input() title: string = 'Nada por aqui';
  @Input() message: string = 'Não há itens para exibir no momento.';
  @Input() type: EmptyStateType = 'default';
  @Input() icon?: string;
  @Input() actionLabel?: string;
  @Input() actionHandler?: () => void;
  @Input() secondaryActionLabel?: string;
  @Input() secondaryActionHandler?: () => void;
}

