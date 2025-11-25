import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterCustomerRequest } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent, CardComponent, InputComponent],
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
  emailNotVerified = false;
  resendingVerification = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
    this.emailNotVerified = false;
  }

  resendVerificationEmail(): void {
    if (!this.email) {
      this.error = 'Por favor, informe seu email';
      return;
    }

    this.resendingVerification = true;
    this.error = null;

    this.authService.resendVerification(this.email).subscribe({
      next: () => {
        this.resendingVerification = false;
        this.successMessage = 'Email de verificação reenviado com sucesso! Verifique sua caixa de entrada.';
        this.emailNotVerified = false;
      },
      error: (err) => {
        this.resendingVerification = false;
        this.error = err.error?.message || 'Erro ao reenviar email. Tente novamente mais tarde.';
      }
    });
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
        this.emailNotVerified = false;
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
        const errorMessage = err.error?.message || '';
        
        // Verifica se o erro é de email não verificado
        if (errorMessage.includes('Email não verificado') || errorMessage.includes('email não verificado')) {
          this.emailNotVerified = true;
          this.error = 'Seu email ainda não foi verificado. Por favor, verifique sua caixa de entrada e clique no link de verificação.';
        } else {
          this.emailNotVerified = false;
          this.error = errorMessage || 'Email ou senha incorretos';
        }
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
        this.error = null;
        this.successMessage = `Conta criada com sucesso! Enviamos um email de verificação para ${this.registerData.email}. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta antes de fazer login.`;
        // Limpa o formulário
        this.registerData = {
          name: '',
          email: '',
          password: '',
          phone: ''
        };
        this.confirmPassword = '';
        // Não redireciona automaticamente - deixa o usuário ver a mensagem e fazer login depois
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao criar conta. Tente novamente.';
        console.error('Register error', err);
      }
    });
  }
}
