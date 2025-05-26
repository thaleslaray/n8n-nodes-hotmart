import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import type { SalesQueryParams, SalesHistoryItem } from '../../types';
import {
  returnAllOption,
  limitOption,
  maxResultsOption,
  transactionStatusOptions,
  paymentTypeOptions,
  commissionAsOptions,
} from '../common.descriptions';
import { formatOutput } from '../../helpers/outputFormatter';
import { buildQueryParams } from '../../helpers/queryBuilder';

type SalesHistoryResponse = { items: SalesHistoryItem[]; page_info?: { next_page_token?: string } };

export const description: INodeProperties[] = [
  {
    ...returnAllOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getHistoricoVendas'],
      },
    },
    default: false,
    description: 'Se ativado, retorna todas as vendas. Se desativado, retorna até o limite especificado',
    hint: 'Use com cuidado - históricos grandes podem demorar para processar',
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getHistoricoVendas'],
        returnAll: [false],
      },
    },
    default: 50,
    description: 'Número máximo de vendas a retornar por página',
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
        operation: ['getHistoricoVendas'],
        returnAll: [false],
      },
    },
    default: 100,
    description: 'Número total máximo de vendas a retornar',
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
    description: 'Configure filtros para refinar sua busca de vendas',
    hint: 'Combine múltiplos filtros para resultados mais precisos',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['getHistoricoVendas'],
      },
    },
    options: [
      // 1. ID do Produto
      {
        displayName: 'ID do Produto',
        name: 'productId',
        type: 'options',
        default: '',
        description: 'Filtrar vendas por produto específico. Exemplo: prod_1234567890',
        hint: 'Selecione um produto da lista ou digite o ID manualmente',
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
        description: 'Data inicial do período de vendas (formato: YYYY-MM-DD)',
        hint: 'Deixe vazio para buscar desde o início',
      },
      // 3. Data Final
      {
        displayName: 'Data Final',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'Data final do período de vendas (formato: YYYY-MM-DD)',
        hint: 'Deixe vazio para buscar até hoje',
      },
      // 4. Origem da Venda (SRC)
      {
        displayName: 'Origem da Venda (SRC)',
        name: 'salesSource',
        type: 'string',
        default: '',
        description: 'Código de rastreamento da origem da venda (parâmetro src). Exemplo: facebook_ads',
        hint: 'Use para rastrear vendas de campanhas específicas',
        placeholder: 'nome_da_campanha',
      },
      // 5. Código da Transação
      {
        displayName: 'Código da Transação',
        name: 'transaction',
        type: 'string',
        default: '',
        description: 'Código único da transação na Hotmart. Exemplo: HP12345678901234',
        hint: 'Útil para buscar uma venda específica',
        placeholder: 'HP12345678901234',
      },
      // 6. Nome do Comprador
      {
        displayName: 'Nome do Comprador',
        name: 'buyerName',
        type: 'string',
        default: '',
        description: 'Nome completo ou parcial do comprador',
        hint: 'A busca é case-insensitive',
        placeholder: 'João Silva',
      },
      // 7. E-mail do Comprador (corrigido)
      {
        displayName: 'E-mail do Comprador',
        name: 'buyerEmail',
        type: 'string',
        default: '',
        description: 'E-mail completo do comprador',
        hint: 'Digite o e-mail exato para resultados precisos',
        placeholder: 'cliente@exemplo.com',
        typeOptions: {
          validation: {
            email: true,
          },
        },
      },
      // 8. Status da Transação
      {
        displayName: 'Status da Transação',
        name: 'transactionStatus',
        type: 'options',
        options: transactionStatusOptions,
        default: '',
        description: 'Status atual da venda na plataforma',
        hint: 'APPROVED = Aprovada, COMPLETE = Completa, CANCELED = Cancelada',
      },
      // 9. Tipo de Pagamento
      {
        displayName: 'Tipo de Pagamento',
        name: 'paymentType',
        type: 'options',
        options: paymentTypeOptions,
        default: '',
        description: 'Método de pagamento usado na compra',
        hint: 'CREDIT_CARD = Cartão, BILLET = Boleto, PIX = Pix',
      },
      // 10. Código da Oferta
      {
        displayName: 'Código da Oferta',
        name: 'offerCode',
        type: 'string',
        default: '',
        description: 'Código da oferta/funil específico. Exemplo: offer_abc123',
        hint: 'Encontre no painel Hotmart > Produto > Ofertas',
        placeholder: 'offer_abc123',
      },
      // 11. Comissionado como
      {
        displayName: 'Comissionado como',
        name: 'commissionAs',
        type: 'options',
        options: commissionAsOptions,
        default: '',
        description: 'Seu papel na venda (produtor, afiliado, co-produtor)',
        hint: 'Filtra vendas onde você participou com esse papel',
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
      const filters = this.getNodeParameter('filters', i, {}) as {
        productId?: string;
        transactionStatus?: string;
        startDate?: string;
        endDate?: string;
        buyerEmail?: string;
        buyerName?: string;
        transaction?: string;
        salesSource?: string;
        paymentType?: string;
        offerCode?: string;
        commissionAs?: string;
      };

      // Mapeamento de campos e campos de data
      const fieldMapping = {
        productId: 'product_id',
        transactionStatus: 'transaction_status',
        startDate: 'start_date',
        endDate: 'end_date',
        buyerEmail: 'buyer_email',
        buyerName: 'buyer_name',
        salesSource: 'sales_source',
        paymentType: 'payment_type',
        offerCode: 'offer_code',
        commissionAs: 'commission_as',
      };

      const dateFields = ['startDate', 'endDate'];

      // Usar buildQueryParams para construir os parâmetros
      const queryParams = buildQueryParams(filters, fieldMapping, dateFields) as SalesQueryParams;

      // Campo que não precisa de mapeamento
      if (filters.transaction) {
        queryParams.transaction = filters.transaction;
      }

      if (returnAll) {
        // SOLUÇÃO DIRETA: Implementação manual de paginação
        // Inicializar com valor máximo permitido pela API (500)
        queryParams.max_results = 500;

        // Resultados acumulados
        const allItems: SalesHistoryItem[] = [];
        let hasMorePages = true;

        // Loop manual de paginação
        while (hasMorePages) {
          // Log para depuração
          this.logger.debug(
            '\n[Paginação manual] Requisição com parâmetros:',
            queryParams
          );

          // Fazer requisição
          const response = await hotmartApiRequestTyped<SalesHistoryResponse>(
            this,
            'GET',
            '/payments/api/v1/sales/history',
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

        // Usar formatação de saída padronizada
        const executionData = formatOutput.call(this, allItems, i);

        allReturnData.push(...executionData);
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        queryParams.max_results = limit;

        const response = await hotmartApiRequestTyped<SalesHistoryResponse>(
          this,
          'GET',
          '/payments/api/v1/sales/history',
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
