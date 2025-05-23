# Prompt de Implementação - RFC-004: Sistema de Contexto e Memória

## Contexto Geral

Você está implementando o **Sistema de Contexto e Memória** para o projeto de transformação do node Hotmart em ferramenta compatível com MCP. Este é o RFC-004 de uma série sequencial.

**Pré-requisitos:** 
- RFC-001 (Estrutura Base MCP) implementada
- RFC-002 (Sistema de NLP) implementada  
- RFC-003 (Mapeamento de Operações) implementada

## Objetivo Específico

Criar um sistema de contexto e memória que permite conversas fluidas e naturais, mantendo histórico de comandos, resolvendo referências ("isso", "mesmo produto"), persistindo preferências do usuário e oferecendo continuidade entre sessões.

## Funcionalidades a Implementar

### 1. Gerenciador de Sessão
- Classe `SessionManager` como controlador principal
- Criação, manutenção e limpeza de sessões
- Persistência de contexto entre interações
- Controle de expiração e limpeza automática

### 2. Resolvedor de Referências
- Classe `ReferenceResolver` para resolver pronomes e referências:
  - "isso" → último item mostrado
  - "mesmo produto" → produto da consulta anterior  
  - "igual período" → mesmo range de datas
  - "aquele cliente" → cliente mencionado antes

### 3. Gerenciador de Preferências
- Classe `PreferenceManager` para preferências do usuário:
  - Formatação (moeda, data, números)
  - Comportamento padrão (período, verbosidade)
  - Filtros favoritos e produtos frequentes
  - Aprendizado implícito de preferências

### 4. Cache Inteligente de Resultados
- Classe `IntelligentCache` para cache context-aware:
  - TTL específico por tipo de operação
  - Invalidação baseada em dependências
  - Compressão e otimização de armazenamento
  - Cache de resultados para continuidade

### 5. Sistema de Continuidade de Conversação
- Classe `ConversationContinuity` para comandos de follow-up:
  - "Mostre mais detalhes" → expandir último resultado
  - "Compare com mês anterior" → usar mesmos parâmetros
  - "Exportar isso" → gerar relatório do último resultado
  - "Continue de onde parou" → retomar operação

## Especificações Técnicas Detalhadas

### Estrutura de Arquivos
```
nodes/Hotmart/v1/context/
├── SessionManager.ts              # Gerenciamento de sessões
├── ReferenceResolver.ts           # Resolução de referências
├── PreferenceManager.ts           # Gestão de preferências
├── IntelligentCache.ts           # Cache contextual
├── ConversationContinuity.ts     # Continuidade de conversa
├── ContextStorage.ts             # Persistência de contexto  
├── OperationStateManager.ts      # Estado de operações longas
└── types.ts                      # Interfaces de contexto
```

### Interfaces Principais
```typescript
interface SessionContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  commandHistory: HistoryEntry[];
  currentContext: ConversationContext;
  userPreferences: UserPreferences;
  resultCache: Map<string, CachedResult>;
  pendingOperations: PendingOperation[];
}

interface ConversationContext {
  lastProduct?: string;           // Último produto mencionado
  lastDateRange?: DateRange;      // Último período usado
  lastResults: any[];            // Últimos resultados  
  activeFilters: Record<string, any>; // Filtros ativos
  referencePoints: Map<string, any>;  // Pontos de referência
}

interface UserPreferences {
  currency: 'BRL' | 'USD' | 'EUR';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  verbosity: 'concise' | 'detailed' | 'verbose';
  defaultPeriod: 'last_month' | 'current_month' | 'last_7_days';
  autoConfirm: boolean;
  favoriteProducts: string[];
  defaultFilters: Record<string, any>;
}
```

### Sistema de Referências

**1. Referências Pronominais**
```typescript
// "Mostre vendas do curso X" → "Mostre mais detalhes disso"
// "isso" resolve para "curso X"
const pronouns = {
  'isso': 'last_item',
  'esta': 'last_item', 
  'aquilo': 'previous_item',
  'mesmo produto': 'last_product',
  'igual período': 'last_date_range'
};
```

