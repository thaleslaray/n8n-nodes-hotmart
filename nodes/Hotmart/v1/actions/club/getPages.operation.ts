import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'ID do Produto',
		name: 'product_id',
		type: 'options',
		required: true,
		default: '',
		description: 'ID do Produto associado ao módulo',
		typeOptions: {
			loadOptionsMethod: 'getProducts',
		},
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getPages'],
			},
		},
	},
	{
		displayName: 'ID do Módulo',
		name: 'module_id',
		type: 'string',
		required: true,
		default: '',
		description: 'ID do Módulo (use o endpoint de módulos para obter)',
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getPages'],
			},
		},
	},
];

export const execute = async function (
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const productId = this.getNodeParameter('product_id', i) as string;
			const moduleId = this.getNodeParameter('module_id', i) as string;

			const qs: Record<string, any> = { 
				product_id: productId
			};

			// Usando a API v2 conforme solicitado
			const response = await hotmartApiRequest.call(
				this,
				'GET',
				`/club/api/v2/modules/${moduleId}/pages`,
				{},
				qs,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(response || []),
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