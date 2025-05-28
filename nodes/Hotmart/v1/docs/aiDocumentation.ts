/**
 * AI Documentation for Hotmart Node
 * 
 * @fileoverview Este arquivo contém documentação otimizada para IA de todas as operações Hotmart.
 * Projetado para melhorar a descoberta e usabilidade por agentes de IA através de:
 * - Exemplos práticos em português brasileiro
 * - Descrições semânticas claras
 * - Mapeamento contextual de parâmetros
 * - Categorização inteligente de operações
 * - Sugestões contextuais baseadas em uso
 * 
 * @version 0.6.6
 * @author Thales Laray
 * @ai-ready true
 * @mcp-compatible true
 * 
 * @example
 * ```typescript
 * // Obter documentação de uma operação específica
 * const doc = getAiDocForOperation('subscription', 'getAll');
 * console.log(doc.summary); // "Lista assinaturas da Hotmart com filtros avançados"
 * 
 * // Obter exemplos de uma categoria
 * const salesOps = getOperationByCategory('sales');
 * console.log(salesOps.length); // 6 operações de vendas
 * 
 * // Gerar ajuda contextual
 * const help = generateAIContextualHelp('subscription.getAll', { status: 'ACTIVE' });
 * console.log(help.suggestions); // Array de sugestões inteligentes
 * ```
 */

/**
 * Interface para documentação de operações otimizada para IA
 * 
 * @interface AiOperationDoc
 * @description Define a estrutura padrão de documentação que AI agents esperam encontrar
 */
interface AiOperationDoc {
  /** Resumo conciso da operação em português brasileiro */
  summary: string;
  
  /** Array de exemplos práticos de como usar a operação */
  examples: string[];
  
  /** Mapeamento de parâmetros com descrições claras */
  parameters: Record<string, string>;
  
  /** Tags para categorização e busca (opcional) */
  tags?: string[];
  
  /** Nível de complexidade: 'basic' | 'intermediate' | 'advanced' (opcional) */
  complexity?: 'basic' | 'intermediate' | 'advanced';
  
  /** Casos de uso específicos (opcional) */
  useCases?: string[];
  
  /** Limitações ou avisos importantes (opcional) */
  warnings?: string[];
}

/**
 * Documentação de operações mapeada para AI agents
 * 
 * @constant aiOperationDocs
 * @description Cada operação inclui summary, examples, parameters e metadados para IA
 */
