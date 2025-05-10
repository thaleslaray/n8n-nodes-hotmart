# Implementação de Paginação para API Hotmart no n8n

## Visão Geral da Paginação na API Hotmart

A API Hotmart utiliza um sistema de paginação baseado em cursor. Em cada resposta paginada, a API retorna:

```json
{
  "items": [...],
  "page_info": {
    "total_results": 30,
    "next_page_token": "eyJwYWdlIjoyLCJyb3dzIjoxMH0=",
    "prev_page_token": "eyJwYWdlIjoyLCJyb3dzIjoxMH0=",
    "results_per_page": 10
  }
}
```

Para implementar um sistema que recupere automaticamente todos os resultados, vamos criar uma solução que:

1. Ofereça um parâmetro simples "Retornar Todos os Resultados"
2. Siga recursivamente o `next_page_token` até obter todos os registros
3. Gerencie eficientemente a memória para grandes conjuntos de dados
4. Implemente controles para evitar problemas de rate limit

## Implementação Detalhada

### 1. Parâmetros de Paginação na UI do Nó

Para cada operação que oferece listagem de recursos (vendas, assinaturas, etc.), adicionaremos os seguintes parâmetros:

```typescript
// Em qualquer arquivo de operação que lista recursos (ex: actions/sales/getHistory.operation.ts)
export const description: INodeProperties[] = [
  // ... outros parâmetros da operação
  {
    displayName: 'Retornar Todos os Resultados',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Se ativado, buscará automaticamente todos os registros em todas as páginas',
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
      maxValue: 100, // Ajustar conforme limites da API
    },
  },
  // ... outros parâmetros
];
```

### 2. Função Helper para Paginação Completa

Para encapsular a lógica de paginação, criaremos uma função auxiliar no diretório `helpers`:

```typescript
// helpers/pagination.ts
import { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { hotmartApiRequest } from '../transport/request';

interface PaginationOptions {
  maxResults: number;
  resource: string;
  operation: string;
  query?: IDataObject;
  body?: IDataObject;
}

export async function getAllItems(
  this: IExecuteFunctions,
  options: PaginationOptions,
): Promise<any[]> {
  const { maxResults, resource, operation, query = {}, body = {} } = options;
  
  const returnData: IDataObject[] = [];
  let responseData: IDataObject;
  let nextPageToken: string | undefined;
  
  // Implementar controle de rate limit
  const rateLimitDelay = 100; // ms entre requisições
  
  do {
    // Configurar a consulta com o token da página
    const endpoint = getEndpointForResourceOperation(resource, operation);
    const queryParams = {
      ...query,
      max_results: maxResults,
      ...(nextPageToken && { page_token: nextPageToken }),
    };
    
    // Fazer requisição para esta página
    responseData = await hotmartApiRequest.call(
      this,
      'GET',
      endpoint,
      body,
      queryParams,
    );
    
    // Se houver itens, adicionar ao array de retorno
    if (responseData.items && Array.isArray(responseData.items)) {
      returnData.push(...responseData.items);
    }
    
    // Extrair o token da próxima página (se existir)
    nextPageToken = responseData.page_info?.next_page_token;
    
    // Para evitar atingir rate limits, adicionar um pequeno atraso
    if (nextPageToken) {
      await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
    }
    
  } while (nextPageToken);
  
  return returnData;
}

function getEndpointForResourceOperation(resource: string, operation: string): string {
  // Mapear recursos e operações para endpoints correspondentes
  const endpoints: {[key: string]: {[key: string]: string}} = {
    sales: {
      getHistory: '/payments/api/v1/sales/history',
      getCommissions: '/payments/api/v1/sales/commissions',
      // ... outros endpoints
    },
    subscription: {
      getAll: '/payments/api/v1/subscriptions',
      // ... outros endpoints
    },
    // ... outros recursos
  };
  
  return endpoints[resource]?.[operation] || '';
}
```

### 3. Implementação na Operação para Histórico de Vendas

```typescript
// actions/sales/getHistory.operation.ts
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { getAllItems } from '../../helpers/pagination';

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  
  for (let i = 0; i < items.length; i++) {
    // Obter parâmetros da operação
    const returnAll = this.getNodeParameter('returnAll', i, false);
    const maxResults = this.getNodeParameter('maxResults', i, 50);
    
    // Parâmetros de filtro específicos
    const productId = this.getNodeParameter('productId', i, undefined);
    const startDate = this.getNodeParameter('startDate', i, undefined);
    const endDate = this.getNodeParameter('endDate', i, undefined);
    // ... outros parâmetros
    
    // Construir query params
    const queryParams = {
      ...(productId && { product_id: productId }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      // ... outros parâmetros
    };
    
    let responseData;
    
    if (returnAll) {
      // Usar helper para obter todos os itens através de múltiplas páginas
      responseData = await getAllItems.call(
        this,
        {
          maxResults,
          resource: 'sales',
          operation: 'getHistory',
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
        '/payments/api/v1/sales/history',
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
  }
  
  return returnData;
};
```

