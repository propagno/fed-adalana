/**
 * Utilitário para transformação de dados entre snake_case (backend) e camelCase (frontend)
 */

/**
 * Converte um objeto de snake_case para camelCase recursivamente
 * @param obj Objeto ou valor a ser convertido
 * @returns Objeto convertido para camelCase
 */
export function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const camelObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamelKey(key);
        camelObj[camelKey] = snakeToCamel(obj[key]);
      }
    }
    return camelObj;
  }

  return obj;
}

/**
 * Converte uma chave de snake_case para camelCase
 * @param key Chave em snake_case
 * @returns Chave em camelCase
 */
function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte um objeto de camelCase para snake_case recursivamente
 * @param obj Objeto ou valor a ser convertido
 * @returns Objeto convertido para snake_case
 */
export function camelToSnake(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const snakeObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnakeKey(key);
        snakeObj[snakeKey] = camelToSnake(obj[key]);
      }
    }
    return snakeObj;
  }

  return obj;
}

/**
 * Converte uma chave de camelCase para snake_case
 * @param key Chave em camelCase
 * @returns Chave em snake_case
 */
function camelToSnakeKey(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Transforma uma resposta do backend aplicando uma função de transformação
 * @param response Resposta do backend
 * @param transformer Função de transformação
 * @returns Objeto transformado
 */
export function transformResponse<T>(response: any, transformer: (obj: any) => T): T {
  return transformer(response);
}

/**
 * Transforma um array de respostas do backend aplicando uma função de transformação
 * @param responses Array de respostas do backend
 * @param transformer Função de transformação
 * @returns Array de objetos transformados
 */
export function transformArrayResponse<T>(responses: any[], transformer: (obj: any) => T): T[] {
  return responses.map(response => transformer(response));
}

/**
 * Converte um valor BigDecimal do backend (string ou number) para number
 * @param value Valor do backend
 * @returns Número convertido ou undefined se inválido
 */
export function parseBigDecimal(value: any): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Converte um valor boolean do backend (pode ser string "true"/"false" ou boolean)
 * @param value Valor do backend
 * @returns Boolean convertido ou false se inválido
 */
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
}

/**
 * Converte um valor Date do backend (string ISO) para Date
 * @param value Valor do backend
 * @returns Date convertido ou undefined se inválido
 */
export function parseDate(value: any): Date | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

