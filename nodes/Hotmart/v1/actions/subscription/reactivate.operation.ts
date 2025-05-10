import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'Código do Assinante',
		name: 'subscriberCode',
		type: 'string',
		required: true,
		default: '',
		description: 'Código exclusivo do assinante cuja assinatura será reativada',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['reactivate'],
			},
		},
	},
	{
		displayName: 'Realizar Nova Cobrança',
		name: 'charge',
		type: 'boolean',
		default: false,
		description: 'Se deve realizar uma nova cobrança ao reativar a assinatura',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['reactivate'],
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
			const charge = this.getNodeParameter('charge', i) as boolean;

			const body = {
				charge,
			};

			const responseData = await hotmartApiRequest.call(
				this,
				'POST',
				`/payments/api/v1/subscriptions/${subscriberCode}/reactivate`,
				body,
			);

			// O retorno da API inclui:
			// - status: Status atual da assinatura
			// - subscriber_code: Código do assinante
			// - creation_date: Data de criação
			// - interval_between_charges: Ciclo da assinatura
			// - shopper: Dados do pagador (email, phone)

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData || {}),
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
