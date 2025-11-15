import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DeliveryRouteResponse {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_date: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  whatsapp_link: string;
  maps_link: string;
  notes?: string;
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface DeliveryDaySummary {
  delivery_date: string;
  total_deliveries: number;
  pending_deliveries: number;
  completed_deliveries: number;
  failed_deliveries: number;
  total_amount: number;
  collected_amount: number;
  pending_amount: number;
  currency: string;
  deliveries: DeliveryRouteResponse[];
}

export interface DeliveryUpdateRequest {
  delivery_notes?: string;
  customer_present?: boolean;
}

export interface DeliveryFailureRequest {
  failure_reason: 'customer_absent' | 'address_issue' | 'refused' | 'other';
  notes?: string;
}

export interface PaymentRecordRequest {
  payment_method: 'cash' | 'pix' | 'pending';
  amount_cents: number;
  payment_notes?: string;
  external_reference?: string;
}

export interface DeliveryResponse {
  order_id: string;
  status: string;
  delivered_by: string;
  delivered_at: string;
  message: string;
}

export interface PaymentResponse {
  order_id: string;
  payment_method: string;
  amount_paid: number;
  total_amount: number;
  payment_status: string;
  paid_at: string;
  external_reference?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  constructor(private apiService: ApiService) {}

  getMyRoute(date?: string): Observable<DeliveryRouteResponse[]> {
    const params = date ? { date } : {};
    return this.apiService.get<DeliveryRouteResponse[]>('/deliveries/my-route', params);
  }

  getTodayDeliveries(): Observable<DeliveryDaySummary> {
    return this.apiService.get<DeliveryDaySummary>('/deliveries/today');
  }

  markAsDelivered(orderId: string, request: DeliveryUpdateRequest): Observable<DeliveryResponse> {
    return this.apiService.patch<DeliveryResponse>(`/deliveries/${orderId}/deliver`, request);
  }

  markAsFailed(orderId: string, request: DeliveryFailureRequest): Observable<DeliveryResponse> {
    return this.apiService.patch<DeliveryResponse>(`/deliveries/${orderId}/fail`, request);
  }

  recordPayment(orderId: string, request: PaymentRecordRequest): Observable<PaymentResponse> {
    return this.apiService.post<PaymentResponse>(`/deliveries/${orderId}/payment`, request);
  }

  getPendingPayments(): Observable<any[]> {
    return this.apiService.get<any[]>('/deliveries/pending-payments');
  }
}
