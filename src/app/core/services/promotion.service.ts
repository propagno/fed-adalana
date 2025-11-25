import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Promotion {
  id: string;
  account_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  start_date: string;
  end_date: string;
  min_purchase_amount?: number;
  max_uses?: number;
  current_uses: number;
  active: boolean;
  product_ids?: string[];
  combo?: PromotionCombo;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionCombo {
  id: string;
  combo_name: string;
  combo_price_cents: number;
  items: ComboItem[];
}

export interface ComboItem {
  product_id: string;
  quantity: number;
}

export interface CreatePromotionRequest {
  account_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  start_date: string;
  end_date: string;
  min_purchase_amount?: number;
  max_uses?: number;
  product_ids?: string[];
  combo?: {
    combo_name: string;
    combo_price_cents: number;
    items: ComboItem[];
  };
}

export interface ValidatePromotionRequest {
  code: string;
  cart_amount_cents: number;
}

export interface ValidatePromotionResponse {
  valid: boolean;
  message: string;
  discount_amount_cents?: number;
  promotion?: Promotion;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  constructor(private apiService: ApiService) { }

  getPromotionsByAccount(accountId: string): Observable<Promotion[]> {
    return this.apiService.get<Promotion[]>(`/promotions/account/${accountId}`);
  }

  getActivePromotionsByAccount(accountId: string): Observable<Promotion[]> {
    return this.apiService.get<Promotion[]>(`/promotions/account/${accountId}/active`);
  }

  getPromotionByCode(code: string): Observable<Promotion> {
    return this.apiService.get<Promotion>(`/promotions/code/${code}`);
  }

  createPromotion(request: CreatePromotionRequest): Observable<Promotion> {
    return this.apiService.post<Promotion>('/promotions', request);
  }

  validatePromotionCode(request: ValidatePromotionRequest): Observable<ValidatePromotionResponse> {
    return this.apiService.post<ValidatePromotionResponse>('/promotions/validate', request);
  }

  getPromotionById(id: string): Observable<Promotion> {
    return this.apiService.get<Promotion>(`/promotions/${id}`);
  }
}

