# Plano de Implementação MCP - Abordagem Correta

## 🎯 Objetivo Real do MCP

Permitir que usuários não-técnicos usem o n8n através de linguagem natural:
- "Liste todas as vendas de ontem"
- "Cancele assinaturas vencidas"
- "Crie um relatório de vendas do mês"

A IA abstrai toda a complexidade de configurar nodes, parâmetros e workflows.

## 📐 Arquitetura Correta

```
┌─────────────────────┐
│   Usuário Final     │
│ "Liste vendas hoje" │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    IA Assistant     │ (Claude, GPT, etc)
│  - Entende comando  │
│  - Mapeia p/ MCP    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    MCP Server       │ (Servidor MCP rodando localmente)
│  - Descobre nodes   │
│  - Executa via n8n  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    n8n Instance     │
│  - API/Webhooks     │
│  - Executa workflows│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Node Hotmart      │
│  - Operações reais  │
└─────────────────────┘
```

## 🛠️ Implementação em 3 Partes

### Parte 1: Preparar Node Hotmart para Descoberta

**Objetivo**: Adicionar metadados que descrevem o que o node pode fazer

```typescript
// nodes/Hotmart/v1/mcp/metadata.ts

export const HOTMART_MCP_METADATA = {
  tool: {
    name: "hotmart",
    description: "Integração com Hotmart para gerenciar vendas, assinaturas e produtos",
    version: "1.0.0"
  },
  
  commands: [
    {
      name: "listar_vendas",
      description: "Lista vendas com filtros de data, produto e status",
      examples: [
        "liste todas as vendas de hoje",
        "mostre vendas do produto X este mês",
        "vendas aprovadas da última semana"
      ],
      parameters: {
        periodo: {
          type: "string",
          description: "Período temporal (hoje, ontem, esta semana, este mês, últimos X dias)",
          ai_hint: "Converter linguagem natural para datas específicas"
        },
        produto: {
          type: "string", 
          description: "Nome ou ID do produto",
          optional: true
        },
        status: {
          type: "string",
          enum: ["aprovada", "cancelada", "reembolsada", "todas"],
          default: "todas"
        }
      },
      maps_to: {
        node: "n8n-nodes-hotmart.hotmart",
        resource: "sales",
        operation: "getHistoricoVendas"
      }
    },
    
    {
      name: "listar_assinaturas",
      description: "Lista assinaturas ativas, canceladas ou vencidas",
      examples: [
        "mostre todas assinaturas ativas",
        "assinaturas que vencem esta semana",
        "assinaturas canceladas este mês"
      ],
      parameters: {
        status: {
          type: "string",
          enum: ["ativa", "cancelada", "vencida", "todas"],
          ai_hint: "Mapear: ativa=ACTIVE, cancelada=CANCELED, vencida=EXPIRED"
        },
        produto: {
          type: "string",
          optional: true
        }
      },
      maps_to: {
        node: "n8n-nodes-hotmart.hotmart",
        resource: "subscription", 
        operation: "getAll"
      }
    },
    
    {
      name: "cancelar_assinatura",
      description: "Cancela uma ou mais assinaturas",
      examples: [
        "cancele a assinatura do email@exemplo.com",
        "cancele todas assinaturas vencidas",
        "cancele assinatura ID 12345"
      ],
      parameters: {
        identificador: {
          type: "string",
          description: "Email, ID ou filtro (ex: 'todas vencidas')",
          required: true
        },
        motivo: {
          type: "string",
          default: "Solicitado via assistente"
        }
      },
      maps_to: {
        node: "n8n-nodes-hotmart.hotmart",
        resource: "subscription",
        operation: "cancel"
      }
    }
    
    // ... mais comandos
  ]
};
```

### Parte 2: Criar Servidor MCP

**Objetivo**: Servidor que recebe comandos em linguagem natural e executa no n8n