### 4. Controles Adicionais para Grandes Volumes de Dados

Para conjuntos de dados muito grandes, podemos implementar:

```typescript
// Adicionar no arquivo de helpers/pagination.ts

export async function getAllItemsWithControls(
  this: IExecuteFunctions,
  options: PaginationOptions & {
    maxTotalItems?: number;    // Limite máximo de itens total
    maxPages?: number;         // Limite máximo de páginas a buscar
    timeoutMs?: number;        // Timeout total da operação
  },
): Promise<any[]> {
  const { maxTotalItems, maxPages, timeoutMs, ...paginationOptions } = options;
  
  // Definir um timeout global para a operação
  let operationTimeout: NodeJS.Timeout | undefined;
  let timeoutReached = false;
  
  if (timeoutMs) {
    operationTimeout = setTimeout(() => {
      timeoutReached = true;
    }, timeoutMs);
  }
  
  const returnData: IDataObject[] = [];
  let responseData: IDataObject;
  let nextPageToken: string | undefined;
  let pageCount = 0;
  
  try {
    do {
      // Verificar condições de término
      if (timeoutReached) {
        console.log(`Timeout reached after ${pageCount} pages. Returning partial results.`);
        break;
      }
      
      if (maxPages && pageCount >= maxPages) {
        console.log(`Reached maximum page count (${maxPages}). Returning partial results.`);
        break;
      }
      
      if (maxTotalItems && returnData.length >= maxTotalItems) {
        console.log(`Reached maximum item count (${maxTotalItems}). Returning partial results.`);
        break;
      }
      
      // Lógica de busca e paginação (igual ao método anterior)
      
      pageCount++;
      
      // Verificar se já atingimos o limite máximo de itens após adicionar esta página
      if (maxTotalItems && returnData.length >= maxTotalItems) {
        returnData.splice(maxTotalItems); // Cortar o array no limite máximo
        break;
      }
      
    } while (nextPageToken);
    
    return returnData;
  } finally {
    // Garantir que o timeout seja limpo
    if (operationTimeout) {
      clearTimeout(operationTimeout);
    }
  }
}
```

### 5. Status da Paginação e Controle de Memória

Para lidar com conjuntos de dados muito grandes, podemos implementar um controle de progresso e gerenciamento de memória:

```typescript
// Adicionar à função principal de paginação

// Logging opcional do progresso
if (pageCount % 10 === 0) {
  console.log(`Retrieved ${returnData.length} items from ${pageCount} pages so far...`);
}

// Verificar uso de memória (Node.js)
const memoryUsage = process.memoryUsage();
const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

// Se o uso de memória estiver ficando muito alto, podemos emitir um aviso ou parar
if (memoryUsageMB > 1024) { // 1GB como exemplo
  console.warn(`Memory usage high (${memoryUsageMB}MB). Consider adding pagination limits.`);
  // Opcionalmente interromper para evitar problemas de memória
  // break;
}
```

## Considerações de Uso e Limitações

1. **Rate Limits**: A API Hotmart tem limites de taxa (conforme descrito na documentação), então a recuperação de conjuntos grandes pode ser limitada.

2. **Memória**: Para conjuntos de dados extremamente grandes, o n8n pode enfrentar limitações de memória. Nestes casos, considere:
   - Dividir a carga em várias execuções usando filtros (ex: por data)
   - Aumentar a memória disponível para o n8n
   - Processar os dados em batches sequenciais

3. **Performance**: A recuperação de todos os registros pode ser lenta para conjuntos muito grandes. É recomendável:
   - Usar filtros para reduzir o conjunto de dados quando possível
   - Ajustar o parâmetro `maxResults` para otimizar o tamanho de cada página
   - Considerar execuções agendadas para grandes volumes

## Possíveis Melhorias Futuras

1. Implementar um indicador de progresso visual no n8n
2. Adicionar suporte para processamento em streaming para conjuntos extremamente grandes
3. Implementar cache inteligente para reduzir chamadas repetidas
4. Adicionar opções avançadas para controle de recuperação de erros e retry
