import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrderService, OrderFilters } from '../../core/services/order.service';
import { ButtonComponent } from '../../shared/components/design-system/button/button.component';
import { catchError, filter } from 'rxjs/operators';
import { of, Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Mobile Header -->
      <header class="lg:hidden bg-surface border-b border-gray-200 shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button (click)="isSidebarOpen = !isSidebarOpen" class="text-gray-600 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex items-center gap-2">
            <div class="relative">
              <span class="text-xl font-display text-primary font-bold">A</span>
            </div>
            <span class="text-lg font-display text-primary font-bold">Adalana</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
            <div class="relative">
               <span *ngIf="notificationCount > 0" class="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
               <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
        </div>
      </header>

      <!-- Sidebar Backdrop -->
      <div *ngIf="isSidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" (click)="isSidebarOpen = false"></div>

      <!-- Sidebar -->
      <aside [class.-translate-x-full]="!isSidebarOpen" 
             class="fixed inset-y-0 left-0 w-64 bg-surface border-r border-gray-200 shadow-elevation-2 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:float-left lg:h-screen lg:overflow-y-auto">
        <div class="flex flex-col h-full">
          <!-- Logo (Desktop) -->
          <div class="p-6 border-b border-gray-200 hidden lg:block">
            <div class="flex items-center gap-3 mb-2">
              <div class="relative">
                <span class="text-h2 font-display text-primary-light">A</span>
              </div>
              <div class="flex items-baseline gap-0.5">
                <span class="text-h2 font-display text-primary">dalan</span>
                <span class="text-h2 font-display text-secondary">A</span>
              </div>
            </div>
            <p class="text-body-sm text-gray-600">Painel Administrativo</p>
          </div>

          <!-- Mobile Sidebar Header -->
          <div class="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
             <span class="font-bold text-gray-900">Menu</span>
             <button (click)="isSidebarOpen = false" class="text-gray-500">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
            <a routerLink="/admin" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light" 
               [routerLinkActiveOptions]="{exact: true}"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a routerLink="/admin/products" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Produtos
            </a>
            <a routerLink="/admin/customers" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Clientes
            </a>
            <a routerLink="/admin/users" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </a>
            <a routerLink="/admin/profile" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Perfil da Empresa
            </a>
            <a routerLink="/admin/promotions" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Promoções
            </a>
            <a routerLink="/admin/subscription-clubs" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Clubes de Assinatura
            </a>
            <a routerLink="/admin/schedule-settings" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Horários e Agendamento
            </a>
            <a routerLink="/admin/orders" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors relative">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Pedidos
              <span *ngIf="pendingOrdersCount > 0" 
                    class="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-secondary text-white text-caption font-bold rounded-full">
                {{ pendingOrdersCount > 9 ? '9+' : pendingOrdersCount }}
              </span>
            </a>
            <a routerLink="/admin/notifications" routerLinkActive="bg-primary-light/10 text-primary-light border-l-4 border-primary-light"
               (click)="closeSidebar()"
               class="flex items-center px-4 py-3 text-body text-gray-700 rounded-medium hover:bg-gray-100 transition-colors relative">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notificações
              <span *ngIf="notificationCount > 0" 
                    class="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-secondary text-white text-caption font-bold rounded-full">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </a>
          </nav>

          <!-- User Info -->
          <div class="p-4 border-t border-gray-200" *ngIf="isAuthorized()">
            <div class="flex items-center mb-4">
              <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {{ getUserInitial() }}
              </div>
              <div class="ml-3 flex-1 overflow-hidden">
                <p class="text-body-sm font-medium text-primary truncate">{{ getUserName() }}</p>
                <p class="text-caption text-gray-500">{{ getRoleLabel() }}</p>
              </div>
            </div>
            <app-button 
              variant="ghost"
              size="md"
              label="Sair"
              [fullWidth]="true"
              (clicked)="logout()">
            </app-button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="lg:pl-64 flex-1">
        <!-- Header (Desktop) -->
        <header class="bg-surface border-b border-gray-200 shadow-elevation-1 sticky top-0 z-20 hidden lg:block">
          <div class="px-6 py-4">
            <h2 class="text-h2 font-display text-primary">{{ getPageTitle() }}</h2>
          </div>
        </header>

        <!-- Content -->
        <main class="p-4 sm:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  notificationCount = 0;
  pendingOrdersCount = 0;
  isSidebarOpen = false;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ... (rest of the code remains the same)
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

    if (!user.accountId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadNotificationCount();
    this.loadPendingOrdersCount();
    
    // Atualizar contador de notificações quando houver mudanças
    this.subscriptions.add(
      this.notificationService.notificationsUpdated$.subscribe(() => {
        this.loadNotificationCount();
      })
    );
    
    // Atualizar contador de pedidos pendentes quando navegar para a página de pedidos
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        if (event.url === '/admin/orders' || event.url.startsWith('/admin/orders')) {
          this.loadPendingOrdersCount();
        }
      })
    );
    
    // Atualizar contador de pedidos pendentes a cada 30 segundos
    this.subscriptions.add(
      interval(30000).subscribe(() => {
        this.loadPendingOrdersCount();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // ... (helper methods remain the same)
  loadNotificationCount(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.accountId) return;
    
    this.notificationService.getAccountUnreadCount(user.accountId).pipe(
      catchError(() => of(0))
    ).subscribe(count => {
      this.notificationCount = count;
    });
  }

  loadPendingOrdersCount(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.accountId) return;
    
    // Contar apenas pedidos que precisam de atenção do admin:
    // - Pedidos pendentes/notificados que ainda não foram aceitos/rejeitados
    // - Excluir pedidos entregues, cancelados, rejeitados definitivamente
    const filters: OrderFilters = {
      status: ['pending', 'notified'],
      acceptance_status: ['pending']
    };
    
    this.orderService.getAccountOrders(user.accountId, filters, 0, 100).pipe(
      catchError(() => of({ 
        content: [], 
        totalElements: 0, 
        totalPages: 0, 
        size: 100, 
        number: 0, 
        first: true, 
        last: true 
      } as any))
    ).subscribe((page: any) => {
      // Filtrar manualmente para garantir que não contamos pedidos entregues
      const pendingOrders = (page.content || []).filter((order: any) => 
        order.status !== 'delivered' && 
        order.status !== 'cancelled_by_company' && 
        order.status !== 'cancelled_by_customer' &&
        order.acceptance_status === 'pending'
      );
      this.pendingOrdersCount = pendingOrders.length;
    });
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
    if (url.includes('/profile')) return 'Perfil da Empresa';
    if (url.includes('/promotions')) return 'Promoções';
    if (url.includes('/subscription-clubs')) return 'Clubes de Assinatura';
    if (url.includes('/orders')) return 'Pedidos';
    if (url.includes('/notifications')) return 'Notificações';
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
