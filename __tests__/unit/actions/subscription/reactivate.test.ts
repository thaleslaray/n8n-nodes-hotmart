import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/reactivate.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Subscription - reactivate', () => {
	let mockThis: IExecuteFunctions;
	let mockHotmartApiRequest: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockThis = createMockExecuteFunctions();
		mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
		mockThis.continueOnFail = jest.fn().mockReturnValue(false);

		mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
	});

	it('deve reativar assinatura com sucesso', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return { charge: true };
			return defaultValue;
		});

		const mockResponse = {
			status: 'ACTIVE',
			subscriber_code: 'sub_1234567890',
			reactivation_date: 1641024000000,
			next_charge_date: 1643616000000,
		};

		mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'POST',
			'/payments/api/v1/subscriptions/sub_1234567890/reactivate',
			{ charge: true }
		);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json).toEqual(mockResponse);
	});

	it('deve reativar sem cobrança imediata', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return { charge: false };
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({});

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'POST',
			'/payments/api/v1/subscriptions/sub_1234567890/reactivate',
			{ charge: false }
		);
	});

	it('deve usar charge true por padrão', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_1234567890';
			if (param === 'options') return {};
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({});

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'POST',
			'/payments/api/v1/subscriptions/sub_1234567890/reactivate',
			{ charge: true }
		);
	});

	it('deve lidar com erro quando assinatura já está ativa', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'subscriberCode') return 'sub_active';
			if (param === 'options') return {};
			return defaultValue;
		});

		const mockError = new Error('Subscription is already active');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Subscription is already active');
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

		mockHotmartApiRequest.mockResolvedValueOnce({ status: 'ACTIVE' });

		const result = await execute.call(mockThis, []);

		expect(mockHotmartApiRequest).toHaveBeenCalled();
		expect(result[0]).toHaveLength(1);
	});
});