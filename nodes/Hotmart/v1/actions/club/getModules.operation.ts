import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
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
				operation: ['getModules'],
			},
		},
	},
	{
		displayName: 'Módulos Extras',
		name: 'is_extra',
		type: 'boolean',
		default: false,
		description: 'Se habilitado, retorna apenas módulos extras',
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getModules'],
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
			const subdomain = this.getNodeParameter('subdomain', i) as string;
			const isExtra = this.getNodeParameter('is_extra', i, false) as boolean;

			const qs: Record<string, any> = { subdomain };
			if (isExtra) qs.is_extra = true;

			const response = await hotmartApiRequest.call(
				this,
				'GET',
				'/club/api/v1/modules',
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