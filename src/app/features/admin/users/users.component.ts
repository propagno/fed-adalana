import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, CreateUserRequest, UpdateUserRoleRequest } from '../../../core/services/user.service';
import { FormatUtil } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Usuários</h2>
          <p class="text-sm text-gray-600 mt-1">Gerencie operadores e entregadores</p>
        </div>
        <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
          {{ showCreateForm ? 'Cancelar' : '+ Novo Usuário' }}
        </button>
      </div>

      <div *ngIf="showCreateForm" class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
        </h3>
        <form (ngSubmit)="saveUser()" #userForm="ngForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nome *</label>
              <input [(ngModel)]="userFormData.name" name="name" required class="input">
            </div>
            <div>
              <label class="label">Email *</label>
              <input type="email" [(ngModel)]="userFormData.email" name="email" required class="input">
            </div>
            <div *ngIf="!editingUser">
              <label class="label">Senha *</label>
              <input type="password" [(ngModel)]="userFormData.password" name="password" 
                     required minlength="8" class="input">
              <p class="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>
            <div>
              <label class="label">Telefone</label>
              <input [(ngModel)]="userFormData.phone" name="phone" class="input">
            </div>
            <div>
              <label class="label">Função *</label>
              <select [(ngModel)]="userFormData.role" name="role" required class="input">
                <option value="operator">Operador</option>
                <option value="deliverer">Entregador</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="cancelForm()" class="btn-secondary">Cancelar</button>
            <button type="submit" [disabled]="saving" class="btn-primary">
              {{ saving ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar') }}
            </button>
          </div>
          <div *ngIf="error" class="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {{ error }}
          </div>
        </form>
      </div>

      <div class="card">
        <div *ngIf="loading" class="text-center py-8 text-gray-500">Carregando usuários...</div>
        <div *ngIf="users && !loading">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-surface divide-y divide-gray-200">
                <tr *ngFor="let user of users" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ user.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ user.phone || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge-info">{{ getRoleLabel(user.role) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="user.active ? 'badge-success' : 'badge-error'">
                      {{ user.active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button (click)="editUser(user)" class="text-primary hover:text-primary-dark mr-3">
                      Editar
                    </button>
                    <button (click)="toggleUserStatus(user)" 
                            [class]="user.active ? 'text-warning hover:text-warning-dark' : 'text-success hover:text-success-dark'">
                      {{ user.active ? 'Desativar' : 'Ativar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="users.length === 0" class="text-center py-8 text-gray-500">
            Nenhum usuário cadastrado
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  saving = false;
  showCreateForm = false;
  editingUser: User | null = null;
  error: string | null = null;

  userFormData: CreateUserRequest = {
    name: '',
    email: '',
    password: '',
    role: 'operator',
    phone: undefined
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
      }
    });
  }

  saveUser(): void {
    if (!this.userFormData.name || !this.userFormData.email || 
        (!this.editingUser && !this.userFormData.password)) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.saving = true;
    this.error = null;

    if (this.editingUser) {
      const updateData: UpdateUserRoleRequest = {
        role: this.userFormData.role as 'operator' | 'deliverer'
      };
      this.userService.updateUserRole(this.editingUser.id, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelForm();
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erro ao atualizar usuário';
        }
      });
    } else {
      this.userService.createUser(this.userFormData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelForm();
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erro ao criar usuário';
        }
      });
    }
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userFormData = {
      name: user.name,
      email: user.email,
      password: '', // Don't show password
      role: user.role as 'operator' | 'deliverer',
      phone: user.phone
    };
    this.showCreateForm = true;
  }

  toggleUserStatus(user: User): void {
    const action = user.active
      ? this.userService.deactivateUser(user.id)
      : this.userService.activateUser(user.id);

    action.subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao alterar status do usuário';
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingUser = null;
    this.userFormData = {
      name: '',
      email: '',
      password: '',
      role: 'operator',
      phone: undefined
    };
    this.error = null;
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      operator: 'Operador',
      deliverer: 'Entregador',
      admin: 'Administrador'
    };
    return labels[role] || role;
  }
}

