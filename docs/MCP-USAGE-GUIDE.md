# Guia de Uso do Suporte MCP no Node Hotmart

## Visão Geral

O suporte MCP (Model Context Protocol) permite que assistentes de IA descubram e usem as operações do node Hotmart de forma programática. Isso facilita a automação e integração com ferramentas de IA.

## Como Habilitar o MCP

1. No node Hotmart, ative a opção **"Enable MCP Support"**
2. Escolha entre usar o modo de descoberta ou executar comandos específicos

## Modos de Operação

### 1. Modo Discovery (Descoberta)

Use para descobrir operações disponíveis:

```json
{
  "command": "discover",
  "filters": {
    "category": "subscription",
    "tags": ["assinatura"]
  }
}
```

### 2. Modo Execution (Execução)

Execute operações específicas:

```json
{
  "tool": "subscription.getAll",
  "arguments": {
    "product_id": "prod_123",
    "status": "ACTIVE"
  }
}
```

## Operações Disponíveis

### Assinaturas (9 operações)
- `subscription.getAll` - Listar assinaturas
- `subscription.getPurchases` - Obter compras de assinantes
- `subscription.getSummary` - Resumo estatístico
- `subscription.getTransactions` - Transações de assinatura
- `subscription.cancel` - Cancelar assinatura
- `subscription.cancelList` - Cancelar múltiplas
- `subscription.reactivate` - Reativar assinatura
- `subscription.reactivateList` - Reativar múltiplas
- `subscription.changeBillingDate` - Alterar dia de cobrança

### Vendas (6 operações)
- `sales.getHistoricoVendas` - Histórico de vendas
- `sales.getResumoVendas` - Resumo de vendas
- `sales.getComissoesVendas` - Comissões
- `sales.getDetalhamentoPrecos` - Detalhamento de preços
- `sales.getParticipantesVendas` - Participantes
- `sales.solicitarReembolso` - Solicitar reembolso

### Produtos (1 operação)
- `product.getAll` - Listar produtos

### Cupons (3 operações)
- `coupon.create` - Criar cupom
- `coupon.get` - Obter cupom
- `coupon.delete` - Excluir cupom

### Área de Membros (4 operações)
- `club.getAll` - Listar alunos
- `club.getModules` - Obter módulos
- `club.getPages` - Obter páginas
- `club.getProgress` - Progresso do aluno

### Ingressos (2 operações)
- `tickets.getAll` - Listar ingressos
- `tickets.getInfo` - Informações do evento

### Negociação (1 operação)
- `negotiate.generateNegotiation` - Gerar link de pagamento

## Exemplos de Uso

### Descobrir Operações de Assinatura

```javascript
// Input no campo MCP Command
{
  "command": "discover",
  "filters": {
    "category": "subscription"
  }
}
```

### Buscar Assinaturas Ativas

```javascript
// Input no campo MCP Command
{
  "tool": "subscription.getAll",
  "arguments": {
    "status": "ACTIVE",
    "returnAll": true
  }
}
```

### Obter Histórico de Vendas com Filtros

```javascript
// Input no campo MCP Command
{
  "tool": "sales.getHistoricoVendas",
  "arguments": {
    "product_id": "prod_abc123",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-05-22T23:59:59Z",
    "transaction_status": "APPROVED"
  }
}
```

### Criar Cupom de Desconto

```javascript
// Input no campo MCP Command
{
  "tool": "coupon.create",
  "arguments": {
    "code": "DESCONTO20",
    "product_id": "prod_xyz",
    "discount_type": "percentage",
    "discount_value": 20,
    "max_uses": 100
  }
}
```

## Recursos Avançados

### Cache de Resultados

O MCP suporta cache automático de resultados para melhorar performance:

```javascript
{
  "tool": "product.getAll",
  "arguments": {},
  "context": {
    "useCache": true,
    "cacheTTL": 600000 // 10 minutos
  }
}
```

### Validação Sem Execução

Valide comandos antes de executar:

```javascript
{
  "tool": "subscription.cancel",
  "arguments": {
    "subscription_id": "sub_123"
  },
  "context": {
    "validateOnly": true
  }
}
```

### Timeout Personalizado

Configure timeout para operações longas:

```javascript
{
  "tool": "sales.getHistoricoVendas",
  "arguments": {
    "returnAll": true
  },
  "context": {
    "timeout": 300000 // 5 minutos
  }
}
```

## Integração com Assistentes de IA

### Claude
```javascript
// O assistente pode descobrir e usar operações automaticamente
"Por favor, obtenha todas as assinaturas ativas do produto X"
```

### ChatGPT com Function Calling
```javascript
// Configure as funções MCP como tools do GPT
{
  "type": "function",
  "function": {
    "name": "subscription.getAll",
    "description": "Obter lista de assinaturas com filtros avançados",
    "parameters": { /* schema from MCP */ }
  }
}
```

## Tratamento de Erros

O MCP retorna erros estruturados:

```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo obrigatório ausente",
    "details": {
      "errors": [
        {
          "path": "product_id",
          "message": "product_id é obrigatório"
        }
      ]
    }
  }
}
```

## Melhores Práticas

1. **Use Discovery para explorar**: Antes de executar, descubra as operações disponíveis
2. **Valide antes de executar**: Use `validateOnly: true` para testar comandos
3. **Aproveite o cache**: Para dados que não mudam frequentemente
4. **Configure timeouts adequados**: Para operações que retornam muitos dados
5. **Trate erros adequadamente**: Verifique sempre o campo `success` na resposta

## Limitações

- O cache é mantido em memória (não persiste entre execuções)
- Timeout máximo de 10 minutos
- Algumas operações podem ter rate limits da API Hotmart

## Suporte

Para problemas ou sugestões relacionadas ao MCP:
1. Verifique os logs do n8n para mensagens de erro detalhadas
2. Use o modo de validação para debugar comandos
3. Consulte a documentação da API Hotmart para detalhes dos parâmetros