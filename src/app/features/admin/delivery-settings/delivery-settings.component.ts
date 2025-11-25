import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DeliveryService, DeliverySettings } from '../../../core/services/delivery.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../shared/services/toast.service';
import { CepService } from '../../../core/services/cep.service';

@Component({
  selector: 'app-delivery-settings',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonComponent, 
    CardComponent, 
    InputComponent,
    PageHeaderComponent
  ],
  templateUrl: './delivery-settings.component.html',
  styles: []
})
export class DeliverySettingsComponent implements OnInit {
  deliveryForm: FormGroup;
  loading = false;
  saving = false;
  accountId: string | null = null;

  constructor(
    private deliveryService: DeliveryService,
    private accountService: AccountService,
    private toastService: ToastService,
    private cepService: CepService,
    private fb: FormBuilder
  ) {
    this.deliveryForm = this.fb.group({
      originCep: [''],
      originStreet: [''],
      originNumber: [''],
      originNeighborhood: [''],
      originCity: [''],
      originState: [''],
      pricePerKm: [0, [Validators.required, Validators.min(0)]],
      maxDeliveryRadiusKm: [50, [Validators.required, Validators.min(1)]],
      minimumOrderValue: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    this.accountService.getMyAccount().subscribe({
      next: (account) => {
        this.accountId = account.id;
        this.loadSettings();
      },
      error: (err) => {
        console.error('Error loading account', err);
        this.toastService.error('Erro ao carregar informações da empresa');
      }
    });
  }

  loadSettings(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    this.deliveryService.getDeliverySettings(this.accountId).subscribe({
      next: (settings) => {
        this.deliveryForm.patchValue({
          pricePerKm: settings.pricePerKm || 0,
          maxDeliveryRadiusKm: settings.maxDeliveryRadiusKm || 50,
          minimumOrderValue: settings.minimumOrderValue || 0,
          originStreet: settings.originAddress || '',
          originCep: this.extractCepFromAddress(settings.originAddress)
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading delivery settings', err);
        // Settings might not exist yet, that's ok
        this.loading = false;
      }
    });
  }

  searchOriginCep(): void {
    const cep = this.deliveryForm.get('originCep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;
    
    this.cepService.searchCep(cep).subscribe({
      next: (address) => {
        this.deliveryForm.patchValue({
          originStreet: address.logradouro || '',
          originNeighborhood: address.bairro || '',
          originCity: address.localidade || '',
          originState: address.uf || ''
        });
      },
      error: () => {
        // Silently fail - CEP might be invalid
      }
    });
  }

  extractCepFromAddress(address: string | undefined): string {
    if (!address) return '';
    // Try to extract CEP from address string
    const cepMatch = address.match(/\d{5}-?\d{3}/);
    return cepMatch ? cepMatch[0] : '';
  }

  calculateExampleFee(): string {
    const pricePerKm = this.deliveryForm.get('pricePerKm')?.value || 0;
    const distance = 5; // Example: 5 km
    const fee = pricePerKm * distance;
    return fee.toFixed(2);
  }

  resetForm(): void {
    this.loadSettings();
  }

  saveSettings(): void {
    if (!this.accountId || this.deliveryForm.invalid) return;
    
    this.saving = true;
    const formValue = this.deliveryForm.value;
    
    // Build origin address string
    const addressParts = [
      formValue.originStreet,
      formValue.originNumber,
      formValue.originNeighborhood,
      formValue.originCity,
      formValue.originState,
      formValue.originCep
    ].filter(p => p);
    const originAddress = addressParts.join(', ');
    
    const settings: DeliverySettings = {
      accountId: this.accountId!,
      pricePerKm: formValue.pricePerKm,
      maxDeliveryRadiusKm: formValue.maxDeliveryRadiusKm,
      minimumOrderValue: formValue.minimumOrderValue || 0,
      originAddress: originAddress || '',
      originLatitude: 0, // Default or need to geocode
      originLongitude: 0 // Default or need to geocode
    };
    
    this.deliveryService.updateDeliverySettings(this.accountId, settings).subscribe({
      next: () => {
        this.toastService.success('Configurações de entrega salvas com sucesso!');
        this.saving = false;
      },
      error: (err: any) => {
        console.error('Error saving delivery settings', err);
        this.toastService.error('Erro ao salvar configurações');
        this.saving = false;
      }
    });
  }
}

