import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      <label *ngIf="label" 
             [for]="selectId"
             class="block text-body-sm font-medium text-primary mb-2">
        {{ label }}
        <span *ngIf="required" class="text-secondary ml-1">*</span>
      </label>
      
      <div class="relative">
        <select
          [id]="selectId"
          [value]="value"
          [disabled]="disabled"
          [required]="required"
          [class]="getSelectClasses()"
          (change)="onSelectChange($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.aria-label]="ariaLabel || label"
          [attr.aria-describedby]="helperText ? selectId + '-helper' : null"
          [attr.aria-invalid]="hasError">
          <option *ngIf="placeholder" value="" disabled>{{ placeholder }}</option>
          <ng-content></ng-content>
        </select>
        
        <!-- Dropdown Icon -->
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <!-- Helper Text / Error Message -->
      <div *ngIf="helperText || errorMessage" 
           [id]="selectId + '-helper'"
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
    </div>
  `,
  styles: []
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() selectId?: string;
  @Input() placeholder?: string;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() ariaLabel?: string;

  value: string = '';
  isFocused: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  getSelectClasses(): string {
    const baseClasses = 'w-full px-4 py-2.5 pr-10 border rounded-medium text-body bg-white appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer';
    
    let stateClasses = '';
    if (this.disabled) {
      stateClasses = 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
    } else if (this.hasError) {
      stateClasses = 'border-error focus:border-error focus:ring-error';
    } else if (this.isFocused) {
      stateClasses = 'border-primary-light focus:border-primary-light focus:ring-primary-light';
    } else {
      stateClasses = 'border-gray-300 focus:border-primary-light focus:ring-primary-light';
    }

    return `${baseClasses} ${stateClasses}`;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
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

