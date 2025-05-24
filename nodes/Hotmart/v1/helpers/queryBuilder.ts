import { convertToTimestamp } from './dateUtils';

/**
 * Constrói query parameters a partir de filtros, com mapeamento opcional de nomes
 * 
 * @param filters - Objeto com os filtros do usuário
 * @param mapping - Mapeamento opcional de nomes (de camelCase para snake_case, por exemplo)
 * @param dateFields - Array de campos que são datas e precisam conversão para timestamp
 * @returns Objeto com query parameters prontos para uso na API
 * 
 * @example
 * // Uso básico
 * const qs = buildQueryParams({ buyerEmail: 'test@example.com' });
 * // Resultado: { buyerEmail: 'test@example.com' }
 * 
 * @example
 * // Com mapeamento
 * const qs = buildQueryParams(
 *   { buyerEmail: 'test@example.com' },
 *   { buyerEmail: 'buyer_email' }
 * );
 * // Resultado: { buyer_email: 'test@example.com' }
 * 
 * @example
 * // Com campos de data
 * const qs = buildQueryParams(
 *   { startDate: '2024-01-01' },
 *   { startDate: 'start_date' },
 *   ['startDate']
 * );
 * // Resultado: { start_date: 1704067200 }
 */
export function buildQueryParams(
  filters: Record<string, any>,
  mapping?: Record<string, string>,
  dateFields?: string[]
): Record<string, any> {
  const params: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    // Ignorar valores undefined, null ou strings vazias
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Determinar o nome do parâmetro na query
    const paramKey = mapping?.[key] || key;

    // Converter datas para timestamp se necessário
    if (dateFields?.includes(key)) {
      const timestamp = convertToTimestamp(value);
      if (timestamp) {
        params[paramKey] = timestamp;
      }
    } else {
      params[paramKey] = value;
    }
  });

  return params;
}

/**
 * Mapeamento padrão comum para a API Hotmart
 * Converte de camelCase para snake_case
 */
export const COMMON_FIELD_MAPPING = {
  // Campos de comprador
  buyerEmail: 'buyer_email',
  buyerName: 'buyer_name',
  buyerUcode: 'buyer_ucode',
  
  // Campos de produto
  productId: 'product_id',
  productName: 'product_name',
  productUcode: 'product_ucode',
  
  // Campos de afiliado
  affiliateName: 'affiliate_name',
  
  // Campos de assinatura
  subscriberCode: 'subscriber_code',
  subscriptionId: 'subscription_id',
  planId: 'plan_id',
  
  // Campos de data
  startDate: 'start_date',
  endDate: 'end_date',
  accessionDate: 'accession_date',
  endAccessionDate: 'end_accession_date',
  dateNextCharge: 'date_next_charge',
  
  // Outros campos comuns
  transactionStatus: 'transaction_status',
  rowPerPage: 'row_per_page',
  maxResults: 'max_results',
} as const;

/**
 * Lista de campos que são datas e precisam conversão
 */
export const DATE_FIELDS = [
  'startDate',
  'endDate',
  'accessionDate',
  'endAccessionDate',
  'dateNextCharge',
  'createdAt',
  'updatedAt',
] as const;