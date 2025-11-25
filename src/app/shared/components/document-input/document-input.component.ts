import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../design-system/input/input.component';
import { formatCPF, formatCNPJ } from '../../validators/document.validator';

@Component({
  selector: 'app-document-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentInputComponent),
      multi: true
    }
  ],
  template: `
    <app-input
      [label]="label"
      [type]="'text'"
      [placeholder]="placeholder"
      [formControl]="internalControl"
      [errorMessage]="errorMessage"
      (input)="onInputChange($event)">
    </app-input>
  `
})
export class DocumentInputComponent implements ControlValueAccessor {
  @Input() label = 'Documento';
  @Input() type: 'CPF' | 'CNPJ' = 'CPF';
  @Input() errorMessage = '';

  internalControl = new FormControl('');
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get placeholder(): string {
    return this.type === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00';
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');

    // Apply mask
    const formatted = this.type === 'CPF' ? formatCPF(digitsOnly) : formatCNPJ(digitsOnly);
    
    // Update internal control
    this.internalControl.setValue(formatted, { emitEvent: false });
    
    // Notify parent form of the raw digits value
    this.onChange(digitsOnly);
    this.onTouched();
  }

  writeValue(value: string): void {
    if (value) {
      const digitsOnly = value.replace(/\D/g, '');
      const formatted = this.type === 'CPF' ? formatCPF(digitsOnly) : formatCNPJ(digitsOnly);
      this.internalControl.setValue(formatted, { emitEvent: false });
    } else {
      this.internalControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalControl.disable();
    } else {
      this.internalControl.enable();
    }
  }
}

