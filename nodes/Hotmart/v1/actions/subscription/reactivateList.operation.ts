import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'Códigos Dos Assinantes',
		name: 'subscriberCodes',
		type: 'string',
		required: true,
		default: '',
		description: 'Lista de códigos dos assinantes separados por vírgula',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['reactivateList'],
			},
		},
	},
	{
		displayName: 'Realizar Nova Cobrança',
		name: 'charge',
		type: 'boolean',
		default: false,
		description: 'Whether to make a new charge when reactivating the subscriptions',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['reactivateList'],
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
			const subscriberCodes = (this.getNodeParameter('subscriberCodes', i) as string)
				.split(',')
				.map(code => code.trim());

			const charge = this.getNodeParameter('charge', i) as boolean;

			const body = {
				subscriber_code: subscriberCodes,
				charge,
			};

			const responseData = await hotmartApiRequest.call(
				this,
				'POST',
				'/payments/api/v1/subscriptions/reactivate',
				body,
			);

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