export const aiOperationDocs = {
    // ================================
    // SUBSCRIPTION OPERATIONS (8 ops)
    // ================================
    
    /**
     * Operação principal para consulta de assinaturas
     * Suporta paginação automática e filtros avançados
     */
    'subscription.getAll': {
      summary: 'Lista assinaturas da Hotmart com filtros avançados e paginação automática',
      examples: [
        'listar todas assinaturas ativas',
        'buscar assinaturas canceladas este mês', 
        'obter assinaturas do produto "Curso Python"',
        'filtrar assinaturas em atraso (PAST_DUE)',
        'buscar assinaturas criadas hoje',
        'assinaturas de cliente específico por email',
        'relatório de churn mensal',
        'análise de assinaturas por período'
      ],
      parameters: {
        status: 'Status da assinatura: ACTIVE, CANCELED, PAST_DUE, ENDED, BLOCKED',
        productId: 'ID numérico do produto para filtrar (ex: 123456)',
        startDate: 'Data inicial no formato YYYY-MM-DD (ex: 2025-01-01)',
        endDate: 'Data final no formato YYYY-MM-DD (ex: 2025-01-31)',
        subscriberEmail: 'Email exato do assinante para busca específica',
        returnAll: 'true para retornar todos os resultados com paginação automática'
      },
      complexity: 'basic' as const,
      tags: ['consulta', 'listagem', 'filtros', 'paginação'],
      useCases: [
        'Relatórios gerenciais de assinaturas',
        'Análise de churn e retenção', 
        'Segmentação de clientes',
        'Auditoria de assinaturas',
        'Dashboard executivo'
      ],
      warnings: [
        'Para datasets grandes (10000+ assinaturas), considere usar filtros de data',
        'A paginação automática pode levar tempo considerável'
      ]
    },
    'subscription.getSummary': {
      summary: 'Obtém dados consolidados e métricas de assinaturas',
      examples: [
        'obter resumo de assinaturas do mês',
        'métricas de assinaturas por produto',
        'sumário de cancelamentos e renovações'
      ],
      parameters: {
        productId: 'ID do produto para análise específica',
        startDate: 'Data inicial para o período de análise',
        endDate: 'Data final para o período de análise'
      }
    },
    'subscription.getTransactions': {
      summary: 'Lista transações detalhadas de assinaturas',
      examples: [
        'transações de pagamento do último mês',
        'histórico de cobranças de uma assinatura',
        'transações com falha de pagamento'
      ],
      parameters: {
        subscriptionCode: 'Código da assinatura específica',
        status: 'Status da transação: APPROVED, REFUSED, etc.',
        startDate: 'Data inicial das transações',
        endDate: 'Data final das transações'
      }
    },
    'subscription.getPurchases': {
      summary: 'Lista compras realizadas por assinantes',
      examples: [
        'compras de um assinante específico',
        'produtos adquiridos por assinatura',
        'histórico de upgrades e downgrades'
      ],
      parameters: {
        subscriptionCode: 'Código da assinatura',
        subscriberEmail: 'Email do assinante'
      }
    },
    'subscription.cancel': {
      summary: 'Cancela uma assinatura específica',
      examples: [
        'cancelar assinatura por código',
        'processar cancelamento imediato',
        'cancelar com motivo específico'
      ],
      parameters: {
        subscriptionCode: 'Código da assinatura a cancelar',
        reason: 'Motivo do cancelamento (opcional)'
      }
    },
    'subscription.cancelList': {
      summary: 'Cancela múltiplas assinaturas em lote',
      examples: [
        'cancelar lista de assinaturas inadimplentes',
        'processamento em massa de cancelamentos',
        'cancelar assinaturas de produto descontinuado'
      ],
      parameters: {
        subscriptionCodes: 'Array de códigos de assinatura',
        reason: 'Motivo do cancelamento em massa'
      }
    },
    'subscription.reactivate': {
      summary: 'Reativa uma assinatura cancelada e processa cobrança',
      examples: [
        'reativar assinatura cancelada',
        'reativar e cobrar imediatamente',
        'recuperar assinante perdido'
      ],
      parameters: {
        subscriptionCode: 'Código da assinatura a reativar',
        chargeImmediately: 'Se deve cobrar imediatamente (true/false)'
      }
    },
    'subscription.reactivateList': {
      summary: 'Reativa múltiplas assinaturas em lote',
      examples: [
        'reativar lista de assinaturas',
        'campanha de recuperação em massa',
        'reativar assinaturas de promoção'
      ],
      parameters: {
        subscriptionCodes: 'Array de códigos de assinatura',
        chargeImmediately: 'Se deve cobrar todas imediatamente'
      }
    },
    'subscription.changeBillingDate': {
      summary: 'Altera o dia de cobrança de uma assinatura',
      examples: [
        'mudar cobrança para dia 15',
        'ajustar data de vencimento',
        'sincronizar cobranças no mesmo dia'
      ],
      parameters: {
        subscriptionCode: 'Código da assinatura',
        newBillingDay: 'Novo dia do mês (1-31)'
      }
    },

    // Sales Operations
    'sales.getHistoricoVendas': {
      summary: 'Obtém histórico completo de vendas com filtros avançados',
      examples: [
        'vendas dos últimos 30 dias',
        'vendas de produto específico',
        'vendas por afiliado',
        'vendas aprovadas este mês',
        'buscar venda por código de transação'
      ],
      parameters: {
        productId: 'ID do produto vendido',
        startDate: 'Data inicial das vendas',
        endDate: 'Data final das vendas',
        status: 'Status da venda: APPROVED, REFUNDED, etc.',
        affiliateEmail: 'Email do afiliado',
        transactionCode: 'Código específico da transação'
      }
    },
    'sales.getComissoesVendas': {
      summary: 'Relatório de comissões ganhas em vendas',
      examples: [
        'comissões do mês atual',
        'comissões por produto',
        'comissões de afiliado específico',
        'relatório de ganhos por período'
      ],
      parameters: {
        startDate: 'Data inicial do período',
        endDate: 'Data final do período',
        productId: 'Produto específico',
        userRole: 'Papel: PRODUCER, AFFILIATE, CO_PRODUCER'
      }
    },
    'sales.getResumoVendas': {
      summary: 'Métricas consolidadas e KPIs de vendas',
      examples: [
        'resumo de vendas mensal',
        'KPIs de performance',
        'métricas por produto',
        'análise de tendências de vendas'
      ],
      parameters: {
        period: 'Período: DAILY, WEEKLY, MONTHLY, YEARLY',
        productId: 'Produto para análise específica',
        groupBy: 'Agrupar por: PRODUCT, DATE, AFFILIATE'
      }
    },
    'sales.getParticipantesVendas': {
      summary: 'Identifica todos os participantes de cada venda',
      examples: [
        'listar produtores e afiliados',
        'participantes de venda específica',
        'rede de vendas de um produto'
      ],
      parameters: {
        transactionCode: 'Código da transação',
        productId: 'ID do produto',
        startDate: 'Data inicial',
        endDate: 'Data final'
      }
    },
    'sales.getDetalhamentoPrecos': {
      summary: 'Breakdown detalhado de valores de vendas',
      examples: [
        'detalhamento de taxas e impostos',
        'valor líquido por venda',
        'análise de custos de transação',
        'breakdown de preços por período'
      ],
      parameters: {
        transactionCode: 'Código específico da venda',
        startDate: 'Data inicial para análise',
        endDate: 'Data final para análise'
      }
    },
    /**
     * Operação crítica de reembolso - IRREVERSÍVEL
     * Requer cuidado especial na validação
     */
    'sales.solicitarReembolso': {
      summary: '⚠️ Processa reembolso de venda (OPERAÇÃO IRREVERSÍVEL)',
      examples: [
        'reembolsar venda específica por insatisfação',
        'processar devolução por defeito no produto', 
        'cancelar transação com reembolso total',
        'reembolso parcial por acordo',
        'estorno por chargeback preventivo'
      ],
      parameters: {
        transactionCode: 'Código único da transação (ex: HP-123456789)',
        reason: 'Motivo detalhado do reembolso (obrigatório)',
        partialAmount: 'Valor parcial em centavos (opcional - se omitido, reembolso total)',
        forceRefund: 'true para forçar reembolso mesmo com restrições'
      },
      complexity: 'advanced' as const,
      tags: ['reembolso', 'financeiro', 'crítico', 'irreversível'],
      useCases: [
        'Atendimento ao cliente',
        'Resolução de disputas',
        'Gestão de qualidade',
        'Prevenção de chargebacks'
      ],
      warnings: [
        '🚨 OPERAÇÃO IRREVERSÍVEL - Não pode ser desfeita',
        'Verifica saldo antes de executar',
        'Pode impactar comissões de afiliados', 
        'Reembolsos em lote devem ser evitados',
        'Considera período de carência da operadora'
      ]
    },

    // Product Operations
    'product.getAll': {
      summary: 'Lista todos os produtos disponíveis',
      examples: [
        'listar todos produtos ativos',
        'buscar produtos por categoria',
        'produtos com preço específico',
        'cursos disponíveis para venda'
      ],
      parameters: {
        status: 'Status do produto: ACTIVE, INACTIVE',
        category: 'Categoria do produto',
        priceRange: 'Faixa de preço (min-max)'
      }
    },

    // Coupon Operations
    'coupon.create': {
      summary: 'Cria novo cupom de desconto',
      examples: [
        'criar cupom de 20% de desconto',
        'cupom para produto específico',
        'cupom com validade limitada',
        'cupom de primeira compra'
      ],
      parameters: {
        code: 'Código do cupom (ex: DESCONTO20)',
        discountPercentage: 'Percentual de desconto (0-100)',
        productId: 'Produto ao qual se aplica',
        validUntil: 'Data de validade',
        maxUses: 'Número máximo de usos'
      }
    },
    'coupon.delete': {
      summary: 'Remove um cupom existente',
      examples: [
        'excluir cupom expirado',
        'remover cupom não utilizado',
        'deletar cupom de campanha encerrada'
      ],
      parameters: {
        couponCode: 'Código do cupom a excluir'
      }
    },
    'coupon.get': {
      summary: 'Obtém informações de um cupom',
      examples: [
        'verificar validade de cupom',
        'consultar usos de cupom',
        'detalhes de cupom específico'
      ],
      parameters: {
        couponCode: 'Código do cupom a consultar'
      }
    },

    // Club Operations
    'club.getModules': {
      summary: 'Lista módulos da área de membros',
      examples: [
        'listar todos módulos do curso',
        'módulos de produto específico',
        'estrutura do conteúdo'
      ],
      parameters: {
        productId: 'ID do produto/curso'
      }
    },
    'club.getPages': {
      summary: 'Obtém páginas/aulas de um módulo',
      examples: [
        'listar aulas do módulo',
        'conteúdo de módulo específico',
        'páginas de um capítulo'
      ],
      parameters: {
        moduleId: 'ID do módulo',
        productId: 'ID do produto'
      }
    },
    'club.getAll': {
      summary: 'Lista todos os alunos da área de membros',
      examples: [
        'listar alunos ativos',
        'buscar aluno por email',
        'alunos de curso específico',
        'relatório de acesso'
      ],
      parameters: {
        productId: 'ID do produto/curso',
        status: 'Status: ACTIVE, BLOCKED',
        email: 'Email do aluno'
      }
    },
    'club.getProgress': {
      summary: 'Obtém progresso de aluno no curso',
      examples: [
        'progresso de aluno específico',
        'percentual de conclusão',
        'módulos completados',
        'tempo de estudo'
      ],
      parameters: {
        studentId: 'ID do aluno',
        productId: 'ID do produto/curso'
      }
    },

    // Tickets Operations
    'tickets.getAll': {
      summary: 'Lista ingressos e participantes de eventos',
      examples: [
        'participantes do evento',
        'lista de ingressos vendidos',
        'check-in de participantes',
        'relatório de presença'
      ],
      parameters: {
        eventId: 'ID do evento',
        status: 'Status: CONFIRMED, CHECKED_IN',
        date: 'Data do evento'
      }
    },
    'tickets.getInfo': {
      summary: 'Informações detalhadas de evento',
      examples: [
        'detalhes do evento',
        'informações de local e data',
        'capacidade e vendas',
        'dados do organizador'
      ],
      parameters: {
        eventId: 'ID do evento'
      }
    },

    // Negotiate Operations
    'negotiate.generateNegotiation': {
      summary: 'Gera link de negociação para pagamento parcelado',
      examples: [
        'criar parcelamento para cliente',
        'negociar débito pendente',
        'oferecer plano de pagamento',
        'gerar link de pagamento especial'
      ],
      parameters: {
        buyerEmail: 'Email do comprador',
        productId: 'ID do produto',
        installments: 'Número de parcelas',
        value: 'Valor total da negociação'
      }
    }
  };

