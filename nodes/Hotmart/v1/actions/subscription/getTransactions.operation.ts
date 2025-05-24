// Hotmart - Transações de Assinatura

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import type { SubscriptionTransaction, SubscriptionQueryParams } from '../../types';

type TransactionListResponse = { items: SubscriptionTransaction[]; page_info?: { next_page_token?: string } };
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  subscriptionStatusOptions,
} from '../common.descriptions';
import { billingTypeOptions, recurrencyStatusOptions, paymentTypeOptions } from './constants';

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    default: false,
    description: 'Se deve retornar todas as transações ou apenas um conjunto limitado',
    hint: 'Para grandes volumes, use filtros de data para melhorar a performance',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getTransactions'],
      },
    },
  },
  {
    ...limitOption,
    default: 50,
    description: 'Quantas transações retornar por vez. Máximo: 500',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getTransactions'],
        returnAll: [false],
      },
    },
  },
  {
    ...maxResultsOption,
    default: 100,
    description: 'Número máximo de transações por página. Máximo: 500',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getTransactions'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filtros de Transação',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    description: 'Filtros avançados para buscar transações específicas de assinaturas',
    hint: 'Combine múltiplos filtros para resultados mais precisos',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getTransactions'],
      },
    },
    options: [
      {
        displayName: 'ID do Produto',
        name: 'product_id',
        type: 'options',
        default: '',
        description:
          'Selecione o produto ou especifique um ID usando <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
        hint: 'Filtra transações apenas do produto selecionado',
        typeOptions: {
          loadOptionsMethod: 'getProducts',
        },
      },
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        placeholder: 'HP1234567890',
        description: 'Código único da transação. Formato: HP[números]',
        hint: 'Busca uma transação específica pelo seu código',
      },
      {
        displayName: 'Nome do Assinante',
        name: 'subscriber_name',
        type: 'string',
        default: '',
        placeholder: 'João da Silva',
        description: 'Nome completo ou parcial do assinante',
        hint: 'A busca é case-sensitive. Use o nome exato',
      },
      {
        displayName: 'Email do Assinante',
        name: 'subscriber_email',
        type: 'string',
        default: '',
        placeholder: 'cliente@exemplo.com.br',
        description: 'Email do assinante para filtrar transações',
        hint: 'Deve corresponder exatamente ao email cadastrado',
        typeOptions: {
          validationRegex: '^[^\s@]+@[^\s@]+\.[^\s@]+$',
          validationMessage: 'Por favor, insira um email válido',
        },
      },
      {
        displayName: 'Tipo de Cobrança',
        name: 'billing_type',
        type: 'options',
        options: billingTypeOptions,
        default: '',
        description: 'Filtra pelo tipo de cobrança da transação',
        hint: 'RECORRÊNCIA: Pagamento recorrente | PRIMEIRA: Primeira cobrança',
      },
      {
        displayName: 'Status da Assinatura',
        name: 'subscription_status',
        type: 'options',
        options: subscriptionStatusOptions,
        default: '',
        description: 'Status atual da assinatura relacionada',
        hint: 'Filtra transações baseado no status atual da assinatura',
      },
      {
        displayName: 'Status da Recorrência',
        name: 'recurrency_status',
        type: 'options',
        options: recurrencyStatusOptions,
        default: '',
        description: 'Status do pagamento recorrente',
        hint: 'PAGO: Cobrança realizada | PENDENTE: Aguardando pagamento | FALHOU: Erro na cobrança',
      },
      {
        displayName: 'Status da Compra',
        name: 'purchase_status',
        type: 'string',
        default: '',
        placeholder: 'APPROVED, REFUNDED',
        description: 'Status da transação de compra. Exemplos: APPROVED, REFUNDED, CANCELED',
        hint: 'Use o status exato em maiúsculas',
      },
      {
        displayName: 'Data Inicial da Transação',
        name: 'transaction_date',
        type: 'dateTime',
        default: '',
        description: 'Data inicial para buscar transações. Formato: YYYY-MM-DD',
        hint: 'Busca transações realizadas a partir desta data',
      },
      {
        displayName: 'Data Final da Transação',
        name: 'end_transaction_date',
        type: 'dateTime',
        default: '',
        description: 'Data final para buscar transações. Formato: YYYY-MM-DD',
        hint: 'Busca transações realizadas até esta data',
      },
      {
        displayName: 'Código da Oferta',
        name: 'offer_code',
        type: 'string',
        default: '',
        placeholder: 'OFFER_ABC123',
        description: 'Código da oferta/plano associado à assinatura',
        hint: 'Identificador único da oferta no Hotmart',
      },
      {
        displayName: 'Tipo de Pagamento',
        name: 'purchase_payment_type',
        type: 'options',
        options: paymentTypeOptions,
        default: '',
        description: 'Método de pagamento utilizado na transação',
        hint: 'Filtra por cartão de crédito, boleto, PIX, etc.',
      },
      {
        displayName: 'Código do Assinante',
        name: 'subscriber_code',
        type: 'string',
        default: '',
        placeholder: 'sub_1234567890abcdef',
        description: 'Código único do assinante. Formato: sub_[código]',
        hint: 'Busca todas as transações de um assinante específico',
      },
    ],
  },
  {
    displayName: 'Informações Retornadas',
    name: 'transactionInfo',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getTransactions'],
      },
    },
    typeOptions: {
      noticeType: 'info',
      noticeContent: 'Cada transação inclui:\n• Código da transação e assinante\n• Detalhes do pagamento (valor, método, status)\n• Informações da recorrência\n• Dados do produto e plano\n• Timestamps de criação e processamento\n• Status de reembolso e garantia',
    },
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
      const filters = this.getNodeParameter('filters', i, {}) as {
        product_id?: string;
        transaction?: string;
        subscriber_name?: string;
        subscriber_email?: string;
        billing_type?: string;
        subscription_status?: string;
        recurrency_status?: string;
        purchase_status?: string;
        transaction_date?: string;
        end_transaction_date?: string;
        offer_code?: string;
        purchase_payment_type?: string;
        subscriber_code?: string;
      };

      const queryParams: SubscriptionQueryParams = {};

      // Mapear os filtros diretamente para os parâmetros da API
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          // Converter datas para timestamp
          if (key === 'transaction_date' || key === 'end_transaction_date') {
            queryParams[key] = new Date(value).getTime();
          } else {
            queryParams[key] = value;
          }
        }
      });

      if (returnAll) {
        // SOLUÇÃO DIRETA: Implementação manual de paginação
        // Inicializar com valor máximo permitido pela API (500)
        queryParams.max_results = 500;

        // Resultados acumulados
        const allItems: SubscriptionTransaction[] = [];
        let hasMorePages = true;

        // Loop manual de paginação
        while (hasMorePages) {
          // Log para depuração
          this.logger.debug(
            '\n[Paginação manual] Requisição com parâmetros:',
            queryParams
          );

          // Fazer requisição
          const response = await hotmartApiRequestTyped<TransactionListResponse>(
            this,
            'GET',
            '/payments/api/v1/subscriptions/transactions',
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

        // Correção: Passando o array diretamente, como no getAll.operation.ts que funciona
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(allItems),
          { itemData: { item: i } }
        );

        allReturnData.push(...executionData);
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;

        const response = await hotmartApiRequestTyped<TransactionListResponse>(
          this,
          'GET',
          '/payments/api/v1/subscriptions/transactions',
          {},
          queryParams
        );

        // Processar resultados para o caso onde returnAll=false
        const items = response.items || [];
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(items),
          { itemData: { item: i } }
        );

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
