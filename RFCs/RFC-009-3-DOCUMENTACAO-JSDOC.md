# RFC-009.3: Implementação de Documentação JSDoc

**Status**: Proposto  
**Data**: 22/05/2025  
**Autor**: Thales Laray  
**RFC Pai**: RFC-009  
**Dependências**: RFC-009.1, RFC-009.2

## Resumo

Sub-RFC focada na adição de documentação JSDoc em todos os métodos públicos, interfaces e tipos do nó Hotmart, melhorando a experiência do desenvolvedor e facilitando manutenção.

## Contexto

Com testes e CI/CD implementados, precisamos documentar adequadamente o código para facilitar contribuições futuras e melhorar o IntelliSense nas IDEs.

## Implementação Detalhada

### Passo 1: Configurar ESLint para JSDoc

```json
// .eslintrc.js
module.exports = {
  plugins: ['jsdoc'],
  extends: ['plugin:jsdoc/recommended-typescript'],
  rules: {
    'jsdoc/require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        }
      }
    ],
    'jsdoc/require-param': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-description': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-types': 'error'
  }
};
```

### Passo 2: Instalar Dependências

```bash
pnpm add -D eslint-plugin-jsdoc @types/jsdoc
```

### Passo 3: Template de Documentação para Nodes

```typescript
// nodes/Hotmart/Hotmart.node.ts

/**
 * Hotmart integration node for n8n
 * @class Hotmart
 * @extends {VersionedNodeType}
 * @description Main node class that handles versioning and delegates execution to specific versions
 * @since 0.1.0
 */
export class Hotmart extends VersionedNodeType {
  /**
   * Node description containing metadata and configuration
   * @type {INodeTypeDescription}
   * @readonly
   */
  description: INodeTypeDescription = {
    displayName: 'Hotmart',
    name: 'hotmart',
    // ...
  };

  /**
   * Creates version instances for the node
   * @param {number} version - Version number to instantiate
   * @returns {INodeType} The versioned node instance
   * @throws {Error} When version is not supported
   */
  constructor(baseDescription: INodeTypeBaseDescription) {
    super(baseDescription, versionDescription);
  }
}
```

### Passo 4: Documentar Métodos Execute

```typescript
// nodes/Hotmart/v1/HotmartV1.node.ts

/**
 * Executes the Hotmart node operation
 * @param {IExecuteFunctions} this - n8n execution context
 * @returns {Promise<INodeExecutionData[][]>} Array of execution results
 * @throws {NodeOperationError} When API request fails or invalid parameters
 * @example
 * // Execute subscription listing
 * const result = await execute.call(executeFunctions);
 * // Returns: [[{ json: { subscription_id: "123", ... } }]]
 */
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  return await router.call(this);
}
```

### Passo 5: Documentar Operações

```typescript
// nodes/Hotmart/v1/actions/subscription/getAll.operation.ts

/**
 * Operation to retrieve all subscriptions from Hotmart
 * @namespace getAll
 */

/**
 * Operation description for the UI
 * @type {INodeProperties}
 * @memberof getAll
 */
export const description: INodeProperties = {
  // ...
};

/**
 * Executes the get all subscriptions operation
 * @param {IExecuteFunctions} this - n8n execution context
 * @param {number} itemIndex - Index of the current item being processed
 * @returns {Promise<INodeExecutionData[]>} Array of subscription data
 * @throws {NodeApiError} When API request fails
 * @memberof getAll
 * 
 * @example
 * // Fetch all active subscriptions
 * const subscriptions = await execute.call(this, 0);
 * 
 * @example
 * // Fetch with pagination limit
 * this.getNodeParameter('limit', 0, 10);
 * const subscriptions = await execute.call(this, 0);
 */
export async function execute(
  this: IExecuteFunctions,
  itemIndex: number
): Promise<INodeExecutionData[]> {
  // implementation
}
```

### Passo 6: Documentar Helpers

