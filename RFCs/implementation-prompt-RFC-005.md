# Prompt de Implementação - RFC-005: Interface de Linguagem Natural

## Contexto Geral

Você está implementando a **Interface de Linguagem Natural** para o projeto de transformação do node Hotmart em ferramenta compatível com MCP. Este é o RFC-005 de uma série sequencial.

**Pré-requisitos:** 
- RFC-001 (Estrutura Base MCP) implementada
- RFC-002 (Sistema de NLP) implementada  
- RFC-003 (Mapeamento de Operações) implementada
- RFC-004 (Sistema de Contexto) implementada

## Objetivo Específico

Transformar as respostas técnicas da API Hotmart em comunicação fluída, compreensível e acionável em português brasileiro, adaptada ao contexto do usuário, suas preferências e perfil de negócio.

## Funcionalidades a Implementar

### 1. Formatador de Resposta Contextual
- Classe `ResponseFormatter` como orquestrador principal
- Adaptação de tom baseada em audiência (iniciante/avançado)
- Formatação cultural brasileira (moeda, datas, números)
- Estruturação de resposta (resumo + detalhes + insights + ações)

### 2. Sistema de Templates Dinâmicos
- Arquivo `responseTemplates.ts` com templates por contexto:
  - Vendas: resumos positivos/neutros/preocupantes
  - Assinaturas: status saudável/atenção/crítico
  - Produtos: performance/análise/comparação
  - Erros: mensagens claras e acionáveis

### 3. Gerador de Insights Automáticos
- Classe `InsightGenerator` para observações relevantes:
  - Padrões nos dados (80/20, sazonalidade)
  - Tendências temporais (crescimento, declínio)
  - Benchmarks e comparações
  - Oportunidades identificadas automaticamente

### 4. Motor de Sugestões de Ações
- Classe `ActionSuggestionEngine` para próximos passos:
  - Ações baseadas em problemas identificados
  - Oportunidades de otimização
  - Comandos sugeridos para execução
  - Priorização automática por impacto

### 5. Adaptador Cultural Brasileiro
- Classe `BrazilianFormatter` para formatação nativa:
  - Valores monetários em reais (R$ 1.500,00)
  - Datas em formato brasileiro (15/01/2024)
  - Números com separadores brasileiros (1.000,50)
  - Expressões e linguagem cultural apropriada

## Especificações Técnicas Detalhadas

### Estrutura de Arquivos
```
nodes/Hotmart/v1/formatting/
├── ResponseFormatter.ts           # Formatador principal
├── ToneAdapter.ts                # Adaptação de tom
├── BrazilianFormatter.ts         # Formatação cultural
├── InsightGenerator.ts           # Geração de insights
├── ActionSuggestionEngine.ts     # Sugestões de ações
├── PersonalizedResponseGenerator.ts # Personalização por perfil
├── responseTemplates.ts          # Templates por contexto
└── types.ts                      # Interfaces de formatação
```

### Interfaces Principais
```typescript
interface FormattedResponse {
  summary: string;              // Resumo em uma frase
  details: string;             // Informações detalhadas
  insights: string[];          // Observações importantes
  actions: ActionSuggestion[]; // Próximos passos sugeridos
  rawData?: any;              // Dados originais se solicitado
  tone: 'positive' | 'neutral' | 'concerning' | 'critical';
}

interface FormattingContext {
  originalCommand: string;
  userIntent: 'consulta' | 'análise' | 'ação' | 'relatório';
  verbosity: 'concisa' | 'normal' | 'detalhada';
  audience: 'iniciante' | 'intermediário' | 'avançado';
  urgency: 'baixa' | 'normal' | 'alta';
}

interface ActionSuggestion {
  action: string;             // Ação sugerida
  description: string;        // Descrição da ação
  command?: string;          // Comando para executar
  priority: 'alta' | 'média' | 'baixa';
  impact: 'alto' | 'médio' | 'baixo';
}
```

### Sistema de Templates por Contexto

**1. Templates de Vendas**
```typescript
const SALES_TEMPLATES = {
  summary: {
    positive: "Excelente! Você teve {total_vendas} vendas totalizando {receita_total} em {periodo}. 🎉",
    neutral: "Você teve {total_vendas} vendas totalizando {receita_total} em {periodo}.",
    concerning: "Atenção: apenas {total_vendas} vendas ({receita_total}) em {periodo}. Vamos analisar o que pode ser melhorado. ⚠️"
  },
  
  details: `
