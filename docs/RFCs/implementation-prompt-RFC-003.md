# Prompt de Implementação - RFC-003: Mapeamento Inteligente de Operações

## Contexto Geral

Você está implementando o **Sistema de Mapeamento Inteligente de Operações** para o projeto de transformação do node Hotmart em ferramenta compatível com MCP. Este é o RFC-003 de uma série sequencial.

**Pré-requisitos:** 
- RFC-001 (Estrutura Base MCP) implementada
- RFC-002 (Sistema de NLP) implementada e funcionando

## Objetivo Específico

Criar um sistema inteligente que traduz as intenções parseadas pelo NLP em operações específicas da API Hotmart, com otimizações automáticas, validação de permissões e agregação de dados quando necessário.

## Funcionalidades a Implementar

### 1. Mapeador Central de Operações
- Classe `OperationMapper` como orquestrador principal
- Mapear intenções do NLP para operações específicas da Hotmart
- Considerar contexto de execução e preferências do usuário
- Suportar mapeamento 1:1, 1:N e N:1

### 2. Otimizador de Execução 
- Classe `ExecutionOptimizer` para otimizações automáticas:
  - Paralelização de operações independentes
  - Batching de operações similares (cancelList vs cancel individual)
  - Cache inteligente com TTL por tipo de operação
  - Eliminação de redundâncias

### 3. Agregador de Dados
- Classe `DataAggregator` para análises complexas:
  - "Melhor produto" → combinar vendas + performance
  - "Relatório completo" → múltiplas APIs + formatação
  - Cálculos de KPIs e métricas derivadas

### 4. Validador de Permissões
- Classe `PermissionValidator` para controle de acesso:
  - Verificar permissões OAuth2 antes da execução
  - Sugerir alternativas quando permissão insuficiente
  - Implementar fallbacks gracioso

### 5. Sistema de Regras de Mapeamento
- Arquivo `mappingRules.ts` com regras por domínio:
  - Vendas: diferentes tipos de consulta e análise
  - Assinaturas: operações CRUD + análise de churn
  - Produtos: consulta + análise de performance
  - Cupons: criação + gestão + relatórios

## Especificações Técnicas Detalhadas

### Estrutura de Arquivos
```
nodes/Hotmart/v1/mapping/
├── OperationMapper.ts              # Mapeador principal
├── ExecutionOptimizer.ts           # Otimização de execução  
├── DataAggregator.ts              # Agregação e análise
├── PermissionValidator.ts          # Validação de permissões
├── mappingRules.ts                # Regras por domínio  
├── strategicMapping.ts            # Estratégias avançadas
└── types.ts                       # Interfaces de mapeamento
```

### Interfaces Principais
```typescript
interface MappedOperation {
  nodeOperation: string;           // 'sales:getHistoricoVendas'
  parameters: Record<string, any>; // Parâmetros da API
  postProcessing: PostProcessingRule[]; // Regras pós-execução
  dependencies: string[];          // Dependências de outras operações
  priority: number;               // Prioridade de execução
  cacheConfig?: CacheConfig;      // Configuração de cache
}

interface OptimizedExecutionPlan {
  parallelGroups: OperationGroup[]; // Operações paralelizáveis
  batchedOperations: BatchGroup[];  // Operações em lote
  sequentialOps: MappedOperation[]; // Operações sequenciais
  estimatedTime: number;           // Tempo estimado total
}

interface ExecutionContext {
  userIntent: ParsedIntention;      // Vem do RFC-002
  sessionContext: SessionContext;   // Contexto da sessão
  userPermissions: Permission[];    // Permissões OAuth2
  availableOperations: string[];    // Operações disponíveis
}
```

### Estratégias de Mapeamento

**1. Mapeamento Simples (1:1)**
```typescript
// "vendas do último mês" → sales:getHistoricoVendas
{
  pattern: 'vendas_consulta_simples',
  operation: 'sales:getHistoricoVendas',
  parameterMapping: {
    'periodo.start': 'startDate',
    'periodo.end': 'endDate'
  }
}
```

**2. Mapeamento Complexo (1:N)**  
```typescript
// "relatório de vendas completo" → múltiplas operações
{
  pattern: 'vendas_relatorio_completo',
  operations: [
    'sales:getHistoricoVendas',    // Dados básicos
    'sales:getComissoesVendas',    // Comissões  
    'sales:getParticipantesVendas' // Participantes
  ],
  aggregation: 'buildComprehensiveSalesReport'
}
```

**3. Mapeamento Otimizado (N:1)**
```typescript
// Múltiplas consultas de assinatura → uma chamada otimizada
{
  conditions: ['subscription:getActive', 'subscription:getCancelled'],
  optimization: 'subscription:getAll',
  postProcessing: 'splitByStatus'
}
```

## Regras de Implementação

### 1. Priorização de Otimizações
- **Batch sempre que possível:** `cancelList` vs múltiplos `cancel`
- **Paralelizar operações independentes:** vendas + produtos em paralelo
- **Cache inteligente:** TTL baseado na volatilidade dos dados
- **Fallback gracioso:** alternativas quando operação não disponível

### 2. Validação de Permissões
- **Verificar antes de executar:** evitar chamadas falhas
- **Sugerir alternativas:** operação read quando write não permitida
- **Mensagens claras:** explicar que permissão é necessária

### 3. Agregação de Dados
- **Calcular KPIs automaticamente:** taxa de conversão, ticket médio
- **Análise temporal:** comparar com períodos anteriores
- **Insights automáticos:** detectar tendências e padrões

### 4. Performance e Cache
- **Cache por operação:** TTL específico por tipo de dados
- **Invalidação inteligente:** limpar cache após operações de escrita
- **Compressão de dados:** reduzir uso de memória

