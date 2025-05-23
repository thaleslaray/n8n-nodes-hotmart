# Prompt de Implementação - RFC-006: Sistema de Monitoramento e Analytics

## Contexto Geral

Você está implementando o **Sistema de Monitoramento e Analytics** para o projeto de transformação do node Hotmart em ferramenta compatível com MCP. Este é o RFC-006 de uma série sequencial.

**Pré-requisitos:** 
- RFC-001 (Estrutura Base MCP) implementada
- RFC-002 (Sistema de NLP) implementada  
- RFC-003 (Mapeamento de Operações) implementada
- RFC-004 (Sistema de Contexto) implementada
- RFC-005 (Interface de Linguagem Natural) implementada

## Objetivo Específico

Implementar um sistema abrangente de monitoramento e analytics que colete métricas de uso, performance e qualidade da ferramenta, fornecendo insights para otimização contínua e detecção proativa de problemas.

## Funcionalidades a Implementar

### 1. Sistema Central de Analytics
- Classe `Analytics` como ponto central de coleta
- Tracking de comandos, API calls, cache hits, erros
- Métricas de performance e qualidade NLP
- Agregação de dados para análises

### 2. Coletores Especializados
- `PerformanceCollector`: Tempos de execução, gargalos
- `UsageAnalytics`: Padrões de uso, jornadas de usuário
- `NLPQualityMetrics`: Precisão, confiança, acertos
- `ApiHealthMonitor`: Status das APIs Hotmart

### 3. Sistema de Alertas Inteligentes
- Classe `AlertSystem` com regras configuráveis
- Detecção automática de degradação de performance
- Alertas para problemas de API externa
- Monitoramento de qualidade NLP

### 4. Dashboard de Saúde
- Classe `HealthDashboard` para visão geral
- Status consolidado do sistema
- Recomendações automáticas de otimização
- Métricas em tempo real

### 5. Logging Estruturado
- Classe `StructuredLogger` para logs organizados
- Correlação de eventos por sessão
- Mascaramento de dados sensíveis
- Exportação para análise externa

## Especificações Técnicas Detalhadas

### Estrutura de Arquivos
```
nodes/Hotmart/v1/monitoring/
├── Analytics.ts                  # Sistema central de analytics
├── PerformanceCollector.ts       # Coleta de métricas de performance
├── UsageAnalytics.ts            # Análise de padrões de uso
├── ApiHealthMonitor.ts          # Monitoramento de APIs externas
├── NLPQualityMetrics.ts         # Métricas de qualidade NLP
├── AlertSystem.ts               # Sistema de alertas
├── HealthDashboard.ts           # Dashboard de saúde
├── StructuredLogger.ts          # Logging estruturado
└── types.ts                     # Interfaces de monitoramento
```

### Interfaces Principais
```typescript
interface Metrics {
  // Métricas de uso
  commandFrequency: Map<string, number>;
  totalCommands: number;
  uniqueUsers: Set<string>;
  sessionDuration: number[];
  
  // Métricas de performance
  averageResponseTime: number;
  apiCallLatency: Map<string, number[]>;
  cacheHitRate: number;
  errorRate: number;
  
  // Métricas de qualidade NLP
  nlpConfidenceScores: number[];
  commandSuccessRate: number;
  userSatisfactionRatings: number[];
}

interface HealthStatus {
  systemHealth: 'saudavel' | 'degradado' | 'critico';
  apiAvailability: Map<string, number>;
  lastUpdateTime: Date;
  alerts: Alert[];
  recommendations: Recommendation[];
}

interface Alert {
  id: string;
  type: 'performance' | 'error' | 'api_down' | 'usage' | 'quality';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, any>;
}
```

## Regras de Implementação

### 1. Coleta de Métricas
- **Assíncrona:** Não bloquear execução principal
- **Eficiente:** Mínimo overhead de performance
- **Selectiva:** Coletar apenas métricas úteis
- **Resiliente:** Falhas de coleta não devem quebrar sistema

### 2. Alertas Inteligentes
- **Configuráveis:** Thresholds ajustáveis por ambiente
- **Contextuais:** Considerar padrões históricos
- **Acionáveis:** Incluir sugestões de resolução
- **Não spam:** Evitar alertas repetitivos

### 3. Privacy e Segurança
- **Mascaramento:** Dados sensíveis nunca logados
- **Agregação:** Dados individuais não expostos
- **TTL:** Logs antigos removidos automaticamente
- **Opt-out:** Possibilidade de desabilitar coleta

