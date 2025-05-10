import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption } from '../common.descriptions';

export const description: INodeProperties[] = [
	{
		...returnAllOption,
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['get'],
			},
		},
	},
	{
		...limitOption,
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['get'],
				returnAll: [false],
			},
		},
	},
	{
		...maxResultsOption,
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'ID do Produto',
		name: 'product_id',
		type: 'options',
		required: true,
		default: '',
		description: 'ID do produto vinculado ao cupom',
		typeOptions: {
			loadOptionsMethod: 'getProducts',
		},
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['get'],
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
				resource: ['coupon'],
				operation: ['get'],
			},
		},
		options: [
			{
				displayName: 'Código do Cupom',
				name: 'code',
				type: 'string',
				default: '',
				description: 'Código do cupom',
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
			const productId = this.getNodeParameter('product_id', i) as string;
			const filters = this.getNodeParameter('filters', i, {}) as {
				code?: string;
			};

			const qs: Record<string, any> = {};
			if (filters.code) qs.code = filters.code;

			let responseData;

			if (returnAll) {
				// Implementação manual da paginação para a API de cupons
				const allItems: any[] = [];
				let nextPageToken: string | undefined = undefined;
				const rateLimitDelay = 100; // ms

				do {
					const currentQs: Record<string, any> = {
						...qs,
						max_results: maxResults,
						...(nextPageToken && { page_token: nextPageToken }),
					};

					const pageResponse: any = await hotmartApiRequest.call(
						this,
						'GET',
						`/products/api/v1/coupon/product/${productId}`,
						{},
						currentQs,
					);

					if (pageResponse.items && Array.isArray(pageResponse.items)) {
						allItems.push(...pageResponse.items);
					}

					nextPageToken = pageResponse.page_info?.next_page_token;

					if (nextPageToken) {
						await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
					}

				} while (nextPageToken);

				responseData = { items: allItems };
			} else {
				const limit = this.getNodeParameter('limit', i, 50) as number;
				qs.max_results = limit;
				responseData = await hotmartApiRequest.call(
					this,
					'GET',
					`/products/api/v1/coupon/product/${productId}`,
					{},
					qs,
				);
			}

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData.items || []),
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