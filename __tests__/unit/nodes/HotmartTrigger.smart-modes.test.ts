import { IWebhookFunctions } from 'n8n-workflow';
import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';

describe('HotmartTrigger - Smart Modes', () => {
  let hotmartTrigger: HotmartTrigger;
  let mockWebhookFunctions: jest.Mocked<IWebhookFunctions>;

  beforeEach(() => {
    hotmartTrigger = new HotmartTrigger();
    
    // Mock webhook functions
    mockWebhookFunctions = {
      getBodyData: jest.fn(),
      getHeaderData: jest.fn(),
      getWorkflowStaticData: jest.fn().mockReturnValue({}),
      getNodeParameter: jest.fn(),
      getResponseObject: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnValue({
          send: jest.fn(),
        }),
      }),
      helpers: {
        returnJsonArray: jest.fn((data) => [{ json: data }]),
      },
      logger: {
        debug: jest.fn(),
      },
    } as any;
  });

  describe('Smart Mode', () => {
    beforeEach(() => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'triggerMode') return 'smart';
        return undefined;
      });
    });

    it('deve rotear PURCHASE_APPROVED para saída 0', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(1);
      expect(result.workflowData![0][0].json.eventName).toBe('Compra Aprovada');
      expect(result.workflowData![0][0].json.eventCategory).toBe('purchase');
    });

    it('deve rotear PURCHASE_OUT_OF_SHOPPING_CART para saída 9', async () => {
      const bodyData = {
        event: 'PURCHASE_OUT_OF_SHOPPING_CART',
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![9]).toHaveLength(1);
      expect(result.workflowData![9][0].json.eventName).toBe('Abandono de Carrinho');
    });

    it('deve rejeitar evento inválido', async () => {
      const bodyData = {
        event: 'EVENTO_INVALIDO',
        data: {}
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.noWebhookResponse).toBe(true);
      expect(mockWebhookFunctions.getResponseObject().status).toHaveBeenCalledWith(400);
    });
  });

  describe('Super Smart Mode', () => {
    beforeEach(() => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'triggerMode') return 'super-smart';
        return undefined;
      });
    });

    it('deve separar PURCHASE_APPROVED em compra única (saída 0)', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            id: '123',
            is_subscription: false,
            recurrence_number: 0
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(1);
      expect(result.workflowData![0][0].json.isSubscription).toBe(false);
      expect(result.workflowData![0][0].json.eventName).toBe('Compra Aprovada');
    });

    it('deve separar PURCHASE_APPROVED em nova assinatura (saída 1)', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            id: '123',
            is_subscription: true,
            recurrence_number: 1
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![1]).toHaveLength(1);
      expect(result.workflowData![1][0].json.isSubscription).toBe(true);
      expect(result.workflowData![1][0].json.isRenewal).toBe(false);
    });

    it('deve separar PURCHASE_APPROVED em renovação (saída 2)', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            id: '123',
            is_subscription: true,
            recurrence_number: 3
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![2]).toHaveLength(1);
      expect(result.workflowData![2][0].json.isSubscription).toBe(true);
      expect(result.workflowData![2][0].json.isRenewal).toBe(true);
      expect(result.workflowData![2][0].json.recurrenceNumber).toBe(3);
    });

    it('deve separar PIX de Boleto para PURCHASE_BILLET_PRINTED', async () => {
      // Teste para PIX
      const pixData = {
        event: 'PURCHASE_BILLET_PRINTED',
        data: {
          purchase: {
            id: '123',
            payment: {
              type: 'PIX'
            }
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(pixData);
      
      const pixResult = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(pixResult.workflowData![8]).toHaveLength(1);
      expect(pixResult.workflowData![8][0].json.paymentMethod).toBe('PIX');
      expect(pixResult.workflowData![8][0].json.paymentInfo.isPix).toBe(true);
      
      // Teste para Boleto
      const billetData = {
        event: 'PURCHASE_BILLET_PRINTED',
        data: {
          purchase: {
            id: '456',
            payment: {
              type: 'BILLET'
            }
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(billetData);
      
      const billetResult = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(billetResult.workflowData![7]).toHaveLength(1);
      expect(billetResult.workflowData![7][0].json.paymentMethod).toBe('BILLET');
      expect(billetResult.workflowData![7][0].json.paymentInfo.isBillet).toBe(true);
    });

    it('deve rotear eventos de assinatura corretamente', async () => {
      const subscriptionCancelData = {
        event: 'SUBSCRIPTION_CANCELLATION',
        data: {
          subscription: {
            subscriber: {
              code: 'SUB123'
            }
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(subscriptionCancelData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData![13]).toHaveLength(1);
      expect(result.workflowData![13][0].json.eventName).toBe('Assinatura Cancelada');
      expect(result.workflowData![13][0].json.isSubscription).toBe(true);
    });
  });
});