### 4. Performance do Monitoramento
- **Batching:** Agrupar eventos antes de processar
- **Sampling:** Coletar amostra representativa em alta carga
- **Compressão:** Otimizar armazenamento de dados
- **Cleanup:** Limpeza automática de dados antigos

## Sistema de Coleta de Performance

### 1. Medição de Tempos
```typescript
class PerformanceCollector {
  private timers = new Map<string, number>();
  
  startTimer(operationId: string): string {
    const timerId = `${operationId}_${Date.now()}_${Math.random()}`;
    this.timers.set(timerId, performance.now());
    return timerId;
  }
  
  endTimer(timerId: string, operation: string): number {
    const startTime = this.timers.get(timerId);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.recordExecutionTime(operation, duration);
    this.timers.delete(timerId);
    
    return duration;
  }
  
  recordExecutionTime(operation: string, duration: number): void {
    // Manter rolling window dos últimos 1000 tempos
    const times = this.executionTimes.get(operation) || [];
    times.push(duration);
    if (times.length > 1000) times.shift();
    
    this.executionTimes.set(operation, times);
    this.updatePerformanceStats(operation, times);
  }
}
```

### 2. Estatísticas de Performance
```typescript
interface PerformanceStats {
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  samples: number;
}

private updatePerformanceStats(operation: string, times: number[]): void {
  const sorted = [...times].sort((a, b) => a - b);
  const stats: PerformanceStats = {
    average: times.reduce((a, b) => a + b) / times.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
    samples: times.length
  };
  
  this.performanceStats.set(operation, stats);
  
  // Alertar se P95 > threshold
  if (stats.p95 > this.getThreshold(operation)) {
    this.triggerPerformanceAlert(operation, stats.p95);
  }
}
```

## Monitoramento de API Externa

### 1. Health Checks Automáticos
```typescript
class ApiHealthMonitor {
  private endpointStatus = new Map<string, EndpointHealth>();
  
  async checkHotmartEndpoints(): Promise<void> {
    const endpoints = [
      'https://developers.hotmart.com/payments/api/v1/sales/history',
      'https://developers.hotmart.com/payments/api/v1/subscriptions',
      'https://developers.hotmart.com/payments/api/v1/products'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await this.makeHealthRequest(endpoint);
        const responseTime = Date.now() - startTime;
        
        this.recordEndpointHealth(endpoint, {
          status: response.status < 400 ? 'up' : 'down',
          responseTime,
          lastCheck: new Date(),
          errorCount: 0
        });
      } catch (error) {
        this.recordEndpointFailure(endpoint, error);
      }
    }
  }
  
  private recordEndpointFailure(endpoint: string, error: Error): void {
    const current = this.endpointStatus.get(endpoint);
    const errorCount = (current?.errorCount || 0) + 1;
    
    this.endpointStatus.set(endpoint, {
      status: 'down',
      responseTime: 0,
      lastCheck: new Date(),
      errorCount,
      lastError: error.message
    });
    
    // Alertar após 3 falhas consecutivas
    if (errorCount >= 3) {
      this.triggerApiDownAlert(endpoint, error);
    }
  }
}
```

### 2. Monitoramento de Rate Limits
```typescript
class RateLimitMonitor {
  private rateLimitStats = new Map<string, RateLimitStats>();
  
  recordRateLimit(endpoint: string, remainingRequests: number, resetTime: Date): void {
    this.rateLimitStats.set(endpoint, {
      remainingRequests,
      resetTime,
      lastUpdate: new Date()
    });
    
    // Alertar se próximo do limite
    if (remainingRequests < 10) {
      this.triggerRateLimitWarning(endpoint, remainingRequests);
    }
  }
}
```

## Analytics de Uso e Comportamento

### 1. Análise de Jornadas de Usuário
```typescript
class UsageAnalytics {
  analyzeUserJourney(commands: HistoryEntry[]): JourneyInsight[] {
    const sequences = this.extractCommandSequences(commands);
    const patterns = this.identifyCommonPatterns(sequences);
    
    return patterns.map(pattern => ({
      sequence: pattern.commands.join(' → '),
      frequency: pattern.count,
      averageTime: pattern.totalTime / pattern.count,
      successRate: pattern.successCount / pattern.count,
      dropOffPoints: this.identifyDropOffPoints(pattern)
    }));
  }
  
  private identifyDropOffPoints(pattern: CommandPattern): string[] {
    const dropOffs = [];
    
    for (let i = 0; i < pattern.commands.length - 1; i++) {
      const currentSuccess = pattern.stepSuccessRates[i];
      const nextSuccess = pattern.stepSuccessRates[i + 1];
      
      if (currentSuccess - nextSuccess > 0.2) { // 20% drop
        dropOffs.push(`${pattern.commands[i]} → ${pattern.commands[i + 1]}`);
      }
    }
    
    return dropOffs;
  }
}
```

