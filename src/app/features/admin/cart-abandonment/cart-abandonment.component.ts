import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { AccountService } from '../../../core/services/account.service';
import { CartAbandonmentTrackingService, CartAbandonmentMetrics, AbandonedCart } from '../../../core/services/cart-abandonment-tracking.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-cart-abandonment',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, BadgeComponent],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h1 class="text-h1 text-primary">Analytics de Abandono de Carrinho</h1>
        <p class="text-body text-gray-600 mt-1">Acompanhe e recupere carrinhos abandonados</p>
      </div>

      <!-- Filtros -->
      <app-card [elevation]="1" padding="md" customClass="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-body-sm font-medium mb-2">Data Inicial</label>
            <input type="date" 
                   [(ngModel)]="startDate"
                   (change)="loadMetrics()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent">
          </div>
          <div>
            <label class="block text-body-sm font-medium mb-2">Data Final</label>
            <input type="date" 
                   [(ngModel)]="endDate"
                   (change)="loadMetrics()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent">
          </div>
          <div>
            <label class="block text-body-sm font-medium mb-2">Estágio</label>
            <select [(ngModel)]="selectedStage"
                    (change)="loadCarts()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent">
              <option value="">Todos</option>
              <option value="cart">Carrinho</option>
              <option value="checkout_address">Endereço</option>
              <option value="checkout_payment">Pagamento</option>
              <option value="checkout_review">Revisão</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="outline" 
                        label="Limpar Filtros" 
                        [fullWidth]="true"
                        (clicked)="clearFilters()">
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- Métricas Principais -->
      <div *ngIf="metrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <app-card [elevation]="1" padding="lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-body-sm text-gray-600">Carrinhos Abandonados</span>
            <svg class="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-h1 text-error">{{ metrics.totalAbandoned }}</p>
        </app-card>

        <app-card [elevation]="1" padding="lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-body-sm text-gray-600">Recuperados</span>
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-h1 text-success">{{ metrics.totalRecovered }}</p>
        </app-card>

        <app-card [elevation]="1" padding="lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-body-sm text-gray-600">Taxa de Recuperação</span>
            <svg class="w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p class="text-h1 text-primary-light">{{ metrics.recoveryRate.toFixed(1) }}%</p>
        </app-card>

        <app-card [elevation]="1" padding="lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-body-sm text-gray-600">Receita Perdida</span>
            <svg class="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-h1 text-warning">{{ formatCurrency(metrics.totalLostRevenue) }}</p>
        </app-card>
      </div>

      <!-- Gráficos e Distribuições -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Abandono por Estágio -->
        <app-card [elevation]="1" padding="lg">
          <h3 class="text-h3 mb-4">Abandono por Estágio</h3>
          <div class="space-y-3">
            <div *ngFor="let stage of metrics?.abandonmentByStage || []" class="space-y-1">
              <div class="flex justify-between text-body-sm">
                <span class="text-gray-700">{{ getStageLabel(stage.stage) }}</span>
                <span class="font-medium">{{ stage.count }} ({{ stage.percentage.toFixed(1) }}%)</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-light h-2 rounded-full transition-all"
                     [style.width.%]="stage.percentage">
                </div>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Abandono por Período -->
        <app-card [elevation]="1" padding="lg">
          <h3 class="text-h3 mb-4">Abandono por Período</h3>
          <div class="space-y-3">
            <div *ngFor="let range of metrics?.abandonmentByTimeRange || []" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-body text-gray-700">{{ range.range }}</span>
              <app-badge variant="error" [label]="range.count.toString()"></app-badge>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Lista de Carrinhos Abandonados -->
      <app-card [elevation]="1" padding="lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-h3">Carrinhos Abandonados</h3>
          <app-button variant="outline" 
                      size="sm"
                      label="Atualizar" 
                      (clicked)="loadCarts()">
          </app-button>
        </div>

        <div *ngIf="loadingCarts" class="text-center py-8 text-gray-500">
          Carregando...
        </div>

        <div *ngIf="!loadingCarts && abandonedCarts.length === 0" class="text-center py-8 text-gray-500">
          <p>Nenhum carrinho abandonado encontrado no período selecionado.</p>
        </div>

        <div *ngIf="!loadingCarts && abandonedCarts.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-body-sm font-medium text-gray-700">Data</th>
                <th class="text-left py-3 px-4 text-body-sm font-medium text-gray-700">Estágio</th>
                <th class="text-left py-3 px-4 text-body-sm font-medium text-gray-700">Valor</th>
                <th class="text-left py-3 px-4 text-body-sm font-medium text-gray-700">Tempo</th>
                <th class="text-left py-3 px-4 text-body-sm font-medium text-gray-700">Status</th>
                <th class="text-left py-3 px-4 text-body-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cart of abandonedCarts" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 text-body-sm">{{ formatDate(cart.abandonedAt) }}</td>
                <td class="py-3 px-4">
                  <app-badge [variant]="getStageVariant(cart.stage)" 
                             [label]="getStageLabel(cart.stage)">
                  </app-badge>
                </td>
                <td class="py-3 px-4 text-body-sm font-medium">{{ formatCurrency(cart.cartValue) }}</td>
                <td class="py-3 px-4 text-body-sm">{{ formatTime(cart.timeSpentSeconds) }}</td>
                <td class="py-3 px-4">
                  <app-badge [variant]="cart.completed ? 'success' : 'error'"
                             [label]="cart.completed ? 'Recuperado' : 'Abandonado'">
                  </app-badge>
                </td>
                <td class="py-3 px-4">
                  <button *ngIf="!cart.completed"
                          (click)="sendRecoveryEmail(cart)"
                          class="text-primary-light hover:text-primary-light text-body-sm font-medium">
                    Enviar Email
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class CartAbandonmentComponent implements OnInit {
  metrics: CartAbandonmentMetrics | null = null;
  abandonedCarts: AbandonedCart[] = [];
  loading = false;
  loadingCarts = false;
  accountId: string | null = null;
  
  // Filters
  startDate: string = '';
  endDate: string = '';
  selectedStage: string = '';

  constructor(
    private accountService: AccountService,
    private abandonmentService: CartAbandonmentTrackingService
  ) {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    this.accountService.getMyAccount().subscribe({
      next: (account) => {
        this.accountId = account.id;
        this.loadMetrics();
        this.loadCarts();
      },
      error: (err) => {
        console.error('Error loading account', err);
      }
    });
  }

  loadMetrics(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    this.abandonmentService.getMetrics(this.accountId, this.startDate, this.endDate).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading metrics', err);
        this.loading = false;
      }
    });
  }

  loadCarts(): void {
    if (!this.accountId) return;
    
    this.loadingCarts = true;
    const filters: any = {};
    if (this.selectedStage) filters.stage = this.selectedStage;
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;
    
    this.abandonmentService.getAbandonedCarts(this.accountId, filters).subscribe({
      next: (carts) => {
        this.abandonedCarts = carts;
        this.loadingCarts = false;
      },
      error: (err) => {
        console.error('Error loading abandoned carts', err);
        this.loadingCarts = false;
      }
    });
  }

  clearFilters(): void {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];
    this.selectedStage = '';
    this.loadMetrics();
    this.loadCarts();
  }

  getStageLabel(stage: string): string {
    const labels: { [key: string]: string } = {
      'cart': 'Carrinho',
      'checkout_address': 'Endereço',
      'checkout_payment': 'Pagamento',
      'checkout_review': 'Revisão'
    };
    return labels[stage] || stage;
  }

  getStageVariant(stage: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const variants: { [key: string]: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral' } = {
      'cart': 'info',
      'checkout_address': 'warning',
      'checkout_payment': 'error',
      'checkout_review': 'accent'
    };
    return variants[stage] || 'neutral';
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;
  }

  sendRecoveryEmail(cart: AbandonedCart): void {
    // TODO: Implement email sending
    console.log('Sending recovery email for cart:', cart.id);
  }
}

