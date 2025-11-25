import { Routes } from '@angular/router';
import { customerGuard } from '../../core/guards/customer.guard';

export const customerRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('./my-subscriptions/my-subscriptions.component').then(m => m.MySubscriptionsComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./my-orders/my-orders.component').then(m => m.MyOrdersComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./customer-notifications/customer-notifications.component').then(m => m.CustomerNotificationsComponent),
    canActivate: [customerGuard]
  },
  {
    path: 'my-club-subscription',
    loadComponent: () => import('./my-club-subscription/my-club-subscription.component').then(m => m.MyClubSubscriptionComponent),
    canActivate: [customerGuard]
  }
];

