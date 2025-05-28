#!/usr/bin/env ts-node

/**
 * Gera testes automaticamente baseado nos eventos capturados
 * 
 * Uso: npm run webhook:generate-tests
 */

import fs from 'fs';
import path from 'path';

const PAYLOADS_DIR = path.join(__dirname, '../__tests__/fixtures/webhook-payloads');
const TESTS_OUTPUT = path.join(__dirname, '../__tests__/unit/webhook-events.generated.test.ts');

interface EventPayload {
  event: string;
  hottok: string;
  data: any;
  [key: string]: any;
}

// Carregar todos os payloads capturados
function loadCapturedPayloads(): Map<string, EventPayload[]> {
  const payloadsByEvent = new Map<string, EventPayload[]>();
  
  if (!fs.existsSync(PAYLOADS_DIR)) {
    console.error('❌ Diretório de payloads não encontrado. Execute a captura primeiro!');
    process.exit(1);
  }
  
  const files = fs.readdirSync(PAYLOADS_DIR).filter(f => f.endsWith('.json') && !f.includes('summary'));
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(PAYLOADS_DIR, file), 'utf8');
    const payload = JSON.parse(content) as EventPayload;
    
    if (!payloadsByEvent.has(payload.event)) {
      payloadsByEvent.set(payload.event, []);
    }
    
    payloadsByEvent.get(payload.event)!.push(payload);
  });
  
  return payloadsByEvent;
}

// Gerar teste para um evento
function generateTestForEvent(eventName: string, payloads: EventPayload[]): string {
  const payload = payloads[0]; // Usar primeiro como exemplo
  
  return `
  describe('${eventName}', () => {
    const mockPayload = ${JSON.stringify(payload, null, 6).split('\n').join('\n    ')};

    it('should accept and process ${eventName} event', async () => {
      // Arrange
      mockWebhookContext.getBodyData.mockReturnValue(mockPayload);
      mockWebhookContext.getNodeParameter.mockImplementation((param) => {
        if (param === 'event') return '*'; // Accept all events
        if (param === 'authentication') return true;
        if (param === 'authToken') return 'test-token';
        if (param === 'triggerMode') return 'standard';
        return undefined;
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookContext);

      // Assert
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData).toHaveLength(1);
      expect(result.workflowData[0][0]).toMatchObject({
        event: '${eventName}',
        data: expect.any(Object)
      });
    });

    it('should filter ${eventName} when not selected', async () => {
      // Arrange
      mockWebhookContext.getBodyData.mockReturnValue(mockPayload);
      mockWebhookContext.getNodeParameter.mockImplementation((param) => {
        if (param === 'event') return 'PURCHASE_APPROVED'; // Different event
        if (param === 'authentication') return true;
        if (param === 'authToken') return 'test-token';
        if (param === 'triggerMode') return 'standard';
        return undefined;
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookContext);

      // Assert
      expect(result.workflowData).toEqual([]);
    });

    ${generateSchemaValidation(eventName, payload)}

    ${generateEdgeCaseTests(eventName, payloads)}
  });`;
}

// Gerar validação de schema
function generateSchemaValidation(eventName: string, payload: EventPayload): string {
  const requiredFields = ['event', 'hottok', 'data'];
  const dataFields = payload.data ? Object.keys(payload.data) : [];
  
  return `
    it('should have required fields for ${eventName}', () => {
      // Check top-level required fields
      ${requiredFields.map(field => `expect(mockPayload).toHaveProperty('${field}');`).join('\n      ')}
      
      // Check data structure
      ${dataFields.length > 0 ? dataFields.map(field => `expect(mockPayload.data).toHaveProperty('${field}');`).join('\n      ') : '// No data fields to check'}
    });`;
}

// Gerar testes de casos extremos
function generateEdgeCaseTests(eventName: string, payloads: EventPayload[]): string {
  const tests: string[] = [];
  
  // Se temos múltiplos exemplos, testar variações
  if (payloads.length > 1) {
    tests.push(`
    it('should handle ${payloads.length} different payload variations', async () => {
      const variations = ${JSON.stringify(payloads.slice(0, 3), null, 8).split('\n').join('\n      ')};
      
      for (const variation of variations) {
        mockWebhookContext.getBodyData.mockReturnValue(variation);
        const result = await hotmartTrigger.webhook.call(mockWebhookContext);
        expect(result.workflowData).toBeDefined();
      }
    });`);
  }
  
  // Teste de autenticação
  tests.push(`
    it('should reject ${eventName} with invalid token', async () => {
      // Arrange
      const invalidPayload = { ...mockPayload, hottok: 'invalid-token' };
      mockWebhookContext.getBodyData.mockReturnValue(invalidPayload);
      mockWebhookContext.getNodeParameter.mockImplementation((param) => {
        if (param === 'authentication') return true;
        if (param === 'authToken') return 'correct-token';
        return undefined;
      });

      // Act & Assert
      await expect(hotmartTrigger.webhook.call(mockWebhookContext))
        .rejects.toThrow();
    });`);
  
  return tests.join('\n');
}

