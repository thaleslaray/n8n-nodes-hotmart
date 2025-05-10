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
				operation: ['getPurchases'],
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

			const responseData = await hotmartApiRequest.call(
				this,
				'GET',
				`/payments/api/v1/subscriptions/${subscriberCode}/purchases`,
			);

			// A API retorna um array de compras com:
			// - transaction: código de referência
			// - approved_date: data de aprovação
			// - payment_engine: plataforma de pagamento
			// - status: status da compra
			// - price: valor e moeda
			// - payment_type: tipo de pagamento
			// - payment_method: método de pagamento
			// - recurrency_number: número da recorrência
			// - under_warranty: se está em garantia
			// - purchase_subscription: se é compra de assinatura

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
