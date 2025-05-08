import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { getAllItems } from '../../helpers/pagination';
import { returnAllOption, limitOption, maxResultsOption, subscriptionStatusOptions } from '../common.descriptions';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getAll'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getAll'],
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
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'ID do Produto',
				name: 'productId',
				type: 'options',
				default: '',
				description: 'Selecione da lista ou especifique um ID usando uma <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
			},
			{
				displayName: 'Nome do Plano',
				name: 'plan',
				type: 'string',
				default: '',
				description: 'Filtrar por nome(s) do(s) plano(s) (separe múltiplos nomes com vírgulas)',
			},
			{
				displayName: 'ID do Plano',
				name: 'planId',
				type: 'string',
				default: '',
				description: 'Filtrar por ID do plano',
			},
			{
				displayName: 'Data de Início da Assinatura',
				name: 'accessionDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data inicial da assinatura',
			},
			{
				displayName: 'Data Final da Assinatura',
				name: 'endAccessionDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data final da assinatura',
			},
			{
				displayName: 'Status da Assinatura',
				name: 'status',
				type: 'multiOptions',
				options: subscriptionStatusOptions,
				default: [],
				description: 'Filtrar por status da assinatura',
			},
			{
				displayName: 'Código do Assinante',
				name: 'subscriberCode',
				type: 'string',
				default: '',
				description: 'Filtrar por código do assinante',
			},
			{
				displayName: 'E-mail do Assinante',
				name: 'subscriberEmail',
				type: 'string',
				default: '',
				description: 'Filtrar por email do assinante',
			},
			{
				displayName: 'Código da Transação',
				name: 'transaction',
				type: 'string',
				default: '',
				description: 'Filtrar por código da transação',
			},
			{
				displayName: 'Período de Teste',
				name: 'trial',
				type: 'boolean',
				default: false,
				description: 'Se deve filtrar por assinaturas em período de teste',
			},
			{
				displayName: 'Data Inicial de Cancelamento',
				name: 'cancelationDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data inicial de cancelamento',
			},
			{
				displayName: 'Data Final de Cancelamento',
				name: 'endCancelationDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data final de cancelamento',
			},
			{
				displayName: 'Data da Próxima Cobrança',
				name: 'dateNextCharge',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data da próxima cobrança',
			},
			{
				displayName: 'Data Final da Próxima Cobrança',
				name: 'endDateNextCharge',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data final da próxima cobrança',
			},
		],
	},
];

export const execute = async function (
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const allReturnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
			const maxResults = this.getNodeParameter('maxResults', i, 50) as number;
			const filters = this.getNodeParameter('filters', i, {}) as {
				productId?: string;
				plan?: string;
				planId?: string;
				accessionDate?: string;
				endAccessionDate?: string;
				status?: string[];
				subscriberCode?: string;
				subscriberEmail?: string;
				transaction?: string;
				trial?: boolean;
				cancelationDate?: string;
				endCancelationDate?: string;
				dateNextCharge?: string;
				endDateNextCharge?: string;
			};

			const queryParams: Record<string, any> = {};
			console.log('Todos os filtros:', JSON.stringify(filters, null, 2));
			console.log('Filters recebidos:', JSON.stringify(filters, null, 2));

			if (filters.status?.length) {
				queryParams.status = filters.status.join(',');
			}

			if (filters.productId) {
				queryParams.product_id = filters.productId;
			}

			if (filters.plan) {
				// A API espera múltiplos parâmetros 'plan' ou separados por vírgula.
				// A implementação do status usa join(','), então vamos manter a consistência.
				// Se o usuário inserir múltiplos nomes separados por vírgula, passamos a string.
				queryParams.plan = filters.plan;
			}

			if (filters.planId) {
				queryParams.plan_id = filters.planId;
			}

			if (filters.trial !== undefined) {
				queryParams.trial = filters.trial;
			}

			if (filters.subscriberEmail) {
				queryParams.subscriber_email = filters.subscriberEmail;
			}

			if (filters.transaction) {
				queryParams.transaction = filters.transaction;
			}

			// Função auxiliar para converter datas usando Date.parse para ISO 8601

			if (filters.accessionDate) {
				console.log('Data recebida:', filters.accessionDate);
				const ts = convertToTimestamp(filters.accessionDate);
				console.log('Timestamp convertido:', ts);
				if (ts) queryParams.accession_date = ts;
			}

			if (filters.endAccessionDate) {
				const ts = convertToTimestamp(filters.endAccessionDate);
				if (ts) queryParams.end_accession_date = ts;
			}

			if (filters.cancelationDate) {
				const ts = convertToTimestamp(filters.cancelationDate);
				if (ts) queryParams.cancelation_date = ts;
			}

			if (filters.endCancelationDate) {
				const ts = convertToTimestamp(filters.endCancelationDate);
				if (ts) queryParams.end_cancelation_date = ts;
			}

			if (filters.dateNextCharge) {
				const ts = convertToTimestamp(filters.dateNextCharge);
				if (ts) queryParams.date_next_charge = ts;
			}

			if (filters.endDateNextCharge) {
				const ts = convertToTimestamp(filters.endDateNextCharge);
				if (ts) queryParams.end_date_next_charge = ts;
			}

			if (filters.subscriberCode) { // Adicionado
				queryParams.subscriber_code = filters.subscriberCode;
			}

			let responseData;

			if (returnAll) {
				responseData = await getAllItems.call(
					this,
					{
						maxResults,
						resource: 'subscription',
						operation: 'getAll',
						query: queryParams,
					},
				);
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				queryParams.max_results = limit;
				console.log('Query params finais:', JSON.stringify(queryParams, null, 2));

				const response = await hotmartApiRequest.call(
					this,
					'GET',
					'/payments/api/v1/subscriptions',
					{},
					queryParams,
				);

				responseData = response.items || [];
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData),
				{ itemData: { item: i } },
			);

			allReturnData.push(...executionData);
		} catch (error) {
			if (this.continueOnFail()) {
				allReturnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
				continue;
			}
			throw error;
		}
	}

	return [allReturnData];
};
