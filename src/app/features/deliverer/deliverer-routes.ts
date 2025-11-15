import { Routes } from '@angular/router';
import { DelivererDashboardComponent } from './deliverer-dashboard/deliverer-dashboard.component';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';
import { PaymentComponent } from './payment/payment.component';
import { delivererGuard } from '../../core/guards/deliverer.guard';

export const delivererRoutes: Routes = [
  {
    path: '',
    component: DelivererDashboardComponent,
    canActivate: [delivererGuard]
  },
  {
    path: 'delivery/:id',
    component: DeliveryDetailComponent,
    canActivate: [delivererGuard]
  },
  {
    path: 'payment/:id',
    component: PaymentComponent,
    canActivate: [delivererGuard]
  }
];
