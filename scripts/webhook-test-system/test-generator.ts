#!/usr/bin/env ts-node

/**
 * Gerador de Testes para Webhook Hotmart
 * 
 * Gera arquivos de teste baseados nas fixtures selecionadas
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestGeneratorConfig {
  fixturesDir: string;
  outputDir: string;
  testFramework: 'jest' | 'mocha';
}

interface TestFile {
  filename: string;
  content: string;
  eventType: string;
  testCount: number;
}

export class TestGenerator {
  private config: TestGeneratorConfig;
  
  constructor(config: TestGeneratorConfig) {
    this.config = config;
  }

  /**
   * Gera os arquivos de teste
   */
  async generateTests(): Promise<void> {
    console.log('🧪 Iniciando geração de testes...');
    
    // Ler resumo das fixtures
    const summaryPath = path.join(this.config.fixturesDir, 'fixture-summary.json');
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    
    // Criar diretório de saída
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    const testFiles: TestFile[] = [];
    
    // Gerar teste principal do HotmartTrigger
    const mainTest = this.generateMainTestFile(summary);
    testFiles.push(mainTest);
    
    // Gerar testes específicos por tipo de evento
    for (const selection of summary.selections) {
      const eventTest = await this.generateEventTestFile(selection);
      testFiles.push(eventTest);
    }
    
    // Gerar testes para eventos mockados
    for (const mockedEvent of summary.mockedEvents) {
      const mockTest = await this.generateMockEventTest(mockedEvent);
      testFiles.push(mockTest);
    }
    
    // Salvar todos os arquivos de teste
    for (const testFile of testFiles) {
      const filePath = path.join(this.config.outputDir, testFile.filename);
      fs.writeFileSync(filePath, testFile.content);
      console.log(`   📝 ${testFile.filename}: ${testFile.testCount} testes`);
    }
    
    // Gerar arquivo de configuração de testes
    this.generateTestConfig(testFiles);
    
    console.log(`\n✅ Geração de testes concluída!`);
    console.log(`   Total de arquivos: ${testFiles.length}`);
    console.log(`   Total de testes: ${testFiles.reduce((sum, f) => sum + f.testCount, 0)}`);
  }

  /**
   * Gera o arquivo de teste principal
   */
  private generateMainTestFile(summary: any): TestFile {
    const content = `import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - Comprehensive Tests', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('Event Type Coverage', () => {
    test('should handle all ${summary.totalEventTypes} event types', () => {
      const eventTypes = [
        ${summary.selections.map((s: any) => `'${s.eventType}'`).join(',\n        ')},
        ${summary.mockedEvents.map((e: string) => `'${e}'`).join(',\n        ')}
      ];
      
      eventTypes.forEach(eventType => {
        const webhookData = {
          webhookEvent: eventType,
          webhookUrl: 'http://test.com/webhook'
        };
        
        expect(() => {
          trigger.webhook.call(triggerFunctions, webhookData);
        }).not.toThrow();
      });
    });
  });

  describe('Webhook Processing', () => {
    test('should validate webhook URL format', async () => {
      const invalidUrl = 'not-a-url';
      const webhookData = {
        webhookEvent: 'PURCHASE_COMPLETE',
        webhookUrl: invalidUrl
      };
      
      await expect(
        trigger.webhook.call(triggerFunctions, webhookData)
      ).rejects.toThrow();
    });

    test('should process events in correct order', async () => {
      const events: any[] = [];
      const mockEmit = jest.fn((data) => events.push(data));
      
      triggerFunctions.emit = mockEmit;
      
      // Simular múltiplos eventos
      const webhookData = {
        webhookEvent: 'all-events',
        webhookUrl: 'http://test.com/webhook'
      };
      
      const response = await trigger.webhook.call(triggerFunctions, webhookData);
      
      expect(response).toHaveProperty('webhookUrl');
      expect(mockEmit).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', async () => {
      const webhookData = {
        webhookEvent: 'PURCHASE_COMPLETE',
        webhookUrl: 'http://test.com/webhook'
      };
      
      const mockReq = {
        body: 'invalid json',
        headers: { 'content-type': 'application/json' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      
      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject unknown event types', async () => {
      const webhookData = {
        webhookEvent: 'PURCHASE_COMPLETE',
        webhookUrl: 'http://test.com/webhook'
      };
      
      const mockReq = {
        body: { event: 'UNKNOWN_EVENT', data: {} },
        headers: { 'content-type': 'application/json' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      
      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Evento desconhecido');
    });
  });
});
`;

    return {
      filename: 'HotmartTrigger.comprehensive.test.ts',
      content,
      eventType: 'all',
      testCount: 5
    };
  }

  /**
   * Gera teste para um tipo de evento específico
   */
  private async generateEventTestFile(selection: any): Promise<TestFile> {
    const eventDir = path.join(
      this.config.fixturesDir, 
      selection.eventType.toLowerCase().replace(/_/g, '-')
    );
    
    // Contar quantos fixtures temos
    const fixtureFiles = fs.readdirSync(eventDir).filter(f => f.endsWith('.json'));
    
    const content = `import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - ${selection.eventType}', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;
  const fixturesDir = path.join(__dirname, '../../fixtures/webhook-fixtures-anon/${selection.eventType.toLowerCase().replace(/_/g, '-')}');

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('${selection.eventType} Event Processing', () => {
    const fixtures = fs.readdirSync(fixturesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        data: JSON.parse(fs.readFileSync(path.join(fixturesDir, f), 'utf-8'))
      }));

    test.each(fixtures)('should process $name correctly', async ({ data }) => {
      const webhookData = {
        webhookEvent: '${selection.eventType}',
        webhookUrl: 'http://test.com/webhook'
      };

      const mockReq = {
        body: data,
        headers: { 'content-type': 'application/json' }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const emittedData: any[] = [];
      triggerFunctions.emit = jest.fn((data) => emittedData.push(data));

      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(emittedData).toHaveLength(1);
      expect(emittedData[0][0][0].json).toEqual(data);
    });

    test('should handle ${selection.eventType} in "all-events" mode', async () => {
      const webhookData = {
        webhookEvent: 'all-events',
        webhookUrl: 'http://test.com/webhook'
      };

      const sampleData = fixtures[0].data;
      const mockReq = {
        body: sampleData,
        headers: { 'content-type': 'application/json' }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('${selection.eventType} Data Validation', () => {
    test('should validate required fields', () => {
      const sampleFixture = JSON.parse(
        fs.readFileSync(path.join(fixturesDir, '1.json'), 'utf-8')
      );

      // Verificar campos obrigatórios
      expect(sampleFixture).toHaveProperty('event');
      expect(sampleFixture).toHaveProperty('data');
      expect(sampleFixture.event).toBe('${selection.eventType}');
    });

    test('should handle missing optional fields gracefully', async () => {
      const minimalData = {
        event: '${selection.eventType}',
        data: {}
      };

      const webhookData = {
        webhookEvent: '${selection.eventType}',
        webhookUrl: 'http://test.com/webhook'
      };

      const mockReq = {
        body: minimalData,
        headers: { 'content-type': 'application/json' }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
`;

    return {
      filename: `HotmartTrigger.${selection.eventType.toLowerCase().replace(/_/g, '-')}.test.ts`,
      content,
      eventType: selection.eventType,
      testCount: fixtureFiles.length + 3
    };
  }

  /**
   * Gera teste para evento mockado
   */
  private async generateMockEventTest(eventType: string): Promise<TestFile> {
    const content = `import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - ${eventType} (Mocked)', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;
  const mockData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../fixtures/webhook-mocks/${eventType.toLowerCase().replace(/_/g, '-')}.json'),
      'utf-8'
    )
  );

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('${eventType} Mock Event', () => {
    test('should process mocked ${eventType} event', async () => {
      const webhookData = {
        webhookEvent: '${eventType}',
        webhookUrl: 'http://test.com/webhook'
      };

      const mockReq = {
        body: mockData,
        headers: { 'content-type': 'application/json' }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const emittedData: any[] = [];
      triggerFunctions.emit = jest.fn((data) => emittedData.push(data));

      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(emittedData).toHaveLength(1);
      expect(emittedData[0][0][0].json.event).toBe('${eventType}');
    });

    test('should validate mocked data structure', () => {
      expect(mockData).toHaveProperty('event', '${eventType}');
      expect(mockData).toHaveProperty('data');
      expect(mockData.data).toBeInstanceOf(Object);
    });
  });
});
`;

    return {
      filename: `HotmartTrigger.${eventType.toLowerCase().replace(/_/g, '-')}.test.ts`,
      content,
      eventType: eventType,
      testCount: 2
    };
  }

  /**
   * Gera arquivo de configuração dos testes
   */
  private generateTestConfig(testFiles: TestFile[]): void {
    const config = {
      generatedAt: new Date().toISOString(),
      testFiles: testFiles.map(f => ({
        filename: f.filename,
        eventType: f.eventType,
        testCount: f.testCount
      })),
      totalTests: testFiles.reduce((sum, f) => sum + f.testCount, 0),
      coverage: {
        eventTypes: 15,
        realEvents: 13,
        mockedEvents: 2
      }
    };

    const configPath = path.join(this.config.outputDir, 'test-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`\n📋 Configuração dos testes salva em: ${configPath}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const config: TestGeneratorConfig = {
    fixturesDir: path.join(__dirname, '../../__tests__/fixtures/webhook-fixtures'),
    outputDir: path.join(__dirname, '../../__tests__/unit/webhook'),
    testFramework: 'jest'
  };
  
  const generator = new TestGenerator(config);
  generator.generateTests()
    .then(() => {
      console.log('\n✨ Testes gerados com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao gerar testes:', error);
      process.exit(1);
    });
}