# 🎯 Estratégia Codeloop para 100% de Cobertura

## 🔍 Análise dos Casos "Impossíveis"

### 1. **Respostas HTTP 400 do webhook (linhas 1272-1274, 1314-1316)**

```typescript
if (!eventConfig) {
  this.logger.debug(`[${nodeName}] Evento não reconhecido: ${eventName}`);
  res.status(400).send('Evento desconhecido');
  return { noWebhookResponse: true };
}
```

**Problema**: O mock de `res.status().send()` não está funcionando corretamente.

**Solução Codeloop**:
1. Criar um mock mais profundo do response object
2. Usar jest.spyOn para interceptar métodos encadeados
3. Verificar se o mock está sendo aplicado corretamente

### 2. **Default case no switch (linha 1449)**

```typescript
default:
  // Não deveria chegar aqui pois já validamos o evento
  outputIndex = -1;
```

**Problema**: É um caso impossível porque validamos o evento antes.

**Solução Codeloop**:
1. Mockar temporariamente a função getEventConfig para retornar um evento válido mas não mapeado
2. Usar jest.doMock para substituir o módulo em runtime
3. Criar um evento fake que passe pela validação mas caia no default

### 3. **Branches em aiDocumentation.ts (linhas 393-402)**

```typescript
// Provavelmente um branch condicional não testado
```

**Solução Codeloop**:
1. Identificar qual condição não está sendo testada
2. Criar um teste específico para esse branch
3. Usar dados de entrada que forcem esse caminho

## 🚀 Implementação Codeloop

### Fase 1: Actor (Gerar Código)
- Criar mocks profundos para response HTTP
- Implementar estratégia de mock dinâmico para getEventConfig
- Gerar testes para branches não cobertos

### Fase 2: Critic (Revisar)
- Verificar se os mocks não quebram outros testes
- Validar que a cobertura realmente aumenta
- Garantir que não estamos "trapaceando" a cobertura

### Fase 3: Improve (Melhorar)
- Refinar os testes para serem mais robustos
- Documentar as técnicas usadas
- Criar helpers reutilizáveis para futuros casos difíceis

## 🎨 Técnicas Avançadas a Usar

1. **Mock Module Factory**
```javascript
jest.mock('../path/to/module', () => {
  const original = jest.requireActual('../path/to/module');
  return {
    ...original,
    getEventConfig: jest.fn((event) => {
      if (event === 'FAKE_BUT_VALID') {
        return { name: 'FAKE_BUT_VALID', displayName: 'Fake' };
      }
      return original.getEventConfig(event);
    })
  };
});
```

2. **Response Chain Mocking**
```javascript
const mockRes = {
  status: jest.fn(() => mockRes),
  send: jest.fn(() => mockRes),
  json: jest.fn(() => mockRes)
};
```

3. **Dynamic Import Mocking**
```javascript
beforeEach(() => {
  jest.resetModules();
  jest.doMock('../module', () => ({
    // custom implementation
  }));
});
```

## 📋 Checklist de Implementação

- [ ] Resolver HTTP 400 responses (6 linhas)
- [ ] Resolver default case (1 linha)
- [ ] Resolver branches aiDocumentation (? linhas)
- [ ] Validar 100% de cobertura
- [ ] Criar documentação das técnicas

## 🎯 Meta Final

**100% de cobertura em TODAS as métricas!**
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

---

*"O impossível é apenas uma opinião"* - Codeloop Philosophy