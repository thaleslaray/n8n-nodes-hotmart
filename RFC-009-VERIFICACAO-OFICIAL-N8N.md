# RFC-009: Implementação de Requisitos para Verificação Oficial n8n

**Status**: Proposto  
**Data**: 22/05/2025  
**Autor**: Thales Laray

## Resumo

Esta RFC define o plano de implementação dos requisitos necessários para obter a verificação oficial do nó Hotmart pela equipe do n8n. O foco principal é adicionar testes automatizados, CI/CD e melhorias na documentação.

## Motivação

A verificação oficial do n8n trará:

- Maior visibilidade e confiança para o nó
- Inclusão na documentação oficial
- Suporte da comunidade n8n
- Possível destaque no marketplace

## Proposta Detalhada

### Fase 1: Testes Automatizados (CRÍTICO)

#### 1.1 Configuração do Jest

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts']
};
```

#### 1.2 Estrutura de Testes

```
n8n-nodes-hotmart/
├── __tests__/
│   ├── unit/
│   │   ├── nodes/
│   │   │   ├── Hotmart.node.test.ts
│   │   │   └── HotmartTrigger.node.test.ts
│   │   ├── actions/
│   │   │   ├── sales/
│   │   │   ├── subscription/
│   │   │   └── ...
│   │   └── helpers/
│   │       ├── pagination.test.ts
│   │       └── dateUtils.test.ts
│   ├── integration/
│   │   ├── oauth.test.ts
│   │   └── api-flow.test.ts
│   └── fixtures/
│       ├── mocks/
│       └── responses/
```

#### 1.3 Testes Unitários Essenciais

```typescript
// Exemplo: __tests__/unit/helpers/pagination.test.ts
describe('Pagination Helper', () => {
  it('should handle pagination correctly', async () => {
    // Mock da API
    const mockRequest = jest.fn()
      .mockResolvedValueOnce({ items: [...], page_info: { next_page_token: 'token1' }})
      .mockResolvedValueOnce({ items: [...], page_info: {}});

    const result = await handlePagination(mockRequest, params);

    expect(mockRequest).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(expectedLength);
  });
});
```

#### 1.4 Testes de Integração

```typescript
// __tests__/integration/oauth.test.ts
describe('OAuth Integration', () => {
  it('should authenticate successfully', async () => {
    const credentials = {
      clientId: 'test-id',
      clientSecret: 'test-secret',
      environment: 'sandbox',
    };

    const token = await getOAuthToken(credentials);
    expect(token).toBeDefined();
    expect(token.access_token).toBeTruthy();
  });
});
```

### Fase 2: CI/CD com GitHub Actions

#### 2.1 Workflow de Testes

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.10.0

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

#### 2.2 Workflow de Build

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18.x'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.10.0

      - name: Install and Build
        run: |
          pnpm install
          pnpm build

      - name: Verify build output
        run: |
          ls -la dist/
          test -f dist/nodes/Hotmart/Hotmart.node.js
```

#### 2.3 Workflow de Release

```yaml
# .github/workflows/release.yml
name: Release

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18.x'
          registry-url: 'https://registry.npmjs.org'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.10.0

      - name: Install, Build and Publish
        run: |
          pnpm install
          pnpm build
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Fase 3: Documentação com JSDoc

#### 3.1 Exemplo de JSDoc para Métodos

```typescript
/**
 * Executes a Hotmart API operation
 * @param {IExecuteFunctions} this - n8n execution context
 * @returns {Promise<INodeExecutionData[][]>} The operation results
 * @throws {NodeOperationError} When API request fails
 * @example
 * const results = await hotmartApiRequest.call(this, 'GET', '/sales/history');
 */
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  // implementation
}

/**
 * Handles pagination for Hotmart API responses
 * @param {Function} requestFunction - Function to make API requests
 * @param {PaginationParams} params - Pagination parameters
 * @param {number} params.limit - Maximum items per page
 * @param {string} params.endpoint - API endpoint
 * @returns {Promise<any[]>} All paginated results
 */
async function handlePagination(
  requestFunction: Function,
  params: PaginationParams
): Promise<any[]> {
  // implementation
}
```

#### 3.2 Documentação de Tipos

```typescript
/**
 * Hotmart subscription status
 * @typedef {Object} SubscriptionStatus
 * @property {string} ACTIVE - Subscription is active
 * @property {string} CANCELLED - Subscription was cancelled
 * @property {string} DELAYED_PAYMENT - Payment is delayed
 * @property {string} OVERDUE - Payment is overdue
 * @property {string} EXPIRED - Subscription expired
 */
```

### Fase 4: Melhorias Adicionais

#### 4.1 Badges no README

```markdown
![Tests](https://github.com/thaleslaray/n8n-nodes-hotmart/workflows/Tests/badge.svg)
![Coverage](https://codecov.io/gh/thaleslaray/n8n-nodes-hotmart/branch/master/graph/badge.svg)
![npm](https://img.shields.io/npm/v/n8n-nodes-hotmart)
![License](https://img.shields.io/npm/l/n8n-nodes-hotmart)
```

#### 4.2 Correções Legais

```markdown
# LICENSE.md

MIT License

Copyright (c) 2024 Thales Laray

# CODE_OF_CONDUCT.md

[//]: # 'Update contact email'

Please report unacceptable behavior to [thales@example.com].
```

### Timeline de Implementação

| Fase | Tarefa                           | Duração | Prioridade |
| ---- | -------------------------------- | ------- | ---------- |
| 1    | Setup Jest e estrutura de testes | 2 dias  | ALTA       |
| 1    | Testes unitários core            | 5 dias  | ALTA       |
| 1    | Testes de integração             | 3 dias  | ALTA       |
| 1    | Atingir 80% cobertura            | 2 dias  | ALTA       |
| 2    | GitHub Actions - Testes          | 1 dia   | MÉDIA      |
| 2    | GitHub Actions - Build           | 1 dia   | MÉDIA      |
| 2    | GitHub Actions - Release         | 1 dia   | MÉDIA      |
| 3    | JSDoc em métodos públicos        | 3 dias  | MÉDIA      |
| 3    | Documentação de tipos            | 2 dias  | BAIXA      |
| 4    | Badges e melhorias README        | 1 dia   | BAIXA      |
| 4    | Correções legais                 | 1 dia   | BAIXA      |

**Total estimado**: 3-4 semanas

### Critérios de Sucesso

1. ✅ Cobertura de testes > 80%
2. ✅ Todos os testes passando no CI
3. ✅ Build automático funcionando
4. ✅ JSDoc em todos métodos públicos
5. ✅ Aprovação da equipe n8n

### Riscos e Mitigações

| Risco                         | Probabilidade | Impacto | Mitigação                  |
| ----------------------------- | ------------- | ------- | -------------------------- |
| Complexidade dos mocks da API | Alta          | Médio   | Usar fixtures reais da API |
| Tempo de implementação        | Média         | Alto    | Priorizar testes críticos  |
| Mudanças na API n8n           | Baixa         | Alto    | Manter compatibilidade     |

### Alternativas Consideradas

1. **Usar Vitest ao invés de Jest**: Descartado por Jest ser padrão n8n
2. **Testes E2E com n8n real**: Adiado para fase posterior
3. **Documentação com TypeDoc**: Pode ser adicionado futuramente

### Decisão

Implementar todas as fases propostas, priorizando testes automatizados como bloqueador principal para verificação oficial.

### Referências

- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Community Nodes](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base)
- [Jest Documentation](https://jestjs.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
