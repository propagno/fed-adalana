import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DocumentValidator {
  /**
   * Validator for CPF (Brazilian Individual Taxpayer Registry)
   */
  static cpf(control: AbstractControl): ValidationErrors | null {
    const cpf = control.value?.replace(/\D/g, '');
    
    if (!cpf) {
      return null; // Let required validator handle empty values
    }
    
    if (!isValidCPF(cpf)) {
      return { invalidDocument: true, message: 'CPF inválido' };
    }
    
    return null;
  }

  /**
   * Validator for CNPJ (Brazilian Company Taxpayer Registry)
   */
  static cnpj(control: AbstractControl): ValidationErrors | null {
    const cnpj = control.value?.replace(/\D/g, '');
    
    if (!cnpj) {
      return null; // Let required validator handle empty values
    }
    
    if (!isValidCNPJ(cnpj)) {
      return { invalidDocument: true, message: 'CNPJ inválido' };
    }
    
    return null;
  }

  /**
   * Factory function to create a validator for either CPF or CNPJ
   */
  static document(type: 'CPF' | 'CNPJ'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return type === 'CPF' ? DocumentValidator.cpf(control) : DocumentValidator.cnpj(control);
    };
  }
}

/**
 * Validates a CPF number
 * @param cpf - CPF string (only digits)
 * @returns true if valid, false otherwise
 */
function isValidCPF(cpf: string): boolean {
  // Must have exactly 11 digits
  if (cpf.length !== 11) {
    return false;
  }

  // Reject known invalid CPFs (all digits the same)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {
    checkDigit = 0;
  }
  if (checkDigit !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {
    checkDigit = 0;
  }
  if (checkDigit !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Validates a CNPJ number
 * @param cnpj - CNPJ string (only digits)
 * @returns true if valid, false otherwise
 */
function isValidCNPJ(cnpj: string): boolean {
  // Must have exactly 14 digits
  if (cnpj.length !== 14) {
    return false;
  }

  // Reject known invalid CNPJs (all digits the same)
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {
    checkDigit = 0;
  }
  if (checkDigit !== parseInt(cnpj.charAt(12))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {
    checkDigit = 0;
  }
  if (checkDigit !== parseInt(cnpj.charAt(13))) {
    return false;
  }

  return true;
}

/**
 * Formats a CPF string with mask (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const digitsOnly = cpf.replace(/\D/g, '');
  if (digitsOnly.length <= 3) return digitsOnly;
  if (digitsOnly.length <= 6) return digitsOnly.replace(/(\d{3})(\d+)/, '$1.$2');
  if (digitsOnly.length <= 9) return digitsOnly.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
}

/**
 * Formats a CNPJ string with mask (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const digitsOnly = cnpj.replace(/\D/g, '');
  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 5) return digitsOnly.replace(/(\d{2})(\d+)/, '$1.$2');
  if (digitsOnly.length <= 8) return digitsOnly.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
  if (digitsOnly.length <= 12) return digitsOnly.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
  return digitsOnly.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
}

