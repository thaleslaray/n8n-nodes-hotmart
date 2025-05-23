# RFC-009.1: Implementação de Testes Automatizados

**Status**: Proposto  
**Data**: 22/05/2025  
**Autor**: Thales Laray  
**RFC Pai**: RFC-009

## Resumo

Sub-RFC focada exclusivamente na implementação de testes automatizados com Jest, incluindo configuração, estrutura, e implementação de testes unitários e de integração para atingir 80% de cobertura.

## Contexto

Esta é a primeira e mais crítica fase da RFC-009. Sem testes, o nó não pode ser verificado oficialmente pelo n8n.

## Implementação Detalhada

### Passo 1: Instalar Dependências

```bash
pnpm add -D jest @types/jest ts-jest @jest/globals
pnpm add -D @types/node
```

### Passo 2: Criar jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'nodes/**/*.ts',
    '!nodes/**/*.d.ts',
    '!nodes/**/index.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testTimeout: 10000,
  verbose: true
};
```

### Passo 3: Atualizar package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest __tests__/unit",
    "test:integration": "jest __tests__/integration"
  }
}
```

### Passo 4: Criar Estrutura de Testes

```bash
mkdir -p __tests__/{unit,integration,fixtures}/{nodes,actions,helpers,transport}
mkdir -p __tests__/fixtures/{mocks,responses}
```

### Passo 5: Criar Helpers de Teste

```typescript
// __tests__/helpers/testHelpers.ts
import type { IExecuteFunctions, INode } from 'n8n-workflow';

export function createMockExecuteFunctions(overrides?: Partial<IExecuteFunctions>): IExecuteFunctions {
  return {
    getNodeParameter: jest.fn(),
    getCredentials: jest.fn(),
    helpers: {
      request: jest.fn(),
      requestOAuth2: jest.fn(),
    },
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
    continueOnFail: jest.fn().mockReturnValue(false),
    ...overrides,
  } as unknown as IExecuteFunctions;
}

export function createMockNode(): INode {
  return {
    id: 'test-node-id',
    name: 'Hotmart Test',
    type: 'n8n-nodes-hotmart.hotmart',
    typeVersion: 1,
    position: [0, 0],
    parameters: {},
  };
}
```

### Passo 6: Fixtures de Respostas da API

```typescript
// __tests__/fixtures/responses/subscription.fixtures.ts
export const mockSubscriptionList = {
  items: [
    {
      subscription_id: 'sub_123',
      status: 'ACTIVE',
      subscriber: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      product: {
        id: 'prod_123',
        name: 'Test Product'
      },
      price: {
        value: 99.90,
        currency_code: 'BRL'
      },
      creation_date: 1704067200000,
      last_billing_date: 1704067200000,
      next_billing_date: 1706745600000
    }
  ],
  page_info: {
    total_results: 1,
    next_page_token: null
  }
};

export const mockSubscriptionCancelled = {
  subscription_id: 'sub_123',
  status: 'CANCELLED',
  cancellation_date: 1704153600000
};
```

### Passo 7: Testes Unitários - Helpers

```typescript
// __tests__/unit/helpers/dateUtils.test.ts
import { formatDate, parseHotmartDate } from '../../../nodes/Hotmart/v1/helpers/dateUtils';

describe('DateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2024-01-01')).toBe('01/01/2024');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('Data inválida');
    });

    it('should handle null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('parseHotmartDate', () => {
    it('should parse milliseconds timestamp', () => {
      const result = parseHotmartDate(1704067200000);
      expect(result).toEqual(new Date('2024-01-01'));
    });

    it('should handle string dates', () => {
      const result = parseHotmartDate('2024-01-01');
      expect(result).toEqual(new Date('2024-01-01'));
    });
  });
});
```

### Passo 8: Testes Unitários - Paginação

```typescript
// __tests__/unit/helpers/pagination.test.ts
import { handlePagination } from '../../../nodes/Hotmart/v1/helpers/pagination';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';

describe('Pagination', () => {
  let mockThis: IExecuteFunctions;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    mockThis = createMockExecuteFunctions();
    mockRequest = jest.fn();
  });

  it('should handle single page response', async () => {
    mockRequest.mockResolvedValueOnce({
      items: [{ id: 1 }, { id: 2 }],
      page_info: { next_page_token: null }
    });

    const result = await handlePagination.call(
      mockThis,
      mockRequest,
      '/sales/history',
      {}
    );

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
  });

  it('should handle multiple pages', async () => {
    mockRequest
      .mockResolvedValueOnce({
        items: [{ id: 1 }, { id: 2 }],
        page_info: { next_page_token: 'token1' }
      })
      .mockResolvedValueOnce({
        items: [{ id: 3 }, { id: 4 }],
        page_info: { next_page_token: null }
      });

    const result = await handlePagination.call(
      mockThis,
      mockRequest,
      '/sales/history',
      { returnAll: true }
    );

    expect(mockRequest).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(4);
  });

  it('should respect limit when returnAll is false', async () => {
    mockThis.getNodeParameter = jest.fn().mockReturnValue(2);
    
    mockRequest.mockResolvedValueOnce({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      page_info: { next_page_token: 'token1' }
    });

    const result = await handlePagination.call(
      mockThis,
      mockRequest,
      '/sales/history',
      { returnAll: false }
    );

    expect(result).toHaveLength(2);
  });
});
```

