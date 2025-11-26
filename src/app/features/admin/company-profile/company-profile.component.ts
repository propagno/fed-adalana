import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService, Account } from '../../../core/services/account.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../shared/services/toast.service';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { SelectComponent } from '../../../shared/components/design-system/select/select.component';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { AppearanceService, UpdateAppearanceRequest } from '../../../core/services/appearance.service';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, CardComponent, InputComponent, SelectComponent],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Perfil da Empresa</h2>
        <p class="text-sm text-gray-600 mt-1">Gerencie as informações e aparência da sua empresa</p>
      </div>
      
      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="flex gap-6">
          <button *ngFor="let tab of tabs"
                  (click)="activeTab = tab.id"
                  [class.border-b-2]="activeTab === tab.id"
                  [class.border-primary]="activeTab === tab.id"
                  [class.text-primary]="activeTab === tab.id"
                  [class.text-gray-600]="activeTab !== tab.id"
                  class="pb-3 px-1 font-medium transition-colors">
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div *ngIf="loading" class="text-center py-8 text-gray-500">
        Carregando informações...
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Tab: Informações -->
      <div *ngIf="activeTab === 'info' && !loading && account">
        <app-card [elevation]="1" padding="lg">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-h2">Informações da Empresa</h3>
            <app-button *ngIf="!editingInfo"
                        variant="primary"
                        label="Editar"
                        size="sm"
                        (clicked)="enableInfoEdit()">
            </app-button>
          </div>

          <!-- View Mode -->
          <div *ngIf="!editingInfo" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <p class="text-gray-900">{{ account.company_name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                <p class="text-gray-900">{{ account.trade_name || '-' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                <p class="text-gray-900">{{ account.legal_name || '-' }}</p>
              </div>

              <div *ngIf="account.document_type && account.document_number">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ account.document_type === 'CNPJ' ? 'CNPJ' : 'CPF' }}
                </label>
                <p class="text-gray-900">{{ formatDocumentNumber(account.document_number) }}</p>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <p class="text-gray-900">{{ account.category || '-' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <p class="text-gray-900">{{ account.phone || '-' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <p class="text-gray-900">{{ formatAddress(account.address) || '-' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span [class]="account.active ? 'inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium' : 'inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium'">
                  {{ account.active ? 'Ativa' : 'Inativa' }}
                </span>
              </div>

              <!-- Timestamps -->
              <div class="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div *ngIf="account.created_at">
                  <span class="font-medium">Criada em:</span> {{ formatDate(account.created_at) }}
                </div>
                <div *ngIf="account.updated_at">
                  <span class="font-medium">Última atualização:</span> {{ formatDate(account.updated_at) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <form *ngIf="editingInfo" [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                
                <app-input formControlName="company_name"
                           label="Nome da Empresa *"
                           placeholder="Digite o nome da empresa"
                           [required]="true">
                </app-input>

                <app-input formControlName="trade_name"
                           label="Nome Fantasia"
                           placeholder="Digite o nome fantasia">
                </app-input>

                <app-input formControlName="legal_name"
                           label="Razão Social"
                           placeholder="Digite a razão social">
                </app-input>
              </div>

              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
                
                <app-input formControlName="category"
                           label="Categoria"
                           placeholder="Ex: Padaria, Restaurante, etc">
                </app-input>

                <app-input formControlName="phone"
                           label="Telefone"
                           type="tel"
                           placeholder="(00) 00000-0000">
                </app-input>

                <div>
                  <label class="block text-body font-medium mb-2">CEP</label>
                  <div class="flex gap-2">
                    <app-input formControlName="cep"
                               placeholder="00000-000"
                               class="flex-1">
                    </app-input>
                    <app-button variant="outline"
                                label="Buscar"
                                size="sm"
                                (clicked)="searchCep()">
                    </app-button>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div class="col-span-2">
                    <app-input formControlName="street"
                               label="Rua/Avenida"
                               placeholder="Digite o logradouro">
                    </app-input>
                  </div>
                  <div>
                    <app-input formControlName="number"
                               label="Número"
                               placeholder="Nº">
                    </app-input>
                  </div>
                </div>

                <app-input formControlName="complement"
                           label="Complemento"
                           placeholder="Apto, sala, etc (opcional)">
                </app-input>

                <app-input formControlName="neighborhood"
                           label="Bairro"
                           placeholder="Digite o bairro">
                </app-input>

                <div class="grid grid-cols-2 gap-4">
                  <app-input formControlName="city"
                             label="Cidade"
                             placeholder="Digite a cidade">
                  </app-input>
                  <app-input formControlName="state"
                             label="Estado (UF)"
                             placeholder="EX: SP"
                             [maxLength]="2">
                  </app-input>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <app-button variant="outline"
                          label="Cancelar"
                          (clicked)="cancelInfoEdit()"
                          [disabled]="savingInfo">
              </app-button>
              <app-button variant="primary"
                          label="Salvar Alterações"
                          type="submit"
                          [disabled]="infoForm.invalid || savingInfo"
                          [loading]="savingInfo">
              </app-button>
            </div>
          </form>
        </app-card>
      </div>

      <!-- Tab: Aparência -->
      <div *ngIf="activeTab === 'appearance' && !loading && account">
        <app-card [elevation]="1" padding="lg">
          <h2 class="text-h2 mb-6">Personalização da Loja</h2>
          
          <form [formGroup]="appearanceForm" class="space-y-6" (ngSubmit)="saveAppearance()">
            <!-- Logo -->
            <div>
              <label class="block text-body font-medium mb-2">Logo da Empresa</label>
              <div class="flex items-center gap-4 mb-3">
                <img *ngIf="currentLogo" 
                     [src]="currentLogo" 
                     class="w-24 h-24 object-cover rounded-lg border border-gray-300" />
                <div>
                  <input type="file" 
                         accept="image/*" 
                         (change)="onLogoUpload($event)"
                         class="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-light">
                  <p class="text-caption text-gray-500 mt-1">PNG, JPG ou SVG até 2MB</p>
                </div>
              </div>
            </div>
            
            <!-- Banner -->
            <div>
              <label class="block text-body font-medium mb-2">Banner da Loja</label>
              <div class="h-48 bg-gray-100 rounded-lg overflow-hidden mb-3 border border-gray-300">
                <img *ngIf="currentBanner" 
                     [src]="currentBanner" 
                     class="w-full h-full object-cover" />
                <div *ngIf="!currentBanner" class="w-full h-full flex items-center justify-center text-gray-400">
                  <span>Nenhum banner selecionado</span>
                </div>
              </div>
              <input type="file" 
                     accept="image/*" 
                     (change)="onBannerUpload($event)"
                     class="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-light">
              <p class="text-caption text-gray-500 mt-1">Recomendado: 1920x400px</p>
            </div>
            
            <!-- Tagline -->
            <div>
              <app-input formControlName="tagline"
                         label="Slogan da Empresa"
                         placeholder="Ex: Sua padaria de confiança"
                         [maxLength]="100">
              </app-input>
            </div>
            
            <!-- Cores -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-body font-medium mb-2">Cor Primária</label>
                <input type="color" 
                       formControlName="primaryColor"
                       class="w-full h-12 rounded-lg border border-gray-300 cursor-pointer" />
                <p class="text-caption text-gray-600 mt-1">{{ appearanceForm.get('primaryColor')?.value || '#3B82F6' }}</p>
              </div>
              <div>
                <label class="block text-body font-medium mb-2">Cor Secundária</label>
                <input type="color" 
                       formControlName="secondaryColor"
                       class="w-full h-12 rounded-lg border border-gray-300 cursor-pointer" />
                <p class="text-caption text-gray-600 mt-1">{{ appearanceForm.get('secondaryColor')?.value || '#8B5CF6' }}</p>
              </div>
              <div>
                <label class="block text-body font-medium mb-2">Cor de Destaque</label>
                <input type="color" 
                       formControlName="accentColor"
                       class="w-full h-12 rounded-lg border border-gray-300 cursor-pointer" />
                <p class="text-caption text-gray-600 mt-1">{{ appearanceForm.get('accentColor')?.value || '#EC4899' }}</p>
              </div>
            </div>
            
            <!-- Tema -->
            <div>
              <label class="block text-body font-medium mb-2">Tema</label>
              <div class="flex gap-3">
                <button type="button"
                        [class.bg-primary-light]="appearanceForm.get('theme')?.value === 'light'"
                        [class.text-white]="appearanceForm.get('theme')?.value === 'light'"
                        [class.bg-gray-100]="appearanceForm.get('theme')?.value !== 'light'"
                        [class.text-gray-700]="appearanceForm.get('theme')?.value !== 'light'"
                        (click)="setTheme('light')"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Claro</span>
                </button>
                <button type="button"
                        [class.bg-primary-light]="appearanceForm.get('theme')?.value === 'dark'"
                        [class.text-white]="appearanceForm.get('theme')?.value === 'dark'"
                        [class.bg-gray-100]="appearanceForm.get('theme')?.value !== 'dark'"
                        [class.text-gray-700]="appearanceForm.get('theme')?.value !== 'dark'"
                        (click)="setTheme('dark')"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Escuro</span>
                </button>
              </div>
            </div>
            
            <!-- Preview -->
            <div class="border-t pt-6">
              <h3 class="text-h3 mb-4">Preview</h3>
              <div class="border rounded-lg overflow-hidden">
                <div class="h-32 relative overflow-hidden"
                     [style.background]="getPreviewGradient()">
                  <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <div class="flex items-end gap-4">
                      <img *ngIf="previewLogo" 
                           [src]="previewLogo" 
                           class="w-16 h-16 rounded-lg border-2 border-white shadow-lg object-cover" />
                      <div>
                        <h4 class="text-h3 text-white mb-1">{{ account.company_name }}</h4>
                        <p class="text-body-sm text-white/90">{{ appearanceForm.get('tagline')?.value || 'Seu slogan aparecerá aqui' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-6 bg-white">
                  <p class="text-body text-gray-600 mb-4">Este é um preview de como sua loja aparecerá para os clientes.</p>
                  <div class="flex gap-3">
                    <app-button variant="primary" 
                                size="sm"
                                label="Botão Primário"
                                [ngStyle]="{'--button-bg': appearanceForm.get('primaryColor')?.value || '#3B82F6'}">
                    </app-button>
                    <app-button variant="secondary" 
                                size="sm"
                                label="Botão Secundário">
                    </app-button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t">
              <app-button variant="outline" 
                          label="Cancelar" 
                          (clicked)="resetAppearanceForm()">
              </app-button>
              <app-button variant="primary" 
                          label="Salvar Alterações" 
                          [disabled]="appearanceForm.invalid || savingAppearance"
                          [loading]="savingAppearance"
                          type="submit">
              </app-button>
            </div>
          </form>
        </app-card>
      </div>

      <!-- Tab: Pagamentos -->
      <div *ngIf="activeTab === 'payments' && !loading && account">
        <app-card [elevation]="1" padding="lg">
          <h2 class="text-h2 mb-6">Configurações de Pagamento</h2>
          
          <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-body-sm text-blue-800">
              <strong>Importante:</strong> Configure sua chave PIX para receber pagamentos de assinaturas do clube VIP.
              A chave PIX será usada para gerar QR Codes de pagamento.
            </p>
          </div>

          <form [formGroup]="pixForm" (ngSubmit)="savePixKey()" class="space-y-6">
            <app-select formControlName="pixKeyType"
                        label="Tipo de Chave PIX"
                        placeholder="Selecione o tipo"
                        [required]="true"
                        [errorMessage]="pixForm.get('pixKeyType')?.invalid && pixForm.get('pixKeyType')?.touched ? 'Tipo de chave PIX é obrigatório' : undefined">
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
              <option value="EMAIL">E-mail</option>
              <option value="PHONE">Telefone</option>
              <option value="RANDOM">Chave Aleatória (UUID)</option>
            </app-select>

            <app-input formControlName="pixKey"
                       label="Chave PIX *"
                       [placeholder]="getPixKeyPlaceholder()"
                       [required]="true">
            </app-input>

            <div *ngIf="currentPixKey" class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p class="text-body-sm text-gray-600 mb-1">Chave PIX atual:</p>
              <p class="text-body font-semibold text-primary">{{ currentPixKey }}</p>
              <p *ngIf="account?.settings?.pix_key_type" class="text-caption text-gray-500 mt-1">
                Tipo: {{ account.settings?.pix_key_type }}
              </p>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <app-button variant="outline"
                          label="Cancelar"
                          (clicked)="resetPixForm()"
                          [disabled]="savingPix">
              </app-button>
              <app-button variant="primary"
                          label="Salvar Chave PIX"
                          type="submit"
                          [disabled]="pixForm.invalid || savingPix"
                          [loading]="savingPix">
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class CompanyProfileComponent implements OnInit {
  account: Account | null = null;
  loading = false;
  error: string | null = null;
  
  // Tabs
  tabs = [
    { id: 'info', label: 'Informações' },
    { id: 'appearance', label: 'Aparência' },
    { id: 'payments', label: 'Pagamentos' }
  ];
  activeTab = 'info';
  
  // Appearance
  appearanceForm: FormGroup;
  currentLogo: string | null = null;
  currentBanner: string | null = null;
  previewLogo: string | null = null;
  savingAppearance = false;
  logoFile: File | null = null;
  bannerFile: File | null = null;
  
  // Info edit
  infoForm: FormGroup;
  editingInfo = false;
  savingInfo = false;
  
  // PIX settings
  pixForm: FormGroup;
  currentPixKey: string | null = null;
  savingPix = false;

  constructor(
    private accountService: AccountService,
    private appearanceService: AppearanceService,
    private fileUploadService: FileUploadService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.appearanceForm = this.fb.group({
      tagline: ['', [Validators.maxLength(100)]],
      primaryColor: ['#1A1F71'],
      secondaryColor: ['#FF4E42'],
      accentColor: ['#FEC601'],
      theme: ['light']
    });
    
    this.infoForm = this.fb.group({
      company_name: ['', [Validators.required, Validators.maxLength(100)]],
      trade_name: ['', [Validators.maxLength(100)]],
      legal_name: ['', [Validators.maxLength(150)]],
      category: ['', [Validators.maxLength(50)]],
      phone: ['', [Validators.maxLength(20)]],
      cep: ['', [Validators.pattern(/^\d{5}-?\d{3}$/)]],
      street: ['', [Validators.maxLength(200)]],
      number: ['', [Validators.maxLength(20)]],
      complement: ['', [Validators.maxLength(100)]],
      neighborhood: ['', [Validators.maxLength(100)]],
      city: ['', [Validators.maxLength(100)]],
      state: ['', [Validators.maxLength(2), Validators.pattern(/^[A-Z]{2}$/)]],
      country: ['Brasil']
    });
    
    this.pixForm = this.fb.group({
      pixKey: ['', [Validators.required]],
      pixKeyType: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAccount();
  }
  
  loadPixKey(): void {
    if (this.account?.settings) {
      const settings = this.account.settings as any;
      this.currentPixKey = settings.pix_key || null;
      if (this.currentPixKey) {
        this.pixForm.patchValue({
          pixKey: this.currentPixKey,
          pixKeyType: settings.pix_key_type || 'EMAIL'
        });
      }
    }
  }
  
  getPixKeyPlaceholder(): string {
    const type = this.pixForm?.get('pixKeyType')?.value;
    const placeholders: { [key: string]: string } = {
      'CPF': '000.000.000-00',
      'CNPJ': '00.000.000/0000-00',
      'EMAIL': 'empresa@example.com',
      'PHONE': '(00) 00000-0000',
      'RANDOM': 'Chave aleatória gerada pelo banco'
    };
    return placeholders[type] || 'Digite a chave PIX';
  }
  
  savePixKey(): void {
    if (this.pixForm.invalid || !this.account) return;
    
    this.savingPix = true;
    const { pixKey, pixKeyType } = this.pixForm.value;
    
    this.accountService.updatePixKey(this.account.id, pixKey, pixKeyType).subscribe({
      next: () => {
        this.toastService.success('Chave PIX atualizada com sucesso!');
        this.currentPixKey = pixKey;
        this.loadAccount(); // Recarregar dados da conta
        this.savingPix = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao atualizar chave PIX');
        this.savingPix = false;
      }
    });
  }
  
  resetPixForm(): void {
    this.pixForm.reset();
    this.loadPixKey();
  }

  loadAccount(): void {
    this.loading = true;
    this.error = null;
    this.accountService.getMyAccount().subscribe({
      next: (account) => {
        this.account = account;
        this.populateInfoForm(account);
        this.loadAppearance();
        this.loadPixKey();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading account', err);
        this.error = err.error?.message || 'Erro ao carregar informações da empresa';
        this.loading = false;
      }
    });
  }
  
  populateInfoForm(account: Account): void {
    // Parse address if it's a string (backward compatibility)
    let addressData: any = {};
    if (account.address) {
      if (typeof account.address === 'string') {
        // Legacy string address - keep as is for now
        addressData = { street: account.address };
      } else {
        addressData = account.address;
      }
    }
    
    this.infoForm.patchValue({
      company_name: account.company_name || '',
      trade_name: account.trade_name || '',
      legal_name: account.legal_name || '',
      category: account.category || '',
      phone: account.phone || '',
      cep: addressData.cep || '',
      street: addressData.street || '',
      number: addressData.number || '',
      complement: addressData.complement || '',
      neighborhood: addressData.neighborhood || '',
      city: addressData.city || '',
      state: addressData.state || '',
      country: addressData.country || 'Brasil'
    });
  }
  
  enableInfoEdit(): void {
    this.editingInfo = true;
  }
  
  cancelInfoEdit(): void {
    this.editingInfo = false;
    if (this.account) {
      this.populateInfoForm(this.account);
    }
  }
  
  searchCep(): void {
    const cep = this.infoForm.get('cep')?.value;
    if (!cep || cep.length < 8) return;
    
    // Remove non-numeric characters
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      this.toastService.error('CEP inválido');
      return;
    }
    
    // Call ViaCEP API
    fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (data.erro) {
          this.toastService.error('CEP não encontrado');
          return;
        }
        
        this.infoForm.patchValue({
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
          complement: data.complemento || ''
        });
        
        this.toastService.success('Endereço encontrado!');
      })
      .catch(() => {
        this.toastService.error('Erro ao buscar CEP');
      });
  }
  
  saveInfo(): void {
    if (!this.account || this.infoForm.invalid) return;
    
    this.savingInfo = true;
    
    const formValue = this.infoForm.value;
    
    // Build structured address - only include fields with values
    const addressDTO: any = {};
    
    if (formValue.cep && formValue.cep.trim()) {
      addressDTO.cep = formValue.cep.trim();
    }
    if (formValue.street && formValue.street.trim()) {
      addressDTO.street = formValue.street.trim();
    }
    if (formValue.number && formValue.number.trim()) {
      addressDTO.number = formValue.number.trim();
    }
    if (formValue.complement && formValue.complement.trim()) {
      addressDTO.complement = formValue.complement.trim();
    }
    if (formValue.neighborhood && formValue.neighborhood.trim()) {
      addressDTO.neighborhood = formValue.neighborhood.trim();
    }
    if (formValue.city && formValue.city.trim()) {
      addressDTO.city = formValue.city.trim();
    }
    if (formValue.state && formValue.state.trim()) {
      addressDTO.state = formValue.state.trim().toUpperCase();
    }
    if (formValue.country && formValue.country.trim()) {
      addressDTO.country = formValue.country.trim();
    } else {
      addressDTO.country = 'Brasil';
    }
    
    const updatedAccount = {
      company_name: formValue.company_name,
      trade_name: formValue.trade_name,
      legal_name: formValue.legal_name,
      category: formValue.category,
      phone: formValue.phone,
      addressDTO: Object.keys(addressDTO).length > 0 ? addressDTO : undefined
    };
    
    this.accountService.updateAccount(this.account.id, updatedAccount).subscribe({
      next: (account) => {
        this.account = account;
        this.populateInfoForm(account);
        this.editingInfo = false;
        this.savingInfo = false;
        this.toastService.success('Informações atualizadas com sucesso!');
      },
      error: (err) => {
        console.error('Error updating account', err);
        this.toastService.error(err.error?.message || 'Erro ao atualizar informações');
        this.savingInfo = false;
      }
    });
  }
  
  loadAppearance(): void {
    if (!this.account) return;
    
    this.appearanceService.getAppearance(this.account.id).subscribe({
      next: (appearance) => {
        if (appearance) {
          this.appearanceForm.patchValue({
            tagline: appearance.tagline || '',
            primaryColor: appearance.primaryColor || '#1A1F71',
            secondaryColor: appearance.secondaryColor || '#FF4E42',
            accentColor: appearance.accentColor || '#FEC601',
            theme: appearance.theme || 'light'
          });
          
          if (appearance.logoUrl) {
            this.currentLogo = this.getImageUrl(appearance.logoUrl);
            this.previewLogo = this.currentLogo;
          }
          if (appearance.bannerImageUrl) {
            this.currentBanner = this.getImageUrl(appearance.bannerImageUrl);
          }
        }
      },
      error: () => {
        // Silently fail - appearance is optional
      }
    });
  }
  
  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentLogo = e.target?.result as string;
        this.previewLogo = this.currentLogo;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }
  
  onBannerUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.bannerFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentBanner = e.target?.result as string;
      };
      reader.readAsDataURL(this.bannerFile);
    }
  }
  
  setTheme(theme: 'light' | 'dark'): void {
    this.appearanceForm.patchValue({ theme });
  }
  
  getPreviewGradient(): string {
    const primary = this.appearanceForm.get('primaryColor')?.value || '#3B82F6';
    const secondary = this.appearanceForm.get('secondaryColor')?.value || '#8B5CF6';
    return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
  }
  
  resetAppearanceForm(): void {
    this.loadAppearance();
    this.logoFile = null;
    this.bannerFile = null;
  }
  
  saveAppearance(): void {
    if (!this.account || this.appearanceForm.invalid) return;
    
    this.savingAppearance = true;
    
    // Upload images first if needed
    const uploadPromises: Promise<string | null>[] = [];
    
    if (this.logoFile) {
      uploadPromises.push(this.uploadImage(this.logoFile));
    } else if (this.currentLogo) {
      // Extract filename from current logo URL if it's a full URL
      const logoFilename = this.extractFilenameFromUrl(this.currentLogo);
      uploadPromises.push(Promise.resolve(logoFilename));
    } else {
      uploadPromises.push(Promise.resolve(null));
    }
    
    if (this.bannerFile) {
      uploadPromises.push(this.uploadImage(this.bannerFile));
    } else if (this.currentBanner) {
      const bannerFilename = this.extractFilenameFromUrl(this.currentBanner);
      uploadPromises.push(Promise.resolve(bannerFilename));
    } else {
      uploadPromises.push(Promise.resolve(null));
    }
    
    Promise.all(uploadPromises).then(([logoUrl, bannerUrl]) => {
      const appearanceData: UpdateAppearanceRequest = {
        tagline: this.appearanceForm.get('tagline')?.value || undefined,
        primaryColor: this.appearanceForm.get('primaryColor')?.value || undefined,
        secondaryColor: this.appearanceForm.get('secondaryColor')?.value || undefined,
        accentColor: this.appearanceForm.get('accentColor')?.value || undefined,
        theme: this.appearanceForm.get('theme')?.value || 'light',
        logoUrl: logoUrl || undefined,
        bannerImageUrl: bannerUrl || undefined
      };
      
      this.appearanceService.updateAppearance(this.account!.id, appearanceData).subscribe({
        next: () => {
          this.toastService.success('Aparência salva com sucesso!');
          this.savingAppearance = false;
          this.logoFile = null;
          this.bannerFile = null;
          // Reload appearance to get updated values
          this.loadAppearance();
        },
        error: (err) => {
          console.error('Error saving appearance', err);
          this.toastService.error('Erro ao salvar aparência');
          this.savingAppearance = false;
        }
      });
    }).catch((err) => {
      console.error('Error uploading images', err);
      this.toastService.error('Erro ao fazer upload das imagens');
      this.savingAppearance = false;
    });
  }
  
  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.fileUploadService.uploadImage(file, 'account').subscribe({
        next: (response) => {
          // Backend returns full URL or filename, extract filename if needed
          const filename = this.extractFilenameFromUrl(response.url || response.filename || '');
          resolve(filename);
        },
        error: reject
      });
    });
  }

  extractFilenameFromUrl(url: string): string {
    if (!url) return '';
    // If it's already a filename (no http/https), return as is
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      return url;
    }
    // Extract filename from URL
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  formatDocumentNumber(documentNumber: string): string {
    if (!documentNumber) return '';
    // Format CNPJ: XX.XXX.XXX/XXXX-XX
    if (documentNumber.length === 14) {
      return documentNumber.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    // Format CPF: XXX.XXX.XXX-XX
    if (documentNumber.length === 11) {
      return documentNumber.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return documentNumber;
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/api/files/')) {
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}${imageUrl}`;
    }
    const parts = imageUrl.split('/');
    if (parts.length >= 2) {
      const type = parts[0];
      const filename = parts[parts.length - 1];
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}/api/files/${type}/${filename}`;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}/api/files/accounts/${imageUrl}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  formatAddress(address: any): string {
    if (!address) return '';
    
    if (typeof address === 'string') {
      return address;
    }
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number);
    if (address.neighborhood) parts.push(address.neighborhood);
    if (address.city && address.state) {
      parts.push(`${address.city} - ${address.state}`);
    } else if (address.city) {
      parts.push(address.city);
    }
    if (address.cep) parts.push(`CEP: ${address.cep}`);
    
    return parts.join(', ');
  }
}

