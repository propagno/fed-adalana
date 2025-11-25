import { Routes } from '@angular/router';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';
import { superAdminGuard } from '../../core/guards/super-admin.guard';

export const superAdminRoutes: Routes = [
  {
    path: '',
    component: SuperAdminDashboardComponent,
    canActivate: [superAdminGuard]
  },
  {
    path: 'company-requests',
    loadComponent: () => import('./company-requests/company-requests.component').then(m => m.CompanyRequestsComponent),
    canActivate: [superAdminGuard]
  },
  {
    path: 'analytics/:id',
    loadComponent: () => import('./account-analytics/account-analytics.component').then(m => m.AccountAnalyticsComponent),
    canActivate: [superAdminGuard]
  }
];

