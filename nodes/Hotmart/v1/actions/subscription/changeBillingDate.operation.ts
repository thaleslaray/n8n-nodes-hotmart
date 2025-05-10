import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'Código do Assinante',
		name: 'subscriberCode',
		type: 'string',
		required: true,
		default: '',
		description: 'Código exclusivo do assinante',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['changeBillingDate'],
			},
		},
	},
	{
		displayName: 'Novo Dia de Cobrança',
		name: 'dueDay',
		type: 'number',
		required: true,
		default: 1,
		description: 'Novo dia do mês para cobrança (1 a 31)',
		typeOptions: {
			minValue: 1,
			maxValue: 31,
		},
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['changeBillingDate'],
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
			const subscriberCode = this.getNodeParameter('subscriberCode', i) as string;
			const dueDay = this.getNodeParameter('dueDay', i) as number;

			const body = {
				due_day: dueDay,
			};

			const responseData = await hotmartApiRequest.call(
				this,
				'PATCH',
				`/payments/api/v1/subscriptions/${subscriberCode}`,
				body,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData || {}), // API retorna vazio em caso de sucesso
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
