import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-4">
      <label *ngIf="label" 
             [for]="fieldId"
             [class.text-red-600]="hasError"
             [class.text-gray-700]="!hasError"
             class="block text-sm font-medium mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>
      
      <div class="relative">
        <ng-content></ng-content>
        
        <!-- Validation Icon -->
        <div *ngIf="showValidationIcon" class="absolute right-3 top-3.5">
          <svg *ngIf="isValid && isDirty" 
               class="w-5 h-5 text-green-500" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
               aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg *ngIf="hasError" 
               class="w-5 h-5 text-red-500" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
               aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      
      <!-- Character Counter -->
      <div *ngIf="showCharacterCount && maxLength" 
           class="flex justify-between items-center mt-1">
        <div></div>
        <span [class.text-red-600]="characterCount > maxLength"
              [class.text-gray-500]="characterCount <= maxLength"
              class="text-xs">
          {{ characterCount }} / {{ maxLength }}
        </span>
      </div>
      
      <!-- Error Message -->
      <div *ngIf="hasError && errorMessage" 
           class="mt-1 flex items-start gap-1">
        <svg class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" 
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24"
             aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-600" 
           [attr.aria-live]="'polite'"
           [attr.aria-atomic]="'true'">
          {{ errorMessage }}
        </p>
      </div>
      
      <!-- Helper Text -->
      <p *ngIf="helperText && !hasError" 
         class="mt-1 text-xs text-gray-500">
        {{ helperText }}
      </p>
    </div>
  `,
  styles: []
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() fieldId?: string;
  @Input() required = false;
  @Input() showValidationIcon = true;
  @Input() showCharacterCount = false;
  @Input() maxLength?: number;
  @Input() helperText?: string;
  @Input() control?: NgControl;
  @Input() errorMessage?: string;
  @Input() characterCount = 0;
  @Input() isValid = false;
  @Input() isDirty = false;
  @Input() hasError = false;
}
