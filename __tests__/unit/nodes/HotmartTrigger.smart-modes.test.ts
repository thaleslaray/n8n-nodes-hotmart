import { IWebhookFunctions } from 'n8n-workflow';
import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { EVENT_CONFIG } from '../../../nodes/Hotmart/trigger/constants/events';

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
        if (param === 'mode') return 'smart';
        if (param === 'options') return {};
        return undefined;
      });
    });

    it('deve rotear PURCHASE_APPROVED para saída correta', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({});
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(Array.isArray(result.workflowData)).toBe(true);
      
      // Verifica que o evento foi roteado para a saída correta
      const eventConfig = EVENT_CONFIG.PURCHASE_APPROVED;
      expect(result.workflowData![eventConfig.smartIndex]).toHaveLength(1);
      expect(result.workflowData![eventConfig.smartIndex][0].json).toEqual(bodyData);
    });

    it('deve rotear múltiplos eventos diferentes para suas respectivas saídas', async () => {
      const events = [
        { event: 'PURCHASE_COMPLETE', expectedIndex: EVENT_CONFIG.PURCHASE_COMPLETE.smartIndex },
        { event: 'PURCHASE_CANCELED', expectedIndex: EVENT_CONFIG.PURCHASE_CANCELED.smartIndex },
        { event: 'SUBSCRIPTION_CANCELLATION', expectedIndex: EVENT_CONFIG.SUBSCRIPTION_CANCELLATION.smartIndex },
      ];

      for (const testCase of events) {
        const bodyData = {
          event: testCase.event,
          data: { test: true }
        };
        
        mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
        
        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
        
        expect(result.workflowData![testCase.expectedIndex]).toHaveLength(1);
        expect(result.workflowData![testCase.expectedIndex][0].json.event).toBe(testCase.event);
      }
    });

    it('deve criar saídas vazias para eventos não recebidos', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      const totalOutputs = Object.keys(EVENT_CONFIG).length;
      
      expect(result.workflowData).toHaveLength(totalOutputs);
      
      // Verifica que apenas a saída do evento recebido tem dados
      for (let i = 0; i < totalOutputs; i++) {
        if (i === EVENT_CONFIG.PURCHASE_APPROVED.smartIndex) {
          expect(result.workflowData![i]).toHaveLength(1);
        } else {
          expect(result.workflowData![i]).toHaveLength(0);
        }
      }
    });
  });

  describe('Super Smart Mode', () => {
    beforeEach(() => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'mode') return 'superSmart';
        if (param === 'options') return {};
        return undefined;
      });
    });

    it('deve rotear compra única para saída 0', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: { id: '123', installments_number: 1 },
          // Sem dados de assinatura = compra única
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toHaveLength(4); // 4 saídas no super smart
      expect(result.workflowData![0]).toHaveLength(1); // Compra única
      expect(result.workflowData![1]).toHaveLength(0); // Nova assinatura
      expect(result.workflowData![2]).toHaveLength(0); // Renovação
      expect(result.workflowData![3]).toHaveLength(0); // Outros
    });

    it('deve rotear nova assinatura para saída 1', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: { 
            id: '123',
            recurrence_number: 1,
            approved_date: '2023-01-01'
          },
          subscription: {
            status: 'ACTIVE',
            subscriber: {
              creation_date: '2023-01-01'
            }
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData![0]).toHaveLength(0); // Compra única
      expect(result.workflowData![1]).toHaveLength(1); // Nova assinatura
      expect(result.workflowData![2]).toHaveLength(0); // Renovação
      expect(result.workflowData![3]).toHaveLength(0); // Outros
    });

    it('deve rotear renovação de assinatura para saída 2', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: { 
            id: '123',
            recurrence_number: 5, // Não é a primeira
            approved_date: '2023-05-01'
          },
          subscription: {
            status: 'ACTIVE',
            subscriber: {
              creation_date: '2023-01-01' // Criada antes
            }
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData![0]).toHaveLength(0); // Compra única
      expect(result.workflowData![1]).toHaveLength(0); // Nova assinatura
      expect(result.workflowData![2]).toHaveLength(1); // Renovação
      expect(result.workflowData![3]).toHaveLength(0); // Outros
    });

    it('deve rotear outros eventos para saída 3', async () => {
      const bodyData = {
        event: 'PURCHASE_CANCELED',
        data: {
          purchase: { id: '123' }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData![0]).toHaveLength(0); // Compra única
      expect(result.workflowData![1]).toHaveLength(0); // Nova assinatura
      expect(result.workflowData![2]).toHaveLength(0); // Renovação
      expect(result.workflowData![3]).toHaveLength(1); // Outros
    });

    it('deve tratar PURCHASE_BILLET_PRINTED corretamente', async () => {
      const bodyData = {
        event: 'PURCHASE_BILLET_PRINTED',
        data: {
          purchase: { 
            id: '123',
            payment: {
              type: 'BILLET'
            }
          }
        }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      // PURCHASE_BILLET_PRINTED vai para "outros"
      expect(result.workflowData![3]).toHaveLength(1);
    });
  });

  describe('Standard Mode', () => {
    beforeEach(() => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'mode') return 'standard';
        if (param === 'event') return 'all';
        if (param === 'options') return {};
        return undefined;
      });
    });

    it('deve processar todos os eventos quando configurado como "all"', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue({ 'x-hotmart-hottok': 'test' });
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData).toHaveLength(1); // Standard mode tem apenas 1 saída
      expect(result.workflowData![0]).toHaveLength(1);
      expect(result.workflowData![0][0].json.event).toBe('PURCHASE_APPROVED');
    });

    it('deve filtrar eventos não selecionados', async () => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'mode') return 'standard';
        if (param === 'event') return 'PURCHASE_COMPLETE'; // Só aceita PURCHASE_COMPLETE
        if (param === 'options') return {};
        return undefined;
      });

      const bodyData = {
        event: 'PURCHASE_APPROVED', // Evento diferente do selecionado
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      // Deve retornar uma resposta de webhook mas não dados do workflow
      expect(result.webhookResponse).toBeDefined();
      expect(result.webhookResponse?.statusCode).toBe(200);
    });

    it('deve enriquecer dados do evento com metadata', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } }
      };
      
      const headers = { 'x-hotmart-hottok': 'test-token' };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      mockWebhookFunctions.getHeaderData.mockReturnValue(headers);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      const enrichedData = result.workflowData![0][0].json;
      
      expect(enrichedData).toHaveProperty('eventName', 'Compra Aprovada');
      expect(enrichedData).toHaveProperty('eventType', 'PURCHASE_APPROVED');
      expect(enrichedData).toHaveProperty('eventCategory', 'purchase');
      expect(enrichedData).toHaveProperty('receivedAt');
      expect(enrichedData).toHaveProperty('metadata');
      expect(enrichedData.metadata).toHaveProperty('hottok', 'test-token');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar erro 400 para body vazio', async () => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'mode') return 'standard';
        if (param === 'options') return {};
        return undefined;
      });
      mockWebhookFunctions.getBodyData.mockReturnValue(null as any);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      expect(result.webhookResponse).toBeDefined();
      expect(result.webhookResponse?.statusCode).toBe(400);
      expect(result.webhookResponse?.body).toContain('Invalid webhook body');
    });

    it('deve ignorar eventos de teste quando configurado', async () => {
      mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
        if (param === 'mode') return 'standard';
        if (param === 'event') return 'all';
        if (param === 'options') return { ignoreTestEvents: true };
        return undefined;
      });

      const bodyData = {
        event: 'PURCHASE_APPROVED',
        test_mode: true, // Evento de teste
        data: { purchase: { id: '123' } }
      };
      
      mockWebhookFunctions.getBodyData.mockReturnValue(bodyData);
      
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions);
      
      // Deve retornar workflow vazio
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(0);
    });
  });
});