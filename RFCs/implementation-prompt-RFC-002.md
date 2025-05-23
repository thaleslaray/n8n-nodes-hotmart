# Prompt de Implementação - RFC-002: Sistema de Processamento de Linguagem Natural

## Contexto Geral

Você está implementando o **Sistema de Processamento de Linguagem Natural** para o projeto de transformação do node Hotmart em ferramenta compatível com MCP (Model Context Protocol). Este é o RFC-002 de uma série sequencial que deve ser implementada em ordem.

**Pré-requisitos:** RFC-001 (Estrutura Base MCP) deve estar implementada.

## Objetivo Específico

Implementar um sistema robusto de processamento de linguagem natural que permita aos infoprodutores brasileiros interagirem com a API da Hotmart usando comandos em português natural, sem conhecimento técnico.

## Funcionalidades a Implementar

### 1. Processador Central de Linguagem Natural
- Classe `NaturalLanguageProcessor` como ponto de entrada
- Parser de intenções com padrões regex otimizados para português brasileiro
- Sistema de normalização de texto (acentos, variações)
- Detector de confiança nas interpretações

### 2. Extrator de Parâmetros Inteligente
- Classe `ParameterExtractor` especializada em:
  - Períodos temporais ("último mês", "janeiro de 2024", "ontem")
  - Valores monetários ("R$ 1.500,00", "acima de mil reais")  
  - Referências de produtos ("curso de marketing", "produto ID 123")
  - Critérios de filtro ("assinaturas em atraso", "vendas canceladas")

### 3. Mapeamento de Linguagem para API
- Dicionário `LANGUAGE_MAPPINGS` com traduções pt-BR → API:
  - Ações: "mostrar" → "get", "cancelar" → "cancel"
  - Recursos: "vendas" → "sales", "assinaturas" → "subscriptions"
  - Estados: "ativo" → "active", "cancelado" → "cancelled"

### 4. Sistema de Validação Contextual
- Classe `ContextualValidator` para validações de negócio
- Regras específicas por tipo de operação
- Verificação de parâmetros obrigatórios
- Sugestões quando parâmetros estão faltando

### 5. Tratamento de Ambiguidades
- Classe `AmbiguityResolver` para detectar comandos ambíguos
- Sistema de prompts de clarificação em português
- Fallbacks inteligentes baseados em contexto

## Especificações Técnicas Detalhadas

### Estrutura de Arquivos
```
nodes/Hotmart/v1/nlp/
├── NaturalLanguageProcessor.ts          # Classe principal
├── IntentionParser.ts                   # Parser de intenções  
├── ParameterExtractor.ts                # Extração de parâmetros
├── ContextualValidator.ts               # Validação contextual
├── AmbiguityResolver.ts                 # Resolução de ambiguidades
├── languageMappings.ts                  # Mapeamentos pt-BR → API
└── types.ts                            # Interfaces TypeScript
```

### Interfaces Principais
```typescript
interface ParsedIntention {
  resource: 'vendas' | 'assinaturas' | 'produtos' | 'cupons' | 'comissoes';
  action: 'consultar' | 'gerenciar' | 'analisar' | 'executar';
  operation: string;
  parameters: Record<string, any>;
  confidence: number;
  needsClarification?: boolean;
  clarificationPrompt?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestions?: string[];
  requiredParameters?: string[];
}
```

### Padrões de Comando Prioritários

**MUST HAVE (implementar primeiro):**
1. "Vendas do [período]" → `sales:getHistoricoVendas`
2. "Assinaturas [status]" → `subscription:getAll` + filtro
3. "Cancelar assinatura [critério]" → `subscription:cancel` ou `cancelList`
4. "Produtos [filtro]" → `product:getAll` + filtro
5. "Criar cupom [parâmetros]" → `coupon:create`

**SHOULD HAVE (implementar depois):**
6. Comandos de análise ("melhor produto", "receita total")  
7. Comandos temporais complexos ("compare com mês anterior")
8. Comandos com múltiplos filtros

