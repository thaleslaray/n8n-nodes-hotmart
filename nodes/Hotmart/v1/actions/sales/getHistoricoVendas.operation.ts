import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { 
	returnAllOption, 
	limitOption, 
	maxResultsOption, 
	transactionStatusOptions, 
	paymentTypeOptions, 
	commissionAsOptions 
} from '../common.descriptions';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getHistoricoVendas'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getHistoricoVendas'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['getHistoricoVendas'],
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
				resource: ['sales'],
				operation: ['getHistoricoVendas'],
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
			// 4. Origem da Venda (SRC)
			{
				displayName: 'Origem da Venda (SRC)',
				name: 'salesSource',
				type: 'string',
				default: '',
				description: 'Filtrar pelo código SRC da origem da venda (src=nomedacampanha)',
			},
			// 5. Código da Transação
			{
				displayName: 'Código da Transação',
				name: 'transaction',
				type: 'string',
				default: '',
				description: 'Filtrar por código da transação',
			},
			// 6. Nome do Comprador
			{
				displayName: 'Nome do Comprador',
				name: 'buyerName',
				type: 'string',
				default: '',
				description: 'Filtrar por nome do comprador',
			},
			// 7. E-mail do Comprador (corrigido)
			{
				displayName: 'E-mail do Comprador',
				name: 'buyerEmail',
				type: 'string',
				default: '',
				description: 'Filtrar por e-mail do comprador',
			},
			// 8. Status da Transação
			{
				displayName: 'Status da Transação',
				name: 'transactionStatus',
				type: 'options',
				options: transactionStatusOptions,
				default: '',
				description: 'Filtrar por status da transação',
			},
			// 9. Tipo de Pagamento
			{
				displayName: 'Tipo de Pagamento',
				name: 'paymentType',
				type: 'options',
				options: paymentTypeOptions,
				default: '',
				description: 'Filtrar pelo tipo de pagamento',
			},
			// 10. Código da Oferta
			{
				displayName: 'Código da Oferta',
				name: 'offerCode',
				type: 'string',
				default: '',
				description: 'Filtrar pelo código da oferta',
			},
			// 11. Comissionado como
			{
				displayName: 'Comissionado como',
				name: 'commissionAs',
				type: 'options',
				options: commissionAsOptions,
				default: '',
				description: 'Filtrar por tipo de comissionamento',
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
			const filters = this.getNodeParameter('filters', i, {}) as {
				productId?: string;
				transactionStatus?: string;
				startDate?: string;
				endDate?: string;
				buyerEmail?: string;
				buyerName?: string;
				transaction?: string;
				salesSource?: string;
				paymentType?: string;
				offerCode?: string;
				commissionAs?: string;
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
			if (filters.buyerEmail) {
				queryParams.buyer_email = filters.buyerEmail;
			}
			if (filters.buyerName) {
				queryParams.buyer_name = filters.buyerName;
			}
			if (filters.transaction) {
				queryParams.transaction = filters.transaction;
			}
			if (filters.salesSource) {
				queryParams.sales_source = filters.salesSource;
			}
			if (filters.paymentType) {
				queryParams.payment_type = filters.paymentType;
			}
			if (filters.offerCode) {
				queryParams.offer_code = filters.offerCode;
			}
			if (filters.commissionAs) {
				queryParams.commission_as = filters.commissionAs;
			}

			if (returnAll) {
				// SOLUÇÃO DIRETA: Implementação manual de paginação
				// Inicializar com valor máximo permitido pela API (500)
				queryParams.max_results = 500;
				
				// Resultados acumulados
				const allItems: any[] = [];
				let hasMorePages = true;
				
				// Loop manual de paginação
				while (hasMorePages) {
					// Log para depuração
					console.log('\n[Paginação manual] Requisição com parâmetros:', JSON.stringify(queryParams, null, 2));
					
					// Fazer requisição
					const response = await hotmartApiRequest.call(
						this,
						'GET',
						'/payments/api/v1/sales/history',
						{},
						queryParams
					);
					
					// Adicionar itens da página atual
					if (response && response.items && Array.isArray(response.items)) {
						console.log(`\n[Paginação manual] Recebidos ${response.items.length} itens`);
						allItems.push(...response.items);
					}
					
					// Verificar se há mais páginas
					if (response && response.page_info && response.page_info.next_page_token) {
						// Tem próxima página, atualizar token
						queryParams.page_token = response.page_info.next_page_token;
						console.log(`\n[Paginação manual] Próxima página disponível: ${queryParams.page_token}`);
						
						// Pequeno delay para evitar problemas de rate limit
						await new Promise(resolve => setTimeout(resolve, 100));
					} else {
						// Não tem mais páginas
						hasMorePages = false;
						console.log('\n[Paginação manual] Fim da paginação');
					}
				}
				
				console.log(`\n[Paginação manual] Total de itens: ${allItems.length}`);
				
				// Correção: Passando o array diretamente, como no getAll.operation.ts que funciona
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(allItems),
					{ itemData: { item: i } },
				);
				
				allReturnData.push(...executionData);
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				queryParams.max_results = limit;
				
				const response = await hotmartApiRequest.call(
					this,
					'GET',
					'/payments/api/v1/sales/history',
					{},
					queryParams,
				);
				
				// Processar resultados para o caso onde returnAll=false
				const items = response.items || [];
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(items),
					{ itemData: { item: i } },
				);
				
				allReturnData.push(...executionData);
			}
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