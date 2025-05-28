#!/usr/bin/env ts-node

/**
 * Benchmark específico para a função webhook do HotmartTrigger
 * Mede performance antes das otimizações (baseline)
 */

import { performance } from 'perf_hooks';

// Mock das dependências do n8n
const mockWebhookFunctions = {
  getBodyData: () => ({
    event: 'PURCHASE_APPROVED',
    data: {
      purchase: {
        id: '12345',
        is_subscription: false,
        payment: { type: 'CREDIT_CARD' },
        recurrence_number: 1
      },
      product: { id: '67890' }
    }
  }),
  getHeaderData: () => ({
    'x-hotmart-hottok': 'test-token-123'
  }),
  getWorkflowStaticData: () => ({
    hotTokToken: 'test-token-123',
    webhookUrl: 'https://test.webhook.url'
  }),
  getResponseObject: () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  }),
  getNodeParameter: (name: string, defaultValue?: any) => {
    if (name === 'triggerMode') return 'super-smart';
    if (name === 'options') return {};
    return defaultValue;
  },
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  }
};

// Diferentes cenários de teste
const testScenarios = [
  {
    name: 'Standard Mode - Single Event',
    mode: 'standard',
    event: 'PURCHASE_APPROVED'
  },
  {
    name: 'Smart Mode - Multiple Outputs',
    mode: 'smart', 
    event: 'PURCHASE_APPROVED'
  },
  {
    name: 'Super Smart Mode - Complex Routing',
    mode: 'super-smart',
    event: 'PURCHASE_APPROVED'
  },
  {
    name: 'Super Smart Mode - Subscription',
    mode: 'super-smart',
    event: 'SUBSCRIPTION_CANCELLATION'
  }
];

interface BenchmarkResult {
  scenario: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  ops_per_second: number;
}

async function benchmarkScenario(scenario: any, iterations: number = 1000): Promise<BenchmarkResult> {
  const times: number[] = [];
  
  // Preparar mock para este cenário
  mockWebhookFunctions.getNodeParameter = (name: string, defaultValue?: any) => {
    if (name === 'triggerMode') return scenario.mode;
    if (name === 'event') return scenario.event;
    if (name === 'options') return {};
    return defaultValue;
  };

  mockWebhookFunctions.getBodyData = () => ({
    event: scenario.event,
    data: {
      purchase: {
        id: '12345',
        is_subscription: scenario.event.includes('SUBSCRIPTION'),
        payment: { type: 'CREDIT_CARD' },
        recurrence_number: scenario.event.includes('SUBSCRIPTION') ? 2 : 1
      },
      subscription: scenario.event.includes('SUBSCRIPTION') ? {
        subscriber: { code: 'SUB123' }
      } : undefined,
      product: { id: '67890' }
    }
  });

  // Warm-up (descartar primeiras execuções)
  for (let i = 0; i < 100; i++) {
    try {
      // Simular processamento do webhook (sem importar o arquivo real para evitar dependências)
      const start = performance.now();
      
      // Simular lógica principal do webhook
      simulateWebhookLogic(scenario);
      
      const end = performance.now();
      if (i >= 10) { // Ignorar as primeiras 10 execuções
        times.push(end - start);
      }
    } catch (error) {
      // Ignorar erros de mock
    }
  }

  // Execuções de benchmark reais
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      simulateWebhookLogic(scenario);
    } catch (error) {
      // Ignorar erros de mock
    }
    
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const avgTime = totalTime / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const ops_per_second = 1000 / avgTime; // operações por segundo

  return {
    scenario: scenario.name,
    iterations: times.length,
    totalTime: parseFloat(totalTime.toFixed(3)),
    avgTime: parseFloat(avgTime.toFixed(3)),
    minTime: parseFloat(minTime.toFixed(3)),
    maxTime: parseFloat(maxTime.toFixed(3)),
    ops_per_second: parseFloat(ops_per_second.toFixed(0))
  };
}

