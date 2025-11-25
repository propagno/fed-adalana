import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="password && password.length > 0" class="mt-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-gray-700">Força da senha:</span>
        <span [class]="strengthLabel.color" class="text-xs font-semibold">
          {{ strengthLabel.label }}
        </span>
      </div>
      
      <!-- Strength Bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div [class]="strengthBarClass"
             [style.width.%]="strength"
             class="h-full transition-all duration-300 rounded-full">
        </div>
      </div>
      
      <!-- Requirements List -->
      <div class="mt-3 space-y-1">
        <div *ngFor="let requirement of requirements" 
             class="flex items-center gap-2 text-xs">
          <svg *ngIf="requirement.met" 
               class="w-4 h-4 text-green-500" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg *ngIf="!requirement.met" 
               class="w-4 h-4 text-gray-400" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span [class.text-gray-600]="requirement.met"
                [class.text-gray-400]="!requirement.met">
            {{ requirement.text }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = '';
  
  strength = 0;
  strengthLabel = { label: '', color: '' };
  strengthBarClass = '';
  requirements: Array<{ text: string; met: boolean }> = [];

  constructor(private validationService: ValidationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.updateStrength();
    }
  }

  private updateStrength(): void {
    if (!this.password) {
      this.strength = 0;
      this.strengthLabel = { label: '', color: '' };
      this.strengthBarClass = '';
      this.requirements = [];
      return;
    }

    this.strength = this.validationService.calculatePasswordStrength(this.password);
    this.strengthLabel = this.validationService.getPasswordStrengthLabel(this.strength);
    this.strengthBarClass = this.getStrengthBarClass();
    this.requirements = this.getRequirements();
  }

  private getStrengthBarClass(): string {
    if (this.strength < 30) {
      return 'bg-red-500';
    } else if (this.strength < 50) {
      return 'bg-orange-500';
    } else if (this.strength < 70) {
      return 'bg-yellow-500';
    } else if (this.strength < 90) {
      return 'bg-green-500';
    } else {
      return 'bg-green-600';
    }
  }

  private getRequirements(): Array<{ text: string; met: boolean }> {
    return [
      {
        text: 'Pelo menos 8 caracteres',
        met: this.password.length >= 8
      },
      {
        text: 'Pelo menos uma letra minúscula',
        met: /[a-z]/.test(this.password)
      },
      {
        text: 'Pelo menos uma letra maiúscula',
        met: /[A-Z]/.test(this.password)
      },
      {
        text: 'Pelo menos um número',
        met: /[0-9]/.test(this.password)
      },
      {
        text: 'Pelo menos um caractere especial',
        met: /[^a-zA-Z0-9]/.test(this.password)
      }
    ];
  }
}

