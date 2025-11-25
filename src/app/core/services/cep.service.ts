import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface CepResponse {
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
  private readonly viaCepUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  searchCep(cep: string): Observable<CepResponse> {
    // Remove non-numeric characters
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return of({} as CepResponse);
    }

    return this.http.get<CepResponse>(`${this.viaCepUrl}/${cleanCep}/json`).pipe(
      map(response => {
        if (response.erro) {
          throw new Error('CEP não encontrado');
        }
        return response;
      }),
      catchError(() => {
        return of({} as CepResponse);
      })
    );
  }
}