### Passo 9: Testes de Operações

```typescript
// __tests__/unit/actions/subscription/getAll.test.ts
import { getAll } from '../../../../nodes/Hotmart/v1/actions/subscription/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import { mockSubscriptionList } from '../../../fixtures/responses/subscription.fixtures';

describe('Subscription - Get All', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunctions();
    mockThis.helpers.requestOAuth2 = jest.fn().mockResolvedValue(mockSubscriptionList);
  });

  it('should fetch subscriptions with filters', async () => {
    mockThis.getNodeParameter = jest.fn()
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(10) // limit
      .mockReturnValueOnce({ // filters
        status: 'ACTIVE',
        product_id: 'prod_123'
      });

    const result = await getAll.execute.call(mockThis, 0);

    expect(mockThis.helpers.requestOAuth2).toHaveBeenCalledWith(
      'hotmartOAuth2Api',
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/subscriptions'),
        qs: expect.objectContaining({
          status: 'ACTIVE',
          product_id: 'prod_123',
          page_size: 10
        })
      })
    );

    expect(result).toEqual([{ json: mockSubscriptionList.items[0] }]);
  });

  it('should handle empty results', async () => {
    mockThis.helpers.requestOAuth2 = jest.fn().mockResolvedValue({
      items: [],
      page_info: {}
    });

    const result = await getAll.execute.call(mockThis, 0);
    
    expect(result).toEqual([]);
  });
});
```

### Passo 10: Testes de Integração

```typescript
// __tests__/integration/oauth.test.ts
import { hotmartApiRequest } from '../../../nodes/Hotmart/v1/transport/request';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';

describe('OAuth Integration', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunctions();
    mockThis.getCredentials = jest.fn().mockResolvedValue({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      environment: 'sandbox'
    });
  });

  it('should add OAuth headers to request', async () => {
    const mockResponse = { data: 'test' };
    mockThis.helpers.requestOAuth2 = jest.fn().mockResolvedValue(mockResponse);

    const result = await hotmartApiRequest.call(
      mockThis,
      'GET',
      '/products'
    );

    expect(mockThis.helpers.requestOAuth2).toHaveBeenCalledWith(
      'hotmartOAuth2Api',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('should handle authentication errors', async () => {
    mockThis.helpers.requestOAuth2 = jest.fn().mockRejectedValue({
      statusCode: 401,
      message: 'Unauthorized'
    });

    await expect(
      hotmartApiRequest.call(mockThis, 'GET', '/products')
    ).rejects.toThrow('Unauthorized');
  });
});
```

### Passo 11: Teste do Node Principal

```typescript
// __tests__/unit/nodes/Hotmart.node.test.ts
import { Hotmart } from '../../../nodes/Hotmart/Hotmart.node';
import { HotmartV1 } from '../../../nodes/Hotmart/v1/HotmartV1.node';

describe('Hotmart Node', () => {
  let hotmart: Hotmart;

  beforeEach(() => {
    hotmart = new Hotmart();
  });

  it('should have correct description', () => {
    expect(hotmart.description.displayName).toBe('Hotmart');
    expect(hotmart.description.name).toBe('hotmart');
    expect(hotmart.description.group).toEqual(['transform']);
  });

  it('should have version 1', () => {
    expect(hotmart.description.version).toBe(1);
    expect(hotmart.description.defaultVersion).toBe(1);
  });

  it('should create correct version instance', () => {
    const nodeVersions = hotmart.nodeVersions;
    expect(nodeVersions[1]).toBeInstanceOf(HotmartV1);
  });
});
```

### Passo 12: Script de Teste Completo

```bash
#!/bin/bash
# scripts/run-tests.sh

echo "🧪 Running Hotmart Node Tests..."

# Clean coverage directory
rm -rf coverage

# Run tests with coverage
pnpm test:coverage

# Check coverage thresholds
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
  echo "📊 Coverage report: coverage/lcov-report/index.html"
else
  echo "❌ Tests failed. Please fix before committing."
  exit 1
fi
```

### Cronograma de Implementação

| Dia | Tarefas |
|-----|---------|
| 1-2 | Setup Jest, estrutura, helpers |
| 3-4 | Testes unitários helpers |
| 5-6 | Testes unitários operações |
| 7-8 | Testes de integração |
| 9-10 | Aumentar cobertura para 80% |
| 11-12 | Refatoração e documentação |

### Métricas de Sucesso

- [ ] Jest configurado e funcionando
- [ ] Estrutura de testes criada
- [ ] 80% de cobertura de código
- [ ] Todos os testes passando
- [ ] Tempo de execução < 30 segundos

### Próximos Passos

Após conclusão desta RFC, prosseguir para RFC-009.2 (CI/CD).