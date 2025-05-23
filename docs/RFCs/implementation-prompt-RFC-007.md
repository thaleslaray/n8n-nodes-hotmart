# Prompt de Implementação - RFC-007: Testes e Validação

## Contexto Geral

Você está implementando o **Sistema de Testes e Validação** para o projeto de transformação do node Hotmart em ferramenta compatível com MCP. Este é o RFC-007, **o último RFC da série sequencial**.

**Pré-requisitos:** 
- RFC-001 (Estrutura Base MCP) implementada
- RFC-002 (Sistema de NLP) implementada  
- RFC-003 (Mapeamento de Operações) implementada
- RFC-004 (Sistema de Contexto) implementada
- RFC-005 (Interface de Linguagem Natural) implementada
- RFC-006 (Sistema de Monitoramento) implementada

## Objetivo Específico

Implementar uma estratégia completa de testes e validação que garanta qualidade, confiabilidade e funcionalidade correta da ferramenta MCP Hotmart em todos os cenários, desde desenvolvimento até produção.

## Funcionalidades a Implementar

### 1. Pirâmide de Testes Completa
- **70% Testes Unitários:** Rápidos, isolados, cobrindo lógica individual
- **20% Testes de Integração:** Verificar interação entre componentes
- **10% Testes End-to-End:** Jornadas completas de usuário
- **Testes de Performance:** Validar tempos de resposta aceitáveis
- **Testes de Segurança:** Validar proteções e sanitização

### 2. Suítes de Teste Especializadas
- `NLPTestSuite`: Testes de processamento de linguagem natural
- `MappingTestSuite`: Testes de mapeamento de operações
- `ContextTestSuite`: Testes de contexto e continuidade
- `FormattingTestSuite`: Testes de formatação de resposta
- `IntegrationTestSuite`: Testes de integração com API Hotmart

### 3. Mocks e Simuladores
- `MockHotmartApi`: Simulador da API Hotmart
- `TestCredentials`: Credenciais para ambiente de teste
- `MockContextStorage`: Storage em memória para testes
- `SimulatedUser`: Simulador de comportamento de usuário

### 4. Frameworks de Validação
- `E2ETestFramework`: Framework para testes ponta a ponta
- `PerformanceTestFramework`: Medição de performance
- `SecurityTestFramework`: Validação de segurança
- `RegressionTestFramework`: Detecção de regressões

### 5. Validação em Produção
- `CanaryDeployment`: Deploy gradual com monitoramento
- `FeatureFlags`: Controle de funcionalidades por usuário
- `SyntheticTests`: Testes sintéticos contínuos
- `ProductionValidator`: Validação automática em produção

## Especificações Técnicas Detalhadas

