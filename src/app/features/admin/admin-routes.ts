import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
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
        path: 'profile',
        loadComponent: () => import('./company-profile/company-profile.component').then(m => m.CompanyProfileComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'promotions',
        loadComponent: () => import('./promotions/promotions.component').then(m => m.PromotionsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'subscription-clubs',
        loadComponent: () => import('./subscription-clubs/subscription-clubs.component').then(m => m.SubscriptionClubsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'delivery-settings',
        loadComponent: () => import('./delivery-settings/delivery-settings.component').then(m => m.DeliverySettingsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'schedule-settings',
        loadComponent: () => import('./schedule-settings/schedule-settings.component').then(m => m.ScheduleSettingsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'cart-abandonment',
        loadComponent: () => import('./cart-abandonment/cart-abandonment.component').then(m => m.CartAbandonmentComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./admin-notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent),
        canActivate: [adminGuard]
      }
    ]
  }
];
