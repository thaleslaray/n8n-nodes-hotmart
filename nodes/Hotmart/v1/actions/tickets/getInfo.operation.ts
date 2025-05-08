import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
	{
		displayName: 'ID do Evento',
		name: 'event_id',
		type: 'options',
		required: true,
		default: '',
		description: 'Selecione o evento ou especifique um ID usando uma <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
		typeOptions: {
			loadOptionsMethod: 'getEventProducts',
		},
		displayOptions: {
			show: {
				resource: ['tickets'],
				operation: ['getInfo'],
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
			const eventId = this.getNodeParameter('event_id', i) as string;

			const response = await hotmartApiRequest.call(
				this,
				'GET',
				`/events/api/v1/${eventId}/info`,
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
