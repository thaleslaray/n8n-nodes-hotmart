import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { getAllItems } from '../../helpers/pagination';
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
			const maxResults = this.getNodeParameter('maxResults', i, 50) as number;
			const filters = this.getNodeParameter('filters', i, {}) as {
				id?: string;
				status?: string;
				format?: string;
			};

			const qs: Record<string, any> = {};
			if (filters.id) qs.id = filters.id;
			if (filters.status) qs.status = filters.status;
			if (filters.format) qs.format = filters.format;

			let responseData;

			if (returnAll) {
				// Usar o helper de paginação para buscar TODAS as páginas
				responseData = await getAllItems.call(
					this,
					{
						maxResults,
						resource: 'product',
						operation: 'getProducts',
						query: qs,
					},
				);
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