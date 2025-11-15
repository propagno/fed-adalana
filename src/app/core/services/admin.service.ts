import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardOverview {
  account_metrics: AccountMetrics;
  leads_metrics?: LeadsMetrics;
  today_summary: TodaySummary;
  week_summary: WeekSummary;
  month_summary: MonthSummary;
  last_updated: string;
}

export interface AccountMetrics {
  total_customers: number;
  active_customers: number;
  total_products: number;
  active_products: number;
  total_subscriptions: number;
  active_subscriptions: number;
}

export interface LeadsMetrics {
  total_leads: number;
  total_customers: number;
  converted_leads: number;
  conversion_rate: number;
}

export interface TodaySummary {
  scheduled_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  failed_deliveries: number;
  expected_revenue: number;
  collected_revenue: number;
  currency: string;
}

export interface WeekSummary {
  total_deliveries: number;
  success_rate: number;
  total_revenue: number;
  average_daily_revenue: number;
  currency: string;
}

export interface MonthSummary {
  total_deliveries: number;
  success_rate: number;
  total_revenue: number;
  collected_revenue: number;
  pending_revenue: number;
  growth_percentage: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private apiService: ApiService) {}

  getDashboardOverview(): Observable<DashboardOverview> {
    return this.apiService.get<DashboardOverview>('/reports/dashboard');
  }

  getProductsPerformance(startDate: string, endDate: string): Observable<any[]> {
    return this.apiService.get<any[]>('/reports/products-performance', { startDate, endDate });
  }

  getDeliveriesSummary(startDate: string, endDate: string): Observable<any> {
    return this.apiService.get<any>('/reports/deliveries-summary', { startDate, endDate });
  }

  getRevenueReport(period: string = 'monthly', periods: number = 3): Observable<any> {
    return this.apiService.get<any>('/reports/revenue', { period, periods });
  }

  getPendingPayments(): Observable<any> {
    return this.apiService.get<any>('/reports/pending-payments');
  }

  getUpcomingDeliveries(days: number = 7): Observable<any> {
    return this.apiService.get<any>('/reports/upcoming-deliveries', { days });
  }
}