📊 **Resumo de Vendas - {periodo}**

💰 **Financeiro:**
• Receita total: {receita_total}
• Ticket médio: {ticket_medio}
• Melhor dia: {melhor_dia} ({vendas_melhor_dia} vendas)

📈 **Performance:**
• Total de vendas: {total_vendas}
• Produtos mais vendidos: {top_produtos}
• Taxa de conversão: {taxa_conversao}%

{insights_section}
  `,

  insights: [
    "Seu ticket médio está {variacao_ticket}% {direcao} em relação ao mês anterior",
    "O produto '{produto_destaque}' representa {percentual}% das suas vendas",
    "Vendas de final de semana são {percentual_weekend}% {direcao_weekend} que dias úteis"
  ]
};
```

**2. Templates de Assinaturas**
```typescript  
const SUBSCRIPTION_TEMPLATES = {
  summary: {
    healthy: "Suas assinaturas estão saudáveis: {assinaturas_ativas} ativas gerando {receita_recorrente}/mês. ✅",
    attention: "Atenção: {assinaturas_problema} assinaturas precisam de cuidado (churn de {taxa_churn}%). ⚠️",
    critical: "Situação crítica: {assinaturas_risco} assinaturas em risco alto ({receita_risco} em perigo). 🚨"
  },

  details: `
🔄 **Status das Assinaturas**

✅ **Ativas:** {assinaturas_ativas}
   • Receita recorrente: {receita_recorrente}/mês
   • Próximas renovações: {proximas_renovacoes}

⚠️  **Requerem Atenção:** {assinaturas_problema}
   • Em atraso: {em_atraso}
   • Cancelamento solicitado: {cancelamento_pendente}
   • Problemas de pagamento: {problemas_pagamento}

📊 **Métricas Chave:**
   • Taxa de retenção: {taxa_retencao}%
   • Vida útil média: {lifetime_medio} meses
   • Churn rate: {taxa_churn}%
  `
};
```

## Regras de Implementação

### 1. Formatação Cultural Brasileira
- **Moeda:** R$ 1.500,00 (não $1500.00)
- **Datas:** 15/01/2024 (não 2024-01-15)
- **Números:** 1.500,75 (separador decimal vírgula)
- **Percentuais:** 15,5% (não 15.5%)

### 2. Adaptação de Tom
- **Iniciante:** Explicar termos técnicos, linguagem simples
- **Intermediário:** Balanceamento entre simplicidade e precisão
- **Avançado:** Usar terminologia técnica, métricas detalhadas
- **Contexto:** Adaptar urgência baseada nos dados

### 3. Estrutura de Resposta
- **Resumo:** Máximo 2 frases, destaque principal
- **Detalhes:** Organizado por seções, fácil escaneamento
- **Insights:** 2-4 observações relevantes, não óbvias
- **Ações:** 2-3 sugestões priorizadas por impacto

### 4. Geração de Insights
- **Padrões temporais:** Detectar sazonalidade, tendências
- **Concentração:** Regra 80/20 em produtos/clientes
- **Benchmarks:** Comparar com períodos anteriores
- **Oportunidades:** Identificar potencial não explorado

## Sistema de Personalização por Perfil

### 1. Tipos de Negócio
```typescript
const BUSINESS_TERMINOLOGY = {
  'curso_online': {
    customer: 'aluno',
    purchase: 'matrícula', 
    revenue: 'receita de cursos',
    product: 'curso'
  },
  'ebook': {
    customer: 'leitor',
    purchase: 'venda',
    revenue: 'receita de vendas',
    product: 'ebook'
  },
  'consultoria': {
    customer: 'cliente',
    purchase: 'contratação',
    revenue: 'faturamento',
    product: 'serviço'
  }
};
```

### 2. Adaptação por Experiência
```typescript
// Para usuários iniciantes
simplifyTechnicalTerms(text: string): string {
  return text
    .replace(/churn rate/gi, 'taxa de cancelamento')
    .replace(/lifetime value/gi, 'valor total por cliente')
    .replace(/conversion rate/gi, 'taxa de conversão (visitantes que compraram)');
}

// Para usuários avançados  
addTechnicalDetails(response: FormattedResponse): FormattedResponse {
  // Adicionar métricas avançadas, fórmulas, correlações
}
```

## Geração de Insights Inteligentes

