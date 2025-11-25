import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryService, DeliveryRouteResponse, DeliveryDaySummary } from '../../../core/services/delivery.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatUtil } from '../../../shared/utils/format.util';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';

@Component({
  selector: 'app-deliverer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, BadgeComponent, MapPinIconComponent, SkeletonLoaderComponent, EmptyStateComponent, InputComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="bg-white shadow-elevation-1 sticky top-0 z-40 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-light to-primary rounded-large flex items-center justify-center">
                <app-map-pin-icon size="md" variant="filled" color="text-white"></app-map-pin-icon>
              </div>
              <div>
                <h1 class="text-h2 font-display text-primary">Minhas Entregas</h1>
                <p class="text-body-sm text-gray-500">Painel do Entregador</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-body-sm font-medium text-primary">{{ getUserName() }}</p>
                <p class="text-caption text-gray-500">Entregador</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-semibold">
                {{ getUserInitial() }}
              </div>
              <app-button 
                variant="ghost"
                size="md"
                label="Sair"
                (clicked)="logout()">
              </app-button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Date Selector -->
        <app-card [elevation]="1" padding="lg" customClass="mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-h2 font-display text-primary mb-2">Selecione a Data</h2>
              <p class="text-body text-gray-600">Escolha a data para visualizar suas entregas</p>
            </div>
            <div class="flex items-center gap-3">
              <label for="delivery-date" class="text-body-sm font-medium text-primary">Data:</label>
              <input 
                type="date" 
                id="delivery-date" 
                [(ngModel)]="selectedDate" 
                (change)="onDateChange()"
                class="px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
            </div>
          </div>
        </app-card>

        <!-- Summary Cards -->
        <div *ngIf="summary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-primary-light">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body-sm font-medium text-gray-600 mb-1">Total de Entregas</p>
                <p class="text-h1 font-bold text-primary">{{ summary.total_deliveries }}</p>
              </div>
              <div class="w-12 h-12 bg-primary-light/10 rounded-large flex items-center justify-center">
                <app-map-pin-icon size="md" variant="filled" color="text-primary-light"></app-map-pin-icon>
              </div>
            </div>
          </app-card>

          <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-warning">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body-sm font-medium text-gray-600 mb-1">Pendentes</p>
                <p class="text-h1 font-bold text-warning">{{ summary.pending_deliveries }}</p>
              </div>
              <div class="w-12 h-12 bg-warning/10 rounded-large flex items-center justify-center">
                <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </app-card>

          <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-success">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body-sm font-medium text-gray-600 mb-1">Concluídas</p>
                <p class="text-h1 font-bold text-success">{{ summary.completed_deliveries }}</p>
              </div>
              <div class="w-12 h-12 bg-success/10 rounded-large flex items-center justify-center">
                <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </app-card>

          <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-primary">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body-sm font-medium text-gray-600 mb-1">Valor Total</p>
                <p class="text-h2 font-bold text-primary">{{ formatCurrency(summary.total_amount ?? 0, summary.currency || 'BRL') }}</p>
              </div>
              <div class="w-12 h-12 bg-primary/10 rounded-large flex items-center justify-center">
                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </app-card>

          <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-success">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body-sm font-medium text-gray-600 mb-1">Recebido</p>
                <p class="text-h2 font-bold text-success">{{ formatCurrency(summary.collected_amount ?? 0, summary.currency || 'BRL') }}</p>
              </div>
              <div class="w-12 h-12 bg-success/10 rounded-large flex items-center justify-center">
                <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </app-card>

          <app-card variant="highlighted" [elevation]="1" padding="lg" customClass="border-l-4 border-error">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body-sm font-medium text-gray-600 mb-1">Pendente</p>
                <p class="text-h2 font-bold text-error">{{ formatCurrency(summary.pending_amount ?? 0, summary.currency || 'BRL') }}</p>
              </div>
              <div class="w-12 h-12 bg-error/10 rounded-large flex items-center justify-center">
                <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-skeleton-loader *ngFor="let i of [1,2,3,4]" type="card"></app-skeleton-loader>
        </div>

        <!-- Error State -->
        <app-card *ngIf="error && !loading" variant="highlighted" [elevation]="0" padding="md" customClass="mb-6 border-l-4 border-error">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-body text-error">{{ error }}</p>
          </div>
        </app-card>

        <!-- Deliveries List -->
        <div *ngIf="!loading && !error">
          <app-empty-state 
            *ngIf="deliveries.length === 0"
            type="no-orders"
            title="Nenhuma entrega agendada"
            message="Não há entregas para a data selecionada">
          </app-empty-state>

          <div *ngIf="deliveries.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <app-card *ngFor="let delivery of deliveries" 
                      variant="interactive"
                      [elevation]="1"
                      padding="lg"
                      [interactive]="true"
                      class="cursor-pointer hover:shadow-elevation-3 transition-all"
                      (click)="viewDelivery(delivery)">
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <h3 class="text-h3 font-display text-primary mb-1">{{ delivery.customer_name }}</h3>
                  <p class="text-body-sm text-gray-500">Pedido #{{ delivery.order_id.substring(0, 8) }}</p>
                </div>
                <app-badge 
                  [variant]="getStatusBadgeVariant(delivery.status)"
                  size="md"
                  [label]="getStatusLabel(delivery.status)">
                </app-badge>
              </div>

              <!-- Address com Pin de Mapa -->
              <app-card variant="highlighted" [elevation]="0" padding="md" customClass="mb-4 border-l-4 border-primary-light">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-primary-light/10 rounded-large flex items-center justify-center flex-shrink-0">
                    <app-map-pin-icon size="md" variant="filled" color="text-primary-light"></app-map-pin-icon>
                  </div>
                  <div class="flex-1">
                    <p class="text-body-sm font-medium text-primary mb-1">Endereço de Entrega</p>
                    <p class="text-body text-gray-900">{{ delivery.customer_address }}</p>
                  </div>
                </div>
              </app-card>

              <div class="space-y-3 mb-4">

                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p class="text-body-sm font-medium text-gray-700">Telefone</p>
                    <p class="text-body text-gray-900">{{ delivery.customer_phone }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-body-sm font-medium text-gray-700">Valor</p>
                    <p class="text-h3 font-bold text-primary-light">{{ formatCurrency(delivery.total_amount ?? 0, delivery.currency || 'BRL') }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-body-sm font-medium text-gray-700">Pagamento</p>
                    <app-badge 
                      [variant]="getPaymentStatusBadgeVariant(delivery.payment_status)"
                      size="sm"
                      [label]="getPaymentStatusLabel(delivery.payment_status)">
                    </app-badge>
                  </div>
                </div>
              </div>

              <app-card *ngIf="delivery.items && delivery.items.length > 0" variant="highlighted" [elevation]="0" padding="md" customClass="mb-4">
                <p class="text-body-sm font-medium text-primary mb-2">Itens:</p>
                <ul class="space-y-1">
                  <li *ngFor="let item of delivery.items" class="text-body-sm text-gray-600">
                    • {{ item.product_name }} - Qtd: {{ item.quantity }} - {{ formatCurrency(item.total_price, delivery.currency || 'BRL') }}
                  </li>
                </ul>
              </app-card>

              <div class="flex gap-2 pt-4 border-t border-gray-200" (click)="$event.stopPropagation()">
                <app-button 
                  *ngIf="delivery.whatsapp_link"
                  variant="accent"
                  size="md"
                  [fullWidth]="true"
                  [hasContent]="true"
                  (clicked)="openWhatsApp(delivery.whatsapp_link)">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </app-button>
                <app-button 
                  *ngIf="delivery.maps_link"
                  variant="secondary"
                  size="md"
                  [fullWidth]="true"
                  [hasContent]="true"
                  (clicked)="openMaps(delivery.maps_link)">
                  <app-map-pin-icon size="sm" variant="filled" color="text-white" class="mr-2"></app-map-pin-icon>
                  Navegar
                </app-button>
                <app-button 
                  variant="primary"
                  size="md"
                  label="Detalhes"
                  [fullWidth]="true"
                  (clicked)="viewDelivery(delivery)">
                </app-button>
              </div>
            </app-card>
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
      next: (data: DeliveryRouteResponse[]) => {
        this.deliveries = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar entregas. Tente novamente.';
        this.loading = false;
        console.error('Error loading deliveries', err);
      }
    });
  }

  loadTodaySummary(): void {
    this.deliveryService.getTodayDeliveries().subscribe({
      next: (data: DeliveryDaySummary) => {
        this.summary = data;
      },
      error: (err: any) => {
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

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      'pending': 'warning',
      'notified': 'info',
      'confirmed': 'info',
      'assigned_to_deliverer': 'primary',
      'in_transit': 'accent',
      'arrived_at_location': 'info',
      'delivered': 'success',
      'failed': 'error'
    };
    return variants[status] || 'neutral';
  }

  getPaymentStatusBadgeVariant(status: string | undefined): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    if (!status) return 'neutral';
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      'unpaid': 'error',
      'paid': 'success',
      'partial': 'warning'
    };
    return variants[status] || 'neutral';
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'notified': 'Notificado',
      'confirmed': 'Confirmado',
      'assigned_to_deliverer': 'Atribuído',
      'in_transit': 'Em Trânsito',
      'arrived_at_location': 'Chegou ao Local',
      'delivered': 'Entregue',
      'failed': 'Falhou'
    };
    return statusMap[status] || status;
  }


  getPaymentStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconhecido';
    const statusMap: { [key: string]: string } = {
      'unpaid': 'Não Pago',
      'paid': 'Pago',
      'partial': 'Parcial'
    };
    return statusMap[status] || status;
  }

  formatCurrency(value: number | undefined | null, currency: string | undefined | null): string {
    const safeValue = value ?? 0;
    const safeCurrency = currency || 'BRL';
    // Backend retorna valores em reais (BigDecimal), não em centavos
    return FormatUtil.formatCurrencyFromReais(safeValue, safeCurrency);
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
