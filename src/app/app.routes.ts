import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { delivererRoutes } from './features/deliverer/deliverer-routes';
import { adminRoutes } from './features/admin/admin-routes';
import { customerRoutes } from './features/customer/customer-routes';
import { adminGuard } from './core/guards/admin.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';
import { delivererGuard } from './core/guards/deliverer.guard';
import { customerGuard } from './core/guards/customer.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog-routes').then(m => m.catalogRoutes)
    // Public access - no guard needed for viewing
  },
  {
    path: 'deliverer',
    loadChildren: () => import('./features/deliverer/deliverer-routes').then(m => delivererRoutes),
    canActivate: [delivererGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-routes').then(m => adminRoutes),
    canActivate: [adminGuard]
  },
  {
    path: 'super-admin',
    loadChildren: () => import('./features/super-admin/super-admin-routes').then(m => m.superAdminRoutes),
    canActivate: [superAdminGuard]
  },
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer-routes').then(m => customerRoutes),
    canActivate: [customerGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];