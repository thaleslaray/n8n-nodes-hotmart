import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { getAllItems } from '../../helpers/pagination';
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
			
			// Quando returnAll=true, forçamos o valor para 500 para eficiência máxima
			// Quando returnAll=false, usamos o valor configurado pelo usuário
			let maxResults = 100;
			if (returnAll) {
				maxResults = 500; // Valor máximo para eficiência
				console.log('\n[DEBUG] Retornar Todos os Resultados está ativado, usando maxResults=500');
			} else {
				maxResults = this.getNodeParameter('maxResults', i, 100) as number;
				console.log(`\n[DEBUG] Usando maxResults configurado pelo usuário: ${maxResults}`);
			}
			
			const subdomain = this.getNodeParameter('subdomain', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as {
				email?: string;
			};

			const qs: Record<string, any> = { subdomain };
			if (filters.email) qs.email = filters.email;

			let responseData;

			if (returnAll) {
				// Usar o helper de paginação para buscar TODAS as páginas
				console.log(`\n[DEBUG] Chamando getAllItems com maxResults=${maxResults}`);
				
				// Adicionando max_results explicitamente ao query
				qs.max_results = maxResults;
				
				responseData = await getAllItems.call(
					this,
					{
						maxResults,
						resource: 'club',
						operation: 'getStudents',
						query: qs,
					},
				);
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;
				
				console.log(`\n[DEBUG] Fazendo requisição única com limit=${limit}`);
				
				const response = await hotmartApiRequest.call(
					this,
					'GET',
					'/club/api/v1/users',
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