import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';

@Component({
  selector: 'app-reset-password',
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-neutral-900">Redefinir senha</h2>
            <p class="text-sm text-neutral-600">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <!-- Error: No Token -->
          <div *ngIf="!token" class="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <svg class="h-5 w-5 text-danger-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-danger-900">Link inválido</h4>
                <p class="text-sm text-danger-700 mt-1">
                  Token de redefinição não encontrado. Por favor, solicite um novo link.
                </p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div *ngIf="success" class="bg-success-50 border border-success-200 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <svg class="h-5 w-5 text-success-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-success-900">Senha redefinida!</h4>
                <p class="text-sm text-success-700 mt-1">
                  Sua senha foi atualizada com sucesso. Redirecionando para o login...
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
          <form *ngIf="token && !success" [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <app-input
              label="Nova Senha"
              type="password"
              formControlName="newPassword"
              placeholder="••••••••"
              [autocomplete]="'new-password'"
              [errorMessage]="getErrorMessage('newPassword')">
            </app-input>

            <app-input
              label="Confirmar Nova Senha"
              type="password"
              formControlName="confirmPassword"
              placeholder="••••••••"
              [autocomplete]="'new-password'"
              [errorMessage]="getErrorMessage('confirmPassword')">
            </app-input>

            <app-button
              type="submit"
              variant="primary"
              [disabled]="loading || form.invalid"
              class="w-full">
              {{ loading ? 'Redefinindo...' : 'Redefinir Senha' }}
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
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  success = false;
  error = false;
  errorMessage = '';
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.success = false;
    this.error = false;
    this.errorMessage = '';

    const newPassword = this.form.value.newPassword;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'Erro ao redefinir senha. O token pode ter expirado.';
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      // Check form-level errors for confirmPassword
      if (fieldName === 'confirmPassword' && this.form.errors?.['passwordMismatch'] && control?.touched) {
        return 'As senhas não coincidem';
      }
      return '';
    }

    if (control.errors['required']) {
      return fieldName === 'newPassword' ? 'Nova senha é obrigatória' : 'Confirmação de senha é obrigatória';
    }
    if (control.errors['minlength']) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }

    return '';
  }
}

