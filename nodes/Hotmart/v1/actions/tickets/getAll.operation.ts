import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import { returnAllOption, limitOption } from '../common.descriptions';
import type { TicketQueryParams, TicketParticipant } from '../../types';

type TicketListResponse = { items: TicketParticipant[]; page_info?: { next_page_token?: string } };

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description:
      'Esta operação retorna a lista completa de participantes/compradores de ingressos para um evento específico. Você pode filtrar por status do ingresso, tipo de check-in, e-mail do participante, entre outros critérios. Ideal para gerenciar a lista de presença e controlar o acesso ao evento.',
    displayOptions: {
      show: {
        resource: ['tickets'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'ID do Evento',
    name: 'event_id',
    type: 'options',
    required: true,
    default: '',
    placeholder: 'Ex: evt_abc123xyz',
    description:
      'Selecione o evento ou especifique um ID usando uma <a href="https://docs.n8n.io/code-examples/expressions/">expressão</a>',
    hint: 'Escolha o evento para listar os participantes. O ID do evento pode ser obtido na operação "Informações do Evento" ou no dashboard da Hotmart',
    typeOptions: {
      loadOptionsMethod: 'getEventProducts',
    },
    displayOptions: {
      show: {
        resource: ['tickets'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...returnAllOption,
    displayOptions: {
      show: {
        resource: ['tickets'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...limitOption,
    displayOptions: {
      show: {
        resource: ['tickets'],
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
    description: 'Configure filtros para refinar a busca de participantes',
    hint: 'Use filtros para encontrar participantes específicos, verificar status de check-in ou listar apenas ingressos vendidos',
    displayOptions: {
      show: {
        resource: ['tickets'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Email do Comprador',
        name: 'buyer_email',
        type: 'string',
        default: '',
        placeholder: 'comprador@exemplo.com',
        description: 'E-mail do comprador do ingresso',
        hint: 'Digite o e-mail completo da pessoa que realizou a compra. Útil para encontrar todos os ingressos comprados por uma pessoa',
      },
      {
        displayName: 'Email do Participante',
        name: 'participant_email',
        type: 'string',
        default: '',
        placeholder: 'participante@exemplo.com',
        description: 'E-mail do participante',
        hint: 'E-mail da pessoa que utilizará o ingresso. Pode ser diferente do comprador quando o ingresso é transferido',
      },
      {
        displayName: 'Última Atualização',
        name: 'last_update',
        type: 'number',
        default: '',
        placeholder: '1640995200000',
        description: 'Data da última atualização do ingresso (timestamp em milissegundos)',
        hint: 'Use timestamp Unix em milissegundos. Exemplo: new Date("2024-01-01").getTime() retorna 1704067200000',
      },
      {
        displayName: 'ID do Lote',
        name: 'id_lot',
        type: 'string',
        default: '',
        placeholder: 'lot_123abc',
        description: 'ID do lote/categoria do ingresso',
        hint: 'Cada lote representa um tipo de ingresso com preço e benefícios específicos (ex: VIP, Pista, Camarote)',
      },
      {
        displayName: 'Status do Ingresso',
        name: 'ticket_status',
        type: 'options',
        options: [
          { name: 'Disponível', value: 'AVAILABLE' },
          { name: 'Contestado', value: 'CHARGEBACK' },
          { name: 'Excluído', value: 'EXCLUDED' },
          { name: 'Convite', value: 'INVITE' },
          { name: 'Convite Cancelado', value: 'INVITE_CANCELED' },
          { name: 'Reembolsado', value: 'REFUNDED' },
          { name: 'Reservado', value: 'RESERVED' },
          { name: 'Vendido', value: 'SOLD' },
        ],
        default: 'SOLD',
        description: 'Status do ingresso',
        hint: 'SOLD = Ingressos vendidos e pagos | AVAILABLE = Ainda disponíveis para venda | REFUNDED = Reembolsados',
      },
      {
        displayName: 'Tipo de Ingresso',
        name: 'ticket_type',
        type: 'options',
        options: [
          { name: 'Todos', value: 'ALL' },
          { name: 'Gratuito', value: 'FREE' },
          { name: 'Pago', value: 'PAID' },
        ],
        default: 'PAID',
        description: 'Tipo do ingresso',
        hint: 'FREE = Ingressos gratuitos ou cortesias | PAID = Ingressos pagos | ALL = Todos os tipos',
      },
      {
        displayName: 'Status do Check-In',
        name: 'checkin_status',
        type: 'options',
        options: [
          { name: 'Todos', value: 'ALL' },
          { name: 'Concluído', value: 'CONCLUDED' },
          { name: 'Parcial', value: 'PARTIAL' },
          { name: 'Pendente', value: 'PENDING' },
        ],
        default: 'PENDING',
        description: 'Status do check-in',
        hint: 'PENDING = Ainda não fez check-in | CONCLUDED = Check-in realizado | PARTIAL = Check-in parcial (eventos múltiplos dias)',
      },
      {
        displayName: 'ID do E-Ticket',
        name: 'id_eticket',
        type: 'string',
        default: '',
        placeholder: '000123',
        description: 'ID sequencial do ingresso',
        hint: 'Número único e sequencial do ingresso, geralmente visível no e-ticket enviado ao participante',
      },
      {
        displayName: 'QR Code do Ingresso',
        name: 'ticket_qr_code',
        type: 'string',
        default: '',
        placeholder: 'TKT-ABC123XYZ',
        description: 'Código QR do ingresso',
        hint: 'Código único presente no QR Code do ingresso. Use para localizar rapidamente um participante específico no check-in',
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
      const eventId = this.getNodeParameter('event_id', i) as string;
      const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
      const filters = this.getNodeParameter('filters', i, {}) as {
        buyer_email?: string;
        participant_email?: string;
        last_update?: number;
        id_lot?: string;
        ticket_status?: string;
        ticket_type?: string;
        checkin_status?: string;
        id_eticket?: string;
        ticket_qr_code?: string;
      };

      const qs: TicketQueryParams = {};
      if (filters.buyer_email) qs.buyer_email = filters.buyer_email;
      if (filters.participant_email) qs.participant_email = filters.participant_email;
      if (filters.last_update) qs.last_update = filters.last_update;
      if (filters.id_lot) qs.id_lot = filters.id_lot;
      if (filters.ticket_status) qs.ticket_status = filters.ticket_status;
      if (filters.ticket_type) qs.ticket_type = filters.ticket_type;
      if (filters.checkin_status) qs.checkin_status = filters.checkin_status;
      if (filters.id_eticket) qs.id_eticket = filters.id_eticket;
      if (filters.ticket_qr_code) qs.ticket_qr_code = filters.ticket_qr_code;

      let responseData;

      if (returnAll) {
        // Implementação manual de paginação para tickets, já que precisa do eventId no path
        const allItems: TicketParticipant[] = [];
        let nextPageToken: string | undefined;
        const maxResults = 50; // Número padrão por página
        const rateLimitDelay = 100; // ms entre requisições

        do {
          const queryParams = {
            ...qs,
            max_results: maxResults,
            ...(nextPageToken && { page_token: nextPageToken }),
          };

          const response = await hotmartApiRequestTyped<TicketListResponse>(
            this,
            'GET',
            `/events/api/v1/${eventId}/participants`,
            {},
            queryParams
          );

          if (response.items && Array.isArray(response.items)) {
            allItems.push(...response.items);
          }

          nextPageToken = response.page_info ? response.page_info.next_page_token : undefined;

          // Para evitar atingir rate limits, adicionar um pequeno atraso
          if (nextPageToken) {
            await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
          }
        } while (nextPageToken);

        responseData = allItems;
      } else {
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.max_results = limit;

        const response = await hotmartApiRequestTyped<TicketListResponse>(
          this,
          'GET',
          `/events/api/v1/${eventId}/participants`,
          {},
          qs
        );

        responseData = response.items || [];
      }

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData),
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
