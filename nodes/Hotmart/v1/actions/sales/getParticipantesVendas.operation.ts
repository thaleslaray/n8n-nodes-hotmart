import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { 
	returnAllOption, 
	limitOption, 
	maxResultsOption,
	transactionStatusOptions,
	commissionAsOptions 
} from '../common.descriptions';
import { getAllItems } from '../../helpers/pagination';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getParticipantesVendas'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getParticipantesVendas'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getParticipantesVendas'],
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
				operation: ['getParticipantesVendas'],
			},
		},
		options: [
			// 1. ID do Produto
			{
				displayName: 'ID do Produto',
				name: 'productId',
				type: 'options',
				default: '',
				description: 'Filtrar por ID do produto',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
			},
			// 2. Data Inicial
			{
				displayName: 'Data Inicial',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data inicial',
			},
			// 3. Data Final
			{
				displayName: 'Data Final',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Filtrar por data final',
			},
			// 4. E-mail do Comprador
			{
				displayName: 'E-mail do Comprador',
				name: 'buyerEmail',
				type: 'string',
				default: '',
				description: 'Filtrar por e-mail do comprador',
			},
			// 5. Origem da Venda (SRC)
			{
				displayName: 'Origem da Venda (SRC)',
				name: 'salesSource',
				type: 'string',
				default: '',
				description: 'Filtrar pelo código SRC da origem da venda (src=nomedacampanha)',
			},
			// 6. Código da Transação
			{
				displayName: 'Código da Transação',
				name: 'transaction',
				type: 'string',
				default: '',
				description: 'Filtrar por código da transação',
			},
			// 7. Nome do Comprador
			{
				displayName: 'Nome do Comprador',
				name: 'buyerName',
				type: 'string',
				default: '',
				description: 'Filtrar por nome do comprador',
			},
			// 8. Nome do Afiliado
			{
				displayName: 'Nome do Afiliado',
				name: 'affiliateName',
				type: 'string',
				default: '',
				description: 'Filtrar por nome do afiliado',
			},
			// 9. Comissionado Como
			{
				displayName: 'Comissionado Como',
				name: 'commissionAs',
				type: 'options',
				options: commissionAsOptions,
				default: '',
				description: 'Filtrar por tipo de comissionamento',
			},
			// 10. Status da Transação
			{
				displayName: 'Status da Transação',
				name: 'transactionStatus',
				type: 'options',
				options: transactionStatusOptions,
				default: '',
				description: 'Filtrar por status da transação',
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
				startDate?: string;
				endDate?: string;
				transaction?: string;
				buyerName?: string;
				affiliateName?: string;
				commissionAs?: string;
				buyerEmail?: string;
				salesSource?: string;
			};

			const queryParams: Record<string, any> = {};

			if (filters.productId) {
				queryParams.product_id = filters.productId;
			}
			if (filters.transactionStatus) {
				queryParams.transaction_status = filters.transactionStatus;
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
			if (filters.buyerName) {
				queryParams.buyer_name = filters.buyerName;
			}
			if (filters.affiliateName) {
				queryParams.affiliate_name = filters.affiliateName;
			}
			if (filters.commissionAs) {
				queryParams.commission_as = filters.commissionAs;
			}
			if (filters.buyerEmail) {
				queryParams.buyer_email = filters.buyerEmail;
			}
			if (filters.salesSource) {
				queryParams.sales_source = filters.salesSource;
			}

			let responseData;

			if (returnAll) {
				// Usar o helper de paginação para buscar TODAS as páginas
				const items = await getAllItems.call(
					this,
					{
						maxResults,
						resource: 'sales',
						operation: 'getParticipants',
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
					'/payments/api/v1/sales/users',
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