# RFC-010: Implementação Completa de AI Ready para Node Hotmart

**Autor:** Thales Laray  
**Data:** 23/05/2025  
**Status:** Proposta  
**Versão:** 1.0.0

## Resumo Executivo

Esta RFC define a estratégia definitiva para tornar o node Hotmart totalmente compatível com AI Agents no n8n, baseada em análise profunda de nodes oficiais e nas limitações da versão atual.

## Problema

1. **Versão Incompatível**: O projeto usa n8n-workflow 1.0.1, mas `usableAsTool` e `NodeConnectionTypes` foram introduzidos na versão 1.92.0+
2. **AI Agents não reconhecem o node**: Sem `usableAsTool: true`, o node não aparece como ferramenta disponível para AI
3. **Melhorias de UX não são suficientes**: Hints e descrições ajudam humanos, mas AI precisa de metadados específicos

## Pesquisa Realizada

### Nodes Analisados com `usableAsTool: true`

Analisei 20 nodes oficiais do n8n que implementam AI Ready:
- Crypto, S3, Hunter, JWT (implementação simples)
- Twitter V2 (implementação tradicional com execute)
- JinaAI (implementação moderna com routing)
- Freshservice, NextCloud, HaloPSA, etc.

### Padrões Identificados

1. **Implementação Básica** (100% dos nodes analisados):
```typescript
import { NodeConnectionTypes } from 'n8n-workflow';

// Em description: INodeTypeDescription
usableAsTool: true,
inputs: [NodeConnectionTypes.Main],
outputs: [NodeConnectionTypes.Main],
```

2. **Campo `action` nas operações** (usado em nodes modernos):
```typescript
{
  name: 'Obter Vendas',
  value: 'getHistoricoVendas',
  action: 'Obter histórico de vendas', // ← Para AI entender
  description: 'Retorna lista de vendas com filtros'
}
```

3. **NodeConnectionTypes disponíveis**:
- `Main` - Conexão padrão de dados
- `AiAgent`, `AiTool`, `AiChain` - Conexões específicas de AI (não usadas nos nodes básicos)

4. **Sem campos especiais**: Nenhum node usa `codex`, `aiCategories` ou campos similares

## Solução Proposta

### Estratégia de Implementação em 3 Fases

#### Fase 1: Preparação para AI Ready (Imediata)

1. **Adicionar campo `action` em todas as operações**:
```typescript
// Em versionDescription.ts
{
  name: 'Obter Assinaturas',
  value: 'getAll',
  description: 'Listar todas as assinaturas',
  action: 'Obter assinaturas da Hotmart', // ← NOVO
}
```

2. **Criar documentação AI-friendly**:
```typescript
// nodes/Hotmart/v1/docs/aiDocumentation.ts
export const aiOperationDocs = {
  'subscription.getAll': {
    summary: 'Lista assinaturas da Hotmart',
    examples: [
      'listar assinaturas ativas',
      'buscar assinaturas canceladas este mês',
      'obter assinaturas do produto X'
    ],
    parameters: {
      status: 'Filtra por ACTIVE, CANCELED, PAST_DUE',
      productId: 'ID do produto específico',
      startDate: 'Data inicial no formato YYYY-MM-DD'
    }
  },
  // ... todas as operações
};
```

3. **Implementar metadados customizados**:
```typescript
// Em versionDescription.ts
properties: [
  {
    displayName: 'AI Metadata',
    name: '_aiMetadata',
    type: 'hidden',
    default: {
      version: '1.0',
      capabilities: [
        'sales_management',
        'subscription_management',
        'product_listing',
        'coupon_creation'
      ]
    }
  },
  // ... outras propriedades
]
```

#### Fase 2: Atualização de Dependências (Quando possível)

1. **Atualizar n8n-workflow para 1.92.0+**:
```json
{
  "dependencies": {
    "n8n-workflow": "^1.92.0"
  }
}
```

2. **Implementar AI Ready oficial**:
```typescript
import { NodeConnectionTypes } from 'n8n-workflow';

export const versionDescription: INodeTypeDescription = {
  // ... outras configs
  usableAsTool: true,
  inputs: [NodeConnectionTypes.Main],
  outputs: [NodeConnectionTypes.Main],
  // ...
};
```