### 2. Análise de Comandos Mais Usados
```typescript
class CommandPopularityAnalyzer {
  analyzeCommandFrequency(commands: HistoryEntry[]): CommandFrequency[] {
    const frequency = new Map<string, CommandStats>();
    
    commands.forEach(cmd => {
      const category = this.categorizeCommand(cmd.parsedIntention);
      const stats = frequency.get(category) || {
        count: 0,
        totalTime: 0,
        successCount: 0,
        errors: []
      };
      
      stats.count++;
      stats.totalTime += cmd.executionTime;
      if (cmd.success) stats.successCount++;
      else stats.errors.push(cmd.error);
      
      frequency.set(category, stats);
    });
    
    return Array.from(frequency.entries()).map(([command, stats]) => ({
      command,
      count: stats.count,
      percentage: stats.count / commands.length * 100,
      averageTime: stats.totalTime / stats.count,
      successRate: stats.successCount / stats.count,
      commonErrors: this.getCommonErrors(stats.errors)
    }));
  }
}
```

## Métricas de Qualidade NLP

### 1. Tracking de Confiança
```typescript
class NLPQualityMetrics {
  private nlpRecords: NLPRecord[] = [];
  
  recordNLPResult(
    command: string,
    parsedIntention: ParsedIntention,
    confidence: number,
    actualSuccess: boolean
  ): void {
    this.nlpRecords.push({
      command,
      parsedIntention,
      confidence,
      actualSuccess,
      timestamp: new Date()
    });
    
    // Manter apenas últimos 10.000 registros
    if (this.nlpRecords.length > 10000) {
      this.nlpRecords.shift();
    }
    
    this.updateNLPMetrics();
  }
  
  calculateNLPAccuracy(): NLPAccuracyReport {
    const totalRecords = this.nlpRecords.length;
    const successfulRecords = this.nlpRecords.filter(r => r.actualSuccess);
    
    const confidenceRanges = [
      { min: 0.9, max: 1.0, name: 'muito_alta' },
      { min: 0.7, max: 0.9, name: 'alta' },
      { min: 0.5, max: 0.7, name: 'media' },
      { min: 0.0, max: 0.5, name: 'baixa' }
    ];
    
    const accuracyByConfidence = confidenceRanges.map(range => {
      const recordsInRange = this.nlpRecords.filter(r => 
        r.confidence >= range.min && r.confidence < range.max
      );
      const successInRange = recordsInRange.filter(r => r.actualSuccess);
      
      return {
        confidenceRange: range.name,
        accuracy: recordsInRange.length > 0 ? successInRange.length / recordsInRange.length : 0,
        samples: recordsInRange.length
      };
    });
    
    return {
      overallAccuracy: successfulRecords.length / totalRecords,
      totalSamples: totalRecords,
      accuracyByConfidence,
      averageConfidence: this.nlpRecords.reduce((sum, r) => sum + r.confidence, 0) / totalRecords
    };
  }
}
```

### 2. Identificação de Patterns de Erro
```typescript
class ErrorPatternAnalyzer {
  identifyMisclassificationPatterns(failedRecords: NLPRecord[]): MisclassificationPattern[] {
    const patterns = new Map<string, MisclassificationPattern>();
    
    failedRecords.forEach(record => {
      const expected = this.inferExpectedIntention(record.command);
      const actual = record.parsedIntention;
      
      const patternKey = `${actual.resource}:${actual.action} → ${expected.resource}:${expected.action}`;
      
      const pattern = patterns.get(patternKey) || {
        from: `${actual.resource}:${actual.action}`,
        to: `${expected.resource}:${expected.action}`,
        count: 0,
        examples: []
      };
      
      pattern.count++;
      if (pattern.examples.length < 5) {
        pattern.examples.push(record.command);
      }
      
      patterns.set(patternKey, pattern);
    });
    
    return Array.from(patterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 misclassifications
  }
}
```

## Sistema de Alertas Configuráveis

