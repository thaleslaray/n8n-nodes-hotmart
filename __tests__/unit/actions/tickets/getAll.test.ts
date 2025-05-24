import { execute } from '../../../../nodes/Hotmart/v1/actions/tickets/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as requestTyped from '../../../../nodes/Hotmart/v1/transport/requestTyped';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped');

describe('Tickets - getAll', () => {
	let mockThis: IExecuteFunctions;
	let mockHotmartApiRequestTyped: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockThis = createMockExecuteFunctions();
		mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
		mockThis.continueOnFail = jest.fn().mockReturnValue(false);
		
		// Mock logger
		mockThis.logger = {
			debug: jest.fn(),
			error: jest.fn(),
			info: jest.fn(),
			warn: jest.fn(),
		};

		mockHotmartApiRequestTyped = requestTyped.hotmartApiRequestTyped as jest.Mock;
	});

	// Helper para gerar tickets mock
	const generateMockTickets = (count: number) => {
		const tickets = [];
		for (let i = 1; i <= count; i++) {
			tickets.push({
				id: `ticket_${i}`,
				participant_name: `Participante ${i}`,
				participant_email: `participante${i}@email.com`,
				ticket_status: 'SOLD',
				checkin_status: 'PENDING',
				ticket_qr_code: `TKT${i.toString().padStart(6, '0')}`
			});
		}
		return tickets;
	};

	describe('Operações Básicas', () => {
		it('should get tickets successfully', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_123') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				items: generateMockTickets(2),
				page_info: {
					results_per_page: 2,
					next_page_token: null,
					total_results: 2
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
				mockThis,
				'GET',
				'/events/api/v1/evt_123/participants',
				{},
				{ max_results: 10 }
			);

			expect(result[0]).toHaveLength(2);
			expect(result[0][0].json).toEqual(mockResponse.items[0]);
			expect(result[0][1].json).toEqual(mockResponse.items[1]);
		});

		it('should handle returnAll with pagination', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_456') // event_id
				.mockReturnValueOnce(true) // returnAll
				.mockReturnValueOnce({}); // filters

			const mockResponse1 = {
				items: generateMockTickets(50),
				page_info: { next_page_token: 'page2' }
			};

			const mockResponse2 = {
				items: generateMockTickets(30),
				page_info: { next_page_token: null }
			};

			mockHotmartApiRequestTyped
				.mockResolvedValueOnce(mockResponse1)
				.mockResolvedValueOnce(mockResponse2);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(2);
			expect(mockHotmartApiRequestTyped).toHaveBeenNthCalledWith(
				1,
				mockThis,
				'GET',
				'/events/api/v1/evt_456/participants',
				{},
				{ max_results: 50 }
			);
			expect(mockHotmartApiRequestTyped).toHaveBeenNthCalledWith(
				2,
				mockThis,
				'GET',
				'/events/api/v1/evt_456/participants',
				{},
				{ max_results: 50, page_token: 'page2' }
			);

			expect(result[0]).toHaveLength(80);
		});

		it('should handle filters with buyer_email and participant_email', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_789') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({
					buyer_email: 'buyer@example.com',
					participant_email: 'participant@example.com'
				}) // filters
				.mockReturnValueOnce(20); // limit

			const mockResponse = {
				items: generateMockTickets(1),
				page_info: {
					results_per_page: 1,
					next_page_token: null,
					total_results: 1
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
				mockThis,
				'GET',
				'/events/api/v1/evt_789/participants',
				{},
				{
					max_results: 20,
					buyer_email: 'buyer@example.com',
					participant_email: 'participant@example.com'
				}
			);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual(mockResponse.items[0]);
		});

		it('should handle filters with last_update and id_lot', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_123') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({
					last_update: 1640995200000,
					id_lot: 'lot_vip'
				}) // filters
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				items: generateMockTickets(1),
				page_info: {
					results_per_page: 1,
					next_page_token: null,
					total_results: 1
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
				mockThis,
				'GET',
				'/events/api/v1/evt_123/participants',
				{},
				{
					max_results: 10,
					last_update: 1640995200000,
					id_lot: 'lot_vip'
				}
			);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual(mockResponse.items[0]);
		});

		it('should handle filters with id_eticket and ticket_qr_code', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_456') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({
					id_eticket: '000123',
					ticket_qr_code: 'TKT-ABC123'
				}) // filters
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				items: generateMockTickets(1),
				page_info: {
					results_per_page: 1,
					next_page_token: null,
					total_results: 1
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
				mockThis,
				'GET',
				'/events/api/v1/evt_456/participants',
				{},
				{
					max_results: 10,
					id_eticket: '000123',
					ticket_qr_code: 'TKT-ABC123'
				}
			);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual(mockResponse.items[0]);
		});

		it('should handle all filters together', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_full') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({
					buyer_email: 'buyer@example.com',
					participant_email: 'participant@example.com',
					last_update: 1640995200000,
					id_lot: 'lot_gold',
					ticket_status: 'SOLD',
					ticket_type: 'PAID',
					checkin_status: 'PENDING',
					id_eticket: '999999',
					ticket_qr_code: 'QR-FULL-TEST'
				}) // filters
				.mockReturnValueOnce(5); // limit

			const mockResponse = {
				items: generateMockTickets(1),
				page_info: {
					results_per_page: 1,
					next_page_token: null,
					total_results: 1
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
				mockThis,
				'GET',
				'/events/api/v1/evt_full/participants',
				{},
				{
					max_results: 5,
					buyer_email: 'buyer@example.com',
					participant_email: 'participant@example.com',
					last_update: 1640995200000,
					id_lot: 'lot_gold',
					ticket_status: 'SOLD',
					ticket_type: 'PAID',
					checkin_status: 'PENDING',
					id_eticket: '999999',
					ticket_qr_code: 'QR-FULL-TEST'
				}
			);

			expect(result[0]).toHaveLength(1);
				expect(result[0][0].json).toEqual(mockResponse.items[0]);
		});

		it('should handle response without page_info', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_no_page') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				items: generateMockTickets(2)
				// No page_info
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(result).toEqual([mockResponse.items]);
		});

		it('should handle response without items', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_no_items') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				// No items field
				page_info: {
					results_per_page: 0,
					next_page_token: null,
					total_results: 0
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(result).toEqual([[]]);
		});

		it('should handle pagination without page_info in returnAll mode', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_pagination_edge') // event_id
				.mockReturnValueOnce(true) // returnAll
				.mockReturnValueOnce({}); // filters

			const mockResponse = {
				items: generateMockTickets(10)
				// No page_info - should stop pagination
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
			expect(result[0]).toHaveLength(10);
		});

		it('should handle empty items array', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_empty') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(50); // limit

			const mockResponse = {
				items: [],
				page_info: {
					results_per_page: 0,
					next_page_token: null,
					total_results: 0
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(result).toEqual([[]]);
		});

		it('should handle limit and outputType options', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_output') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(50); // limit

			const mockResponse = {
				items: generateMockTickets(50).map(ticket => ({
					...ticket,
					// Campos extras que são removidos no modo summarized
					extra_field_1: 'value1',
					extra_field_2: 'value2',
					users: [
						{
							id: '123',
							name: 'User',
							email: 'user@example.com',
							phone_number: '+5511999999999',
							status: 'CHECKED_IN'
						}
					]
				})),
				page_info: {
					results_per_page: 50,
					next_page_token: null,
					total_results: 50
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
				mockThis,
				'GET',
				'/events/api/v1/evt_output/participants',
				{},
				{ max_results: 50 }
			);

			expect(result[0]).toHaveLength(50);
			// Em modo summarized, os campos extras devem estar presentes
			expect(result[0][0].json).toHaveProperty('extra_field_1');
			expect(result[0][0].json).toHaveProperty('users');
		});
	});

	describe('Error Handling', () => {
		it('should handle API errors', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_error') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const mockError = new Error('Event not found');
			mockHotmartApiRequestTyped.mockRejectedValue(mockError);

			await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Event not found');
		});

		it('should continue on fail when enabled', async () => {
			mockThis.continueOnFail = jest.fn().mockReturnValue(true);

			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_fail') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const mockError = new Error('Access denied');
			mockHotmartApiRequestTyped.mockRejectedValue(mockError);

			const result = await execute.call(mockThis, [{ json: {} }]);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0]).toEqual({
				json: { error: 'Access denied' },
				pairedItem: { item: 0 }
			});
		});
	});

	describe('Empty Input Handling', () => {
		it('should handle empty input items', async () => {
			mockThis.getNodeParameter = jest.fn()
				.mockReturnValueOnce('evt_no_input') // event_id
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce({}) // filters
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				items: generateMockTickets(1),
				page_info: {
					results_per_page: 1,
					next_page_token: null,
					total_results: 1
				}
			};

			mockHotmartApiRequestTyped.mockResolvedValue(mockResponse);

			// Call with empty array
			const result = await execute.call(mockThis, []);

			expect(mockHotmartApiRequestTyped).toHaveBeenCalled();
			expect(result).toEqual([mockResponse.items]);
		});
	});
});