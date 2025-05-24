import { execute } from '../../../../nodes/Hotmart/v1/actions/sales/solicitarReembolso.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';
import * as salesRefund from '../../../fixtures/responses/sales-refund.json';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Sales - solicitarReembolso', () => {
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

	it('deve solicitar reembolso com confirmação', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'transaction') return 'HP123456789';
			if (param === 'confirmRefund') return true;
			return undefined;
		});

		mockHotmartApiRequest.mockResolvedValueOnce(salesRefund.response.success_example);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(mockHotmartApiRequest).toHaveBeenCalledWith(
			'PUT',
			'/payments/api/v1/sales/HP123456789/refund'
		);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json.transaction).toBe('HP12345678901234567893');
		expect(result[0][0].json).toHaveProperty('buyer');
		expect(result[0][0].json).toHaveProperty('product');
		expect(result[0][0].json).toHaveProperty('refund');
	});

	it('deve falhar sem confirmação', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'transaction') return 'HP123456789';
			if (param === 'confirmRefund') return false;
			return undefined;
		});

		await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow(
			'Por segurança, você deve marcar a confirmação antes de processar o reembolso'
		);
	});

	it('deve lidar com erro da API', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'transaction') return 'HP123456789';
			if (param === 'confirmRefund') return true;
			return undefined;
		});

		const mockError = new Error('Transaction not found');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Transaction not found');
	});

	it('deve continuar em caso de erro com continueOnFail', async () => {
		mockThis.continueOnFail = jest.fn().mockReturnValue(true);
		
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'transaction') return 'HP_INVALID';
			if (param === 'confirmRefund') return true;
			return undefined;
		});

		const mockError = new Error('Invalid transaction');
		mockHotmartApiRequest.mockRejectedValueOnce(mockError);

		const result = await execute.call(mockThis, [{ json: {} }]);

		expect(result[0]).toHaveLength(1);
		expect(result[0][0].json.error).toBe('Invalid transaction');
	});

	it('deve processar sem itens de entrada', async () => {
		(mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
			if (param === 'transaction') return 'HP123456789';
			if (param === 'confirmRefund') return true;
			return undefined;
		});

		mockHotmartApiRequest.mockResolvedValueOnce(salesRefund.response.success_example);

		const result = await execute.call(mockThis, []);

		expect(mockHotmartApiRequest).toHaveBeenCalled();
		expect(result[0]).toHaveLength(1);
	});
});