import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  address: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerAddressRequest {
  label: string;
  address: string;
  is_default?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAddressService {

  constructor(private apiService: ApiService) { }

  /**
   * Get current customer data for a specific account
   */
  getCurrentCustomer(accountId: string): Observable<any> {
    return this.apiService.get<any>(`/customers/me`, { accountId });
  }

  /**
   * Get all saved addresses for the current customer
   * @param accountId Optional - if provided, returns account-specific addresses. Otherwise, returns user-level addresses.
   */
  getAddresses(accountId?: string): Observable<CustomerAddress[]> {
    const params = accountId ? { accountId } : {};
    return this.apiService.get<CustomerAddress[]>(`/customers/me/addresses`, params);
  }

  /**
   * Create a new saved address
   * @param request Address data
   * @param accountId Optional - if provided, creates account-specific address. Otherwise, creates user-level address.
   */
  createAddress(request: CustomerAddressRequest, accountId?: string): Observable<CustomerAddress> {
    const params = accountId ? { accountId } : {};
    return this.apiService.post<CustomerAddress>(`/customers/me/addresses`, request, params);
  }

  /**
   * Update an existing address
   * @param addressId Address ID
   * @param request Address data
   * @param accountId Optional - if provided, updates account-specific address. Otherwise, updates user-level address.
   */
  updateAddress(addressId: string, request: CustomerAddressRequest, accountId?: string): Observable<CustomerAddress> {
    const params = accountId ? { accountId } : {};
    return this.apiService.put<CustomerAddress>(`/customers/me/addresses/${addressId}`, request, params);
  }

  /**
   * Delete an address
   * @param addressId Address ID
   * @param accountId Optional - if provided, deletes account-specific address. Otherwise, deletes user-level address.
   */
  deleteAddress(addressId: string, accountId?: string): Observable<void> {
    const params = accountId ? { accountId } : {};
    return this.apiService.delete<void>(`/customers/me/addresses/${addressId}`, params);
  }

  /**
   * Set an address as default
   * @param addressId Address ID
   * @param accountId Optional - if provided, sets default for account-specific address. Otherwise, sets default for user-level address.
   */
  setAsDefault(addressId: string, accountId?: string): Observable<CustomerAddress> {
    const params = accountId ? { accountId } : {};
    return this.apiService.post<CustomerAddress>(`/customers/me/addresses/${addressId}/set-default`, {}, params);
  }
}

