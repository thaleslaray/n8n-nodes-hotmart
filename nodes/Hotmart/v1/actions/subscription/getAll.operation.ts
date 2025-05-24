/**
 * Get all subscriptions operation for Hotmart
 * @module subscription/getAll
 * @description Retrieves subscriptions from Hotmart with various filtering options
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import type { SubscriptionQueryParams, SubscriptionItem } from '../../types';
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  subscriptionStatusOptions,
} from '../common.descriptions';
import { formatOutput } from '../../helpers/outputFormatter';
import { buildQueryParams } from '../../helpers/queryBuilder';

type SubscriptionListResponse = { items: SubscriptionItem[]; page_info?: { next_page_token?: string } };

/**
 * Operation description for the UI
 * @type {INodeProperties[]}
 * @description Defines the properties and filters available for listing subscriptions
 */
export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    default: false,
    description: 'Se deve retornar todos os resultados ou apenas um conjunto limitado. Para grandes volumes de dados, recomenda-se usar paginação (returnAll: false)',
    hint: 'Atenção: Retornar todos os resultados pode demorar em bases com muitas assinaturas. Use filtros para reduzir o volume',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...limitOption,
    default: 50,
    description: 'Quantos resultados retornar por vez. Máximo: 500',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
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
    ...maxResultsOption,
    default: 100,
    description: 'Número máximo de itens a retornar por página ao paginar. Valor máximo: 500',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
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
    displayName: 'Filtros',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    description: 'Filtros para refinar a busca de assinaturas. Combine múltiplos filtros para resultados mais precisos',
    hint: 'Dica: Use filtros de data para limitar o período e melhorar a performance da busca',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description:
          'Selecione o produto da lista ou especifique um ID usando uma <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
        hint: 'Filtra assinaturas apenas do produto selecionado',
        typeOptions: {
          loadOptionsMethod: 'getProducts',
        },
      },
      {
        displayName: 'Nome do Plano',
        name: 'plan',
        type: 'string',
        default: '',
        placeholder: 'Plano Premium, Plano Básico',
        description: 'Nome do plano de assinatura. Para múltiplos planos, separe com vírgulas. Exemplo: "Premium,Gold,Silver"',
        hint: 'O nome deve corresponder exatamente ao cadastrado no Hotmart. Aceita múltiplos valores separados por vírgula',
      },
      {
        displayName: 'ID do Plano',
        name: 'planId',
        type: 'string',
        default: '',
        placeholder: 'plan_abc123def456',
        description: 'ID único do plano de assinatura. Formato: plan_[código alfanumérico]',
        hint: 'Encontre o ID do plano no painel do Hotmart, seção Produtos > Planos',
      },
      {
        displayName: 'Data de Início da Assinatura',
        name: 'accessionDate',
        type: 'dateTime',
        default: '',
        description: 'Data a partir da qual filtrar assinaturas criadas. Formato: YYYY-MM-DD',
        hint: 'Busca assinaturas criadas a partir desta data (inclusive)',
      },
      {
        displayName: 'Data Final da Assinatura',
        name: 'endAccessionDate',
        type: 'dateTime',
        default: '',
        description: 'Data até a qual filtrar assinaturas criadas. Formato: YYYY-MM-DD',
        hint: 'Busca assinaturas criadas até esta data (inclusive)',
      },
      {
        displayName: 'Status da Assinatura',
        name: 'status',
        type: 'multiOptions',
        options: subscriptionStatusOptions,
        default: ['ACTIVE'],
        description: 'Estado atual da assinatura. Selecione um ou mais status',
        hint: 'ACTIVE: Ativa | CANCELED: Cancelada | DELAYED: Atrasada | TRIAL: Período de teste',
      },
      {
        displayName: 'Código do Assinante',
        name: 'subscriberCode',
        type: 'string',
        default: '',
        placeholder: 'sub_1234567890abcdef',
        description: 'Código único do assinante no formato: sub_[código alfanumérico]',
        hint: 'Use este campo para buscar uma assinatura específica por seu código único',
      },
      {
        displayName: 'E-mail do Assinante',
        name: 'subscriberEmail',
        type: 'string',
        default: '',
        placeholder: 'cliente@exemplo.com.br',
        description: 'Email do assinante cadastrado na compra',
        hint: 'O email deve corresponder exatamente ao cadastrado (case-sensitive)',
        typeOptions: {
          validationRegex: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
          validationMessage: 'Por favor, insira um email válido',
        },
      },
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        placeholder: 'HP1234567890',
        description: 'Código único da transação de pagamento. Formato: HP[números]',
        hint: 'Encontre o código da transação no email de confirmação ou no painel do Hotmart',
      },
      {
        displayName: 'Período de Teste',
        name: 'trial',
        type: 'boolean',
        default: false,
        description: 'Filtrar apenas assinaturas em período de teste (trial)',
        hint: 'true: Apenas trials | false: Todas as assinaturas',
      },
      {
        displayName: 'Data Inicial de Cancelamento',
        name: 'cancelationDate',
        type: 'dateTime',
        default: '',
        description: 'Data a partir da qual filtrar assinaturas canceladas. Formato: YYYY-MM-DD',
        hint: 'Busca assinaturas canceladas a partir desta data',
      },
      {
        displayName: 'Data Final de Cancelamento',
        name: 'endCancelationDate',
        type: 'dateTime',
        default: '',
        description: 'Data até a qual filtrar assinaturas canceladas. Formato: YYYY-MM-DD',
        hint: 'Busca assinaturas canceladas até esta data',
      },
      {
        displayName: 'Data da Próxima Cobrança',
        name: 'dateNextCharge',
        type: 'dateTime',
        default: '',
        description: 'Data a partir da qual filtrar próximas cobranças. Formato: YYYY-MM-DD',
        hint: 'Útil para identificar assinaturas que serão cobradas em breve',
      },
      {
        displayName: 'Data Final da Próxima Cobrança',
        name: 'endDateNextCharge',
        type: 'dateTime',
        default: '',
        description: 'Data até a qual filtrar próximas cobranças. Formato: YYYY-MM-DD',
        hint: 'Define o período máximo para buscar próximas cobranças',
      },
    ],
  },
];

