import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface PlatformSubscription {
  id: string;
  accountId: string;
  status: string;
  demoStartDate?: string;
  demoEndDate?: string;
  daysRemainingInDemo?: number;
  entryFeePaid: boolean;
  entryFeePaidAt?: string;
  commissionPercentage?: number;
  lastBillingDate?: string;
  nextBillingDate?: string;
  totalRevenue?: number;
  totalCommission?: number;
  hasAccess: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequestDTO {
  paymentMethod?: string; // PIX, CREDIT_CARD, etc.
}

export interface PaymentResponseDTO {
  paymentId: string;
  accountId: string;
  amount: number;
  status: string;
  paymentLink?: string;
  qrCode?: string;
  expiresAt?: string;
  createdAt?: string;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformSubscriptionService {
  constructor(private apiService: ApiService) {}

  /**
   * Mapeia resposta do backend (snake_case) para interface do frontend (camelCase)
   */
  private mapSubscriptionResponse(response: any): PlatformSubscription {
    return {
      id: response.id || '',
      accountId: response.account_id || response.accountId || '',
      status: response.status || '',
      demoStartDate: response.demo_start_date || response.demoStartDate,
      demoEndDate: response.demo_end_date || response.demoEndDate,
      daysRemainingInDemo: response.days_remaining_in_demo !== undefined 
        ? response.days_remaining_in_demo 
        : response.daysRemainingInDemo,
      entryFeePaid: response.entry_fee_paid !== undefined 
        ? response.entry_fee_paid 
        : (response.entryFeePaid !== undefined ? response.entryFeePaid : false),
      entryFeePaidAt: response.entry_fee_paid_at || response.entryFeePaidAt,
      commissionPercentage: response.commission_percentage 
        ? parseFloat(response.commission_percentage.toString()) 
        : (response.commissionPercentage ? parseFloat(response.commissionPercentage.toString()) : undefined),
      lastBillingDate: response.last_billing_date || response.lastBillingDate,
      nextBillingDate: response.next_billing_date || response.nextBillingDate,
      totalRevenue: response.total_revenue 
        ? parseFloat(response.total_revenue.toString()) 
        : (response.totalRevenue ? parseFloat(response.totalRevenue.toString()) : undefined),
      totalCommission: response.total_commission 
        ? parseFloat(response.total_commission.toString()) 
        : (response.totalCommission ? parseFloat(response.totalCommission.toString()) : undefined),
      hasAccess: response.has_access !== undefined 
        ? response.has_access 
        : (response.hasAccess !== undefined ? response.hasAccess : false),
      createdAt: response.created_at || response.createdAt,
      updatedAt: response.updated_at || response.updatedAt
    };
  }

  /**
   * Mapeia resposta de pagamento do backend (snake_case) para interface do frontend (camelCase)
   */
  private mapPaymentResponse(response: any): PaymentResponseDTO {
    return {
      paymentId: response.payment_id || response.paymentId || '',
      accountId: response.account_id || response.accountId || '',
      amount: response.amount ? parseFloat(response.amount.toString()) : 0,
      status: response.status || '',
      paymentLink: response.payment_link || response.paymentLink,
      qrCode: response.qr_code || response.qrCode,
      expiresAt: response.expires_at || response.expiresAt,
      createdAt: response.created_at || response.createdAt,
      errorMessage: response.error_message || response.errorMessage
    };
  }

  /**
   * Obtém detalhes da assinatura da plataforma para uma conta
   */
  getSubscription(accountId: string): Observable<PlatformSubscription> {
    return this.apiService.get<any>(`/platform-subscriptions/account/${accountId}`).pipe(
      map(response => this.mapSubscriptionResponse(response))
    );
  }

  /**
   * Marca taxa de adesão como paga (Super Admin apenas)
   */
  payEntryFee(accountId: string): Observable<PlatformSubscription> {
    return this.apiService.post<any>(`/platform-subscriptions/account/${accountId}/pay-entry-fee`, {}).pipe(
      map(response => this.mapSubscriptionResponse(response))
    );
  }

  /**
   * Processa pagamento da taxa de adesão
   */
  processEntryFeePayment(accountId: string, request: PaymentRequestDTO): Observable<PaymentResponseDTO> {
    const payload = {
      payment_method: request.paymentMethod || 'PIX'
    };
    return this.apiService.post<any>(`/platform-subscriptions/account/${accountId}/process-entry-fee-payment`, payload).pipe(
      map(response => this.mapPaymentResponse(response))
    );
  }

  /**
   * Ativa assinatura da plataforma (Super Admin apenas)
   */
  activateSubscription(accountId: string): Observable<PlatformSubscription> {
    return this.apiService.post<any>(`/platform-subscriptions/account/${accountId}/activate`, {}).pipe(
      map(response => this.mapSubscriptionResponse(response))
    );
  }

  /**
   * Suspende assinatura da plataforma (Super Admin apenas)
   */
  suspendSubscription(accountId: string): Observable<PlatformSubscription> {
    return this.apiService.post<any>(`/platform-subscriptions/account/${accountId}/suspend`, {}).pipe(
      map(response => this.mapSubscriptionResponse(response))
    );
  }

  /**
   * Verifica se a conta tem acesso à plataforma
   */
  hasAccess(accountId: string): Observable<boolean> {
    return this.apiService.get<boolean>(`/platform-subscriptions/account/${accountId}/has-access`);
  }
}

