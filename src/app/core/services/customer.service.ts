import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Customer {
  id: string;
  account_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customer_type?: 'LEAD' | 'CUSTOMER';
  preferred_delivery_day?: string;
  notes?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferred_delivery_day?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  preferred_delivery_day?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private apiService: ApiService) {}

  getCustomers(): Observable<Customer[]> {
    return this.apiService.get<Customer[]>('/customers');
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.apiService.get<Customer>(`/customers/${id}`);
  }

  createCustomer(data: CreateCustomerRequest): Observable<Customer> {
    return this.apiService.post<Customer>('/customers', data);
  }

  updateCustomer(id: string, data: UpdateCustomerRequest): Observable<Customer> {
    return this.apiService.put<Customer>(`/customers/${id}`, data);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.apiService.delete<void>(`/customers/${id}`);
  }

  promoteLeadToCustomer(id: string): Observable<Customer> {
    return this.apiService.post<Customer>(`/customers/${id}/promote`, {});
  }
}

