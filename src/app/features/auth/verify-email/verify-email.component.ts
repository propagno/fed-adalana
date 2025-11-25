import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <app-card class="w-full max-w-md">
        <div class="text-center space-y-6">
          <!-- Loading State -->
          <div *ngIf="verifying" class="space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
              <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-neutral-900">Verificando email...</h2>
            <p class="text-sm text-neutral-600">Aguarde enquanto confirmamos seu endereço de email.</p>
          </div>

          <!-- Success State -->
          <div *ngIf="!verifying && success" class="space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full">
              <svg class="h-8 w-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-neutral-900">Email verificado com sucesso!</h2>
            <p class="text-sm text-neutral-600">Sua conta está ativa. Redirecionando para o login...</p>
            <div class="pt-2">
              <app-button variant="primary" (click)="goToLogin()">
                Ir para Login
              </app-button>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="!verifying && error" class="space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full">
              <svg class="h-8 w-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-neutral-900">Erro na verificação</h2>
            <p class="text-sm text-neutral-600">{{ errorMessage }}</p>
            <div class="pt-2 space-y-2">
              <app-button variant="primary" (click)="resendVerification()" [disabled]="resending">
                {{ resending ? 'Enviando...' : 'Reenviar Email de Verificação' }}
              </app-button>
              <app-button variant="ghost" (click)="goToLogin()">
                Voltar ao Login
              </app-button>
            </div>
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
export class VerifyEmailComponent implements OnInit {
  verifying = true;
  success = false;
  error = false;
  errorMessage = 'Token inválido ou expirado. Por favor, solicite um novo email de verificação.';
  resending = false;
  token: string | null = null;
  email: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.email = this.route.snapshot.queryParamMap.get('email');

    if (!this.token) {
      this.verifying = false;
      this.error = true;
      this.errorMessage = 'Token de verificação não encontrado. Por favor, verifique o link do email.';
      return;
    }

    this.verifyEmail();
  }

  verifyEmail(): void {
    if (!this.token) return;

    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.verifying = false;
        this.success = true;
        
        // Redirecionar automaticamente após 3 segundos
        setTimeout(() => {
          this.goToLogin();
        }, 3000);
      },
      error: (err) => {
        this.verifying = false;
        this.error = true;
        const errorMsg = err.error?.message || '';
        
        if (errorMsg.includes('expired') || errorMsg.includes('expirado')) {
          this.errorMessage = 'Este link de verificação expirou. Por favor, solicite um novo email de verificação.';
        } else if (errorMsg.includes('already been used') || errorMsg.includes('já foi usado')) {
          this.errorMessage = 'Este link de verificação já foi utilizado. Seu email já está verificado. Você pode fazer login normalmente.';
        } else if (errorMsg.includes('Invalid') || errorMsg.includes('inválido')) {
          this.errorMessage = 'Link de verificação inválido. Por favor, verifique se copiou o link completo do email.';
        } else {
          this.errorMessage = errorMsg || 'Token inválido ou expirado. Por favor, solicite um novo email de verificação.';
        }
      }
    });
  }

  resendVerification(): void {
    if (!this.email) {
      this.errorMessage = 'Email não encontrado. Por favor, faça login e solicite um novo email de verificação.';
      return;
    }

    this.resending = true;
    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.resending = false;
        this.errorMessage = 'Email de verificação reenviado com sucesso! Por favor, verifique sua caixa de entrada.';
      },
      error: (err) => {
        this.resending = false;
        this.errorMessage = err.error?.message || 'Erro ao reenviar email. Tente novamente mais tarde.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}

