# Exemplo de Implementação: Recurso de Assinaturas

Este documento apresenta um exemplo completo de implementação do recurso de Assinaturas da API Hotmart no n8n, seguindo a arquitetura proposta no plano de integração. Este exemplo servirá como validação da arquitetura e modelo para implementação dos demais recursos.

## Estrutura de Arquivos para o Recurso de Assinaturas

```
n8n-nodes-hotmart/
├── credentials/
│   └── HotmartOAuth2Api.credentials.ts
├── nodes/
│   ├── Hotmart/
│   │   ├── Hotmart.node.json
│   │   ├── Hotmart.node.ts
│   │   ├── hotmart.svg
│   │   ├── v1/
│   │   │   ├── HotmartV1.node.ts
│   │   │   ├── actions/
│   │   │   │   ├── router.ts
│   │   │   │   ├── versionDescription.ts
│   │   │   │   ├── common.descriptions.ts
│   │   │   │   ├── node.type.ts
│   │   │   │   ├── subscription/
│   │   │   │   │   ├── Subscription.resource.ts
│   │   │   │   │   ├── getAll.operation.ts
│   │   │   │   │   ├── cancel.operation.ts
│   │   │   │   │   ├── cancelList.operation.ts
│   │   │   │   │   ├── changeBillingDate.operation.ts
│   │   │   │   │   ├── getPurchases.operation.ts
│   │   │   │   │   ├── reactivate.operation.ts
│   │   │   │   │   └── getSummary.operation.ts
│   │   │   ├── methods/
│   │   │   │   └── loadOptions.ts
│   │   │   ├── transport/
│   │   │   │   └── request.ts
│   │   │   ├── helpers/
│   │   │   │   └── pagination.ts
```

## Implementação dos Arquivos Principais

### 1. Definição do Tipo de Nó (node.type.ts)

```typescript
// actions/node.type.ts
export type HotmartResourceType = 
  | 'subscription'
  | 'sales'
  | 'coupon'
  | 'product'
  | 'club'
  | 'ticket';

export type SubscriptionOperationType = 
  | 'getAll'
  | 'cancel'
  | 'cancelList'
  | 'changeBillingDate'
  | 'getPurchases'
  | 'reactivate'
  | 'getSummary';

export type HotmartType = {
  resource: HotmartResourceType;
  operation: SubscriptionOperationType | string;
};
```

### 2. Recurso de Assinaturas (Subscription.resource.ts)

```typescript
// actions/subscription/Subscription.resource.ts
import type { INodeProperties } from 'n8n-workflow';

import * as getAll from './getAll.operation';
import * as cancel from './cancel.operation';
import * as cancelList from './cancelList.operation';
import * as changeBillingDate from './changeBillingDate.operation';
import * as getPurchases from './getPurchases.operation';
import * as reactivate from './reactivate.operation';
import * as getSummary from './getSummary.operation';

export { getAll, cancel, cancelList, changeBillingDate, getPurchases, reactivate, getSummary };

export const description: INodeProperties[] = [
  {
    displayName: 'Operação',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
      {
        name: 'Obter Assinaturas',
        value: 'getAll',
        description: 'Listar assinaturas existentes',
        action: 'Obter assinaturas',
      },
      {
        name: 'Cancelar Assinatura',
        value: 'cancel',
        description: 'Cancelar uma assinatura específica',
        action: 'Cancelar assinatura',
      },
      {
        name: 'Cancelar Lista de Assinaturas',
        value: 'cancelList',
        description: 'Cancelar múltiplas assinaturas',
        action: 'Cancelar lista de assinaturas',
      },
      {
        name: 'Alterar Dia de Cobrança',
        value: 'changeBillingDate',
        description: 'Modificar a data de cobrança de uma assinatura',
        action: 'Alterar dia de cobrança',
      },
      {
        name: 'Obter Compras de Assinantes',
        value: 'getPurchases',
        description: 'Listar compras de um assinante específico',
        action: 'Obter compras de assinantes',
      },
      {
        name: 'Reativar e Cobrar Assinatura',
        value: 'reactivate',
        description: 'Reativar uma assinatura cancelada',
        action: 'Reativar e cobrar assinatura',
      },
      {
        name: 'Sumário de Assinaturas',
        value: 'getSummary',
        description: 'Obter dados sumarizados de assinaturas',
        action: 'Obter sumário de assinaturas',
      },
    ],
    default: 'getAll',
    displayOptions: {
      show: {
        resource: ['subscription'],
      },
    },
  },
  ...getAll.description,
  ...cancel.description,
  ...cancelList.description,
  ...changeBillingDate.description,
  ...getPurchases.description,
  ...reactivate.description,
  ...getSummary.description,
];
```