**2. Referências Temporais Relativas**
```typescript
// "Vendas de janeiro" → "Compare com o mesmo período do ano passado"
// "mesmo período" resolve para janeiro do ano anterior
```

**3. Referências de Entidade**
```typescript
// "Assinaturas do cliente João" → "Cancelar as assinaturas dele"  
// "dele" resolve para "cliente João"
```

## Regras de Implementação

### 1. Gerenciamento de Sessão
- **Criação automática:** Nova sessão para cada usuário/contexto MCP
- **Expiração configurável:** 24h de inatividade por padrão
- **Limpeza automática:** Sessões expiradas removidas periodicamente
- **Persistência opcional:** File system ou Redis conforme configuração

### 2. Resolução de Referências
- **Prioridade por proximidade:** Referência mais recente tem prioridade
- **Validação de contexto:** Verificar se referência ainda é válida
- **Fallback gracioso:** Pedir clarificação se referência ambígua
- **Tracking de uso:** Rastrear quais referências são mais usadas

### 3. Aprendizado de Preferências
- **Implícito:** Aprender com padrões de uso ("sempre pede detalhes")
- **Explícito:** Comandos diretos ("sempre mostrar em reais")
- **Adaptação gradual:** Ajustar preferências com base no histórico
- **Reset:** Possibilidade de limpar/resetar preferências

### 4. Cache Contextual
- **Associação por sessão:** Cache específico por usuário
- **TTL variável:** Tempo de vida baseado no tipo de dados
- **Invalidação inteligente:** Limpar cache quando contexto muda
- **Compressão:** Otimizar uso de memória

## Sistema de Continuidade

### 1. Comandos de Continuação
```typescript
const CONTINUATION_PATTERNS = {
  'mais detalhes': 'expand_last_result',
  'detalhar': 'expand_last_result',
  'exportar': 'export_last_result',
  'relatório': 'report_last_result',
  'comparar': 'compare_with_context'
};
```

### 2. Comandos de Comparação
```typescript
const COMPARISON_PATTERNS = {
  'vs mês anterior': 'compare_previous_month',
  'comparar com': 'compare_with_specified',
  'diferença para': 'calculate_difference',
  'tendência': 'show_trend_analysis'
};
```

### 3. Comandos de Refinamento
```typescript
const REFINEMENT_PATTERNS = {
  'filtrar por': 'add_filter_to_last',
  'somente': 'apply_restriction',
  'exceto': 'exclude_from_last',
  'ordenar por': 'reorder_last_result'
};
```

## Persistência de Contexto

### 1. Armazenamento por Sessão
```typescript
// FileContextStorage - para desenvolvimento/testes
class FileContextStorage implements ContextStorage {
  private storageDir = './context-storage';
  
  async saveSession(sessionId: string, context: SessionContext): Promise<void>;
  async loadSession(sessionId: string): Promise<SessionContext | null>;
  async cleanExpiredSessions(): Promise<void>;
}

// RedisContextStorage - para produção (opcional)
class RedisContextStorage implements ContextStorage {
  // Implementação com Redis para alta performance
}
```

### 2. Compressão e Otimização
```typescript
// Comprimir histórico mantendo apenas informações essenciais
compressHistory(history: HistoryEntry[]): CompressedHistory {
  return {
    recent: history.slice(-10), // Últimos 10 comandos completos
    summary: this.summarizeOlder(history.slice(0, -10))
  };
}
```

## Casos de Uso Prioritários

### 1. Continuidade Simples
```
Usuário: "Vendas de dezembro"
Sistema: [executa e mostra resultado]
Usuário: "Mostre mais detalhes"
Sistema: [expande resultado anterior com informações detalhadas]
```

