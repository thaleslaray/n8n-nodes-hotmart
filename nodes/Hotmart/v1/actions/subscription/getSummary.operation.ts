import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption } from '../common.descriptions';
import { getAllItems } from '../../helpers/pagination'; // Importar helper
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getSummary'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getSummary'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getSummary'],
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
				resource: ['subscription'],
				operation: ['getSummary'],
			},
		},
		options: [
			{
				displayName: 'ID do Produto',
				name: 'productId',
				type: 'options',
				default: '',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
			},
			{
				displayName: 'Código do Assinante',
				name: 'subscriberCode',
				type: 'string',
				default: '',
				description: 'Filtrar por código do assinante',
			},
			{
				displayName: 'Data de Início da Assinatura',
				name: 'accessionDate',
				type: 'dateTime',
				default: '',
				description: 'Data de início da assinatura',
			},
			{
				displayName: 'Data Final da Assinatura',
				name: 'endAccessionDate',
				type: 'dateTime',
				default: '',
				description: 'Data de cancelamento da assinatura',
			},
			{
				displayName: 'Data da Próxima Cobrança',
				name: 'dateNextCharge',
				type: 'dateTime',
				default: '',
			},
		],
	},
];

export const execute = async function (
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const allReturnData: INodeExecutionData[] = []; // Renomeado para clareza

	for (let i = 0; i < items.length; i++) {
		try {
			const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as {
				productId?: string;
				subscriberCode?: string;
				accessionDate?: string;
				endAccessionDate?: string;
				dateNextCharge?: string;
			};

			const qs: Record<string, any> = {};

			if (filters.productId) {
				qs.product_id = parseInt(filters.productId, 10);
			}

			if (filters.subscriberCode) {
				qs.subscriber_code = filters.subscriberCode;
			}


			if (filters.accessionDate) {
				const ts = convertToTimestamp(filters.accessionDate);
				if (ts) qs.accession_date = ts;
			}

			if (filters.endAccessionDate) {
				const ts = convertToTimestamp(filters.endAccessionDate);
				if (ts) qs.end_accession_date = ts;
			}

			if (filters.dateNextCharge) {
				const ts = convertToTimestamp(filters.dateNextCharge);
				if (ts) qs.date_next_charge = ts;
			}

			let responseData;

			if (returnAll) {
				// Usar o helper de paginação para buscar TODAS as páginas
				const maxResults = this.getNodeParameter('maxResults', i, 50) as number;
				const allItems = await getAllItems.call(
					this,
					{
						maxResults,
						resource: 'subscription',
						operation: 'getSummary', // O helper usa isso para encontrar o endpoint
						query: qs,
						// endpoint: '/payments/api/v1/subscriptions/summary', // Removido - O helper determina isso
					},
				);
				responseData = { items: allItems }; // Helper retorna array direto
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;
				responseData = await hotmartApiRequest.call(
					this,
					'GET',
					'/payments/api/v1/subscriptions/summary',
					{},
					qs,
				);
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData.items || []),
				{ itemData: { item: i } },
			);

			allReturnData.push(...executionData); // Renomeado
		} catch (error) {
			if (this.continueOnFail()) {
				allReturnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } }); // Renomeado
				continue;
			}
			throw error;
		}
	}

	return [allReturnData]; // Renomeado
};
