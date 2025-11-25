import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserInfo } from '../../../core/services/auth.service';
import { ButtonComponent } from '../design-system/button/button.component';

@Component({
  selector: 'app-email-verification-banner',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div *ngIf="user && !user.emailVerified" 
         class="bg-warning-50 border-b border-warning-200 px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center space-x-3">
          <svg class="h-5 w-5 text-warning-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div>
            <p class="text-sm font-medium text-warning-900">
              Email não verificado
            </p>
            <p class="text-xs text-warning-700">
              Verifique seu email para ter acesso completo à plataforma.
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <app-button 
            variant="ghost" 
            size="sm"
            (click)="resendEmail()"
            [disabled]="resending">
            {{ resending ? 'Enviando...' : 'Reenviar Email' }}
          </app-button>
          <button 
            (click)="dismiss()"
            class="text-warning-600 hover:text-warning-800 p-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmailVerificationBannerComponent implements OnInit {
  user: UserInfo | null = null;
  resending = false;
  dismissed = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  resendEmail(): void {
    if (!this.user?.email) return;

    this.resending = true;
    this.authService.resendVerification(this.user.email).subscribe({
      next: () => {
        this.resending = false;
        // Toast notification handled by component using this banner
      },
      error: () => {
        this.resending = false;
      }
    });
  }

  dismiss(): void {
    this.dismissed = true;
  }
}