### 1. Análise de Padrões
```typescript
class PatternAnalyzer {
  detectConcentration(data: SalesData[]): Insight | null {
    const revenue80Percent = this.calculate80PercentRevenue(data);
    if (revenue80Percent.productsCount / data.length < 0.3) {
      return {
        type: 'concentration',
        message: `80% da sua receita vem de apenas ${revenue80Percent.productsCount} produtos (${(revenue80Percent.productsCount / data.length * 100).toFixed(0)}% do catálogo)`,
        actionable: true,
        suggestedAction: 'Foque marketing nos produtos mais rentáveis'
      };
    }
    return null;
  }

  detectSeasonality(data: TimeSeriesData[]): Insight | null {
    const seasonalityStrength = this.calculateSeasonality(data);
    if (seasonalityStrength > 0.3) {
      return {
        type: 'seasonality',
        message: `Suas vendas têm forte padrão sazonal (${seasonalityStrength.peak} é ${seasonalityStrength.percentage}% melhor)`,
        actionable: true,
        suggestedAction: 'Planeje campanhas antecipadas para alta temporada'
      };
    }
    return null;
  }
}
```

### 2. Comparações Inteligentes
```typescript
class ComparisonAnalyzer {
  compareWithPrevious(current: Metrics, previous: Metrics): ComparisonInsight {
    const growth = (current.revenue - previous.revenue) / previous.revenue;
    
    return {
      revenue: {
        change: growth,
        description: this.formatTrend(growth),
        significance: Math.abs(growth) > 0.1 ? 'significant' : 'minor'
      },
      // ... outras métricas
    };
  }

  private formatTrend(growth: number): string {
    const absGrowth = Math.abs(growth) * 100;
    const direction = growth > 0 ? 'aumentou' : 'diminuiu';
    
    if (absGrowth > 50) return `${direction} drasticamente (${absGrowth.toFixed(0)}%)`;
    if (absGrowth > 20) return `${direction} significativamente (${absGrowth.toFixed(0)}%)`;
    if (absGrowth > 5) return `${direction} moderadamente (${absGrowth.toFixed(0)}%)`;
    return 'manteve-se estável';
  }
}
```

## Sistema de Sugestões de Ações

### 1. Ações Baseadas em Problemas
```typescript
class ProblemBasedSuggestions {
  generateSuggestions(analysis: DataAnalysis): ActionSuggestion[] {
    const suggestions: ActionSuggestion[] = [];

    // Baixo volume de vendas
    if (analysis.salesVolume < analysis.expectedVolume * 0.8) {
      suggestions.push({
        action: "Revisar estratégia de marketing",
        description: "Volume de vendas 20% abaixo do esperado. Considere campanhas promocionais.",
        command: "analisar conversão de funil de vendas",
        priority: "alta",
        impact: "alto"
      });
    }

    // Alto churn em assinaturas
    if (analysis.churnRate > 0.1) { // 10%
      suggestions.push({
        action: "Implementar programa de retenção",
        description: "Taxa de cancelamento alta. Crie estratégias para manter assinantes.",
        command: "criar campanha de retenção automática",
        priority: "alta",
        impact: "alto"
      });
    }

    return suggestions.sort((a, b) => this.priorityScore(b) - this.priorityScore(a));
  }
}
```

### 2. Ações Baseadas em Oportunidades
```typescript
class OpportunityBasedSuggestions {
  identifyOpportunities(data: BusinessData): ActionSuggestion[] {
    const opportunities = [];

    // Produto em alta performance
    const topProduct = this.identifyTopPerformer(data.products);
    if (topProduct.growthRate > 0.5) { // 50% crescimento
      opportunities.push({
        action: "Criar upsell para produto em alta",
        description: `${topProduct.name} cresceu 50%. Crie produtos complementares.`,
        command: `analisar oportunidades de upsell para ${topProduct.id}`,
        priority: "média",
        impact: "médio"
      });
    }

    return opportunities;
  }
}
```

## Casos de Uso por Contexto

### 1. Consulta Simples - Vendas
**Input:** Dados de vendas do último mês
**Output:**
```
💰 **Resumo de Vendas - Dezembro 2024**

Excelente! Você teve 127 vendas totalizando R$ 45.890,00 em dezembro.

📊 **Destaques:**
• Ticket médio: R$ 361,34 (+12% vs novembro)
• Melhor dia: 15/12 (18 vendas)
• Produto campeão: "Curso de Marketing Digital"

💡 **Insights:**
• Suas vendas de final de semana são 34% maiores que dias úteis
• Dezembro foi seu melhor mês do ano (+67% vs média)

🎯 **Próximos Passos:**
1. **Aproveitar momentum** → "criar campanha janeiro para manter ritmo"
2. **Expandir produto campeão** → "analisar oportunidades upsell Marketing Digital"
```