### Estrutura de Arquivos
```
tests/
├── unit/                              # Testes unitários (70%)
│   ├── nlp/
│   │   ├── NaturalLanguageProcessor.test.ts
│   │   ├── IntentionParser.test.ts
│   │   └── ParameterExtractor.test.ts
│   ├── mapping/
│   │   ├── OperationMapper.test.ts
│   │   ├── ExecutionOptimizer.test.ts
│   │   └── PermissionValidator.test.ts
│   ├── context/
│   │   ├── SessionManager.test.ts
│   │   ├── ReferenceResolver.test.ts
│   │   └── ConversationContinuity.test.ts
│   ├── formatting/
│   │   ├── ResponseFormatter.test.ts
│   │   ├── InsightGenerator.test.ts
│   │   └── BrazilianFormatter.test.ts
│   └── monitoring/
│       ├── Analytics.test.ts
│       ├── PerformanceCollector.test.ts
│       └── AlertSystem.test.ts
├── integration/                       # Testes de integração (20%)
│   ├── api/
│   │   ├── HotmartApiIntegration.test.ts
│   │   └── AuthenticationFlow.test.ts
│   ├── cache/
│   │   └── IntelligentCache.test.ts
│   └── storage/
│       └── ContextPersistence.test.ts
├── e2e/                              # Testes End-to-End (10%)
│   ├── scenarios/
│   │   ├── SalesAnalysisJourney.test.ts
│   │   ├── SubscriptionManagement.test.ts
│   │   └── ProductAnalytics.test.ts
│   └── user-journeys/
│       ├── BeginnerUser.test.ts
│       └── AdvancedUser.test.ts
├── performance/
│   ├── load/
│   │   ├── ConcurrentUsers.test.ts
│   │   └── HighVolumeCommands.test.ts
│   └── stress/
│       └── SystemLimits.test.ts
├── security/
│   ├── authentication/
│   │   └── OAuth2Security.test.ts
│   ├── input-validation/
│   │   └── InputSanitization.test.ts
│   └── data-protection/
│       └── SensitiveDataMasking.test.ts
├── mocks/
│   ├── MockHotmartApi.ts
│   ├── TestCredentials.ts
│   ├── MockContextStorage.ts
│   └── TestLogger.ts
├── fixtures/
│   ├── sample-commands.json
│   ├── expected-responses.json
│   └── api-responses.json
└── helpers/
    ├── TestHelpers.ts
    ├── AssertionHelpers.ts
    └── DataGenerators.ts
```

### Configuração de Testes

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-helpers/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Configuração por tipo de teste
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testTimeout: 5000
    },
    {
      displayName: 'integration', 
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testTimeout: 30000
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
      testTimeout: 60000
    }
  ]
};
```

## Regras de Implementação

### 1. Cobertura de Código
- **Mínimo 80%** cobertura geral
- **90%** cobertura para lógica crítica (NLP, mapeamento)
- **100%** cobertura para funções de segurança
- **Métricas:** branches, functions, lines, statements

### 2. Performance dos Testes
- **Testes unitários:** < 5s para suíte completa
- **Testes integração:** < 2min para suíte completa
- **Testes E2E:** < 10min para suíte completa
- **Paralelização:** Testes independentes em paralelo

### 3. Qualidade dos Testes
- **Nomes descritivos:** O que está sendo testado e esperado
- **Arrange-Act-Assert:** Estrutura clara
- **Dados determinísticos:** Evitar aleatoriedade
- **Limpeza:** Cada teste limpa após si mesmo

### 4. Mocks e Stubs
- **API Externa:** Sempre mockar chamadas Hotmart
- **Tempo:** Mockar Date.now() para testes determinísticos  
- **Randomness:** Mockar Math.random() para consistência
- **File System:** Usar in-memory storage para testes

## Testes de Processamento de Linguagem Natural

### 1. Testes de Parsing Básico
```typescript
describe('NaturalLanguageProcessor', () => {
  const nlp = new NaturalLanguageProcessor();
  
  describe('Comandos de Vendas', () => {
    test('deve interpretar consulta básica de vendas', () => {
      const result = nlp.parseCommand("mostre as vendas do último mês");
      
      expect(result).toMatchObject({
        resource: 'vendas',
        action: 'consultar',
        confidence: expect.toBeGreaterThan(0.8)
      });
      expect(result.parameters.periodo).toBeDefined();
    });
    
    test('deve extrair valores monetários corretamente', () => {
      const testCases = [
        { input: "vendas acima de R$ 1.500,00", expected: 1500.00 },
        { input: "vendas de mil reais", expected: 1000.00 },
        { input: "mais de 500 reais", expected: 500.00 }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = nlp.parseCommand(input);
        expect(result.parameters.valorMinimo).toBe(expected);
      });
    });
    
    test('deve reconhecer períodos temporais', () => {
      const testCases = [
        { 
          input: "vendas de ontem", 
          expected: getDateDaysAgo(1) 
        },
        { 
          input: "vendas de janeiro de 2024", 
          expected: { start: '2024-01-01', end: '2024-01-31' } 
        },
        { 
          input: "vendas da semana passada", 
          expected: getWeekRange(-1) 
        }
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = nlp.parseCommand(input);
        expect(result.parameters.periodo).toEqual(expected);
      });
    });
  });
  
  describe('Comandos de Assinaturas', () => {
    test('deve interpretar cancelamento em lote', () => {
      const result = nlp.parseCommand("cancele todas as assinaturas em atraso");
      
      expect(result).toMatchObject({
        resource: 'assinaturas',
        action: 'cancelar',
        parameters: {
          criterio: 'em_atraso',
          lote: true
        }
      });
    });
    
    test('deve interpretar reativação específica', () => {
      const result = nlp.parseCommand("reative a assinatura do cliente joão@email.com");
      
      expect(result).toMatchObject({
        resource: 'assinaturas',
        action: 'reativar',
        parameters: {
          email: 'joão@email.com'
        }
      });
    });
  });
  
  describe('Tratamento de Ambiguidades', () => {
    test('deve detectar comando ambíguo', () => {
      const result = nlp.parseCommand("mostre os dados");
      
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.needsClarification).toBe(true);
      expect(result.clarificationPrompt).toContain('específico');
    });
    
    test('deve resolver referência contextual', () => {
      const context = {
        lastProduct: 'Curso de Marketing',
        lastDateRange: { start: '2024-01-01', end: '2024-01-31' }
      };
      
      const result = nlp.parseCommandWithContext("mostre mais detalhes", context);
      
      expect(result.parameters.produto).toBe('Curso de Marketing');
      expect(result.parameters.periodo).toEqual(context.lastDateRange);
    });
  });
});
```

### 2. Testes de Confiança e Precisão
```typescript
describe('NLP Quality Metrics', () => {
  test('deve ter alta precisão em comandos comuns', async () => {
    const commonCommands = [
      "vendas do último mês",
      "assinaturas ativas", 
      "produtos mais vendidos",
      "cupons ativos",
      "cancelar assinatura 123"
    ];
    
    let successCount = 0;
    
    for (const command of commonCommands) {
      const result = nlp.parseCommand(command);
      if (result.confidence > 0.8) {
        successCount++;
      }
    }
    
    const precision = successCount / commonCommands.length;
    expect(precision).toBeGreaterThan(0.85); // 85% de precisão mínima
  });
});
```

## Testes de Integração com API

### 1. Mock da API Hotmart
```typescript
class MockHotmartApi {
  private responses = new Map<string, any>();
  private failureRate = 0;
  private rateLimitEnabled = false;
  private callCount = 0;
  
