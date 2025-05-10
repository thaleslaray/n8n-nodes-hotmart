// Hotmart - Transações de Assinatura

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption, subscriptionStatusOptions } from '../common.descriptions';
import { billingTypeOptions, recurrencyStatusOptions, paymentTypeOptions } from './constants';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getTransactions'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getTransactions'],
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
				resource: ['subscription'],
				operation: ['getTransactions'],
			},
		},
		options: [
			{
				displayName: 'ID do Produto',
				name: 'product_id',
				type: 'options',
				default: '',
				description: 'Selecione da lista ou especifique um ID usando uma <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
			},
			{
				displayName: 'Código da Transação',
				name: 'transaction',
				type: 'string',
				default: '',
				description: 'Código único de referência para uma transação',
			},
			{
				displayName: 'Nome do Assinante',
				name: 'subscriber_name',
				type: 'string',
				default: '',
				description: 'Nome do comprador envolvido na transação',
			},
			{
				displayName: 'Email do Assinante',
				name: 'subscriber_email',
				type: 'string',
				default: '',
				description: 'Email do comprador envolvido na transação',
			},
			{
				displayName: 'Tipo de Cobrança',
				name: 'billing_type',
				type: 'options',
				options: billingTypeOptions,
				default: '',
				description: 'Tipo da cobrança',
			},
			{
				displayName: 'Status da Assinatura',
				name: 'subscription_status',
				type: 'options',
				options: subscriptionStatusOptions,
				default: '',
				description: 'Estado atual da assinatura',
			},
			{
				displayName: 'Status da Recorrência',
				name: 'recurrency_status',
				type: 'options',
				options: recurrencyStatusOptions,
				default: '',
				description: 'Situação do pagamento da recorrência',
			},
			{
				displayName: 'Status da Compra',
				name: 'purchase_status',
				type: 'string',
				default: '',
				description: 'Situação da transação de compra',
			},
			{
				displayName: 'Data Inicial da Transação',
				name: 'transaction_date',
				type: 'dateTime',
				default: '',
				description: 'Data inicial do filtro',
			},
			{
				displayName: 'Data Final da Transação',
				name: 'end_transaction_date',
				type: 'dateTime',
				default: '',
				description: 'Data final do filtro',
			},
			{
				displayName: 'Código da Oferta',
				name: 'offer_code',
				type: 'string',
				default: '',
				description: 'Chave de oferta (identificador da assinatura/plano)',
			},
			{
				displayName: 'Tipo de Pagamento',
				name: 'purchase_payment_type',
				type: 'options',
				options: paymentTypeOptions,
				default: '',
				description: 'Tipo de pagamento utilizado',
			},
			{
				displayName: 'Código do Assinante',
				name: 'subscriber_code',
				type: 'string',
				default: '',
				description: 'Identificador único do assinante',
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
				product_id?: string;
				transaction?: string;
				subscriber_name?: string;
				subscriber_email?: string;
				billing_type?: string;
				subscription_status?: string;
				recurrency_status?: string;
				purchase_status?: string;
				transaction_date?: string;
				end_transaction_date?: string;
				offer_code?: string;
				purchase_payment_type?: string;
				subscriber_code?: string;
			};

			const queryParams: Record<string, any> = {};

			// Mapear os filtros diretamente para os parâmetros da API
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== '') {
					// Converter datas para timestamp
					if (key === 'transaction_date' || key === 'end_transaction_date') {
						queryParams[key] = new Date(value).getTime();
					} else {
						queryParams[key] = value;
					}
				}
			});

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
						'/payments/api/v1/subscriptions/transactions',
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
					'/payments/api/v1/subscriptions/transactions',
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