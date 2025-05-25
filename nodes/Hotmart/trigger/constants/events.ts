/**
 * Webhook events constants and configurations
 */

export const WEBHOOK_EVENTS = [
  'PURCHASE_OUT_OF_SHOPPING_CART',
  'PURCHASE_APPROVED',
  'PURCHASE_COMPLETE',
  'PURCHASE_CANCELED',
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_BILLET_PRINTED',
  'PURCHASE_PROTEST',
  'PURCHASE_EXPIRED',
  'PURCHASE_DELAYED',
  'SUBSCRIPTION_CANCELLATION',
  'SWITCH_PLAN',
  'UPDATE_SUBSCRIPTION_CHARGE_DATE',
  'CLUB_FIRST_ACCESS',
  'CLUB_MODULE_COMPLETED',
] as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[number];

/**
 * Event configuration with display names and metadata
 */
export const EVENT_CONFIG = {
  PURCHASE_OUT_OF_SHOPPING_CART: {
    displayName: 'Abandono de Carrinho',
    category: 'purchase',
    index: 8,
    standardName: 'Carrinho Abandonado',
  },
  PURCHASE_APPROVED: {
    displayName: 'Compra Aprovada',
    category: 'purchase',
    index: 0,
    standardName: 'Compra Aprovada',
    hasSubTypes: true, // compra �nica, assinatura, renova��o
  },
  PURCHASE_COMPLETE: {
    displayName: 'Compra Completa',
    category: 'purchase',
    index: 3,
    standardName: 'Compra Completa',
  },
  PURCHASE_CANCELED: {
    displayName: 'Compra Cancelada',
    category: 'purchase',
    index: 4,
    standardName: 'Compra Cancelada',
  },
  PURCHASE_REFUNDED: {
    displayName: 'Compra Reembolsada',
    category: 'purchase',
    index: 5,
    standardName: 'Compra Devolvida',
  },
  PURCHASE_CHARGEBACK: {
    displayName: 'Compra Chargeback',
    category: 'purchase',
    index: 6,
    standardName: 'Chargeback',
  },
  PURCHASE_BILLET_PRINTED: {
    displayName: 'Boleto Impresso',
    category: 'payment',
    index: 7,
    standardName: 'Boleto Impresso',
    hasSubTypes: true, // boleto ou pix
  },
  PURCHASE_PROTEST: {
    displayName: 'Compra em Disputa',
    category: 'purchase',
    index: 10,
    standardName: 'Protesto',
  },
  PURCHASE_EXPIRED: {
    displayName: 'Compra Expirada',
    category: 'purchase',
    index: 9,
    standardName: 'Compra Expirada',
  },
  PURCHASE_DELAYED: {
    displayName: 'Compra Atrasada',
    category: 'purchase',
    index: 9,
    standardName: 'Compra Atrasada',
  },
  SUBSCRIPTION_CANCELLATION: {
    displayName: 'Assinatura Cancelada',
    category: 'subscription',
    index: 11,
    standardName: 'Assinatura Cancelada',
  },
  SWITCH_PLAN: {
    displayName: 'Troca de Plano de Assinatura',
    category: 'subscription',
    index: 12,
    standardName: 'Plano Trocado',
  },
  UPDATE_SUBSCRIPTION_CHARGE_DATE: {
    displayName: 'Troca de dia de Cobran�a',
    category: 'subscription',
    index: 13,
    standardName: 'Data de Cobran�a Alterada',
  },
  CLUB_FIRST_ACCESS: {
    displayName: 'Primeiro Acesso',
    category: 'club',
    index: 14,
    standardName: '�rea de Membros - Primeiro Acesso',
  },
  CLUB_MODULE_COMPLETED: {
    displayName: 'M�dulo Completo',
    category: 'club',
    index: 15,
    standardName: '�rea de Membros - M�dulo Completado',
  },
} as const;

/**
 * Event index mapping for super smart mode
 */
export const SUPER_SMART_EVENT_MAP = {
  PURCHASE_APPROVED: 0, // Will be split into 0, 1, 2 based on type
  PURCHASE_COMPLETE: 3,
  PURCHASE_CANCELED: 4,
  PURCHASE_REFUNDED: 5,
  PURCHASE_CHARGEBACK: 6,
  PURCHASE_BILLET_PRINTED: 7, // or 17 for PIX
  PURCHASE_OUT_OF_SHOPPING_CART: 8,
  PURCHASE_EXPIRED: 9,
  PURCHASE_DELAYED: 9,
  PURCHASE_PROTEST: 10,
  SUBSCRIPTION_CANCELLATION: 11,
  SWITCH_PLAN: 12,
  UPDATE_SUBSCRIPTION_CHARGE_DATE: 13,
  CLUB_FIRST_ACCESS: 14,
  CLUB_MODULE_COMPLETED: 15,
} as const;

/**
 * Validate if event is valid
 */
export function isValidEvent(event: string): event is WebhookEventType {
  return WEBHOOK_EVENTS.includes(event as WebhookEventType);
}

/**
 * Get event configuration
 */
export function getEventConfig(event: string) {
  return EVENT_CONFIG[event as WebhookEventType];
}