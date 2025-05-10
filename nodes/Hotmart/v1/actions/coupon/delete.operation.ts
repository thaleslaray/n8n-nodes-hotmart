import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'ID do Cupom',
		name: 'coupon_id',
		type: 'string',
		required: true,
		default: '',
		description: 'ID do cupom a ser excluído',
		displayOptions: {
			show: {
				resource: ['coupon'],
				operation: ['delete'],
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
			const couponId = this.getNodeParameter('coupon_id', i) as string;

			const response = await hotmartApiRequest.call(
				this,
				'DELETE',
				`/products/api/v1/coupon/${couponId}`,
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