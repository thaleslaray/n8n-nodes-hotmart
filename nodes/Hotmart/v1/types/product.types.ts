// Types for product

import { IDataObject } from 'n8n-workflow';

export interface ProductItem extends IDataObject {
  id: number;
  name: string;
  ucode: string;
  status: 'DRAFT' | 'PUBLISHED' | 'DELETED';
  created_at: number;
  format: string;
  is_subscription: boolean;
  warranty_period?: number;
}

export interface ProductQueryParams extends IDataObject {
  name?: string;
  ucode?: string;
  id?: string;
  category_id?: string;
  status?: string; // Aceita múltiplos valores
  format?: string;
  page?: string;
  rows?: number;
  max_results?: number;
  next_page_token?: string;
}