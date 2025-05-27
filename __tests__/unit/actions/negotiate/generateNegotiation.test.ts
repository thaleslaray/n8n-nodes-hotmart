import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import type { INodeExecutionData } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request', () => ({
  hotmartApiRequest: jest.fn(),
}));

import { execute } from '../../../../nodes/Hotmart/v1/actions/negotiate/generateNegotiation.operation';
import { hotmartApiRequest } from '../../../../nodes/Hotmart/v1/transport/request';

const mockHotmartApiRequest = hotmartApiRequest as jest.MockedFunction<typeof hotmartApiRequest>;

describe('Negotiate - generateNegotiation', () => {
  let mockThis: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.helpers.constructExecutionMetaData = jest.fn((data) => data) as any;
    mockThis.helpers.returnJsonArray = jest.fn((data: any[]) => data.map((item: any) => ({ json: item })));
    mockThis.getNodeParameter = jest.fn();
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
  });

  describe('Basic functionality', () => {
    it('should generate negotiation link with required parameters', async () => {
      const mockResponse = {
        id: 'neg_123',
        payment_link: 'https://pay.hotmart.com/neg_123',
        expires_at: '2024-02-01T00:00:00Z',
      };

      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123') // subscriptionId
        .mockReturnValueOnce('1,2,3') // recurrences
        .mockReturnValueOnce('CREDIT_CARD') // paymentType
        .mockReturnValueOnce({}); // additionalOptions

      mockHotmartApiRequest.mockResolvedValue(mockResponse);

      const items: INodeExecutionData[] = [{ json: {} }];
      const result = await execute.call(mockThis, items);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        {
          subscription_id: 'sub_123',
          recurrences: [1, 2, 3],
          payment_type: 'CREDIT_CARD',
        }
      );

      expect(result).toEqual([[{ json: mockResponse }]]);
    });

    it('should handle empty items array', async () => {
      const mockResponse = { id: 'neg_123' };

      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      mockHotmartApiRequest.mockResolvedValue(mockResponse);

      const items: INodeExecutionData[] = [];
      const result = await execute.call(mockThis, items);

      expect(result).toEqual([[{ json: mockResponse }]]);
    });
  });

  describe('Recurrences validation', () => {
    it('should parse recurrences string correctly', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1, 2, 3, 4, 5') // with spaces
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        expect.objectContaining({
          recurrences: [1, 2, 3, 4, 5],
        })
      );
    });

    it('should throw error if no valid recurrences provided', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('invalid') // invalid recurrences
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      await expect(
        execute.call(mockThis, [{ json: {} }])
      ).rejects.toThrow('Pelo menos uma parcela válida deve ser fornecida');
    });

    it('should throw error if more than 5 recurrences', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1,2,3,4,5,6') // 6 recurrences
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      await expect(
        execute.call(mockThis, [{ json: {} }])
      ).rejects.toThrow('Máximo de 5 parcelas por negociação.');
    });

    it('should throw error if recurrence number is not positive', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('0,1,2') // 0 is invalid
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      await expect(
        execute.call(mockThis, [{ json: {} }])
      ).rejects.toThrow('Os números das parcelas devem ser positivos');
    });
  });

  describe('Payment types', () => {
    it('should require document for BILLET payment', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('BILLET')
        .mockReturnValueOnce({}); // no document

      await expect(
        execute.call(mockThis, [{ json: {} }])
      ).rejects.toThrow('CPF/CNPJ é obrigatório para pagamento via boleto');
    });

    it('should include document for BILLET payment', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('BILLET')
        .mockReturnValueOnce({ document: '123.456.789-00' });

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        expect.objectContaining({
          payment_type: 'BILLET',
          document: '12345678900', // formatted
        })
      );
    });

    it('should handle PIX payment type', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('PIX')
        .mockReturnValueOnce({ document: '12345678900' });

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        expect.objectContaining({
          payment_type: 'PIX',
          document: '12345678900',
        })
      );
    });
  });

  describe('Discount handling', () => {
    it('should include discount when provided', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({ discountValue: 10.5 });

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        expect.objectContaining({
          discount: {
            type: 'CUSTOM',
            value: 10.5,
          },
        })
      );
    });

    it('should not include discount when value is 0', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({ discountValue: 0 });

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        expect.not.objectContaining({
          discount: expect.anything(),
        })
      );
    });

    it('should not include discount when not provided', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/payments/api/v1/installments/negotiate',
        expect.not.objectContaining({
          discount: expect.anything(),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error when API fails', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      mockHotmartApiRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        execute.call(mockThis, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });

    it('should continue on fail when configured', async () => {
      mockThis.continueOnFail.mockReturnValue(true);
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('invalid')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      const result = await execute.call(mockThis, [{ json: {} }]);

      expect(result).toEqual([[
        {
          json: { error: 'Pelo menos uma parcela válida deve ser fornecida' },
          pairedItem: { item: 0 },
        },
      ]]);
    });
  });

  describe('Multiple items', () => {
    it('should process multiple items', async () => {
      const mockResponse1 = { id: 'neg_1' };
      const mockResponse2 = { id: 'neg_2' };

      mockThis.getNodeParameter
        // Item 1
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({})
        // Item 2
        .mockReturnValueOnce('sub_456')
        .mockReturnValueOnce('2,3')
        .mockReturnValueOnce('PIX')
        .mockReturnValueOnce({ document: '12345678900' });

      mockHotmartApiRequest
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const items: INodeExecutionData[] = [{ json: {} }, { json: {} }];
      const result = await execute.call(mockThis, items);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
      expect(result).toEqual([[
        { json: mockResponse1 },
        { json: mockResponse2 },
      ]]);
    });

    it('should handle mixed success and failure with continueOnFail', async () => {
      mockThis.continueOnFail.mockReturnValue(true);
      
      mockThis.getNodeParameter
        // Item 1 - success
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({})
        // Item 2 - failure
        .mockReturnValueOnce('sub_456')
        .mockReturnValueOnce('') // empty recurrences
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      mockHotmartApiRequest.mockResolvedValueOnce({ id: 'neg_1' });

      const items: INodeExecutionData[] = [{ json: {} }, { json: {} }];
      const result = await execute.call(mockThis, items);

      expect(result).toEqual([[
        { json: { id: 'neg_1' } },
        {
          json: { error: 'Pelo menos uma parcela válida deve ser fornecida' },
          pairedItem: { item: 1 },
        },
      ]]);
    });

    it('should handle undefined response', async () => {
      mockThis.getNodeParameter
        .mockReturnValueOnce('sub_123')
        .mockReturnValueOnce('1')
        .mockReturnValueOnce('CREDIT_CARD')
        .mockReturnValueOnce({});

      // Mock retorna undefined
      mockHotmartApiRequest.mockResolvedValueOnce(undefined);

      const result = await execute.call(mockThis, [{ json: {} }]);

      expect(result[0][0].json).toEqual({});
    });
  });
});