/**
 * Executes the get all subscriptions operation
 * @param {IExecuteFunctions} this - n8n execution context
 * @param {INodeExecutionData[]} items - Input items from previous node
 * @returns {Promise<INodeExecutionData[][]>} Array containing processed subscription data
 * @throws {NodeApiError} When API request fails
 * @description Fetches subscriptions from Hotmart API with support for pagination and filtering.
 * Handles date conversions, status filtering, and automatic pagination when returnAll is true.
 * @example
 * // Fetch all active subscriptions
 * const filters = { status: ['ACTIVE'] };
 * const result = await execute.call(this, items);
 *
 * @example
 * // Fetch limited number of subscriptions
 * this.getNodeParameter('returnAll', 0, false);
 * this.getNodeParameter('limit', 0, 10);
 * const result = await execute.call(this, items);
 */
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
      const filters = this.getNodeParameter('filters', i, {}) as {
        productId?: string;
        plan?: string;
        planId?: string;
        accessionDate?: string;
        endAccessionDate?: string;
        status?: string[];
        subscriberCode?: string;
        subscriberEmail?: string;
        transaction?: string;
        trial?: boolean;
        cancelationDate?: string;
        endCancelationDate?: string;
        dateNextCharge?: string;
        endDateNextCharge?: string;
      };

      // Mapeamento de campos e campos de data
      const fieldMapping = {
        productId: 'product_id',
        planId: 'plan_id',
        subscriberEmail: 'subscriber_email',
        subscriberCode: 'subscriber_code',
        accessionDate: 'accession_date',
        endAccessionDate: 'end_accession_date',
        cancelationDate: 'cancelation_date',
        endCancelationDate: 'end_cancelation_date',
        dateNextCharge: 'date_next_charge',
        endDateNextCharge: 'end_date_next_charge',
      };

      const dateFields = [
        'accessionDate',
        'endAccessionDate',
        'cancelationDate',
        'endCancelationDate',
        'dateNextCharge',
        'endDateNextCharge',
      ];

      // Usar buildQueryParams para campos simples
      const queryParams = buildQueryParams(filters, fieldMapping, dateFields) as SubscriptionQueryParams;

      // Tratamento especial para campos que precisam de lógica customizada
      if (filters.status?.length) {
        queryParams.status = filters.status.join(',');
      }

      // Campos que não precisam de mapeamento
      if (filters.plan) {
        queryParams.plan = filters.plan;
      }

      if (filters.transaction) {
        queryParams.transaction = filters.transaction;
      }

      if (filters.trial !== undefined) {
        queryParams.trial = filters.trial;
      }

      this.logger.debug('Query params finais:', queryParams);

      if (returnAll) {
        // SOLUÇÃO DIRETA: Implementação manual de paginação
        // Inicializar com valor máximo permitido pela API (500)
        queryParams.max_results = 500;

        // Resultados acumulados
        const allItems: SubscriptionItem[] = [];
        let hasMorePages = true;

        // Loop manual de paginação
        while (hasMorePages) {
          // Log para depuração
          this.logger.debug(
            '\n[Paginação manual] Requisição com parâmetros:',
            queryParams
          );

          // Fazer requisição
          const response = await hotmartApiRequestTyped<SubscriptionListResponse>(
            this,
            'GET',
            '/payments/api/v1/subscriptions',
            {},
            queryParams
          );

          // Adicionar itens da página atual
          if (response && response.items && Array.isArray(response.items)) {
            this.logger.debug(`\n[Paginação manual] Recebidos ${response.items.length} itens`);
            allItems.push(...response.items);
          }

          // Verificar se há mais páginas
          if (response && response.page_info && response.page_info.next_page_token) {
            // Tem próxima página, atualizar token
            queryParams.page_token = response.page_info.next_page_token;
            this.logger.debug(
              `\n[Paginação manual] Próxima página disponível: ${queryParams.page_token}`
            );

            // Pequeno delay para evitar problemas de rate limit
            await new Promise((resolve) => setTimeout(resolve, 100));
          } else {
            // Não tem mais páginas
            hasMorePages = false;
            this.logger.debug('\n[Paginação manual] Fim da paginação');
          }
        }

        this.logger.debug(`\n[Paginação manual] Total de itens: ${allItems.length}`);

        // Usar formatação de saída padronizada
        const executionData = formatOutput.call(this, allItems, i);

        allReturnData.push(...executionData);
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;
        this.logger.debug('Query params finais:', queryParams);

        const response = await hotmartApiRequestTyped<SubscriptionListResponse>(
          this,
          'GET',
          '/payments/api/v1/subscriptions',
          {},
          queryParams
        );

        // Processar resultados para o caso onde returnAll=false
        const items = response.items || [];

        // Usar formatação de saída padronizada
        const executionData = formatOutput.call(this, items, i);

        allReturnData.push(...executionData);
      }
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
