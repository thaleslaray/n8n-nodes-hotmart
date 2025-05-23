# Guia: Adicionando Suporte MCP a Nodes n8n Existentes

## Visão Geral

Este guia mostra como adicionar suporte Model Context Protocol (MCP) a nodes n8n existentes, permitindo que sejam descobertos e utilizados por assistentes de IA.

## Conceito de Suporte MCP em Nodes

Diferente de criar nodes MCP dedicados (McpClientTool/McpTrigger), adicionar suporte MCP significa:
- Tornar as operações do node descobríveis por IA
- Fornecer descrições semânticas das funcionalidades
- Permitir execução via protocolo MCP
- Manter compatibilidade com uso tradicional

## Implementação para o Node Hotmart

### 1. Estrutura de Metadados MCP

```typescript
// nodes/Hotmart/v1/types/mcpTypes.ts
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

### 2. Adicionar Propriedade MCP ao Node

```typescript
// Em HotmartV1.node.ts
properties: [
  // ... propriedades existentes
  {
    displayName: 'Habilitar Suporte MCP',
    name: 'mcpSupport',
    type: 'boolean',
    default: false,
    description: 'Permite que este node seja descoberto e usado por assistentes de IA via MCP',
    displayOptions: {
      show: {
        resource: ['@ALL'],
      },
    },
  },
  {
    displayName: 'Descrição MCP',
    name: 'mcpDescription',
    type: 'string',
    default: '',
    description: 'Descrição adicional para ajudar a IA entender este node',
    displayOptions: {
      show: {
        mcpSupport: [true],
      },
    },
  },
]
```

### 3. Definir Descrições MCP para Operações

```typescript
// nodes/Hotmart/v1/actions/mcpDescriptions.ts
export const mcpOperationDescriptions: Record<string, McpToolDefinition> = {
  // Vendas
  'sales.getHistoricoVendas': {
    name: 'hotmart_get_sales_history',
    description: 'Busca histórico de vendas da Hotmart com filtros de data, status e produto',
    category: 'vendas',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Data inicial (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Data final (YYYY-MM-DD)'
        },
        productId: {
          type: 'string',
          description: 'ID do produto Hotmart'
        },
        buyerEmail: {
          type: 'string',
          description: 'Email do comprador'
        },
        transactionStatus: {
          type: 'string',
          enum: ['APPROVED', 'CANCELED', 'PENDING'],
          description: 'Status da transação'
        }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        sales: {
          type: 'array',
          description: 'Lista de vendas'
        },
        total: {
          type: 'number',
          description: 'Total de vendas encontradas'
        }
      }
    }
  },
  
  // Assinaturas
  'subscription.getAll': {
    name: 'hotmart_list_subscriptions',
    description: 'Lista assinaturas com filtros por status, data e produto',
    category: 'assinaturas',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ACTIVE', 'CANCELED', 'PAST_DUE'],
          description: 'Status da assinatura'
        },
        productId: {
          type: 'string',
          description: 'ID do produto'
        }
      }
    }
  },
  
  // Produtos
  'product.getAll': {
    name: 'hotmart_list_products',
    description: 'Lista todos os produtos disponíveis na conta Hotmart',
    category: 'produtos',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
};
```

### 4. Implementar Handler MCP

```typescript
// nodes/Hotmart/v1/nlp/mcpHandler.ts
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { mcpOperationDescriptions } from '../actions/mcpDescriptions';

export class McpHandler {
  /**
   * Retorna metadados MCP para descoberta
   */
  static getMcpMetadata(resource: string, operation: string): McpToolDefinition | undefined {
    const key = `${resource}.${operation}`;
    return mcpOperationDescriptions[key];
  }

