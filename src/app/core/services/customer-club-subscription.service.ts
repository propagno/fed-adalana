import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { SubscriptionClub } from './subscription-club.service';

export interface CustomerClubSubscription {
  id: string;
  customerId: string;
  clubId: string;
  subscriptionClubId: string;
  status: 'active' | 'paused' | 'cancelled';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  pausedUntil?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  club?: SubscriptionClub;
  customerName?: string;
  totalSaved?: number; // Total amount saved with benefits
  monthsActive?: number;
}

export interface SubscribeToClubRequest {
  acceptedTerms: boolean;
  autoRenew?: boolean;
  paymentMethodId?: string; // For future payment integration
}

export interface PauseSubscriptionRequest {
  reason?: string;
  pausedUntil?: string; // ISO date string
}

export interface CancelSubscriptionRequest {
  reason?: string;
  cancelImmediately?: boolean;
}

export interface PaymentHistoryItem {
  id: string;
  billingDate: string;
  amountCents: number;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'PAUSED' | 'CANCELLED';
  paidAt?: string;
  paymentMethod?: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerClubSubscriptionService {
  constructor(private apiService: ApiService) {}

  /**
   * Subscribe current customer to a club
   */
  subscribeToClub(accountId: string, clubId: string, request?: Partial<SubscribeToClubRequest>): Observable<CustomerClubSubscription> {
    // Backend espera camelCase (acceptedTerms, autoRenew)
    const payload: any = {
      acceptedTerms: request?.acceptedTerms !== undefined ? Boolean(request.acceptedTerms) : true,
      autoRenew: request?.autoRenew !== undefined ? Boolean(request.autoRenew) : true
    };
    
    if (request?.paymentMethodId) {
      payload.paymentMethodId = request.paymentMethodId;
    }
    
    return this.apiService.post<any>(`/api/accounts/${accountId}/club-subscriptions/${clubId}/subscribe`, payload).pipe(
      map(response => this.mapResponse(response))
    );
  }

  /**
   * Get current customer's club subscription
   */
  getMyClubSubscription(accountId: string): Observable<CustomerClubSubscription | null> {
    return this.apiService.get<any>(`/api/accounts/${accountId}/club-subscriptions/my-subscription`).pipe(
      map(response => response ? this.mapResponse(response) : null),
      // Handle 404 and 500 as null (no subscription yet or error - silently fail)
      catchError((error: HttpErrorResponse) => {
        // 404 = not found (no subscription), 500 = server error (treat as no subscription)
        if (error.status === 404 || error.status === 500) {
          return of(null);
        }
        // Re-throw other errors
        throw error;
      })
    );
  }

  /**
   * Get all customer's club subscriptions (including past ones)
   */
  getMyClubSubscriptions(accountId: string): Observable<CustomerClubSubscription[]> {
    // Note: This endpoint may not exist yet, using the single subscription endpoint for now
    return this.apiService.get<any[]>(`/api/accounts/${accountId}/club-subscriptions/my-subscription`).pipe(
      map(subscriptions => Array.isArray(subscriptions) ? subscriptions.map(sub => this.mapResponse(sub)) : [])
    );
  }

  /**
   * Pause current club subscription
   */
  pauseClubSubscription(accountId: string, subscriptionId: string, request: PauseSubscriptionRequest): Observable<CustomerClubSubscription> {
    const payload = {
      reason: request.reason,
      paused_until: request.pausedUntil
    };
    return this.apiService.post<any>(`/api/accounts/${accountId}/club-subscriptions/my-subscription/pause`, payload).pipe(
      map(() => ({}) as CustomerClubSubscription) // Pause returns 204, so we return empty object
    );
  }

  /**
   * Resume paused club subscription
   */
  resumeClubSubscription(accountId: string, subscriptionId: string): Observable<CustomerClubSubscription> {
    return this.apiService.post<any>(`/api/accounts/${accountId}/club-subscriptions/my-subscription/resume`, {}).pipe(
      map(() => ({}) as CustomerClubSubscription) // Resume returns 204, so we return empty object
    );
  }

  /**
   * Cancel club subscription
   */
  cancelClubSubscription(accountId: string, subscriptionId: string, request?: CancelSubscriptionRequest): Observable<CustomerClubSubscription> {
    // Backend espera apenas 'reason' (opcional)
    // Sempre enviar um objeto, mesmo que vazio
    const payload: any = {};
    if (request && request.reason && request.reason.trim()) {
      payload.reason = request.reason.trim();
    }
    return this.apiService.post<any>(`/api/accounts/${accountId}/club-subscriptions/my-subscription/cancel`, payload).pipe(
      map(() => ({}) as CustomerClubSubscription) // Cancel returns 204, so we return empty object
    );
  }

  /**
   * Get payment history for club subscription
   */
  getPaymentHistory(accountId: string): Observable<PaymentHistoryItem[]> {
    return this.apiService.get<PaymentHistoryItem[]>(`/api/accounts/${accountId}/club-subscriptions/my-subscription/payment-history`);
  }

  /**
   * Map backend response to frontend interface
   */
  private mapResponse(response: any): CustomerClubSubscription {
    // Map club details if present
    let club: SubscriptionClub | undefined;
    if (response.club) {
      const clubData = response.club;
      club = {
        id: clubData.id || '',
        accountId: clubData.account_id || clubData.accountId || '',
        name: clubData.name || '',
        description: clubData.description || '',
        discountPercentage: clubData.discount_percentage || clubData.discountPercentage || 0,
        monthlyFee: clubData.monthly_fee || clubData.monthlyFee || (clubData.monthlyFeeCents ? clubData.monthlyFeeCents / 100 : 0),
        productIds: clubData.product_ids || clubData.productIds || [],
        benefits: clubData.benefits || [],
        active: clubData.active !== undefined ? clubData.active : true,
        subscribersCount: clubData.subscribers_count || clubData.subscribersCount,
        createdAt: clubData.created_at || clubData.createdAt || '',
        updatedAt: clubData.updated_at || clubData.updatedAt || ''
      };
    }

    // Convert status to lowercase (backend returns UPPERCASE enum names)
    const status = response.status ? response.status.toLowerCase() : 'active';
    
    return {
      id: response.id || '',
      customerId: response.customer_id || response.customerId || '',
      clubId: response.club_id || response.clubId || (club?.id || ''),
      subscriptionClubId: response.subscription_club_id || response.subscriptionClubId || '',
      status: status as 'active' | 'paused' | 'cancelled',
      startDate: response.start_date || response.startDate || '',
      endDate: response.end_date || response.endDate,
      nextBillingDate: response.next_billing_date || response.nextBillingDate,
      pausedUntil: response.paused_until || response.pausedUntil,
      cancellationReason: response.cancellation_reason || response.cancellationReason,
      createdAt: response.created_at || response.createdAt || '',
      updatedAt: response.updated_at || response.updatedAt || '',
      club: club,
      customerName: response.customer_name || response.customerName,
      totalSaved: response.total_saved || response.totalSaved || (response.total_savings_cents ? response.total_savings_cents / 100 : 0),
      monthsActive: response.months_active || response.monthsActive
    };
  }
}

