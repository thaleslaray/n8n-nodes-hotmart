import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import type { SalesQueryParams } from '../../types';
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  transactionStatusOptions,
  paymentTypeOptions,
} from '../common.descriptions';
import { getAllItems } from '../../helpers/pagination';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getDetalhamentoPrecos'],
      },
    },
    default: false,
    description: 'Se ativado, retorna todos os detalhamentos. Se desativado, retorna até o limite especificado',
    hint: 'Ideal para análises completas de custos e taxas',
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getDetalhamentoPrecos'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Número máximo de detalhamentos a retornar por página',
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
        operation: ['getDetalhamentoPrecos'],
      },
    },
    default: 100,
    description: 'Número total máximo de detalhamentos a retornar',
    hint: 'Para mais resultados, ative "Retornar Todos"',
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
    description: 'Configure filtros para analisar custos e taxas de vendas específicas',
    hint: 'Veja breakdown completo de valores: preço, taxas, impostos e valor líquido',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getDetalhamentoPrecos'],
      },
    },
    options: [
      /* 1 */
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description: 'Analisar detalhamento de preços por produto. Exemplo: prod_1234567890',
        hint: 'Compare custos e margens entre produtos',
        typeOptions: {
          loadOptionsMethod: 'getProducts',
        },
      },
      /* 2 */
      {
        displayName: 'Data Inicial',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Data inicial do período de análise (formato: YYYY-MM-DD)',
        hint: 'Útil para análise de evolução de custos',
        placeholder: '2024-01-01',
      },
      /* 3 */
      {
        displayName: 'Data Final',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Data final do período de análise (formato: YYYY-MM-DD)',
        hint: 'Compare períodos para identificar tendências',
        placeholder: '2024-12-31',
      },
      /* 4 */
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        description: 'Analisar custos de uma transação específica. Exemplo: HP12345678901234',
        hint: 'Veja exatamente quanto você recebeu líquido',
        placeholder: 'HP12345678901234',
      },
      /* 5 */
      {
        displayName: 'Status da Transação',
        name: 'transactionStatus',
        type: 'options',
        options: transactionStatusOptions,
        default: '',
        description: 'Filtrar detalhamentos por status da venda',
        hint: 'Vendas canceladas podem ter taxas diferentes',
      },
      /* 6 */
      {
        displayName: 'Tipo de Pagamento',
        name: 'paymentType',
        type: 'options',
        options: paymentTypeOptions,
        default: '',
        description: 'Analisar custos por método de pagamento',
        hint: 'Cartão, Boleto e PIX têm taxas diferentes',
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
        paymentType?: string;
        startDate?: string;
        endDate?: string;
        transaction?: string;
      };

      const queryParams: SalesQueryParams = {};

      if (filters.productId) {
        queryParams.product_id = filters.productId;
      }
      if (filters.transactionStatus) {
        queryParams.transaction_status = filters.transactionStatus;
      }
      if (filters.paymentType) {
        queryParams.payment_type = filters.paymentType;
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

      let responseData;

      if (returnAll) {
        // Usar o helper de paginação para buscar TODAS as páginas
        const items = await getAllItems.call(this, {
          maxResults,
          resource: 'sales',
          operation: 'getDetalhamentoPrecos',
          query: queryParams,
        });
        responseData = { items };
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;
        responseData = await hotmartApiRequest.call(
          this,
          'GET',
          '/payments/api/v1/sales/price/details',
          {},
          queryParams
        );
      }

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray((responseData as IDataObject & { items?: IDataObject[] }).items || []),
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
