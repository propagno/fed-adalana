import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register-stepper.component').then(m => m.RegisterStepperComponent)
  },
  {
    path: 'register/company',
    loadComponent: () => import('./register/register-stepper.component').then(m => m.RegisterStepperComponent),
    data: { type: 'company' } // Passar dado para indicar tipo de registro se o componente suportar
  },
  {
    path: 'register/deliverer',
    loadComponent: () => import('./register/register-stepper.component').then(m => m.RegisterStepperComponent),
    data: { type: 'deliverer' }
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  }
];

