import { Component, OnInit, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ButtonComponent } from '../design-system/button/button.component';
import { CartIndicatorComponent } from '../../../features/catalog/cart-indicator/cart-indicator.component';
import { CatalogSearchComponent } from '../../../features/catalog/catalog-search/catalog-search.component';
import { filter, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-marketplace-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CartIndicatorComponent, CatalogSearchComponent],
  template: `
    <header class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 transition-all duration-300 backdrop-blur-sm bg-white/95"
            [class.shadow-md]="isScrolled"
            [class.border-gray-200]="isScrolled"
            role="banner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Main Navbar -->
        <div class="flex items-center justify-between h-16 md:h-20">
          <!-- Logo Adalana - Mobile optimized -->
          <div class="flex items-center gap-1 cursor-pointer flex-shrink-0 active:opacity-80 focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 -ml-1" 
               (click)="goToHome()"
               [attr.aria-label]="'Ir para página inicial'">
            <div class="relative flex items-center justify-center">
              <span class="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary-light lg:hover:text-primary transition-colors duration-200">A</span>
            </div>
            <div class="flex items-baseline gap-0.5">
              <span class="text-xl sm:text-2xl md:text-3xl font-display font-bold text-primary lg:hover:text-primary-light transition-colors duration-200">dalan</span>
              <span class="text-xl sm:text-2xl md:text-3xl font-display font-bold text-secondary lg:hover:text-secondary/90 transition-colors duration-200">A</span>
            </div>
          </div>
          
          <!-- Search Bar (Desktop) -->
          <div class="hidden lg:flex flex-1 max-w-2xl mx-6 xl:mx-10">
            <div class="w-full">
              <app-catalog-search 
                (searchChange)="onSearchChange($event)"
                (searchSubmit)="onSearchSubmit($event)">
              </app-catalog-search>
            </div>
          </div>
          
          <!-- Navigation Links (Desktop) -->
          <nav class="hidden xl:flex items-center gap-1 mr-4" aria-label="Navegação principal">
            <a routerLink="/catalog" 
               routerLinkActive="bg-primary/10 text-primary font-semibold"
               [routerLinkActiveOptions]="{exact: false}"
               class="px-4 py-2 rounded-lg text-body-sm text-gray-700 active:bg-primary/10 active:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:text-primary lg:hover:bg-primary/5 transition-all duration-200 font-medium">
              Catálogo
            </a>
            <a *ngIf="isAuthenticated" 
               routerLink="/customer" 
               routerLinkActive="bg-primary/10 text-primary font-semibold"
               class="px-4 py-2 rounded-lg text-body-sm text-gray-700 active:bg-primary/10 active:text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:text-primary lg:hover:bg-primary/5 transition-all duration-200 font-medium">
              Meu Portal
            </a>
          </nav>
          
          <!-- Right Side Actions -->
          <div class="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <!-- Search Icon (Mobile) -->
            <button *ngIf="!showMobileSearch"
                    (click)="showMobileSearch = true"
                    class="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 active:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:text-primary lg:hover:bg-gray-50 transition-all duration-200"
                    aria-label="Abrir busca">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <!-- Cart Indicator -->
            <div class="hidden sm:block">
              <app-cart-indicator [accountId]="currentAccountId"></app-cart-indicator>
            </div>
            
            <!-- Notifications Badge -->
            <div *ngIf="isAuthenticated" class="relative">
              <button (click)="goToNotifications()"
                      class="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 active:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:text-primary lg:hover:bg-gray-50 transition-all duration-200"
                      [attr.aria-label]="'Notificações' + (notificationCount > 0 ? ' (' + notificationCount + ' não lidas)' : '')">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span *ngIf="notificationCount > 0" 
                      class="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-secondary text-white text-caption font-bold rounded-full">
                  {{ notificationCount > 9 ? '9+' : notificationCount }}
                </span>
              </button>
            </div>
            
            <!-- User Menu -->
            <div *ngIf="isAuthenticated" class="relative" #userMenu>
              <button (click)="toggleUserMenu()"
                      [attr.aria-expanded]="showUserMenu"
                      [attr.aria-label]="'Menu do usuário ' + getUserName()"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-lg active:bg-gray-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 lg:hover:bg-gray-50 transition-all duration-200">
                <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {{ getUserInitial() }}
                </div>
                <svg class="hidden lg:block w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- User Dropdown Menu -->
              <div *ngIf="showUserMenu"
                   class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p class="text-body-sm font-semibold text-gray-900">{{ getUserName() }}</p>
                  <p class="text-caption text-gray-600 mt-0.5">{{ getUserRole() }}</p>
                </div>
                <div class="py-1">
                  <a routerLink="/customer/profile"
                     (click)="showUserMenu = false"
                     class="flex items-center gap-3 px-4 py-2.5 text-body-sm text-gray-700 active:bg-primary/10 active:text-primary focus:ring-2 focus:ring-primary focus:ring-inset lg:hover:bg-primary/5 lg:hover:text-primary transition-all duration-150 min-h-[44px]">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Meu Perfil
                  </a>
                  <a routerLink="/customer/subscriptions"
                     (click)="showUserMenu = false"
                     class="flex items-center gap-3 px-4 py-2.5 text-body-sm text-gray-700 active:bg-primary/10 active:text-primary focus:ring-2 focus:ring-primary focus:ring-inset lg:hover:bg-primary/5 lg:hover:text-primary transition-all duration-150 min-h-[44px]">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Minhas Assinaturas
                  </a>
                  <a routerLink="/customer/orders"
                     (click)="showUserMenu = false"
                     class="flex items-center gap-3 px-4 py-2.5 text-body-sm text-gray-700 active:bg-primary/10 active:text-primary focus:ring-2 focus:ring-primary focus:ring-inset lg:hover:bg-primary/5 lg:hover:text-primary transition-all duration-150 min-h-[44px]">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Meus Pedidos
                  </a>
                </div>
                <div class="border-t border-gray-100 py-1">
                  <button (click)="logout()"
                          class="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-red-600 active:bg-red-100 active:scale-95 focus:ring-2 focus:ring-red-500 focus:ring-inset lg:hover:bg-red-50 transition-all duration-150 min-h-[44px]">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Login Button -->
            <app-button 
              *ngIf="!isAuthenticated" 
              variant="primary"
              size="md"
              label="Entrar"
              (clicked)="goToLogin()"
              ariaLabel="Fazer login"
              class="hidden sm:flex">
            </app-button>
            
            <!-- Mobile Menu Button -->
            <button *ngIf="isAuthenticated"
                    (click)="showMobileMenu = !showMobileMenu"
                    class="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 active:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary focus:ring-offset-1 lg:hover:text-primary lg:hover:bg-gray-50 transition-all duration-200"
                    [attr.aria-expanded]="showMobileMenu"
                    aria-label="Menu mobile">
              <svg *ngIf="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Mobile Search Bar -->
        <div *ngIf="showMobileSearch" 
             class="lg:hidden pb-4 pt-2 animate-slide-down border-t border-gray-100">
          <div class="mb-3">
            <app-catalog-search 
              (searchChange)="onSearchChange($event)"
              (searchSubmit)="onSearchSubmit($event)">
            </app-catalog-search>
          </div>
          <button (click)="showMobileSearch = false"
                  class="w-full py-3 px-4 text-body-sm font-medium text-gray-700 active:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-lg transition-all duration-200 min-h-[44px]">
            Cancelar
          </button>
        </div>
        
        <!-- Mobile Menu -->
        <div *ngIf="showMobileMenu && isAuthenticated"
             class="lg:hidden border-t border-gray-100 py-4 animate-slide-down bg-gray-50/50">
          <nav class="space-y-1 px-2" aria-label="Navegação mobile">
            <a routerLink="/catalog"
               (click)="showMobileMenu = false"
               routerLinkActive="bg-primary text-white font-semibold"
               [routerLinkActiveOptions]="{exact: false}"
               class="block px-4 py-3 text-body-sm text-gray-700 active:bg-white active:text-primary rounded-lg transition-all duration-200 font-medium min-h-[44px] flex items-center">
              Catálogo
            </a>
            <a routerLink="/customer"
               (click)="showMobileMenu = false"
               routerLinkActive="bg-primary text-white font-semibold"
               class="block px-4 py-3 text-body-sm text-gray-700 active:bg-white active:text-primary rounded-lg transition-all duration-200 font-medium min-h-[44px] flex items-center">
              Meu Portal
            </a>
            <a routerLink="/customer/subscriptions"
               (click)="showMobileMenu = false"
               class="block px-4 py-3 text-body-sm text-gray-600 active:bg-white active:text-primary rounded-lg transition-all duration-200 min-h-[44px] flex items-center">
              Minhas Assinaturas
            </a>
            <a routerLink="/customer/orders"
               (click)="showMobileMenu = false"
               class="block px-4 py-3 text-body-sm text-gray-600 active:bg-white active:text-primary rounded-lg transition-all duration-200 min-h-[44px] flex items-center">
              Meus Pedidos
            </a>
            <div class="pt-2 border-t border-gray-200 mt-2">
              <button (click)="logout(); showMobileMenu = false"
                      class="w-full text-left px-4 py-3 text-body-sm font-medium text-red-600 active:bg-red-100 active:scale-95 rounded-lg transition-all duration-200 min-h-[44px] flex items-center">
                Sair
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class MarketplaceNavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isScrolled = false;
  showUserMenu = false;
  showMobileMenu = false;
  showMobileSearch = false;
  currentAccountId: string | null = null;
  notificationCount = 0;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(() => {
        this.isAuthenticated = this.authService.isAuthenticated();
        if (this.isAuthenticated && this.authService.isCustomer()) {
          this.loadNotificationCount();
        }
      })
    );
    
    // Update accountId when route changes
    this.updateAccountId();
    
    // Subscribe to route changes
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.updateAccountId();
      })
    );
    
    // Subscribe to notification updates
    if (this.isAuthenticated && this.authService.isCustomer()) {
      this.loadNotificationCount();
      this.subscriptions.add(
        this.notificationService.notificationsUpdated$.subscribe(() => {
          this.loadNotificationCount();
        })
      );
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  loadNotificationCount(): void {
    this.notificationService.getUnreadCount().pipe(
      catchError(() => of(0))
    ).subscribe(count => {
      this.notificationCount = count;
    });
  }
  
  goToNotifications(): void {
    this.router.navigate(['/customer/notifications']);
  }
  
  private updateAccountId(): void {
    const previousAccountId = this.currentAccountId;
    
    // First, try query params (highest priority for routes like /catalog/clubs/:id/subscribe)
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    
    const queryParams = route.snapshot.queryParams;
    if (queryParams['accountId']) {
      this.currentAccountId = queryParams['accountId'];
    } else {
      // Fallback: try query params from window location
      const urlParams = new URLSearchParams(window.location.search);
      const accountId = urlParams.get('accountId');
      if (accountId) {
        this.currentAccountId = accountId;
      } else {
        // Try to extract from URL path (e.g., /catalog/companies/:id)
        const url = this.router.url;
        const companiesMatch = url.match(/\/catalog\/companies\/([^\/\?]+)/);
        if (companiesMatch && companiesMatch[1]) {
          this.currentAccountId = companiesMatch[1];
        } else {
          // Last resort: try route params, but only if it's from /catalog/companies
          const routeParams = route.snapshot.params;
          if (routeParams['id'] && url.includes('/catalog/companies/')) {
            this.currentAccountId = routeParams['id'];
          } else {
            this.currentAccountId = null;
          }
        }
      }
    }
    
    // Force change detection if accountId changed
    if (previousAccountId !== this.currentAccountId) {
      this.cdr.detectChanges();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  goToHome(): void {
    if (this.router.url === '/catalog') {
      window.location.reload();
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showUserMenu = false;
  }

  onSearchChange(query: string): void {
    // Emit to parent if needed
  }

  onSearchSubmit(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/catalog'], { queryParams: { q: query } });
      this.showMobileSearch = false;
    }
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || user?.email?.split('@')[0] || 'Cliente';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    const role = user.role?.toLowerCase() || '';
    const roleLabels: { [key: string]: string } = {
      customer: 'Cliente',
      admin: 'Administrador',
      operator: 'Operador',
      deliverer: 'Entregador',
      super_admin: 'Super Administrador'
    };
    return roleLabels[role] || role;
  }

  getUserInitial(): string {
    const user = this.authService.getCurrentUser();
    const name = user?.name || user?.email || 'C';
    return name.charAt(0).toUpperCase();
  }

}

