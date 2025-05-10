import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption, transactionStatusOptions, paymentTypeOptions } from '../common.descriptions';
import { getAllItems } from '../../helpers/pagination';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getDetalhamentoPrecos'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getDetalhamentoPrecos'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getDetalhamentoPrecos'],
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
				resource: ['sales'],
				operation: ['getDetalhamentoPrecos'],
			},
		},
		options: [
			/* 1 */
			{
				displayName: 'ID do Produto',
				name: 'productId',
				type: 'options',
				default: '',
				description: 'Filtrar por ID ou nome do produto',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
			},
			/* 2 */
			{
				displayName: 'Data Inicial',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data inicial da transação',
			},
			/* 3 */
			{
				displayName: 'Data Final',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data final da transação',
			},
			/* 4 */
			{
				displayName: 'Código da Transação',
				name: 'transaction',
				type: 'string',
				default: '',
				description: 'Filtrar por código único da transação',
			},
			/* 5 */
			{
				displayName: 'Status da Transação',
				name: 'transactionStatus',
				type: 'options',
				options: transactionStatusOptions,
				default: '',
				description: 'Filtrar por status atual da transação',
			},
			/* 6 */
			{
				displayName: 'Tipo de Pagamento',
				name: 'paymentType',
				type: 'options',
				options: paymentTypeOptions,
				default: '',
				description: 'Filtrar por método de pagamento utilizado na transação',
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
				transactionStatus?: string;
				paymentType?: string;
				startDate?: string;
				endDate?: string;
				transaction?: string;
			};

			const queryParams: Record<string, any> = {};

			if (filters.productId) {
				queryParams.product_id = filters.productId;
			}
			if (filters.transactionStatus) {
				queryParams.transaction_status = filters.transactionStatus;
			}
			if (filters.paymentType) {
				queryParams.payment_type = filters.paymentType;
			}
			if (filters.startDate) {
				queryParams.start_date = convertToTimestamp(filters.startDate);
			}
			if (filters.endDate) {
				queryParams.end_date = convertToTimestamp(filters.endDate);
			}
			if (filters.transaction) {
				queryParams.transaction = filters.transaction;
			}

			let responseData;

			if (returnAll) {
				// Usar o helper de paginação para buscar TODAS as páginas
				const items = await getAllItems.call(
					this,
					{
						maxResults,
						resource: 'sales',
						operation: 'getDetalhamentoPrecos',
						query: queryParams,
					},
				);
				responseData = { items };
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				queryParams.max_results = limit;
				responseData = await hotmartApiRequest.call(
					this,
					'GET',
					'/payments/api/v1/sales/price/details',
					{},
					queryParams,
				);
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData.items || []),
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