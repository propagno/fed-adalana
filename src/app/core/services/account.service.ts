import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Account {
  id: string;
  company_name: string;
  currency: string;
  timezone: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  document_type?: string;
  document_number?: string;
  trade_name?: string;
  legal_name?: string;
  image_url?: string;
  category?: string;
  phone?: string;
  address?: string;
  settings?: {
    pix_key?: string;
    pix_key_type?: string;
    [key: string]: any;
  };
}

export interface AddressDTO {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface CreateAccountRequest {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
  currency?: string;
  timezone?: string;
  phone?: string;
  documentType: string;
  documentNumber: string;
  tradeName?: string;
  legalName?: string;
  imageUrl?: string;
  category?: string;
  address?: string; // Deprecated: use addressDTO
  addressDTO?: AddressDTO; // New structured address
}

export interface AccountMetrics {
  total_accounts: number;
  active_accounts: number;
  inactive_accounts: number;
  users_by_role: { [key: string]: number };
  total_products: number;
  total_active_subscriptions: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private apiService: ApiService) { }

  createAccount(request: CreateAccountRequest): Observable<Account> {
    const payload: any = {
      companyName: request.companyName,
      adminName: request.adminName,
      email: request.email,
      password: request.password,
      currency: request.currency || 'BRL',
      timezone: request.timezone || 'America/Sao_Paulo',
      phone: request.phone,
      documentType: request.documentType,
      documentNumber: request.documentNumber,
      tradeName: request.tradeName,
      legalName: request.legalName,
      imageUrl: request.imageUrl,
      category: request.category
    };
    
    // Prefer structured addressDTO over string address
    if (request.addressDTO) {
      payload.addressDTO = request.addressDTO;
    } else if (request.address) {
      payload.address = request.address;
    }
    
    return this.apiService.post<Account>('/api/accounts', payload);
  }

  getMyAccount(): Observable<Account> {
    return this.apiService.get<Account>('/api/accounts/my-account');
  }

  getAllAccounts(): Observable<Account[]> {
    return this.apiService.get<Account[]>('/api/accounts');
  }

  getAccountById(id: string): Observable<Account> {
    return this.apiService.get<Account>(`/api/accounts/${id}`);
  }

  updateAccount(id: string, data: Partial<Account>): Observable<Account> {
    return this.apiService.put<Account>(`/api/accounts/${id}`, data);
  }

  activateAccount(id: string): Observable<Account> {
    return this.apiService.patch<Account>(`/api/accounts/${id}/activate`, {});
  }

  deactivateAccount(id: string): Observable<Account> {
    return this.apiService.patch<Account>(`/api/accounts/${id}/deactivate`, {});
  }

  getMetrics(): Observable<AccountMetrics> {
    return this.apiService.get<AccountMetrics>('/api/accounts/metrics');
  }

  updatePixKey(accountId: string, pixKey: string, pixKeyType: string): Observable<void> {
    return this.apiService.patch<void>(`/api/accounts/${accountId}/settings/pix-key`, {
      pix_key: pixKey,
      pix_key_type: pixKeyType
    });
  }
}

