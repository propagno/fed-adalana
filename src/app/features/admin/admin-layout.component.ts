import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 w-64 bg-surface border-r border-gray-200 shadow-lg">
        <div class="flex flex-col h-full">
          <!-- Logo -->
          <div class="p-6 border-b border-gray-200">
            <h1 class="text-xl font-bold text-primary">Adalana</h1>
            <p class="text-sm text-gray-600">Painel Administrativo</p>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-4 space-y-2">
            <a routerLink="/admin" routerLinkActive="bg-primary/10 text-primary" 
               [routerLinkActiveOptions]="{exact: true}"
               class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a routerLink="/admin/products" routerLinkActive="bg-primary/10 text-primary"
               class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Produtos
            </a>
            <a routerLink="/admin/customers" routerLinkActive="bg-primary/10 text-primary"
               class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Clientes
            </a>
            <a routerLink="/admin/users" routerLinkActive="bg-primary/10 text-primary"
               class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </a>
          </nav>

          <!-- User Info -->
          <div class="p-4 border-t border-gray-200" *ngIf="isAuthorized()">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {{ getUserInitial() }}
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ getUserName() }}</p>
                <p class="text-xs text-gray-500">{{ getRoleLabel() }}</p>
              </div>
            </div>
            <button (click)="logout()" class="w-full btn-secondary text-sm">
              Sair
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="pl-64">
        <!-- Header -->
        <header class="bg-surface border-b border-gray-200 shadow-sm">
          <div class="px-6 py-4">
            <h2 class="text-2xl font-semibold text-gray-900">{{ getPageTitle() }}</h2>
          </div>
        </header>

        <!-- Content -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Additional validation in component (defense in depth)
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const role = user.role.toLowerCase();
    const isAdmin = role === 'admin' || role === 'operator';

    if (!isAdmin) {
      // Redirect based on role
      if (role === 'customer') {
        this.router.navigate(['/catalog']);
      } else if (role === 'super_admin') {
        this.router.navigate(['/super-admin']);
      } else if (role === 'deliverer') {
        this.router.navigate(['/deliverer']);
      } else {
        this.router.navigate(['/login']);
      }
      return;
    }

    // Verify accountId is not null (required for ADMIN/OPERATOR)
    if (!user.accountId) {
      this.router.navigate(['/login']);
      return;
    }
  }

  getUserName(): string {
    const userInfo = this.authService.getCurrentUser();
    return userInfo?.name || userInfo?.email?.split('@')[0] || 'Usuário';
  }

  getUserInitial(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/products')) return 'Produtos';
    if (url.includes('/customers')) return 'Clientes';
    if (url.includes('/users')) return 'Usuários';
    return 'Dashboard';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAuthorized(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    const role = user.role.toLowerCase();
    return (role === 'admin' || role === 'operator') && !!user.accountId;
  }

  getRoleLabel(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    const role = user.role.toLowerCase();
    if (role === 'admin') return 'Administrador';
    if (role === 'operator') return 'Operador';
    return '';
  }
}

