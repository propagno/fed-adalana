import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, DeliveryRouteResponse, DeliveryUpdateRequest, DeliveryFailureRequest } from '../../../core/services/delivery.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-detail.component.html',
  styleUrl: './delivery-detail.component.css'
})
export class DeliveryDetailComponent implements OnInit {
  delivery: DeliveryRouteResponse | null = null;
  loading = true;
  error: string | null = null;
  actionLoading = false;
  
  deliveryNotes = '';
  failureReason: 'customer_absent' | 'address_issue' | 'refused' | 'other' = 'other';
  failureNotes = '';
  deliveryCode = '';
  showDeliveryCodeModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadDelivery(orderId);
    }
  }

  loadDelivery(orderId: string): void {
    this.loading = true;
    this.error = null;
    
    // Try to get deliveries for today first
    const today = new Date().toISOString().split('T')[0];
    this.deliveryService.getMyRoute(today).subscribe({
      next: (deliveries: DeliveryRouteResponse[]) => {
        let found = deliveries.find((d: DeliveryRouteResponse) => d.order_id === orderId);
        
        // If not found today, try yesterday and tomorrow
        if (!found) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Try yesterday
          this.deliveryService.getMyRoute(yesterday.toISOString().split('T')[0]).subscribe({
            next: (yesterdayDeliveries: DeliveryRouteResponse[]) => {
              found = yesterdayDeliveries.find((d: DeliveryRouteResponse) => d.order_id === orderId);
              if (!found) {
                // Try tomorrow
                this.deliveryService.getMyRoute(tomorrow.toISOString().split('T')[0]).subscribe({
                  next: (tomorrowDeliveries: DeliveryRouteResponse[]) => {
                    found = tomorrowDeliveries.find((d: DeliveryRouteResponse) => d.order_id === orderId);
                    this.delivery = found || null;
                    if (!this.delivery) {
                      this.error = 'Entrega não encontrada';
                    }
                    this.loading = false;
                  },
                  error: () => {
                    this.delivery = null;
                    this.error = 'Entrega não encontrada';
                    this.loading = false;
                  }
                });
              } else {
                this.delivery = found;
                this.loading = false;
              }
            },
            error: () => {
              this.delivery = null;
              this.error = 'Entrega não encontrada';
              this.loading = false;
            }
          });
        } else {
          this.delivery = found;
          this.loading = false;
        }
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar detalhes da entrega';
        this.loading = false;
        console.error('Error loading delivery', err);
      }
    });
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'R$ 0,00';
    // Backend retorna valores em reais (BigDecimal), não em centavos
    return FormatUtil.formatCurrencyFromReais(value);
  }

  markAsDelivered(): void {
    if (!this.delivery) return;
    
    // Abrir modal para inserir código OTP
    this.showDeliveryCodeModal = true;
    this.deliveryCode = '';
  }

  confirmDeliveryWithCode(): void {
    if (!this.delivery) return;
    
    if (!this.deliveryCode || this.deliveryCode.trim().length === 0) {
      this.toastService.error('Por favor, informe o código de confirmação');
      return;
    }

    this.actionLoading = true;
    this.error = null;

    // Usar OrderService para confirmar entrega com código OTP
    this.orderService.confirmDelivery(this.delivery.order_id, this.deliveryCode.trim()).subscribe({
      next: () => {
        this.actionLoading = false;
        this.showDeliveryCodeModal = false;
        this.toastService.success('Entrega confirmada com sucesso!');
        this.router.navigate(['/deliverer']);
      },
      error: (err: any) => {
        this.actionLoading = false;
        const errorMessage = err.error?.message || err.message || 'Erro ao confirmar entrega';
        
        // Verificar se é erro de código inválido
        if (errorMessage.toLowerCase().includes('código') || errorMessage.toLowerCase().includes('code') || errorMessage.toLowerCase().includes('inválido') || errorMessage.toLowerCase().includes('invalid')) {
          this.error = 'Código de confirmação inválido. Verifique o código fornecido pelo cliente.';
          this.toastService.error('Código de confirmação inválido');
        } else if (errorMessage.toLowerCase().includes('tentativas') || errorMessage.toLowerCase().includes('attempts')) {
          this.error = 'Número máximo de tentativas excedido. Entre em contato com o administrador.';
          this.toastService.error('Número máximo de tentativas excedido');
        } else {
          this.error = 'Erro ao confirmar entrega: ' + errorMessage;
          this.toastService.error('Erro ao confirmar entrega');
        }
        console.error('Error confirming delivery', err);
      }
    });
  }

  cancelDeliveryCodeModal(): void {
    this.showDeliveryCodeModal = false;
    this.deliveryCode = '';
    this.error = null;
  }

  markAsFailed(): void {
    if (!this.delivery) return;

    this.actionLoading = true;
    const request: DeliveryFailureRequest = {
      failure_reason: this.failureReason,
      notes: this.failureNotes
    };

    this.deliveryService.markAsFailed(this.delivery.order_id, request).subscribe({
      next: () => {
        this.actionLoading = false;
        this.router.navigate(['/deliverer']);
      },
      error: (err: any) => {
        this.error = 'Erro ao marcar entrega como falha';
        this.actionLoading = false;
        console.error('Error marking as failed', err);
      }
    });
  }

  recordPayment(): void {
    if (!this.delivery) return;
    this.router.navigate(['/deliverer/payment', this.delivery.order_id]);
  }

  openWhatsApp(): void {
    if (this.delivery?.whatsapp_link) {
      window.open(this.delivery.whatsapp_link, '_blank');
    }
  }

  openMaps(): void {
    if (this.delivery?.maps_link) {
      window.open(this.delivery.maps_link, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/deliverer']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'notified': 'status-notified',
      'confirmed': 'status-confirmed',
      'delivered': 'status-delivered',
      'failed': 'status-failed'
    };
    return statusMap[status] || 'status-default';
  }

  getPaymentStatusClass(status: string | undefined): string {
    if (!status) return 'payment-default';
    const statusMap: { [key: string]: string } = {
      'unpaid': 'payment-unpaid',
      'paid': 'payment-paid',
      'partial': 'payment-partial'
    };
    return statusMap[status] || 'payment-default';
  }
}
