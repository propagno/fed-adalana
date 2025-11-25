import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../design-system/button/button.component';
import { MapPinIconComponent } from '../icons/map-pin-icon.component';
import { CartIndicatorComponent } from '../../../features/catalog/cart-indicator/cart-indicator.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, MapPinIconComponent, CartIndicatorComponent],
  template: `
    <header class="bg-white shadow-elevation-1 sticky top-0 z-40 border-b border-gray-200" role="banner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <!-- Logo Adalana -->
          <div class="flex items-center gap-3 cursor-pointer" (click)="goToHome()">
            <div class="relative">
              <span class="text-h2 font-display text-primary-light">A</span>
              <app-map-pin-icon 
                size="sm" 
                variant="filled" 
                color="text-primary"
                class="absolute -top-1 left-1/2 transform -translate-x-1/2">
              </app-map-pin-icon>
            </div>
            <div class="flex items-baseline gap-0.5">
              <span class="text-h2 font-display text-primary">dalan</span>
              <span class="text-h2 font-display text-secondary">A</span>
            </div>
          </div>
          
          <!-- Navigation (Desktop) -->
          <nav class="hidden md:flex items-center gap-6" aria-label="Navegação principal">
            <a routerLink="/catalog" 
               routerLinkActive="text-primary-light font-semibold"
               [routerLinkActiveOptions]="{exact: false}"
               class="text-body text-primary hover:text-primary-light transition-colors">
              Catálogo
            </a>
            <a *ngIf="isAuthenticated" 
               routerLink="/customer" 
               routerLinkActive="text-primary-light font-semibold"
               class="text-body text-primary hover:text-primary-light transition-colors">
              Meu Portal
            </a>
          </nav>
          
          <div class="flex items-center gap-4">
            <app-cart-indicator></app-cart-indicator>
            
            <div *ngIf="isAuthenticated" class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-body-sm font-medium text-primary">{{ getUserName() }}</p>
                <p class="text-caption text-gray-500">{{ getUserRole() }}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold cursor-pointer"
                   (click)="goToCustomerPortal()">
                {{ getUserInitial() }}
              </div>
            </div>
            
            <app-button 
              *ngIf="!isAuthenticated" 
              variant="primary"
              size="md"
              label="Entrar"
              (clicked)="goToLogin()"
              ariaLabel="Fazer login">
            </app-button>
            
            <app-button 
              *ngIf="isAuthenticated" 
              variant="ghost"
              size="md"
              label="Sair"
              (clicked)="logout()"
              ariaLabel="Fazer logout">
            </app-button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.authService.authState$.subscribe(() => {
      this.isAuthenticated = this.authService.isAuthenticated();
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToCustomerPortal(): void {
    this.router.navigate(['/customer']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || user?.email?.split('@')[0] || 'Cliente';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || '';
  }

  getUserInitial(): string {
    const user = this.authService.getCurrentUser();
    const name = user?.name || user?.email || 'C';
    return name.charAt(0).toUpperCase();
  }
}

