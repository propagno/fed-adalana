import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderResponse } from '../../../core/services/order.service';
import { CardComponent } from '../design-system/card/card.component';
import { ButtonComponent } from '../design-system/button/button.component';
import { BadgeComponent } from '../design-system/badge/badge.component';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <app-card 
      variant="interactive"
      [elevation]="1"
      padding="md"
      class="hover:shadow-elevation-2 transition-shadow"
      [class.border-l-4]="isPending"
      [class.border-warning]="isPending"
      [class.border-l-4]="isCancellationRequested"
      [class.border-info]="isCancellationRequested">
      
      <!-- Order Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <h3 class="text-h3 font-display text-primary truncate">
              {{ order.order_number || '#' + order.id.substring(0, 8) }}
            </h3>
            <app-badge 
              [variant]="getStatusBadgeVariant(order.status)"
              size="sm"
              [label]="getStatusLabel(order.status)">
            </app-badge>
            <app-badge 
              *ngIf="order.acceptance_status"
              [variant]="getAcceptanceStatusBadgeVariant(order.acceptance_status)"
              size="sm"
              [label]="getAcceptanceStatusLabel(order.acceptance_status)">
            </app-badge>
          </div>
          <p class="text-body-sm text-gray-600 mb-1 truncate">
            <span class="font-medium">{{ order.customer_name || 'Cliente' }}</span>
          </p>
          <p class="text-body-sm text-gray-500 truncate">
            {{ order.product_name || 'Produto' }} • Qtd: {{ order.quantity || '-' }}
          </p>
        </div>
        <div class="text-right flex-shrink-0 ml-4">
          <p class="text-h4 font-semibold text-primary-light mb-1">
            {{ formatCurrency(order.amount) }}
          </p>
          <p class="text-body-xs text-gray-500">
            {{ formatDate(order.delivery_date) }}
          </p>
        </div>
      </div>

      <!-- Order Details -->
      <div class="border-t border-gray-200 pt-4 mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-body-xs text-gray-500 mb-1">Endereço de Entrega</p>
            <p class="text-body-sm text-gray-900 line-clamp-2">{{ order.delivery_address || '-' }}</p>
          </div>
          <div>
            <p class="text-body-xs text-gray-500 mb-1">Status de Pagamento</p>
            <p class="text-body-sm text-gray-900">{{ getPaymentStatusLabel(order.payment_status) }}</p>
          </div>
        </div>

        <!-- Rejection/Cancellation Reasons -->
        <div *ngIf="order.rejection_reason || order.cancellation_reason" 
             class="bg-warning/10 border-l-4 border-warning p-3 rounded-medium mb-4">
          <p class="text-body-sm font-medium text-gray-900 mb-1">
            {{ order.rejection_reason ? 'Motivo da Rejeição' : 'Motivo do Cancelamento' }}
          </p>
          <p class="text-body-sm text-gray-700 line-clamp-2">
            {{ order.rejection_reason || order.cancellation_reason }}
          </p>
        </div>

        <!-- Cancellation Request Status -->
        <div *ngIf="order.cancellation_requested_by_customer" 
             class="bg-info/10 border-l-4 border-info p-3 rounded-medium mb-4">
          <p class="text-body-sm font-medium text-gray-900 mb-1">
            Solicitação de Cancelamento
          </p>
          <p class="text-body-sm text-gray-700 mb-2">
            Status: {{ getCancellationRequestStatusLabel(order.cancellation_request_status) }}
          </p>
          <p *ngIf="order.cancellation_request_reason" class="text-body-sm text-gray-600 line-clamp-2">
            Motivo: {{ order.cancellation_request_reason }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-2 mt-4">
          <!-- Accept Button -->
          <app-button 
            *ngIf="canAcceptOrder(order)"
            variant="primary"
            size="sm"
            label="Aceitar"
            (clicked)="onAccept.emit(order)"
            [loading]="loadingAction === 'accept-' + order.id">
          </app-button>
          
          <!-- Reject Button -->
          <app-button 
            *ngIf="canRejectOrder(order)"
            variant="error"
            size="sm"
            label="Rejeitar"
            (clicked)="onReject.emit(order)"
            [loading]="loadingAction === 'reject-' + order.id">
          </app-button>
          
          <!-- Cancel Button -->
          <app-button 
            *ngIf="canCancelOrder(order)"
            variant="error"
            size="sm"
            label="Cancelar"
            (clicked)="onCancel.emit(order)"
            [loading]="loadingAction === 'cancel-' + order.id">
          </app-button>
          
          <!-- Approve Cancellation Button -->
          <app-button 
            *ngIf="canApproveCancellation(order)"
            variant="success"
            size="sm"
            label="Aprovar Cancelamento"
            (clicked)="onApproveCancellation.emit(order)"
            [loading]="loadingAction === 'approve-cancellation-' + order.id">
          </app-button>
          
          <!-- Reject Cancellation Button -->
          <app-button 
            *ngIf="canRejectCancellation(order)"
            variant="warning"
            size="sm"
            label="Rejeitar Cancelamento"
            (clicked)="onRejectCancellation.emit(order)"
            [loading]="loadingAction === 'reject-cancellation-' + order.id">
          </app-button>
          
          <!-- View Details Button -->
          <app-button 
            variant="ghost"
            size="sm"
            label="Ver Detalhes"
            (clicked)="onViewDetails.emit(order)"
            [fullWidth]="true"
            class="md:w-auto">
          </app-button>
        </div>
      </div>
    </app-card>
  `,
  styles: []
})
export class OrderCardComponent {
  @Input() order!: OrderResponse;
  @Input() loadingAction: string | null = null;
  
  @Output() onAccept = new EventEmitter<OrderResponse>();
  @Output() onReject = new EventEmitter<OrderResponse>();
  @Output() onCancel = new EventEmitter<OrderResponse>();
  @Output() onApproveCancellation = new EventEmitter<OrderResponse>();
  @Output() onRejectCancellation = new EventEmitter<OrderResponse>();
  @Output() onViewDetails = new EventEmitter<OrderResponse>();

  get isPending(): boolean {
    return (this.order.status === 'pending' || this.order.status === 'notified') && 
           this.order.acceptance_status === 'pending';
  }

  get isCancellationRequested(): boolean {
    return this.order.cancellation_requested_by_customer === true &&
           this.order.cancellation_request_status === 'pending';
  }

  canAcceptOrder(order: OrderResponse): boolean {
    return (order.status === 'pending' || order.status === 'notified') && 
           order.acceptance_status === 'pending';
  }

  canRejectOrder(order: OrderResponse): boolean {
    return (order.status === 'pending' || order.status === 'notified') && 
           order.acceptance_status === 'pending';
  }

  canCancelOrder(order: OrderResponse): boolean {
    return order.status === 'confirmed' && 
           order.acceptance_status === 'accepted' &&
           !order.cancellation_requested_by_customer;
  }

  canApproveCancellation(order: OrderResponse): boolean {
    return order.cancellation_requested_by_customer === true &&
           order.cancellation_request_status === 'pending';
  }

  canRejectCancellation(order: OrderResponse): boolean {
    return order.cancellation_requested_by_customer === true &&
           order.cancellation_request_status === 'pending';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      notified: 'Notificado',
      confirmed: 'Confirmado',
      rejected: 'Rejeitado',
      cancelled_by_company: 'Cancelado',
      cancelled_by_customer: 'Cancelado',
      delivered: 'Entregue',
      failed: 'Falhou'
    };
    return labels[status] || status;
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      pending: 'warning',
      notified: 'info',
      confirmed: 'success',
      rejected: 'error',
      cancelled_by_company: 'error',
      cancelled_by_customer: 'error',
      delivered: 'success',
      failed: 'error'
    };
    return variants[status] || 'neutral';
  }

  getAcceptanceStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Aguardando',
      accepted: 'Aceito',
      rejected: 'Rejeitado',
      cancelled_by_company: 'Cancelado'
    };
    return labels[status] || status;
  }

  getAcceptanceStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'error',
      cancelled_by_company: 'error'
    };
    return variants[status] || 'neutral';
  }

  getCancellationRequestStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Aguardando aprovação',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return labels[status] || status;
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      paid: 'Pago',
      partial: 'Parcial',
      refunded: 'Reembolsado',
      failed: 'Falhou'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}

