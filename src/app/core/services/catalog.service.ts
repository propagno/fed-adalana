import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Company {
  id: string;
  company_name: string;
  currency: string;
  timezone?: string;
  image_url?: string;
}

export interface Product {
  id: string;
  account_id: string;
  name: string;
  sku: string;
  price_cents: number;
  interval: string;
  custom_interval_days?: number;
  description?: string;
  unit_type?: string;
  image_url?: string;
  allows_single_order?: boolean;
}

export interface CreateSubscriptionRequest {
  accountId: string;
  productId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  startDate: string; // ISO date string
  quantity: number;
}

export interface Subscription {
  id: string;
  account_id: string;
  customer_id: string;
  product_id: string;
  start_date: string;
  next_delivery: string;
  status: string;
  quantity: number;
  interval: string;
  custom_interval_days?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private apiService: ApiService) { }

  getActiveCompanies(): Observable<Company[]> {
    return this.apiService.get<Company[]>('/catalog/companies');
  }

  getCompanyById(id: string): Observable<Company> {
    return this.apiService.get<Company>(`/catalog/companies/${id}`);
  }

  getCompanyProducts(companyId: string): Observable<Product[]> {
    return this.apiService.get<Product[]>(`/catalog/companies/${companyId}/products`);
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`/catalog/products/${id}`);
  }

  createSubscription(request: CreateSubscriptionRequest): Observable<Subscription> {
    return this.apiService.post<Subscription>('/catalog/subscriptions', request);
  }
}