  /**
   * Executa operação com contexto MCP
   */
  static async executeMcpOperation(
    context: IExecuteFunctions,
    toolName: string,
    args: Record<string, any>
  ): Promise<INodeExecutionData[][]> {
    // Encontrar operação correspondente
    const operation = Object.entries(mcpOperationDescriptions)
      .find(([_, def]) => def.name === toolName);
    
    if (!operation) {
      throw new Error(`Operação MCP não encontrada: ${toolName}`);
    }

    const [operationKey] = operation;
    const [resource, operationName] = operationKey.split('.');

    // Configurar parâmetros do node
    context.getNodeParameter = ((originalFn) => {
      return (parameterName: string, itemIndex?: number, fallbackValue?: any) => {
        // Interceptar chamadas de parâmetros para injetar valores MCP
        if (parameterName === 'resource') return resource;
        if (parameterName === 'operation') return operationName;
        
        // Mapear argumentos MCP para parâmetros do node
        if (args[parameterName] !== undefined) {
          return args[parameterName];
        }
        
        return originalFn.call(context, parameterName, itemIndex, fallbackValue);
      };
    })(context.getNodeParameter.bind(context));

    // Executar operação normal
    const { router } = await import('../actions/router');
    return await router.call(context);
  }

  /**
   * Gera lista de ferramentas MCP disponíveis
   */
  static getAvailableTools(): McpToolDefinition[] {
    return Object.values(mcpOperationDescriptions);
  }
}
```

### 5. Integrar com Execução do Node

```typescript
// Em HotmartV1.node.ts
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const mcpSupport = this.getNodeParameter('mcpSupport', 0, false) as boolean;
  
  // Se estiver em modo MCP e receber comando MCP
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
  
  // Execução normal
  return await router.call(this);
}
```

### 6. Expor Metadados via Node Description

```typescript
// Em HotmartV1.node.ts
export class HotmartV1 implements INodeType {
  description: INodeTypeDescription = {
    // ... configurações existentes
    
    // Adicionar metadados MCP
    codex: {
      categories: ['Marketing & Content'],
      subcategories: {
        'Marketing & Content': ['E-Commerce'],
      },
      resources: {
        primaryDocumentation: [
          {
            url: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hotmart/',
          },
        ],
      },
      // Novo: metadados MCP
      mcpMetadata: {
        version: '1.0',
        tools: McpHandler.getAvailableTools(),
      },
    },
  };
}
```

### 7. Adicionar Descoberta Dinâmica

```typescript
// nodes/Hotmart/v1/methods/loadOptions.ts
export async function getMcpTools(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  const tools = McpHandler.getAvailableTools();
  
  return tools.map(tool => ({
    name: `${tool.category}: ${tool.description}`,
    value: tool.name,
    description: `Entrada: ${JSON.stringify(tool.inputSchema.properties)}`,
  }));
}

// Adicionar ao methods do node
methods = {
  loadOptions: {
    // ... outros métodos
    getMcpTools,
  },
};
```

## Exemplo de Uso

### 1. Uso Tradicional (sem MCP)
```json
{
  "nodes": [
    {
      "name": "Hotmart",
      "type": "n8n-nodes-hotmart.hotmart",
      "parameters": {
        "resource": "sales",
        "operation": "getHistoricoVendas",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31"
      }
    }
  ]
}
```

### 2. Uso via MCP
```json
{
  "nodes": [
    {
      "name": "Hotmart MCP",
      "type": "n8n-nodes-hotmart.hotmart",
      "parameters": {
        "mcpSupport": true,
        "mcpCommand": {
          "tool": "hotmart_get_sales_history",
          "arguments": {
            "startDate": "2024-01-01",
            "endDate": "2024-12-31"
          }
        }
      }
    }
  ]
}
```

## Benefícios desta Abordagem

1. **Compatibilidade**: Node continua funcionando normalmente sem MCP
2. **Descoberta**: Assistentes de IA podem descobrir e usar o node
3. **Documentação**: Schemas definem claramente entradas/saídas
4. **Flexibilidade**: Fácil adicionar/remover suporte MCP
5. **Manutenção**: Código MCP separado do código principal

## Próximos Passos

1. Implementar as descrições MCP para todas as operações
2. Adicionar validação de schemas
3. Criar testes para execução MCP
4. Documentar para usuários finais
5. Considerar cache de metadados MCP

## Conclusão

Esta abordagem permite que nodes existentes ganhem capacidades MCP sem quebrar compatibilidade, tornando-os utilizáveis tanto por humanos quanto por assistentes de IA.