### 1. Regras de Alerta Padrão
```typescript
class AlertSystem {
  setupDefaultRules(): void {
    // Performance degradada
    this.addRule({
      id: 'performance_degradation',
      type: 'performance',
      severity: 'warning',
      evaluate: (metrics) => ({
        triggered: metrics.averageResponseTime > 5000,
        message: `Tempo de resposta médio alto: ${metrics.averageResponseTime}ms`,
        metadata: { threshold: 5000, actual: metrics.averageResponseTime }
      })
    });
    
    // Taxa de erro alta
    this.addRule({
      id: 'high_error_rate',
      type: 'error', 
      severity: 'critical',
      evaluate: (metrics) => ({
        triggered: metrics.errorRate > 0.05,
        message: `Taxa de erro alta: ${(metrics.errorRate * 100).toFixed(1)}%`,
        metadata: { threshold: 0.05, actual: metrics.errorRate }
      })
    });
    
    // Qualidade NLP baixa
    this.addRule({
      id: 'nlp_quality_low',
      type: 'quality',
      severity: 'warning',
      evaluate: (metrics) => {
        const avgConfidence = metrics.nlpConfidenceScores.reduce((a, b) => a + b, 0) / 
                             metrics.nlpConfidenceScores.length;
        return {
          triggered: avgConfidence < 0.7,
          message: `Confiança NLP baixa: ${avgConfidence.toFixed(2)}`,
          metadata: { threshold: 0.7, actual: avgConfidence }
        };
      }
    });
    
    // API Hotmart down
    this.addRule({
      id: 'api_hotmart_down',
      type: 'api_down',
      severity: 'critical',
      evaluate: (metrics) => {
        const hotmartAvailability = metrics.apiAvailability.get('hotmart') || 0;
        return {
          triggered: hotmartAvailability < 0.95,
          message: `API Hotmart com baixa disponibilidade: ${(hotmartAvailability * 100).toFixed(1)}%`,
          metadata: { threshold: 0.95, actual: hotmartAvailability }
        };
      }
    });
  }
}
```

### 2. Dashboard de Saúde
```typescript
class HealthDashboard {
  generateHealthReport(): HealthReport {
    const metrics = this.collectCurrentMetrics();
    const apiHealth = this.checkApiHealth();
    const performance = this.analyzePerformance();
    const quality = this.assessQuality();
    
    return {
      systemStatus: this.calculateOverallStatus(metrics),
      performance: {
        averageResponseTime: metrics.averageResponseTime,
        p95ResponseTime: this.calculateP95(metrics.responseTimes),
        cacheHitRate: metrics.cacheHitRate,
        currentLoad: this.getCurrentLoad()
      },
      apiHealth: apiHealth,
      quality: {
        nlpAccuracy: quality.nlpAccuracy,
        userSatisfaction: quality.averageRating,
        commandSuccessRate: metrics.commandSuccessRate
      },
      alerts: this.getActiveAlerts(),
      recommendations: this.generateRecommendations(metrics),
      lastUpdated: new Date()
    };
  }
  
  private generateRecommendations(metrics: Metrics): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Cache hit rate baixo
    if (metrics.cacheHitRate < 0.5) {
      recommendations.push({
        type: 'performance',
        priority: 'alta',
        title: 'Melhorar taxa de cache',
        description: `Taxa de cache atual: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        action: 'Revisar TTL das operações mais utilizadas'
      });
    }
    
    // Comandos com baixa taxa de sucesso
    const lowSuccessCommands = this.identifyLowSuccessCommands(metrics);
    if (lowSuccessCommands.length > 0) {
      recommendations.push({
        type: 'quality',
        priority: 'média',
        title: 'Melhorar reconhecimento de comandos',
        description: `${lowSuccessCommands.length} tipos de comando com baixa taxa de sucesso`,
        action: 'Revisar padrões NLP para comandos com baixa precisão'
      });
    }
    
    return recommendations;
  }
}
```

## Logging Estruturado

### 1. Logger com Mascaramento
```typescript
class StructuredLogger {
  private sensitivePatterns = [
    /\b[\w\.-]+@[\w\.-]+\.\w+\b/g, // Emails
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Cartões de crédito
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
    /Bearer\s+[\w\-\.]+/g // Tokens
  ];
  
  log(level: LogLevel, category: string, message: string, metadata: any = {}): void {
    const sanitizedMessage = this.maskSensitiveData(message);
    const sanitizedMetadata = this.maskSensitiveData(JSON.stringify(metadata));
    
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message: sanitizedMessage,
      metadata: JSON.parse(sanitizedMetadata),
      sessionId: this.currentSessionId
    };
    
