import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Product {
  id: string;
  account_id: string;
  name: string;
  sku: string;
  price?: number; // Price in reais (BigDecimal from backend)
  price_cents?: number; // Kept for backward compatibility
  interval: string;
  custom_interval_days?: number;
  description?: string;
  unit_type?: string;
  image_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number; // Price in reais
  interval: string;
  custom_interval_days?: number;
  description?: string;
  unit_type?: string;
  image_url?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number; // Price in reais
  interval?: string;
  custom_interval_days?: number;
  description?: string;
  unit_type?: string;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  getProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('/products');
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`/products/${id}`);
  }

  getProductsByAccount(accountId: string): Observable<Product[]> {
    return this.apiService.get<Product[]>(`/api/accounts/${accountId}/products`);
  }

  createProduct(data: CreateProductRequest): Observable<Product> {
    return this.apiService.post<Product>('/products', data);
  }

  updateProduct(id: string, data: UpdateProductRequest): Observable<Product> {
    return this.apiService.put<Product>(`/products/${id}`, data);
  }

  activateProduct(id: string): Observable<Product> {
    return this.apiService.patch<Product>(`/products/${id}/activate`, {});
  }

  deactivateProduct(id: string): Observable<Product> {
    return this.apiService.patch<Product>(`/products/${id}/deactivate`, {});
  }
}