## Regras de Implementação

### 1. Padrões de Linguagem Natural
- **Sempre em português brasileiro:** Use terminologia local
- **Aceitar variações:** "mostrar", "exibir", "listar" → mesmo resultado
- **Flexibilidade temporal:** "ontem", "dia 15", "15/01/2024" → todos válidos
- **Tolerância a erros:** Aceitar pequenos erros de digitação

### 2. Tratamento de Confiança
- **Confiança > 0.8:** Executar diretamente
- **Confiança 0.6-0.8:** Confirmar com usuário 
- **Confiança < 0.6:** Solicitar clarificação

### 3. Validação de Negócio
- **Assinaturas:** Validar que cancelamentos tem critério específico
- **Cupons:** Validar parâmetros obrigatórios (nome, desconto, validade)
- **Vendas:** Validar ranges de data válidos

### 4. Performance  
- **Parse < 100ms:** Processamento deve ser rápido
- **Cache de padrões:** Reutilizar compilações regex
- **Lazy loading:** Carregar mapeamentos sob demanda

## Casos de Teste Críticos

### Comandos de Vendas
```
✅ "Mostre as vendas do último mês"
✅ "Vendas de janeiro de 2024" 
✅ "Listar vendas acima de R$ 500"
✅ "Vendas do produto Curso X"
```

### Comandos de Assinaturas
```
✅ "Assinaturas ativas"
✅ "Cancelar assinaturas em atraso"
✅ "Reativar assinatura do cliente joão@email.com"
✅ "Assinaturas que vencem esta semana"
```

### Tratamento de Ambiguidades
```
✅ "Mostre os dados" → Pedir especificação
✅ "Cancelar tudo" → Confirmar ação destrutiva  
✅ "Produto" → Perguntar qual produto
```

## Critérios de Aceitação

- [ ] **Taxa de Reconhecimento > 85%** para comandos básicos
- [ ] **Tempo de Processamento < 100ms** por comando
- [ ] **Suporte completo ao português brasileiro** (acentos, variações)
- [ ] **Tratamento gracioso de ambiguidades** com prompts claros
- [ ] **Validação contextual** para todos os tipos de operação
- [ ] **Testes unitários** cobrindo todos os padrões principais

## Integração com Outras RFCs

### Entrada (depende de):
- **RFC-001:** Usa a estrutura base MCP já implementada

### Saída (será usado por):
- **RFC-003:** Mapping usa as intenções parseadas pelo NLP
- **RFC-004:** Contexto usa histórico de comandos processados
- **RFC-005:** Formatação adapta resposta ao comando original

## Dicas de Implementação

### 1. Comece Pelos Casos Simples
Implemente primeiro os comandos mais diretos e depois expanda para casos complexos.

### 2. Use Regex Compiladas
```typescript
const PATTERNS = {
  vendas: new RegExp('(mostrar|listar|ver)\\s+(vendas|receita)', 'i'),
  periodo: new RegExp('(ontem|hoje|\\d{1,2}/\\d{1,2}/\\d{4})', 'i')
};
```

### 3. Normalize Entrada Sempre
```typescript
private normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
}
```

### 4. Validação de Parâmetros Específica por Domínio
Cada recurso (vendas, assinaturas, etc.) tem regras de validação específicas.

### 5. Feedback Rico para Ambiguidades
Sempre ofereça opções claras quando o comando for ambíguo:
```
"Você quer dizer:
1. Consultar vendas
2. Analisar performance  
3. Gerar relatório?"
```

## Status de Entrega

Marque como completo quando:
- [ ] Todas as classes implementadas e testadas
- [ ] Taxa de reconhecimento atende critério (>85%)
- [ ] Performance atende critério (<100ms)
- [ ] Integração com RFC-001 funcionando
- [ ] Preparado para RFC-003 usar as saídas

**Próximo passo após conclusão:** Implementar RFC-003 (Mapeamento Inteligente de Operações)