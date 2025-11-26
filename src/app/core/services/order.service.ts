import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateSingleOrderRequest {
  account_id: string;
  product_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  delivery_date: string; // ISO date string (kept for backward compatibility)
  delivery_datetime?: string; // ISO datetime string (YYYY-MM-DDTHH:mm:ss)
  quantity: number;
  notes?: string;
}

export interface OrderResponse {
  id: string;
  subscription_id?: string;
  delivery_date: string;
  status: string;
  delivery_status: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  amount: number;
  payment_status: string;
  payment_method?: string;
  customer_name?: string;
  delivery_address?: string;
  customer_id?: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  items?: any[];
  created_at?: string;
  updated_at?: string;
  order_number?: string;
  account_id?: string;
  account_name?: string;
  // Order acceptance fields
  acceptance_status?: string;
  rejection_reason?: string;
  accepted_at?: string;
  rejected_at?: string;
  cancelled_by_company_at?: string;
  cancellation_reason?: string;
  cancellation_requested_by_customer?: boolean;
  cancellation_request_reason?: string;
  cancellation_request_status?: string;
  cancellation_requested_at?: string;
  cancellation_request_responded_at?: string;
  assigned_deliverer_id?: string;
  // Discount information
  club_discount_cents?: number;
  promotion_discount_cents?: number;
  promotion_code?: string;
  subtotal_cents?: number;
}

export interface OrderFilters {
  status?: string[];
  acceptance_status?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private apiService: ApiService) { }

  createSingleOrder(request: CreateSingleOrderRequest): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>('/orders/single', request);
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.apiService.get<OrderResponse[]>('/orders/my-orders');
  }

  getOrderById(id: string): Observable<OrderResponse> {
    return this.apiService.get<OrderResponse>(`/orders/${id}`);
  }

  // Admin order management methods
  getAccountOrders(accountId: string, filters?: OrderFilters, page: number = 0, size: number = 20): Observable<PageResponse<OrderResponse>> {
    let url = `/orders/accounts/${accountId}?page=${page}&size=${size}`;
    
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach(s => {
          url += `&status=${encodeURIComponent(s)}`;
        });
      }
      if (filters.acceptance_status && filters.acceptance_status.length > 0) {
        filters.acceptance_status.forEach(s => {
          url += `&acceptance_status=${encodeURIComponent(s)}`;
        });
      }
      if (filters.date_from) {
        url += `&date_from=${encodeURIComponent(filters.date_from)}`;
      }
      if (filters.date_to) {
        url += `&date_to=${encodeURIComponent(filters.date_to)}`;
      }
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
    }
    
    return this.apiService.get<PageResponse<OrderResponse>>(url);
  }

  acceptOrder(orderId: string, accountId: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/accept`, {});
  }

  rejectOrder(orderId: string, accountId: string, reason: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/reject`, { reason });
  }

  cancelOrderByCompany(orderId: string, accountId: string, reason: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/cancel`, { reason });
  }

  approveCancellation(orderId: string, accountId: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/approve-cancellation`, {});
  }

  rejectCancellation(orderId: string, accountId: string, reason: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/reject-cancellation`, { reason });
  }

  // Customer cancellation request
  requestCancellation(orderId: string, reason: string): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(`/orders/${orderId}/request-cancellation`, { reason });
  }

  // Delivery management
  markAsInTransit(orderId: string, accountId: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/mark-in-transit`, {});
  }
  
  assignDeliverer(orderId: string, accountId: string, delivererId: string): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/assign-deliverer`, {
      deliverer_id: delivererId
    });
  }
  
  startDelivery(orderId: string, latitude?: number, longitude?: number): Observable<OrderResponse> {
    return this.apiService.patch<OrderResponse>(`/orders/${orderId}/start-delivery`, {
      latitude,
      longitude
    });
  }

  confirmDelivery(orderId: string, code: string): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(`/orders/${orderId}/confirm-delivery`, { code });
  }
}
