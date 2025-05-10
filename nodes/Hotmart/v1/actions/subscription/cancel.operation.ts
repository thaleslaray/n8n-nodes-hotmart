import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'Código do Assinante',
		name: 'subscriberCode',
		type: 'string',
		required: true,
		default: '',
		description: 'Código exclusivo do assinante cuja assinatura será cancelada',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['cancel'],
			},
		},
	},
	{
		displayName: 'Enviar Email',
		name: 'sendMail',
		type: 'boolean',
		default: true,
		description: 'Se deve enviar email de notificação de cancelamento ao comprador',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['cancel'],
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
			const sendMail = this.getNodeParameter('sendMail', i) as boolean;

			const body = {
				send_mail: sendMail,
			};

			// Fazer a requisição para cancelar a assinatura
			const responseData = await hotmartApiRequest.call(
				this,
				'POST',
				`/payments/api/v1/subscriptions/${subscriberCode}/cancel`,
				body,
			);

			// O retorno da API inclui:
			// - status: Status atual da assinatura
			// - subscriber_code: Código do assinante
			// - creation_date: Data de criação
			// - current_recurrence: Número da recorrência atual
			// - date_last_recurrence: Data do último pagamento
			// - date_next_charge: Data da próxima cobrança
			// - due_day: Dia da cobrança
			// - trial_period: Dias de período de teste
			// - interval_type_between_charges: Tipo de intervalo entre cobranças
			// - interval_between_charges: Intervalo entre cobranças
			// - max_charge_cycles: Quantidade máxima de recorrências
			// - activation_date: Data de ativação
			// - shopper: Dados do comprador (email, phone)

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
