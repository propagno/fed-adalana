import { Directive, Input, Output, EventEmitter, HostListener, ElementRef, Optional } from '@angular/core';
import { NgControl, AbstractControl } from '@angular/forms';
import { CepService, CEPResponse } from '../services/cep.service';
import { ValidationService } from '../services/validation.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Directive({
  selector: '[appCepLookup]',
  standalone: true
})
export class CepLookupDirective {
  @Input() addressControl?: AbstractControl | NgControl | null;
  @Input() cityControl?: AbstractControl | NgControl | null;
  @Input() stateControl?: AbstractControl | NgControl | null;
  @Input() neighborhoodControl?: AbstractControl | NgControl | null;
  @Output() cepFound = new EventEmitter<CEPResponse>();
  @Output() cepError = new EventEmitter<string>();

  private cepSubject = new Subject<string>();

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private control: NgControl,
    private cepService: CepService,
    private validationService: ValidationService
  ) {
    // Debounce CEP lookup
    this.cepSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(cep => {
      if (cep && cep.replace(/\D/g, '').length === 8) {
        this.lookupCEP(cep);
      }
    });
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.validationService.formatCEP(input.value);
    
    // Update input value with formatted CEP
    if (formatted !== input.value) {
      input.value = formatted;
      if (this.control) {
        this.control.control?.setValue(formatted, { emitEvent: false });
      }
    }

    // Trigger lookup
    this.cepSubject.next(input.value);
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
      this.lookupCEP(input.value);
    }
  }

  private lookupCEP(cep: string): void {
    this.cepService.searchCEP(cep).subscribe({
      next: (response) => {
        if (response) {
          this.fillAddressFields(response);
          this.cepFound.emit(response);
        } else {
          this.cepError.emit('CEP não encontrado');
        }
      },
      error: () => {
        this.cepError.emit('Erro ao buscar CEP');
      }
    });
  }

  private fillAddressFields(response: CEPResponse): void {
    // Fill address field
    if (this.addressControl && response.logradouro) {
      if (this.addressControl instanceof AbstractControl) {
        this.addressControl.setValue(response.logradouro);
      } else if (this.addressControl.control) {
        this.addressControl.control.setValue(response.logradouro);
      }
    }

    // Fill neighborhood field
    if (this.neighborhoodControl && response.bairro) {
      if (this.neighborhoodControl instanceof AbstractControl) {
        this.neighborhoodControl.setValue(response.bairro);
      } else if (this.neighborhoodControl.control) {
        this.neighborhoodControl.control.setValue(response.bairro);
      }
    }

    // Fill city field
    if (this.cityControl && response.localidade) {
      if (this.cityControl instanceof AbstractControl) {
        this.cityControl.setValue(response.localidade);
      } else if (this.cityControl.control) {
        this.cityControl.control.setValue(response.localidade);
      }
    }

    // Fill state field
    if (this.stateControl && response.uf) {
      if (this.stateControl instanceof AbstractControl) {
        this.stateControl.setValue(response.uf);
      } else if (this.stateControl.control) {
        this.stateControl.control.setValue(response.uf);
      }
    }
  }
}

