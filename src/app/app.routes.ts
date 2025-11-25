import { Routes } from '@angular/router';
import { adminRoutes } from './features/admin/admin-routes';
import { customerRoutes } from './features/customer/customer-routes';
import { adminGuard } from './core/guards/admin.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';
import { delivererGuard } from './core/guards/deliverer.guard';
import { customerGuard } from './core/guards/customer.guard';
import { delivererRoutes } from './features/deliverer/deliverer-routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing-page/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    // Manter rota antiga de login para compatibilidade por enquanto, redirecionando para a nova
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog-routes').then(m => m.catalogRoutes)
    // Public browsing allowed, but checkout routes are protected (see catalog-routes.ts)
  },
  {
    path: 'deliverer',
    loadChildren: () => import('./features/deliverer/deliverer-routes').then(m => delivererRoutes),
    canActivate: [delivererGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-routes').then(m => adminRoutes),
    canActivate: [adminGuard] // Only ADMIN and OPERATOR can access
  },
  {
    path: 'super-admin',
    loadChildren: () => import('./features/super-admin/super-admin-routes').then(m => m.superAdminRoutes),
    canActivate: [superAdminGuard] // Only SUPER_ADMIN can access
  },
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer-routes').then(m => customerRoutes),
    canActivate: [customerGuard] // Only CUSTOMER can access
  },
  {
    path: '**',
    redirectTo: '' // Redirecionar para a landing page em caso de erro 404
  }
];
