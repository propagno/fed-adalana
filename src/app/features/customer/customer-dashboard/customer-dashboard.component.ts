import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService, Subscription } from '../../../core/services/subscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p class="text-sm text-gray-600 mt-1">Bem-vindo, {{ getUserName() }}!</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="card">
          <div class="text-sm text-gray-600 mb-1">Assinaturas Ativas</div>
          <div class="text-3xl font-bold text-primary">{{ activeSubscriptionsCount }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-600 mb-1">Total de Assinaturas</div>
          <div class="text-3xl font-bold text-gray-900">{{ subscriptions.length }}</div>
        </div>
        <div class="card">
          <div class="text-sm text-gray-600 mb-1">Próxima Entrega</div>
          <div class="text-lg font-semibold text-gray-900">
            {{ nextDeliveryDate ? formatDate(nextDeliveryDate) : 'N/A' }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Próximas Entregas</h3>
          <div *ngIf="loading" class="text-center py-4 text-gray-500">Carregando...</div>
          <div *ngIf="!loading && upcomingSubscriptions.length === 0" class="text-center py-4 text-gray-500">
            Nenhuma entrega programada
          </div>
          <div *ngIf="!loading && upcomingSubscriptions.length > 0" class="space-y-3">
            <div *ngFor="let sub of upcomingSubscriptions" class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium text-gray-900">{{ sub.product_name || 'Produto' }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(sub.next_delivery) }}</div>
              </div>
              <div class="text-sm font-medium text-gray-700">Qtd: {{ sub.quantity }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div class="space-y-3">
            <a routerLink="/customer/subscriptions" class="block btn-primary text-center">
              Ver Todas as Assinaturas
            </a>
            <a routerLink="/customer/orders" class="block btn-secondary text-center">
              Ver Meus Pedidos
            </a>
            <a routerLink="/catalog" class="block btn-secondary text-center">
              Explorar Produtos
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerDashboardComponent implements OnInit {
  subscriptions: Subscription[] = [];
  loading = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading subscriptions', err);
        this.loading = false;
      }
    });
  }

  get activeSubscriptionsCount(): number {
    return this.subscriptions.filter(s => s.status === 'active').length;
  }

  get nextDeliveryDate(): string | null {
    const activeSubs = this.subscriptions
      .filter(s => s.status === 'active')
      .map(s => s.next_delivery)
      .sort();
    return activeSubs.length > 0 ? activeSubs[0] : null;
  }

  get upcomingSubscriptions(): Subscription[] {
    return this.subscriptions
      .filter(s => s.status === 'active')
      .sort((a, b) => a.next_delivery.localeCompare(b.next_delivery))
      .slice(0, 5);
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.email?.split('@')[0] || 'Cliente';
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }
}

