import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import type { SalesQueryParams, SalesSummaryResponse, ApiResponse } from '../../types';
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  transactionStatusOptions,
  paymentTypeOptions,
} from '../common.descriptions';
import { convertToTimestamp } from '../../helpers/dateUtils';
import { getAllItems } from '../../helpers/pagination';

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getResumoVendas'],
      },
    },
    default: false,
    description: 'Se ativado, retorna todos os resumos. Se desativado, retorna até o limite especificado',
    hint: 'Obtenha métricas consolidadas de vendas',
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getResumoVendas'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Número máximo de resumos a retornar por página',
    hint: 'Máximo permitido pela API: 500 resultados por página',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
  },
  {
    ...maxResultsOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getResumoVendas'],
      },
    },
    default: 100,
    description: 'Número total máximo de resumos a retornar',
    hint: 'Para análises completas, ative "Retornar Todos"',
    typeOptions: {
      minValue: 1,
    },
  },
  {
    displayName: 'Filtros',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    description: 'Configure filtros para obter métricas consolidadas de vendas',
    hint: 'Ideal para relatórios e dashboards de performance',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getResumoVendas'],
      },
    },
    options: [
      // 1. ID do Produto
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description: 'Resumo de vendas por produto específico. Exemplo: prod_1234567890',
        hint: 'Analise performance de produtos individuais',
        typeOptions: {
          loadOptionsMethod: 'getProducts',
        },
      },
      // 2. Data Inicial
      {
        displayName: 'Data Inicial',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Data inicial para análise de métricas. Formato: YYYY-MM-DD',
        hint: 'Defina períodos para comparação de resultados',
      },
      // 3. Data Final
      {
        displayName: 'Data Final',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Data final para análise de métricas. Formato: YYYY-MM-DD',
        hint: 'Compare diferentes períodos de vendas',
      },
      // 4. Origem da Venda (SRC)
      {
        displayName: 'Origem da Venda (SRC)',
        name: 'salesSource',
        type: 'string',
        default: '',
        description: 'Métricas por origem de tráfego (parâmetro src). Exemplo: google_ads',
        hint: 'Avalie ROI de campanhas específicas',
        placeholder: 'nome_da_campanha',
      },
      // 5. Nome do Afiliado
      {
        displayName: 'Nome do Afiliado',
        name: 'affiliateName',
        type: 'string',
        default: '',
        description: 'Resumo de vendas de um afiliado específico',
        hint: 'Acompanhe performance individual de parceiros',
        placeholder: 'Nome do Afiliado',
      },
      // 6. Tipo de Pagamento
      {
        displayName: 'Tipo de Pagamento',
        name: 'paymentType',
        type: 'options',
        options: paymentTypeOptions,
        default: '',
        description: 'Métricas segmentadas por forma de pagamento',
        hint: 'Compare conversão entre cartão, boleto e PIX',
      },
      // 7. Código da Oferta
      {
        displayName: 'Código da Oferta',
        name: 'offerCode',
        type: 'string',
        default: '',
        description: 'Resumo de vendas por oferta/funil. Exemplo: offer_abc123',
        hint: 'Compare performance entre diferentes ofertas',
        placeholder: 'offer_abc123',
      },
      // 8. Código da Transação
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        description: 'Resumo de uma transação específica. Exemplo: HP12345678901234',
        hint: 'Dados consolidados de uma venda',
        placeholder: 'HP12345678901234',
      },
      // 9. Status da Transação
      {
        displayName: 'Status da Transação',
        name: 'transactionStatus',
        type: 'options',
        options: transactionStatusOptions,
        default: '',
        description: 'Métricas por status de venda',
        hint: 'Analise taxa de cancelamento e aprovação',
      },
    ],
  },
];

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[]
): Promise<INodeExecutionData[][]> {
  const allReturnData: INodeExecutionData[] = [];

  // Se não houver itens de entrada (comum quando usado via AI/MCP), cria um item vazio
  const itemsToProcess = items.length === 0 ? [{ json: {} }] : items;

  for (let i = 0; i < itemsToProcess.length; i++) {
    try {
      const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
      const maxResults = this.getNodeParameter('maxResults', i, 50) as number;
      const filters = this.getNodeParameter('filters', i, {}) as {
        productId?: string;
        transactionStatus?: string;
        startDate?: string;
        endDate?: string;
        transaction?: string;
        salesSource?: string;
        affiliateName?: string;
        paymentType?: string;
        offerCode?: string;
      };

      const queryParams: SalesQueryParams = {};

      if (filters.productId) {
        queryParams.product_id = filters.productId;
      }
      if (filters.transactionStatus) {
        queryParams.transaction_status = filters.transactionStatus;
      }
      if (filters.startDate) {
        queryParams.start_date = convertToTimestamp(filters.startDate);
      }
      if (filters.endDate) {
        queryParams.end_date = convertToTimestamp(filters.endDate);
      }
      if (filters.transaction) {
        queryParams.transaction = filters.transaction;
      }
      if (filters.salesSource) {
        queryParams.sales_source = filters.salesSource;
      }
      if (filters.affiliateName) {
        queryParams.affiliate_name = filters.affiliateName;
      }
      if (filters.paymentType) {
        queryParams.payment_type = filters.paymentType;
      }
      if (filters.offerCode) {
        queryParams.offer_code = filters.offerCode;
      }

      let responseData;

      if (returnAll) {
        // Usar o helper de paginação para buscar TODAS as páginas
        const items = await getAllItems.call(this, {
          maxResults,
          resource: 'sales',
          operation: 'getSummary',
          query: queryParams,
        });
        responseData = { items };
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;
        responseData = await hotmartApiRequest.call(
          this,
          'GET',
          '/payments/api/v1/sales/summary',
          {},
          queryParams
        );
      }

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray((responseData as ApiResponse<SalesSummaryResponse>).items || []),
        { itemData: { item: i } }
      );

      allReturnData.push(...executionData);
    } catch (error) {
      if (this.continueOnFail()) {
        allReturnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
        continue;
      }
      throw error;
    }
  }

  return [allReturnData];
};
