import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import type { IWebhookFunctions, INodeExecutionData } from 'n8n-workflow';

describe('HotmartTrigger - Validação de Roteamento (Produção)', () => {
  let node: HotmartTrigger;
  let mockWebhookFunctions: jest.Mocked<IWebhookFunctions>;

  beforeEach(() => {
    node = new HotmartTrigger();
    
    // Mock completo das funções do webhook
    mockWebhookFunctions = {
      getBodyData: jest.fn(),
      getHeaderData: jest.fn().mockReturnValue({}),
      getNodeParameter: jest.fn(),
      getWorkflowStaticData: jest.fn().mockReturnValue({}),
      getResponseObject: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      }),
      helpers: {
        returnJsonArray: jest.fn((data) => [{ json: data }]),
      },
      logger: {
        debug: jest.fn(),
      },
    } as any;
  });

  describe('Validação de Roteamento Smart Mode', () => {
    beforeEach(() => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'triggerMode') return 'smart';
        if (param === 'options') return {};
        return undefined;
      });
    });

    test('PURCHASE_APPROVED deve ir para saída 0', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { purchase: { status: 'approved' } },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      // Verificar que apenas a saída 0 tem dados
      expect(workflowData[0]).toHaveLength(1);
      expect(workflowData[1]).toHaveLength(0);
      expect(workflowData[10]).toHaveLength(0); // SUBSCRIPTION_CANCELLATION
    });

    test('SUBSCRIPTION_CANCELLATION deve ir para saída 10', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'SUBSCRIPTION_CANCELLATION',
        data: { subscription: { status: 'CANCELLED' } },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      // Verificar que apenas a saída 10 tem dados
      expect(workflowData[0]).toHaveLength(0); // PURCHASE_APPROVED
      expect(workflowData[10]).toHaveLength(1); // SUBSCRIPTION_CANCELLATION
    });

    test('PURCHASE_OUT_OF_SHOPPING_CART deve ir para saída 9', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_OUT_OF_SHOPPING_CART',
        data: { purchase: { status: 'abandoned' } },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      expect(workflowData[9]).toHaveLength(1); // Saída 9
      expect(workflowData[0]).toHaveLength(0); 
    });
  });

  describe('Validação de Roteamento Super-Smart Mode', () => {
    beforeEach(() => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'triggerMode') return 'super-smart';
        if (param === 'options') return {};
        return undefined;
      });
    });

    test('PURCHASE_APPROVED compra única deve ir para saída 0', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { 
          purchase: { 
            status: 'approved',
            recurrence_number: 0 
          } 
        },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      expect(workflowData[0]).toHaveLength(1); // Compra única
      expect(workflowData[1]).toHaveLength(0); // Nova assinatura
      expect(workflowData[2]).toHaveLength(0); // Renovação
    });

    test('PURCHASE_APPROVED nova assinatura deve ir para saída 1', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { 
          purchase: { 
            status: 'approved',
            recurrence_number: 1,
            is_subscription: true
          } 
        },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      expect(workflowData[0]).toHaveLength(0); // Compra única
      expect(workflowData[1]).toHaveLength(1); // Nova assinatura
      expect(workflowData[2]).toHaveLength(0); // Renovação
    });

    test('PURCHASE_APPROVED renovação deve ir para saída 2', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { 
          purchase: { 
            status: 'approved',
            recurrence_number: 5,
            is_subscription: true
          } 
        },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      expect(workflowData[0]).toHaveLength(0); // Compra única
      expect(workflowData[1]).toHaveLength(0); // Nova assinatura
      expect(workflowData[2]).toHaveLength(1); // Renovação
    });

    test('PURCHASE_BILLET_PRINTED PIX deve ir para saída 8', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_BILLET_PRINTED',
        data: { 
          purchase: { 
            payment: { type: 'PIX' }
          } 
        },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      expect(workflowData[7]).toHaveLength(0); // Boleto
      expect(workflowData[8]).toHaveLength(1); // PIX
    });

    test('SUBSCRIPTION_CANCELLATION deve ir para saída 13', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'SUBSCRIPTION_CANCELLATION',
        data: { subscription: { status: 'CANCELLED' } },
        version: '2.0.0',
      });

      const result = await node.webhook.call(mockWebhookFunctions);
      const workflowData = result.workflowData as INodeExecutionData[][];
      
      expect(workflowData[13]).toHaveLength(1); // SUBSCRIPTION_CANCELLATION no super-smart
      expect(workflowData[10]).toHaveLength(0); // Posição do smart mode
    });
  });

  describe('Tabela completa de roteamento', () => {
    test('Validar TODOS os eventos no Smart Mode', async () => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'triggerMode') return 'smart';
        return {};
      });

      const routingTable = [
        { event: 'PURCHASE_APPROVED', expectedOutput: 0 },
        { event: 'PURCHASE_COMPLETE', expectedOutput: 1 },
        { event: 'PURCHASE_CANCELED', expectedOutput: 2 },
        { event: 'PURCHASE_REFUNDED', expectedOutput: 3 },
        { event: 'PURCHASE_CHARGEBACK', expectedOutput: 4 },
        { event: 'PURCHASE_BILLET_PRINTED', expectedOutput: 5 },
        { event: 'PURCHASE_PROTEST', expectedOutput: 6 },
        { event: 'PURCHASE_EXPIRED', expectedOutput: 7 },
        { event: 'PURCHASE_DELAYED', expectedOutput: 8 },
        { event: 'PURCHASE_OUT_OF_SHOPPING_CART', expectedOutput: 9 },
        { event: 'SUBSCRIPTION_CANCELLATION', expectedOutput: 10 },
        { event: 'SWITCH_PLAN', expectedOutput: 11 },
        { event: 'UPDATE_SUBSCRIPTION_CHARGE_DATE', expectedOutput: 12 },
        { event: 'CLUB_FIRST_ACCESS', expectedOutput: 13 },
        { event: 'CLUB_MODULE_COMPLETED', expectedOutput: 14 },
      ];

      for (const { event, expectedOutput } of routingTable) {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event,
          data: {},
          version: '2.0.0',
        });

        const result = await node.webhook.call(mockWebhookFunctions);
        const workflowData = result.workflowData as INodeExecutionData[][];
        
        // Verificar que apenas a saída esperada tem dados
        expect(workflowData[expectedOutput]).toHaveLength(1);
        
        // Verificar que o evento foi processado corretamente
        const processedData = workflowData[expectedOutput][0].json;
        expect(processedData.eventType).toBe(event);
      }
    });
  });
});