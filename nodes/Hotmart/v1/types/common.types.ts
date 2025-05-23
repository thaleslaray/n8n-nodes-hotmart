// Types for common Hotmart API structures

export interface PageInfo {
  total_results: number;
  next_page_token?: string;
  prev_page_token?: string;
  results_per_page: number;
}

export interface Price {
  value: number;
  currency_code: string;
}

export interface Product {
  id: number;
  name: string;
  ucode: string;
  status?: string;
  created_at?: number;
  format?: string;
  is_subscription?: boolean;
  warranty_period?: number;
}

export interface Buyer {
  name: string;
  ucode: string;
  email: string;
}

export interface Producer {
  name: string;
  ucode: string;
}

export interface Payment {
  method: string;
  installments_number: number;
  type: string;
}

export interface Tracking {
  source_sck: string;
  source: string;
  external_code?: string;
}

export interface Offer {
  payment_mode: string;
  code: string;
}

export interface HotmartFee {
  total: number;
  fixed: number;
  currency_code: string;
  base: number;
  percentage: number;
}

export interface ApiResponse<T> {
  items: T[];
  page_info: PageInfo;
}

export interface QueryParams {
  page?: string;
  rows?: number;
  start_date?: string;
  end_date?: string;
  [key: string]: string | number | boolean | undefined;
}