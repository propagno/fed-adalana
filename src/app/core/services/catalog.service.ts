import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Company {
  id: string;
  company_name: string;
  currency?: string;
  timezone?: string;
  image_url?: string;
  category?: string;
  phone?: string;
  address?: string;
  rating?: number;
  deliveryTime?: string;
  averagePrice?: string;
  featuredProducts?: Product[];
  hasSubscriptionClub?: boolean;
  distance?: number;
  appearance?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    bannerImageUrl?: string;
    logoUrl?: string;
    tagline?: string;
    theme?: string;
  };
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
  customerEmail?: string;
  customerPhone: string;
  customerAddress: string;
  startDate: string; // ISO date string
  quantity: number;
  preferredDeliveryDay?: number; // Day of week (1-7) or day of month (1-31)
  preferredDeliveryTime?: string; // "morning", "afternoon", "evening"
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

export interface CatalogSearchResponse {
  companies: Company[];
  products: Product[];
  total_companies: number;
  total_products: number;
  total_results: number;
  query: string;
  filters_applied: {
    category?: string;
    type?: string;
    min_price_cents?: number;
    max_price_cents?: number;
  };
}

export interface Category {
  name: string;
  count: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  type?: 'subscription' | 'single_order';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'distance' | 'rating' | 'price';
  distance?: number;
  rating?: number;
  hasSubscriptionClub?: boolean;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private apiService: ApiService) { }

  getActiveCompanies(): Observable<Company[]> {
    // Cache this request for 5 minutes (handled by cache interceptor)
    return this.apiService.get<Company[]>('/catalog/companies', undefined, true);
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

  search(filters: SearchFilters): Observable<CatalogSearchResponse> {
    const params: any = {};
    if (filters.query) params.q = filters.query;
    if (filters.category) params.category = filters.category;
    if (filters.type) params.type = filters.type;
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.distance !== undefined) params.distance = filters.distance;
    if (filters.rating !== undefined) params.rating = filters.rating;
    if (filters.hasSubscriptionClub !== undefined) params.hasSubscriptionClub = filters.hasSubscriptionClub;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.size !== undefined) params.size = filters.size;
    
    return this.apiService.get<CatalogSearchResponse>('/catalog/search', params);
  }

  getCompanyAppearance(companyId: string): Observable<Company['appearance']> {
    return this.apiService.get<Company['appearance']>(`/accounts/${companyId}/appearance`);
  }

  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('/catalog/categories', undefined, true);
  }

  getSubscriptionClubs(accountId: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/accounts/${accountId}/subscription-clubs`);
  }
}

