import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Meu Perfil</h2>
        <p class="text-sm text-gray-600 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div class="card max-w-2xl">
        <div class="space-y-4">
          <div>
            <label class="label">Nome</label>
            <input type="text" [(ngModel)]="userName" class="input" readonly>
          </div>
          <div>
            <label class="label">Email</label>
            <input type="email" [(ngModel)]="userEmail" class="input" readonly>
          </div>
          <div>
            <label class="label">Telefone</label>
            <input type="text" [(ngModel)]="userPhone" class="input" readonly>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t">
          <button (click)="logout()" class="btn-error">
            Sair
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerProfileComponent implements OnInit {
  userName = '';
  userEmail = '';
  userPhone = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.email?.split('@')[0] || '';
      this.userEmail = user.email || '';
      this.userPhone = '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

