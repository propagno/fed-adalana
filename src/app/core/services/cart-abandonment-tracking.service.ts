import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CartAbandonmentMetrics {
  totalAbandoned: number;
  totalRecovered: number;
  recoveryRate: number;
  averageAbandonmentValue: number;
  totalLostRevenue: number;
  abandonmentByStage: {
    stage: string;
    count: number;
    percentage: number;
  }[];
  abandonmentByTimeRange: {
    range: string;
    count: number;
  }[];
}

export interface AbandonedCart {
  id: string;
  cartId: string;
  customerId?: string;
  stage: 'cart' | 'checkout_address' | 'checkout_payment' | 'checkout_review';
  cartValue: number;
  abandonedAt: string;
  timeSpentSeconds: number;
  completed: boolean;
  lastUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartAbandonmentTrackingService {
  private trackingEnabled = new BehaviorSubject<boolean>(true);
  private currentCartId: string | null = null;
  private sessionStartTime: number = Date.now();
  private currentStage: string = 'cart';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Load tracking preference from localStorage
    const saved = localStorage.getItem('cartTrackingEnabled');
    if (saved !== null) {
      this.trackingEnabled.next(saved === 'true');
    }
  }

  trackCartView(cartId: string, accountId: string): void {
    if (!this.trackingEnabled.value) return;
    
    this.currentCartId = cartId;
    this.sessionStartTime = Date.now();
    this.currentStage = 'cart';
    
    this.trackAbandonment(cartId, accountId, 'cart');
  }

  trackCheckoutStage(cartId: string, accountId: string, stage: 'checkout_address' | 'checkout_payment' | 'checkout_review'): void {
    if (!this.trackingEnabled.value) return;
    
    this.currentCartId = cartId;
    this.currentStage = stage;
    
    this.trackAbandonment(cartId, accountId, stage);
  }

  trackCartCompleted(cartId: string, accountId: string): void {
    if (!this.trackingEnabled.value || !this.currentCartId) return;
    
    // Mark as completed - backend will handle this automatically when order is created
    // But we can still track it explicitly if needed
    this.currentCartId = null;
  }

  private trackAbandonment(cartId: string, accountId: string, stage: string, cartValue?: number): void {
    if (!this.trackingEnabled.value) return;
    
    const timeSpent = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    
    // Convert cartValue from reais to BigDecimal format (backend expects BigDecimal)
    const cartValueBigDecimal = cartValue ? cartValue : 0;
    
    // Get session ID from localStorage (same as cart session)
    const sessionId = this.getSessionId(accountId);
    
    const payload: any = {
      cartId: cartId || null,
      accountId: accountId || null,
      sessionId: sessionId || null,
      stage: stage || 'cart',
      cartValue: cartValueBigDecimal, // Backend expects BigDecimal (reais, not cents)
      timeSpentSeconds: timeSpent || 0,
      lastUrl: window.location.href || null
    };
    
    // Only include customerId if user is authenticated
    if (this.authService.isAuthenticated()) {
      // Try to get customer ID from auth service if available
      // For now, we'll leave it null as it's optional
      payload.customerId = null;
    }
    
    this.apiService.post('/analytics/cart-abandonment', payload).subscribe({
      error: (err) => {
        // Silently fail - tracking is not critical
        console.debug('Cart abandonment tracking failed', err);
      }
    });
  }
  
  private getSessionId(accountId: string): string | null {
    try {
      const key = `cartSessionId_${accountId}`;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  
  trackCartViewWithValue(cartId: string, accountId: string, cartValue: number): void {
    if (!this.trackingEnabled.value) return;
    
    this.currentCartId = cartId;
    this.sessionStartTime = Date.now();
    this.currentStage = 'cart';
    
    this.trackAbandonment(cartId, accountId, 'cart', cartValue);
  }
  
  trackCheckoutStageWithValue(cartId: string, accountId: string, stage: 'checkout_address' | 'checkout_payment' | 'checkout_review', cartValue: number): void {
    if (!this.trackingEnabled.value) return;
    
    this.currentCartId = cartId;
    this.currentStage = stage;
    
    this.trackAbandonment(cartId, accountId, stage, cartValue);
  }

  getMetrics(accountId: string, startDate?: string, endDate?: string): Observable<CartAbandonmentMetrics> {
    // Backend endpoint is /analytics/accounts/{id}/abandonment-metrics
    // We'll need to transform the response to match our interface
    return this.apiService.get<any>(`/analytics/accounts/${accountId}/abandonment-metrics`).pipe(
      map((response) => {
        // Transform backend response to our interface
        return {
          totalAbandoned: response.totalAbandoned || 0,
          totalRecovered: response.totalRecovered || 0,
          recoveryRate: response.recoveryRate || 0,
          averageAbandonmentValue: response.averageAbandonmentValue || 0,
          totalLostRevenue: response.totalLostRevenue || 0,
          abandonmentByStage: response.abandonmentByStage || [],
          abandonmentByTimeRange: response.abandonmentByTimeRange || []
        } as CartAbandonmentMetrics;
      })
    );
  }

  getAbandonedCarts(accountId: string, filters?: {
    stage?: string;
    completed?: boolean;
    startDate?: string;
    endDate?: string;
  }): Observable<AbandonedCart[]> {
    // Backend endpoint is /analytics/accounts/{id}/recent-abandoned
    const limit = 50; // Default limit
    return this.apiService.get<any[]>(`/analytics/accounts/${accountId}/recent-abandoned`, { limit }).pipe(
      map((response) => {
        return response.map((item: any) => ({
          id: item.id,
          cartId: item.cartId,
          customerId: item.customerId,
          stage: item.stage as 'cart' | 'checkout_address' | 'checkout_payment' | 'checkout_review',
          cartValue: item.cartValue || 0,
          abandonedAt: item.abandonedAt,
          timeSpentSeconds: item.timeSpentSeconds || 0,
          completed: item.completed || false,
          lastUrl: item.lastUrl
        } as AbandonedCart));
      })
    );
  }

  enableTracking(): void {
    this.trackingEnabled.next(true);
    localStorage.setItem('cartTrackingEnabled', 'true');
  }

  disableTracking(): void {
    this.trackingEnabled.next(false);
    localStorage.setItem('cartTrackingEnabled', 'false');
  }

  isTrackingEnabled(): Observable<boolean> {
    return this.trackingEnabled.asObservable();
  }
}