// ============================================
// AI HELPER FUNCTIONS - Funções Auxiliares 
// ============================================

/**
 * Obtém documentação de IA para uma operação específica
 * 
 * @param resource Nome do recurso (ex: 'subscription', 'sales')
 * @param operation Nome da operação (ex: 'getAll', 'cancel')
 * @returns Documentação da operação ou null se não encontrada
 * 
 * @example
 * ```typescript
 * const doc = getAiDocForOperation('subscription', 'getAll');
 * if (doc) {
 *   console.log(doc.summary);
 *   console.log(doc.complexity); // 'basic' | 'intermediate' | 'advanced'
 * }
 * ```
 */
export function getAiDocForOperation(resource: string, operation: string): AiOperationDoc | null {
    const key = `${resource}.${operation}`;
    return aiOperationDocs[key as keyof typeof aiOperationDocs] || null;
}

/**
 * Lista de todas as operações suportadas
 * Útil para validação e descoberta automática por AI agents
 */
export const supportedOperations = Object.keys(aiOperationDocs);

/**
 * Gera ajuda contextual inteligente para operações de IA
 * 
 * @param operation Nome completo da operação (ex: 'subscription.getAll')
 * @param context Contexto atual com parâmetros e estado
 * @returns Objeto com sugestões contextuais e ajuda
 * 
 * @example
 * ```typescript
 * const help = generateAIContextualHelp('subscription.getAll', { 
 *   status: 'ACTIVE',
 *   productId: '123456' 
 * });
 * console.log(help.suggestions); // Sugestões baseadas no contexto
 * console.log(help.smartSuggestions); // Sugestões inteligentes adicionais
 * ```
 */
