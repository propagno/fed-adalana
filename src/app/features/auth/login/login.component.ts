import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterCustomerRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  
  // Login form
  email = '';
  password = '';
  
  // Register form
  registerData: RegisterCustomerRequest = {
    name: '',
    email: '',
    password: '',
    phone: ''
  };
  confirmPassword = '';
  
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
  }

  onSubmitLogin(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = null;

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirect based on role
        if (response.role === 'super_admin') {
          this.router.navigate(['/super-admin']);
        } else if (response.role === 'deliverer') {
          this.router.navigate(['/deliverer']);
        } else if (response.role === 'customer') {
          this.router.navigate(['/catalog']);
        } else {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Email ou senha incorretos';
        console.error('Login error', err);
      }
    });
  }

  onSubmitRegister(): void {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error = 'A senha deve ter no mínimo 6 caracteres';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.authService.registerCustomer(this.registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        setTimeout(() => {
          this.router.navigate(['/catalog']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        console.error('Register error', err);
      }
    });
  }
}
