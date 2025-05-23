# Exemplo de Implementação MCP Correta para n8n

Baseado na documentação oficial e no node `n8n-nodes-mcp` da comunidade.

## Arquitetura Correta do MCP no n8n

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AI Assistant   │     │  MCP Client     │     │   MCP Server    │
│  (Claude, GPT)  │ <-> │  Tool (n8n)     │ <-> │   (External)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Como MCP Funciona no n8n

### 1. MCP Client Tool Node
- **Propósito**: Conecta n8n a servidores MCP externos
- **Uso**: Como ferramenta em AI Agents
- **Transporte**: HTTP Streamable (recomendado)

### 2. MCP Server Trigger Node
- **Propósito**: Expõe ferramentas do n8n para clientes MCP
- **Uso**: Torna workflows acessíveis via MCP

## Implementação Correta para Node Hotmart

### Opção 1: Usar MCP Client Tool (Recomendado)

**Não modifique o node Hotmart!** Em vez disso:

1. **Crie um MCP Server externo** que expõe as operações Hotmart:

```javascript
// hotmart-mcp-server/index.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "hotmart-server",
  version: "1.0.0",
});

// Registrar ferramentas
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "listar_vendas",
      description: "Lista vendas da Hotmart com filtros",
      inputSchema: {
        type: "object",
        properties: {
          periodo: { type: "string", description: "hoje, ontem, este mês" },
          status: { type: "string", enum: ["aprovada", "cancelada", "todas"] }
        }
      }
    },
    {
      name: "listar_assinaturas", 
      description: "Lista assinaturas ativas ou canceladas",
      inputSchema: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ativa", "cancelada", "todas"] }
        }
      }
    }
  ]
}));

// Executar ferramentas
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  // Chamar n8n via webhook
  const response = await fetch("http://localhost:5678/webhook/hotmart-mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: name, args })
  });
  
  const result = await response.json();
  
  return {
    content: [{
      type: "text",
      text: formatarResposta(result)
    }]
  };
});

// Iniciar servidor
const transport = new StdioServerTransport();
await server.connect(transport);
```

2. **Configure o MCP Client Tool no n8n**:

```json
{
  "nodes": [
    {
      "name": "MCP Client",
      "type": "n8n-nodes-mcp.mcpClient",
      "parameters": {
        "operation": "executeTool",
        "toolName": "listar_vendas",
        "toolParameters": {
          "periodo": "hoje",
          "status": "aprovada"
        }
      },
      "credentials": {
        "mcpApi": {
          "transportMethod": "httpStreamable",
          "httpStreamableUrl": "http://localhost:3000/stream"
        }
      }
    }
  ]
}
```

3. **Crie um webhook workflow no n8n**:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "hotmart-mcp",
        "method": "POST"
      }
    },
    {
      "name": "Parse Request",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": `
          const { tool, args } = items[0].json;
          
          // Mapear ferramenta para operação Hotmart
          const mapping = {
            'listar_vendas': { resource: 'sales', operation: 'getHistoricoVendas' },
            'listar_assinaturas': { resource: 'subscription', operation: 'getAll' }
          };
          
          const config = mapping[tool];
          
          return [{
            json: {
              ...config,
              ...args
            }
          }];
        `
      }
    },
    {
      "name": "Hotmart",
      "type": "n8n-nodes-hotmart.hotmart",
      "parameters": {
        "resource": "={{ $json.resource }}",
        "operation": "={{ $json.operation }}"
        // Outros parâmetros mapeados dinamicamente
      }
    }
  ]
}
```

### Opção 2: Usar MCP Server Trigger

Se quiser expor o Hotmart diretamente:

```json
{
  "nodes": [
    {
      "name": "MCP Server",
      "type": "n8n-nodes-langchain.mcpTrigger",
      "parameters": {
        "tools": [
          {
            "name": "hotmart_vendas",
            "description": "Buscar vendas na Hotmart",
            "schema": {
              "type": "object",
              "properties": {
                "dataInicio": { "type": "string" },
                "dataFim": { "type": "string" }
              }
            }
          }
        ]
      }
    },
    {
      "name": "Router",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "dataPropertyName": "toolName",
        "values": {
          "string": [
            { "value": "hotmart_vendas" }
          ]
        }
      }
    },
    {
      "name": "Hotmart",
      "type": "n8n-nodes-hotmart.hotmart",
      "parameters": {
        "resource": "sales",
        "operation": "getHistoricoVendas"
      }
    }
  ]
}
```

## Pontos Importantes

### ✅ O que FAZER:

1. **Manter o node Hotmart intacto** - Não adicione lógica MCP
2. **Usar nodes MCP dedicados** - MCP Client Tool ou MCP Server Trigger
3. **Criar servidor MCP separado** - Para lógica de linguagem natural
4. **Usar webhooks** - Para comunicação entre MCP e n8n

### ❌ O que NÃO fazer:

1. **Não adicione toggle MCP** no node Hotmart
2. **Não processe comandos MCP** dentro do node
3. **Não misture responsabilidades** - Node faz operações, MCP faz protocolo

## Fluxo Completo

```
1. Usuário: "Liste vendas de hoje"
   ↓
2. AI Assistant (Claude): Entende e chama MCP
   ↓
3. MCP Client Tool (n8n): Chama servidor MCP
   ↓
4. MCP Server: Traduz e chama webhook n8n
   ↓
5. Webhook Workflow: Executa node Hotmart
   ↓
6. Resposta formatada: "15 vendas encontradas"
```

## Vantagens desta Abordagem

1. **Separação clara** de responsabilidades
2. **Reutilização** do node existente
3. **Flexibilidade** para adicionar novos comandos
4. **Compatibilidade** com arquitetura n8n
5. **Manutenibilidade** simplificada

## Configuração de Ambiente

```bash
# Para usar MCP Client como ferramenta em AI Agents
export N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true

# Instalar node MCP da comunidade
npm install -g n8n-nodes-mcp

# Iniciar servidor MCP
node hotmart-mcp-server/index.js
```

## Conclusão

A implementação correta de MCP no n8n:
- Usa nodes dedicados (MCP Client Tool / MCP Server Trigger)
- Mantém nodes de integração (como Hotmart) sem modificação
- Separa protocolo MCP da lógica de negócio
- Permite uso por AI sem complexidade no node original