### 3. Operação de Listar Assinaturas (getAll.operation.ts)

```typescript
// actions/subscription/getAll.operation.ts
import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { getAllItems } from '../../helpers/pagination';

export const description: INodeProperties[] = [
  {
    displayName: 'Retornar Todos os Resultados',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Se ativado, buscará automaticamente todos os registros em todas as páginas',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'Máximo de Resultados',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Número máximo de resultados a serem retornados',
    typeOptions: {
      minValue: 1,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Resultados Por Página',
    name: 'maxResults',
    type: 'number',
    default: 50,
    description: 'Quantos resultados buscar por requisição',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'Filtros',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'multiOptions',
        options: [
          { name: 'Ativa', value: 'ACTIVE' },
          { name: 'Atrasada', value: 'DELAYED' },
          { name: 'Cancelada pelo Administrador', value: 'CANCELLED_BY_ADMIN' },
          { name: 'Cancelada pelo Cliente', value: 'CANCELLED_BY_CUSTOMER' },
          { name: 'Cancelada pelo Vendedor', value: 'CANCELLED_BY_SELLER' },
          { name: 'Inativa', value: 'INACTIVE' },
          { name: 'Iniciada', value: 'STARTED' },
          { name: 'Vencida', value: 'EXPIRED' },
        ],
        default: [],
        description: 'Filtrar por status da assinatura',
      },
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'string',
        default: '',
        description: 'Filtrar por ID do produto',
      },
      {
        displayName: 'Email do Comprador',
        name: 'buyerEmail',
        type: 'string',
        default: '',
        description: 'Filtrar por email do comprador',
      },
      {
        displayName: 'Data Inicial',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Filtrar por data inicial (timestamp em milissegundos)',
      },
      {
        displayName: 'Data Final',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Filtrar por data final (timestamp em milissegundos)',
      },
    ],
  },
];

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      // Obter parâmetros da operação
      const returnAll = this.getNodeParameter('returnAll', i, false);
      const maxResults = this.getNodeParameter('maxResults', i, 50);
      const filters = this.getNodeParameter('filters', i, {}) as {
        status?: string[];
        productId?: string;
        buyerEmail?: string;
        startDate?: string;
        endDate?: string;
      };
      
      // Construir query params
      const queryParams: Record<string, any> = {};
      
      if (filters.status?.length) {
        queryParams.status = filters.status.join(',');
      }
      
      if (filters.productId) {
        queryParams.product_id = filters.productId;
      }
      
      if (filters.buyerEmail) {
        queryParams.buyer_email = filters.buyerEmail;
      }
      
      if (filters.startDate) {
        // Converter para timestamp se for uma data
        const startDate = new Date(filters.startDate).getTime();
        queryParams.start_date = startDate;
      }
      
      if (filters.endDate) {
        // Converter para timestamp se for uma data
        const endDate = new Date(filters.endDate).getTime();
        queryParams.end_date = endDate;
      }
      
      let responseData;
      
      if (returnAll) {
        // Usar helper para obter todos os itens através de múltiplas páginas
        responseData = await getAllItems.call(
          this,
          {
            maxResults,
            resource: 'subscription',
            operation: 'getAll',
            query: queryParams,
          },
        );
      } else {
        // Obter apenas uma página com o limite especificado
        const limit = this.getNodeParameter('limit', i, 50);
        queryParams.max_results = limit;
        
        const response = await hotmartApiRequest.call(
          this,
          'GET',
          '/payments/api/v1/subscriptions',
          {},
          queryParams,
        );
        
        responseData = response.items || [];
      }
      
      // Processar a resposta e adicionar ao retorno
      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
        { itemData: { item: i } },
      );
      
      returnData.push(...executionData);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message } });
        continue;
      }
      throw error;
    }
  }
  
  return returnData;
};
```

