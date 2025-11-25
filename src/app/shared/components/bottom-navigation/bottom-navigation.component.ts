import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { CartService, CartResponse } from '../../../core/services/cart.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  ariaLabel: string;
}

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="isMobile" 
         class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden"
         role="navigation"
         aria-label="Navegação principal">
      <div class="flex items-center justify-around h-16 px-2">
        <button 
          *ngFor="let item of navItems"
          (click)="navigate(item.route)"
          [attr.aria-label]="item.ariaLabel"
          [attr.aria-current]="isActive(item.route) ? 'page' : null"
          [class.text-blue-600]="isActive(item.route)"
          [class.text-gray-500]="!isActive(item.route)"
          class="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          
          <!-- Icon with badge for cart -->
          <div class="relative">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon" />
            </svg>
            <span *ngIf="item.route === '/catalog' && cartItemCount > 0"
                  class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  [attr.aria-label]="cartItemCount + ' itens no carrinho'">
              {{ cartItemCount > 9 ? '9+' : cartItemCount }}
            </span>
          </div>
          
          <span class="text-xs font-medium">{{ item.label }}</span>
        </button>
      </div>
    </nav>
    
    <!-- Spacer to prevent content from being hidden behind bottom nav -->
    <div *ngIf="isMobile" class="h-16 lg:hidden"></div>
  `,
  styles: []
})
export class BottomNavigationComponent implements OnInit, OnDestroy {
  isMobile = false;
  currentRoute = '';
  cartItemCount = 0;
  
  private destroy$ = new Subject<void>();

  navItems: NavItem[] = [
    {
      label: 'Início',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/catalog',
      ariaLabel: 'Ir para início'
    },
    {
      label: 'Buscar',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      route: '/catalog',
      ariaLabel: 'Buscar produtos'
    },
    {
      label: 'Carrinho',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      route: '/catalog',
      ariaLabel: 'Ver carrinho'
    },
    {
      label: 'Perfil',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      route: '/customer',
      ariaLabel: 'Ver perfil'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.checkMobile();
    this.updateCurrentRoute();
    this.loadCartCount();

    // Listen to route changes
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateCurrentRoute();
        }
      });

    // Listen to window resize
    window.addEventListener('resize', () => this.checkMobile());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkMobile());
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkMobile();
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 1024; // lg breakpoint
  }

  updateCurrentRoute(): void {
    this.currentRoute = this.router.url.split('?')[0];
  }

  isActive(route: string): boolean {
    if (route === '/catalog') {
      return this.currentRoute.startsWith('/catalog');
    }
    if (route === '/customer') {
      return this.currentRoute.startsWith('/customer');
    }
    return this.currentRoute === route;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  loadCartCount(): void {
    // Simplified cart count loading
    // In a real implementation, you'd want to track cart changes via a shared service
    // For now, we'll just set it to 0 and let individual pages update it
    this.cartItemCount = 0;
  }
}