  setMockResponse(endpoint: string, response: any): void {
    this.responses.set(endpoint, response);
  }
  
  setFailureRate(rate: number): void {
    this.failureRate = rate;
  }
  
  setRateLimit(enabled: boolean): void {
    this.rateLimitEnabled = enabled;
  }
  
  async makeRequest(endpoint: string, params: any): Promise<any> {
    this.callCount++;
    
    // Simular rate limit
    if (this.rateLimitEnabled && this.callCount > 100) {
      throw new Error('Rate limit exceeded');
    }
    
    // Simular falhas aleatórias
    if (Math.random() < this.failureRate) {
      throw new Error('API temporarily unavailable');
    }
    
    // Retornar resposta mockada
    const response = this.responses.get(endpoint);
    if (response) {
      return response;
    }
    
    throw new Error(`No mock response defined for ${endpoint}`);
  }
  
  getCallCount(): number {
    return this.callCount;
  }
  
  reset(): void {
    this.callCount = 0;
    this.responses.clear();
    this.failureRate = 0;
    this.rateLimitEnabled = false;
  }
}
```

### 2. Testes de Resilência
```typescript
describe('API Integration Resilience', () => {
  let mockApi: MockHotmartApi;
  
  beforeEach(() => {
    mockApi = new MockHotmartApi();
  });
  
  test('deve tratar rate limit graciosamente', async () => {
    mockApi.setRateLimit(true);
    
    const request = new HotmartRequest('sales:getHistoricoVendas', mockCredentials);
    const result = await request.execute();
    
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('RATE_LIMIT_EXCEEDED');
    expect(result.retryAfter).toBeDefined();
  });
  
  test('deve implementar retry automático', async () => {
    mockApi.setFailureRate(0.3); // 30% de falhas
    
    const request = new HotmartRequest('products:getAll', mockCredentials);
    const result = await request.executeWithRetry({ maxRetries: 3 });
    
    expect(mockApi.getCallCount()).toBeGreaterThan(1);
    expect(result.success).toBe(true);
  });
  
  test('deve manter autenticação OAuth2', async () => {
    const mockCredentials = {
      ...testCredentials,
      tokenExpiration: Date.now() + 1000 // Expira em 1s
    };
    
    const request = new HotmartRequest('sales:getHistoricoVendas', mockCredentials);
    
    // Primeira chamada
    await request.execute();
    
    // Aguardar expiração
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Segunda chamada deve renovar token
    const result = await request.execute();
    
    expect(result.success).toBe(true);
    expect(mockCredentials.tokenRenewalCount).toBe(1);
  });
});
```

## Testes End-to-End

### 1. Jornadas de Usuário Completas
```typescript
describe('End-to-End User Journeys', () => {
  test('jornada completa: análise de vendas', async () => {
    // 1. Comando inicial
    let result = await executeMCPCommand("analise minhas vendas de dezembro");
    
    expect(result.success).toBe(true);
    expect(result.data.resumo).toContain('dezembro');
    expect(result.suggestions).toHaveLength(3);
    
    // 2. Follow-up contextual
    result = await executeMCPCommand("compare com novembro");
    
    expect(result.success).toBe(true);
    expect(result.data.comparacao).toBeDefined();
    expect(result.data.tendencia).toMatch(/(aumentou|diminuiu|manteve)/);
    
    // 3. Comando de ação
    result = await executeMCPCommand("mostre o produto que mais vendeu");
    
    expect(result.success).toBe(true);
    expect(result.data.produto).toBeDefined();
    expect(result.data.metricas).toMatchObject({
      vendas: expect.any(Number),
      receita: expect.any(Number)
    });
  });
  
  test('jornada completa: gestão de assinaturas', async () => {
    // 1. Status geral
    let result = await executeMCPCommand("como estão minhas assinaturas?");
    
    expect(result.success).toBe(true);
    expect(result.data.resumo).toBeDefined();
    expect(result.actions).toContain(expect.objectContaining({
      priority: 'alta'
    }));
    
    // 2. Identificar problemas
    result = await executeMCPCommand("quais assinaturas estão com problema?");
    
    expect(result.success).toBe(true);
    expect(result.data.assinaturas_problema).toBeDefined();
    
    // 3. Ação corretiva
    result = await executeMCPCommand("envie lembretes para as em atraso");
    
    expect(result.success).toBe(true);
    expect(result.data.lembretes_enviados).toBeGreaterThan(0);
  });
  
  test('tratamento gracioso de erros', async () => {
    // Simular API down
    mockHotmartApi.setDown(true);
    
    const result = await executeMCPCommand("vendas de hoje");
    
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('temporariamente indisponível');
    expect(result.suggestions).toContain(expect.objectContaining({
      action: expect.stringContaining('tentar novamente')
    }));
  });
});
```

### 2. Simulação de Usuários
```typescript
class SimulatedUser {
  constructor(private profile: UserProfile) {}
  
