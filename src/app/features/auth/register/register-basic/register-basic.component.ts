import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../shared/services/validation.service';
import { PasswordStrengthComponent } from '../../../../shared/components/password-strength/password-strength.component';
import { FormValidationDirective } from '../../../../shared/directives/form-validation.directive';
import { RegisterData } from '../register-stepper.component';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-register-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordStrengthComponent, FormValidationDirective],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h2>
      <p class="text-gray-600 mb-6">Preencha seus dados básicos para começar</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Name -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2.5">
            Nome Completo <span class="text-red-500">*</span>
          </label>
          <input 
            type="text"
            id="name"
            formControlName="name"
            appFormValidation
            fieldName="Nome"
            showValidationOn="blur"
            placeholder="Seu nome completo"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2.5">
            Email <span class="text-red-500">*</span>
          </label>
          <input 
            type="email"
            id="email"
            formControlName="email"
            appFormValidation
            fieldName="Email"
            showValidationOn="blur"
            placeholder="seu@email.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <!-- Password -->
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2.5">
            Senha <span class="text-red-500">*</span>
          </label>
          <input 
            type="password"
            id="password"
            formControlName="password"
            appFormValidation
            fieldName="Senha"
            showValidationOn="blur"
            placeholder="Mínimo 8 caracteres"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <app-password-strength [password]="form.get('password')?.value || ''"></app-password-strength>
        </div>

        <!-- Terms -->
        <div class="mb-6">
          <label class="flex items-start gap-2 cursor-pointer">
            <input 
              type="checkbox"
              formControlName="acceptTerms"
              class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
            <span class="text-sm text-gray-600">
              Eu aceito os <a href="/terms" target="_blank" class="text-blue-600 hover:underline">termos de uso</a> 
              e <a href="/privacy" target="_blank" class="text-blue-600 hover:underline">política de privacidade</a>
            </span>
          </label>
          <p *ngIf="form.get('acceptTerms')?.invalid && form.get('acceptTerms')?.touched" 
             class="mt-1 text-sm text-red-600">
            Você deve aceitar os termos para continuar
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button 
            type="button"
            (click)="onCancel()"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button 
            type="submit"
            [disabled]="form.invalid || registering"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <span *ngIf="!registering">Criar Conta</span>
            <span *ngIf="registering" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Criando...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class RegisterBasicComponent implements OnInit {
  @Input() data?: Partial<RegisterData>;
  @Output() next = new EventEmitter<Partial<RegisterData>>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  registering = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.validationService.passwordStrengthValidator()]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name || '',
        email: this.data.email || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.registering = true;

    // Register customer
    this.authService.registerCustomer({
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.value.password,
      phone: ''
    }).subscribe({
      next: () => {
        this.registering = false;
        this.toastService.success('Conta criada com sucesso!');
        this.next.emit({
          name: this.form.value.name,
          email: this.form.value.email,
          password: this.form.value.password
        });
      },
      error: (err) => {
        this.registering = false;
        this.toastService.error(err.error?.message || 'Erro ao criar conta');
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}

