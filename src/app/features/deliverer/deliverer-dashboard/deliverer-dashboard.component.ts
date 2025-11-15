import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryService, DeliveryRouteResponse, DeliveryDaySummary } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-deliverer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <!-- Modern Header -->
      <header class="bg-white shadow-md sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Minhas Entregas</h1>
                <p class="text-xs text-gray-500">Painel do Entregador</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{ getUserName() }}</p>
                <p class="text-xs text-gray-500">Entregador</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {{ getUserInitial() }}
              </div>
              <button (click)="logout()" 
                      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Date Selector -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-1">Selecione a Data</h2>
              <p class="text-sm text-gray-600">Escolha a data para visualizar suas entregas</p>
            </div>
            <div class="flex items-center gap-3">
              <label for="delivery-date" class="text-sm font-medium text-gray-700">Data:</label>
              <input 
                type="date" 
                id="delivery-date" 
                [(ngModel)]="selectedDate" 
                (change)="onDateChange()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div *ngIf="summary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total de Entregas</p>
                <p class="text-3xl font-bold text-gray-900">{{ summary.total_deliveries }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Pendentes</p>
                <p class="text-3xl font-bold text-yellow-600">{{ summary.pending_deliveries }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Concluídas</p>
                <p class="text-3xl font-bold text-green-600">{{ summary.completed_deliveries }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Valor Total</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(summary.total_amount, summary.currency) }}</p>
              </div>
              <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Recebido</p>
                <p class="text-2xl font-bold text-green-600">{{ formatCurrency(summary.collected_amount, summary.currency) }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Pendente</p>
                <p class="text-2xl font-bold text-red-600">{{ formatCurrency(summary.pending_amount, summary.currency) }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p class="text-gray-600 text-lg">Carregando entregas...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- Deliveries List -->
        <div *ngIf="!loading && !error">
          <div *ngIf="deliveries.length === 0" class="text-center py-20 bg-white rounded-xl shadow-md">
            <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-xl text-gray-600 mb-2">Nenhuma entrega agendada</p>
            <p class="text-gray-500">Não há entregas para a data selecionada</p>
          </div>

          <div *ngIf="deliveries.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div *ngFor="let delivery of deliveries" 
                 class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer"
                 (click)="viewDelivery(delivery)">
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-1">{{ delivery.customer_name }}</h3>
                    <p class="text-sm text-gray-500">Pedido #{{ delivery.order_id.substring(0, 8) }}</p>
                  </div>
                  <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusBadgeClass(delivery.status)">
                    {{ getStatusLabel(delivery.status) }}
                  </span>
                </div>

                <div class="space-y-3 mb-4">
                  <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-700">Endereço</p>
                      <p class="text-sm text-gray-600">{{ delivery.customer_address }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Telefone</p>
                      <p class="text-sm text-gray-600">{{ delivery.customer_phone }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Valor</p>
                      <p class="text-lg font-bold text-gray-900">{{ formatCurrency(delivery.total_amount, delivery.currency) }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Pagamento</p>
                      <span [class]="'text-sm font-semibold ' + getPaymentStatusClass(delivery.payment_status)">
                        {{ getPaymentStatusLabel(delivery.payment_status) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div *ngIf="delivery.items && delivery.items.length > 0" class="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm font-medium text-gray-700 mb-2">Itens:</p>
                  <ul class="space-y-1">
                    <li *ngFor="let item of delivery.items" class="text-sm text-gray-600">
                      • {{ item.product_name }} - Qtd: {{ item.quantity }} - {{ formatCurrency(item.total_price, delivery.currency) }}
                    </li>
                  </ul>
                </div>

                <div class="flex gap-2 pt-4 border-t border-gray-200" (click)="$event.stopPropagation()">
                  <button 
                    *ngIf="delivery.whatsapp_link"
                    (click)="openWhatsApp(delivery.whatsapp_link)" 
                    class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button 
                    *ngIf="delivery.maps_link"
                    (click)="openMaps(delivery.maps_link)" 
                    class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Navegar
                  </button>
                  <button 
                    (click)="viewDelivery(delivery)" 
                    class="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                    Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DelivererDashboardComponent implements OnInit {
  deliveries: DeliveryRouteResponse[] = [];
  summary: DeliveryDaySummary | null = null;
  loading = true;
  error: string | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
    this.loadTodaySummary();
  }

  loadDeliveries(): void {
    this.loading = true;
    this.error = null;
    
    this.deliveryService.getMyRoute(this.selectedDate).subscribe({
      next: (data) => {
        this.deliveries = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar entregas. Tente novamente.';
        this.loading = false;
        console.error('Error loading deliveries', err);
      }
    });
  }

  loadTodaySummary(): void {
    this.deliveryService.getTodayDeliveries().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (err) => {
        console.error('Error loading summary', err);
      }
    });
  }

  onDateChange(): void {
    this.loadDeliveries();
  }

  viewDelivery(delivery: DeliveryRouteResponse): void {
    this.router.navigate(['/deliverer/delivery', delivery.order_id]);
  }

  openWhatsApp(link: string): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  openMaps(link: string): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'notified': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'notified': 'Notificado',
      'confirmed': 'Confirmado',
      'delivered': 'Entregue',
      'failed': 'Falhou'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'unpaid': 'text-red-600',
      'paid': 'text-green-600',
      'partial': 'text-yellow-600'
    };
    return statusMap[status] || 'text-gray-600';
  }

  getPaymentStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'unpaid': 'Não Pago',
      'paid': 'Pago',
      'partial': 'Parcial'
    };
    return statusMap[status] || status;
  }

  formatCurrency(value: number, currency: string): string {
    return FormatUtil.formatCurrency(value, currency);
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'Entregador';
  }

  getUserInitial(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