    this.writeLog(logEntry);
  }
  
  private maskSensitiveData(text: string): string {
    let masked = text;
    
    this.sensitivePatterns.forEach(pattern => {
      masked = masked.replace(pattern, '[MASKED]');
    });
    
    return masked;
  }
}
```

### 2. Correlação de Eventos
```typescript
class EventCorrelator {
  correlateEvents(sessionId: string, timeWindow: number = 300000): CorrelatedEvent[] {
    const sessionLogs = this.logs.filter(log => 
      log.sessionId === sessionId &&
      Date.now() - log.timestamp.getTime() < timeWindow
    );
    
    return this.groupRelatedEvents(sessionLogs);
  }
  
  private groupRelatedEvents(logs: LogEntry[]): CorrelatedEvent[] {
    const events = [];
    
    // Agrupar por operação
    const operationGroups = this.groupByOperation(logs);
    
    operationGroups.forEach(group => {
      events.push({
        operationId: group.operationId,
        startTime: group.logs[0].timestamp,
        endTime: group.logs[group.logs.length - 1].timestamp,
        steps: group.logs.map(log => ({
          timestamp: log.timestamp,
          category: log.category,
          message: log.message,
          level: log.level
        })),
        success: !group.logs.some(log => log.level === 'error'),
        duration: group.logs[group.logs.length - 1].timestamp.getTime() - 
                 group.logs[0].timestamp.getTime()
      });
    });
    
    return events;
  }
}
```

## Casos de Teste Críticos

### Coleta de Métricas
```
✅ Métricas coletadas sem impacto na performance
✅ Dados sensíveis mascarados corretamente
✅ Agregação estatística precisa
✅ Limpeza automática de dados antigos
```

### Sistema de Alertas
```
✅ Alertas disparados nos thresholds corretos
✅ Não spam de alertas (rate limiting)
✅ Alertas resolvidos automaticamente
✅ Metadados úteis incluídos nos alertas
```

### Monitoramento de API
```
✅ Health checks não sobrecarregam API
✅ Detecção automática de API down
✅ Rate limits monitorados corretamente
✅ Tempo de resposta rastreado
```

### Qualidade NLP
```
✅ Confiança vs precisão correlacionada
✅ Patterns de erro identificados
✅ Métricas de precisão calculadas corretamente
✅ Degradação de qualidade detectada
```

## Critérios de Aceitação

- [ ] **Coleta de métricas** sem impacto na performance (<5ms overhead)
- [ ] **Alertas configuráveis** com thresholds ajustáveis
- [ ] **Dashboard de saúde** atualizado em tempo real
- [ ] **Monitoramento de API** com detecção automática de problemas
- [ ] **Métricas de qualidade NLP** com tracking de precisão
- [ ] **Logging estruturado** com mascaramento de dados sensíveis
- [ ] **Recomendações automáticas** baseadas em dados coletados

## Integração com Outras RFCs

### Entrada (depende de):
- **RFC-001 a RFC-005:** Monitora todas as funcionalidades implementadas

### Saída (será usado por):
- **RFC-007:** Testes usam métricas para validação

## Dicas de Implementação

### 1. Coleta Assíncrona
```typescript
// Use workers ou queues para coleta não bloqueante
const metricsQueue = new Queue('metrics-collection');
metricsQueue.add('record-command', { command, timing });
```

### 2. Sampling em Alta Carga
```typescript
// Reduza coleta quando sistema sobrecarregado
const samplingRate = this.getCurrentLoad() > 0.8 ? 0.1 : 1.0;
if (Math.random() < samplingRate) {
  this.recordMetric(metric);
}
```

### 3. Agregação Inteligente
```typescript
// Pré-agregue dados para consultas rápidas
const hourlyStats = this.aggregateByHour(rawMetrics);
const dailyStats = this.aggregateByDay(hourlyStats);
```

### 4. Alertas com Contexto
```typescript
// Inclua contexto útil nos alertas
const alert = {
  message: 'Performance degradada',
  context: {
    currentValue: metrics.p95,
    threshold: 5000,
    trend: 'increasing',
    possibleCauses: ['high_load', 'api_latency']
  }
};
```

## Status de Entrega

Marque como completo quando:
- [ ] Sistema de coleta de métricas operacional
- [ ] Monitoramento de API Hotmart implementado
- [ ] Sistema de alertas configurável
- [ ] Dashboard de saúde funcional
- [ ] Logging estruturado com mascaramento
- [ ] Métricas de qualidade NLP coletadas
- [ ] Integração com todas as RFCs anteriores

**Próximo passo após conclusão:** Implementar RFC-007 (Testes e Validação)