```typescript
// mcp-server/src/hotmart-mcp-server.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { HOTMART_MCP_METADATA } from './hotmart-metadata';

class HotmartMCPServer {
  private n8nApiUrl: string;
  private n8nApiKey: string;
  
  constructor() {
    this.n8nApiUrl = process.env.N8N_API_URL || 'http://localhost:5678';
    this.n8nApiKey = process.env.N8N_API_KEY || '';
  }
  
  async start() {
    const server = new Server({
      name: "hotmart-mcp",
      version: "1.0.0"
    });
    
    // Registrar ferramentas disponíveis
    server.setRequestHandler('tools/list', async () => {
      return {
        tools: HOTMART_MCP_METADATA.commands.map(cmd => ({
          name: cmd.name,
          description: cmd.description,
          inputSchema: {
            type: "object",
            properties: cmd.parameters
          }
        }))
      };
    });
    
    // Executar comandos
    server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      // Encontrar comando
      const command = HOTMART_MCP_METADATA.commands.find(c => c.name === name);
      if (!command) {
        throw new Error(`Comando não encontrado: ${name}`);
      }
      
      // Executar via n8n API
      const result = await this.executeViaWebhook(command, args);
      
      return {
        content: [
          {
            type: "text",
            text: this.formatResponse(result)
          }
        ]
      };
    });
    
    // Iniciar servidor
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
  
  private async executeViaWebhook(command: any, args: any) {
    // Criar payload para webhook n8n
    const payload = {
      command: command.maps_to,
      parameters: this.mapArgumentsToN8nParams(command, args)
    };
    
    // Chamar webhook n8n
    const response = await fetch(`${this.n8nApiUrl}/webhook/mcp-hotmart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.n8nApiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    return await response.json();
  }
  
  private mapArgumentsToN8nParams(command: any, args: any) {
    // Lógica de mapeamento específica
    // Ex: converter "hoje" para data atual
    // Ex: converter "ativa" para "ACTIVE"
    return args;
  }
  
  private formatResponse(data: any): string {
    // Formatar resposta em linguagem natural
    if (Array.isArray(data)) {
      return `Encontrei ${data.length} resultados:\n${data.map(item => 
        `- ${item.name || item.email}: ${item.status}`
      ).join('\n')}`;
    }
    return JSON.stringify(data, null, 2);
  }
}

// Iniciar servidor
new HotmartMCPServer().start();
```

### Parte 3: Criar Workflow n8n de Gateway

**Objetivo**: Workflow que recebe comandos do MCP Server e executa

```json
{
  "name": "MCP Gateway - Hotmart",
  "nodes": [
    {
      "name": "Webhook MCP",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "mcp-hotmart",
        "authentication": "headerAuth",
        "headerAuth": {
          "name": "Authorization",
          "value": "={{ $env.MCP_WEBHOOK_TOKEN }}"
        }
      }
    },
    {
      "name": "Parse Command",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "// Extrair comando e parâmetros\nconst { command, parameters } = items[0].json;\n\n// Preparar para node Hotmart\nreturn [{\n  json: {\n    ...parameters,\n    _mcpCommand: command\n  }\n}];"
      }
    },
    {
      "name": "Hotmart",
      "type": "n8n-nodes-hotmart.hotmart",
      "parameters": {
        "resource": "={{ $json._mcpCommand.resource }}",
        "operation": "={{ $json._mcpCommand.operation }}",
        // Parâmetros dinâmicos baseados no comando
      }
    },
    {
      "name": "Format Response",
      "type": "n8n-nodes-base.code", 
      "parameters": {
        "code": "// Formatar resposta para MCP\nreturn items;"
      }
    }
  ]
}
```

## 📦 Configuração do MCP Client (Claude, etc)

```json
{
  "mcpServers": {
    "hotmart": {
      "command": "node",
      "args": ["/path/to/hotmart-mcp-server.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 🎯 Fluxo de Uso Real

1. **Usuário**: "Liste todas as vendas aprovadas de hoje"

2. **Claude/IA**: 
   - Identifica comando: `listar_vendas`
   - Extrai parâmetros: `periodo="hoje"`, `status="aprovada"`
   - Chama MCP: `tools/call` com esses dados

3. **MCP Server**:
   - Recebe comando
   - Mapeia "hoje" → data atual
   - Mapeia "aprovada" → "APPROVED"
   - Chama webhook n8n

4. **n8n Workflow**:
   - Recebe via webhook
   - Executa node Hotmart
   - Retorna dados

5. **Resposta ao usuário**:
   "Encontrei 15 vendas aprovadas hoje, totalizando R$ 3.450,00"

## ✅ Benefícios desta Abordagem

1. **Separação de responsabilidades**:
   - Node Hotmart: executa operações
   - MCP Server: traduz linguagem natural
   - n8n: orquestra execução

2. **Usuário não-técnico**:
   - Não precisa saber o que é n8n
   - Não precisa configurar nodes
   - Usa linguagem natural

3. **Flexibilidade**:
   - Fácil adicionar novos comandos
   - Pode evoluir IA sem mudar node
   - Suporta múltiplos assistentes

## 🚀 Próximos Passos

1. **Implementar metadados** no node Hotmart
2. **Criar MCP Server** como projeto separado
3. **Configurar workflow** gateway no n8n
4. **Testar com Claude/GPT**
5. **Documentar para usuários**

Esta é a forma correta que preserva a arquitetura e adiciona valor real!