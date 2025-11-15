import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'products',
        loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customers.component').then(m => m.CustomersComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent),
        canActivate: [adminGuard]
      }
    ]
  }
];
