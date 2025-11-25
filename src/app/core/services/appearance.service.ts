import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Appearance {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bannerImageUrl?: string;
  logoUrl?: string;
  tagline?: string;
  theme?: string;
}

export interface UpdateAppearanceRequest {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bannerImageUrl?: string;
  logoUrl?: string;
  tagline?: string;
  theme?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppearanceService {
  constructor(private apiService: ApiService) {}

  /**
   * Mapeia resposta do backend (snake_case) para interface do frontend (camelCase)
   */
  private mapResponse(response: any): Appearance {
    return {
      primaryColor: response.primary_color || response.primaryColor,
      secondaryColor: response.secondary_color || response.secondaryColor,
      accentColor: response.accent_color || response.accentColor,
      bannerImageUrl: response.banner_image_url || response.bannerImageUrl,
      logoUrl: response.logo_url || response.logoUrl,
      tagline: response.tagline,
      theme: response.theme || 'light'
    };
  }

  /**
   * Converte request do frontend (camelCase) para formato do backend (snake_case)
   */
  private mapRequest(request: UpdateAppearanceRequest): any {
    const mapped: any = {};
    
    if (request.primaryColor !== undefined) {
      mapped.primary_color = request.primaryColor;
    }
    if (request.secondaryColor !== undefined) {
      mapped.secondary_color = request.secondaryColor;
    }
    if (request.accentColor !== undefined) {
      mapped.accent_color = request.accentColor;
    }
    if (request.bannerImageUrl !== undefined) {
      mapped.banner_image_url = request.bannerImageUrl;
    }
    if (request.logoUrl !== undefined) {
      mapped.logo_url = request.logoUrl;
    }
    if (request.tagline !== undefined) {
      mapped.tagline = request.tagline;
    }
    if (request.theme !== undefined) {
      mapped.theme = request.theme;
    }
    
    return mapped;
  }

  /**
   * Obtém a aparência de uma empresa
   */
  getAppearance(accountId: string): Observable<Appearance> {
    return this.apiService.get<any>(`/accounts/${accountId}/appearance`).pipe(
      map(response => this.mapResponse(response))
    );
  }

  /**
   * Atualiza a aparência de uma empresa
   */
  updateAppearance(accountId: string, request: UpdateAppearanceRequest): Observable<Appearance> {
    const payload = this.mapRequest(request);
    return this.apiService.put<any>(`/accounts/${accountId}/appearance`, payload).pipe(
      map(response => this.mapResponse(response))
    );
  }
}