### 2. Referência Contextual
```
Usuário: "Produtos mais vendidos"
Sistema: [mostra lista de produtos]
Usuário: "Quanto faturou o primeiro da lista?"
Sistema: [resolve "primeiro da lista" para produto específico]
```

### 3. Comparação Temporal
```
Usuário: "Vendas de janeiro"
Sistema: [mostra dados de janeiro]
Usuário: "Compare com dezembro"
Sistema: [mostra comparação janeiro vs dezembro]
```

### 4. Preferências Aprendidas
```
Usuário: [sempre pede valores em reais formatados]
Sistema: [aprende e aplica formatação automaticamente]
```

## Sistema de Estado de Operações

### 1. Operações Longas
```typescript
interface PendingOperation {
  operationId: string;
  type: 'single' | 'batch' | 'analysis';
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: Date;
  estimatedCompletion?: Date;
  results?: Partial<any>;
}
```

### 2. Controle de Estado
```typescript
// "Pausar operação" - para operações longas
// "Continuar de onde parou" - retomar operação pausada  
// "Status da operação X" - verificar progresso
```

## Casos de Teste Críticos

### Resolução de Referências
```
✅ "isso" resolve para último item mostrado
✅ "mesmo produto" resolve para último produto consultado
✅ "igual período" usa mesmo range de datas
✅ Referência ambígua pede clarificação
```

### Continuidade de Conversação
```
✅ "Mais detalhes" expande último resultado
✅ "Compare com X" usa contexto anterior
✅ "Filtrar por Y" aplica filtro ao último resultado
✅ Comandos encadeados mantêm contexto
```

### Persistência de Preferências
```
✅ Preferências salvas corretamente
✅ Preferências aplicadas automaticamente
✅ Aprendizado implícito funciona
✅ Reset de preferências limpa tudo
```

### Cache Contextual
```
✅ Cache hit funciona corretamente
✅ Invalidação remove dados corretos
✅ TTL respeitado por tipo de operação
✅ Compressão mantém dados essenciais
```

## Critérios de Aceitação

- [ ] **Resolução de referências >90%** de acerto
- [ ] **Continuidade de conversação** funciona para comandos principais
- [ ] **Persistência de contexto** mantém dados entre sessões
- [ ] **Cache contextual** com >70% hit rate
- [ ] **Preferências do usuário** aprendidas e aplicadas
- [ ] **Limpeza automática** de contexto expirado
- [ ] **Performance** < 200ms adicional por comando

## Integração com Outras RFCs

### Entrada (depende de):
- **RFC-001:** Estrutura base MCP
- **RFC-002:** Comandos parseados pelo NLP
- **RFC-003:** Operações mapeadas e executadas

### Saída (será usado por):
- **RFC-005:** Formatação usa preferências e contexto
- **RFC-006:** Monitoramento rastreia uso de contexto
- **RFC-007:** Testes validam continuidade

## Dicas de Implementação

### 1. Comece com Referências Simples
Implemente "isso", "último" primeiro, depois expanda para casos complexos.

### 2. Use Weak References
```typescript
// Para evitar memory leaks com objetos grandes
const weakRef = new WeakRef(largeObject);
```

### 3. Cache com LRU
```typescript
// Implement LRU cache para limitar uso de memória
class LRUCache<K, V> {
  private maxSize: number;
  private cache = new Map<K, V>();
}
```

### 4. Compressão Seletiva
Comprima apenas dados antigos, mantenha dados recentes completos.

### 5. Logging de Contexto
Log mudanças de contexto para debug e análise de padrões.

## Status de Entrega

Marque como completo quando:
- [ ] Gerenciador de sessão operacional
- [ ] Resolução de referências funcionando
- [ ] Sistema de preferências implementado
- [ ] Cache contextual com performance adequada
- [ ] Continuidade de conversação validada
- [ ] Persistência funcionando (file ou Redis)
- [ ] Integração com RFCs anteriores testada

**Próximo passo após conclusão:** Implementar RFC-005 (Interface de Linguagem Natural)