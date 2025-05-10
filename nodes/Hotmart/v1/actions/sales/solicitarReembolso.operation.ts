import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'Código da Transação',
		name: 'transaction',
		type: 'string',
		required: true,
		default: '',
		description: 'Código único de referência da transação a ser reembolsada',
		displayOptions: {
			show: {
				resource: ['sales'],
				operation: ['solicitarReembolso'],
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
			const transaction = this.getNodeParameter('transaction', i) as string;

			const responseData = await hotmartApiRequest.call(
				this,
				'PUT',
				`/payments/api/v1/sales/${transaction}/refund`,
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