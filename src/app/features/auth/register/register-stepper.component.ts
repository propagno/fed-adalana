import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterBasicComponent } from './register-basic/register-basic.component';
import { RegisterAddressComponent } from './register-address/register-address.component';
import { RegisterWelcomeComponent } from './register-welcome/register-welcome.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cep?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  isMainAddress?: boolean;
}

@Component({
  selector: 'app-register-stepper',
  standalone: true,
  imports: [CommonModule, RegisterBasicComponent, RegisterAddressComponent, RegisterWelcomeComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gradient-hero flex items-center justify-center py-12 px-4">
      <div class="max-w-2xl w-full">
        <!-- Logo Adalana -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="relative">
              <span class="text-display font-display text-primary-light">A</span>
            </div>
            <div class="flex items-baseline gap-0.5">
              <span class="text-display font-display text-white">dalan</span>
              <span class="text-display font-display text-secondary">A</span>
            </div>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div *ngFor="let step of steps; let i = index" 
                 class="flex items-center flex-1">
              <div class="flex flex-col items-center flex-1">
                <div [class.bg-primary-light]="currentStep >= i"
                     [class.bg-gray-300]="currentStep < i"
                     [class.text-white]="currentStep >= i"
                     [class.text-gray-500]="currentStep < i"
                     class="w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors shadow-elevation-1">
                  <span *ngIf="currentStep > i">✓</span>
                  <span *ngIf="currentStep <= i">{{ i + 1 }}</span>
                </div>
                <span [class.text-primary-light]="currentStep >= i"
                      [class.text-gray-400]="currentStep < i"
                      class="mt-2 text-body-sm font-medium text-center text-white">
                  {{ step.label }}
                </span>
              </div>
              <div *ngIf="i < steps.length - 1" 
                   [class.bg-primary-light]="currentStep > i"
                   [class.bg-gray-300]="currentStep <= i"
                   class="h-1 flex-1 mx-2 transition-colors">
              </div>
            </div>
          </div>
        </div>

        <!-- Step Content -->
        <app-card [elevation]="3" padding="lg">
          <!-- Step 1: Basic Info -->
          <app-register-basic 
            *ngIf="currentStep === 0"
            [data]="registerData"
            (next)="onBasicNext($event)"
            (cancel)="onCancel()">
          </app-register-basic>

          <!-- Step 2: Address (Optional) -->
          <app-register-address 
            *ngIf="currentStep === 1"
            [data]="registerData"
            (next)="onAddressNext($event)"
            (skip)="onAddressSkip()"
            (back)="currentStep = 0">
          </app-register-address>

          <!-- Step 3: Welcome -->
          <app-register-welcome 
            *ngIf="currentStep === 2"
            [name]="registerData.name"
            (explore)="onWelcomeComplete()"
            (completeLater)="onWelcomeComplete()">
          </app-register-welcome>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterStepperComponent implements OnInit {
  currentStep = 0;
  registerData: RegisterData = {
    name: '',
    email: '',
    password: ''
  };

  steps = [
    { label: 'Básico', key: 'basic' },
    { label: 'Endereço', key: 'address' },
    { label: 'Bem-vindo', key: 'welcome' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load saved data from sessionStorage if exists
    const savedData = sessionStorage.getItem('register_data');
    if (savedData) {
      try {
        this.registerData = { ...this.registerData, ...JSON.parse(savedData) };
      } catch (e) {
        console.error('Error loading saved register data', e);
      }
    }
  }

  onBasicNext(data: Partial<RegisterData>): void {
    this.registerData = { ...this.registerData, ...data };
    this.saveData();
    this.currentStep = 1;
  }

  onAddressNext(data: Partial<RegisterData>): void {
    this.registerData = { ...this.registerData, ...data };
    this.saveData();
    this.currentStep = 2;
  }

  onAddressSkip(): void {
    this.currentStep = 2;
  }

  onWelcomeComplete(): void {
    // Clear saved data
    sessionStorage.removeItem('register_data');
    
    // Navigate to catalog
    this.router.navigate(['/catalog']);
  }

  onCancel(): void {
    sessionStorage.removeItem('register_data');
    this.router.navigate(['/login']);
  }

  private saveData(): void {
    sessionStorage.setItem('register_data', JSON.stringify(this.registerData));
  }
}

