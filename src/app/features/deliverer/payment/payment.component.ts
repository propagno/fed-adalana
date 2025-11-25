import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface PaymentRecordRequest {
  payment_method: 'cash' | 'pix' | 'pending';
  amount_cents: number;
  payment_notes?: string;
  external_reference?: string;
}

interface DeliveryRouteResponse {
  order_id: string;
  total_amount: number;
  currency?: string;
  customer_name?: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  delivery: DeliveryRouteResponse | null = null;
  loading = true;
  error: string | null = null;
  submitting = false;

  paymentMethod: 'cash' | 'pix' | 'pending' = 'cash';
  amountCents: number = 0;
  paymentNotes = '';
  externalReference = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadDelivery(orderId);
    }
  }

  loadDelivery(orderId: string): void {
    this.loading = true;
    this.apiService.get<DeliveryRouteResponse[]>('/deliverer/routes').subscribe({
      next: (deliveries) => {
        this.delivery = deliveries.find((d: DeliveryRouteResponse) => d.order_id === orderId) || null;
        if (this.delivery) {
          this.amountCents = Math.round(this.delivery.total_amount * 100);
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar informações da entrega';
        this.loading = false;
        console.error('Error loading delivery', err);
      }
    });
  }

  getAmountInReais(): number {
    return this.amountCents / 100;
  }

  setAmountInReais(value: number): void {
    this.amountCents = Math.round(value * 100);
  }

  getPendingAmount(): number {
    if (!this.delivery) return 0;
    return this.delivery.total_amount - this.getAmountInReais();
  }

  getCurrency(): string {
    return this.delivery?.currency || 'BRL';
  }

  getCustomerName(): string {
    return this.delivery?.customer_name || 'Cliente';
  }

  submitPayment(): void {
    if (!this.delivery) return;

    if (this.amountCents <= 0) {
      this.error = 'O valor do pagamento deve ser maior que zero';
      return;
    }

    this.submitting = true;
    this.error = null;

    const request: PaymentRecordRequest = {
      payment_method: this.paymentMethod,
      amount_cents: this.amountCents,
      payment_notes: this.paymentNotes || undefined,
      external_reference: this.externalReference || undefined
    };

    this.apiService.post(`/orders/${this.delivery.order_id}/payment`, request).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/deliverer']);
      },
      error: (err: any) => {
        this.error = 'Erro ao registrar pagamento. Tente novamente.';
        this.submitting = false;
        console.error('Error recording payment', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/deliverer/delivery', this.delivery?.order_id]);
  }
}
