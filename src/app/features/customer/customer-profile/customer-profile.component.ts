import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService, Customer, UpdateCustomerRequest } from '../../../core/services/customer.service';
import { CustomerAddressService, CustomerAddress, CustomerAddressRequest } from '../../../core/services/customer-address.service';
import { ToastService } from '../../../core/services/toast.service';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormatUtil } from '../../../shared/utils/format.util';
import { CepLookupDirective } from '../../../shared/directives/cep-lookup.directive';
import { CepService, CEPResponse } from '../../../shared/services/cep.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MarketplaceNavbarComponent,
    CardComponent,
    ButtonComponent,
    InputComponent,
    PageHeaderComponent,
    ModalComponent,
    SkeletonLoaderComponent,
    BadgeComponent,
    MapPinIconComponent,
    CepLookupDirective
  ],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  activeTab: 'personal' | 'addresses' | 'security' = 'personal';
  
  onTabChange(tab: 'personal' | 'addresses' | 'security'): void {
    this.activeTab = tab;
    // Reload addresses when switching to addresses tab
    if (tab === 'addresses') {
      this.loadAddresses();
    }
  }
  
  // Personal Data Form
  personalForm: FormGroup;
  personalLoading = false;
  personalError = '';
  
  // Addresses
  addresses: CustomerAddress[] = [];
  addressesLoading = false;
  showAddressModal = false;
  editingAddress: CustomerAddress | null = null;
  addressForm: FormGroup;
  addressFormLoading = false;
  loadingCep = false;
  
  // Security Form
  securityForm: FormGroup;
  securityLoading = false;
  securityError = '';
  passwordStrength = 0;
  
  customer: Customer | null = null;
  accountId: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private customerService: CustomerService,
    private addressService: CustomerAddressService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cepService: CepService
  ) {
    // Personal Data Form
    this.personalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      cpf: ['']
    });
    
    // Address Form
    this.addressForm = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(3)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      address: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required, Validators.maxLength(2), Validators.minLength(2)]],
      is_default: [false]
    });
    
    // Security Form
    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      this.personalError = 'Usuário não autenticado';
      return;
    }
    
    // Pre-fill form with user data as initial values
    this.personalForm.patchValue({
      name: user.name || '',
      email: user.email || ''
    });
    
    // Try to get accountId from multiple sources:
    // 1. From user object
    this.accountId = user.accountId;
    
    // 2. From query params (e.g., ?accountId=xxx)
    if (!this.accountId) {
      this.accountId = this.route.snapshot.queryParams['accountId'] || null;
    }
    
    // 3. From route params
    if (!this.accountId) {
      this.accountId = this.route.snapshot.params['accountId'] || null;
    }
    
    // 4. From URL (if navigating from a company page)
    if (!this.accountId) {
      const urlParams = new URLSearchParams(window.location.search);
      this.accountId = urlParams.get('accountId');
    }
    
    // If still no accountId, try to get from localStorage (if stored from previous navigation)
    if (!this.accountId) {
      const storedAccountId = localStorage.getItem('currentAccountId');
      if (storedAccountId) {
        this.accountId = storedAccountId;
      }
    }
    
    // Store accountId for future use if available
    if (this.accountId) {
      localStorage.setItem('currentAccountId', this.accountId);
    }
    
    // Load customer data (will work with or without accountId)
    this.loadCustomerData();
    
    // Always load addresses (works with or without accountId - user-level addresses)
    this.loadAddresses();
  }
  
  loadCustomerData(): void {
    this.personalLoading = true;
    this.personalError = '';
    
    // If no accountId, skip customer lookup and go directly to user profile
    // This avoids unnecessary 404 errors in console for new customers
    if (!this.accountId) {
      console.info('No accountId - loading user profile directly (customer will be created on first order)');
      this.personalLoading = false;
      this.loadUserProfileData();
      return;
    }
    
    console.log('Loading customer data. AccountId:', this.accountId);
    
    // Call with accountId - if customer doesn't exist, it will be created automatically
    this.customerService.getCurrentCustomer(this.accountId).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Erro ao carregar dados do cliente';
        
        // If customer not found (404), it's normal for new customers - load user data instead
        if (error.status === 404 && (errorMessage.includes('Customer not found') || error.error?.error === 'Entity Not Found')) {
          // This is expected for new customers - don't log as error
          console.info('Customer not found yet - this is normal for new customers. Loading user profile...');
          // Don't show error, just load user data
          this.loadUserProfileData();
          return of(null);
        }
        
        // If accountId is invalid, clear it from localStorage
        if (errorMessage.includes('Conta não encontrada') || errorMessage.includes('account')) {
          console.warn('Invalid accountId detected, clearing from localStorage');
          localStorage.removeItem('currentAccountId');
          this.accountId = null;
          this.loadUserProfileData();
          return of(null);
        }
        
        // Other errors - log and show message
        console.error('Error loading customer data:', error);
        this.personalError = errorMessage;
        return of(null);
      }),
      finalize(() => this.personalLoading = false)
    ).subscribe(customer => {
      if (customer) {
        console.log('Customer data loaded:', customer);
        this.customer = customer;
        
        // Update accountId from customer data if not set
        if (!this.accountId && customer.account_id) {
          this.accountId = customer.account_id;
          localStorage.setItem('currentAccountId', this.accountId);
          // Reload addresses with accountId (may have account-specific addresses)
          console.log('🔄 AccountId updated, reloading addresses with accountId:', this.accountId);
          this.loadAddresses();
        }
        
        // Check if customer data seems to be default/auto-generated
        const isDefaultData = this.isDefaultCustomerData(customer);
        
        // Get user data as fallback
        const user = this.authService.getCurrentUser();
        
        // Fill form with customer data, but use user data if customer data is default
        // Apply phone mask when loading
        const phoneValue = (isDefaultData || !customer.phone || customer.phone === '+5511999999999') 
          ? (customer.phone || '') 
          : customer.phone;
        const formattedPhone = phoneValue ? FormatUtil.formatPhone(phoneValue) : '';
        
        this.personalForm.patchValue({
          name: (isDefaultData && user?.name) ? user.name : (customer.name || ''),
          email: customer.email || user?.email || '',
          phone: formattedPhone,
          cpf: this.formatCPF(customer.cpf || '')
        });
      } else {
        // Customer not found - load user profile
        this.loadUserProfileData();
      }
    });
  }
  
  loadAddresses(): void {
    this.addressesLoading = true;
    console.log('📦 Loading addresses...', { accountId: this.accountId });
    // Pass accountId only if available, otherwise get user-level addresses
    this.addressService.getAddresses(this.accountId || undefined).pipe(
      catchError(error => {
        console.error('❌ Error loading addresses:', error);
        // Don't show error if it's a 404 (no addresses yet) or 401 (not authenticated)
        if (error.status !== 404 && error.status !== 401) {
          console.error('Unexpected error loading addresses:', error);
        }
        return of([]);
      }),
      finalize(() => this.addressesLoading = false)
    ).subscribe(addresses => {
      console.log('✅ Addresses loaded:', addresses);
      this.addresses = addresses || [];
    });
  }
  
  onPersonalSubmit(): void {
    if (this.personalForm.invalid) return;
    
    // Ensure accountId is available
    if (!this.accountId) {
      if (this.customer?.account_id) {
        this.accountId = this.customer.account_id;
      } else {
        this.personalError = 'ID da conta é necessário para atualizar os dados';
        return;
      }
    }
    
    this.personalLoading = true;
    this.personalError = '';
    
    const formValue = this.personalForm.value;
    // Remove phone mask before sending (keep only digits and +)
    const phoneValue = formValue.phone ? formValue.phone.replace(/[^\d+]/g, '') : '';
    const request: UpdateCustomerRequest = {
      name: formValue.name,
      email: formValue.email,
      phone: phoneValue,
      cpf: this.unformatCPF(formValue.cpf)
    };
    
    this.customerService.updateCurrentCustomer(this.accountId || undefined, request).pipe(
      catchError(error => {
        console.error('Error updating customer:', error);
        this.personalError = error.error?.message || 'Erro ao atualizar dados. Tente novamente.';
        return of(null);
      }),
      finalize(() => this.personalLoading = false)
    ).subscribe(customer => {
      if (customer) {
        this.customer = customer;
        this.toastService.success('Dados pessoais atualizados com sucesso!');
      }
    });
  }
  
  onAddressSubmit(): void {
    console.log('onAddressSubmit called');
    console.log('Form valid:', this.addressForm.valid);
    console.log('Form value:', this.addressForm.value);
    console.log('AccountId:', this.accountId);
    
    // Check form validity
    if (this.addressForm.invalid) {
      console.warn('Address form is invalid');
      // Log which fields are invalid
      Object.keys(this.addressForm.controls).forEach(key => {
        const control = this.addressForm.get(key);
        if (control && control.invalid) {
          console.warn(`Field ${key} is invalid:`, control.errors);
          control.markAsTouched();
        }
      });
      this.toastService.error('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }
    
    console.log('Submitting address form:', this.addressForm.value);
    this.addressFormLoading = true;
    const formValue = this.addressForm.value;
    
    // Build full address string from separate fields
    const addressParts: string[] = [];
    if (formValue.address) addressParts.push(formValue.address);
    if (formValue.number) addressParts.push(`nº ${formValue.number}`);
    if (formValue.complement) addressParts.push(formValue.complement);
    if (formValue.neighborhood) addressParts.push(formValue.neighborhood);
    if (formValue.city) addressParts.push(formValue.city);
    if (formValue.state) addressParts.push(formValue.state);
    if (formValue.cep) addressParts.push(`CEP: ${formValue.cep.replace(/\D/g, '')}`);
    
    const fullAddress = addressParts.join(', ');
    
    const request: CustomerAddressRequest = {
      label: formValue.label,
      address: fullAddress,
      is_default: formValue.is_default
    };
    
    // Pass accountId only if available, otherwise create user-level address
    const accountIdParam = this.accountId || undefined;
    const operation = this.editingAddress
      ? this.addressService.updateAddress(this.editingAddress.id, request, accountIdParam)
      : this.addressService.createAddress(request, accountIdParam);
    
    console.log('Sending address request:', request);
    operation.pipe(
      catchError(error => {
        console.error('Error saving address:', error);
        const errorMessage = error.error?.message || 'Erro ao salvar endereço. Tente novamente.';
        this.toastService.error(errorMessage);
        this.addressFormLoading = false;
        return of(null);
      }),
      finalize(() => {
        this.addressFormLoading = false;
      })
    ).subscribe(address => {
      if (address) {
        console.log('Address saved successfully:', address);
        this.loadAddresses();
        this.toastService.success('Endereço salvo com sucesso!');
        this.closeAddressModal();
      } else {
        console.warn('Address save returned null');
      }
    });
  }
  
  onSecuritySubmit(): void {
    if (this.securityForm.invalid) return;
    
    this.securityLoading = true;
    this.securityError = '';
    
    const formValue = this.securityForm.value;
    
    this.authService.changePassword(formValue.currentPassword, formValue.newPassword).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        this.securityError = error.error?.message || 'Erro ao alterar senha. Verifique se a senha atual está correta.';
        return of(null);
      }),
      finalize(() => this.securityLoading = false)
    ).subscribe(() => {
      this.securityForm.reset();
      this.passwordStrength = 0;
      this.toastService.success('Senha alterada com sucesso!');
    });
  }
  
  openAddressModal(address?: CustomerAddress): void {
    this.editingAddress = address || null;
    if (address) {
      // Parse address string to extract fields
      const parsed = this.parseAddress(address.address);
      this.addressForm.patchValue({
        label: address.label,
        cep: parsed.cep || '',
        address: parsed.street || '',
        number: parsed.number || '',
        complement: parsed.complement || '',
        neighborhood: parsed.neighborhood || '',
        city: parsed.city || '',
        state: parsed.state || '',
        is_default: address.is_default
      });
    } else {
      this.addressForm.reset({ is_default: false });
    }
    this.showAddressModal = true;
  }
  
  private parseAddress(addressString: string): {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  } {
    // Try to extract CEP
    const cepMatch = addressString.match(/\b\d{5}-?\d{3}\b/);
    const cep = cepMatch ? cepMatch[0].replace(/\D/g, '') : undefined;
    
    // Remove CEP from string
    let cleanAddress = addressString.replace(/\b\d{5}-?\d{3}\b/, '').trim();
    
    // Try to extract number (usually at the end or after comma)
    const numberMatch = cleanAddress.match(/\b(\d+)\b(?=\s*$|,)/);
    const number = numberMatch ? numberMatch[1] : undefined;
    if (number) {
      cleanAddress = cleanAddress.replace(/\b\d+\b(?=\s*$|,)/, '').trim();
    }
    
    // Split by comma to get parts
    const parts = cleanAddress.split(',').map(p => p.trim()).filter(p => p);
    
    return {
      cep: cep ? `${cep.slice(0, 5)}-${cep.slice(5)}` : undefined,
      street: parts[0] || '',
      number: number,
      complement: undefined, // Hard to extract from string
      neighborhood: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || ''
    };
  }
  

  
  closeAddressModal(): void {
    this.showAddressModal = false;
    this.editingAddress = null;
    this.addressForm.reset({ is_default: false });
    this.loadingCep = false;
  }
  
  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '');
    // Show loading only when CEP has 8 digits
    if (cleaned.length === 8) {
      this.loadingCep = true;
    } else {
      this.loadingCep = false;
    }
  }
  
  onCepFound(response: CEPResponse): void {
    this.loadingCep = false;
    // Fields are automatically filled by the directive
    this.toastService.success('Endereço encontrado!');
  }
  
  onCepError(message: string): void {
    this.loadingCep = false;
    this.toastService.error(message || 'CEP não encontrado. Preencha o endereço manualmente.');
  }
  
  deleteAddress(address: CustomerAddress): void {
    if (!confirm(`Deseja realmente remover o endereço "${address.label}"?`)) return;
    
    // Pass accountId only if available, otherwise delete user-level address
    const accountIdParam = this.accountId || undefined;
    this.addressService.deleteAddress(address.id, accountIdParam).pipe(
      catchError(error => {
        console.error('Error deleting address:', error);
        this.showErrorMessage('Erro ao remover endereço. Tente novamente.');
        return of(null);
      })
    ).subscribe(() => {
      this.loadAddresses();
      this.toastService.success('Endereço removido com sucesso!');
    });
  }
  
  setDefaultAddress(address: CustomerAddress): void {
    // Pass accountId only if available, otherwise set default for user-level address
    const accountIdParam = this.accountId || undefined;
    this.addressService.setAsDefault(address.id, accountIdParam).pipe(
      catchError(error => {
        console.error('Error setting default address:', error);
        this.showErrorMessage('Erro ao definir endereço padrão. Tente novamente.');
        return of(null);
      })
    ).subscribe(() => {
      this.loadAddresses();
      this.toastService.success('Endereço padrão atualizado!');
    });
  }
  
  onCPFInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.unformatCPF(input.value);
    const formatted = this.formatCPF(value);
    this.personalForm.patchValue({ cpf: formatted }, { emitEvent: false });
  }
  
  onPasswordInput(): void {
    const newPassword = this.securityForm.get('newPassword')?.value || '';
    this.passwordStrength = this.calculatePasswordStrength(newPassword);
  }
  
  formatCPF(value: string): string {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }
  
  unformatCPF(value: string): string {
    return value ? value.replace(/\D/g, '') : '';
  }
  
  formatPhone(value: string): string {
    if (!value) return '';
    return FormatUtil.formatPhone(value);
  }
  
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    const formatted = FormatUtil.formatPhone(value);
    this.personalForm.patchValue({ phone: formatted }, { emitEvent: false });
  }
  
  navigateToCatalog(): void {
    this.router.navigate(['/catalog']);
  }
  
  private loadUserProfileData(): void {
    // Clear any previous error messages
    this.personalError = '';
    
    // Load user profile from backend (includes phone)
    this.authService.getCurrentUserProfile().pipe(
      catchError(error => {
        console.error('Error loading user profile:', error);
        // Fallback to local user data
        const user = this.authService.getCurrentUser();
        if (user) {
          this.personalForm.patchValue({
            name: user.name || '',
            email: user.email || ''
          });
        }
        return of(null);
      })
    ).subscribe(userProfile => {
      if (userProfile) {
        console.log('User profile loaded:', userProfile);
        const formattedPhone = userProfile.phone ? FormatUtil.formatPhone(userProfile.phone) : '';
        this.personalForm.patchValue({
          name: userProfile.name || '',
          email: userProfile.email || '',
          phone: formattedPhone
        });
        // Clear error - customer not found is normal for new customers
        this.personalError = '';
        console.info('Customer profile not created yet. Data will be saved when customer makes first order.');
      }
    });
  }
  
  calculatePasswordStrength(password: string): number {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  }
  
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
  
  /**
   * Checks if customer data appears to be default/auto-generated
   */
  private isDefaultCustomerData(customer: Customer): boolean {
    if (!customer) return false;
    
    // Check if name is just the email prefix (default behavior)
    const emailPrefix = customer.email?.split('@')[0] || '';
    if (customer.name === emailPrefix) {
      return true;
    }
    
    // Check if phone is the default phone
    if (customer.phone === '+5511999999999') {
      return true;
    }
    
    // Check if address is the default address
    if (customer.address === 'Endereço não informado') {
      return true;
    }
    
    return false;
  }
  
  showSuccessMessage(message: string): void {
    this.toastService.success(message);
  }
  
  showErrorMessage(message: string): void {
    this.toastService.error(message);
  }
  
  getPasswordStrengthLabel(): string {
    if (this.passwordStrength <= 2) return 'Fraca';
    if (this.passwordStrength <= 4) return 'Média';
    return 'Forte';
  }
  
  getPasswordStrengthColor(): string {
    if (this.passwordStrength <= 2) return 'bg-red-500';
    if (this.passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  }
  
  getPasswordStrengthColorText(): string {
    if (this.passwordStrength <= 2) return 'text-error';
    if (this.passwordStrength <= 3) return 'text-warning';
    return 'text-success';
  }

  getUserInitials(): string {
    const name = this.personalForm.get('name')?.value || '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