export function generateAIContextualHelp(operation: string, context: Record<string, unknown> = {}) {
    const doc = (aiOperationDocs as Record<string, AiOperationDoc>)[operation];
    
    if (!doc) {
      return {
        operation,
        context: context || {},
        suggestions: ['❌ Operação não encontrada na documentação'],
        smartSuggestions: ['Verifique se o nome da operação está correto'],
        complexity: undefined,
        warnings: ['Operação não documentada']
      };
    }

    // Gerar sugestões inteligentes baseadas no contexto
    const smartSuggestions = generateSmartSuggestions(operation, context || {}, doc);
    
    return {
      operation,
      context: context || {},
      suggestions: doc.examples,
      smartSuggestions,
      complexity: doc.complexity || 'basic',
      warnings: doc.warnings || [],
      useCases: doc.useCases || [],
      tags: doc.tags || []
    };
}

/**
 * Gera sugestões inteligentes baseadas no contexto e histórico
 * 
 * @param operation Nome da operação
 * @param context Contexto atual
 * @param doc Documentação da operação
 * @returns Array de sugestões contextuais
 */
function generateSmartSuggestions(
  operation: string, 
  context: Record<string, unknown>, 
  doc: AiOperationDoc
): string[] {
  const suggestions: string[] = [];
  
  // Garantir que context não seja null
  const safeContext = context || {};
  
  // Sugestões baseadas em parâmetros fornecidos
  if (safeContext.status) {
    suggestions.push(`💡 Filtro por status "${safeContext.status}" aplicado`);
  }
  
  if (safeContext.productId) {
    suggestions.push(`🎯 Foco no produto ID ${safeContext.productId}`);
  }
  
  if (safeContext.startDate || safeContext.endDate) {
    suggestions.push(`📅 Filtro temporal configurado para análise de período`);
  }
  
  // Sugestões baseadas na complexidade
  if (doc.complexity === 'advanced') {
    suggestions.push(`⚠️ Operação avançada - revise parâmetros cuidadosamente`);
  }
  
  // Sugestões baseadas em tags
  if (doc.tags?.includes('crítico')) {
    suggestions.push(`🚨 Operação crítica - considere fazer backup antes`);
  }
  
  if (doc.tags?.includes('irreversível')) {
    suggestions.push(`⚡ Operação irreversível - validação extra recomendada`);
  }
  
  // Sugestões baseadas no tipo de operação
  if (operation.includes('getAll') && !safeContext.returnAll) {
    suggestions.push(`📄 Considere usar 'returnAll: true' para paginação automática`);
  }
  
  if (operation.includes('cancel') || operation.includes('delete')) {
    suggestions.push(`✋ Operação destrutiva - confirme antes de executar`);
  }
  
  return suggestions.length > 0 ? suggestions : ['✅ Configuração adequada para esta operação'];
}

