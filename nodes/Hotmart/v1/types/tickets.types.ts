// Types for tickets

import { IDataObject } from 'n8n-workflow';

export interface EventInfo extends IDataObject {
  event_id: string;
  event_name: string;
  event_date: number;
  location: string;
  total_tickets: number;
  sold_tickets: number;
  available_tickets: number;
}

export interface TicketParticipant extends IDataObject {
  ticket_id: string;
  participant_name: string;
  participant_email: string;
  participant_document: string;
  ticket_status: 'ACTIVE' | 'USED' | 'CANCELED';
  purchase_date: number;
  check_in_date?: number;
}

export interface TicketQueryParams extends IDataObject {
  event_id?: string;
  buyer_email?: string;
  participant_email?: string;
  last_update?: number;
  id_lot?: string;
  ticket_status?: string;
  ticket_type?: string;
  checkin_status?: string;
  id_eticket?: string;
  ticket_qr_code?: string;
  start_date?: string;
  end_date?: string;
  page?: string;
  rows?: number;
  max_results?: number;
  page_token?: string;
}