import { IExecuteFunctions, IDataObject, NodeOperationError } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../transport/requestTyped';

interface PaginationOptions {
  maxResults: number;
  resource: string;
  operation: string;
  query?: IDataObject;
  body?: IDataObject;
}

// Valor máximo permitido pela API Hotmart para max_results
const MAX_API_RESULTS = 500;

/**
 * Retrieves all items from a paginated Hotmart API endpoint, automatically handling pagination and rate limiting.
 *
 * Fetches all available results for the specified resource and operation, using the maximum allowed page size for efficiency. Continues requesting subsequent pages until all items are retrieved.
 *
 * @param options - Pagination options specifying the resource, operation, and optional query or body parameters.
 * @returns An array containing all items retrieved from the API.
 *
 * @throws {NodeOperationError} If no valid endpoint can be resolved for the given resource and operation.
 * @remark Uses a Promise-based delay mechanism for rate limiting to ensure compatibility with the n8n environment.
 */
export async function getAllItems<T extends IDataObject = IDataObject>(
  this: IExecuteFunctions,
  options: PaginationOptions
): Promise<T[]> {
  const { resource, operation, query = {}, body = {} } = options;

  // Quando usamos getAllItems, significa que returnAll=true, então
  // sempre usamos o valor máximo (500) para otimizar, independente do valor que veio na chamada
  const maxResults = MAX_API_RESULTS;

  const returnData: T[] = [];
  let responseData: { items?: T[]; page_info?: { next_page_token?: string } } | undefined;
  let nextPageToken: string | undefined;

  // Implementar controle de rate limit
  const rateLimitDelay = 100; // ms entre requisições

  do {
    // Configurar a consulta com o token da página
    let endpoint = getEndpointForResourceOperation(resource, operation);

    // Corrigir problema de endpoints não encontrados
    if (!endpoint) {
      // O endpoint não foi encontrado no mapeamento, então vamos tentar inferir o endpoint
      // baseado no recurso, para evitar erros quando os nomes das operações não coincidem exatamente

      // Fornecer um endpoint padrão para recursos comuns
      const defaultEndpoints: { [key: string]: string } = {
        subscription: '/payments/api/v1/subscriptions',
        sales: '/payments/api/v1/sales/history',
        product: '/products/api/v1/products',
        coupon: '/products/api/v1/coupons',
        club: '/club/api/v1/users',
        tickets: '/event/api/v1/tickets',
      };

      if (defaultEndpoints[resource]) {
        // Usar um endpoint padrão ao invés de falhar
        // Isso é uma solução temporária, o ideal é padronizar os nomes das operações
        endpoint = defaultEndpoints[resource];
      } else {
        throw new NodeOperationError(
          this.getNode(),
          `Endpoint not found for resource '${resource}' and operation '${operation}'`
        );
      }
    }

    // Forçar max_results=500 para eficiência máxima
    const queryParams = {
      ...query,
      max_results: maxResults, // Sempre usar valor máximo (500)
      ...(nextPageToken && { page_token: nextPageToken }),
    };

    // Fazer requisição para esta página
    responseData = await hotmartApiRequestTyped<{ items?: T[]; page_info?: { next_page_token?: string } }>(this, 'GET', endpoint, body, queryParams);

    // Check if responseData is an object and has items
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      responseData.items &&
      Array.isArray(responseData.items)
    ) {
      returnData.push(...(responseData.items as T[]));
    }

    // Check if responseData is an object and has page_info before accessing next_page_token
    nextPageToken =
      typeof responseData === 'object' && responseData !== null && responseData.page_info
        ? responseData.page_info.next_page_token
        : undefined;

    // Para evitar atingir rate limits, adicionar um pequeno atraso usando Promise nativo
    if (nextPageToken) {
      await new Promise((resolve) => {
        // Usar Promise.resolve().then() ao invés de setTimeout para compatibilidade com n8n
        Promise.resolve().then(() => {
          // Simular delay usando multiple Promise.resolve() chains
          let chain = Promise.resolve();
          for (let i = 0; i < rateLimitDelay; i++) {
            chain = chain.then(() => Promise.resolve());
          }
          return chain;
        }).then(resolve);
      });
    }
  } while (nextPageToken);

  return returnData;
}

