import { Routes } from '@angular/router';
import { delivererGuard } from '../../core/guards/deliverer.guard';

export const delivererRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./deliverer-dashboard/deliverer-dashboard.component').then(m => m.DelivererDashboardComponent),
    canActivate: [delivererGuard]
  },
  {
    path: 'delivery/:id',
    loadComponent: () => import('./delivery-detail/delivery-detail.component').then(m => m.DeliveryDetailComponent),
    canActivate: [delivererGuard]
  },
  {
    path: 'payment/:id',
    loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [delivererGuard]
  }
];
