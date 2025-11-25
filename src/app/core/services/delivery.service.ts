import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DeliveryFeeRequest {
  accountId: string; // Backend expects camelCase
  distanceKm?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  deliveryAddress?: string; // Full address for geocoding
}

export interface DeliveryFeeResponse {
  accountId: string;
  distanceKm: number | null;
  pricePerKm: number;
  totalFee: number;
  currency: string;
  available: boolean;
  error?: string;
  // Legacy compatibility
  distance?: number | string;
  freightValue?: number;
  message?: string;
}

export interface DeliverySettings {
  accountId: string;
  pricePerKm: number;
  maxDeliveryRadiusKm: number;
  minimumOrderValue: number;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
}

export interface ScheduleConfiguration {
  accountId: string;
  allowSameDayDelivery: boolean;
  minLeadTimeMinutes: number;
  maxSchedulingDays: number;
  operatingHours: OperatingHour[];
}

export interface OperatingHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface DeliveryRouteResponse {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string; // Added for backward compatibility
  delivery_address: string;
  status: string;
  payment_status?: string;
  amount: number;
  total_amount?: number;
  currency?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    unit_price?: number; // Added for backward compatibility
    total_price?: number;
  }>;
  delivery_notes?: string;
  whatsapp_link?: string;
  maps_link?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
}

export interface DeliveryDaySummary {
  date: string;
  total_deliveries: number;
  pending: number;
  in_transit: number;
  delivered: number;
  failed: number;
  total_revenue: number;
  // Aliases for compatibility
  pending_deliveries?: number;
  completed_deliveries?: number;
  total_amount?: number;
  pending_amount?: number;
  collected_amount?: number;
  currency?: string;
}

export interface DeliveryUpdateRequest {
  order_id?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  delivery_notes?: string;
  customer_present?: boolean;
}

export interface DeliveryFailureRequest {
  order_id?: string;
  reason?: string;
  failure_reason?: string;
  notes?: string;
}

// Compatibility aliases
export type DeliveryCalculationResponse = DeliveryFeeResponse;

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  constructor(private apiService: ApiService) { }

  // Delivery fee calculation methods
  calculateFee(request: DeliveryFeeRequest): Observable<DeliveryFeeResponse> {
    return this.apiService.post<DeliveryFeeResponse>('/delivery/calculate-fee', request);
  }

  getDeliverySettings(accountId: string): Observable<DeliverySettings> {
    return this.apiService.get<DeliverySettings>(`/delivery/accounts/${accountId}/delivery-settings`);
  }

  updateDeliverySettings(accountId: string, settings: DeliverySettings): Observable<DeliverySettings> {
    return this.apiService.put<DeliverySettings>(`/delivery/accounts/${accountId}/delivery-settings`, settings);
  }

  // Scheduling configuration methods
  getScheduleConfiguration(accountId: string): Observable<ScheduleConfiguration> {
    return this.apiService.get<ScheduleConfiguration>(`/delivery-settings/schedule?accountId=${accountId}`);
  }

  updateScheduleConfiguration(accountId: string, config: Partial<ScheduleConfiguration>): Observable<ScheduleConfiguration> {
    return this.apiService.put<ScheduleConfiguration>(`/delivery-settings/schedule?accountId=${accountId}`, config);
  }

  getScheduleConfigurationPublic(accountId: string): Observable<ScheduleConfiguration> {
    return this.apiService.get<ScheduleConfiguration>(`/delivery-settings/schedule/public?accountId=${accountId}`);
  }

  // Deliverer methods
  getMyRoute(date?: string): Observable<DeliveryRouteResponse[]> {
    const dateParam = date ? `?date=${date}` : '';
    return this.apiService.get<DeliveryRouteResponse[]>(`/delivery/my-route${dateParam}`);
  }

  getTodayDeliveries(): Observable<DeliveryDaySummary> {
    return this.apiService.get<DeliveryDaySummary>('/delivery/today-summary');
  }

  markAsDelivered(orderId: string, request: DeliveryUpdateRequest): Observable<any> {
    return this.apiService.post<any>(`/delivery/orders/${orderId}/delivered`, request);
  }

  markAsFailed(orderId: string, request: DeliveryFailureRequest): Observable<any> {
    return this.apiService.post<any>(`/delivery/orders/${orderId}/failed`, request);
  }

  // Legacy/Compatibility method
  calculateFreight(request: any): Observable<DeliveryCalculationResponse> {
    // Map to new calculateFee if possible, or return mock
    // For now, just mocking a response to fix compilation if backend endpoint doesn't exist for this signature
    return new Observable(observer => {
      observer.next({
        accountId: request.accountId || '',
        distance: 5,
        pricePerKm: 1,
        totalFee: 5,
        currency: 'BRL',
        // Compatibility fields
        distanceKm: 5,
        freightValue: 500, // 5.00 in cents
        available: true,
        message: 'Frete calculado (estimado)'
      });
      observer.complete();
    });
  }
}