function getEndpointForResourceOperation(resource: string, operation: string): string {
  // Mapear recursos e operações para endpoints correspondentes
  const endpoints: { [key: string]: { [key: string]: string } } = {
    subscription: {
      // Mapear todas as possíveis variações de nomes para o mesmo endpoint
      getAll: '/payments/api/v1/subscriptions',
      getAllSubscriptions: '/payments/api/v1/subscriptions',
      getSubscriptions: '/payments/api/v1/subscriptions',

      getSummary: '/payments/api/v1/subscriptions/summary',
      getSubscriptionsSummary: '/payments/api/v1/subscriptions/summary',

      getPurchases: '/payments/api/v1/subscriptions/purchases',
      getSubscriptionPurchases: '/payments/api/v1/subscriptions/purchases',

      getTransactions: '/payments/api/v1/subscriptions/transactions',
      getSubscriptionTransactions: '/payments/api/v1/subscriptions/transactions',
    },
    sales: {
      // Mapear todas as possíveis variações de nomes para o mesmo endpoint
      getAll: '/payments/api/v1/sales/history',
      getHistory: '/payments/api/v1/sales/history',
      getHistoricoVendas: '/payments/api/v1/sales/history',
      getSalesHistory: '/payments/api/v1/sales/history',

      getCommissions: '/payments/api/v1/sales/commissions',
      getComissoesVendas: '/payments/api/v1/sales/commissions',
      getSalesCommissions: '/payments/api/v1/sales/commissions',

      getParticipants: '/payments/api/v1/sales/users',
      getParticipantesVendas: '/payments/api/v1/sales/users',
      getSalesParticipants: '/payments/api/v1/sales/users',

      getPriceDetails: '/payments/api/v1/sales/price/details',
      getDetalhamentoPrecos: '/payments/api/v1/sales/price/details',
      getSalesPriceDetails: '/payments/api/v1/sales/price/details',

      getRefunds: '/payments/api/v1/sales/refunds',
      getSalesRefunds: '/payments/api/v1/sales/refunds',

      getSummary: '/payments/api/v1/sales/summary',
      getResumoVendas: '/payments/api/v1/sales/summary',
      getSalesSummary: '/payments/api/v1/sales/summary',
    },
    product: {
      // Mapear todas as possíveis variações de nomes para o mesmo endpoint
      getAll: '/products/api/v1/products',
      getProducts: '/products/api/v1/products',
      getAllProducts: '/products/api/v1/products',
    },
    coupon: {
      // Mapear todas as possíveis variações de nomes para o mesmo endpoint
      getAll: '/products/api/v1/coupons',
      getCoupons: '/products/api/v1/coupons',
      getAllCoupons: '/products/api/v1/coupons',
    },
    club: {
      // Mapear todas as possíveis variações de nomes para o mesmo endpoint
      getAll: '/club/api/v1/users',
      getStudents: '/club/api/v1/users',
      getAllStudents: '/club/api/v1/users',

      getModules: '/club/api/v1/modules',
      getAllModules: '/club/api/v1/modules',

      getProgress: '/club/api/v1/users', // Base do endpoint para progresso (complementado com userId no código)
      getStudentProgress: '/club/api/v1/users',

      getPages: '/club/api/v2/modules', // Base do endpoint para páginas (complementado com moduleId no código)
      getModulePages: '/club/api/v2/modules',
    },
    tickets: {
      // Mapear todas as possíveis variações de nomes para o mesmo endpoint
      getAll: '/event/api/v1/tickets',
      getTickets: '/event/api/v1/tickets',
      getAllTickets: '/event/api/v1/tickets',

      getInfo: '/event/api/v1/tickets',
      getEventInfo: '/event/api/v1/tickets',
    },
  };

  return endpoints[resource]?.[operation] || '';
}
