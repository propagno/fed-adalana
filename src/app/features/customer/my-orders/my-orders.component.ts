import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../core/services/order.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Meus Pedidos</h2>
        <p class="text-sm text-gray-600 mt-1">Histórico de entregas</p>
      </div>

      <div *ngIf="loading" class="text-center py-8 text-gray-500">
        Carregando pedidos...
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-12">
        <p class="text-gray-500">Você ainda não possui pedidos.</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="space-y-4">
        <div *ngFor="let order of orders" class="card">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ order.product_name || 'Produto' }}</h3>
              <p class="text-sm text-gray-500">Pedido #{{ order.id.substring(0, 8) }}</p>
            </div>
            <span [class]="getStatusBadgeClass(order.status)">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div class="text-sm text-gray-600">Quantidade</div>
              <div class="text-sm font-medium">{{ order.quantity }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Data de Entrega</div>
              <div class="text-sm font-medium">{{ formatDate(order.delivery_date) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Endereço</div>
              <div class="text-sm font-medium">{{ order.delivery_address || 'N/A' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Status</div>
              <div class="text-sm font-medium">{{ getStatusLabel(order.status) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      in_transit: 'Em Trânsito',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      in_transit: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-error'
    };
    return classes[status] || 'badge-info';
  }
}

