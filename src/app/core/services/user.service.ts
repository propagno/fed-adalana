import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: string;
  account_id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'operator' | 'deliverer';
  phone?: string;
}

export interface UpdateUserRoleRequest {
  role: 'operator' | 'deliverer';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/users');
  }

  getUserById(id: string): Observable<User> {
    return this.apiService.get<User>(`/users/${id}`);
  }

  createUser(data: CreateUserRequest): Observable<User> {
    return this.apiService.post<User>('/users', data);
  }

  updateUserRole(id: string, data: UpdateUserRoleRequest): Observable<User> {
    return this.apiService.patch<User>(`/users/${id}/role`, data);
  }

  activateUser(id: string): Observable<User> {
    return this.apiService.patch<User>(`/users/${id}/activate`, {});
  }

  deactivateUser(id: string): Observable<User> {
    return this.apiService.patch<User>(`/users/${id}/deactivate`, {});
  }
}

