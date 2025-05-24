import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import { returnAllOption, limitOption, maxResultsOption } from '../common.descriptions';
import type { CouponQueryParams, CouponItem, CouponListResponse } from '../../types';
import { buildQueryParams } from '../../helpers/queryBuilder';

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['get'],
      },
    },
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['get'],
        returnAll: [false],
      },
    },
  },
  {
    ...maxResultsOption,
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'ID do Produto',
    name: 'product_id',
    type: 'options',
    required: true,
    default: '',
    description: 'Selecione o produto para listar todos os cupons vinculados a ele',
    hint: 'Os cupons são organizados por produto. Selecione o produto para ver seus cupons ativos e inativos',
    typeOptions: {
      loadOptionsMethod: 'getProducts',
    },
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Filtros',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    description: 'Filtros opcionais para refinar a busca de cupons',
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['get'],
      },
    },
    options: [
      {
        displayName: 'Código do Cupom',
        name: 'code',
        type: 'string',
        default: '',
        placeholder: 'Ex: PROMO2024, DESCONTO20',
        description: 'Buscar cupom por código exato. Útil para verificar se um cupom específico existe',
        hint: 'Digite o código exato do cupom. A busca é sensível a maiúsculas/minúsculas',
      },
    ],
  },
];

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[]
): Promise<INodeExecutionData[][]> {
  const returnData: INodeExecutionData[] = [];

  // Se não houver itens de entrada (comum quando usado via AI/MCP), cria um item vazio
  const itemsToProcess = items.length === 0 ? [{ json: {} }] : items;

  for (let i = 0; i < itemsToProcess.length; i++) {
    try {
      const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
      const maxResults = this.getNodeParameter('maxResults', i, 50) as number;
      const productId = this.getNodeParameter('product_id', i) as string;
      const filters = this.getNodeParameter('filters', i, {}) as {
        code?: string;
      };

      // Usar a utility - campo já está com nome correto
      const qs = buildQueryParams(filters) as CouponQueryParams;

      let responseData;

      if (returnAll) {
        // Implementação manual da paginação para a API de cupons
        const allItems: CouponItem[] = [];
        let nextPageToken: string | undefined = undefined;
        const rateLimitDelay = 100; // ms

        do {
          const currentQs: CouponQueryParams = {
            ...qs,
            max_results: maxResults,
            ...(nextPageToken && { page_token: nextPageToken }),
          };

          const pageResponse = await hotmartApiRequestTyped<CouponListResponse>(
            this,
            'GET',
            `/products/api/v1/coupon/product/${productId}`,
            {},
            currentQs
          );

          if (pageResponse.items && Array.isArray(pageResponse.items)) {
            allItems.push(...pageResponse.items);
          }

          nextPageToken = pageResponse.page_info?.next_page_token;

          if (nextPageToken) {
            await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
          }
        } while (nextPageToken);

        responseData = { items: allItems };
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.max_results = limit;
        responseData = await hotmartApiRequest.call(
          this,
          'GET',
          `/products/api/v1/coupon/product/${productId}`,
          {},
          qs
        );
      }

      // Adicionar informações visuais amigáveis para cada cupom
      const responseWithItems = responseData as { items?: CouponItem[] };
      if (responseWithItems && responseWithItems.items && Array.isArray(responseWithItems.items)) {
        responseWithItems.items.forEach((item: CouponItem) => {
          if (item.discount) {
            item.discount_percentage = `${(item.discount * 100).toFixed(0)}%`;
          }
          if (item.coupon_code && item.discount) {
            item.coupon_info = `${item.coupon_code} - ${(item.discount * 100).toFixed(0)}% (${item.status || 'unknown'})`;
          }
        });
      }

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseWithItems.items || []),
        { itemData: { item: i } }
      );

      returnData.push(...executionData);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
        continue;
      }
      throw error;
    }
  }

  return [returnData];
};