### 4. Operação de Cancelar Assinatura (cancel.operation.ts)

```typescript
// actions/subscription/cancel.operation.ts
import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'ID da Assinatura',
    name: 'subscriptionId',
    type: 'string',
    required: true,
    default: '',
    description: 'ID único da assinatura a ser cancelada',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancel'],
      },
    },
  },
  {
    displayName: 'Opções',
    name: 'options',
    type: 'collection',
    placeholder: 'Adicionar Opção',
    default: {},
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancel'],
      },
    },
    options: [
      {
        displayName: 'Motivo do Cancelamento',
        name: 'reason',
        type: 'string',
        default: '',
        description: 'Motivo pelo qual a assinatura está sendo cancelada',
      },
    ],
  },
];

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      // Obter parâmetros da operação
      const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
      const options = this.getNodeParameter('options', i, {}) as {
        reason?: string;
      };
      
      // Construir body da requisição
      const body: Record<string, any> = {};
      
      if (options.reason) {
        body.reason = options.reason;
      }
      
      // Fazer a requisição para cancelar a assinatura
      const responseData = await hotmartApiRequest.call(
        this,
        'POST',
        `/payments/api/v1/subscriptions/${subscriptionId}/cancel`,
        body,
        {},
      );
      
      // Adicionar resposta ao retorno
      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([responseData || { success: true }]),
        { itemData: { item: i } },
      );
      
      returnData.push(...executionData);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message } });
        continue;
      }
      throw error;
    }
  }
  
  return returnData;
};
```

### 5. Router para Direcionar Operações (router.ts)

```typescript
// actions/router.ts
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as subscription from './subscription/Subscription.resource';
// Importar outros recursos quando implementados
// import * as sales from './sales/Sales.resource';
// import * as coupon from './coupon/Coupon.resource';
// ...

import type { HotmartType } from './node.type';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  let returnData: INodeExecutionData[] = [];

  const items = this.getInputData();
  const resource = this.getNodeParameter<HotmartType['resource']>('resource', 0);
  const operation = this.getNodeParameter('operation', 0);

  const hotmartNodeData = {
    resource,
    operation,
  } as HotmartType;

  try {
    switch (hotmartNodeData.resource) {
      case 'subscription':
        returnData = await subscription[hotmartNodeData.operation as keyof typeof subscription].execute.call(
          this,
          items,
        );
        break;
      // Adicionar outros recursos quando implementados
      // case 'sales':
      //   returnData = await sales[hotmartNodeData.operation].execute.call(this, items);
      //   break;
      // ...
      default:
        throw new NodeOperationError(
          this.getNode(),
          `O recurso "${resource}" não é suportado!`,
        );
    }
  } catch (error) {
    throw error;
  }

  return [returnData];
}
```

### 6. Descrição da Versão (versionDescription.ts)

```typescript
// actions/versionDescription.ts
import { NodeConnectionTypes, type INodeTypeDescription } from 'n8n-workflow';

import * as subscription from './subscription/Subscription.resource';
// Importar outros recursos quando implementados

export const versionDescription: INodeTypeDescription = {
  displayName: 'Hotmart',
  name: 'hotmart',
  icon: 'file:hotmart.svg',
  group: ['transform'],
  version: [1],
  subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
  description: 'Interagir com a API Hotmart',
  defaults: {
    name: 'Hotmart',
  },
  inputs: [NodeConnectionTypes.Main],
  outputs: [NodeConnectionTypes.Main],
  credentials: [
    {
      name: 'hotmartOAuth2Api',
      required: true,
    },
  ],
  properties: [
    {
      displayName: 'Recurso',
      name: 'resource',
      type: 'options',
      noDataExpression: true,
      options: [
        {
          name: 'Assinatura',
          value: 'subscription',
        },
        // Adicionar outros recursos quando implementados
        // {
        //   name: 'Vendas',
        //   value: 'sales',
        // },
        // ...
      ],
      default: 'subscription',
    },
    ...subscription.description,
    // Adicionar descrições de outros recursos quando implementados
  ],
};
```

### 7. Implementação do Nó Principal (HotmartV1.node.ts)

