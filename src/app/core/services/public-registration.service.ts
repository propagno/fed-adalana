import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CompanyRegistrationRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  documentType?: string;
  documentNumber?: string;
  tradeName?: string;
  category?: string;
}

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicRegistrationService {
  
  constructor(private apiService: ApiService) {}

  /**
   * Submit a company registration request
   */
  requestCompanyRegistration(data: CompanyRegistrationRequest): Observable<MessageResponse> {
    return this.apiService.post<MessageResponse>('/public/register/company-request', data);
  }
}

