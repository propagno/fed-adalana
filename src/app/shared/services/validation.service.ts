import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  /**
   * Get user-friendly error message for a validation error
   */
  getErrorMessage(control: AbstractControl | null, fieldName: string = 'Campo'): string {
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) {
      return `${fieldName} é obrigatório`;
    }

    if (errors['email']) {
      return 'Email inválido';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      const actualLength = errors['minlength'].actualLength;
      return `${fieldName} deve ter pelo menos ${requiredLength} caracteres (atual: ${actualLength})`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      const actualLength = errors['maxlength'].actualLength;
      return `${fieldName} deve ter no máximo ${requiredLength} caracteres (atual: ${actualLength})`;
    }

    if (errors['min']) {
      const min = errors['min'].min;
      return `${fieldName} deve ser no mínimo ${min}`;
    }

    if (errors['max']) {
      const max = errors['max'].max;
      return `${fieldName} deve ser no máximo ${max}`;
    }

    if (errors['pattern']) {
      return `Formato inválido para ${fieldName.toLowerCase()}`;
    }

    if (errors['passwordStrength']) {
      return errors['passwordStrength'].message || 'Senha muito fraca';
    }

    if (errors['passwordMismatch']) {
      return 'As senhas não coincidem';
    }

    if (errors['cepInvalid']) {
      return 'CEP inválido';
    }

    if (errors['phoneInvalid']) {
      return 'Telefone inválido';
    }

    // Custom error messages
    if (errors['message']) {
      return errors['message'];
    }

    return 'Valor inválido';
  }

  /**
   * Password strength validator
   */
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value;
      const errors: any = {};

      if (value.length < 8) {
        errors['passwordStrength'] = { message: 'Senha deve ter pelo menos 8 caracteres' };
        return errors;
      }

      if (!/[a-z]/.test(value)) {
        errors['passwordStrength'] = { message: 'Senha deve conter pelo menos uma letra minúscula' };
        return errors;
      }

      if (!/[A-Z]/.test(value)) {
        errors['passwordStrength'] = { message: 'Senha deve conter pelo menos uma letra maiúscula' };
        return errors;
      }

      if (!/[0-9]/.test(value)) {
        errors['passwordStrength'] = { message: 'Senha deve conter pelo menos um número' };
        return errors;
      }

      return null;
    };
  }

  /**
   * Calculate password strength score (0-100)
   */
  calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let score = 0;

    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    return Math.min(100, score);
  }

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel(strength: number): { label: string; color: string } {
    if (strength < 30) {
      return { label: 'Muito Fraca', color: 'text-red-600' };
    } else if (strength < 50) {
      return { label: 'Fraca', color: 'text-orange-600' };
    } else if (strength < 70) {
      return { label: 'Média', color: 'text-yellow-600' };
    } else if (strength < 90) {
      return { label: 'Forte', color: 'text-green-600' };
    } else {
      return { label: 'Muito Forte', color: 'text-green-700' };
    }
  }

  /**
   * CEP (Brazilian postal code) validator
   */
  cepValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const cep = control.value.replace(/\D/g, '');
      
      if (cep.length !== 8) {
        return { cepInvalid: true };
      }

      return null;
    };
  }

  /**
   * Format CEP
   */
  formatCEP(cep: string): string {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cleaned;
  }

  /**
   * Phone validator (Brazilian format)
   */
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phone = control.value.replace(/\D/g, '');
      
      if (phone.length < 10 || phone.length > 11) {
        return { phoneInvalid: true };
      }

      return null;
    };
  }

  /**
   * Format phone (Brazilian format)
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    
    return cleaned;
  }
}

