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
			// Quando returnAll=true, usamos o valor máximo (500) para maior eficiência
			// Quando returnAll=false, usamos o valor configurado pelo usuário
			const maxResults = returnAll ? 500 : this.getNodeParameter('maxResults', i, 100) as number;
			
			const subdomain = this.getNodeParameter('subdomain', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as {
				email?: string;
			};

			const qs: Record<string, any> = { subdomain };
			if (filters.email) qs.email = filters.email;

			let responseData;

			if (returnAll) {
				// Usar o helper de paginação para buscar TODAS as páginas
				responseData = await getAllItems.call(
					this,
					{
						maxResults, // Aqui estamos passando 500 quando returnAll=true
						resource: 'club',
						operation: 'getStudents',
						query: qs,
					},
				);
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;
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