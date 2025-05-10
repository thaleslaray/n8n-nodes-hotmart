import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption, productStatusOptions, productFormatOptions } from '../common.descriptions';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['product'],
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
				resource: ['product'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'ID do Produto',
				name: 'id',
				type: 'options',
				default: '',
				description: 'Filtrar por ID ou nome do produto',
				typeOptions: {
					loadOptionsMethod: 'getProducts',
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: productStatusOptions,
				default: 'ACTIVE',
				description: 'Filtrar por status do produto',
			},
			{
				displayName: 'Formato',
				name: 'format',
				type: 'options',
				options: productFormatOptions,
				default: 'EBOOK',
				description: 'Filtrar por formato do produto',
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
			const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
			const filters = this.getNodeParameter('filters', i, {}) as {
				id?: string;
				status?: string;
				format?: string;
			};

			const qs: Record<string, any> = {};
			if (filters.id) qs.id = filters.id;
			if (filters.status) qs.status = filters.status;
			if (filters.format) qs.format = filters.format;

			if (returnAll) {
				// SOLUÇÃO DIRETA: Implementação manual de paginação
				// Inicializar com valor máximo permitido pela API (500)
				qs.max_results = 500;
				
				// Resultados acumulados
				const allItems: any[] = [];
				let hasMorePages = true;
				
				// Loop manual de paginação
				while (hasMorePages) {
					// Log para depuração
					console.log('\n[Paginação manual] Requisição com parâmetros:', JSON.stringify(qs, null, 2));
					
					// Fazer requisição
					const response = await hotmartApiRequest.call(
						this,
						'GET',
						'/products/api/v1/products',
						{},
						qs
					);
					
					// Adicionar itens da página atual
					if (response && response.items && Array.isArray(response.items)) {
						console.log(`\n[Paginação manual] Recebidos ${response.items.length} itens`);
						allItems.push(...response.items);
					}
					
					// Verificar se há mais páginas
					if (response && response.page_info && response.page_info.next_page_token) {
						// Tem próxima página, atualizar token
						qs.page_token = response.page_info.next_page_token;
						console.log(`\n[Paginação manual] Próxima página disponível: ${qs.page_token}`);
						
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
				
				returnData.push(...executionData);
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;
				
				const response = await hotmartApiRequest.call(
					this,
					'GET',
					'/products/api/v1/products',
					{},
					qs,
				);
				
				// Processar resultados para o caso onde returnAll=false
				const items = response.items || [];
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(items),
					{ itemData: { item: i } },
				);
				
				returnData.push(...executionData);
			}
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