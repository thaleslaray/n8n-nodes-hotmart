import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/getTransactions.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/requestTyped';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped');

describe('Subscription - getTransactions', () => {
	let mockThis: IExecuteFunctions;
	let mockHotmartApiRequestTyped: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockThis = createMockExecuteFunctions();
		mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
		mockThis.continueOnFail = jest.fn().mockReturnValue(false);
		mockThis.helpers.constructExecutionMetaData = jest.fn().mockImplementation((items) => items);
		mockThis.helpers.returnJsonArray = jest.fn().mockImplementation((data) => {
			if (!Array.isArray(data)) return [{ json: data }];
			return data.map((item: any) => ({ json: item }));
		});
		mockThis.logger = {
			debug: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		} as any;

		mockHotmartApiRequestTyped = request.hotmartApiRequestTyped as jest.Mock;
	});

	it('deve buscar transações de assinatura com sucesso', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {};
			return defaultValue;
		});

		const mockResponse = {
			items: [
				{
					transaction: 'HP123456789',
					status: 'APPROVED',
					value: 97.00,
					payment_date: 1641024000000,
					payment_type: 'CREDIT_CARD',
					recurrence_number: 1,
				},
				{
					transaction: 'HP234567890',
					status: 'APPROVED',
					value: 97.00,
					payment_date: 1643616000000,
					payment_type: 'CREDIT_CARD',
					recurrence_number: 2,
				},
			],
		};

		mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
			mockThis,
			'GET',
			'/payments/api/v1/subscriptions/transactions',
			{},
			{ max_results: 50 }
		);

		expect(result[0]).toHaveLength(2);
		expect(result[0][0].json.transaction).toBe('HP123456789');
		expect(result[0][1].json.transaction).toBe('HP234567890');
	});

	it('deve buscar com filtros', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {
				purchase_status: 'REFUNDED',
				subscriber_code: 'sub_123',
			};
			return defaultValue;
		});

		mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
			mockThis,
			'GET',
			'/payments/api/v1/subscriptions/transactions',
			{},
			{
				max_results: 50,
				purchase_status: 'REFUNDED',
				subscriber_code: 'sub_123',
			}
		);
	});

	it('deve converter datas para timestamp', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {
				transaction_date: '2024-01-01T00:00:00.000Z',
				end_transaction_date: '2024-12-31T00:00:00.000Z',
			};
			return defaultValue;
		});

		mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
			mockThis,
			'GET',
			'/payments/api/v1/subscriptions/transactions',
			{},
			{
				max_results: 50,
				transaction_date: 1704067200000,
				end_transaction_date: 1735603200000,
			}
		);
	});

	it('deve lidar com resposta vazia', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {};
			return defaultValue;
		});

		mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0]).toEqual([]);
	});

	it('deve lidar com erro da API', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {};
			return defaultValue;
		});

		const mockError = new Error('Subscription not found');
		mockHotmartApiRequestTyped.mockRejectedValueOnce(mockError);

		await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Subscription not found');
	});

	it('deve processar sem itens de entrada', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {};
			return defaultValue;
		});

		mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [{ transaction: 'HP123' }] });

		const result = await execute.call(mockThis, []);

		expect(mockHotmartApiRequestTyped).toHaveBeenCalled();
		expect(result[0]).toHaveLength(1);
	});

	it('deve buscar todas as transações com paginação manual', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return true;
			if (param === 'filters') return {
				transaction_date: '2024-01-01T00:00:00.000Z',
				end_transaction_date: '2024-12-31T00:00:00.000Z',
				offer_code: 'OFFER123',
				purchase_payment_type: 'CREDIT_CARD',
				subscriber_code: 'SUB123',
			};
			return defaultValue;
		});

		// Primeira página com next_page_token
		mockHotmartApiRequestTyped.mockResolvedValueOnce({
			items: [
				{ transaction: 'HP1', value: 100 },
				{ transaction: 'HP2', value: 200 },
			],
			page_info: {
				next_page_token: 'next-page-123',
				total_results: 4,
			},
		});

		// Segunda página sem next_page_token
		mockHotmartApiRequestTyped.mockResolvedValueOnce({
			items: [
				{ transaction: 'HP3', value: 300 },
				{ transaction: 'HP4', value: 400 },
			],
			page_info: {
				total_results: 4,
			},
		});

		const result = await execute.call(mockThis, [{ json: {} }]);

		// Verificar que foram feitas 2 chamadas
		expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(2);
		
		// Verificar que a primeira chamada tem os parâmetros corretos
		const firstCall = mockHotmartApiRequestTyped.mock.calls[0];
		expect(firstCall[1]).toBe('GET');
		expect(firstCall[2]).toBe('/payments/api/v1/subscriptions/transactions');
		expect(firstCall[4]).toMatchObject({
			max_results: 500,
			transaction_date: 1704067200000,
			end_transaction_date: 1735603200000,
			offer_code: 'OFFER123',
			purchase_payment_type: 'CREDIT_CARD',
			subscriber_code: 'SUB123',
		});
		
		// Verificar que a segunda chamada tem page_token
		const secondCall = mockHotmartApiRequestTyped.mock.calls[1];
		expect(secondCall[4]).toHaveProperty('page_token');

		expect(result[0]).toHaveLength(4);
		expect(mockThis.logger.debug).toHaveBeenCalled();
	});

	it('deve lidar com resposta sem page_info em paginação', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return true;
			if (param === 'filters') return {};
			return defaultValue;
		});

		// Resposta sem page_info
		mockHotmartApiRequestTyped.mockResolvedValueOnce({
			items: [{ transaction: 'HP1', value: 100 }],
		});

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
		expect(result[0]).toHaveLength(1);
	});

	it('deve continuar em caso de erro quando continueOnFail está ativo', async () => {
		mockThis.continueOnFail = jest.fn().mockReturnValue(true);
		
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {};
			return defaultValue;
		});

		const mockError = new Error('API Error');
		mockHotmartApiRequestTyped.mockRejectedValueOnce(mockError);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0][0]).toEqual({
			json: { error: 'API Error' },
			pairedItem: { item: 0 },
		});
	});

	it('deve filtrar valores vazios nos filtros', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {
				purchase_status: '',
				offer_code: undefined,
				purchase_payment_type: 'CREDIT_CARD',
			};
			return defaultValue;
		});

		mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
			mockThis,
			'GET',
			'/payments/api/v1/subscriptions/transactions',
			{},
			{
				max_results: 50,
				purchase_payment_type: 'CREDIT_CARD',
			}
		);
	});

	it('deve lidar com resposta sem items', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'returnAll') return false;
			if (param === 'limit') return 50;
			if (param === 'filters') return {};
			return defaultValue;
		});

		// Resposta sem o campo items
		mockHotmartApiRequestTyped.mockResolvedValueOnce({});

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0]).toEqual([]);
	});
});