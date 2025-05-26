import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import type { ProductQueryParams, ProductItem } from '../../types';
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  productStatusOptions,
  productFormatOptions,
} from '../common.descriptions';
import { buildQueryParams } from '../../helpers/queryBuilder';

type ProductListResponse = { items: ProductItem[]; page_info?: { next_page_token?: string } };

export const description: INodeProperties[] = [
  {
    displayName: 'Aviso',
    name: 'notice',
    type: 'notice',
    default: '',
    description: 'Esta operação retorna informações detalhadas sobre os produtos disponíveis na sua conta Hotmart, incluindo dados como nome, preço, status, formato e configurações.',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...returnAllOption,
    default: false,
    description: 'Se deve retornar todos os produtos disponíveis. Por padrão retorna até 50 produtos.',
    hint: 'Ativar para buscar todos os produtos de uma vez. Útil para relatórios completos.',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...limitOption,
    default: 50,
    description: 'Quantos produtos retornar por página. Máximo permitido pela API: 500.',
    hint: 'Use valores menores (50-100) para respostas mais rápidas.',
    placeholder: '50',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
  },
  {
    ...maxResultsOption,
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Modo de Seleção de Produto',
    name: 'productSelectionMode',
    type: 'options',
    options: [
      {
        name: 'Lista de Produtos',
        value: 'dropdown',
        description: 'Selecionar produto de uma lista carregada dinamicamente',
      },
      {
        name: 'ID Manual',
        value: 'manual',
        description: 'Inserir manualmente o ID do produto',
      },
    ],
    default: 'dropdown',
    description: 'Como você deseja especificar o produto para filtrar',
    hint: 'Use "Lista de Produtos" para buscar facilmente ou "ID Manual" se você já souber o ID',
    displayOptions: {
      show: {
        resource: ['product'],
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
    description: 'Filtros opcionais para refinar a busca de produtos',
    hint: 'Combine múltiplos filtros para resultados mais específicos',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'ID do Produto',
        name: 'id',
        type: 'options',
        default: '',
        description: 'Filtrar por um produto específico selecionando da lista',
        hint: 'Comece a digitar para buscar produtos disponíveis',
        typeOptions: {
          loadOptionsMethod: 'getProducts',
        },
        displayOptions: {
          show: {
            '/productSelectionMode': ['dropdown'],
          },
        },
      },
      {
        displayName: 'ID do Produto',
        name: 'idManual',
        type: 'string',
        default: '',
        description: 'ID único do produto na Hotmart',
        hint: 'Exemplo: 123456 ou PROD_ABC123',
        placeholder: 'Ex: 123456',
        displayOptions: {
          show: {
            '/productSelectionMode': ['manual'],
          },
        },
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: productStatusOptions,
        default: 'ACTIVE',
        description: 'Filtrar produtos por status de disponibilidade',
        hint: 'ACTIVE: produtos ativos | INACTIVE: produtos inativos | DELETED: produtos excluídos',
      },
      {
        displayName: 'Formato',
        name: 'format',
        type: 'options',
        options: productFormatOptions,
        default: 'EBOOK',
        description: 'Filtrar produtos por tipo de formato/mídia',
        hint: 'Escolha o formato do conteúdo digital que você procura',
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
      const productSelectionMode = this.getNodeParameter('productSelectionMode', i, 'dropdown') as string;
      const filters = this.getNodeParameter('filters', i, {}) as {
        id?: string;
        idManual?: string;
        status?: string;
        format?: string;
      };

      // Preparar filtros para a utility
      const processedFilters = { ...filters };
      
      // Determinar qual ID usar baseado no modo de seleção
      if (productSelectionMode === 'manual' && filters.idManual) {
        processedFilters.id = filters.idManual;
        delete processedFilters.idManual;
      } else if (productSelectionMode === 'dropdown' && filters.id) {
        // Já tem o id correto
      } else {
        delete processedFilters.id;
        delete processedFilters.idManual;
      }
      
      // Usar a utility - campos já estão com os nomes corretos (id, status, format)
      const qs = buildQueryParams(processedFilters) as ProductQueryParams;

      if (returnAll) {
        // SOLUÇÃO DIRETA: Implementação manual de paginação
        // Inicializar com valor máximo permitido pela API (500)
        qs.max_results = 500;

        // Resultados acumulados
        const allItems: ProductItem[] = [];
        let hasMorePages = true;

        // Loop manual de paginação
        while (hasMorePages) {
          // Log para depuração
          this.logger.debug(
            '\n[Paginação manual] Requisição com parâmetros:',
            qs
          );

          // Fazer requisição
          const response = await hotmartApiRequestTyped<ProductListResponse>(
            this,
            'GET',
            '/products/api/v1/products',
            {},
            qs
          );

          // Adicionar itens da página atual
          if (response && response.items && Array.isArray(response.items)) {
            this.logger.debug(`\n[Paginação manual] Recebidos ${response.items.length} itens`);
            allItems.push(...response.items);
          }

          // Verificar se há mais páginas
          if (response && response.page_info && response.page_info.next_page_token) {
            // Tem próxima página, atualizar token
            qs.page_token = response.page_info.next_page_token;
            this.logger.debug(`\n[Paginação manual] Próxima página disponível: ${qs.page_token}`);

            // Pequeno delay para evitar problemas de rate limit
            await new Promise((resolve) => {
              Promise.resolve().then(resolve);
            });
          } else {
            // Não tem mais páginas
            hasMorePages = false;
            this.logger.debug('\n[Paginação manual] Fim da paginação');
          }
        }

        this.logger.debug(`\n[Paginação manual] Total de itens: ${allItems.length}`);

        // Correção: Passando o array diretamente, como no getAll.operation.ts que funciona
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(allItems),
          { itemData: { item: i } }
        );

        returnData.push(...executionData);
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.max_results = limit || 50;

        const response = await hotmartApiRequestTyped<{
          items: ProductItem[];
          page_info?: { next_page_token?: string };
        }>(
          this,
          'GET',
          '/products/api/v1/products',
          {},
          qs
        );

        // Processar resultados para o caso onde returnAll=false
        const items = response.items || [];
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(items),
          { itemData: { item: i } }
        );

        returnData.push(...executionData);
      }
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
