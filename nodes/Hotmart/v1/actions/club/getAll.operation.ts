import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption } from '../common.descriptions';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getAll'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Subdomínio',
		name: 'subdomain',
		type: 'string',
		required: true,
		default: '',
		description: 'Nome do subdomínio da Área de Membros',
		displayOptions: {
			show: {
				resource: ['club'],
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
				resource: ['club'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'E-mail do Aluno',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Filtrar por e-mail do Aluno',
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
			const subdomain = this.getNodeParameter('subdomain', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as {
				email?: string;
			};

			const qs: Record<string, any> = { subdomain };
			if (filters.email) qs.email = filters.email;

			// SOLUÇÃO DIRETA: Implementação manual de paginação
			if (returnAll) {
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
						'/club/api/v1/users',
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
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(allItems),
					{ itemData: { item: i } },
				);
				
				returnData.push(...executionData);
			} else {
				// Caso não queira retornar todos, usa o limit normal
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;
				
				// Fazer requisição única
				const response = await hotmartApiRequest.call(
					this,
					'GET',
					'/club/api/v1/users',
					{},
					qs,
				);
				
				// Processar resultados
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