```typescript
// nodes/Hotmart/v1/helpers/pagination.ts

/**
 * Handles pagination for Hotmart API responses
 * @param {IExecuteFunctions | ILoadOptionsFunctions} this - Execution context
 * @param {Function} requestFunction - Function to make API requests
 * @param {string} endpoint - API endpoint path
 * @param {object} params - Request parameters
 * @param {boolean} [params.returnAll=true] - Whether to fetch all pages
 * @param {number} [params.limit=500] - Maximum items to return
 * @returns {Promise<any[]>} All paginated results concatenated
 * @throws {Error} When request fails or invalid response
 * 
 * @example
 * // Fetch all pages
 * const allItems = await handlePagination.call(
 *   this,
 *   hotmartApiRequest,
 *   '/sales/history',
 *   { returnAll: true }
 * );
 * 
 * @example  
 * // Fetch limited items
 * const items = await handlePagination.call(
 *   this,
 *   hotmartApiRequest,
 *   '/sales/history',
 *   { returnAll: false, limit: 100 }
 * );
 */
export async function handlePagination(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  requestFunction: Function,
  endpoint: string,
  params: any = {}
): Promise<any[]> {
  // implementation
}
```

### Passo 7: Documentar Tipos e Interfaces

```typescript
// nodes/Hotmart/v1/types/index.ts

/**
 * Hotmart subscription status enumeration
 * @enum {string}
 * @readonly
 */
export enum SubscriptionStatus {
  /** Subscription is active and billing normally */
  ACTIVE = 'ACTIVE',
  /** Subscription was cancelled by user or admin */
  CANCELLED = 'CANCELLED',
  /** Subscription cancelled due to payment issues */
  CANCELLED_BY_PURCHASER = 'CANCELLED_BY_PURCHASER',
  /** Payment is delayed but subscription still active */
  DELAYED = 'DELAYED',
  /** Subscription expired after grace period */
  EXPIRED = 'EXPIRED'
}

/**
 * Represents a Hotmart subscription object
 * @interface IHotmartSubscription
 */
export interface IHotmartSubscription {
  /** Unique subscription identifier */
  subscription_id: string;
  /** Current subscription status */
  status: SubscriptionStatus;
  /** Subscription creation timestamp in milliseconds */
  creation_date: number;
  /** Last billing date timestamp */
  last_billing_date?: number;
  /** Subscriber information */
  subscriber: {
    /** Subscriber's email address */
    email: string;
    /** Subscriber's full name */
    name: string;
  };
}
```

### Passo 8: Documentar Transport/Request

```typescript
// nodes/Hotmart/v1/transport/request.ts

/**
 * Makes authenticated requests to Hotmart API
 * @param {IExecuteFunctions | ILoadOptionsFunctions} this - Execution context
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {object} [body] - Request body for POST/PUT requests
 * @param {object} [qs] - Query string parameters
 * @returns {Promise<any>} API response data
 * @throws {NodeApiError} When request fails with details
 * 
 * @example
 * // GET request
 * const products = await hotmartApiRequest.call(
 *   this, 
 *   'GET', 
 *   '/products'
 * );
 * 
 * @example
 * // POST request with body
 * const result = await hotmartApiRequest.call(
 *   this,
 *   'POST',
 *   '/coupons',
 *   { code: 'DISCOUNT10', percentage: 10 }
 * );
 */
export async function hotmartApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: string,
  endpoint: string,
  body?: any,
  qs?: any
): Promise<any> {
  // implementation
}
```

### Passo 9: Documentar LoadOptions

```typescript
// nodes/Hotmart/v1/methods/loadOptions.ts

/**
 * Loads product options dynamically from Hotmart API
 * @param {ILoadOptionsFunctions} this - Load options context
 * @returns {Promise<INodePropertyOptions[]>} Array of product options
 * @throws {NodeApiError} When unable to fetch products
 * 
 * @example
 * // Used in node parameter definition
 * {
 *   displayName: 'Product',
 *   name: 'productId',
 *   type: 'options',
 *   typeOptions: {
 *     loadOptionsMethod: 'getProducts'
 *   }
 * }
 */
export async function getProducts(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  // implementation
}
```