/**
 * Obtém todos os exemplos de operações organizados
 * Útil para treinar modelos de IA e descoberta de funcionalidades
 * 
 * @returns Array com todos os exemplos categorizados
 * 
 * @example
 * ```typescript
 * const examples = getAllOperationExamples();
 * const subscriptionExamples = examples.filter(e => e.operation.startsWith('subscription'));
 * console.log(subscriptionExamples.length); // 9 operações de assinatura
 * ```
 */
export function getAllOperationExamples() {
    const allExamples: Array<{ 
      operation: string; 
      example: string; 
      category: string;
      complexity: string;
      tags: string[];
    }> = [];
    
    Object.keys(aiOperationDocs).forEach(operation => {
      const doc = (aiOperationDocs as Record<string, AiOperationDoc>)[operation];
      const category = operation.split('.')[0];
      
      doc.examples.forEach((example: string) => {
        allExamples.push({
          operation,
          example,
          category,
          complexity: (doc.complexity || 'basic') as 'basic' | 'intermediate' | 'advanced',
          tags: doc.tags || []
        });
      });
    });
    
    return allExamples;
}

/**
 * Obtém operações por categoria com metadados enriquecidos
 * 
 * @param category Nome da categoria (sales, subscription, coupon, etc.)
 * @returns Array de operações da categoria com documentação completa
 * 
 * @example
 * ```typescript
 * const salesOps = getOperationByCategory('sales');
 * const criticalOps = salesOps.filter(op => op.doc.tags?.includes('crítico'));
 * console.log(criticalOps); // Operações críticas de vendas
 * ```
 */
