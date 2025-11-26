import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DeliveryService, DeliverySettings } from '../../../core/services/delivery.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-delivery-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    private fb: FormBuilder
  ) {
    this.deliveryForm = this.fb.group({
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
          minimumOrderValue: settings.minimumOrderValue || 0
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
    
    // O endereço de origem é buscado automaticamente do cadastro da empresa
    const settings: DeliverySettings = {
      accountId: this.accountId!,
      pricePerKm: formValue.pricePerKm,
      maxDeliveryRadiusKm: formValue.maxDeliveryRadiusKm,
      minimumOrderValue: formValue.minimumOrderValue || 0,
      originAddress: '', // Não é mais necessário, será buscado do Account
      originLatitude: 0,
      originLongitude: 0
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

