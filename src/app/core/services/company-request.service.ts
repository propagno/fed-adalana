import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CompanyRegistrationRequest {
  id: string;
  companyName: string;
  adminName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  tradeName?: string;
  category?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAccountId?: string;
  createdAt: string;
}

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyRequestService {
  constructor(private apiService: ApiService) {}

  listPending(): Observable<CompanyRegistrationRequest[]> {
    return this.apiService.get<CompanyRegistrationRequest[]>('/company-registration-requests/pending');
  }

  approve(id: string): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`/company-registration-requests/${id}/approve`, {});
  }

  reject(id: string, reason: string): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>(`/company-registration-requests/${id}/reject`, { reason });
  }
}
