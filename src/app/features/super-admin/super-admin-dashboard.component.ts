import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AccountService, Account, AccountMetrics, CreateAccountRequest } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { FormatUtil } from '../../shared/utils/format.util';
import { FileUploadService } from '../../core/services/file-upload.service';
import { environment } from '../../../environments/environment';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { ToastService } from '../../shared/services/toast.service';
import { InputComponent } from '../../shared/components/design-system/input/input.component';
import { ButtonComponent } from '../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../shared/components/design-system/card/card.component';
import { CepLookupDirective } from '../../shared/directives/cep-lookup.directive';
import { CepService } from '../../shared/services/cep.service';
import { AccountValidators } from '../../shared/validators/account.validators';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    NgxMaskDirective,
    InputComponent,
    ButtonComponent,
    CardComponent,
    CepLookupDirective
  ],
  providers: [provideNgxMask()],
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
            <div class="card cursor-pointer hover:shadow-lg transition-shadow" (click)="filterByStatus(null)">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Total de Empresas</h3>
              <p class="text-3xl font-bold text-primary">{{ metrics.total_accounts }}</p>
              <p class="text-xs text-gray-500 mt-1">Clique para ver todas</p>
            </div>
            <div class="card cursor-pointer hover:shadow-lg transition-shadow" (click)="filterByStatus(true)">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Empresas Ativas</h3>
              <p class="text-3xl font-bold text-success">{{ metrics.active_accounts }}</p>
              <p class="text-xs text-gray-500 mt-1">Clique para filtrar</p>
            </div>
            <div class="card cursor-pointer hover:shadow-lg transition-shadow" (click)="filterByStatus(false)">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Empresas Inativas</h3>
              <p class="text-3xl font-bold text-error">{{ metrics.inactive_accounts }}</p>
              <p class="text-xs text-gray-500 mt-1">Clique para filtrar</p>
            </div>
            <div class="card">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Total de Produtos</h3>
              <p class="text-3xl font-bold text-primary">{{ metrics.total_products }}</p>
            </div>
            <div class="card cursor-pointer hover:shadow-lg transition-shadow" (click)="viewActiveSubscriptions()">
              <h3 class="text-sm font-medium text-gray-600 mb-2">Assinaturas Ativas</h3>
              <p class="text-3xl font-bold text-success">{{ metrics.total_active_subscriptions }}</p>
              <p class="text-xs text-gray-500 mt-1">Clique para ver detalhes</p>
            </div>
          </div>
        </section>

        <!-- Lista de Empresas -->
        <section>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Empresas</h2>
            <button (click)="toggleCreateForm()" class="btn-primary">
              {{ showCreateForm ? 'Cancelar' : '+ Nova Empresa' }}
            </button>
          </div>

          <!-- Busca e Filtros -->
          <div class="mb-4 flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="applyFilters()"
                placeholder="Buscar por nome da empresa..."
                class="w-full px-4 py-2 border border-gray-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
            <div>
              <select
                [(ngModel)]="statusFilter"
                (ngModelChange)="applyFilters()"
                class="px-4 py-2 border border-gray-300 rounded-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                <option [value]="null">Todas</option>
                <option [value]="true">Ativas</option>
                <option [value]="false">Inativas</option>
              </select>
            </div>
          </div>

          <!-- Formulário de Criação -->
          <app-card *ngIf="showCreateForm" [elevation]="2" padding="lg" class="mb-6">
            <h3 class="text-h3 text-primary mb-6">Criar Nova Empresa</h3>
            <form (ngSubmit)="createAccount()" [formGroup]="accountForm" class="space-y-0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nome da Empresa -->
                <app-input
                  formControlName="companyName"
                  label="Nome da Empresa"
                  [required]="true"
                  [maxLength]="255"
                  [showCharacterCount]="true"
                  placeholder="Digite o nome da empresa"
                  [errorMessage]="getFieldError('companyName')">
                </app-input>

                <!-- Nome do Administrador -->
                <app-input
                  formControlName="adminName"
                  label="Nome do Administrador"
                  [required]="true"
                  [maxLength]="255"
                  [showCharacterCount]="true"
                  placeholder="Digite o nome completo"
                  [errorMessage]="getFieldError('adminName')">
                </app-input>

                <!-- Email do Administrador -->
                <app-input
                  formControlName="email"
                  type="email"
                  label="Email do Administrador"
                  [required]="true"
                  [maxLength]="255"
                  placeholder="exemplo@email.com"
                  [errorMessage]="getFieldError('email')">
                </app-input>

                <!-- Senha -->
                <app-input
                  formControlName="password"
                  type="password"
                  label="Senha"
                  [required]="true"
                  placeholder="Mínimo 8 caracteres"
                  helperText="Mínimo 8 caracteres, com pelo menos uma maiúscula, uma minúscula e um número"
                  [errorMessage]="getFieldError('password')">
                </app-input>

                <!-- Telefone -->
                <div class="mb-4">
                  <label class="block text-body-sm font-medium text-adalana mb-2.5">
                    Telefone
                  </label>
                  <input
                    formControlName="phone"
                    type="tel"
                    mask="(00) 00000-0000"
                    [maxlength]="15"
                    placeholder="(00) 00000-0000"
                    class="w-full px-4 py-2.5 border rounded-medium text-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-adalana-light focus:ring-adalana-light">
                  <p *ngIf="getFieldError('phone')" class="mt-1.5 text-body-sm text-error">
                    {{ getFieldError('phone') }}
                  </p>
                </div>

                <!-- Tipo de Documento -->
                <div class="mb-4">
                  <label class="block text-body-sm font-medium text-adalana mb-2.5">
                    Tipo de Documento
                    <span class="text-adalana-accent ml-1">*</span>
                  </label>
                  <select 
                    formControlName="documentType"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-adalana-light focus:ring-adalana-light"
                    (change)="onDocumentTypeChange()">
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                  <p *ngIf="accountForm.get('documentType')?.hasError('required') && accountForm.get('documentType')?.touched" 
                     class="mt-1.5 text-body-sm text-error">
                    Tipo de documento é obrigatório
                  </p>
                </div>

                <!-- CPF/CNPJ -->
                <div class="mb-4">
                  <label class="block text-body-sm font-medium text-adalana mb-2.5">
                    CPF/CNPJ
                    <span class="text-adalana-accent ml-1">*</span>
                  </label>
                  <input
                    formControlName="documentNumber"
                    [mask]="getDocumentMask()"
                    [maxlength]="18"
                    [placeholder]="getDocumentPlaceholder()"
                    class="w-full px-4 py-2.5 border rounded-medium text-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-adalana-light focus:ring-adalana-light"
                    [class.border-error]="accountForm.get('documentNumber')?.hasError('required') && accountForm.get('documentNumber')?.touched">
                  <p *ngIf="getFieldError('documentNumber')" class="mt-1.5 text-body-sm text-error">
                    {{ getFieldError('documentNumber') }}
                  </p>
                </div>

                <!-- Nome Fantasia -->
                <app-input
                  formControlName="tradeName"
                  label="Nome Fantasia"
                  [maxLength]="255"
                  [showCharacterCount]="true"
                  placeholder="Nome comercial (opcional)"
                  [errorMessage]="getFieldError('tradeName')">
                </app-input>

                <!-- Razão Social -->
                <app-input
                  formControlName="legalName"
                  label="Razão Social"
                  [required]="isLegalNameRequired()"
                  [maxLength]="255"
                  [showCharacterCount]="true"
                  placeholder="Razão social completa"
                  [errorMessage]="getFieldError('legalName')">
                </app-input>
              </div>

              <!-- Seção de Endereço -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <h4 class="text-h4 text-primary mb-4">Endereço da Empresa</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- CEP -->
                  <div class="mb-4">
                    <label class="block text-body-sm font-medium text-adalana mb-2.5">
                      CEP
                    </label>
                    <input
                      formControlName="cep"
                      appCepLookup
                      [addressControl]="accountForm.get('street')"
                      [cityControl]="accountForm.get('city')"
                      [stateControl]="accountForm.get('state')"
                      [neighborhoodControl]="accountForm.get('neighborhood')"
                      (cepFound)="onCepFound($event)"
                      (cepError)="onCepError($event)"
                      mask="00000-000"
                      [maxlength]="9"
                      placeholder="00000-000"
                      [class.border-error]="accountForm.get('cep')?.invalid && accountForm.get('cep')?.touched"
                      class="w-full px-4 py-2.5 border rounded-medium text-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-adalana-light focus:ring-adalana-light">
                    <p *ngIf="loadingCep" class="mt-1.5 text-body-sm text-info">Buscando endereço...</p>
                    <p *ngIf="getFieldError('cep')" class="mt-1.5 text-body-sm text-error">
                      {{ getFieldError('cep') }}
                    </p>
                  </div>

                  <!-- Logradouro -->
                  <app-input
                    formControlName="street"
                    label="Logradouro"
                    [maxLength]="255"
                    placeholder="Rua, Avenida, etc."
                    [errorMessage]="getFieldError('street')">
                  </app-input>

                  <!-- Número -->
                  <app-input
                    formControlName="number"
                    label="Número"
                    [maxLength]="20"
                    placeholder="123"
                    [errorMessage]="getFieldError('number')">
                  </app-input>

                  <!-- Complemento -->
                  <app-input
                    formControlName="complement"
                    label="Complemento"
                    [maxLength]="100"
                    placeholder="Apto, Bloco, etc. (opcional)"
                    [errorMessage]="getFieldError('complement')">
                  </app-input>

                  <!-- Bairro -->
                  <app-input
                    formControlName="neighborhood"
                    label="Bairro"
                    [maxLength]="100"
                    placeholder="Nome do bairro"
                    [errorMessage]="getFieldError('neighborhood')">
                  </app-input>

                  <!-- Cidade -->
                  <app-input
                    formControlName="city"
                    label="Cidade"
                    [maxLength]="100"
                    placeholder="Nome da cidade"
                    [errorMessage]="getFieldError('city')">
                  </app-input>

                  <!-- Estado (UF) -->
                  <div class="mb-4">
                    <label class="block text-body-sm font-medium text-adalana mb-2.5">
                      Estado (UF)
                    </label>
                    <input
                      formControlName="state"
                      [maxlength]="2"
                      placeholder="SP"
                      class="w-full px-4 py-2.5 border rounded-medium text-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-adalana-light focus:ring-adalana-light uppercase"
                      style="text-transform: uppercase;">
                    <p *ngIf="getFieldError('state')" class="mt-1.5 text-body-sm text-error">
                      {{ getFieldError('state') }}
                    </p>
                  </div>

                  <!-- País (fixo) -->
                  <app-input
                    formControlName="country"
                    label="País"
                    [readonly]="true"
                    [maxLength]="50"
                    placeholder="Brasil">
                  </app-input>
                </div>
              </div>

              <!-- Logo da Empresa -->
              <div class="mt-6 pt-6 border-t border-gray-200">
                <label class="block text-body-sm font-medium text-adalana mb-2.5">Logo da Empresa</label>
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
                    <div *ngIf="accountForm.get('imageUrl')?.value && !companyLogoPreview" class="mt-3">
                      <p class="text-sm text-gray-600">Logo atual:</p>
                      <img [src]="getImageUrl(accountForm.get('imageUrl')?.value)" 
                           alt="Current logo" 
                           class="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 mt-2">
                    </div>
                  </div>
              </div>
              <div class="flex justify-end gap-3 pt-6">
                <app-button 
                  variant="outline" 
                  size="md"
                  [label]="'Cancelar'"
                  (clicked)="toggleCreateForm()"
                  [disabled]="creatingAccount">
                </app-button>
                <app-button 
                  variant="primary" 
                  size="md"
                  [label]="creatingAccount ? 'Criando...' : 'Criar Empresa'"
                  (clicked)="createAccount()"
                  [disabled]="isCreateButtonDisabled()"
                  type="submit">
                </app-button>
              </div>
              <div *ngIf="error" class="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {{ error }}
              </div>
            </form>
          </app-card>

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
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="bg-surface divide-y divide-gray-200">
                    <tr *ngFor="let account of paginatedAccounts" class="hover:bg-gray-50">
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
                        <div class="text-sm text-gray-900">{{ formatDate(account.created_at) }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span [class]="account.active ? 'badge-success' : 'badge-error'">
                          {{ account.active ? 'Ativa' : 'Inativa' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button (click)="viewAccountAnalytics(account.id!)" 
                                class="text-primary hover:text-primary-dark mr-3">
                          Analytics
                        </button>
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
              <!-- Paginação -->
              <div *ngIf="filteredAccounts && filteredAccounts.length > 0" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-700">
                    Mostrando <span class="font-medium">{{ getStartIndex() }}</span>
                    até <span class="font-medium">{{ getEndIndex() }}</span>
                    de <span class="font-medium">{{ filteredAccounts.length }}</span> empresas
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      (click)="previousPage()"
                      [disabled]="!hasPreviousPage"
                      [class.opacity-50]="!hasPreviousPage"
                      [class.cursor-not-allowed]="!hasPreviousPage"
                      class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-medium hover:bg-gray-50 disabled:hover:bg-white">
                      Anterior
                    </button>
                    <div class="flex items-center gap-1">
                      <button
                        *ngFor="let page of getPageNumbers()"
                        (click)="goToPage(page)"
                        [class.bg-primary]="page === currentPage"
                        [class.text-white]="page === currentPage"
                        [class.bg-white]="page !== currentPage"
                        [class.text-gray-700]="page !== currentPage"
                        class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-medium hover:bg-gray-50">
                        {{ page }}
                      </button>
                    </div>
                    <button
                      (click)="nextPage()"
                      [disabled]="!hasNextPage"
                      [class.opacity-50]="!hasNextPage"
                      [class.cursor-not-allowed]="!hasNextPage"
                      class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-medium hover:bg-gray-50 disabled:hover:bg-white">
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
              <div *ngIf="filteredAccounts && filteredAccounts.length === 0 && accounts && accounts.length > 0" class="text-center py-8 text-gray-500">
                Nenhuma empresa encontrada com os filtros aplicados
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
export class SuperAdminDashboardComponent implements OnInit, AfterViewInit {
  accounts: Account[] | null = null;
  metrics: AccountMetrics | null = null;
  loadingAccounts = false;
  loadingMetrics = false;
  showCreateForm = false;
  creatingAccount = false;
  error: string | null = null;

  accountForm!: FormGroup;
  companyLogoPreview: string | null = null;
  selectedLogoFile: File | null = null;
  uploadingLogo = false;
  loadingCep = false;
  
  // Search and filter
  searchTerm = '';
  statusFilter: boolean | null = null;
  filteredAccounts: Account[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Cached values to avoid ExpressionChangedAfterItHasBeenCheckedError
  private _documentType: string = 'CNPJ';

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private fileUploadService: FileUploadService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private cepService: CepService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  initForm(): void {
    this.accountForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(255)]],
      adminName: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      ]],
      phone: ['', [Validators.maxLength(15)]],
      documentType: ['CNPJ', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      tradeName: ['', [Validators.maxLength(255)]],
      legalName: ['', []],
      // Endereço completo - todos opcionais
      cep: ['', [Validators.maxLength(9), this.cepValidator]],
      street: ['', [Validators.maxLength(255)]],
      number: ['', [Validators.maxLength(20)]],
      complement: ['', [Validators.maxLength(100)]],
      neighborhood: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(2)]],
      country: ['Brasil', []]
    });

    // Atualizar validação de legalName e documentNumber quando documentType mudar
    // Usar pipe para evitar ExpressionChangedAfterItHasBeenCheckedError
    this.accountForm.get('documentType')?.valueChanges.pipe().subscribe((value) => {
      this._documentType = value || 'CNPJ';
      // Executar fora do ciclo de detecção
      Promise.resolve().then(() => {
        this.updateLegalNameValidation();
        this.updateDocumentNumberValidation();
      });
    });
  }

  ngAfterViewInit(): void {
    // Sem operações assíncronas no AfterViewInit
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  updateLegalNameValidation(): void {
    const legalNameControl = this.accountForm.get('legalName');
    
    if (!legalNameControl) return;
    
    if (this._documentType === 'CNPJ') {
      legalNameControl.setValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      legalNameControl.setValidators([Validators.maxLength(255)]);
    }
    legalNameControl.updateValueAndValidity({ emitEvent: false });
  }
  
  updateDocumentNumberValidation(): void {
    const documentNumberControl = this.accountForm.get('documentNumber');
    
    if (!documentNumberControl) return;
    
    if (this._documentType === 'CPF') {
      documentNumberControl.setValidators([Validators.required, AccountValidators.cpf]);
    } else if (this._documentType === 'CNPJ') {
      documentNumberControl.setValidators([Validators.required, AccountValidators.cnpj]);
    } else {
      documentNumberControl.setValidators([Validators.required]);
    }
    documentNumberControl.updateValueAndValidity({ emitEvent: false });
  }

  onDocumentTypeChange(): void {
    // Limpar documentNumber quando mudar o tipo
    this.accountForm.get('documentNumber')?.setValue('');
    // Atualizar cache imediatamente
    this._documentType = this.accountForm.get('documentType')?.value || 'CNPJ';
    this.updateLegalNameValidation();
    this.updateDocumentNumberValidation();
  }

  resetForm(): void {
    this.accountForm.reset({
      companyName: '',
      adminName: '',
      email: '',
      password: '',
      phone: '',
      documentType: 'CNPJ',
      documentNumber: '',
      tradeName: '',
      legalName: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brasil'
    });
    this.companyLogoPreview = null;
    this.selectedLogoFile = null;
    this.error = null;
    // Resetar cache
    this._documentType = 'CNPJ';
    this.updateLegalNameValidation();
    this.updateDocumentNumberValidation();
  }

  isLegalNameRequired(): boolean {
    return this._documentType === 'CNPJ';
  }

  getDocumentMask(): string {
    return this._documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  getDocumentPlaceholder(): string {
    return this._documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  get isFormInvalid(): boolean {
    if (!this.accountForm) return true;
    return this.accountForm.invalid;
  }

  isCreateButtonDisabled(): boolean {
    return this.creatingAccount || this.isFormInvalid;
  }

  // Custom CEP validator
  cepValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Campo opcional
    }
    
    // Remove máscara (deixa apenas números)
    const cepNumbers = control.value.replace(/\D/g, '');
    
    // CEP deve ter exatamente 8 dígitos
    if (cepNumbers.length !== 8) {
      return { 'cepInvalid': { value: control.value, message: 'CEP deve ter 8 dígitos' } };
    }
    
    return null;
  }

  getFieldError(fieldName: string): string {
    const control = this.accountForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['pattern']) {
      if (fieldName === 'password') {
        return 'Senha deve conter pelo menos uma maiúscula, uma minúscula e um número';
      }
      return 'Formato inválido';
    }
    if (control.errors['cepInvalid']) {
      return control.errors['cepInvalid'].message || 'CEP inválido';
    }
    return '';
  }

  onCepFound(response: any): void {
    this.loadingCep = false;
    // Campos são preenchidos automaticamente pela diretiva
  }

  onCepError(message: string): void {
    this.loadingCep = false;
    this.toastService.showError('CEP não encontrado. Por favor, preencha o endereço manualmente.');
  }


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
        this.applyFilters();
        this.loadingAccounts = false;
      },
      error: (err) => {
        console.error('Error loading accounts', err);
        this.error = 'Erro ao carregar empresas';
        this.loadingAccounts = false;
      }
    });
  }

  applyFilters(): void {
    if (!this.accounts) {
      this.filteredAccounts = [];
      this.currentPage = 1;
      return;
    }

    let filtered = [...this.accounts];

    // Filter by search term (busca em nome da empresa, nome fantasia, CPF/CNPJ)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(account => {
        const companyName = account.company_name?.toLowerCase() || '';
        const tradeName = account.trade_name?.toLowerCase() || '';
        const documentNumber = account.document_number?.replace(/\D/g, '') || '';
        const searchTermNumbers = term.replace(/\D/g, '');
        
        return companyName.includes(term) || 
               tradeName.includes(term) ||
               (searchTermNumbers.length > 0 && documentNumber.includes(searchTermNumbers));
      });
    }

    // Filter by status
    if (this.statusFilter !== null) {
      filtered = filtered.filter(account => account.active === this.statusFilter);
    }

    this.filteredAccounts = filtered;
    this.currentPage = 1; // Reset to first page when filtering
  }

  get paginatedAccounts(): Account[] {
    if (!this.filteredAccounts || this.filteredAccounts.length === 0) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAccounts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    if (!this.filteredAccounts || this.filteredAccounts.length === 0) {
      return 0;
    }
    return Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of table
      setTimeout(() => {
        const tableElement = document.querySelector('table');
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getStartIndex(): number {
    if (!this.filteredAccounts || this.filteredAccounts.length === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    if (!this.filteredAccounts || this.filteredAccounts.length === 0) {
      return 0;
    }
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredAccounts.length);
  }

  filterByStatus(status: boolean | null): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  viewAccountAnalytics(accountId: string): void {
    this.router.navigate(['/super-admin/analytics', accountId]);
  }

  viewActiveSubscriptions(): void {
    this.statusFilter = true;
    this.applyFilters();
    // Scroll to table
    setTimeout(() => {
      const tableElement = document.querySelector('section:last-child');
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
    // Marcar todos os campos como touched para mostrar erros
    if (this.accountForm.invalid) {
      Object.keys(this.accountForm.controls).forEach(key => {
        this.accountForm.get(key)?.markAsTouched();
      });
      this.error = 'Por favor, corrija os erros no formulário';
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
            this.uploadingLogo = false;
            this.performCreateAccount(response.url);
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
        this.error = 'Erro ao comprimir imagem: ' + err.message;
      });
      return;
    }

    this.performCreateAccount();
  }

  private performCreateAccount(imageUrl?: string): void {
    const formValue = this.accountForm.value;
    
    // Criar AddressDTO estruturado
    const addressDTO: any = {};
    if (formValue.cep) addressDTO.cep = formValue.cep.replace(/\D/g, '');
    if (formValue.street) addressDTO.street = formValue.street;
    if (formValue.number) addressDTO.number = formValue.number;
    if (formValue.complement) addressDTO.complement = formValue.complement;
    if (formValue.neighborhood) addressDTO.neighborhood = formValue.neighborhood;
    if (formValue.city) addressDTO.city = formValue.city;
    if (formValue.state) addressDTO.state = formValue.state.toUpperCase();
    addressDTO.country = 'Brasil';
    
    // Criar objeto CreateAccountRequest com valores fixos para Brasil
    const createRequest: CreateAccountRequest = {
      companyName: formValue.companyName,
      adminName: formValue.adminName,
      email: formValue.email,
      password: formValue.password,
      currency: 'BRL', // Fixo para Brasil
      timezone: 'America/Sao_Paulo', // Fixo para Brasil
      phone: formValue.phone || '',
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber.replace(/\D/g, ''), // Remove máscara
      tradeName: formValue.tradeName || '',
      legalName: formValue.legalName || '',
      imageUrl: imageUrl || '',
      addressDTO: Object.keys(addressDTO).length > 0 ? addressDTO : undefined // Endereço estruturado
    };

    this.accountService.createAccount(createRequest).subscribe({
      next: () => {
        this.creatingAccount = false;
        this.showCreateForm = false;
        this.resetForm();
        this.loadAccounts();
        this.loadMetrics();
        this.toastService.showSuccess('Empresa criada com sucesso!');
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
    
    this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Empresa`,
      message: confirmMessage,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      cancelLabel: 'Cancelar',
      confirmVariant: account.active ? 'warning' : 'primary'
    }).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      const serviceAction = account.active 
        ? this.accountService.deactivateAccount(account.id)
        : this.accountService.activateAccount(account.id);

      serviceAction.subscribe({
        next: () => {
          this.toastService.success(`Empresa ${action === 'ativar' ? 'ativada' : 'desativada'} com sucesso!`);
          this.error = null;
          this.loadAccounts();
          this.loadMetrics();
        },
        error: (err) => {
          console.error('Error toggling account status', err);
          this.toastService.error(err.error?.message || `Erro ao ${action} empresa`);
          this.error = `Erro ao ${action} empresa: ${err.error?.message || 'Erro desconhecido'}`;
        }
      });
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
    // imageUrl será setado no doCreateAccount após upload
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
