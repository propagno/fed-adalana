import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    InputComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <app-card class="w-full max-w-md">
        <div class="space-y-6">
          <!-- Header -->
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
              <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-neutral-900">Esqueceu sua senha?</h2>
            <p class="text-sm text-neutral-600">
              Digite seu email e enviaremos instruções para redefinir sua senha.
            </p>
          </div>

          <!-- Success Message -->
          <div *ngIf="success" class="bg-success-50 border border-success-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <svg class="h-5 w-5 text-success-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-success-900">Email enviado!</h4>
                <p class="text-sm text-success-700 mt-1">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <svg class="h-5 w-5 text-danger-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-sm text-danger-700">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <app-input
              label="Email"
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              [autocomplete]="'email'"
              [errorMessage]="getErrorMessage('email')">
            </app-input>

            <app-button
              type="submit"
              variant="primary"
              [disabled]="loading || form.invalid"
              class="w-full">
              {{ loading ? 'Enviando...' : 'Enviar Link de Recuperação' }}
            </app-button>
          </form>

          <!-- Back to Login -->
          <div class="text-center">
            <a
              routerLink="/auth/login"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Voltar ao Login</span>
            </a>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  success = false;
  error = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.success = false;
    this.error = false;
    this.errorMessage = '';

    const email = this.form.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Erro ao processar solicitação. Tente novamente.';
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Email é obrigatório';
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }

    return '';
  }
}

