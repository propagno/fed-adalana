import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CepLookupDirective } from '../../../../shared/directives/cep-lookup.directive';
import { FormValidationDirective } from '../../../../shared/directives/form-validation.directive';
import { ValidationService } from '../../../../shared/services/validation.service';
import { RegisterData } from '../register-stepper.component';

@Component({
  selector: 'app-register-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CepLookupDirective, FormValidationDirective],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Endereço de Entrega</h2>
      <p class="text-gray-600 mb-6">Adicione seu endereço para facilitar as entregas (opcional)</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Phone -->
        <div class="mb-4">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2.5">
            Telefone
          </label>
          <input 
            type="tel"
            id="phone"
            formControlName="phone"
            appFormValidation
            fieldName="Telefone"
            showValidationOn="blur"
            placeholder="(00) 00000-0000"
            (input)="formatPhone($event)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <!-- CEP -->
        <div class="mb-4">
          <label for="cep" class="block text-sm font-medium text-gray-700 mb-2.5">
            CEP
          </label>
          <input 
            type="text"
            id="cep"
            formControlName="cep"
            appCepLookup
            [addressControl]="form.get('address')"
            [cityControl]="form.get('city')"
            [stateControl]="form.get('state')"
            [neighborhoodControl]="form.get('neighborhood')"
            (cepFound)="onCepFound($event)"
            (cepError)="onCepError($event)"
            appFormValidation
            fieldName="CEP"
            showValidationOn="blur"
            placeholder="00000-000"
            maxlength="9"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <p *ngIf="loadingCep" class="mt-1 text-xs text-blue-600">Buscando endereço...</p>
        </div>

        <!-- Address -->
        <div class="mb-4">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-2.5">
            Endereço
          </label>
          <input 
            type="text"
            id="address"
            formControlName="address"
            placeholder="Rua, Avenida, etc."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <!-- Neighborhood -->
        <div class="mb-4">
          <label for="neighborhood" class="block text-sm font-medium text-gray-700 mb-2.5">
            Bairro
          </label>
          <input 
            type="text"
            id="neighborhood"
            formControlName="neighborhood"
            placeholder="Nome do bairro"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <!-- City and State -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label for="city" class="block text-sm font-medium text-gray-700 mb-2.5">
              Cidade
            </label>
            <input 
              type="text"
              id="city"
              formControlName="city"
              placeholder="Cidade"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div>
            <label for="state" class="block text-sm font-medium text-gray-700 mb-2.5">
              Estado
            </label>
            <input 
              type="text"
              id="state"
              formControlName="state"
              placeholder="UF"
              maxlength="2"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>

        <!-- Main Address Checkbox -->
        <div class="mb-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox"
              formControlName="isMainAddress"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-600">
              Definir como endereço principal
            </span>
          </label>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button 
            type="button"
            (click)="onBack()"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Voltar
          </button>
          <button 
            type="button"
            (click)="onSkip()"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Pular
          </button>
          <button 
            type="submit"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Salvar e Continuar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class RegisterAddressComponent implements OnInit {
  @Input() data?: Partial<RegisterData>;
  @Output() next = new EventEmitter<Partial<RegisterData>>();
  @Output() skip = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  form: FormGroup;
  loadingCep = false;

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {
    this.form = this.fb.group({
      phone: [''],
      cep: [''],
      address: [''],
      neighborhood: [''],
      city: [''],
      state: [''],
      isMainAddress: [true]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        phone: this.data.phone || '',
        cep: this.data.cep || '',
        address: this.data.address || '',
        neighborhood: this.data.neighborhood || '',
        city: this.data.city || '',
        state: this.data.state || '',
        isMainAddress: this.data.isMainAddress !== undefined ? this.data.isMainAddress : true
      });
    }
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.validationService.formatPhone(input.value);
    if (formatted !== input.value) {
      input.value = formatted;
      this.form.patchValue({ phone: formatted }, { emitEvent: false });
    }
  }

  onCepFound(response: any): void {
    this.loadingCep = false;
    // Address fields are automatically filled by the directive
  }

  onCepError(message: string): void {
    this.loadingCep = false;
    console.warn('CEP lookup error:', message);
  }

  onSubmit(): void {
    const formValue = this.form.value;
    
    // Build full address string
    const addressParts: string[] = [];
    if (formValue.address) addressParts.push(formValue.address);
    if (formValue.neighborhood) addressParts.push(formValue.neighborhood);
    if (formValue.city) addressParts.push(formValue.city);
    if (formValue.state) addressParts.push(formValue.state);
    if (formValue.cep) addressParts.push(`CEP: ${formValue.cep}`);
    
    const fullAddress = addressParts.join(', ');

    this.next.emit({
      phone: formValue.phone,
      cep: formValue.cep,
      address: fullAddress,
      neighborhood: formValue.neighborhood,
      city: formValue.city,
      state: formValue.state,
      isMainAddress: formValue.isMainAddress
    });
  }

  onSkip(): void {
    this.skip.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}