export function getOperationByCategory(category: string) {
    const operations: Array<{ 
      operation: string; 
      doc: AiOperationDoc;
      category: string;
      isAdvanced: boolean;
      isCritical: boolean;
    }> = [];
    
    // Mapeamento atualizado de categorias com nomes reais das operações
    const categoryMap: Record<string, string[]> = {
        sales: [
            'sales.getHistoricoVendas', 
            'sales.getComissoesVendas', 
            'sales.getParticipantesVendas', 
            'sales.getDetalhamentoPrecos', 
            'sales.getResumoVendas', 
            'sales.solicitarReembolso'
        ],
        subscription: [
            'subscription.getAll', 
            'subscription.getSummary', 
            'subscription.getTransactions', 
            'subscription.getPurchases', 
            'subscription.cancel', 
            'subscription.cancelList', 
            'subscription.reactivate', 
            'subscription.reactivateList', 
            'subscription.changeBillingDate'
        ],
        coupon: ['coupon.create', 'coupon.get', 'coupon.delete'],
        club: ['club.getAll', 'club.getModules', 'club.getPages', 'club.getProgress'],
        tickets: ['tickets.getAll', 'tickets.getInfo'],
        product: ['product.getAll'],
        negotiate: ['negotiate.generateNegotiation']
    };
    
    Object.keys(aiOperationDocs).forEach(operation => {
      const doc = (aiOperationDocs as Record<string, AiOperationDoc>)[operation];
      
      if (categoryMap[category] && categoryMap[category].includes(operation)) {
        operations.push({
          operation,
          doc,
          category,
          isAdvanced: doc.complexity === 'advanced',
          isCritical: doc.tags?.includes('crítico') || doc.tags?.includes('irreversível') || false
        });
      }
    });
    
    return operations;
}