// Simular a lógica principal do webhook sem dependências do n8n
function simulateWebhookLogic(scenario: any): any {
  const bodyData = mockWebhookFunctions.getBodyData();
  const headerData = mockWebhookFunctions.getHeaderData();
  const webhookData = mockWebhookFunctions.getWorkflowStaticData();
  const triggerMode = scenario.mode;
  
  // 1. Validação de token (simular)
  const hottok = headerData['x-hotmart-hottok'];
  if (hottok && webhookData.hotTokToken && hottok !== webhookData.hotTokToken) {
    throw new Error('Token inválido');
  }

  // 2. Validação de evento
  const eventName = bodyData.event;
  const validEvents = [
    'PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'PURCHASE_CANCELED',
    'SUBSCRIPTION_CANCELLATION', 'CLUB_FIRST_ACCESS'
  ];
  
  if (!validEvents.includes(eventName)) {
    throw new Error('Evento inválido');
  }

  // 3. Processamento por modo (simular complexidade)
  let outputIndex = 0;
  const dataObj = bodyData.data || {};
  
  if (triggerMode === 'standard') {
    // Simular lógica padrão (mais simples)
    outputIndex = 0;
  } else if (triggerMode === 'smart') {
    // Simular lógica inteligente (15 outputs)
    const eventConfigs = {
      'PURCHASE_APPROVED': 0,
      'PURCHASE_COMPLETE': 1,
      'SUBSCRIPTION_CANCELLATION': 10
    };
    outputIndex = eventConfigs[eventName as keyof typeof eventConfigs] || 0;
  } else if (triggerMode === 'super-smart') {
    // Simular lógica super inteligente (18 outputs + condicionais complexas)
    if (eventName === 'PURCHASE_APPROVED') {
      const isSubscription = Boolean((dataObj as any).purchase?.is_subscription);
      const recurrenceNumber = (dataObj as any).purchase?.recurrence_number || 0;
      
      if (!isSubscription) {
        outputIndex = 0; // Compra única
      } else if (recurrenceNumber <= 1) {
        outputIndex = 1; // Nova assinatura
      } else {
        outputIndex = 2; // Renovação
      }
    } else if (eventName === 'SUBSCRIPTION_CANCELLATION') {
      outputIndex = 13;
    }
    
    // Simular processamento adicional de metadados
    const metadata = {
      eventType: eventName,
      isSubscription: Boolean((dataObj as any).subscription || (dataObj as any).purchase?.is_subscription),
      recurrenceNumber: (dataObj as any).purchase?.recurrence_number || 0,
      timestamp: new Date().toISOString()
    };
    
    // Simular formatação de dados
    JSON.stringify(metadata);
  }

  // 4. Construção de resposta (simular)
  const outputs = new Array(triggerMode === 'super-smart' ? 18 : 15).fill([]);
  outputs[outputIndex] = [{
    ...bodyData,
    metadata: {
      triggerMode,
      outputIndex,
      processedAt: new Date().toISOString()
    }
  }];

  return { workflowData: outputs };
}

async function runBenchmarks(): Promise<void> {
  console.log('🚀 WEBHOOK PERFORMANCE BENCHMARK - BASELINE');
  console.log('='.repeat(50));
  console.log();

  const results: BenchmarkResult[] = [];

  for (const scenario of testScenarios) {
    console.log(`📊 Benchmarking: ${scenario.name}...`);
    const result = await benchmarkScenario(scenario, 1000);
    results.push(result);
    
    console.log(`   ⏱️  Avg: ${result.avgTime}ms`);
    console.log(`   🚀  OPS/sec: ${result.ops_per_second}`);
    console.log(`   📈  Range: ${result.minTime}ms - ${result.maxTime}ms`);
    console.log();
  }

  // Resumo final
  console.log('📋 SUMMARY - BASELINE METRICS');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`${result.scenario}:`);
    console.log(`  Average: ${result.avgTime}ms`);
    console.log(`  OPS/sec: ${result.ops_per_second}`);
    console.log(`  Efficiency: ${result.ops_per_second > 1000 ? '✅ Good' : result.ops_per_second > 500 ? '⚠️  Moderate' : '❌ Needs optimization'}`);
    console.log();
  });

  // Salvar resultados para comparação futura
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultFile = `__tests__/performance/baseline-${timestamp}.json`;
  
  const fs = require('fs');
  fs.writeFileSync(resultFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    version: 'baseline-before-optimization',
    results
  }, null, 2));

  console.log(`💾 Results saved to: ${resultFile}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

export { runBenchmarks, benchmarkScenario };