import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { ToastService } from '../../../shared/services/toast.service';
import { PublicRegistrationService } from '../../../core/services/public-registration.service';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Solicite sua Demo Grátis</h3>
        <p class="text-gray-600">Teste por 15 dias sem compromisso. Preencha para iniciarmos seu cadastro.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <app-input 
          label="Nome da Empresa" 
          placeholder="Ex: Restaurante Sabor & Arte"
          formControlName="companyName"
          [prefixIcon]="true"
          [errorMessage]="getErrorMessage('companyName')">
          <span slot="prefix" class="material-icons text-lg">store</span>
        </app-input>

        <app-input 
          label="Nome do Responsável" 
          placeholder="Seu nome completo"
          formControlName="contactName"
          [prefixIcon]="true"
          [errorMessage]="getErrorMessage('contactName')">
          <span slot="prefix" class="material-icons text-lg">person</span>
        </app-input>

        <app-input 
          label="Email Corporativo" 
          type="email"
          placeholder="contato@suaempresa.com"
          formControlName="email"
          [prefixIcon]="true"
          [errorMessage]="getErrorMessage('email')">
          <span slot="prefix" class="material-icons text-lg">mail</span>
        </app-input>

        <app-input 
          label="WhatsApp" 
          type="tel"
          placeholder="(00) 00000-0000"
          formControlName="phone"
          [prefixIcon]="true"
          [errorMessage]="getErrorMessage('phone')">
          <span slot="prefix" class="material-icons text-lg">phone</span>
        </app-input>

        <div class="pt-2">
          <app-button variant="primary" size="lg" class="w-full justify-center" [disabled]="form.invalid || loading">
            <span *ngIf="!loading">Solicitar Demonstração</span>
            <span *ngIf="loading">Enviando...</span>
          </app-button>
        </div>

        <p class="text-xs text-gray-500 text-center mt-4">
          Ao solicitar, você concorda com nossos termos de uso. Entraremos em contato para ativar sua conta.
        </p>
      </form>
    </div>
  `
})
export class LeadFormComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private toastService: ToastService,
    private publicRegistrationService: PublicRegistrationService
  ) {
    this.form = this.fb.group({
      companyName: ['', [Validators.required]],
      contactName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Campo obrigatório';
      if (control.errors?.['email']) return 'Email inválido';
    }
    return '';
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      
      this.publicRegistrationService.requestCompanyRegistration(this.form.value).subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success('Solicitação recebida! Entraremos em contato em breve para ativar sua conta demo.');
          this.form.reset();
        },
        error: (err) => {
          this.loading = false;
          const errorMessage = err.error?.message || 'Erro ao enviar solicitação. Tente novamente.';
          this.toastService.error(errorMessage);
          console.error('Error submitting company registration request:', err);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
