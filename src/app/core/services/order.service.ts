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
  delivery_date: string; // ISO date string
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
  customer_name?: string;
  delivery_address?: string;
  customer_id?: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  items?: any[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private apiService: ApiService) { }

  createSingleOrder(request: CreateSingleOrderRequest): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>('/orders/single', request);
  }
}
