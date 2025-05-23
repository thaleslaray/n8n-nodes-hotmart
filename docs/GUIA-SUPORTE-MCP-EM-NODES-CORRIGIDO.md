# Guia CORRIGIDO: Preparando Nodes n8n para Descoberta via MCP

## ⚠️ Esclarecimento Importante

Este guia NÃO transforma nodes em servidores MCP. Em vez disso, ele prepara nodes existentes para serem **descobertos e utilizados** por um MCP Server externo.

## Como MCP Funciona no n8n

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Ferramenta    │     │   MCP Server    │     │   Node n8n      │
│   Externa (IA)  │ <-> │   (Trigger)     │ <-> │   (Hotmart)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         1                       2                        3

1. Ferramenta externa se conecta ao MCP Server
2. MCP Server descobre nodes disponíveis e suas capacidades
3. MCP Server executa operações nos nodes conforme solicitado
```

## O que Este Guia Realmente Faz

### 1. Adiciona Metadados de Descoberta

Permite que um MCP Server entenda:
- Quais operações o node oferece
- Quais parâmetros cada operação aceita
- Qual o formato esperado de entrada/saída

### 2. NÃO Adiciona Funcionalidade MCP ao Node

O node continua sendo um node normal. Ele NÃO:
- Recebe conexões MCP diretamente
- Processa comandos MCP
- Atua como servidor

## Implementação Correta

### 1. Arquivo de Metadados para Descoberta

```typescript
// nodes/Hotmart/v1/metadata/operations.metadata.ts

/**
 * Metadados que descrevem as operações do node
 * Usado por ferramentas externas para descoberta
 */
export const HOTMART_OPERATIONS_METADATA = {
  version: '1.0',
  namespace: 'n8n-nodes-hotmart',
  operations: {
    'sales.getHistoricoVendas': {
      displayName: 'Get Sales History',
      description: 'Retrieve sales history from Hotmart with filters',
      inputs: {
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Start date for filtering sales',
          required: false
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'End date for filtering sales',
          required: false
        },
        productId: {
          type: 'string',
          description: 'Filter by specific product ID',
          required: false
        }
      },
      outputs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            transactionId: { type: 'string' },
            productName: { type: 'string' },
            buyerEmail: { type: 'string' },
            value: { type: 'number' },
            status: { type: 'string' }
          }
        }
      }
    },
    // ... outras operações
  }
};
```

### 2. Expor Metadados no Node (Opcional)

```typescript
// nodes/Hotmart/Hotmart.node.json
{
  "node": "n8n-nodes-hotmart.hotmart",
  "nodeVersion": "1.0",
  "codexVersion": "1.0",
  "categories": ["Marketing", "Sales"],
  "icon": "hotmart.svg",
  "resources": {
    // ... recursos existentes
  },
  // Novo: referência aos metadados (se o n8n suportar no futuro)
  "metadata": {
    "discoverable": true,
    "metadataFile": "./v1/metadata/operations.metadata.ts"
  }
}
```

### 3. Helper para MCP Servers (Opcional)

Se quiser facilitar para desenvolvedores de MCP Servers:

```typescript
// nodes/Hotmart/v1/helpers/mcpDiscovery.ts

/**
 * Helper para MCP Servers descobrirem as capacidades deste node
 * Este arquivo NÃO é usado pelo node em si
 */
export class HotmartMcpDiscovery {
  /**
   * Retorna todas as operações disponíveis em formato padronizado
   */
  static getAvailableOperations() {
    return HOTMART_OPERATIONS_METADATA.operations;
  }

  /**
   * Converte parâmetros MCP para formato n8n
   */
  static mapMcpToNodeParams(operation: string, mcpParams: any) {
    // Lógica de mapeamento se necessário
    return mcpParams;
  }

  /**
   * Converte saída n8n para formato MCP
   */
  static mapNodeOutputToMcp(operation: string, nodeOutput: any) {
    // Lógica de mapeamento se necessário
    return nodeOutput;
  }
}
```

## Como um MCP Server Usaria Isso

```typescript
// Exemplo de código em um MCP Server (NÃO no node Hotmart)

import { HotmartMcpDiscovery } from 'n8n-nodes-hotmart/helpers/mcpDiscovery';

class McpServer {
  async discoverHotmartCapabilities() {
    // Descobre operações disponíveis
    const operations = HotmartMcpDiscovery.getAvailableOperations();
    
    // Registra as operações como ferramentas MCP
    for (const [opName, opDef] of Object.entries(operations)) {
      this.registerTool({
        name: `hotmart_${opName}`,
        description: opDef.description,
        parameters: opDef.inputs,
        handler: async (params) => {
          // Executa no n8n via API ou outro método
          return await this.executeN8nNode('hotmart', opName, params);
        }
      });
    }
  }
}
```

## O que NÃO Fazer

### ❌ NÃO adicione ao node:

1. **Toggle "Enable MCP"** - Não faz sentido
2. **Campo "MCP Command"** - Node não processa comandos MCP
3. **Lógica de execução MCP** - Node executa normalmente
4. **Handler MCP interno** - MCP handling é externo

### ❌ NÃO modifique a execução:

```typescript
// ERRADO - Não faça isso!
async execute() {
  if (this.getNodeParameter('mcpEnabled')) {
    // Processar comando MCP
  }
}
```

## Resumo

1. **Nodes n8n são nodes n8n** - Eles executam operações, não processam MCP
2. **MCP Servers são separados** - Eles descobrem e orquestram nodes
3. **Metadados ajudam na descoberta** - Mas são opcionais e informativos
4. **Não misture responsabilidades** - Node faz uma coisa, MCP Server faz outra

## Alternativas Reais para Integração IA

Se o objetivo é permitir que IA use o node Hotmart:

### Opção 1: Use a API HTTP do n8n
```bash
# IA pode chamar workflows via API
curl -X POST https://n8n.example.com/webhook/hotmart-sales
```

### Opção 2: Crie um Webhook Workflow
1. Crie workflow com Webhook trigger
2. Adicione node Hotmart
3. IA chama o webhook

### Opção 3: Use n8n com LangChain/Function Calling
- Configure o node como uma "tool" em sistemas de IA
- Use a API do n8n para execução

## Conclusão

Este guia esclarece que:
- Nodes não se tornam servidores MCP
- Metadados são para descoberta externa
- A arquitetura permanece: `Ferramenta IA → MCP Server → n8n → Node`
- Não adicione complexidade desnecessária ao node