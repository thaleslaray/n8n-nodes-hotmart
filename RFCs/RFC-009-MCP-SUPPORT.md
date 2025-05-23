# RFC-009: Suporte Model Context Protocol (MCP) no Node Hotmart

## Resumo

Esta RFC propõe a implementação de suporte ao Model Context Protocol (MCP) no node Hotmart existente, permitindo que assistentes de IA descubram e utilizem as funcionalidades do node automaticamente, mantendo total compatibilidade com o uso tradicional.

## Motivação

### Contexto Atual
- O node Hotmart possui 27 operações distribuídas em 7 recursos
- Assistentes de IA não conseguem descobrir ou utilizar essas operações automaticamente
- Usuários precisam configurar manualmente cada operação no n8n

### Benefícios do MCP
1. **Descoberta Automática**: Assistentes de IA podem listar e entender todas as operações disponíveis
2. **Integração Inteligente**: IA pode sugerir e executar operações baseadas em contexto
3. **Documentação Viva**: Schemas definem claramente entradas e saídas
4. **Compatibilidade Total**: Node continua funcionando normalmente sem MCP

## Proposta Detalhada

### 1. Arquitetura de Implementação

```
nodes/Hotmart/v1/
├── types/
│   └── mcpTypes.ts          # Novos tipos MCP
├── mcp/
│   ├── handler.ts           # Handler principal MCP
│   ├── descriptions.ts      # Descrições de todas operações
│   └── validator.ts         # Validação de schemas
├── utils/
│   └── mcpCheck.ts          # Verificação de suporte MCP
└── actions/
    └── [recursos existentes mantidos sem alteração]
```

### 2. Tipos e Interfaces

```typescript
// types/mcpTypes.ts
export interface McpToolDefinition {
  name: string;                    // Ex: "hotmart_get_sales_history"
  description: string;             // Descrição em linguagem natural
  category: string;                // Ex: "vendas", "assinaturas"
  inputSchema: JsonSchema;         // Schema JSON dos parâmetros
  outputSchema?: JsonSchema;       // Schema JSON da resposta
  examples?: McpExample[];         // Exemplos de uso
}

export interface McpNodeMetadata {
  enabled: boolean;
  version: string;
  tools: McpToolDefinition[];
  capabilities?: string[];         // Ex: ["pagination", "filtering"]
}

export interface McpCommand {
  tool: string;
  arguments: Record<string, any>;
  context?: McpContext;
}
```

### 3. Descrições MCP para Todas as Operações

```typescript
// mcp/descriptions.ts
export const mcpOperationDescriptions: Record<string, McpToolDefinition> = {
  // Vendas - 6 operações
  'sales.getHistoricoVendas': {
    name: 'hotmart_get_sales_history',
    description: 'Busca histórico completo de vendas com filtros avançados por data, status, produto e comprador',
    category: 'vendas',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', format: 'date', description: 'Data inicial (YYYY-MM-DD)' },
        endDate: { type: 'string', format: 'date', description: 'Data final (YYYY-MM-DD)' },
        productId: { type: 'string', description: 'ID do produto Hotmart' },
        buyerEmail: { type: 'string', format: 'email', description: 'Email do comprador' },
        transactionStatus: { 
          type: 'string', 
          enum: ['APPROVED', 'CANCELED', 'PENDING', 'REFUNDED'],
          description: 'Status da transação' 
        }
      }
    }
  },

  // Assinaturas - 9 operações
  'subscription.getAll': {
    name: 'hotmart_list_subscriptions',
    description: 'Lista todas as assinaturas com filtros por status, produto e data',
    category: 'assinaturas',
    inputSchema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string',
          enum: ['ACTIVE', 'CANCELLED', 'PAST_DUE', 'UNPAID', 'DELETED'],
          description: 'Status da assinatura'
        },
        productId: { type: 'string', description: 'ID do produto' },
        subscriberId: { type: 'string', description: 'ID do assinante' }
      }
    }
  },

  // ... [todas as 27 operações serão mapeadas]
};
```

### 4. Handler MCP

