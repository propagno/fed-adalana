import { Directive, Input, ElementRef, HostListener, Optional } from '@angular/core';
import { NgControl, AbstractControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';

@Directive({
  selector: '[appFormValidation]',
  standalone: true
})
export class FormValidationDirective {
  @Input() showValidationOn: 'blur' | 'change' | 'submit' = 'blur';
  @Input() fieldName: string = 'Campo';
  @Input() showErrorMessage: boolean = true;

  private errorElement: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    @Optional() private control: NgControl,
    private validationService: ValidationService
  ) {}

  @HostListener('blur', ['$event'])
  onBlur(): void {
    if (this.showValidationOn === 'blur') {
      this.updateValidationState();
    }
  }

  @HostListener('input', ['$event'])
  onInput(): void {
    if (this.showValidationOn === 'change') {
      this.updateValidationState();
    }
  }

  private updateValidationState(): void {
    const control = this.control?.control;
    if (!control) return;

    const element = this.el.nativeElement;
    const isInvalid = control.invalid && (control.dirty || control.touched);
    const isValid = control.valid && control.dirty;

    // Remove previous classes
    element.classList.remove(
      'border-red-500', 
      'border-green-500', 
      'ring-red-500', 
      'ring-green-500',
      'ring-2'
    );
    
    if (isInvalid) {
      element.classList.add('border-red-500', 'ring-red-500', 'ring-2');
      if (this.showErrorMessage) {
        this.showError(control);
      }
    } else if (isValid) {
      element.classList.add('border-green-500', 'ring-green-500', 'ring-2');
      this.hideError();
    } else {
      this.hideError();
    }
  }

  private showError(control: AbstractControl): void {
    const errorMessage = this.validationService.getErrorMessage(control, this.fieldName);
    
    if (!errorMessage) {
      this.hideError();
      return;
    }

    // Remove existing error element
    this.hideError();

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mt-1 flex items-start gap-1';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    
    errorDiv.innerHTML = `
      <svg class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-red-600">${errorMessage}</p>
    `;

    // Insert after the input element
    const parent = this.element.parentElement;
    if (parent) {
      parent.insertBefore(errorDiv, this.element.nextSibling);
      this.errorElement = errorDiv;
    }
  }

  private hideError(): void {
    if (this.errorElement) {
      this.errorElement.remove();
      this.errorElement = null;
    }
  }

  private get element(): HTMLElement {
    return this.el.nativeElement;
  }
}

