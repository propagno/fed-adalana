import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface SubscriptionClub {
  id: string;
  accountId: string;
  name: string;
  description: string;
  discountPercentage: number;
  monthlyFee: number;
  active: boolean;
  benefits: string[];
  productIds?: string[];
  subscribersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionClubRequest {
  name: string;
  description?: string;
  discountPercentage: number;
  monthlyFee: number;
  productIds?: string[];
  benefits?: { [key: string]: any }; // Map<String, Object> no backend
}

export interface UpdateSubscriptionClubRequest {
  name?: string;
  description?: string;
  discountPercentage?: number;
  monthlyFee?: number;
  productIds?: string[];
  benefits?: { [key: string]: any }; // Map<String, Object> no backend
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionClubService {
  constructor(private apiService: ApiService) {}

  /**
   * Converte array de strings para objeto Map conforme esperado pelo backend
   */
  private convertBenefitsToMap(benefits: string[]): { [key: string]: any } {
    if (!benefits || benefits.length === 0) {
      return {};
    }
    // Converte array de strings para objeto: {"benefit_0": "texto", "benefit_1": "texto2"}
    return benefits.reduce((acc, benefit, index) => {
      if (benefit && benefit.trim().length > 0) {
        acc[`benefit_${index}`] = benefit.trim();
      }
      return acc;
    }, {} as { [key: string]: any });
  }

  /**
   * Converte objeto Map do backend para array de strings
   */
  private convertBenefitsToArray(benefits: any): string[] {
    if (!benefits) {
      return [];
    }
    if (Array.isArray(benefits)) {
      return benefits;
    }
    if (typeof benefits === 'object') {
      // Converte objeto para array: {"benefit_0": "texto", "benefit_1": "texto2"} -> ["texto", "texto2"]
      return Object.values(benefits).filter(v => v && typeof v === 'string') as string[];
    }
    return [];
  }

  /**
   * Mapeia resposta do backend (snake_case) para interface do frontend (camelCase)
   */
  private mapResponse(response: any): SubscriptionClub {
    return {
      id: response.id || '',
      accountId: response.account_id || response.accountId || '',
      name: response.name || '',
      description: response.description || '',
      discountPercentage: response.discount_percentage 
        ? parseFloat(response.discount_percentage.toString()) 
        : (response.discountPercentage ? parseFloat(response.discountPercentage.toString()) : 0),
      monthlyFee: response.monthly_fee 
        ? parseFloat(response.monthly_fee.toString()) 
        : (response.monthlyFee ? parseFloat(response.monthlyFee.toString()) : 0),
      active: response.active !== undefined ? response.active : true,
      benefits: this.convertBenefitsToArray(response.benefits),
      productIds: response.product_ids || response.productIds || [],
      subscribersCount: response.subscribers_count || response.subscribersCount,
      createdAt: response.created_at || response.createdAt,
      updatedAt: response.updated_at || response.updatedAt
    };
  }

  /**
   * Converte request do frontend (camelCase) para formato do backend (snake_case)
   */
  private mapRequest(request: CreateSubscriptionClubRequest | UpdateSubscriptionClubRequest): any {
    const mapped: any = {};
    
    if ('name' in request && request.name !== undefined) {
      mapped.name = request.name;
    }
    if ('description' in request && request.description !== undefined) {
      mapped.description = request.description;
    }
    if ('discountPercentage' in request && request.discountPercentage !== undefined) {
      mapped.discount_percentage = request.discountPercentage;
    }
    if ('monthlyFee' in request && request.monthlyFee !== undefined) {
      mapped.monthly_fee = request.monthlyFee;
    }
    if ('productIds' in request && request.productIds !== undefined) {
      mapped.product_ids = request.productIds;
    }
    if ('active' in request && request.active !== undefined) {
      mapped.active = request.active;
    }
    
    // Benefits: se for array, converte para objeto; se já for objeto, mantém
    if ('benefits' in request && request.benefits !== undefined) {
      if (Array.isArray(request.benefits)) {
        mapped.benefits = this.convertBenefitsToMap(request.benefits as any);
      } else {
        mapped.benefits = request.benefits;
      }
    }
    
    return mapped;
  }

  /**
   * Cria um novo clube de assinatura
   */
  createClub(accountId: string, request: CreateSubscriptionClubRequest): Observable<SubscriptionClub> {
    const payload = this.mapRequest(request);
    return this.apiService.post<any>(`/accounts/${accountId}/subscription-clubs`, payload).pipe(
      map(response => this.mapResponse(response))
    );
  }

  /**
   * Lista todos os clubes de assinatura de uma conta
   */
  getClubs(accountId: string): Observable<SubscriptionClub[]> {
    return this.apiService.get<any[]>(`/accounts/${accountId}/subscription-clubs`).pipe(
      map(clubs => clubs.map(club => this.mapResponse(club)))
    );
  }

  /**
   * Obtém um clube de assinatura por ID
   */
  getClubById(accountId: string, clubId: string): Observable<SubscriptionClub> {
    return this.apiService.get<any>(`/accounts/${accountId}/subscription-clubs/${clubId}`).pipe(
      map(response => this.mapResponse(response))
    );
  }

  /**
   * Atualiza um clube de assinatura
   */
  updateClub(accountId: string, clubId: string, request: UpdateSubscriptionClubRequest): Observable<SubscriptionClub> {
    const payload = this.mapRequest(request);
    return this.apiService.put<any>(`/accounts/${accountId}/subscription-clubs/${clubId}`, payload).pipe(
      map(response => this.mapResponse(response))
    );
  }

  /**
   * Deleta um clube de assinatura
   */
  deleteClub(accountId: string, clubId: string): Observable<void> {
    return this.apiService.delete<void>(`/accounts/${accountId}/subscription-clubs/${clubId}`);
  }

  /**
   * Ativa um clube de assinatura
   */
  activateClub(accountId: string, clubId: string): Observable<SubscriptionClub> {
    return this.apiService.patch<any>(`/accounts/${accountId}/subscription-clubs/${clubId}/activate`, {}).pipe(
      map(response => this.mapResponse(response))
    );
  }

  /**
   * Desativa um clube de assinatura
   */
  deactivateClub(accountId: string, clubId: string): Observable<SubscriptionClub> {
    return this.apiService.patch<any>(`/accounts/${accountId}/subscription-clubs/${clubId}/deactivate`, {}).pipe(
      map(response => this.mapResponse(response))
    );
  }
}

