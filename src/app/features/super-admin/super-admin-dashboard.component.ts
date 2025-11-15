import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService, Account, AccountMetrics, CreateAccountRequest } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { FormatUtil } from '../../shared/utils/format.util';
import { FileUploadService } from '../../core/services/file-upload.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="bg-surface shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p class="text-sm text-gray-600 mt-1">Gerenciamento de empresas e métricas globais</p>
            </div>
            <button (click)="logout()" class="btn-danger">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Métricas Globais -->
        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Métricas Globais</h2>
          <div *ngIf="loadingMetrics" class="text-center py-8 text-gray-500">
            Carregando métricas...
          </div>
          <div *ngIf="metrics && !loadingMetrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="card">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Total de Empresas</h3>
              <p class="text-3xl font-bold text-primary">{{ metrics.total_accounts }}</p>
            </div>
            <div class="card">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Empresas Ativas</h3>
              <p class="text-3xl font-bold text-success">{{ metrics.active_accounts }}</p>
            </div>
            <div class="card">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Empresas Inativas</h3>
              <p class="text-3xl font-bold text-error">{{ metrics.inactive_accounts }}</p>
            </div>
            <div class="card">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Total de Produtos</h3>
              <p class="text-3xl font-bold text-primary">{{ metrics.total_products }}</p>
            </div>
            <div class="card">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Assinaturas Ativas</h3>
              <p class="text-3xl font-bold text-success">{{ metrics.total_active_subscriptions }}</p>
            </div>
          </div>
        </section>

        <!-- Lista de Empresas -->
        <section>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Empresas</h2>
            <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
              {{ showCreateForm ? 'Cancelar' : '+ Nova Empresa' }}
            </button>
          </div>

          <!-- Formulário de Criação -->
          <div *ngIf="showCreateForm" class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Criar Nova Empresa</h3>
            <form (ngSubmit)="createAccount()" #accountForm="ngForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">Nome da Empresa *</label>
                  <input [(ngModel)]="newAccount.companyName" name="companyName" required class="input">
                </div>
                <div>
                  <label class="label">Nome do Administrador *</label>
                  <input [(ngModel)]="newAccount.adminName" name="adminName" required class="input">
                </div>
                <div>
                  <label class="label">Email do Administrador *</label>
                  <input type="email" [(ngModel)]="newAccount.email" name="email" required class="input"
                         pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$">
                </div>
                <div>
                  <label class="label">Senha *</label>
                  <input type="password" [(ngModel)]="newAccount.password" name="password" required class="input"
                         minlength="8"
                         pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$">
                  <p class="mt-1 text-xs text-gray-500">Mínimo 8 caracteres, com pelo menos uma maiúscula, uma minúscula e um número</p>
                </div>
                <div>
                  <label class="label">Moeda</label>
                  <input [(ngModel)]="newAccount.currency" name="currency" class="input"
                         pattern="^[A-Z]{3}$" placeholder="BRL">
                </div>
                <div>
                  <label class="label">Fuso Horário</label>
                  <input [(ngModel)]="newAccount.timezone" name="timezone" class="input"
                         placeholder="America/Sao_Paulo">
                </div>
                <div>
                  <label class="label">Telefone</label>
                  <input [(ngModel)]="newAccount.phone" name="phone" class="input">
                </div>
                <div>
                  <label class="label">Tipo de Documento *</label>
                  <select [(ngModel)]="newAccount.documentType" name="documentType" required class="input">
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </div>
                <div>
                  <label class="label">CPF/CNPJ *</label>
                  <input [(ngModel)]="newAccount.documentNumber" name="documentNumber" required class="input"
                         [placeholder]="newAccount.documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'">
                </div>
                <div>
                  <label class="label">Nome Fantasia</label>
                  <input [(ngModel)]="newAccount.tradeName" name="tradeName" class="input">
                </div>
                <div>
                  <label class="label">Razão Social <span *ngIf="newAccount.documentType === 'CNPJ'" class="text-error">*</span></label>
                  <input [(ngModel)]="newAccount.legalName" name="legalName" 
                         [required]="newAccount.documentType === 'CNPJ'" class="input">
                </div>
                <div class="md:col-span-2">
                  <label class="label">Logo da Empresa</label>
                  <div class="space-y-3">
                    <input type="file" 
                           #logoInput
                           (change)="onLogoSelected($event, logoInput)"
                           accept="image/*"
                           class="input">
                    <div *ngIf="companyLogoPreview" class="mt-3">
                      <img [src]="companyLogoPreview" 
                           alt="Preview" 
                           class="w-32 h-32 object-cover rounded-lg border-2 border-gray-300">
                      <button type="button" 
                              (click)="removeLogo()" 
                              class="mt-2 text-sm text-red-600 hover:text-red-700">
                        Remover logo
                      </button>
                    </div>
                    <div *ngIf="newAccount.imageUrl && !companyLogoPreview" class="mt-3">
                      <p class="text-sm text-gray-600">Logo atual:</p>
                      <img [src]="getImageUrl(newAccount.imageUrl)" 
                           alt="Current logo" 
                           class="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 mt-2">
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="showCreateForm = false" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" [disabled]="creatingAccount" class="btn-primary">
                  {{ creatingAccount ? 'Criando...' : 'Criar Empresa' }}
                </button>
              </div>
              <div *ngIf="error" class="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {{ error }}
              </div>
            </form>
          </div>

          <!-- Tabela de Empresas -->
          <div class="card overflow-hidden">
            <div *ngIf="loadingAccounts" class="text-center py-8 text-gray-500">
              Carregando empresas...
            </div>
            <div *ngIf="accounts && !loadingAccounts">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moeda</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuso Horário</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="bg-surface divide-y divide-gray-200">
                    <tr *ngFor="let account of accounts" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{{ account.company_name }}</div>
                        <div *ngIf="account.trade_name" class="text-xs text-gray-500">{{ account.trade_name }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                          <span *ngIf="account.document_type" class="text-xs text-gray-500">{{ account.document_type }}: </span>
                          {{ formatDocumentNumber(account.document_number, account.document_type) }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ account.currency }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ account.timezone }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ formatDate(account.created_at) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="account.active ? 'badge-success' : 'badge-error'">
                          {{ account.active ? 'Ativa' : 'Inativa' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button (click)="toggleAccountStatus(account)" 
                                [class]="account.active ? 'text-warning hover:text-warning-dark' : 'text-success hover:text-success-dark'"
                                class="mr-3">
                          {{ account.active ? 'Desativar' : 'Ativar' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div *ngIf="accounts && accounts.length === 0" class="text-center py-8 text-gray-500">
                Nenhuma empresa cadastrada
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: []
})
export class SuperAdminDashboardComponent implements OnInit {
  accounts: Account[] | null = null;
  metrics: AccountMetrics | null = null;
  loadingAccounts = false;
  loadingMetrics = false;
  showCreateForm = false;
  creatingAccount = false;
  error: string | null = null;

  newAccount: CreateAccountRequest = {
    companyName: '',
    adminName: '',
    email: '',
    password: '',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    phone: '',
    documentType: 'CNPJ',
    documentNumber: '',
    tradeName: '',
    legalName: '',
    imageUrl: ''
  };

  companyLogoPreview: string | null = null;
  selectedLogoFile: File | null = null;
  uploadingLogo = false;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    // Additional validation in component (defense in depth)
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const role = user.role.toLowerCase();
    if (role !== 'super_admin') {
      // Redirect based on role
      if (role === 'customer') {
        this.router.navigate(['/catalog']);
      } else if (role === 'admin' || role === 'operator') {
        this.router.navigate(['/admin']);
      } else if (role === 'deliverer') {
        this.router.navigate(['/deliverer']);
      } else {
        this.router.navigate(['/login']);
      }
      return;
    }

    // SUPER_ADMIN must have accountId as null
    if (user.accountId !== null) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAccounts();
    this.loadMetrics();
  }

  loadAccounts(): void {
    this.loadingAccounts = true;
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.loadingAccounts = false;
      },
      error: (err) => {
        console.error('Error loading accounts', err);
        this.error = 'Erro ao carregar empresas';
        this.loadingAccounts = false;
      }
    });
  }

  loadMetrics(): void {
    this.loadingMetrics = true;
    this.accountService.getMetrics().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loadingMetrics = false;
      },
      error: (err) => {
        console.error('Error loading metrics', err);
        this.loadingMetrics = false;
      }
    });
  }

  createAccount(): void {
    if (!this.newAccount.companyName || !this.newAccount.adminName || 
        !this.newAccount.email || !this.newAccount.password ||
        !this.newAccount.documentType || !this.newAccount.documentNumber) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    if (this.newAccount.documentType === 'CNPJ' && !this.newAccount.legalName) {
      this.error = 'Razão Social é obrigatória para CNPJ';
      return;
    }

    this.creatingAccount = true;
    this.error = null;

    // Upload logo first if selected
    if (this.selectedLogoFile) {
      this.uploadingLogo = true;
      this.fileUploadService.compressImage(this.selectedLogoFile).then(compressedFile => {
        this.fileUploadService.uploadImage(compressedFile, 'account').subscribe({
          next: (response) => {
            this.newAccount.imageUrl = response.url;
            this.uploadingLogo = false;
            this.performCreateAccount();
          },
          error: (err) => {
            this.uploadingLogo = false;
            this.creatingAccount = false;
            this.error = 'Erro ao fazer upload da logo: ' + (err.error?.error || 'Erro desconhecido');
          }
        });
      }).catch(err => {
        this.uploadingLogo = false;
        this.creatingAccount = false;
        this.error = 'Erro ao comprimir imagem';
      });
      return;
    }

    this.performCreateAccount();
  }

  private performCreateAccount(): void {
    this.accountService.createAccount(this.newAccount).subscribe({
      next: () => {
        this.creatingAccount = false;
        this.showCreateForm = false;
        this.newAccount = { 
          companyName: '', 
          adminName: '', 
          email: '', 
          password: '', 
          currency: 'BRL', 
          timezone: 'America/Sao_Paulo', 
          phone: '',
          documentType: 'CNPJ',
          documentNumber: '',
          tradeName: '',
          legalName: '',
          imageUrl: ''
        };
        this.companyLogoPreview = null;
        this.selectedLogoFile = null;
        this.loadAccounts();
        this.loadMetrics();
      },
      error: (err) => {
        this.creatingAccount = false;
        console.error('Error creating account', err);
        
        if (err.error?.errors) {
          const validationErrors = err.error.errors;
          const errorMessages: string[] = [];
          
          if (validationErrors.password) {
            errorMessages.push(`Senha: ${validationErrors.password}`);
          }
          if (validationErrors.email) {
            errorMessages.push(`Email: ${validationErrors.email}`);
          }
          if (validationErrors.companyName) {
            errorMessages.push(`Nome da Empresa: ${validationErrors.companyName}`);
          }
          if (validationErrors.adminName) {
            errorMessages.push(`Nome do Administrador: ${validationErrors.adminName}`);
          }
          if (validationErrors.currency) {
            errorMessages.push(`Moeda: ${validationErrors.currency}`);
          }
          if (validationErrors.timezone) {
            errorMessages.push(`Fuso Horário: ${validationErrors.timezone}`);
          }
          
          this.error = errorMessages.length > 0 
            ? errorMessages.join('. ') 
            : 'Erro de validação. Verifique os campos preenchidos.';
        } else {
          this.error = err.error?.message || 'Erro ao criar empresa';
        }
      }
    });
  }

  toggleAccountStatus(account: Account): void {
    const action = account.active ? 'desativar' : 'ativar';
    const confirmMessage = account.active 
      ? `Tem certeza que deseja desativar a empresa "${account.company_name}"?`
      : `Tem certeza que deseja ativar a empresa "${account.company_name}"?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const serviceAction = account.active 
      ? this.accountService.deactivateAccount(account.id)
      : this.accountService.activateAccount(account.id);

    serviceAction.subscribe({
      next: () => {
        this.error = null;
        this.loadAccounts();
        this.loadMetrics();
      },
      error: (err) => {
        console.error('Error toggling account status', err);
        this.error = `Erro ao ${action} empresa: ${err.error?.message || 'Erro desconhecido'}`;
      }
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return FormatUtil.formatDate(date);
  }

  formatDocumentNumber(documentNumber: string | undefined, documentType: string | undefined): string {
    if (!documentNumber) return '-';
    const cleaned = documentNumber.replace(/\D/g, '');
    if (documentType === 'CPF' && cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (documentType === 'CNPJ' && cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return documentNumber;
  }

  onLogoSelected(event: Event, input: HTMLInputElement): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error = 'Por favor, selecione um arquivo de imagem';
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.error = 'A imagem deve ter no máximo 5MB';
      return;
    }
    this.selectedLogoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.companyLogoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.companyLogoPreview = null;
    this.newAccount.imageUrl = '';
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}${imageUrl}`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
