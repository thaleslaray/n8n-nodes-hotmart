/**
 * @fileoverview Tipos TypeScript para operações de assinaturas da API Hotmart
 * 
 * @description Este arquivo contém todas as definições de tipos para assinaturas,
 * incluindo planos, assinantes, status e estruturas de dados relacionadas.
 * Garante type safety completo para todas as operações de subscription.
 * 
 * @since v0.1.0 - Tipos básicos
 * @since v0.5.0 - Tipos AI Ready expandidos
 * @since v0.6.0 - Tipos otimizados para performance
 */

import { IDataObject } from 'n8n-workflow';
import { Product, Price } from './common.types';

/**
 * Plano de assinatura da Hotmart
 * 
 * @interface SubscriptionPlan
 * @description Define a estrutura de um plano de assinatura com configurações
 * de recorrência e ciclos de cobrança.
 */
export interface SubscriptionPlan {
  /** Nome do plano de assinatura */
  name: string;
  /** ID único do plano */
  id: number;
  /** Período de recorrência em dias */
  recurrency_period: number;
  /** Máximo de ciclos de cobrança (0 = ilimitado) */
  max_charge_cycles: number;
}

/**
 * Dados do assinante
 * 
 * @interface Subscriber
 * @description Informações básicas do assinante de um produto
 */
export interface Subscriber {
  /** Nome completo do assinante */
  name: string;
  /** Email do assinante */
  email: string;
  /** Código único do usuário na Hotmart */
  ucode: string;
}

export interface SubscriptionItem extends IDataObject {
  subscriber_code: string;
  subscription_id: number;
  status: 'ACTIVE' | 'CANCELED' | 'DELAYED' | 'EXPIRED' | 'TRIAL_PERIOD';
  accession_date: number;
  end_accession_date?: number;
  request_date: number;
  date_next_charge?: number;
  trial: boolean;
  transaction: string;
  plan: SubscriptionPlan;
  product: Product;
  price: Price;
  subscriber: Subscriber;
}

export interface SubscriptionTransaction extends IDataObject {
  transaction: string;
  status: string;
  subscriber_code: string;
  value: number;
  currency: string;
  date_transaction: number;
  recurrence_number: number;
}

export interface SubscriptionPurchase extends IDataObject {
  transaction: string;
  value: number;
  currency: string;
  status: string;
  payment_method: string;
  order_date: number;
  recurrence_number: number;
}

export interface SubscriptionSummary extends IDataObject {
  date: string;
  new_subscriptions: number;
  cancellations: number;
  activations: number;
  reactivations: number;
  total_active: number;
}

export interface SubscriptionQueryParams extends IDataObject {
  subscriber_code?: string;
  product_id?: string | number;
  plan?: string;
  accession_date_begin?: string | number;
  accession_date_end?: string | number;
  end_accession_date?: string | number;
  request_date?: string | number;
  status?: 'ACTIVE' | 'CANCELED' | 'DELAYED' | 'EXPIRED' | 'TRIAL_PERIOD' | string;
  date_next_charge?: string | number;
  transaction?: string;
  page?: string;
  rows?: number;
  max_results?: number;
  page_token?: string;
}

export interface CancelSubscriptionParams {
  subscriber_code: string;
  send_email?: boolean;
}

export interface ReactivateSubscriptionParams {
  subscriber_code: string;
  charge?: boolean;
}

export interface SubscriptionSummaryQueryParams {
  start_date: number;
  end_date: number;
  group_by?: string;
}