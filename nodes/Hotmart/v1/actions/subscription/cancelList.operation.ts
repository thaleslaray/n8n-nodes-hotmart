import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Códigos dos Assinantes',
    name: 'subscriberCodes',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sub_123abc, sub_456def, sub_789ghi',
    description: 'Lista de códigos de assinantes para cancelar, separados por vírgula. Formato: sub_[código]',
    hint: '⚠️ Máximo recomendado: 100 assinaturas por vez. Use vírgulas para separar os códigos',
    typeOptions: {
      rows: 3,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancelList'],
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
        operation: ['cancelList'],
      },
    },
    options: [
      {
        displayName: 'Enviar Email de Notificação',
        name: 'sendMail',
        type: 'boolean',
        default: true,
        description: 'Enviar email automático informando cada assinante sobre o cancelamento',
        hint: 'Recomendado manter ativo para manter os clientes informados',
      },
    ],
  },
  {
    displayName: 'Aviso Importante',
    name: 'notice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['cancelList'],
      },
    },
    typeOptions: {
      noticeType: 'danger',
      noticeContent: '🚨 OPERAÇÃO EM MASSA: Esta ação cancelará MÚLTIPLAS assinaturas de forma IRREVERSÍVEL. Os clientes perderão acesso ao conteúdo ao final do período pago. A resposta incluirá listas de sucesso e falha.',
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
      const subscriberCodes = (this.getNodeParameter('subscriberCodes', i) as string)
        .split(',')
        .map((code) => code.trim());

      const options = this.getNodeParameter('options', i, {}) as { sendMail?: boolean };
      const sendMail = options.sendMail !== undefined ? options.sendMail : true;

      const body = {
        subscriber_code: subscriberCodes,
        send_mail: sendMail,
      };

      const responseData = await hotmartApiRequest.call(
        this,
        'POST',
        '/payments/api/v1/subscriptions/cancel',
        body
      );

      // O retorno da API inclui:
      // - success_subscriptions: array com assinaturas canceladas com sucesso
      // - fail_subscriptions: array com assinaturas que não puderam ser canceladas

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject),
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