## Casos de Uso Prioritários

### 1. Mapeamento Simples
```typescript
// Input: {resource: 'vendas', action: 'consultar', parameters: {periodo: ...}}
// Output: {nodeOperation: 'sales:getHistoricoVendas', parameters: {...}}
```

### 2. Otimização de Lote  
```typescript
// Input: [{cancelar: assinatura1}, {cancelar: assinatura2}, ...]
// Output: {nodeOperation: 'subscription:cancelList', parameters: {ids: [...]}}
```

### 3. Agregação Complexa
```typescript
// Input: "melhor produto do mês"
// Output: [sales:getHistoricoVendas, sales:getResumoVendas] → análise
```

### 4. Validação e Fallback
```typescript
// Input: cancelar assinatura (sem permissão subscription:write)
// Output: sugestão para subscription:getAll + instruções manuais
```

## Sistema de Cache Inteligente

### Configurações por Tipo
```typescript
const CACHE_CONFIG = {
  'sales:getHistoricoVendas': { ttl: 300000, maxSize: 1024 * 100 }, // 5min
  'product:getAll': { ttl: 3600000, maxSize: 1024 * 50 },           // 1h
  'subscription:getAll': { ttl: 180000, maxSize: 1024 * 200 },      // 3min
  'subscription:getSummary': { ttl: 600000, maxSize: 1024 * 20 }    // 10min
};
```

### Invalidação Inteligente
```typescript
// Após cancelar assinatura, invalidar cache de subscription:*
// Após criar cupom, invalidar cache de coupon:*
```

## Agregações e Análises Automáticas

### 1. Análise de Performance de Produtos
```typescript
aggregateProductPerformance(salesData, summaryData) {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    totalRevenue: calculateTotalRevenue(product),
    averageValue: calculateAverageValue(product),
    conversionRate: calculateConversionRate(product),
    trend: calculateTrend(product),
    ranking: calculateRanking(product, allProducts)
  }));
}
```

### 2. Análise de Saúde de Assinaturas
```typescript
analyzeSubscriptionHealth(subscriptions, transactions) {
  return {
    activeCount: countBy(subscriptions, 'active'),
    churnRate: calculateChurnRate(subscriptions, previousPeriod),
    revenueAtRisk: calculateRevenueAtRisk(subscriptions),
    healthScore: calculateOverallHealthScore(subscriptions),
    recommendations: generateActionRecommendations(analysis)
  };
}
```

## Tratamento de Casos Especiais

### 1. Comandos Impossíveis
```typescript
// "cancelar todas as vendas" → não é possível
// Retornar: alternativas viáveis + explicação
```

### 2. Operações Destrutivas
```typescript
// "cancelar todas as assinaturas" → confirmar antes
// Implementar: confirmação obrigatória + rollback se possível
```

### 3. Rate Limits
```typescript
// Detectar rate limit da Hotmart → reagendar operações
// Implementar: exponential backoff + notificação ao usuário
```

## Casos de Teste Críticos

### Otimização de Lote
```
✅ Múltiplas consultas de assinatura → uma chamada getAll
✅ Múltiplos cancelamentos → usar cancelList  
✅ Verificar que otimização mantém resultado correto
```

### Validação de Permissões
```
✅ Operação sem permissão → sugerir alternativa
✅ Operação read → executar normalmente
✅ Operação write sem permissão → bloquear + sugerir
```

### Agregação de Dados
```
✅ "Melhor produto" → combinar múltiplas APIs
✅ "Relatório vendas" → agregação completa
✅ Cálculos de KPIs corretos
```

## Critérios de Aceitação

- [ ] **Todas as operações Hotmart mapeadas** corretamente
- [ ] **Otimização automática funciona** (>30% melhoria nos casos alvo)
- [ ] **Validação de permissões** bloqueia operações não autorizadas
- [ ] **Cache inteligente** com >60% de hit rate
- [ ] **Agregações automáticas** produzem insights úteis
- [ ] **Tratamento de erros** gracioso e informativo

## Integração com Outras RFCs

### Entrada (depende de):
- **RFC-001:** Usa estrutura base MCP
- **RFC-002:** Recebe `ParsedIntention` do NLP

### Saída (será usado por):
- **RFC-004:** Contexto usa histórico de operações mapeadas
- **RFC-005:** Formatação recebe dados agregados para apresentar
- **RFC-006:** Monitoramento rastreia performance das otimizações

## Dicas de Implementação

### 1. Comece pelo Mapeamento 1:1
Implemente primeiro os casos simples, depois expanda para otimizações.

### 2. Use Strategy Pattern
```typescript
interface MappingStrategy {
  canHandle(intention: ParsedIntention): boolean;
  map(intention: ParsedIntention, context: ExecutionContext): MappedOperation[];
}
```

### 3. Cache com Chave Inteligente
```typescript
generateCacheKey(operation: string, params: any): string {
  // Normalizar parâmetros para chave estável
  const normalized = normalizeForCache(params);
  return `${operation}:${hash(normalized)}`;
}
```

### 4. Logging Detalhado
Log todas as otimizações aplicadas para debug e análise posterior.

### 5. Métricas de Performance
Meça tempo antes/depois das otimizações para validar benefícios.

## Status de Entrega

Marque como completo quando:
- [ ] Mapeador principal implementado e testado
- [ ] Otimizações automáticas funcionando
- [ ] Sistema de cache operacional
- [ ] Validação de permissões completa
- [ ] Agregações principais implementadas
- [ ] Integração com RFC-002 validada

**Próximo passo após conclusão:** Implementar RFC-004 (Sistema de Contexto e Memória)