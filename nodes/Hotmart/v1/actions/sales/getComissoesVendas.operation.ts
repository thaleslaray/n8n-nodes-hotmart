import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import type { SalesQueryParams } from '../../types';
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  transactionStatusOptions,
  commissionAsOptions,
} from '../common.descriptions';
import { getAllItems } from '../../helpers/pagination';
import { convertToTimestamp } from '../../helpers/dateUtils';

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getComissoesVendas'],
      },
    },
    default: false,
    description: 'Se ativado, retorna todas as comissões. Se desativado, retorna até o limite especificado',
    hint: 'Use com cuidado - muitas comissões podem demorar para processar',
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getComissoesVendas'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Número máximo de comissões a retornar por página',
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
        operation: ['getComissoesVendas'],
      },
    },
    default: 100,
    description: 'Número total máximo de comissões a retornar',
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
    description: 'Configure filtros para refinar sua busca de comissões',
    hint: 'Combine múltiplos filtros para análise detalhada de ganhos',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getComissoesVendas'],
      },
    },
    options: [
      /* 1 */
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description: 'Filtrar comissões por produto específico. Exemplo: prod_1234567890',
        hint: 'Veja comissões de um produto específico',
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
        description: 'Data inicial do período de comissões (formato: YYYY-MM-DD)',
        hint: 'Deixe vazio para buscar desde o início',
      },
      /* 3 */
      {
        displayName: 'Data Final',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Data final do período de comissões (formato: YYYY-MM-DD)',
        hint: 'Deixe vazio para buscar até hoje',
      },
      /* 4 */
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        description: 'Código único da transação para buscar comissão específica. Exemplo: HP12345678901234',
        hint: 'Útil para verificar comissão de uma venda específica',
        placeholder: 'HP12345678901234',
      },
      /* 5 */
      {
        displayName: 'Comissionado Como',
        name: 'commissionAs',
        type: 'options',
        options: commissionAsOptions,
        default: '',
        description: 'Seu papel na venda que gerou a comissão',
        hint: 'PRODUCER = Produtor, AFFILIATE = Afiliado, CO_PRODUCER = Co-produtor',
      },
      /* 6 */
      {
        displayName: 'Status da Transação',
        name: 'transactionStatus',
        type: 'options',
        options: transactionStatusOptions,
        default: '',
        description: 'Status da venda que gerou a comissão',
        hint: 'Comissões podem variar conforme status da venda',
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
        commissionAs?: string;
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
      if (filters.commissionAs) {
        queryParams.commission_as = filters.commissionAs;
      }

      let responseData;

      if (returnAll) {
        // Usar o helper de paginação para buscar TODAS as páginas
        const items = await getAllItems.call(this, {
          maxResults,
          resource: 'sales',
          operation: 'getComissoesVendas',
          query: queryParams,
        });
        responseData = { items };
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;
        responseData = await hotmartApiRequest.call(
          this,
          'GET',
          '/payments/api/v1/sales/commissions',
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
