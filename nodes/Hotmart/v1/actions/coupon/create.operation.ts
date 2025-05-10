import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
	{
		displayName: 'ID do Produto',
		name: 'product_id',
		type: 'options',
		required: true,
		default: '',
		description: 'ID do produto vinculado ao cupom',
		typeOptions: {
			loadOptionsMethod: 'getProducts',
		},
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Código do Cupom',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		description: 'Código do cupom (máximo 25 caracteres)',
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Desconto',
		name: 'discount',
		type: 'number',
		required: true,
		default: 0.1,
		description: 'Desconto (0 < discount < 0.99)',
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Opções Adicionais',
		name: 'options',
		type: 'collection',
		placeholder: 'Adicionar Opção',
		default: {},
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Data de Início',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'Data que o cupom deve ser ativado',
			},
			{
				displayName: 'Data de Término',
				name: 'end_date',
				type: 'dateTime',
				default: '',
				description: 'Data que o cupom deve ser desativado',
			},
			{
				displayName: 'ID do Afiliado',
				name: 'affiliate',
				type: 'string',
				default: '',
				description: 'ID do afiliado para cupom exclusivo',
			},
			{
				displayName: 'IDs das Ofertas',
				name: 'offer_ids',
				type: 'string',
				default: '',
				description: 'IDs das ofertas (separados por vírgula)',
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
			const productId = this.getNodeParameter('product_id', i) as string;
			const code = this.getNodeParameter('code', i) as string;
			const discount = this.getNodeParameter('discount', i) as number;
			const options = this.getNodeParameter('options', i, {}) as {
				start_date?: string;
				end_date?: string;
				affiliate?: string;
				offer_ids?: string;
			};

			const body: Record<string, any> = {
				code,
				discount,
			};

			// Converter datas para timestamp se fornecidas
			if (options.start_date) {
				body.start_date = convertToTimestamp(options.start_date);
			}
			
			if (options.end_date) {
				body.end_date = convertToTimestamp(options.end_date);
			}
			
			if (options.affiliate) {
				body.affiliate = options.affiliate;
			}
			
			if (options.offer_ids) {
				body.offer_ids = options.offer_ids.split(',').map((id) => id.trim());
			}

			const response = await hotmartApiRequest.call(
				this,
				'POST',
				`/products/api/v1/product/${productId}/coupon`,
				body,
			);

			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray([response || {}]),
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