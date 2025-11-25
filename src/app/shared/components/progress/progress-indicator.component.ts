import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProgressStep {
  id: string;
  label: string;
  route?: string[];
  completed?: boolean;
}

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full" role="progressbar" [attr.aria-valuenow]="currentStepIndex + 1" [attr.aria-valuemin]="1" [attr.aria-valuemax]="steps.length" [attr.aria-label]="'Progresso: passo ' + (currentStepIndex + 1) + ' de ' + steps.length">
      <!-- Steps List -->
      <div class="flex items-center justify-between mb-4">
        <div *ngFor="let step of steps; let i = index" 
             class="flex items-center flex-1"
             [class.flex-1]="i < steps.length - 1">
          <!-- Step Circle -->
          <div class="flex flex-col items-center flex-1">
            <div class="relative flex items-center justify-center">
              <div [class]="getStepCircleClasses(i)"
                   [attr.aria-current]="i === currentStepIndex ? 'step' : null">
                <span *ngIf="step.completed || i < currentStepIndex" class="text-white text-body-sm font-semibold">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </span>
                <span *ngIf="!step.completed && i >= currentStepIndex" class="text-body-sm font-semibold">
                  {{ i + 1 }}
                </span>
              </div>
              
              <!-- Connector Line -->
              <div *ngIf="i < steps.length - 1"
                   [class]="getConnectorClasses(i)"
                   class="absolute left-full w-full h-0.5 -z-10"
                   [style.margin-left]="'1.5rem'">
              </div>
            </div>
            
            <!-- Step Label -->
            <div class="mt-2 text-center max-w-[120px]">
              <p [class]="getStepLabelClasses(i)" class="text-body-sm font-medium">
                {{ step.label }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="bg-primary-light h-full transition-all duration-500 ease-out rounded-full"
             [style.width.%]="getProgressPercentage()">
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgressIndicatorComponent {
  @Input() steps: ProgressStep[] = [];
  @Input() currentStep: string = '';

  get currentStepIndex(): number {
    const index = this.steps.findIndex(step => step.id === this.currentStep);
    return index >= 0 ? index : 0;
  }

  getStepCircleClasses(index: number): string {
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300';
    
    if (index < this.currentStepIndex || this.steps[index].completed) {
      return `${baseClasses} bg-success text-white shadow-md`;
    } else if (index === this.currentStepIndex) {
      return `${baseClasses} bg-primary-light text-white shadow-lg scale-110 ring-4 ring-primary-light/30`;
    } else {
      return `${baseClasses} bg-gray-200 text-gray-500`;
    }
  }

  getConnectorClasses(index: number): string {
    if (index < this.currentStepIndex) {
      return 'bg-success';
    } else {
      return 'bg-gray-200';
    }
  }

  getStepLabelClasses(index: number): string {
    if (index <= this.currentStepIndex) {
      return 'text-primary font-semibold';
    } else {
      return 'text-gray-500';
    }
  }

  getProgressPercentage(): number {
    if (this.steps.length === 0) return 0;
    return ((this.currentStepIndex + 1) / this.steps.length) * 100;
  }
}

