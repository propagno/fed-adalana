import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService, AccountAnalytics } from '../../../core/services/analytics.service';
import { AccountService, Account } from '../../../core/services/account.service';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-account-analytics',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="bg-surface shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <button (click)="goBack()" class="text-primary hover:text-primary-dark mb-2">
                ← Voltar
              </button>
              <h1 class="text-2xl font-bold text-gray-900">{{ account?.company_name || 'Analytics' }}</h1>
              <p class="text-sm text-gray-600 mt-1">Análise detalhada de performance e faturamento</p>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div *ngIf="loading" class="text-center py-12">
          <p class="text-gray-500">Carregando analytics...</p>
        </div>

        <div *ngIf="!loading && analytics" class="space-y-6">
          <!-- Resumo Financeiro -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <app-card [elevation]="2" padding="lg">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Faturamento Total</h3>
              <p class="text-3xl font-bold text-primary">
                R$ {{ formatCurrency(analytics.total_revenue) }}
              </p>
            </app-card>
            <app-card [elevation]="2" padding="lg">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Comissão da Plataforma</h3>
              <p class="text-3xl font-bold text-accent">
                R$ {{ formatCurrency(analytics.platform_commission) }}
              </p>
            </app-card>
            <app-card [elevation]="2" padding="lg">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Total de Pedidos</h3>
              <p class="text-3xl font-bold text-primary">
                {{ analytics.total_orders }}
              </p>
            </app-card>
          </div>

          <!-- Top Produtos -->
          <app-card [elevation]="2" padding="lg">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Top 10 Produtos Mais Vendidos</h2>
            <div *ngIf="analytics.top_products && analytics.top_products.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade Vendida</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faturamento</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let product of analytics.top_products">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ product.product_name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ product.total_quantity_sold }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">R$ {{ formatCurrency(product.total_revenue) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ product.order_count }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="!analytics.top_products || analytics.top_products.length === 0" class="text-center py-8 text-gray-500">
              Nenhum produto vendido ainda
            </div>
          </app-card>

          <!-- Tendência de Receita -->
          <app-card [elevation]="2" padding="lg">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Tendência de Receita (Últimos 6 Meses)</h2>
            <div *ngIf="analytics.revenue_trend && analytics.revenue_trend.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mês</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let trend of analytics.revenue_trend">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ formatMonth(trend.month) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">R$ {{ formatCurrency(trend.revenue) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">R$ {{ formatCurrency(trend.commission) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ trend.order_count }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div *ngIf="!analytics.revenue_trend || analytics.revenue_trend.length === 0" class="text-center py-8 text-gray-500">
              Nenhum dado de receita disponível
            </div>
          </app-card>

          <!-- Frequência de Pedidos -->
          <app-card [elevation]="2" padding="lg">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Frequência de Pedidos</h2>
            <div *ngIf="analytics.order_frequency" class="space-y-4">
              <div>
                <p class="text-sm text-gray-600 mb-2">Média de pedidos por dia:</p>
                <p class="text-2xl font-bold text-primary">{{ analytics.order_frequency.average_orders_per_day | number:'1.2-2' }}</p>
              </div>
              <div *ngIf="analytics.order_frequency.peak_day">
                <p class="text-sm text-gray-600 mb-2">Dia de maior movimento:</p>
                <p class="text-lg font-semibold text-primary">{{ translateDayOfWeek(analytics.order_frequency.peak_day) }}</p>
              </div>
            </div>
          </app-card>

          <!-- Pedidos por Status -->
          <app-card [elevation]="2" padding="lg">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Distribuição de Pedidos por Status</h2>
            <div *ngIf="analytics.orders_by_status && analytics.orders_by_status.status_distribution" class="space-y-2">
              <div *ngFor="let entry of getStatusEntries(analytics.orders_by_status.status_distribution)" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm font-medium text-gray-900">{{ translateStatus(entry.key) }}</span>
                <span class="text-sm text-gray-600">{{ entry.value }} pedidos</span>
              </div>
            </div>
          </app-card>
        </div>

        <div *ngIf="!loading && !analytics" class="text-center py-12">
          <p class="text-gray-500">Não foi possível carregar os analytics</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AccountAnalyticsComponent implements OnInit {
  accountId: string | null = null;
  account: Account | null = null;
  analytics: AccountAnalytics | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
    private accountService: AccountService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id');
    if (!this.accountId) {
      this.toastService.showError('ID da empresa não fornecido');
      this.goBack();
      return;
    }

    this.loadAccount();
    this.loadAnalytics();
  }

  loadAccount(): void {
    if (!this.accountId) return;
    
    this.accountService.getAccountById(this.accountId).subscribe({
      next: (account) => {
        this.account = account;
      },
      error: (err) => {
        console.error('Error loading account', err);
        this.toastService.showError('Erro ao carregar dados da empresa');
      }
    });
  }

  loadAnalytics(): void {
    if (!this.accountId) return;

    this.loading = true;
    this.analyticsService.getAccountAnalytics(this.accountId).subscribe({
      next: (analytics) => {
        this.analytics = analytics;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading analytics', err);
        this.toastService.error('Erro ao carregar analytics');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/super-admin']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  translateDayOfWeek(day: string): string {
    const days: { [key: string]: string } = {
      'MONDAY': 'Segunda-feira',
      'TUESDAY': 'Terça-feira',
      'WEDNESDAY': 'Quarta-feira',
      'THURSDAY': 'Quinta-feira',
      'FRIDAY': 'Sexta-feira',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return days[day] || day;
  }

  translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'NOTIFIED': 'Notificado',
      'CONFIRMED': 'Confirmado',
      'DELIVERED': 'Entregue',
      'FAILED': 'Falhou',
      'NOT_DELIVERED_CUSTOMER_ABSENT': 'Cliente Ausente',
      'NOT_DELIVERED_ADDRESS_ISSUE': 'Problema no Endereço',
      'NOT_DELIVERED_REFUSED': 'Recusado',
      'CANCELLED_BY_CUSTOMER': 'Cancelado pelo Cliente'
    };
    return statusMap[status] || status;
  }

  getStatusEntries(statusDistribution: { [key: string]: number }): Array<{ key: string; value: number }> {
    return Object.entries(statusDistribution).map(([key, value]) => ({ key, value }));
  }
}

