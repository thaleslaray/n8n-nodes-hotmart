import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { returnAllOption, limitOption, maxResultsOption } from '../common.descriptions';
import { getAllItems } from '../../helpers/pagination'; // Importar helper
import { buildQueryParams } from '../../helpers/queryBuilder';
import type { SubscriptionQueryParams, SubscriptionSummary, ApiResponse } from '../../types';

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    default: false,
    description: 'Se deve retornar todos os sumários ou apenas um conjunto limitado',
    hint: 'O sumário apresenta dados consolidados de assinaturas por produto/plano',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getSummary'],
      },
    },
  },
  {
    ...limitOption,
    default: 50,
    description: 'Quantos sumários retornar por vez. Máximo: 500',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getSummary'],
        returnAll: [false],
      },
    },
  },
  {
    ...maxResultsOption,
    default: 100,
    description: 'Número máximo de itens por página. Máximo: 500',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getSummary'],
      },
    },
  },
  {
    displayName: 'Filtros do Sumário',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    description: 'Filtros para refinar o sumário de assinaturas',
    hint: 'O sumário agrupa dados por produto e plano, mostrando totais e estatísticas',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getSummary'],
      },
    },
    options: [
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description:
          'Selecione o produto ou especifique um ID usando <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
        hint: 'Filtra sumário apenas do produto selecionado',
        typeOptions: {
          loadOptionsMethod: 'getProducts',
        },
      },
      {
        displayName: 'Código do Assinante',
        name: 'subscriberCode',
        type: 'string',
        default: '',
        placeholder: 'sub_1234567890abcdef',
        description: 'Código único do assinante para sumário individual',
        hint: 'Retorna sumário específico de um assinante',
      },
      {
        displayName: 'Data de Início',
        name: 'accessionDate',
        type: 'dateTime',
        default: '',
        description: 'Data inicial para filtrar assinaturas criadas. Formato: YYYY-MM-DD',
        hint: 'Considera assinaturas criadas a partir desta data',
      },
      {
        displayName: 'Data Final',
        name: 'endAccessionDate',
        type: 'dateTime',
        default: '',
        description: 'Data final para filtrar assinaturas. Formato: YYYY-MM-DD',
        hint: 'Considera assinaturas criadas até esta data',
      },
      {
        displayName: 'Data da Próxima Cobrança',
        name: 'dateNextCharge',
        type: 'dateTime',
        default: '',
        description: 'Filtrar por data da próxima cobrança. Formato: YYYY-MM-DD',
        hint: 'Útil para identificar cobranças futuras',
      },
    ],
  },
  {
    displayName: 'Dados Retornados',
    name: 'summaryInfo',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getSummary'],
      },
    },
    typeOptions: {
      noticeType: 'info',
      noticeContent: 'O sumário inclui:\n• Total de assinaturas por status\n• Agrupamento por produto e plano\n• Estatísticas de cancelamento\n• Métricas de receita recorrente\n• Dados agregados para análise',
    },
  },
];

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[]
): Promise<INodeExecutionData[][]> {
  const allReturnData: INodeExecutionData[] = []; // Renomeado para clareza

  // Se não houver itens de entrada (comum quando usado via AI/MCP), cria um item vazio
  const itemsToProcess = items.length === 0 ? [{ json: {} }] : items;

  for (let i = 0; i < itemsToProcess.length; i++) {
    try {
      const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as {
        productId?: string;
        subscriberCode?: string;
        accessionDate?: string;
        endAccessionDate?: string;
        dateNextCharge?: string;
      };

      // Usar a utility para construir os query parameters
      const mapping = {
        productId: 'product_id',
        subscriberCode: 'subscriber_code',
        accessionDate: 'accession_date',
        endAccessionDate: 'end_accession_date',
        dateNextCharge: 'date_next_charge',
      };

      const dateFields = ['accessionDate', 'endAccessionDate', 'dateNextCharge'];
      
      const qs = buildQueryParams(filters, mapping, dateFields) as SubscriptionQueryParams;
      
      // Tratamento especial para productId que precisa ser número
      if (qs.product_id && typeof qs.product_id === 'string') {
        qs.product_id = parseInt(qs.product_id, 10);
      }

      let responseData;

      if (returnAll) {
        // Usar o helper de paginação para buscar TODAS as páginas
        const maxResults = this.getNodeParameter('maxResults', i, 50) as number;
        const allItems = await getAllItems.call(this, {
          maxResults,
          resource: 'subscription',
          operation: 'getSummary', // O helper usa isso para encontrar o endpoint
          query: qs,
          // endpoint: '/payments/api/v1/subscriptions/summary', // Removido - O helper determina isso
        });
        responseData = { items: allItems }; // Helper retorna array direto
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.max_results = limit;
        responseData = await hotmartApiRequest.call(
          this,
          'GET',
          '/payments/api/v1/subscriptions/summary',
          {},
          qs
        );
      }

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray((responseData as ApiResponse<SubscriptionSummary>).items || []),
        { itemData: { item: i } }
      );

      allReturnData.push(...executionData); // Renomeado
    } catch (error) {
      if (this.continueOnFail()) {
        allReturnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } }); // Renomeado
        continue;
      }
      throw error;
    }
  }

  return [allReturnData]; // Renomeado
};
