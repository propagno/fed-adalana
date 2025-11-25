import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const catalogRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalog.component').then(m => m.CatalogComponent)
    // Public access - anyone can browse catalog
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('./company-page/company-page.component').then(m => m.CompanyPageComponent)
    // Public access - anyone can view company details
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./product-details/product-details.component').then(m => m.ProductDetailsComponent)
    // Public access - anyone can view product details
  },
  {
    path: 'products/:id/checkout',
    loadComponent: () => import('./product-checkout/product-checkout.component').then(m => m.ProductCheckoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['customer'] } // Only CUSTOMER can checkout
  },
  {
    path: 'cart-review',
    loadComponent: () => import('./cart-review/cart-review.component').then(m => m.CartReviewComponent),
    canActivate: [roleGuard],
    data: { roles: ['customer'] } // Only CUSTOMER can review cart
  },
  {
    path: 'cart-scheduling',
    loadComponent: () => import('./cart-scheduling/cart-scheduling.component').then(m => m.CartSchedulingComponent),
    canActivate: [roleGuard],
    data: { roles: ['customer'] } // Only CUSTOMER can schedule delivery
  },
  {
    path: 'cart-checkout',
    loadComponent: () => import('./cart-checkout/cart-checkout.component').then(m => m.CartCheckoutComponent),
    canActivate: [roleGuard],
    data: { roles: ['customer'] } // Only CUSTOMER can complete checkout
  },
  {
    path: 'clubs',
    loadComponent: () => import('./subscription-clubs-catalog/subscription-clubs-catalog.component').then(m => m.SubscriptionClubsCatalogComponent)
    // Public access - anyone can view subscription clubs
  },
  {
    path: 'clubs/:id/subscribe',
    loadComponent: () => import('./club-subscribe/club-subscribe.component').then(m => m.ClubSubscribeComponent),
    canActivate: [roleGuard],
    data: { roles: ['customer'] } // Only CUSTOMER can subscribe to clubs
  }
];