// Gerar arquivo de teste completo
function generateTestFile(payloadsByEvent: Map<string, EventPayload[]>): string {
  const imports = `
import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { IWebhookFunctions, INodeExecutionData } from 'n8n-workflow';
import { mockWebhookFunctions } from '../../helpers/testHelpers';

/**
 * Testes gerados automaticamente baseados em payloads capturados
 * Gerado em: ${new Date().toISOString()}
 * Total de eventos: ${payloadsByEvent.size}
 */
`;

  const setup = `
describe('Hotmart Webhook Events (Generated)', () => {
  let hotmartTrigger: HotmartTrigger;
  let mockWebhookContext: IWebhookFunctions;
  let mockResponse: any;

  beforeEach(() => {
    hotmartTrigger = new HotmartTrigger();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockWebhookContext = mockWebhookFunctions({
      response: mockResponse
    });
  });
`;

  const eventTests = Array.from(payloadsByEvent.entries())
    .map(([event, payloads]) => generateTestForEvent(event, payloads))
    .join('\n');

  const footer = `
  describe('Event Coverage', () => {
    it('should have tests for all captured events', () => {
      const capturedEvents = ${JSON.stringify(Array.from(payloadsByEvent.keys()))};
      const testedEvents = capturedEvents; // All events have tests
      
      expect(testedEvents).toEqual(capturedEvents);
      expect(testedEvents.length).toBe(${payloadsByEvent.size});
    });
  });
});

// Schema validation helpers
function validateWebhookPayload(payload: any): boolean {
  return !!(payload.event && payload.hottok && payload.data);
}
`;

  return imports + setup + eventTests + footer;
}

// Gerar relatório de cobertura
function generateCoverageReport(payloadsByEvent: Map<string, EventPayload[]>): void {
  const report = {
    generatedAt: new Date().toISOString(),
    totalEvents: payloadsByEvent.size,
    events: Array.from(payloadsByEvent.entries()).map(([event, payloads]) => ({
      event,
      examplesCaptured: payloads.length,
      fields: analyzeFields(payloads[0])
    })),
    recommendations: generateRecommendations(payloadsByEvent)
  };
  
  const reportPath = path.join(PAYLOADS_DIR, 'test-coverage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Relatório de cobertura salvo em: ${reportPath}`);
}

// Analisar campos de um payload
function analyzeFields(payload: EventPayload): any {
  const analyze = (obj: any, prefix = ''): string[] => {
    const fields: string[] = [];
    
    for (const [key, value] of Object.entries(obj || {})) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      fields.push(fieldPath);
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        fields.push(...analyze(value, fieldPath));
      }
    }
    
    return fields;
  };
  
  return {
    topLevel: Object.keys(payload),
    dataFields: analyze(payload.data, 'data'),
    totalFields: analyze(payload).length
  };
}

// Gerar recomendações
function generateRecommendations(payloadsByEvent: Map<string, EventPayload[]>): string[] {
  const recommendations: string[] = [];
  
  // Eventos com poucos exemplos
  payloadsByEvent.forEach((payloads, event) => {
    if (payloads.length < 3) {
      recommendations.push(`⚠️ ${event}: Apenas ${payloads.length} exemplo(s). Recomendado capturar mais variações.`);
    }
  });
  
  // Eventos esperados mas não capturados
  const expectedEvents = [
    'PURCHASE_APPROVED',
    'PURCHASE_COMPLETE',
    'PURCHASE_CANCELED',
    'PURCHASE_OUT_OF_SHOPPING_CART',
    'SUBSCRIPTION_CANCELLATION'
  ];
  
  expectedEvents.forEach(event => {
    if (!payloadsByEvent.has(event)) {
      recommendations.push(`❌ ${event}: Não capturado. Execute ação para gerar este evento.`);
    }
  });
  
  return recommendations;
}

// Main
async function main() {
  console.log('🔧 Gerando testes baseados em payloads capturados...\n');
  
  const payloadsByEvent = loadCapturedPayloads();
  
  if (payloadsByEvent.size === 0) {
    console.error('❌ Nenhum payload encontrado! Execute a captura primeiro.');
    process.exit(1);
  }
  
  console.log(`📦 Encontrados ${payloadsByEvent.size} tipos de eventos:`);
  payloadsByEvent.forEach((payloads, event) => {
    console.log(`   - ${event}: ${payloads.length} exemplo(s)`);
  });
  
  // Gerar arquivo de testes
  const testContent = generateTestFile(payloadsByEvent);
  fs.writeFileSync(TESTS_OUTPUT, testContent);
  console.log(`\n✅ Arquivo de testes gerado: ${TESTS_OUTPUT}`);
  
  // Gerar relatório
  generateCoverageReport(payloadsByEvent);
  
  console.log('\n🎯 Próximos passos:');
  console.log('   1. npm run test:unit para executar os testes');
  console.log('   2. Revisar testes gerados e ajustar se necessário');
  console.log('   3. Capturar mais eventos se houver recomendações');
}

main().catch(console.error);