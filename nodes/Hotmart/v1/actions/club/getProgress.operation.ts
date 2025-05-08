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
				operation: ['getProgress'],
			},
		},
	},
	{
		displayName: 'ID do Aluno',
		name: 'user_id',
		type: 'string',
		required: true,
		default: '',
		description: 'ID do aluno (use o endpoint de alunos para obter)',
		displayOptions: {
			show: {
				resource: ['club'],
				operation: ['getProgress'],
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
			const userId = this.getNodeParameter('user_id', i) as string;

			const qs: Record<string, any> = { subdomain };

			const response = await hotmartApiRequest.call(
				this,
				'GET',
				`/club/api/v1/users/${userId}/lessons`,
				{},
				qs,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(response.lessons || []),
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
