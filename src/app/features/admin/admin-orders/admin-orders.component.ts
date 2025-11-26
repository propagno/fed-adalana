import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService, OrderResponse, OrderFilters, PageResponse } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormatUtil } from '../../../shared/utils/format.util';
import { catchError, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    InputComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header Mobile-First -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div class="p-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-h1 font-display text-primary">Pedidos</h1>
              <p class="text-body-sm text-gray-600 mt-1">Gerencie pedidos da sua empresa</p>
            </div>
            <div *ngIf="pendingOrdersCount > 0" 
                 class="bg-secondary text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {{ pendingOrdersCount }} pendente{{ pendingOrdersCount > 1 ? 's' : '' }}
            </div>
          </div>
          
          <!-- Mobile: Collapsible Filters -->
          <div class="flex gap-2 mb-4">
            <button 
              (click)="showFilters = !showFilters"
              class="flex-1 btn-secondary min-h-[44px] flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
            <button 
              (click)="showSearch = !showSearch"
              class="btn-secondary min-h-[44px] px-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <!-- Search Bar (Expandable on Mobile) -->
          <div *ngIf="showSearch" class="mb-4">
            <app-input
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por número do pedido ou nome do cliente..."
              [fullWidth]="true">
            </app-input>
          </div>
        </div>
        
        <!-- Filters Panel (Mobile: Bottom Sheet, Desktop: Inline) -->
        <div *ngIf="showFilters" 
             class="border-t border-gray-200 bg-gray-50 p-4 md:flex md:gap-4 md:items-end">
          <div class="mb-4 md:mb-0 md:flex-1">
            <label class="block text-body-sm font-medium text-gray-700 mb-2">Status</label>
            <select [(ngModel)]="statusFilter" 
                    (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]">
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="confirmed">Confirmados</option>
              <option value="rejected">Rejeitados</option>
              <option value="cancelled_by_company">Cancelados</option>
              <option value="delivered">Entregues</option>
            </select>
          </div>
          
          <div class="mb-4 md:mb-0 md:flex-1">
            <label class="block text-body-sm font-medium text-gray-700 mb-2">Status de Aceitação</label>
            <select [(ngModel)]="acceptanceStatusFilter" 
                    (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]">
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="accepted">Aceito</option>
              <option value="rejected">Rejeitado</option>
            </select>
          </div>
          
          <div class="mb-4 md:mb-0 md:flex-1">
            <label class="block text-body-sm font-medium text-gray-700 mb-2">Período</label>
            <select [(ngModel)]="dateFilter" 
                    (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]">
              <option value="all">Todos</option>
              <option value="today">Hoje</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias</option>
            </select>
          </div>
          
          <div class="flex gap-2">
            <app-button 
              variant="ghost"
              size="md"
              label="Limpar"
              (clicked)="clearFilters()"
              [fullWidth]="true">
            </app-button>
            <app-button 
              variant="primary"
              size="md"
              label="Aplicar"
              (clicked)="applyFilters()"
              [fullWidth]="true">
            </app-button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-4">
          <app-skeleton-loader *ngFor="let i of [1,2,3]" type="card"></app-skeleton-loader>
        </div>

        <!-- Empty State -->
        <app-empty-state *ngIf="!loading && orders.length === 0"
                         title="Nenhum Pedido Encontrado"
                         message="Não há pedidos que correspondam aos filtros selecionados."
                         [actionLabel]="'Limpar Filtros'"
                         [actionHandler]="clearFilters.bind(this)">
        </app-empty-state>

        <!-- Orders List -->
        <div *ngIf="!loading && orders.length > 0" class="space-y-4">
          <app-card *ngFor="let order of orders" 
                   [attr.data-order-id]="order.id" 
                   variant="interactive"
                   [elevation]="1"
                   padding="md"
                   class="hover:shadow-elevation-2 transition-shadow">
            <!-- Order Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-h3 font-display text-primary">
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
                <p class="text-body-sm text-gray-600 mb-1">
                  <span class="font-medium">{{ order.customer_name || 'Cliente' }}</span>
                </p>
                <p class="text-body-sm text-gray-500">
                  {{ order.product_name || 'Produto' }} • Qtd: {{ order.quantity || '-' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-h4 font-semibold text-primary-light mb-1">
                  {{ formatCurrency(order.amount) }}
                </p>
                <p class="text-body-xs text-gray-500">
                  Entrega: {{ formatDate(order.delivery_date) }}
                </p>
              </div>
            </div>

            <!-- Order Details -->
            <div class="border-t border-gray-200 pt-4 mt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-body-xs text-gray-500 mb-1">Endereço de Entrega</p>
                  <p class="text-body-sm text-gray-900">{{ order.delivery_address || '-' }}</p>
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
                <p class="text-body-sm text-gray-700">
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
                <p *ngIf="order.cancellation_request_reason" class="text-body-sm text-gray-600">
                  Motivo: {{ order.cancellation_request_reason }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex flex-wrap gap-2 mt-4">
                <app-button 
                  *ngIf="canAcceptOrder(order)"
                  variant="primary"
                  size="sm"
                  label="Aceitar"
                  (clicked)="openAcceptModal(order)"
                  [loading]="loadingAction === 'accept-' + order.id">
                </app-button>
                
                <app-button 
                  *ngIf="canRejectOrder(order)"
                  variant="danger"
                  size="sm"
                  label="Rejeitar"
                  (clicked)="openRejectModal(order)"
                  [loading]="loadingAction === 'reject-' + order.id">
                </app-button>
                
                <app-button 
                  *ngIf="canCancelOrder(order)"
                  variant="danger"
                  size="sm"
                  label="Cancelar"
                  (clicked)="openCancelModal(order)"
                  [loading]="loadingAction === 'cancel-' + order.id">
                </app-button>
                
                <app-button 
                  *ngIf="canApproveCancellation(order)"
                  variant="primary"
                  size="sm"
                  label="Aprovar Cancelamento"
                  (clicked)="approveCancellation(order)"
                  [loading]="loadingAction === 'approve-cancellation-' + order.id">
                </app-button>
                
                <app-button 
                  *ngIf="canRejectCancellation(order)"
                  variant="outline"
                  size="sm"
                  label="Rejeitar Cancelamento"
                  (clicked)="openRejectCancellationModal(order)"
                  [loading]="loadingAction === 'reject-cancellation-' + order.id">
                </app-button>
                
                <app-button 
                  *ngIf="canMarkAsInTransit(order)"
                  variant="primary"
                  size="sm"
                  label="Marcar como Em Trânsito"
                  (clicked)="markAsInTransit(order)"
                  [loading]="loadingAction === 'mark-in-transit-' + order.id">
                </app-button>
                
                <app-button 
                  *ngIf="canConfirmDelivery(order)"
                  variant="primary"
                  size="sm"
                  label="Confirmar Entrega"
                  (clicked)="openConfirmDeliveryModal(order)"
                  [loading]="loadingAction === 'confirm-delivery-' + order.id">
                </app-button>
                
                <app-button 
                  variant="ghost"
                  size="sm"
                  label="Ver Detalhes"
                  (clicked)="openDetailsModal(order)">
                </app-button>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Pagination -->
        <div *ngIf="!loading && orders.length > 0 && totalPages > 1" 
             class="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div class="text-body-sm text-gray-600">
            Mostrando {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} de {{ totalElements }} pedidos
          </div>
          <div class="flex gap-2">
            <app-button 
              variant="ghost"
              size="sm"
              label="Anterior"
              (clicked)="previousPage()"
              [disabled]="currentPage === 0">
            </app-button>
            <span class="px-4 py-2 text-body-sm text-gray-700">
              Página {{ currentPage + 1 }} de {{ totalPages }}
            </span>
            <app-button 
              variant="ghost"
              size="sm"
              label="Próxima"
              (clicked)="nextPage()"
              [disabled]="currentPage >= totalPages - 1">
            </app-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div *ngIf="showDetailsModal && selectedOrder" 
         class="fixed inset-0 z-50 overflow-y-auto" 
         aria-labelledby="details-modal-title" 
         role="dialog" 
         aria-modal="true">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
             aria-hidden="true" 
             (click)="closeDetailsModal()"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <!-- Modal Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="details-modal-title">
                Detalhes do Pedido {{ selectedOrder.order_number || '#' + selectedOrder.id.substring(0, 8) }}
              </h3>
              <button (click)="closeDetailsModal()" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="bg-gray-50 px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto">
            <!-- Customer Info -->
            <div class="bg-white shadow rounded-lg p-4 mb-6">
              <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h4>
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-primary-light/10 flex items-center justify-center text-primary font-bold">
                  {{ selectedOrder.customer_name?.charAt(0)?.toUpperCase() || 'C' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ selectedOrder.customer_name }}</p>
                  <p class="text-xs text-gray-500">{{ selectedOrder.delivery_address }}</p>
                </div>
              </div>
            </div>

            <!-- Items List -->
            <div class="space-y-4 mb-8">
              <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Itens do Pedido</h4>
              <div class="bg-white shadow overflow-hidden rounded-md">
                <ul class="divide-y divide-gray-200">
                  <li *ngFor="let item of selectedOrder.items" class="px-6 py-4 flex items-center">
                    <div class="flex-shrink-0 h-12 w-12 rounded-md border border-gray-200 overflow-hidden bg-gray-100 mr-4">
                       <img *ngIf="item.imageUrl" [src]="item.imageUrl" alt="{{item.productName}}" class="h-full w-full object-cover">
                       <div *ngIf="!item.imageUrl" class="h-full w-full flex items-center justify-center text-gray-400">
                         <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                       </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ item.productName }}</p>
                      <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatCurrencyFromCents(item.priceCents) }}</p>
                      <p *ngIf="item.description" class="text-xs text-gray-400 mt-0.5 truncate">{{ item.description }}</p>
                    </div>
                    <div class="ml-4 text-sm font-semibold text-gray-900">
                      {{ formatCurrencyFromCents(item.quantity * item.priceCents) }}
                    </div>
                  </li>
                  <!-- Price Breakdown -->
                  <li class="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Subtotal</span>
                      <span class="text-sm font-medium text-gray-900">{{ formatCurrencyFromCents(selectedOrder.subtotal_cents || (selectedOrder.amount * 100)) }}</span>
                    </div>
                    <div *ngIf="selectedOrder.club_discount_cents && selectedOrder.club_discount_cents > 0" class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Desconto Clube VIP</span>
                      <span class="text-sm font-medium text-success">-{{ formatCurrencyFromCents(selectedOrder.club_discount_cents) }}</span>
                    </div>
                    <div *ngIf="selectedOrder.promotion_discount_cents && selectedOrder.promotion_discount_cents > 0" class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Desconto Cupom {{ selectedOrder.promotion_code }}</span>
                      <span class="text-sm font-medium text-success">-{{ formatCurrencyFromCents(selectedOrder.promotion_discount_cents) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span class="text-base font-medium text-gray-900">Total do Pedido</span>
                      <span class="text-lg font-bold text-primary">{{ formatCurrency(selectedOrder.amount) }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="bg-white shadow rounded-lg p-4 space-y-3">
              <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pagamento</h4>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Status</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      [ngClass]="{
                        'bg-green-100 text-green-800': selectedOrder.payment_status === 'paid',
                        'bg-yellow-100 text-yellow-800': selectedOrder.payment_status === 'pending' || selectedOrder.payment_status === 'partial',
                        'bg-red-100 text-red-800': selectedOrder.payment_status === 'failed' || selectedOrder.payment_status === 'refunded',
                        'bg-gray-100 text-gray-800': selectedOrder.payment_status === 'unpaid'
                      }">
                  {{ getPaymentStatusLabel(selectedOrder.payment_status) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Método</span>
                <span class="text-sm font-medium text-gray-900 uppercase">{{ selectedOrder.payment_method || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button type="button" 
                    (click)="closeDetailsModal()"
                    class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Accept Order Modal -->
    <div *ngIf="showAcceptModal" 
         class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
         (click)="showAcceptModal = false">
      <div class="bg-white rounded-large shadow-elevation-3 w-full max-w-md p-6"
           (click)="$event.stopPropagation()">
        <h2 class="text-h2 font-display text-primary mb-4">Aceitar Pedido</h2>
        <p class="text-body text-gray-600 mb-6">
          Tem certeza que deseja aceitar o pedido {{ selectedOrder?.order_number || '#' + selectedOrder?.id?.substring(0, 8) }}?
        </p>
        <div class="flex gap-3">
          <app-button 
            variant="ghost"
            size="md"
            label="Cancelar"
            (clicked)="showAcceptModal = false"
            [fullWidth]="true">
          </app-button>
          <app-button 
            variant="primary"
            size="md"
            label="Confirmar"
            (clicked)="acceptOrder()"
            [loading]="loadingAction === 'accept-' + selectedOrder?.id"
            [fullWidth]="true">
          </app-button>
        </div>
      </div>
    </div>

    <!-- Reject Order Modal -->
    <div *ngIf="showRejectModal" 
         class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
         (click)="showRejectModal = false">
      <div class="bg-white rounded-large shadow-elevation-3 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <h2 class="text-h2 font-display text-primary mb-4">Rejeitar Pedido</h2>
        <p class="text-body text-gray-600 mb-4">
          Informe o motivo da rejeição do pedido {{ selectedOrder?.order_number || '#' + selectedOrder?.id?.substring(0, 8) }}:
        </p>
        <div class="mb-6">
          <textarea
            [(ngModel)]="rejectionReason"
            class="w-full p-3 border border-gray-300 rounded-medium focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
            placeholder="Descreva o motivo da rejeição (mínimo 10 caracteres)"
            [maxlength]="500"
            rows="4">
          </textarea>
          <p class="text-body-xs text-gray-500 mt-1">
            {{ rejectionReason.length }}/500 caracteres
          </p>
        </div>
        <div class="flex gap-3">
          <app-button 
            variant="ghost"
            size="md"
            label="Cancelar"
            (clicked)="showRejectModal = false"
            [fullWidth]="true">
          </app-button>
          <app-button 
            variant="danger"
            size="md"
            label="Confirmar Rejeição"
            (clicked)="rejectOrder()"
            [disabled]="rejectionReason.length < 10"
            [loading]="loadingAction === 'reject-' + selectedOrder?.id"
            [fullWidth]="true">
          </app-button>
        </div>
      </div>
    </div>

    <!-- Cancel Order Modal -->
    <div *ngIf="showCancelModal" 
         class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
         (click)="showCancelModal = false">
      <div class="bg-white rounded-large shadow-elevation-3 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <h2 class="text-h2 font-display text-primary mb-4">Cancelar Pedido</h2>
        <p class="text-body text-gray-600 mb-4">
          Informe o motivo do cancelamento do pedido {{ selectedOrder?.order_number || '#' + selectedOrder?.id?.substring(0, 8) }}:
        </p>
        <div class="mb-6">
          <textarea
            [(ngModel)]="cancellationReason"
            class="w-full p-3 border border-gray-300 rounded-medium focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
            placeholder="Descreva o motivo do cancelamento (mínimo 10 caracteres)"
            [maxlength]="500"
            rows="4">
          </textarea>
          <p class="text-body-xs text-gray-500 mt-1">
            {{ cancellationReason.length }}/500 caracteres
          </p>
        </div>
        <div class="flex gap-3">
          <app-button 
            variant="ghost"
            size="md"
            label="Cancelar"
            (clicked)="showCancelModal = false"
            [fullWidth]="true">
          </app-button>
          <app-button 
            variant="danger"
            size="md"
            label="Confirmar Cancelamento"
            (clicked)="cancelOrder()"
            [disabled]="cancellationReason.length < 10"
            [loading]="loadingAction === 'cancel-' + selectedOrder?.id"
            [fullWidth]="true">
          </app-button>
        </div>
      </div>
    </div>

    <!-- Reject Cancellation Modal -->
    <div *ngIf="showRejectCancellationModal" 
         class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
         (click)="showRejectCancellationModal = false">
      <div class="bg-white rounded-large shadow-elevation-3 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <h2 class="text-h2 font-display text-primary mb-4">Rejeitar Solicitação de Cancelamento</h2>
        <p class="text-body text-gray-600 mb-4">
          Informe o motivo da rejeição da solicitação de cancelamento do pedido {{ selectedOrder?.order_number || '#' + selectedOrder?.id?.substring(0, 8) }}:
        </p>
        <div class="mb-6">
          <textarea
            [(ngModel)]="rejectCancellationReason"
            class="w-full p-3 border border-gray-300 rounded-medium focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
            placeholder="Descreva o motivo da rejeição (mínimo 10 caracteres)"
            [maxlength]="500"
            rows="4">
          </textarea>
          <p class="text-body-xs text-gray-500 mt-1">
            {{ rejectCancellationReason.length }}/500 caracteres
          </p>
        </div>
        <div class="flex gap-3">
          <app-button 
            variant="ghost"
            size="md"
            label="Cancelar"
            (clicked)="showRejectCancellationModal = false"
            [fullWidth]="true">
          </app-button>
          <app-button 
            variant="outline"
            size="md"
            label="Confirmar Rejeição"
            (clicked)="rejectCancellation()"
            [disabled]="rejectCancellationReason.length < 10"
            [loading]="loadingAction === 'reject-cancellation-' + selectedOrder?.id"
            [fullWidth]="true">
          </app-button>
        </div>
      </div>
    </div>

    <!-- Assign Deliverer Modal -->
    <div *ngIf="showAssignDelivererModal" 
         class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
         (click)="showAssignDelivererModal = false">
      <div class="bg-white rounded-large shadow-elevation-3 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <h2 class="text-h2 font-display text-primary mb-4">Atribuir Entregador</h2>
        <p class="text-body text-gray-600 mb-4">
          Selecione um entregador para o pedido {{ selectedOrder?.order_number || '#' + selectedOrder?.id?.substring(0, 8) }}:
        </p>
        
        <!-- Loading State -->
        <div *ngIf="loadingAction === 'loading-deliverers'" class="mb-6 text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p class="text-body-sm text-gray-600 mt-2">Carregando entregadores...</p>
        </div>
        
        <!-- Empty State: Sem Entregadores -->
        <div *ngIf="loadingAction !== 'loading-deliverers' && availableDeliverers.length === 0" 
             class="mb-6 p-6 bg-warning/10 border-2 border-warning rounded-lg">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="flex-1">
              <p class="text-body font-semibold text-gray-900 mb-2">
                Nenhum Entregador Disponível
              </p>
              <p class="text-body-sm text-gray-700 mb-4">
                Não há entregadores ativos cadastrados no sistema. Para atribuir este pedido a um entregador, 
                é necessário primeiro cadastrar pelo menos um usuário com perfil de entregador.
              </p>
              <app-button 
                variant="primary"
                size="md"
                label="Cadastrar Entregador"
                (clicked)="goToCreateDeliverer()"
                [fullWidth]="true">
              </app-button>
            </div>
          </div>
        </div>
        
        <!-- Select de Entregadores (apenas se houver entregadores) -->
        <div *ngIf="loadingAction !== 'loading-deliverers' && availableDeliverers.length > 0" class="mb-6">
          <label class="block text-body-sm font-medium text-gray-700 mb-2">Entregador *</label>
          <select [(ngModel)]="selectedDelivererId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]">
            <option value="">Selecione um entregador</option>
            <option *ngFor="let deliverer of availableDeliverers" [value]="deliverer.id">
              {{ deliverer.name }} {{ deliverer.email ? '(' + deliverer.email + ')' : '' }}
            </option>
          </select>
          <p class="text-body-xs text-gray-500 mt-2">
            O pedido será atribuído ao entregador selecionado e marcado como "Em Trânsito".
          </p>
        </div>
        
        <!-- Botões -->
        <div class="flex gap-3">
          <app-button 
            variant="ghost"
            size="md"
            label="Cancelar"
            (clicked)="showAssignDelivererModal = false"
            [fullWidth]="true">
          </app-button>
          <app-button 
            *ngIf="availableDeliverers.length > 0"
            variant="primary"
            size="md"
            label="Atribuir e Marcar Em Trânsito"
            (clicked)="assignDelivererAndMarkInTransit()"
            [disabled]="!selectedDelivererId || loadingAction === 'loading-deliverers'"
            [loading]="loadingAction === 'assign-deliverer-' + selectedOrder?.id"
            [fullWidth]="true">
          </app-button>
        </div>
      </div>
    </div>

    <!-- Confirm Delivery Modal -->
    <div *ngIf="showConfirmDeliveryModal" 
         class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4"
         (click)="showConfirmDeliveryModal = false">
      <div class="bg-white rounded-large shadow-elevation-3 w-full max-w-md p-6"
           (click)="$event.stopPropagation()">
        <h2 class="text-h2 font-display text-primary mb-4">Confirmar Entrega</h2>
        <p class="text-body text-gray-600 mb-4">
          Informe o código de confirmação fornecido pelo cliente para confirmar a entrega do pedido {{ selectedOrder?.order_number || '#' + selectedOrder?.id?.substring(0, 8) }}:
        </p>
        <div class="mb-6">
          <app-input
            [(ngModel)]="deliveryCode"
            placeholder="Código de confirmação (ex: 1234)"
            [fullWidth]="true"
            [maxLength]="10"
            type="text"
            autocomplete="off">
          </app-input>
          <p class="text-body-xs text-gray-500 mt-2">
            O código foi enviado ao cliente quando o pedido foi aceito.
          </p>
        </div>
        <div class="flex gap-3">
          <app-button 
            variant="ghost"
            size="md"
            label="Cancelar"
            (clicked)="showConfirmDeliveryModal = false"
            [fullWidth]="true">
          </app-button>
          <app-button 
            variant="primary"
            size="md"
            label="Confirmar Entrega"
            (clicked)="confirmDelivery()"
            [disabled]="!deliveryCode || deliveryCode.trim().length === 0"
            [loading]="loadingAction === 'confirm-delivery-' + selectedOrder?.id"
            [fullWidth]="true">
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: OrderResponse[] = [];
  loading = false;
  accountId: string | null = null;
  
  // Filters
  showFilters = false;
  showSearch = false;
  searchTerm = '';
  statusFilter: string = 'all';
  acceptanceStatusFilter: string = 'all';
  dateFilter: string = 'all';
  
  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  
  // Modals
  showAcceptModal = false;
  showRejectModal = false;
  showCancelModal = false;
  showRejectCancellationModal = false;
  showConfirmDeliveryModal = false;
  showDetailsModal = false;
  showAssignDelivererModal = false;
  selectedOrder: OrderResponse | null = null;
  
  // Form fields
  rejectionReason = '';
  cancellationReason = '';
  rejectCancellationReason = '';
  deliveryCode = '';
  selectedDelivererId = '';
  
  // Deliverers (to be loaded from UserService)
  availableDeliverers: any[] = [];
  
  // Loading states
  loadingAction: string | null = null;
  
  // Counts
  pendingOrdersCount = 0;
  
  // Search debounce
  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();
  
  Math = Math;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.accountId) {
      this.accountId = user.accountId;
      this.loadOrders();
      this.loadPendingCount();
    }
    
    // Setup search debounce
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 0;
        this.loadOrders();
      })
    );
    
    // Check for highlight query param (deep linking from notifications)
    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        // Scroll to highlighted order after orders are loaded
        setTimeout(() => {
          this.scrollToOrder(params['highlight']);
        }, 500);
      }
    });
  }

  scrollToOrder(orderId: string): void {
    const element = document.querySelector(`[data-order-id="${orderId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      element.classList.add('ring-4', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50');
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadOrders(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    const filters = this.buildFilters();
    
    this.orderService.getAccountOrders(this.accountId, filters, this.currentPage, this.pageSize).pipe(
      catchError(error => {
        console.error('Error loading orders:', error);
        this.toastService.error('Erro ao carregar pedidos.');
        return of({ content: [], totalElements: 0, totalPages: 0, size: this.pageSize, number: 0, first: true, last: true });
      }),
      finalize(() => this.loading = false)
    ).subscribe((page: PageResponse<OrderResponse>) => {
      this.orders = page.content || [];
      this.totalElements = page.totalElements || 0;
      this.totalPages = page.totalPages || 0;
    });
  }

  loadPendingCount(): void {
    if (!this.accountId) return;
    
    // Contar apenas pedidos que precisam de atenção do admin:
    // - Pedidos pendentes/notificados que ainda não foram aceitos/rejeitados
    // - Excluir pedidos entregues, cancelados, rejeitados definitivamente
    const filters: OrderFilters = {
      status: ['pending', 'notified'],
      acceptance_status: ['pending']
    };
    
    this.orderService.getAccountOrders(this.accountId, filters, 0, 100).pipe(
      catchError(() => of({ 
        content: [], 
        totalElements: 0, 
        totalPages: 0, 
        size: 100, 
        number: 0, 
        first: true, 
        last: true 
      } as PageResponse<OrderResponse>))
    ).subscribe((page: PageResponse<OrderResponse>) => {
      // Filtrar manualmente para garantir que não contamos pedidos entregues
      const pendingOrders = (page.content || []).filter(order => 
        order.status !== 'delivered' && 
        order.status !== 'cancelled_by_company' && 
        order.status !== 'cancelled_by_customer' &&
        order.acceptance_status === 'pending'
      );
      this.pendingOrdersCount = pendingOrders.length;
    });
  }

  buildFilters(): OrderFilters {
    const filters: OrderFilters = {};
    
    if (this.statusFilter !== 'all') {
      filters.status = [this.statusFilter];
    }
    
    if (this.acceptanceStatusFilter !== 'all') {
      filters.acceptance_status = [this.acceptanceStatusFilter];
    }
    
    if (this.dateFilter !== 'all') {
      const today = new Date();
      const dateFrom = new Date();
      
      switch (this.dateFilter) {
        case 'today':
          dateFrom.setHours(0, 0, 0, 0);
          filters.date_from = dateFrom.toISOString().split('T')[0];
          filters.date_to = today.toISOString().split('T')[0];
          break;
        case 'week':
          dateFrom.setDate(today.getDate() - 7);
          filters.date_from = dateFrom.toISOString().split('T')[0];
          filters.date_to = today.toISOString().split('T')[0];
          break;
        case 'month':
          dateFrom.setDate(today.getDate() - 30);
          filters.date_from = dateFrom.toISOString().split('T')[0];
          filters.date_to = today.toISOString().split('T')[0];
          break;
      }
    }
    
    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      filters.search = this.searchTerm.trim();
    }
    
    return filters;
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.acceptanceStatusFilter = 'all';
    this.dateFilter = 'all';
    this.searchTerm = '';
    this.showFilters = false;
    this.showSearch = false;
    this.currentPage = 0;
    this.loadOrders();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  // Order Actions
  openAcceptModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.showAcceptModal = true;
  }

  acceptOrder(): void {
    if (!this.selectedOrder || !this.accountId) return;
    
    this.loadingAction = 'accept-' + this.selectedOrder.id;
    this.orderService.acceptOrder(this.selectedOrder.id, this.accountId).pipe(
      catchError(error => {
        console.error('Error accepting order:', error);
        this.toastService.error('Erro ao aceitar pedido: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
        this.showAcceptModal = false;
        this.selectedOrder = null;
      })
    ).subscribe(order => {
      if (order) {
        this.toastService.success('Pedido aceito com sucesso!');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  openRejectModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  rejectOrder(): void {
    if (!this.selectedOrder || !this.accountId) return;
    
    this.loadingAction = 'reject-' + this.selectedOrder.id;
    this.orderService.rejectOrder(this.selectedOrder.id, this.accountId, this.rejectionReason).pipe(
      catchError(error => {
        console.error('Error rejecting order:', error);
        this.toastService.error('Erro ao rejeitar pedido: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
        this.showRejectModal = false;
        this.selectedOrder = null;
        this.rejectionReason = '';
      })
    ).subscribe(order => {
      if (order) {
        this.toastService.success('Pedido rejeitado.');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  openCancelModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.cancellationReason = '';
    this.showCancelModal = true;
  }

  cancelOrder(): void {
    if (!this.selectedOrder || !this.accountId) return;
    
    this.loadingAction = 'cancel-' + this.selectedOrder.id;
    this.orderService.cancelOrderByCompany(this.selectedOrder.id, this.accountId, this.cancellationReason).pipe(
      catchError(error => {
        console.error('Error cancelling order:', error);
        this.toastService.error('Erro ao cancelar pedido: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
        this.showCancelModal = false;
        this.selectedOrder = null;
        this.cancellationReason = '';
      })
    ).subscribe(order => {
      if (order) {
        this.toastService.success('Pedido cancelado.');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  approveCancellation(order: OrderResponse): void {
    if (!order || !this.accountId) return;
    
    this.loadingAction = 'approve-cancellation-' + order.id;
    this.orderService.approveCancellation(order.id, this.accountId).pipe(
      catchError(error => {
        console.error('Error approving cancellation:', error);
        this.toastService.error('Erro ao aprovar cancelamento: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
      })
    ).subscribe(updatedOrder => {
      if (updatedOrder) {
        this.toastService.success('Cancelamento aprovado.');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  openRejectCancellationModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.rejectCancellationReason = '';
    this.showRejectCancellationModal = true;
  }

  rejectCancellation(): void {
    if (!this.selectedOrder || !this.accountId) return;
    
    this.loadingAction = 'reject-cancellation-' + this.selectedOrder.id;
    this.orderService.rejectCancellation(this.selectedOrder.id, this.accountId, this.rejectCancellationReason).pipe(
      catchError(error => {
        console.error('Error rejecting cancellation:', error);
        this.toastService.error('Erro ao rejeitar cancelamento: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
        this.showRejectCancellationModal = false;
        this.selectedOrder = null;
        this.rejectCancellationReason = '';
      })
    ).subscribe(order => {
      if (order) {
        this.toastService.success('Cancelamento rejeitado.');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  openAssignDelivererModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.selectedDelivererId = '';
    this.loadAvailableDeliverers();
    this.showAssignDelivererModal = true;
  }

  loadAvailableDeliverers(): void {
    if (!this.accountId) return;
    
    this.loadingAction = 'loading-deliverers';
    
    this.userService.getUsers().subscribe({
      next: (users: any[]) => {
        // Backend returns role as lowercase ('deliverer', 'operator', 'admin')
        this.availableDeliverers = users.filter((u: any) => u.role === 'deliverer' && u.active);
        console.log('Available deliverers loaded:', this.availableDeliverers.length);
        
        // Se não há entregadores, mostrar aviso
        if (this.availableDeliverers.length === 0) {
          console.warn('No active deliverers found');
          this.toastService.warning('Nenhum entregador ativo cadastrado');
        }
        
        this.loadingAction = null;
      },
      error: (err: any) => {
        console.error('Error loading deliverers:', err);
        this.toastService.error('Erro ao carregar entregadores');
        this.loadingAction = null;
      }
    });
  }
  
  goToCreateDeliverer(): void {
    this.showAssignDelivererModal = false;
    this.router.navigate(['/admin/users'], { 
      queryParams: { action: 'create', role: 'deliverer' } 
    });
  }

  assignDelivererAndMarkInTransit(): void {
    if (!this.selectedOrder || !this.selectedDelivererId || !this.accountId) {
      this.toastService.error('Por favor, selecione um entregador.');
      return;
    }
    
    this.loadingAction = 'assign-deliverer-' + this.selectedOrder.id;
    
    // First, assign deliverer
    this.orderService.assignDeliverer(this.selectedOrder.id, this.accountId, this.selectedDelivererId).pipe(
      catchError(error => {
        console.error('Error assigning deliverer:', error);
        this.toastService.error('Erro ao atribuir entregador: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
        this.showAssignDelivererModal = false;
        this.selectedOrder = null;
        this.selectedDelivererId = '';
      })
    ).subscribe(updatedOrder => {
      if (updatedOrder) {
        this.toastService.success('Entregador atribuído! Marcando como em trânsito...');
        // Now mark as in transit
        this.markAsInTransitAfterAssignment(updatedOrder.id);
      }
    });
  }

  markAsInTransitAfterAssignment(orderId: string): void {
    if (!this.accountId) return;
    
    this.loadingAction = 'mark-in-transit-' + orderId;
    this.orderService.markAsInTransit(orderId, this.accountId).pipe(
      catchError(error => {
        console.error('Error marking order as in transit:', error);
        this.toastService.error('Entregador atribuído, mas erro ao marcar como em trânsito: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
      })
    ).subscribe(updatedOrder => {
      if (updatedOrder) {
        this.toastService.success('Pedido marcado como em trânsito!');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  markAsInTransit(order: OrderResponse): void {
    if (!order || !this.accountId) return;
    
    // Check if deliverer is already assigned
    if (!order.assigned_deliverer_id) {
      // Open modal to assign deliverer first
      this.openAssignDelivererModal(order);
      return;
    }
    
    this.loadingAction = 'mark-in-transit-' + order.id;
    this.orderService.markAsInTransit(order.id, this.accountId).pipe(
      catchError(error => {
        console.error('Error marking order as in transit:', error);
        this.toastService.error('Erro ao marcar pedido como em trânsito: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
      })
    ).subscribe(updatedOrder => {
      if (updatedOrder) {
        this.toastService.success('Pedido marcado como em trânsito!');
        this.loadOrders();
        this.loadPendingCount();
      }
    });
  }

  openConfirmDeliveryModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.deliveryCode = '';
    this.showConfirmDeliveryModal = true;
  }

  confirmDelivery(): void {
    if (!this.selectedOrder || !this.deliveryCode || this.deliveryCode.trim().length === 0) {
      this.toastService.error('Por favor, informe o código de confirmação.');
      return;
    }
    
    this.loadingAction = 'confirm-delivery-' + this.selectedOrder.id;
    this.orderService.confirmDelivery(this.selectedOrder.id, this.deliveryCode.trim()).pipe(
      catchError(error => {
        console.error('Error confirming delivery:', error);
        this.toastService.error('Erro ao confirmar entrega: ' + (error.error?.message || error.message));
        return of(null);
      }),
      finalize(() => {
        this.loadingAction = null;
        this.showConfirmDeliveryModal = false;
        this.selectedOrder = null;
        this.deliveryCode = '';
      })
    ).subscribe(order => {
      if (order) {
        this.toastService.success('Entrega confirmada com sucesso!');
        this.loadOrders();
        this.loadPendingCount();
        // Marcar notificações relacionadas a este pedido como lidas
        this.markOrderNotificationsAsRead(order.id);
      }
    });
  }

  openDetailsModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  // Helper methods
  canAcceptOrder(order: OrderResponse): boolean {
    return (order.status === 'pending' || order.status === 'notified') && 
           order.acceptance_status === 'pending';
  }
  
  canAssignDeliverer(order: OrderResponse): boolean {
    return order.status === 'confirmed' && 
           order.acceptance_status === 'accepted' &&
           !(order as any).assigned_deliverer_id;
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

  canMarkAsInTransit(order: OrderResponse): boolean {
    return order.status === 'confirmed' && 
           order.acceptance_status === 'accepted';
  }

  canConfirmDelivery(order: OrderResponse): boolean {
    return (order.status === 'confirmed' || order.status === 'in_transit') && 
           order.acceptance_status === 'accepted';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      notified: 'Notificado',
      confirmed: 'Confirmado',
      in_transit: 'Em Trânsito',
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
      in_transit: 'info',
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

  getCancellationRequestStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconhecido';
    const labels: { [key: string]: string } = {
      pending: 'Aguardando aprovação',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return labels[status] || status;
  }

  getPaymentStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconhecido';
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

  formatCurrencyFromCents(cents: number | null | undefined): string {
    return FormatUtil.formatCurrency(cents);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  /**
   * Marca todas as notificações relacionadas a um pedido como lidas
   */
  private markOrderNotificationsAsRead(orderId: string): void {
    if (!this.accountId) return;

    // Buscar todas as notificações da conta
    this.notificationService.getAccountNotifications(this.accountId).pipe(
      catchError(error => {
        console.error('Error loading notifications:', error);
        return of([]);
      })
    ).subscribe(notifications => {
      // Filtrar notificações relacionadas a este pedido
      const orderNotifications = notifications.filter(notification => 
        notification.type === 'ORDER' && 
        notification.metadata?.['orderId'] === orderId &&
        !notification.read
      );

      // Marcar cada notificação como lida
      orderNotifications.forEach(notification => {
        this.notificationService.markAccountNotificationAsRead(this.accountId!, notification.id).pipe(
          catchError(error => {
            console.error(`Error marking notification ${notification.id} as read:`, error);
            return of(void 0);
          })
        ).subscribe();
      });
    });
  }
}
