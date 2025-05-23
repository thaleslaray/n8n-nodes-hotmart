// Types for sales

import { IDataObject } from 'n8n-workflow';
import { Product, Price, Buyer, Producer, Payment, Tracking, Offer, HotmartFee } from './common.types';

export interface Purchase {
  transaction: string;
  order_date: number;
  approved_date?: number;
  status: string;
  recurrency_number?: number;
  is_subscription: boolean;
  commission_as: string;
  price: Price;
  payment: Payment;
  tracking: Tracking;
  warranty_expire_date?: number;
  offer: Offer;
  hotmart_fee: HotmartFee;
}

export interface SalesHistoryItem extends IDataObject {
  product: Product;
  buyer: Buyer;
  producer: Producer;
  purchase: Purchase;
}

export interface Commission extends IDataObject {
  transaction: string;
  commission_value: number;
  commission_currency_code: string;
  source: string;
  user_name: string;
  user_ucode: string;
}

export interface PriceDetail extends IDataObject {
  transaction: string;
  product: {
    id: number;
    name: string;
  };
  base: Price;
  total: Price;
  vat?: Price;
  fee?: Price;
  coupon?: {
    code: string;
    value: number;
  };
  real_conversion_rate?: number;
}

export interface SalesSummary {
  total_items_count: number;
  total_value: Price;
  results_per_currency: {
    [currency: string]: {
      total_items: number;
      total_value: number;
    };
  };
}

export interface SalesParticipant {
  transaction: string;
  name: string;
  email: string;
  role: string;
  ucode: string;
}

export interface RefundRequest {
  transaction: string;
  reason: string;
}

export interface SalesQueryParams extends IDataObject {
  transaction?: string;
  product_id?: string | number;
  buyer_email?: string;
  buyer_name?: string;
  start_date?: string | number;
  end_date?: string | number;
  transaction_status?: string;
  commission_as?: string;
  sales_source?: string;
  payment_type?: string;
  offer_code?: string;
  page?: string;
  rows?: number;
  max_results?: number;
  next_page_token?: string;
}

export interface CommissionItem {
  transaction: string;
  product: {
    name: string;
    id: number;
  };
  exchange_rate_currency_payout: number;
  commissions: Array<{
    commission: {
      currency_value: string;
      value: number;
    };
    user: {
      ucode: string;
      name: string;
    };
    source: string;
  }>;
}

export interface SalesParticipantItem extends IDataObject {
  transaction: string;
  product: {
    name: string;
    id: number;
  };
  users: Array<{
    role: string;
    user: {
      ucode: string;
      locale: string;
      name: string;
      trade_name?: string;
      cellphone?: string;
      phone?: string;
      email: string;
      documents?: Array<{
        value: string;
        type: string;
      }>;
      address?: {
        city: string;
        state: string;
        country: string;
        zip_code: string;
        address: string;
        complement?: string;
        neighborhood?: string;
        number: string;
      };
    };
  }>;
}

export interface SalesSummaryResponse extends IDataObject {
  total_items: number;
  total_value: {
    value: number;
    currency_code: string;
  };
  results_per_currency?: {
    [currency: string]: {
      total_items: number;
      total_value: number;
    };
  };
}