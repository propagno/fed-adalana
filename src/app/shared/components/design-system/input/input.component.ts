import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="fullWidth ? 'w-full mb-4' : 'mb-4'">
      <label *ngIf="label" 
             [for]="inputIdValue"
             class="block text-body-sm font-medium text-primary mb-2.5">
        {{ label }}
        <span *ngIf="required" class="text-secondary ml-1">*</span>
      </label>
      
      <div class="relative">
        <!-- Prefix Icon -->
        <div *ngIf="prefixIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <ng-content select="[slot=prefix]"></ng-content>
        </div>
        
        <input
          [id]="inputIdValue"
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [attr.maxlength]="maxLength"
          [attr.autocomplete]="autocomplete"
          [min]="min"
          [max]="max"
          [step]="step"
          [class]="getInputClasses()"
          [class.pl-10]="prefixIcon"
          [class.pr-10]="suffixIcon || showClearButton"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-describedby]="helperText ? inputIdValue + '-helper' : null"
          [attr.aria-invalid]="hasError">
        
        <!-- Suffix Icon -->
        <div *ngIf="suffixIcon && !showClearButton" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <ng-content select="[slot=suffix]"></ng-content>
        </div>
        
        <!-- Clear Button - Mobile-friendly -->
        <button 
          *ngIf="showClearButton && value"
          type="button"
          (click)="clearValue()"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 active:text-gray-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-medium lg:hover:text-gray-600 transition-all"
          aria-label="Limpar campo">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Helper Text / Error Message -->
      <div *ngIf="helperText || errorMessage" 
           [id]="inputIdValue + '-helper'"
           class="mt-1.5">
        <p *ngIf="errorMessage" class="text-body-sm text-error flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ errorMessage }}
        </p>
        <p *ngIf="!errorMessage && helperText" class="text-body-sm text-gray-600">
          {{ helperText }}
        </p>
      </div>
      
      <!-- Character Counter -->
      <div *ngIf="showCharacterCount && maxLength" class="mt-1.5 text-right">
        <span [class.text-error]="characterCount > maxLength"
              [class.text-gray-500]="characterCount <= maxLength"
              class="text-caption">
          {{ characterCount }} / {{ maxLength }}
        </span>
      </div>
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() inputId?: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'time' | 'date' | 'datetime-local' = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() maxLength?: number;
  @Input() autocomplete?: string; // e.g., 'email', 'current-password', 'new-password', 'username', etc.
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() prefixIcon: boolean = false;
  @Input() suffixIcon: boolean = false;
  @Input() showClearButton: boolean = false;
  @Input() showCharacterCount: boolean = false;
  @Input() ariaLabel?: string;
  @Input() fullWidth: boolean = true;

  value: string = '';
  characterCount: number = 0;
  isFocused: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputIdValue(): string {
    return this.inputId || `input-${Math.random().toString(36).substring(2, 9)}`;
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.characterCount = this.value.length;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  clearValue(): void {
    this.value = '';
    this.characterCount = 0;
    this.onChange('');
  }

  getInputClasses(): string {
    const baseClasses = 'w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-medium text-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px]';
    
    let stateClasses = '';
    if (this.disabled) {
      stateClasses = 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60';
    } else if (this.hasError) {
      stateClasses = 'bg-white border-error text-gray-900 focus:border-error focus:ring-error';
    } else if (this.isFocused) {
      stateClasses = 'bg-white border-primary text-gray-900 focus:border-primary focus:ring-primary';
    } else {
      stateClasses = 'bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary';
    }

    return `${baseClasses} ${stateClasses}`;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.characterCount = this.value.length;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

