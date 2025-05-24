import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/getSummary.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import * as pagination from '../../../../nodes/Hotmart/v1/helpers/pagination';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');
jest.mock('../../../../nodes/Hotmart/v1/helpers/pagination');

describe('Subscription - getSummary', () => {
	let mockThis: IExecuteFunctions;
	let mockHotmartApiRequest: jest.Mock;
	let mockGetAllItems: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockThis = createMockExecuteFunctions();
		mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
		mockThis.continueOnFail = jest.fn().mockReturnValue(false);
		mockThis.helpers.constructExecutionMetaData = jest.fn().mockImplementation((items) => items);
		mockThis.helpers.returnJsonArray = jest.fn().mockImplementation((data) => data.map((item: any) => ({ json: item })));

		mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
		mockGetAllItems = pagination.getAllItems as jest.Mock;
	});

	it('deve buscar resumo de assinaturas com sucesso', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'filters') return {
				productId: 'PROD123',
				status: 'ACTIVE',
			};
			return defaultValue;
		});

		const mockResponse = {
			total_subscriptions: 1250,
			active_subscriptions: 980,
			cancelled_subscriptions: 200,
			expired_subscriptions: 70,
			total_revenue: 125000.00,
			monthly_recurring_revenue: 98000.00,
			churn_rate: 3.5,
			average_subscription_value: 100.00,
		};

		mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'GET',
			'/payments/api/v1/subscriptions/summary',
			{},
			{
				product_id: 'PROD123',
				status: 'ACTIVE',
			}
		);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json).toEqual(mockResponse);
	});

	it('deve buscar resumo sem filtros', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'filters') return {};
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({
			total_subscriptions: 500,
			active_subscriptions: 400,
		});

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'GET',
			'/payments/api/v1/subscriptions/summary',
			{},
			{}
		);
	});

	it('deve filtrar por período', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'filters') return {
				startDate: '2024-01-01',
				endDate: '2024-12-31',
			};
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({});

		await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'GET',
			'/payments/api/v1/subscriptions/summary',
			{},
			{
				start_date: 1704067200000,
				end_date: 1735603200000,
			}
		);
	});

	it('deve lidar com erro da API', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'filters') return {};
			return undefined;
		});

		const mockError = new Error('API Error');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('API Error');
	});

	it('deve processar sem itens de entrada', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'filters') return {};
			return undefined;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({ total_subscriptions: 100 });

		const result = await execute.call(mockThis, []);

		expect(mockHotmartApiRequest).toHaveBeenCalled();
		expect(result[0]).toHaveLength(1);
	});

	it('deve buscar todos os itens com paginação', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			const params: any = {
				filters: {
					productId: 'PROD123',
					subscriberCode: 'SUB123',
					accessionDate: '2024-01-01',
					endAccessionDate: '2024-12-31',
					dateNextCharge: '2024-02-01',
				},
				returnAll: true,
				maxResults: 100,
			};
			return params[param] ?? defaultValue;
		});

		const mockItems = [
			{ id: 1, status: 'ACTIVE' },
			{ id: 2, status: 'ACTIVE' },
		];

		mockGetAllItems.mockResolvedValueOnce(mockItems);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockGetAllItems).toHaveBeenCalledWith({
			maxResults: 100,
			resource: 'subscription',
			operation: 'getSummary',
			query: {
				product_id: 123,
				subscriber_code: 'SUB123',
				accession_date: 1704067200000,
				end_accession_date: 1735603200000,
				date_next_charge: 1706745600000,
			},
		});

		expect(result[0]).toHaveLength(2);
	});

	it('deve lidar com datas inválidas nos filtros', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'filters') return {
				accessionDate: 'invalid-date',
				endAccessionDate: 'also-invalid',
				dateNextCharge: 'not-a-date',
			};
			return defaultValue;
		});

		mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

		await execute.call(mockThis, [{ json: {} }]);

		// Datas inválidas devem ser ignoradas
		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'GET',
			'/payments/api/v1/subscriptions/summary',
			{},
			{}
		);
	});

	it('deve continuar em caso de erro quando continueOnFail está ativo', async () => {
		mockThis.continueOnFail = jest.fn().mockReturnValue(true);
		
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'filters') return {};
			return undefined;
		});

		const mockError = new Error('API Error');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0][0]).toEqual({
			json: { error: 'API Error' },
			pairedItem: { item: 0 },
		});
	});

	it('deve processar resposta sem items', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
			if (param === 'filters') return {};
			return defaultValue;
		});

		// Resposta sem o campo items
		mockHotmartApiRequest.mockResolvedValueOnce({});

		const result = await execute.call(mockThis, [{ json: {} }]);

		// Deve retornar array vazio quando não há items
		expect(result[0]).toEqual([]);
	});
});