  async simulateTypicalSession(): Promise<SessionResult> {
    const commands = this.generateTypicalCommands();
    const results = [];
    
    for (const command of commands) {
      const result = await this.executeCommandAsUser(command);
      results.push(result);
      
      // Simular tempo de leitura/pensamento
      await this.simulateThinkTime();
    }
    
    return {
      profile: this.profile,
      commandsExecuted: commands.length,
      successRate: results.filter(r => r.success).length / results.length,
      averageResponseTime: this.calculateAverageResponseTime(results),
      userSatisfaction: this.simulateUserSatisfaction(results)
    };
  }
  
  private generateTypicalCommands(): string[] {
    switch (this.profile.businessType) {
      case 'curso_online':
        return [
          "vendas deste mês",
          "alunos novos da semana",
          "curso mais popular",
          "taxa de conclusão dos cursos"
        ];
      case 'ebook':
        return [
          "vendas do último mês",
          "ebook mais vendido", 
          "receita total",
          "criar cupom de desconto"
        ];
      default:
        return [
          "vendas recentes",
          "produtos populares",
          "assinaturas ativas"
        ];
    }
  }
}
```

## Testes de Performance

### 1. Testes de Carga
```typescript
describe('Performance Under Load', () => {
  test('deve manter performance com 50 usuários simultâneos', async () => {
    const concurrentUsers = 50;
    const commandsPerUser = 5;
    
    const userPromises = Array.from({ length: concurrentUsers }, async (_, userId) => {
      const userResults = [];
      
      for (let i = 0; i < commandsPerUser; i++) {
        const startTime = Date.now();
        const result = await executeMCPCommand(`vendas do produto ${userId}-${i}`);
        const responseTime = Date.now() - startTime;
        
        userResults.push({
          success: result.success,
          responseTime
        });
      }
      
      return userResults;
    });
    
    const allResults = (await Promise.all(userPromises)).flat();
    
    // Verificar taxa de sucesso
    const successRate = allResults.filter(r => r.success).length / allResults.length;
    expect(successRate).toBeGreaterThan(0.95); // 95% de sucesso
    
    // Verificar tempo de resposta P95
    const responseTimes = allResults.map(r => r.responseTime).sort((a, b) => a - b);
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    expect(p95).toBeLessThan(5000); // P95 < 5s
  });
  
  test('deve usar cache eficientemente sob carga', async () => {
    const cache = new IntelligentCache();
    let cacheHits = 0;
    let cacheMisses = 0;
    
    // Simular múltiplas consultas idênticas
    const sameCommandPromises = Array.from({ length: 20 }, async () => {
      const result = await executeCachedCommand('vendas do último mês', cache);
      if (result.fromCache) cacheHits++;
      else cacheMisses++;
      return result;
    });
    
    await Promise.all(sameCommandPromises);
    
    const hitRate = cacheHits / (cacheHits + cacheMisses);
    expect(hitRate).toBeGreaterThan(0.8); // 80% cache hit rate
  });
});
```

### 2. Testes de Stress
```typescript
describe('System Stress Tests', () => {
  test('deve degradar graciosamente sob stress extremo', async () => {
    const extremeLoad = 200; // 200 usuários simultâneos
    
    const results = await Promise.allSettled(
      Array.from({ length: extremeLoad }, () => 
        executeMCPCommand("vendas complexas com múltiplas agregações")
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Sistema deve falhar graciosamente, não crashar
    expect(successful + failed).toBe(extremeLoad);
    
    // Pelo menos 50% deve ser bem-sucedido mesmo sob stress
    expect(successful / extremeLoad).toBeGreaterThan(0.5);
  });
});
```

## Testes de Segurança

### 1. Validação de Entrada
```typescript
describe('Input Validation Security', () => {
  test('deve sanitizar entrada maliciosa', async () => {
    const maliciousInputs = [
      "vendas'); DROP TABLE sales; --",
      "<script>alert('xss')</script>vendas",
      "vendas${process.env.SECRET_KEY}",
      "vendas\"; require('fs').unlinkSync('/etc/passwd'); \"",
      "vendas\n\nrm -rf /"
    ];
    
    for (const maliciousInput of maliciousInputs) {
      const result = await executeMCPCommand(maliciousInput);
      
      // Deve processar como comando normal ou rejeitar, nunca executar código
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('COMMAND_NOT_UNDERSTOOD');
      
      // Verificar que não houve efeitos colaterais
      expect(await checkSystemIntegrity()).toBe(true);
    }
  });
  
  test('deve mascarar dados sensíveis em logs', async () => {
    const logger = new TestLogger();
    
    await executeMCPCommandWithLogger(
      "vendas do cliente user@secret.com com cartão 4111111111111111",
      logger
    );
    
    const logs = logger.getLogs();
    
    // Verificar que email e cartão foram mascarados
    logs.forEach(log => {
      expect(log.message).not.toContain('user@secret.com');
      expect(log.message).not.toContain('4111111111111111');
      expect(log.message).toContain('[MASKED]');
    });
  });
});
```

### 2. Testes de Autenticação
```typescript
describe('Authentication Security', () => {
  test('deve validar credenciais OAuth2', async () => {
    const invalidCredentials = {
      ...mockCredentials,
      accessToken: 'invalid-token-12345'
    };
    
    const result = await executeMCPCommandWithCredentials(
      "vendas do último mês",
      invalidCredentials
    );
    
    expect(result.success).toBe(false);
    expect(result.error.type).toBe('AUTHENTICATION_FAILED');
    expect(result.error.message).toContain('credenciais inválidas');
  });
  
  test('deve implementar rate limiting por usuário', async () => {
    const userId = 'test-user-rate-limit';
    
    // Fazer 100 requests rapidamente
    const requests = Array.from({ length: 100 }, () =>
      executeMCPCommandAsUser("vendas", userId)
    );
    
    const results = await Promise.allSettled(requests);
    
    // Verificar que algumas foram bloqueadas por rate limit
    const rateLimited = results.filter(r => 
      r.status === 'fulfilled' && 
      r.value.error?.type === 'RATE_LIMIT_EXCEEDED'
    ).length;
    
    expect(rateLimited).toBeGreaterThan(50); // Pelo menos metade bloqueada
  });
});
```

## Validação em Produção

### 1. Testes Sintéticos
```typescript
class SyntheticTestRunner {
  async runContinuousTests(): Promise<void> {
    const testScenarios = [
      'vendas do último mês',
      'assinaturas ativas',
      'produtos mais vendidos'
    ];
    
    setInterval(async () => {
      for (const scenario of testScenarios) {
        try {
          const result = await this.executeSyntheticTest(scenario);
          this.recordSyntheticResult(scenario, result);
        } catch (error) {
          this.alertSyntheticFailure(scenario, error);
        }
      }
    }, 300000); // A cada 5 minutos
  }
  
  private async executeSyntheticTest(scenario: string): Promise<TestResult> {
    const startTime = Date.now();
    const result = await executeMCPCommand(scenario);
    const responseTime = Date.now() - startTime;
    
    return {
      scenario,
      success: result.success,
      responseTime,
      timestamp: new Date()
    };
  }
}
```

### 2. Canary Deployment
```typescript
class CanaryDeployment {
  async deployWithCanary(newVersion: string, percentage: number = 10): Promise<boolean> {
    // Direcionar % do tráfego para nova versão
    await this.updateLoadBalancer(newVersion, percentage);
    
    // Monitorar métricas por 30 minutos
    const monitoringPeriod = 30 * 60 * 1000; // 30 min
    const metrics = await this.monitorCanaryMetrics(monitoringPeriod);
    
    // Decidir se continuar ou fazer rollback
    if (this.isCanaryHealthy(metrics)) {
      await this.promoteCanary(newVersion);
      return true;
    } else {
      await this.rollbackCanary(newVersion);
      return false;
    }
  }
  
  private isCanaryHealthy(metrics: CanaryMetrics): boolean {
    return (
      metrics.errorRate < 0.01 &&     // < 1% erro
      metrics.avgResponseTime < 3000 && // < 3s resposta  
      metrics.userSatisfaction > 0.9    // > 90% satisfação
    );
  }
}
```

## Casos de Teste Críticos

### Cobertura Obrigatória
```
✅ Todos os comandos NLP básicos funcionando
✅ Mapeamento para todas as operações Hotmart
✅ Contexto e continuidade de conversação
✅ Formatação cultural brasileira
✅ Tratamento de erros e edge cases
✅ Performance sob carga normal
✅ Segurança e sanitização de entrada
```

### Cenários de Regressão
```
✅ Funcionalidade n8n não quebrou
✅ Compatibilidade com versões anteriores
✅ Operações existentes ainda funcionam
✅ Performance não degradou
```

## Critérios de Aceitação Final

### Funcionalidade
- [ ] **Taxa de sucesso > 95%** para comandos básicos
- [ ] **Todos os RFCs 001-006** validados por testes
- [ ] **Jornadas E2E completas** funcionando
- [ ] **Tratamento de erros** gracioso e informativo

### Performance  
- [ ] **Tempo resposta P95 < 3s** para operações simples
- [ ] **Suporte a 50 usuários** simultâneos  
- [ ] **Cache hit rate > 60%** 
- [ ] **Testes unitários < 5s** para executar

### Qualidade
- [ ] **Cobertura de código > 80%**
- [ ] **Cobertura funcional > 95%** 
- [ ] **Zero falsos positivos** críticos
- [ ] **Documentação de testes** completa

### Segurança
- [ ] **Dados sensíveis mascarados** 
- [ ] **Rate limiting** implementado
- [ ] **Validação de entrada** robusta
- [ ] **Autenticação** validada

## Integração com Outras RFCs

### Validation Chain (depende de todos):
- **RFC-001:** Testa estrutura base MCP
- **RFC-002:** Valida processamento NLP
- **RFC-003:** Confirma mapeamento de operações  
- **RFC-004:** Verifica contexto e memória
- **RFC-005:** Testa formatação de linguagem natural
- **RFC-006:** Valida monitoramento e métricas

## Dicas de Implementação

### 1. Comece pelos Testes Críticos
Implemente primeiro os testes dos casos de uso mais importantes.

### 2. Use Test Data Builders
```typescript
class TestDataBuilder {
  static salesData() {
    return {
      transaction: 'T123',
      value: 15000, // em centavos
      date: '2024-01-15',
      product: 'Curso Marketing'
    };
  }
}
```

### 3. Testes Determinísticos
```typescript
// Mock tempo para testes consistentes
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-15'));
```

### 4. Assertions Claras
```typescript
// Bom: específico e claro
expect(result.data.vendas).toHaveLength(5);
expect(result.data.receita).toBe(1500.00);

// Evite: muito genérico
expect(result).toBeTruthy();
```

### 5. Debugging de Testes
```typescript
// Adicione contexto quando testes falham
test('deve formatar moeda corretamente', () => {
  const result = formatCurrency(150000);
  expect(result).toBe('R$ 1.500,00'); 
  // Se falhar, mostra: Expected "R$ 1500.00" to be "R$ 1.500,00"
});
```

## Status de Entrega Final

Marque como **PROJETO COMPLETO** quando:
- [ ] Todas as suítes de teste implementadas
- [ ] Cobertura de código > 80%
- [ ] Todos os cenários críticos passam
- [ ] Performance validada sob carga
- [ ] Segurança testada e aprovada
- [ ] Validação em produção configurada
- [ ] Documentação de testes completa
- [ ] **Todos os RFCs 001-006 validados**

🎉 **Parabéns! Você concluiu a implementação completa da ferramenta MCP Hotmart!**

A ferramenta agora permite que infoprodutores brasileiros interajam com a API da Hotmart usando linguagem natural, democratizando o acesso à automação e análise de dados de negócio.