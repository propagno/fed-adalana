import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AccountAnalytics {
  account_id: string;
  company_name: string;
  total_revenue: number;
  platform_commission: number;
  total_orders: number;
  active_subscriptions: number;
  top_products: ProductSalesReport[];
  order_frequency: OrderFrequencyReport;
  revenue_trend: RevenueTrendReport[];
  orders_by_status: OrdersByStatusReport;
}

export interface ProductSalesReport {
  product_id: string;
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  order_count: number;
}

export interface OrderFrequencyReport {
  orders_by_day_of_week: { [key: string]: number };
  orders_by_month: { [key: string]: number };
  average_orders_per_day: number;
  peak_day: string;
}

export interface RevenueTrendReport {
  month: string;
  revenue: number;
  commission: number;
  order_count: number;
}

export interface OrdersByStatusReport {
  status_distribution: { [key: string]: number };
  total_orders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private apiService: ApiService) { }

  getAccountAnalytics(accountId: string): Observable<AccountAnalytics> {
    return this.apiService.get<AccountAnalytics>(`/super-admin/analytics/accounts/${accountId}`);
  }

  getAccountRevenue(accountId: string, startDate: string, endDate: string): Observable<number> {
    return this.apiService.get<number>(
      `/super-admin/analytics/accounts/${accountId}/revenue?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getAccountCommission(accountId: string, startDate: string, endDate: string): Observable<number> {
    return this.apiService.get<number>(
      `/super-admin/analytics/accounts/${accountId}/commission?startDate=${startDate}&endDate=${endDate}`
    );
  }

  trackEvent(event: { category: string; action: string; label?: string }): void {
    // Simple event tracking - can be extended to send to analytics service
    console.log('Analytics Event:', event);
    // TODO: Implement actual analytics tracking (e.g., Google Analytics, Mixpanel, etc.)
  }

  trackError(error: Error, context?: string): void {
    // Error tracking - can be extended to send to error tracking service
    console.error('Analytics Error:', {
      message: error.message,
      stack: error.stack,
      context: context || 'Unknown'
    });
    // TODO: Implement actual error tracking (e.g., Sentry, LogRocket, etc.)
  }

  trackPerformance(metric: string, value: number): void {
    // Performance tracking - can be extended to send to analytics service
    console.log('Performance Metric:', { metric, value });
    // TODO: Implement actual performance tracking (e.g., Google Analytics, New Relic, etc.)
  }
}
