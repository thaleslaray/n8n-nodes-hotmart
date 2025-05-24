import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import type { SalesQueryParams, SalesParticipantItem, ApiResponse } from '../../types';
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
        operation: ['getParticipantesVendas'],
      },
    },
    default: false,
    description: 'Se ativado, retorna todos os participantes. Se desativado, retorna até o limite especificado',
    hint: 'Ideal para mapear toda a cadeia de vendas e afiliados',
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getParticipantesVendas'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Número máximo de participantes a retornar por página',
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
        operation: ['getParticipantesVendas'],
      },
    },
    default: 100,
    description: 'Número total máximo de participantes a retornar',
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
    description: 'Configure filtros para identificar quem participou de cada venda',
    hint: 'Veja produtores, afiliados e co-produtores de cada transação',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getParticipantesVendas'],
      },
    },
    options: [
      // 1. ID do Produto
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description: 'Ver participantes de vendas de um produto específico. Exemplo: prod_1234567890',
        hint: 'Identifique todos os afiliados de um produto',
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
        description: 'Data inicial do período de análise (formato: YYYY-MM-DD)',
        hint: 'Analise performance de afiliados por período',
      },
      // 3. Data Final
      {
        displayName: 'Data Final',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Data final do período de análise (formato: YYYY-MM-DD)',
        hint: 'Compare períodos para identificar melhores afiliados',
      },
      // 4. E-mail do Comprador
      {
        displayName: 'E-mail do Comprador',
        name: 'buyerEmail',
        type: 'string',
        default: '',
        description: 'E-mail do comprador para rastrear suas compras',
        hint: 'Veja todos os produtos que um cliente comprou',
        placeholder: 'cliente@exemplo.com',
        typeOptions: {
          validation: {
            email: true,
          },
        },
      },
      // 5. Origem da Venda (SRC)
      {
        displayName: 'Origem da Venda (SRC)',
        name: 'salesSource',
        type: 'string',
        default: '',
        description: 'Código de rastreamento da campanha (parâmetro src). Exemplo: facebook_ads',
        hint: 'Identifique afiliados por campanha específica',
        placeholder: 'nome_da_campanha',
      },
      // 6. Código da Transação
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        description: 'Ver todos os participantes de uma venda específica. Exemplo: HP12345678901234',
        hint: 'Veja quem ganhou comissão nesta venda',
        placeholder: 'HP12345678901234',
      },
      // 7. Nome do Comprador
      {
        displayName: 'Nome do Comprador',
        name: 'buyerName',
        type: 'string',
        default: '',
        description: 'Nome completo ou parcial do comprador',
        hint: 'Rastreie vendas por nome do cliente',
        placeholder: 'João Silva',
      },
      // 8. Nome do Afiliado
      {
        displayName: 'Nome do Afiliado',
        name: 'affiliateName',
        type: 'string',
        default: '',
        description: 'Nome do afiliado para ver todas as suas vendas',
        hint: 'Analise performance individual de afiliados',
        placeholder: 'Nome do Afiliado',
      },
      // 9. Comissionado Como
      {
        displayName: 'Comissionado Como',
        name: 'commissionAs',
        type: 'options',
        options: commissionAsOptions,
        default: '',
        description: 'Filtrar por papel específico na venda',
        hint: 'Veja apenas vendas onde você foi produtor, afiliado ou co-produtor',
      },
      // 10. Status da Transação
      {
        displayName: 'Status da Transação',
        name: 'transactionStatus',
        type: 'options',
        options: transactionStatusOptions,
        default: '',
        description: 'Status das vendas dos participantes',
        hint: 'Vendas aprovadas, completas ou canceladas',
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
        buyerName?: string;
        affiliateName?: string;
        commissionAs?: string;
        buyerEmail?: string;
        salesSource?: string;
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
      if (filters.buyerName) {
        queryParams.buyer_name = filters.buyerName;
      }
      if (filters.affiliateName) {
        queryParams.affiliate_name = filters.affiliateName;
      }
      if (filters.commissionAs) {
        queryParams.commission_as = filters.commissionAs;
      }
      if (filters.buyerEmail) {
        queryParams.buyer_email = filters.buyerEmail;
      }
      if (filters.salesSource) {
        queryParams.sales_source = filters.salesSource;
      }

      let responseData;

      if (returnAll) {
        // Usar o helper de paginação para buscar TODAS as páginas
        const items = await getAllItems.call(this, {
          maxResults,
          resource: 'sales',
          operation: 'getParticipants',
          query: queryParams,
        });
        responseData = { items };
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;
        responseData = await hotmartApiRequest.call(
          this,
          'GET',
          '/payments/api/v1/sales/users',
          {},
          queryParams
        );
      }

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray((responseData as ApiResponse<SalesParticipantItem>).items || []),
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