```typescript
// mcp/handler.ts
export class McpHandler {
  private static instance: McpHandler;
  private operationCache: Map<string, McpToolDefinition>;

  static getInstance(): McpHandler {
    if (!this.instance) {
      this.instance = new McpHandler();
    }
    return this.instance;
  }

  /**
   * Retorna metadados MCP para descoberta
   */
  getMcpMetadata(resource?: string, operation?: string): McpToolDefinition[] {
    if (resource && operation) {
      const key = `${resource}.${operation}`;
      const metadata = mcpOperationDescriptions[key];
      return metadata ? [metadata] : [];
    }
    return Object.values(mcpOperationDescriptions);
  }

  /**
   * Executa operação com contexto MCP
   */
  async executeMcpOperation(
    context: IExecuteFunctions,
    command: McpCommand
  ): Promise<INodeExecutionData[][]> {
    // Validar comando
    const tool = this.findToolByName(command.tool);
    if (!tool) {
      throw new Error(`Ferramenta MCP não encontrada: ${command.tool}`);
    }

    // Validar argumentos contra schema
    const validation = await McpValidator.validateInput(
      command.arguments,
      tool.inputSchema
    );
    if (!validation.valid) {
      throw new Error(`Argumentos inválidos: ${validation.errors.join(', ')}`);
    }

    // Executar operação
    return await this.executeWithContext(context, tool, command.arguments);
  }

  /**
   * Busca inteligente de ferramentas
   */
  searchTools(query: string): McpToolDefinition[] {
    const normalizedQuery = query.toLowerCase();
    return this.getAvailableTools().filter(tool => 
      tool.name.toLowerCase().includes(normalizedQuery) ||
      tool.description.toLowerCase().includes(normalizedQuery) ||
      tool.category.toLowerCase().includes(normalizedQuery)
    );
  }
}
```

### 5. Integração com HotmartV1.node.ts

```typescript
// Adicionar às propriedades
properties: [
  // ... propriedades existentes
  {
    displayName: 'Modo MCP',
    name: 'mcpEnabled',
    type: 'boolean',
    default: false,
    description: 'Habilita descoberta e execução via Model Context Protocol',
    displayOptions: {
      show: {
        '@version': [1],
      },
    },
  },
  {
    displayName: 'Comando MCP',
    name: 'mcpCommand',
    type: 'json',
    default: {},
    required: true,
    displayOptions: {
      show: {
        mcpEnabled: [true],
      },
    },
    description: 'Comando MCP a ser executado',
  },
];

// Modificar método execute
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const mcpEnabled = this.getNodeParameter('mcpEnabled', 0, false) as boolean;
  
  if (mcpEnabled) {
    try {
      const mcpCommand = this.getNodeParameter('mcpCommand', 0) as McpCommand;
      const handler = McpHandler.getInstance();
      
      // Log para debug
      this.logger.debug('Executando comando MCP', { command: mcpCommand });
      
      return await handler.executeMcpOperation(this, mcpCommand);
    } catch (error) {
      throw new NodeApiError(this.getNode(), error as Error, {
        message: 'Erro ao executar comando MCP',
      });
    }
  }
  
  // Execução tradicional
  return await router.call(this);
}
```

### 6. Método de Descoberta

```typescript
// methods/loadOptions.ts
export async function getMcpTools(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  const handler = McpHandler.getInstance();
  const tools = handler.getAvailableTools();
  
  // Agrupar por categoria
  const grouped = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, McpToolDefinition[]>);
  
  // Formatar para opções do n8n
  const options: INodePropertyOptions[] = [];
  
  Object.entries(grouped).forEach(([category, categoryTools]) => {
    categoryTools.forEach(tool => {
      options.push({
        name: `${category.toUpperCase()}: ${tool.description}`,
        value: tool.name,
        description: `Entrada: ${Object.keys(tool.inputSchema.properties || {}).join(', ')}`,
      });
    });
  });
  
  return options;
}
```

### 7. Validador de Schemas

