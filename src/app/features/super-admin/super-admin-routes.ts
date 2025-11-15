import { Routes } from '@angular/router';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';
import { superAdminGuard } from '../../core/guards/super-admin.guard';

export const superAdminRoutes: Routes = [
  {
    path: '',
    component: SuperAdminDashboardComponent,
    canActivate: [superAdminGuard]
  }
];

