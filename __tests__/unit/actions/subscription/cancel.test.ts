import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/cancel.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Subscription - cancel', () => {
	let mockThis: IExecuteFunctions;
	let mockHotmartApiRequest: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockThis = createMockExecuteFunctions();
		mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
		mockThis.continueOnFail = jest.fn().mockReturnValue(false);
		mockThis.helpers.constructExecutionMetaData = jest.fn().mockImplementation((items) => items);
		mockThis.helpers.returnJsonArray = jest.fn().mockImplementation((data) => data.map((item: any) => ({ json: item })));

		mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
	});

	it('deve cancelar assinatura com sucesso', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return { sendMail: true };
			return defaultValue;
		});

		const mockResponse = {
			status: 'CANCELLED',
			subscriber_code: 'sub_1234567890',
			creation_date: 1609459200000,
			current_recurrence: 3,
			date_last_recurrence: 1640995200000,
			date_next_charge: null,
			due_day: 15,
		};

		mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'POST',
			'/payments/api/v1/subscriptions/sub_1234567890/cancel',
			{ send_mail: true }
		);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json).toEqual(mockResponse);
	});

	it('deve cancelar sem enviar email quando sendMail é false', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return { sendMail: false };
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({});

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'POST',
			'/payments/api/v1/subscriptions/sub_1234567890/cancel',
			{ send_mail: false }
		);
	});

	it('deve usar sendMail true por padrão', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return {};
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({});

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'POST',
			'/payments/api/v1/subscriptions/sub_1234567890/cancel',
			{ send_mail: true }
		);
	});

	it('deve lidar com erro da API', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_invalid';
			if (param === 'options') return {};
			return defaultValue;
		});

		const mockError = new Error('Subscription not found');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Subscription not found');
	});

	it('deve continuar em caso de erro com continueOnFail', async () => {
		mockThis.continueOnFail = jest.fn().mockReturnValue(true);
		
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_invalid';
			if (param === 'options') return {};
			return defaultValue;
		});

		const mockError = new Error('Invalid subscription');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json.error).toBe('Invalid subscription');
	});

	it('deve processar sem itens de entrada', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return {};
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({ status: 'CANCELLED' });

		const result = await execute.call(mockThis, []);

		expect(mockHotmartApiRequest).toHaveBeenCalled();
		expect(result[0]).toHaveLength(1);
	});

	it('should handle undefined response', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_123';
			return defaultValue;
		});

		// Mock retorna undefined
		mockHotmartApiRequest.mockResolvedValueOnce(undefined);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0][0].json).toEqual({});
	});
});