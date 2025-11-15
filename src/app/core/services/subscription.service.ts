import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Subscription {
  id: string;
  account_id: string;
  customer_id: string;
  product_id: string;
  customer_name?: string;
  customer_email?: string;
  product_name?: string;
  product_sku?: string;
  start_date: string;
  next_delivery: string;
  status: string;
  quantity: number;
  interval: string;
  custom_interval_days?: number;
  pause_reason?: string;
  paused_at?: string;
  paused_until?: string;
  created_at?: string;
  updated_at?: string;
  subscription_notes?: string;
  delivery_instructions?: string;
  preferred_delivery_time?: string;
  cancellation_reason?: string;
  last_delivery_date?: string;
  total_deliveries_count?: number;
  subscription_value?: number;
}

export interface UpdateSubscriptionRequest {
  quantity: number;
  start_date: string;
  next_delivery?: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

export interface PauseSubscriptionRequest {
  reason: string;
  paused_until?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private apiService: ApiService) {}

  getSubscriptions(): Observable<Subscription[]> {
    return this.apiService.get<Subscription[]>('/subscriptions');
  }

  getSubscriptionById(id: string): Observable<Subscription> {
    return this.apiService.get<Subscription>(`/subscriptions/${id}`);
  }

  updateSubscription(id: string, data: UpdateSubscriptionRequest): Observable<Subscription> {
    return this.apiService.put<Subscription>(`/subscriptions/${id}`, data);
  }

  pauseSubscription(id: string, data: PauseSubscriptionRequest): Observable<Subscription> {
    return this.apiService.patch<Subscription>(`/subscriptions/${id}/pause`, data);
  }

  resumeSubscription(id: string): Observable<Subscription> {
    return this.apiService.patch<Subscription>(`/subscriptions/${id}/resume`, {});
  }

  cancelSubscription(id: string, reason?: string): Observable<Subscription> {
    return this.apiService.patch<Subscription>(`/subscriptions/${id}/cancel`, reason ? { reason } : {});
  }

  getMySubscriptions(): Observable<Subscription[]> {
    return this.apiService.get<Subscription[]>('/subscriptions/my-subscriptions');
  }
}

