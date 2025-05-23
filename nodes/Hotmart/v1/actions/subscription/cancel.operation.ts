import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Código do Assinante',
    name: 'subscriberCode',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sub_1234567890abcdef',
    description: 'Código único do assinante no formato: sub_[código alfanumérico]',
    hint: '⚠️ ATENÇÃO: Esta ação cancelará permanentemente a assinatura. Encontre o código no painel de assinaturas do Hotmart',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancel'],
      },
    },
  },
  {
    displayName: 'Opções',
    name: 'options',
    type: 'collection',
    placeholder: 'Adicionar Opção',
    default: {},
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancel'],
      },
    },
    options: [
      {
        displayName: 'Enviar Email de Notificação',
        name: 'sendMail',
        type: 'boolean',
        default: true,
        description: 'Enviar email automático informando o assinante sobre o cancelamento',
        hint: 'Recomendado manter ativo para manter o cliente informado',
      },
    ],
  },
  {
    displayName: 'Aviso',
    name: 'notice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancel'],
      },
    },
    typeOptions: {
      noticeType: 'warning',
      noticeContent: 'Esta operação é irreversível. A assinatura será cancelada imediatamente e o cliente perderá acesso ao conteúdo ao final do período pago.',
    },
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
      const subscriberCode = this.getNodeParameter('subscriberCode', i) as string;
      const options = this.getNodeParameter('options', i, {}) as { sendMail?: boolean };
      const sendMail = options.sendMail !== undefined ? options.sendMail : true;

      const body = {
        send_mail: sendMail,
      };

      // Fazer a requisição para cancelar a assinatura
      const responseData = await hotmartApiRequest.call(
        this,
        'POST',
        `/payments/api/v1/subscriptions/${subscriberCode}/cancel`,
        body
      );

      // O retorno da API inclui:
      // - status: Status atual da assinatura
      // - subscriber_code: Código do assinante
      // - creation_date: Data de criação
      // - current_recurrence: Número da recorrência atual
      // - date_last_recurrence: Data do último pagamento
      // - date_next_charge: Data da próxima cobrança
      // - due_day: Dia da cobrança
      // - trial_period: Dias de período de teste
      // - interval_type_between_charges: Tipo de intervalo entre cobranças
      // - interval_between_charges: Intervalo entre cobranças
      // - max_charge_cycles: Quantidade máxima de recorrências
      // - activation_date: Data de ativação
      // - shopper: Dados do comprador (email, phone)

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([(responseData as IDataObject) || {}]),
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
