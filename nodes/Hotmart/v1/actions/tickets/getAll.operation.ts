import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption } from '../common.descriptions';

export const description: INodeProperties[] = [
	{
		displayName: 'ID do Evento',
		name: 'event_id',
		type: 'options',
		required: true,
		default: '',
		description: 'Selecione o evento ou especifique um ID usando uma <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
		typeOptions: {
			loadOptionsMethod: 'getEventProducts',
		},
		displayOptions: {
			show: {
				resource: ['tickets'],
				operation: ['getAll'],
			},
		},
	},
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['tickets'],
				operation: ['getAll'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['tickets'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Filtros',
		name: 'filters',
		type: 'collection',
		placeholder: 'Adicionar Filtro',
		default: {},
		displayOptions: {
			show: {
				resource: ['tickets'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Email do Comprador',
				name: 'buyer_email',
				type: 'string',
				default: '',
				description: 'E-mail do comprador do ingresso',
			},
			{
				displayName: 'Email do Participante',
				name: 'participant_email',
				type: 'string',
				default: '',
				description: 'E-mail do participante',
			},
			{
				displayName: 'Última Atualização',
				name: 'last_update',
				type: 'number',
				default: '',
				description: 'Data da última atualização do ingresso (timestamp)',
			},
			{
				displayName: 'ID do Lote',
				name: 'id_lot',
				type: 'string',
				default: '',
				description: 'ID do lote/categoria do ingresso',
			},
			{
				displayName: 'Status do Ingresso',
				name: 'ticket_status',
				type: 'options',
				options: [
					{ name: 'Disponível', value: 'AVAILABLE' },
					{ name: 'Contestado', value: 'CHARGEBACK' },
					{ name: 'Excluído', value: 'EXCLUDED' },
					{ name: 'Convite', value: 'INVITE' },
					{ name: 'Convite Cancelado', value: 'INVITE_CANCELED' },
					{ name: 'Reembolsado', value: 'REFUNDED' },
					{ name: 'Reservado', value: 'RESERVED' },
					{ name: 'Vendido', value: 'SOLD' },
				],
				default: 'SOLD',
				description: 'Status do ingresso',
			},
			{
				displayName: 'Tipo de Ingresso',
				name: 'ticket_type',
				type: 'options',
				options: [
					{ name: 'Todos', value: 'ALL' },
					{ name: 'Gratuito', value: 'FREE' },
					{ name: 'Pago', value: 'PAID' },
				],
				default: 'PAID',
				description: 'Tipo do ingresso',
			},
			{
				displayName: 'Status do Check-In',
				name: 'checkin_status',
				type: 'options',
				options: [
					{ name: 'Todos', value: 'ALL' },
					{ name: 'Concluído', value: 'CONCLUDED' },
					{ name: 'Parcial', value: 'PARTIAL' },
					{ name: 'Pendente', value: 'PENDING' },
				],
				default: 'PENDING',
				description: 'Status do check-in',
			},
			{
				displayName: 'ID do E-Ticket',
				name: 'id_eticket',
				type: 'string',
				default: '',
				description: 'ID sequencial do ingresso',
			},
			{
				displayName: 'QR Code do Ingresso',
				name: 'ticket_qr_code',
				type: 'string',
				default: '',
				description: 'Código QR do ingresso',
			},
		],
	},
];

export const execute = async function (
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const eventId = this.getNodeParameter('event_id', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as {
				buyer_email?: string;
				participant_email?: string;
				last_update?: number;
				id_lot?: string;
				ticket_status?: string;
				ticket_type?: string;
				checkin_status?: string;
				id_eticket?: string;
				ticket_qr_code?: string;
			};

			const qs: Record<string, any> = {};
			if (filters.buyer_email) qs.buyer_email = filters.buyer_email;
			if (filters.participant_email) qs.participant_email = filters.participant_email;
			if (filters.last_update) qs.last_update = filters.last_update;
			if (filters.id_lot) qs.id_lot = filters.id_lot;
			if (filters.ticket_status) qs.ticket_status = filters.ticket_status;
			if (filters.ticket_type) qs.ticket_type = filters.ticket_type;
			if (filters.checkin_status) qs.checkin_status = filters.checkin_status;
			if (filters.id_eticket) qs.id_eticket = filters.id_eticket;
			if (filters.ticket_qr_code) qs.ticket_qr_code = filters.ticket_qr_code;

			let responseData;

			if (returnAll) {
				// Implementação manual de paginação para tickets, já que precisa do eventId no path
				const allItems: any[] = [];
				let nextPageToken: string | undefined;
				const maxResults = 50; // Número padrão por página
				const rateLimitDelay = 100; // ms entre requisições
				
				do {
					const queryParams = {
						...qs,
						max_results: maxResults,
						...(nextPageToken && { page_token: nextPageToken }),
					};
					
					const response = await hotmartApiRequest.call(
						this,
						'GET',
						`/events/api/v1/${eventId}/participants`,
						{},
						queryParams,
					);
					
					if (response.items && Array.isArray(response.items)) {
						allItems.push(...response.items);
					}
					
					nextPageToken = (response.page_info)
						? response.page_info.next_page_token
						: undefined;
					
					// Para evitar atingir rate limits, adicionar um pequeno atraso
					if (nextPageToken) {
						await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
					}
					
				} while (nextPageToken);
				
				responseData = allItems;
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;

				const response = await hotmartApiRequest.call(
					this,
					'GET',
					`/events/api/v1/${eventId}/participants`,
					{},
					qs,
				);

				responseData = response.items || [];
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData),
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
				continue;
			}
			throw error;
		}
	}

	return [returnData];
};