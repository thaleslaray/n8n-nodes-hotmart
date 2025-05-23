# RFC-008: Implementação de Suporte MCP nos Nós Hotmart

**Data:** 22/05/2025  
**Status:** Proposta  
**Autor:** Sistema

## Resumo

Implementar suporte completo ao Model Context Protocol (MCP) nos nós Hotmart, permitindo que sejam descobertos e utilizados por assistentes de IA enquanto mantém total compatibilidade com uso tradicional.

## Motivação

- Permitir que assistentes de IA descubram e usem os nós Hotmart
- Fornecer documentação estruturada via schemas JSON
- Melhorar a experiência de automação com IA
- Seguir padrões modernos de integração IA/ferramentas

## Proposta Detalhada

### 1. Estrutura de Arquivos

```
nodes/Hotmart/v1/
├── types/
│   └── mcpTypes.ts          # Interfaces e tipos MCP
├── nlp/
│   └── mcpHandler.ts        # Handler para execução MCP
├── actions/
│   └── mcpDescriptions.ts   # Descrições e schemas MCP
├── methods/
│   └── loadOptions.ts       # + getMcpTools()
└── HotmartV1.node.ts        # + integração MCP
```

### 2. Tipos MCP (`types/mcpTypes.ts`)

```typescript
export interface McpNodeMetadata {
  enabled: boolean;
  tools: McpToolDefinition[];
}

export interface McpToolDefinition {
  name: string;
  description: string;
  category: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  outputSchema?: {
    type: 'object';
    properties: Record<string, any>;
  };
}
```

### 3. Propriedades MCP no Node

Adicionar em `HotmartV1.node.ts`:

```typescript
{
  displayName: 'Habilitar Suporte MCP',
  name: 'mcpSupport',
  type: 'boolean',
  default: false,
  description: 'Permite descoberta e uso por assistentes de IA via MCP',
}
```

### 4. Descrições MCP (`actions/mcpDescriptions.ts`)

Estrutura para cada operação:

```typescript
'sales.getHistoricoVendas': {
  name: 'hotmart_get_sales_history',
  description: 'Busca histórico de vendas da Hotmart',
  category: 'vendas',
  inputSchema: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date' },
      endDate: { type: 'string', format: 'date' },
      productId: { type: 'string' },
      // ... outros campos
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      sales: { type: 'array' },
      total: { type: 'number' }
    }
  }
}
```

### 5. Operações a Documentar

**Total: 26 operações**

#### Sales (6)
- `getHistoricoVendas`
- `getComissoesVendas`
- `getResumoVendas`
- `getParticipantesVendas`
- `getDetalhamentoPrecos`
- `solicitarReembolso`

#### Subscription (9)
- `getAll`
- `getSummary`
- `getTransactions`
- `getPurchases`
- `cancel`
- `cancelList`
- `reactivate`
- `reactivateList`
- `changeBillingDate`

#### Product (1)
- `getAll`

#### Coupon (3)
- `create`
- `get`
- `delete`

#### Club (4)
- `getAll`
- `getModules`
- `getPages`
- `getProgress`

#### Tickets (2)
- `getAll`
- `getInfo`

#### Negotiate (1)
- `generateNegotiation`

### 6. Handler MCP (`nlp/mcpHandler.ts`)

```typescript
export class McpHandler {
  static getMcpMetadata(resource: string, operation: string): McpToolDefinition | undefined
  static async executeMcpOperation(context: IExecuteFunctions, toolName: string, args: Record<string, any>): Promise<INodeExecutionData[][]>
  static getAvailableTools(): McpToolDefinition[]
}
```

### 7. Integração no Node Principal

Em `HotmartV1.node.ts`:

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const mcpSupport = this.getNodeParameter('mcpSupport', 0, false) as boolean;
  
  if (mcpSupport && this.getNodeParameter('mcpCommand', 0, null)) {
    const mcpCommand = this.getNodeParameter('mcpCommand', 0) as {
      tool: string;
      arguments: Record<string, any>;
    };
    
    return await McpHandler.executeMcpOperation(
      this,
      mcpCommand.tool,
      mcpCommand.arguments
    );
  }
  
  return await router.call(this);
}
```

### 8. Metadados no Codex

```typescript
codex: {
  // ... existente
  mcpMetadata: {
    version: '1.0',
    tools: McpHandler.getAvailableTools(),
  },
}
```

## Cronograma de Implementação

1. **Fase 1 (20 min)**: Estrutura base
   - Criar diretórios e arquivos base
   - Implementar tipos MCP
   - Adicionar propriedades ao node

2. **Fase 2 (40 min)**: Descrições MCP
   - Documentar todas as 26 operações
   - Criar schemas de entrada/saída
   - Validar com exemplos

3. **Fase 3 (30 min)**: Handler e Integração
   - Implementar McpHandler
   - Integrar com execução
   - Adicionar descoberta dinâmica

4. **Fase 4 (10 min)**: Testes e Ajustes
   - Testar execução normal
   - Testar execução MCP
   - Documentar uso

## Riscos e Mitigações

- **Risco**: Quebrar funcionalidade existente
  - **Mitigação**: MCP é opt-in via propriedade booleana

- **Risco**: Complexidade de manutenção
  - **Mitigação**: Código MCP isolado em arquivos específicos

## Conclusão

Esta implementação permitirá que os nós Hotmart sejam utilizados tanto por humanos no n8n tradicional quanto por assistentes de IA via MCP, mantendo total compatibilidade e expandindo significativamente os casos de uso.