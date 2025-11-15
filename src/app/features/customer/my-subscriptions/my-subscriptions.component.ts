import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubscriptionService, Subscription } from '../../../core/services/subscription.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Minhas Assinaturas</h2>
        <p class="text-sm text-gray-600 mt-1">Gerencie suas assinaturas ativas</p>
      </div>

      <div *ngIf="loading" class="text-center py-8 text-gray-500">
        Carregando assinaturas...
      </div>

      <div *ngIf="!loading && subscriptions.length === 0" class="text-center py-12">
        <p class="text-gray-500 mb-4">Você ainda não possui assinaturas.</p>
        <a routerLink="/catalog" class="btn-primary inline-block">Explorar Produtos</a>
      </div>

      <div *ngIf="!loading && subscriptions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let subscription of subscriptions" class="card">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ subscription.product_name || 'Produto' }}</h3>
              <p *ngIf="subscription.product_sku" class="text-sm text-gray-500">SKU: {{ subscription.product_sku }}</p>
            </div>
            <span [class]="getStatusBadgeClass(subscription.status)">
              {{ getStatusLabel(subscription.status) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Quantidade:</span>
              <span class="text-sm font-medium">{{ subscription.quantity }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Intervalo:</span>
              <span class="text-sm font-medium">{{ getIntervalLabel(subscription.interval) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Próxima Entrega:</span>
              <span class="text-sm font-medium">{{ formatDate(subscription.next_delivery) }}</span>
            </div>
            <div *ngIf="subscription.start_date" class="flex justify-between">
              <span class="text-sm text-gray-600">Início:</span>
              <span class="text-sm font-medium">{{ formatDate(subscription.start_date) }}</span>
            </div>
          </div>

          <div class="flex gap-2 pt-4 border-t">
            <button *ngIf="subscription.status === 'active'" 
                    (click)="pauseSubscription(subscription)" 
                    class="btn-secondary flex-1 text-sm">
              Pausar
            </button>
            <button *ngIf="subscription.status === 'paused'" 
                    (click)="resumeSubscription(subscription)" 
                    class="btn-primary flex-1 text-sm">
              Retomar
            </button>
            <button *ngIf="subscription.status !== 'cancelled'" 
                    (click)="cancelSubscription(subscription)" 
                    class="btn-error flex-1 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MySubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  loading = false;
  error: string | null = null;

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
        this.error = 'Erro ao carregar assinaturas';
        this.loading = false;
      }
    });
  }

  pauseSubscription(subscription: Subscription): void {
    if (confirm('Tem certeza que deseja pausar esta assinatura?')) {
      const reason = prompt('Informe o motivo da pausa (opcional):') || 'Pausado pelo cliente';
      this.subscriptionService.pauseSubscription(subscription.id, {
        reason: reason,
        paused_until: undefined
      }).subscribe({
        next: () => {
          this.loadSubscriptions();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erro ao pausar assinatura';
        }
      });
    }
  }

  resumeSubscription(subscription: Subscription): void {
    this.subscriptionService.resumeSubscription(subscription.id).subscribe({
      next: () => {
        this.loadSubscriptions();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao retomar assinatura';
      }
    });
  }

  cancelSubscription(subscription: Subscription): void {
    if (confirm('Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.')) {
      const reason = prompt('Informe o motivo do cancelamento (opcional):') || undefined;
      this.subscriptionService.cancelSubscription(subscription.id, reason).subscribe({
        next: () => {
          this.loadSubscriptions();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erro ao cancelar assinatura';
        }
      });
    }
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Ativa',
      paused: 'Pausada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      active: 'badge-success',
      paused: 'badge-warning',
      cancelled: 'badge-error'
    };
    return classes[status] || 'badge-info';
  }

  getIntervalLabel(interval: string): string {
    const labels: { [key: string]: string } = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      custom: 'Personalizado'
    };
    return labels[interval] || interval;
  }
}

