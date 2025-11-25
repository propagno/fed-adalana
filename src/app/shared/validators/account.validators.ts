import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validators for account-related forms
 */
export class AccountValidators {
  
  /**
   * Validates CPF (Brazilian individual tax ID)
   * Format: 000.000.000-00
   */
  static cpf(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const cpf = control.value.replace(/\D/g, ''); // Remove non-digits
    
    if (cpf.length !== 11) {
      return { cpf: { message: 'CPF deve ter 11 dígitos' } };
    }
    
    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpf: { message: 'CPF inválido' } };
    }
    
    // Validate check digits
    let sum = 0;
    let remainder;
    
    // First check digit
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return { cpf: { message: 'CPF inválido' } };
    }
    
    // Second check digit
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return { cpf: { message: 'CPF inválido' } };
    }
    
    return null; // Valid CPF
  }
  
  /**
   * Validates CNPJ (Brazilian company tax ID)
   * Format: 00.000.000/0000-00
   */
  static cnpj(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const cnpj = control.value.replace(/\D/g, ''); // Remove non-digits
    
    if (cnpj.length !== 14) {
      return { cnpj: { message: 'CNPJ deve ter 14 dígitos' } };
    }
    
    // Check for invalid patterns (all same digits)
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }
    
    // Validate check digits
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    // First check digit
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }
    
    // Second check digit
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }
    
    return null; // Valid CNPJ
  }
  
  /**
   * Validates Brazilian phone number
   * Format: (00) 00000-0000 or (00) 0000-0000
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const phone = control.value.replace(/\D/g, ''); // Remove non-digits
    
    // Brazilian phone: 10 digits (landline) or 11 digits (mobile)
    if (phone.length < 10 || phone.length > 11) {
      return { phone: { message: 'Telefone deve ter 10 ou 11 dígitos' } };
    }
    
    // Check if it's a valid Brazilian phone format
    // Area code should be between 11 and 99
    const areaCode = parseInt(phone.substring(0, 2));
    if (areaCode < 11 || areaCode > 99) {
      return { phone: { message: 'DDD inválido' } };
    }
    
    return null; // Valid phone
  }
  
  /**
   * Validates CEP (Brazilian postal code)
   * Format: 00000-000
   */
  static cep(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const cep = control.value.replace(/\D/g, ''); // Remove non-digits
    
    if (cep.length !== 8) {
      return { cep: { message: 'CEP deve ter 8 dígitos' } };
    }
    
    return null; // Valid CEP format (actual validation done via API)
  }
  
  /**
   * Validates document based on type (CPF or CNPJ)
   */
  static document(documentTypeControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !documentTypeControl.value) {
        return null;
      }
      
      const documentType = documentTypeControl.value;
      const documentNumber = control.value.replace(/\D/g, '');
      
      if (documentType === 'CPF') {
        return AccountValidators.cpf({ value: documentNumber } as AbstractControl);
      } else if (documentType === 'CNPJ') {
        return AccountValidators.cnpj({ value: documentNumber } as AbstractControl);
      }
      
      return null;
    };
  }
}

