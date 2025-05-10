import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'ID da Assinatura',
		name: 'subscriptionId',
		type: 'string',
		required: true,
		default: '',
		description: 'Número de identificação da assinatura na Hotmart',
		displayOptions: {
			show: {
				resource: ['negotiate'],
				operation: ['generateNegotiation'],
			},
		},
	},
	{
		displayName: 'Número de Recorrências',
		name: 'recurrences',
		type: 'string',
		required: true,
		default: '1',
		description: 'Números das recorrências para negociação (exemplo: 1,2,3). Pode aceitar de 1 a 5 valores.',
		displayOptions: {
			show: {
				resource: ['negotiate'],
				operation: ['generateNegotiation'],
			},
		},
	},
	{
		displayName: 'Tipo de Pagamento',
		name: 'paymentType',
		type: 'options',
		options: [
			{ name: 'Boleto', value: 'BILLET' },
			{ name: 'PIX', value: 'PIX' },
		],
		required: true,
		default: 'BILLET',
		description: 'Tipo de pagamento para a negociação',
		displayOptions: {
			show: {
				resource: ['negotiate'],
				operation: ['generateNegotiation'],
			},
		},
	},
	{
		displayName: 'Opções Adicionais',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Adicionar Opção',
		default: {},
		displayOptions: {
			show: {
				resource: ['negotiate'],
				operation: ['generateNegotiation'],
			},
		},
		options: [
			{
				displayName: 'Valor do Desconto',
				name: 'discountValue',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Valor absoluto do desconto a ser aplicado',
			},
			{
				displayName: 'Documento',
				name: 'document',
				type: 'string',
				default: '',
				description: 'CPF ou CNPJ do pagador (obrigatório para pagamento via boleto)',
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
			const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
			const recurrencesStr = this.getNodeParameter('recurrences', i) as string;
			const paymentType = this.getNodeParameter('paymentType', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i) as {
				discountValue?: number;
				document?: string;
			};

			// Converter a string de recorrências em um array de números
			const recurrencesArray = recurrencesStr.split(',').map(r => parseInt(r.trim())).filter(n => !isNaN(n));
			
			if (recurrencesArray.length === 0) {
				throw new Error('Pelo menos uma recorrência válida deve ser fornecida');
			}
			
			if (recurrencesArray.length > 5) {
				throw new Error('No máximo 5 recorrências podem ser especificadas');
			}

			const body: {
				subscription_id: string;
				recurrences: number[];
				payment_type: string;
				discount?: {
					type: string;
					value: number;
				};
				document?: string;
			} = {
				subscription_id: subscriptionId,
				recurrences: recurrencesArray,
				payment_type: paymentType,
			};

			// Adicionar opções adicionais se fornecidas
			if (additionalOptions.discountValue !== undefined && additionalOptions.discountValue > 0) {
				body.discount = {
					type: 'CUSTOM',
					value: additionalOptions.discountValue,
				};
			}

			if (additionalOptions.document !== undefined && additionalOptions.document !== '') {
				body.document = additionalOptions.document;
			}

			// Fazer a requisição para gerar a negociação
			const responseData = await hotmartApiRequest.call(
				this,
				'POST',
				'/payments/api/v1/installments/negotiate',
				body,
			);

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