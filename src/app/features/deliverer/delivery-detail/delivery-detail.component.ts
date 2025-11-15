import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, DeliveryRouteResponse, DeliveryUpdateRequest, DeliveryFailureRequest } from '../../../core/services/delivery.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadDelivery(orderId);
    }
  }

  loadDelivery(orderId: string): void {
    this.loading = true;
    this.deliveryService.getMyRoute().subscribe({
      next: (deliveries) => {
        this.delivery = deliveries.find(d => d.order_id === orderId) || null;
        if (!this.delivery) {
          this.error = 'Entrega não encontrada';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar detalhes da entrega';
        this.loading = false;
        console.error('Error loading delivery', err);
      }
    });
  }

  markAsDelivered(): void {
    if (!this.delivery) return;

    this.actionLoading = true;
    const request: DeliveryUpdateRequest = {
      delivery_notes: this.deliveryNotes,
      customer_present: true
    };

    this.deliveryService.markAsDelivered(this.delivery.order_id, request).subscribe({
      next: () => {
        this.actionLoading = false;
        this.router.navigate(['/deliverer']);
      },
      error: (err) => {
        this.error = 'Erro ao marcar entrega como concluída';
        this.actionLoading = false;
        console.error('Error marking as delivered', err);
      }
    });
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
      error: (err) => {
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

  getPaymentStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'unpaid': 'payment-unpaid',
      'paid': 'payment-paid',
      'partial': 'payment-partial'
    };
    return statusMap[status] || 'payment-default';
  }
}
