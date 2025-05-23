// Types for coupon

import { IDataObject } from 'n8n-workflow';
import { PageInfo } from './common.types';

export interface Coupon {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  max_uses?: number;
  current_uses?: number;
  expires_at?: number;
  product_ids?: number[];
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface CreateCouponParams {
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  max_uses?: number;
  expires_at?: string;
  product_ids?: number[];
}

export interface CouponResponse {
  coupon: Coupon;
  message?: string;
}

export interface CouponItem extends IDataObject {
  coupon_code: string;
  active: boolean;
  start_date?: number;
  discount: number;
  time_zone?: {
    offset: string;
    description: string;
    id: string;
    name: string;
  };
  status: string;
  id: number;
}

export interface CouponListResponse {
  items: CouponItem[];
  page_info: PageInfo;
}

export interface CreateCouponBody extends IDataObject {
  code: string;
  discount: number;
  start_date?: number;
  end_date?: number;
  affiliate?: number | string;
  offer_ids?: number[] | string[];
}

export interface CouponQueryParams extends IDataObject {
  code?: string;
  max_results?: number;
  page_token?: string;
}