### 2. Análise Complexa - Assinaturas com Problema
**Input:** Dados de assinaturas com issues
**Output:**
```
⚠️ **Análise de Assinaturas - Situação Requer Atenção**

Identificamos 23 assinaturas que precisam de cuidado (churn: 8,5%).

🔍 **Detalhamento:**
• **Em atraso:** 12 assinaturas (R$ 2.890,00 em risco)
• **Cancelamento solicitado:** 8 assinaturas
• **Problemas de pagamento:** 3 assinaturas

📈 **Impacto Financeiro:**
• Receita em risco: R$ 4.234,00/mês
• Recuperação potencial: 68% (R$ 2.890,00)

🎯 **Ações Prioritárias:**

**🚨 HOJE:**
1. **Contatar em atraso** → "enviar lembretes personalizados"
2. **Atualizar cartões** → "verificar cartões vencidos"

**📋 ESTA SEMANA:**
3. **Pesquisa cancelamento** → "criar pesquisa motivo cancelamento"
4. **Oferta retenção** → "criar desconto especial retenção"
```

## Casos de Teste Críticos

### Formatação Cultural
```
✅ R$ 1.500,00 (não $1500.00)
✅ 15/01/2024 (não 2024-01-15) 
✅ 15,5% (não 15.5%)
✅ Linguagem brasileira natural
```

### Adaptação de Tom
```
✅ Iniciante: sem jargão técnico
✅ Avançado: métricas detalhadas
✅ Contexto urgente: tom apropriado
✅ Dados positivos: celebrar sucessos
```

### Insights Automáticos
```
✅ Detecta padrão 80/20
✅ Identifica sazonalidade
✅ Compara com períodos anteriores
✅ Sugere ações acionáveis
```

### Sugestões de Ações
```
✅ Priorizadas por impacto  
✅ Comandos executáveis incluídos
✅ Descrições claras do benefício
✅ Adaptadas ao contexto de negócio
```

## Critérios de Aceitação

- [ ] **Linguagem natural fluente** em português brasileiro
- [ ] **Formatação cultural correta** para todos os tipos de dados
- [ ] **Adaptação de tom** baseada no perfil do usuário
- [ ] **Insights relevantes** gerados automaticamente (>80% úteis)
- [ ] **Sugestões acionáveis** com comandos executáveis
- [ ] **Templates para todos os contextos** (vendas, assinaturas, produtos)
- [ ] **Performance adequada** (<300ms para formatação)

## Integração com Outras RFCs

### Entrada (depende de):
- **RFC-001:** Estrutura base MCP
- **RFC-002:** Comando original do usuário
- **RFC-003:** Dados das operações executadas  
- **RFC-004:** Contexto e preferências do usuário

### Saída (será usado por):
- **RFC-006:** Monitoramento da satisfação com respostas
- **RFC-007:** Testes de qualidade da linguagem natural

## Dicas de Implementação

### 1. Templates Modulares
```typescript
// Use template strings com placeholders
const template = "Você teve {count} vendas totalizando {revenue}";
const formatted = this.replacePlaceholders(template, data);
```

### 2. Formatação Lazy
```typescript
// Formate apenas quando necessário
class LazyFormatter {
  private formatters = new Map();
  
  format(type: string, value: any) {
    if (!this.formatters.has(type)) {
      this.formatters.set(type, this.createFormatter(type));
    }
    return this.formatters.get(type)(value);
  }
}
```

### 3. Cache de Templates
Cache templates compilados para performance.

### 4. A/B Testing de Mensagens
Mantenha múltiplas versões de templates para testar eficácia.

### 5. Emoji com Moderação
Use emojis para destacar, mas sem exagerar (máximo 2-3 por resposta).

## Status de Entrega

Marque como completo quando:
- [ ] Formatador de resposta operacional
- [ ] Templates para todos os contextos criados
- [ ] Formatação cultural brasileira funcionando
- [ ] Sistema de insights gerando observações úteis
- [ ] Sugestões de ações priorizadas corretamente
- [ ] Adaptação de tom por perfil implementada
- [ ] Integração com RFCs anteriores testada

**Próximo passo após conclusão:** Implementar RFC-006 (Sistema de Monitoramento e Analytics)