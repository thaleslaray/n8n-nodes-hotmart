// Types for subscription

import { IDataObject } from 'n8n-workflow';
import { Product, Price } from './common.types';

export interface SubscriptionPlan {
  name: string;
  id: number;
  recurrency_period: number;
  max_charge_cycles: number;
}

export interface Subscriber {
  name: string;
  email: string;
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