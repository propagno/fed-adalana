export class FormatUtil {
  /**
   * Formata valor em CENTAVOS para moeda brasileira
   * Usado para: produtos, carrinhos, pedidos (que usam priceCents)
   * @param cents Valor em centavos (ex: 2200 = R$ 22,00)
   * @param currency Código da moeda (padrão: 'BRL')
   */
  static formatCurrency(cents: number | null | undefined, currency: string = 'BRL'): string {
    if (cents === null || cents === undefined || isNaN(cents)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL'
      }).format(0);
    }
    // Divide por 100 porque o valor vem em centavos
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(cents / 100);
  }

  /**
   * Formata valor em REAIS (BigDecimal) para moeda brasileira
   * Usado para: frete, valores já em reais do backend
   * @param reais Valor em reais (ex: 22.50 = R$ 22,50)
   * @param currency Código da moeda (padrão: 'BRL')
   */
  static formatCurrencyFromReais(reais: number | null | undefined, currency: string = 'BRL'): string {
    if (reais === null || reais === undefined || isNaN(reais)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency || 'BRL'
      }).format(0);
    }
    // Não divide, o valor já está em reais
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(reais);
  }

  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  static formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  static formatPhone(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Brazilian phone numbers
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone; // Return as-is if doesn't match expected format
  }

  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}

