import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService, Subscription, UpdateSubscriptionRequest, PauseSubscriptionRequest } from '../../../core/services/subscription.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Assinaturas</h2>
        <p class="text-sm text-gray-600 mt-1">Gerencie as assinaturas dos clientes</p>
      </div>

      <div class="card">
        <div *ngIf="loading" class="text-center py-8 text-gray-500">Carregando assinaturas...</div>
        <div *ngIf="subscriptions && !loading">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima Entrega</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-surface divide-y divide-gray-200">
                <tr *ngFor="let subscription of subscriptions" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ subscription.customer_name || subscription.customer_id }}</div>
                    <div *ngIf="subscription.customer_email" class="text-xs text-gray-500">{{ subscription.customer_email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ subscription.product_name || subscription.product_id }}</div>
                    <div *ngIf="subscription.product_sku" class="text-xs text-gray-500">SKU: {{ subscription.product_sku }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ subscription.quantity }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(subscription.next_delivery) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusBadgeClass(subscription.status)">
                      {{ getStatusLabel(subscription.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button *ngIf="subscription.status === 'active'" 
                              (click)="showPauseModal(subscription)" 
                              class="text-warning hover:text-warning-dark">
                        Pausar
                      </button>
                      <button *ngIf="subscription.status === 'paused'" 
                              (click)="resumeSubscription(subscription)" 
                              class="text-success hover:text-success-dark">
                        Retomar
                      </button>
                      <button *ngIf="subscription.status !== 'cancelled'" 
                              (click)="cancelSubscription(subscription)" 
                              class="text-error hover:text-error-dark">
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="subscriptions.length === 0" class="text-center py-8 text-gray-500">
            Nenhuma assinatura cadastrada
          </div>
        </div>
      </div>

      <!-- Pause Modal -->
      <div *ngIf="showPauseForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Pausar Assinatura</h3>
          <form (ngSubmit)="pauseSubscription()" class="space-y-4">
            <div>
              <label class="label">Motivo *</label>
              <textarea [(ngModel)]="pauseFormData.reason" name="reason" required 
                        class="input" rows="3"></textarea>
            </div>
            <div>
              <label class="label">Retomar em (opcional)</label>
              <input type="date" [(ngModel)]="pauseFormData.paused_until" name="paused_until" class="input">
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" (click)="showPauseForm = false" class="btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="saving" class="btn-primary">
                {{ saving ? 'Pausando...' : 'Pausar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  loading = false;
  saving = false;
  showPauseForm = false;
  selectedSubscription: Subscription | null = null;
  error: string | null = null;

  pauseFormData: PauseSubscriptionRequest = {
    reason: '',
    paused_until: undefined
  };

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionService.getSubscriptions().subscribe({
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

  showPauseModal(subscription: Subscription): void {
    this.selectedSubscription = subscription;
    this.pauseFormData = { reason: '', paused_until: undefined };
    this.showPauseForm = true;
  }

  pauseSubscription(): void {
    if (!this.selectedSubscription || !this.pauseFormData.reason) {
      this.error = 'Por favor, informe o motivo da pausa';
      return;
    }

    this.saving = true;
    this.subscriptionService.pauseSubscription(this.selectedSubscription.id, this.pauseFormData).subscribe({
      next: () => {
        this.saving = false;
        this.showPauseForm = false;
        this.selectedSubscription = null;
        this.loadSubscriptions();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Erro ao pausar assinatura';
      }
    });
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
    if (confirm('Tem certeza que deseja cancelar esta assinatura?')) {
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
}