#### Fase 3: Implementação MCP Externa (Opcional)

1. **Criar servidor MCP dedicado** (baseado em EXEMPLO-MCP-NODE-CORRETO.md):
```javascript
// hotmart-mcp-server/index.js
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server({
  name: "hotmart-mcp",
  version: "1.0.0",
});

// Registrar todas as operações Hotmart como tools MCP
server.setRequestHandler("tools/list", async () => ({
  tools: Object.entries(aiOperationDocs).map(([key, doc]) => ({
    name: key.replace('.', '_'),
    description: doc.summary,
    inputSchema: {
      type: "object",
      properties: doc.parameters
    }
  }))
}));
```

2. **Webhook bridge para n8n**:
- Criar workflow webhook que recebe comandos MCP
- Traduzir para operações Hotmart
- Retornar resultados formatados

## Plano de Migração

### Passo 1: Backup e Branch (5 min)
```bash
./backup
git checkout -b feature/ai-ready-implementation
```

### Passo 2: Implementar Fase 1 (30 min)
1. Adicionar `action` em todas as 26 operações
2. Criar arquivo `aiDocumentation.ts`
3. Adicionar campo `_aiMetadata` hidden
4. Testar que não quebra funcionalidade existente

### Passo 3: Preparar para Fase 2 (15 min)
1. Criar branch `feature/ai-ready-full`
2. Documentar dependências necessárias
3. Criar script de migração

### Passo 4: Documentação (15 min)
1. Atualizar README com seção "AI Agent Support"
2. Criar exemplos de uso com AI
3. Documentar limitações da versão atual

## Cronograma

| Fase | Tempo | Dependências | Impacto |
|------|-------|--------------|---------|
| Fase 1 | 1 hora | Nenhuma | Melhora descoberta por AI |
| Fase 2 | 30 min | n8n 1.92.0+ | AI Ready completo |
| Fase 3 | 2 horas | Servidor MCP | Integração avançada |

## Riscos e Mitigações

### Risco 1: Incompatibilidade de versão
- **Mitigação**: Fase 1 funciona com qualquer versão
- **Plano B**: Usar MCP externo se atualização não for possível

### Risco 2: Breaking changes
- **Mitigação**: Todas as mudanças são aditivas
- **Teste**: Suite completa após cada fase

### Risco 3: Performance
- **Mitigação**: Metadados são mínimos
- **Monitoramento**: Logs de tempo de execução

## Decisão Requerida

Recomendo implementar **Fase 1 imediatamente**, pois:
1. Não tem dependências
2. Melhora significativa para AI
3. Prepara terreno para fases futuras
4. Zero risco de breaking changes

## Código de Exemplo - Fase 1

```typescript
// versionDescription.ts - Adicionar action
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['subscription'],
    },
  },
  options: [
    {
      name: 'Obter Assinaturas',
      value: 'getAll',
      description: 'Listar todas as assinaturas',
      action: 'Obter assinaturas da Hotmart', // ← NOVO
    },
    {
      name: 'Cancelar Assinatura',
      value: 'cancel',
      description: 'Cancela uma assinatura',
      action: 'Cancelar assinatura na Hotmart', // ← NOVO
    },
    // ... todas as operações
  ],
}
```

## Conclusão

Esta RFC propõe uma abordagem pragmática em fases que:
1. Entrega valor imediato (Fase 1)
2. Prepara para o futuro (Fase 2)
3. Permite extensibilidade (Fase 3)

A implementação da Fase 1 pode ser feita hoje, sem riscos, melhorando significativamente a compatibilidade com AI Agents.

## Referências

- [n8n AI Nodes Documentation](https://docs.n8n.io/code/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
- [Model Context Protocol](https://spec.modelcontextprotocol.io)
- Análise de 20 nodes oficiais com `usableAsTool: true`
- EXEMPLO-MCP-NODE-CORRETO.md
- GUIA-SUPORTE-MCP-EM-NODES.md