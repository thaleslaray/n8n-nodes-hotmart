// Types for club

import { IDataObject } from 'n8n-workflow';

export interface ClubStudent extends IDataObject {
  id: string;
  name: string;
  email: string;
  status: string;
  subscription_id?: number;
  enrolled_date: number;
}

export interface ClubModule extends IDataObject {
  module_id: string;
  module_name: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
}

export interface ClubPage extends IDataObject {
  page_id: string;
  page_name: string;
  page_type: string;
  module_id: string;
  is_completed: boolean;
  completion_date?: number;
}

export interface ClubProgress extends IDataObject {
  student_id: string;
  total_modules: number;
  completed_modules: number;
  total_pages: number;
  completed_pages: number;
  overall_progress_percentage: number;
  modules: ClubModule[];
}

export interface ClubQueryParams extends IDataObject {
  subdomain: string;
  resource_id?: string;
  student_id?: string;
  module_id?: string;
  email?: string;
  page?: string;
  rows?: number;
  max_results?: number;
  page_token?: string;
}