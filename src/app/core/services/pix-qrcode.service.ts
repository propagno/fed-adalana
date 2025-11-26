import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PixQrCodeRequest {
  amount: number; // Valor em reais
  description?: string; // Descrição opcional
}

export interface PixQrCodeResponse {
  qr_code_string: string; // Código copia-e-cola
  qr_code_image_base64: string; // Imagem base64
  amount: number;
  expires_at: string; // ISO 8601
}

@Injectable({
  providedIn: 'root'
})
export class PixQrCodeService {
  
  constructor(private apiService: ApiService) {}
  
  /**
   * Gera QR Code PIX para assinatura de clube
   */
  generateClubSubscriptionQrCode(
    accountId: string, 
    request: PixQrCodeRequest
  ): Observable<PixQrCodeResponse> {
    return this.apiService.post<PixQrCodeResponse>(
      `/api/accounts/${accountId}/pix/qrcode/club-subscription`,
      request
    );
  }
}