### Passo 10: Documentar Credenciais

```typescript
// credentials/HotmartOAuth2Api.credentials.ts

/**
 * OAuth2 credentials for Hotmart API authentication
 * @class HotmartOAuth2Api
 * @implements {ICredentialType}
 * @description Handles OAuth2 client credentials flow for Hotmart API
 */
export class HotmartOAuth2Api implements ICredentialType {
  /**
   * Credential name used internally by n8n
   * @readonly
   */
  name = 'hotmartOAuth2Api';

  /**
   * Display name shown in the UI
   * @readonly
   */
  displayName = 'Hotmart OAuth2 API';

  /**
   * Tests the credential validity
   * @param {ICredentialTestRequest} credentials - Credentials to test
   * @returns {Promise<INodeCredentialTestResult>} Test result
   */
  async test(
    credentials: ICredentialTestRequest
  ): Promise<INodeCredentialTestResult> {
    // implementation
  }
}
```

### Passo 11: Gerar Documentação HTML

```bash
# Instalar TypeDoc
pnpm add -D typedoc typedoc-plugin-markdown

# typedoc.json
{
  "entryPoints": ["./nodes", "./credentials"],
  "entryPointStrategy": "expand",
  "out": "./docs/api",
  "readme": "./README.md",
  "plugin": ["typedoc-plugin-markdown"],
  "theme": "default",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "categorizeByGroup": true,
  "navigationLinks": {
    "GitHub": "https://github.com/thaleslaray/n8n-nodes-hotmart",
    "NPM": "https://www.npmjs.com/package/n8n-nodes-hotmart"
  }
}

# package.json scripts
{
  "docs:generate": "typedoc",
  "docs:serve": "npx serve ./docs/api"
}
```

### Passo 12: Exemplo Completo Documentado

```typescript
/**
 * @fileoverview Subscription cancellation operation for Hotmart API
 * @module subscription/cancel
 * @requires n8n-workflow
 */

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

/**
 * Cancels a Hotmart subscription
 * @param {IExecuteFunctions} this - n8n execution context
 * @param {number} itemIndex - Current item index
 * @returns {Promise<INodeExecutionData[]>} Cancellation result
 * @throws {NodeApiError} When subscription not found or already cancelled
 * 
 * @example
 * // Cancel a subscription
 * this.getNodeParameter('subscriptionId', 0); // 'sub_123'
 * const result = await execute.call(this, 0);
 * // Returns: [{ json: { subscription_id: 'sub_123', status: 'CANCELLED' } }]
 * 
 * @since 0.1.0
 * @see {@link https://developers.hotmart.com/docs/pt-BR/v2/subscription/cancel-subscription}
 */
export async function execute(
  this: IExecuteFunctions,
  itemIndex: number
): Promise<INodeExecutionData[]> {
  const subscriptionId = this.getNodeParameter('subscriptionId', itemIndex) as string;
  
  try {
    const response = await hotmartApiRequest.call(
      this,
      'DELETE',
      `/subscriptions/${subscriptionId}`
    );
    
    return [{ json: response }];
  } catch (error) {
    throw new NodeApiError(this.getNode(), error);
  }
}
```

### Cronograma de Implementação

| Dia | Tarefas |
|-----|---------|
| 1 | Configurar ESLint e TypeDoc |
| 2 | Documentar nodes principais |
| 3 | Documentar operations |
| 4 | Documentar helpers e utils |
| 5 | Documentar tipos e gerar docs |

### Métricas de Sucesso

- [ ] 100% dos métodos públicos documentados
- [ ] ESLint validando JSDoc
- [ ] Documentação HTML gerada
- [ ] IntelliSense funcionando nas IDEs
- [ ] Exemplos em todas as funções principais

### Benefícios

1. **DX Melhorado**: IntelliSense completo
2. **Manutenção**: Código autodocumentado
3. **Onboarding**: Novos devs entendem rapidamente
4. **API Docs**: Documentação gerada automaticamente

### Próximos Passos

Após conclusão desta RFC, prosseguir para RFC-009.4 (Melhorias Finais).