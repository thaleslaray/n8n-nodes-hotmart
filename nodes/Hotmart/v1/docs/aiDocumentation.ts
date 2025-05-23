/**
   * AI Documentation for Hotmart Node
   *
   * This file contains AI-friendly documentation for all Hotmart operations
   * to improve discoverability and usability by AI agents.
   */

  interface AiOperationDoc {
    summary: string;
    examples: string[];
    parameters: Record<string, string>;
  }

  export const aiOperationDocs = {
    // Subscription Operations
    'subscription.getAll': {
      summary: 'Lista assinaturas da Hotmart com filtros avançados',
      examples: [
        'listar todas assinaturas ativas',
        'buscar assinaturas canceladas este mês',
        'obter assinaturas do produto X',
        'filtrar assinaturas por status PAST_DUE',
        'buscar assinaturas criadas hoje'
      ],
      parameters: {
        status: 'Filtra por status: ACTIVE, CANCELED, PAST_DUE, ENDED, etc.',
        productId: 'ID do produto específico para filtrar',
        startDate: 'Data inicial no formato YYYY-MM-DD',
        endDate: 'Data final no formato YYYY-MM-DD',
        subscriberEmail: 'Email do assinante para busca específica'
      }
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
    'sales.solicitarReembolso': {
      summary: '⚠️ Processa reembolso de venda (irreversível)',
      examples: [
        'reembolsar venda específica',
        'processar devolução',
        'cancelar transação com reembolso'
      ],
      parameters: {
        transactionCode: 'Código da venda a reembolsar',
        reason: 'Motivo do reembolso',
        partialAmount: 'Valor parcial (opcional)'
      }
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

  // Export helper function to get AI documentation for an operation
  export function getAiDocForOperation(resource: string, operation: string): AiOperationDoc | null {
    const key = `${resource}.${operation}`;
    return aiOperationDocs[key as keyof typeof aiOperationDocs] || null;
  }

  // Export all operation keys for validation
  export const supportedOperations = Object.keys(aiOperationDocs);
