import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'Códigos dos Assinantes',
		name: 'subscriberCodes',
		type: 'string',
		required: true,
		default: '',
		description: 'Lista de códigos dos assinantes separados por vírgula',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['cancelList'],
			},
		},
	},
	{
		displayName: 'Enviar Email',
		name: 'sendMail',
		type: 'boolean',
		default: true,
		description: 'Se deve enviar email de notificação aos compradores',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['cancelList'],
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

			const sendMail = this.getNodeParameter('sendMail', i) as boolean;

			const body = {
				subscriber_code: subscriberCodes,
				send_mail: sendMail,
			};

			const responseData = await hotmartApiRequest.call(
				this,
				'POST',
				'/payments/api/v1/subscriptions/cancel',
				body,
			);

			// O retorno da API inclui:
			// - success_subscriptions: array com assinaturas canceladas com sucesso
			// - fail_subscriptions: array com assinaturas que não puderam ser canceladas

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