```typescript
// mcp/validator.ts
export class McpValidator {
  static async validateInput(
    data: any,
    schema: JsonSchema
  ): Promise<ValidationResult> {
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    return {
      valid,
      errors: validate.errors?.map(e => `${e.instancePath} ${e.message}`) || [],
    };
  }
  
  static validateOutput(
    data: any,
    schema?: JsonSchema
  ): ValidationResult {
    if (!schema) return { valid: true, errors: [] };
    return this.validateInput(data, schema);
  }
}
```

## Cronograma de Implementação

### Fase 1: Infraestrutura Base (2-3 dias)
1. Criar estrutura de tipos MCP
2. Implementar handler básico
3. Adicionar propriedades ao node
4. Criar sistema de validação

### Fase 2: Mapeamento de Operações (3-4 dias)
1. Mapear todas as 27 operações existentes
2. Criar schemas de entrada/saída
3. Adicionar descrições semânticas
4. Implementar exemplos de uso

### Fase 3: Integração e Testes (2-3 dias)
1. Integrar com execução do node
2. Criar testes unitários
3. Testar com assistentes de IA
4. Documentar uso

### Fase 4: Otimizações (1-2 dias)
1. Implementar cache de metadados
2. Otimizar descoberta de ferramentas
3. Adicionar métricas de uso
4. Criar guia de migração

## Riscos e Mitigações

### Riscos
1. **Complexidade adicional**: Mais código para manter
2. **Performance**: Overhead na execução MCP
3. **Compatibilidade**: Garantir que não quebra uso existente
4. **Manutenção**: Manter schemas atualizados

### Mitigações
1. **Modularização**: Código MCP totalmente separado
2. **Cache**: Implementar cache agressivo
3. **Testes**: Suite completa de testes
4. **Documentação**: Guias claros de uso e manutenção

## Métricas de Sucesso

1. **Descoberta**: 100% das operações descobríveis via MCP
2. **Performance**: < 50ms de overhead na execução MCP
3. **Compatibilidade**: 0 quebras em fluxos existentes
4. **Adoção**: Documentação e exemplos para todos os casos de uso

## Conclusão

A implementação de suporte MCP no node Hotmart permitirá que assistentes de IA utilizem automaticamente todas as 27 operações disponíveis, mantendo compatibilidade total com o uso tradicional. Isso posicionará o node Hotmart como uma integração de próxima geração no ecossistema n8n.

## Apêndice: Lista Completa de Operações

### Vendas (6 operações)
- `sales.getHistoricoVendas` - Histórico de Vendas
- `sales.getComissoesVendas` - Comissões de Vendas
- `sales.getDetalhamentoPrecos` - Detalhamento de Preços
- `sales.getParticipantesVendas` - Participantes de Vendas
- `sales.solicitarReembolso` - Solicitar Reembolso
- `sales.getResumoVendas` - Sumário de Vendas

### Assinaturas (9 operações)
- `subscription.getAll` - Obter Assinaturas
- `subscription.getSummary` - Sumário de Assinaturas
- `subscription.getTransactions` - Transações de Assinatura
- `subscription.getPurchases` - Obter Compras de Assinantes
- `subscription.cancel` - Cancelar Assinatura
- `subscription.cancelList` - Cancelar Lista de Assinaturas
- `subscription.reactivate` - Reativar e Cobrar Assinatura
- `subscription.reactivateList` - Reativar Lista de Assinaturas
- `subscription.changeBillingDate` - Alterar dia de Cobrança

### Produtos (1 operação)
- `product.getAll` - Listar Produtos

### Cupons (3 operações)
- `coupon.create` - Criar Cupom
- `coupon.delete` - Excluir Cupom
- `coupon.get` - Obter Cupom

### Área de Membros (4 operações)
- `club.getModules` - Obter Módulos
- `club.getPages` - Obter Páginas
- `club.getAll` - Obter Alunos
- `club.getProgress` - Progresso do Aluno

### Ingressos (2 operações)
- `tickets.getAll` - Lista de Ingressos e Participantes
- `tickets.getInfo` - Informações do Evento

### Negociação (1 operação)
- `negotiate.generateNegotiation` - Gerar Negociação