import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, CreateUserRequest, UpdateUserRoleRequest } from '../../../core/services/user.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DataListComponent } from '../../../shared/components/design-system/data-list/data-list.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    DataListComponent,
    ModalComponent,
    CardComponent,
    ButtonComponent,
    BadgeComponent
  ],
  templateUrl: './users.component.html',
  styles: []
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  saving = false;
  showCreateForm = false;
  editingUser: User | null = null;
  error: string | null = null;
  searchTerm = '';
  roleFilter: 'all' | 'operator' | 'deliverer' = 'all';

  userFormData: CreateUserRequest = {
    name: '',
    email: '',
    password: '',
    role: 'operator',
    phone: undefined
  };

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.toastService.error('Erro ao carregar usuários');
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    let filtered = this.users;

    // Apply role filter
    if (this.roleFilter === 'operator') {
      filtered = filtered.filter(u => u.role === 'operator');
    } else if (this.roleFilter === 'deliverer') {
      filtered = filtered.filter(u => u.role === 'deliverer');
    }

    // Apply search term
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.phone && u.phone.toLowerCase().includes(term))
      );
    }

    this.filteredUsers = filtered;
  }

  setRoleFilter(filter: 'all' | 'operator' | 'deliverer'): void {
    this.roleFilter = filter;
    this.applySearch();
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
          this.toastService.success('Usuário atualizado com sucesso!');
          this.cancelForm();
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Erro ao atualizar usuário');
          this.error = err.error?.message || 'Erro ao atualizar usuário';
        }
      });
    } else {
      this.userService.createUser(this.userFormData).subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Usuário criado com sucesso!');
          this.cancelForm();
          this.loadUsers();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Erro ao criar usuário');
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
    const action = user.active ? 'desativar' : 'ativar';
    this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Usuário`,
      message: `Tem certeza que deseja ${action} o usuário ${user.name}?`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      cancelLabel: 'Cancelar',
      confirmVariant: user.active ? 'warning' : 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        const serviceAction = user.active
          ? this.userService.deactivateUser(user.id)
          : this.userService.activateUser(user.id);

        serviceAction.subscribe({
          next: () => {
            this.toastService.success(`Usuário ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
            this.loadUsers();
          },
          error: (err) => {
            this.toastService.error(err.error?.message || `Erro ao ${action} usuário`);
            this.error = err.error?.message || `Erro ao ${action} usuário`;
          }
        });
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