```typescript
// v1/HotmartV1.node.ts
import type {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeTypeBaseDescription,
} from 'n8n-workflow';

import { router } from './actions/router';
import { versionDescription } from './actions/versionDescription';
import { loadOptions } from './methods/loadOptions';

export class HotmartV1 implements INodeType {
  description: INodeTypeDescription;

  constructor(baseDescription: INodeTypeBaseDescription) {
    this.description = {
      ...baseDescription,
      ...versionDescription,
    };
  }

  methods = {
    loadOptions,
  };

  async execute(this: IExecuteFunctions) {
    return await router.call(this);
  }
}
```

### 8. Implementação do Nó Versionado (Hotmart.node.ts)

```typescript
// Hotmart.node.ts
import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { HotmartV1 } from './v1/HotmartV1.node';

export class Hotmart extends VersionedNodeType {
  constructor() {
    const baseDescription: INodeTypeBaseDescription = {
      displayName: 'Hotmart',
      name: 'hotmart',
      icon: 'file:hotmart.svg',
      group: ['transform'],
      description: 'Interagir com a API Hotmart',
      defaultVersion: 1,
    };

    const nodeVersions: IVersionedNodeType['nodeVersions'] = {
      1: new HotmartV1(baseDescription),
    };

    super(nodeVersions, baseDescription);
  }
}
```

### 9. Metadados do Nó (Hotmart.node.json)

```json
{
  "node": "n8n-nodes-hotmart.hotmart",
  "nodeVersion": "1.0",
  "codexVersion": "1.0",
  "categories": ["Marketing", "Sales"],
  "resources": {
    "credentialDocumentation": [
      {
        "url": "https://developers.hotmart.com/docs/pt-BR/start/app-auth"
      }
    ],
    "primaryDocumentation": [
      {
        "url": "https://developers.hotmart.com/docs/pt-BR/"
      }
    ]
  }
}
```

### 10. Carregamento Dinâmico de Opções (loadOptions.ts)

```typescript
// methods/loadOptions.ts
import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { hotmartApiRequest } from '../transport/request';

export async function loadOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const resource = this.getNodeParameter('resource', 0) as string;
  const operation = this.getNodeParameter('operation', 0) as string;
  
  // Exemplo: Carregar produtos para filtro de assinaturas
  if (resource === 'subscription' && operation === 'getAll') {
    const returnData: INodePropertyOptions[] = [];
    const endpoint = '/products/api/v1/products';
    const products = await hotmartApiRequest.call(this, 'GET', endpoint, {}, { max_results: 100 });
    
    if (products.items) {
      for (const product of products.items) {
        returnData.push({
          name: product.name,
          value: product.id,
        });
      }
    }
    
    return returnData;
  }
  
  return [];
}
```

## Fluxo de Execução

1. O usuário configura o nó Hotmart no n8n, selecionando o recurso "Assinatura" e uma operação
2. A classe `Hotmart` carrega a versão apropriada (V1)
3. `HotmartV1` processa a requisição através do roteador
4. O roteador direciona para o recurso de assinaturas e a operação específica
5. A operação executa a lógica específica usando o transporte HTTP
6. Os resultados são formatados e retornados ao n8n

## Exemplo de Uso no n8n

### Cenário: Listar Assinaturas Ativas e Enviar Notificação

1. **Nó Trigger**: Agendamento (a cada dia)
2. **Nó Hotmart**: 
   - Recurso: Assinatura
   - Operação: Obter Assinaturas
   - Retornar Todos os Resultados: Sim
   - Filtros: Status = ACTIVE
3. **Nó Filter**: Filtrar assinaturas que vencem em 3 dias
4. **Nó Slack/Email**: Enviar notificação com lista de assinaturas

### Cenário: Cancelar Assinaturas Atrasadas

1. **Nó Trigger**: Webhook ou Agendamento
2. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Obter Assinaturas
   - Filtros: Status = DELAYED
3. **Nó Loop**: Iterar sobre as assinaturas atrasadas
4. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Cancelar Assinatura
   - ID da Assinatura: =item.json.id
   - Motivo: "Cancelamento automático por atraso"

## Próximos Passos

Após implementar e testar o recurso de Assinaturas:

1. Implementar os demais recursos seguindo o mesmo padrão
2. Adicionar testes unitários para cada operação
3. Documentar exemplos de uso para cada recurso
4. Publicar o pacote no npm para disponibilização à comunidade
