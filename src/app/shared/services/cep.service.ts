import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly VIA_CEP_API = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Search CEP using ViaCEP API
   */
  searchCEP(cep: string): Observable<CEPResponse | null> {
    const cleanedCEP = cep.replace(/\D/g, '');
    
    if (cleanedCEP.length !== 8) {
      return of(null);
    }

    return this.http.get<CEPResponse>(`${this.VIA_CEP_API}/${cleanedCEP}/json`).pipe(
      map(response => {
        if (response.erro) {
          return null;
        }
        return response;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Format address from CEP response
   */
  formatAddress(cepResponse: CEPResponse): string {
    const parts: string[] = [];
    
    if (cepResponse.logradouro) {
      parts.push(cepResponse.logradouro);
    }
    
    if (cepResponse.bairro) {
      parts.push(cepResponse.bairro);
    }
    
    if (cepResponse.localidade) {
      parts.push(cepResponse.localidade);
    }
    
    if (cepResponse.uf) {
      parts.push(cepResponse.uf);
    }
    
    return parts.join(', ');
  }
}