/**
 * Busca operações por texto usando busca semântica
 * 
 * @param searchTerm Termo de busca em português
 * @returns Array de operações relevantes ordenadas por relevância
 * 
 * @example
 * ```typescript
 * const results = searchOperations('cancelar assinatura');
 * console.log(results[0].operation); // 'subscription.cancel'
 * 
 * const salesResults = searchOperations('vendas comissão');
 * console.log(salesResults.length); // Operações relacionadas a vendas e comissões
 * ```
 */
export function searchOperations(searchTerm: string) {
    const searchLower = searchTerm.toLowerCase();
    const results: Array<{
        operation: string;
        doc: AiOperationDoc;
        relevanceScore: number;
        matchReason: string;
    }> = [];
    
    Object.keys(aiOperationDocs).forEach(operation => {
        const doc = (aiOperationDocs as Record<string, AiOperationDoc>)[operation];
        let relevanceScore = 0;
        const matchReasons: string[] = [];
        
        // Busca no summary (peso maior)
        if (doc.summary.toLowerCase().includes(searchLower)) {
            relevanceScore += 10;
            matchReasons.push('summary');
        }
        
        // Busca nos examples
        doc.examples.forEach(example => {
            if (example.toLowerCase().includes(searchLower)) {
                relevanceScore += 5;
                matchReasons.push('examples');
            }
        });
        
        // Busca nas tags
        doc.tags?.forEach(tag => {
            if (tag.toLowerCase().includes(searchLower)) {
                relevanceScore += 3;
                matchReasons.push('tags');
            }
        });
        
        // Busca nos use cases
        doc.useCases?.forEach(useCase => {
            if (useCase.toLowerCase().includes(searchLower)) {
                relevanceScore += 4;
                matchReasons.push('useCases');
            }
        });
        
        // Busca no nome da operação
        if (operation.toLowerCase().includes(searchLower)) {
            relevanceScore += 7;
            matchReasons.push('operation');
        }
        
        if (relevanceScore > 0) {
            results.push({
                operation,
                doc,
                relevanceScore,
                matchReason: matchReasons.join(', ')
            });
        }
    });
    
    // Ordenar por relevância (maior primeiro)
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Obtém estatísticas da documentação para análise
 * 
 * @returns Objeto com métricas da documentação
 * 
 * @example
 * ```typescript
 * const stats = getDocumentationStats();
 * console.log(`Total de operações: ${stats.totalOperations}`);
 * console.log(`Operações críticas: ${stats.criticalOperations}`);
 * console.log(`Cobertura de exemplos: ${stats.averageExamplesPerOperation}`);
 * ```
 */
export function getDocumentationStats() {
    const operations = Object.keys(aiOperationDocs);
    const docs = Object.values(aiOperationDocs) as AiOperationDoc[];
    
    const totalExamples = docs.reduce((sum, doc) => sum + doc.examples.length, 0);
    const totalUseCases = docs.reduce((sum, doc) => sum + (doc.useCases?.length || 0), 0);
    const totalWarnings = docs.reduce((sum, doc) => sum + (doc.warnings?.length || 0), 0);
    
    const complexityDistribution = {
        basic: docs.filter(doc => doc.complexity === 'basic').length,
        intermediate: docs.filter(doc => doc.complexity === 'intermediate').length,
        advanced: docs.filter(doc => doc.complexity === 'advanced').length,
        undefined: docs.filter(doc => !doc.complexity).length
    };
    
    const categoriesCount = {
        sales: getOperationByCategory('sales').length,
        subscription: getOperationByCategory('subscription').length,
        coupon: getOperationByCategory('coupon').length,
        club: getOperationByCategory('club').length,
        tickets: getOperationByCategory('tickets').length,
        product: getOperationByCategory('product').length,
        negotiate: getOperationByCategory('negotiate').length
    };
    
    return {
        totalOperations: operations.length,
        totalExamples,
        totalUseCases,
        totalWarnings,
        averageExamplesPerOperation: (totalExamples / operations.length).toFixed(2),
        complexityDistribution,
        categoriesCount,
        criticalOperations: docs.filter(doc => 
            doc.tags?.includes('crítico') || doc.tags?.includes('irreversível')
        ).length,
        documentationCoverage: {
            withTags: docs.filter(doc => doc.tags && doc.tags.length > 0).length,
            withUseCases: docs.filter(doc => doc.useCases && doc.useCases.length > 0).length,
            withWarnings: docs.filter(doc => doc.warnings && doc.warnings.length > 0).length,
            withComplexity: docs.filter(doc => doc.complexity).length
        }
    };
}

/**
 * Valida se uma operação está disponível e bem documentada
 * 
 * @param operation Nome da operação completa
 * @returns Objeto de validação com detalhes
 */
export function validateOperation(operation: string) {
    const doc = (aiOperationDocs as Record<string, AiOperationDoc>)[operation];
    
    if (!doc) {
        return {
            isValid: false,
            errors: ['Operação não encontrada'],
            warnings: [],
            suggestions: ['Verifique se o nome está correto', 'Use searchOperations() para encontrar operações similares']
        };
    }
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Validações básicas
    if (!doc.summary || doc.summary.length < 10) {
        errors.push('Summary muito curto ou ausente');
    }
    
    if (!doc.examples || doc.examples.length === 0) {
        errors.push('Nenhum exemplo fornecido');
    }
    
    if (doc.examples && doc.examples.length < 3) {
        warnings.push('Poucos exemplos disponíveis (recomendado: 3+)');
    }
    
    // Validações de qualidade
    if (!doc.complexity) {
        warnings.push('Nível de complexidade não definido');
    }
    
    if (!doc.tags || doc.tags.length === 0) {
        warnings.push('Tags não definidas - dificulta a busca');
    }
    
    if (doc.complexity === 'advanced' && (!doc.warnings || doc.warnings.length === 0)) {
        warnings.push('Operação avançada sem avisos apropriados');
    }
    
    // Sugestões de melhoria
    if (doc.examples && doc.examples.length < 5) {
        suggestions.push('Considere adicionar mais exemplos práticos');
    }
    
    if (!doc.useCases || doc.useCases.length === 0) {
        suggestions.push('Adicione casos de uso específicos');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        quality: {
            hasExamples: doc.examples && doc.examples.length > 0,
            hasUseCases: doc.useCases && doc.useCases.length > 0,
            hasWarnings: doc.warnings && doc.warnings.length > 0,
            hasComplexity: !!doc.complexity,
            hasTags: doc.tags && doc.tags.length > 0,
            score: calculateQualityScore(doc)
        }
    };
}

/**
 * Calcula score de qualidade da documentação (0-100)
 */
function calculateQualityScore(doc: AiOperationDoc): number {
    let score = 0;
    
    // Básicos (50 pontos)
    if (doc.summary && doc.summary.length >= 10) score += 15;
    if (doc.examples && doc.examples.length >= 3) score += 20;
    if (doc.parameters && Object.keys(doc.parameters).length > 0) score += 15;
    
    // Qualidade (30 pontos)
    if (doc.complexity) score += 10;
    if (doc.tags && doc.tags.length > 0) score += 10;
    if (doc.useCases && doc.useCases.length > 0) score += 10;
    
    // Excelência (20 pontos)
    if (doc.examples && doc.examples.length >= 5) score += 5;
    if (doc.warnings && doc.warnings.length > 0) score += 5;
    if (doc.useCases && doc.useCases.length >= 3) score += 5;
    if (doc.tags && doc.tags.length >= 3) score += 5;
    
    return Math.min(score, 100);
}
