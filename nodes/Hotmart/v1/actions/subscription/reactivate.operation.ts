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
    description: 'Código único do assinante para reativar. Formato: sub_[código alfanumérico]',
    hint: '✅ Apenas assinaturas CANCELADAS ou ATRASADAS podem ser reativadas',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['reactivate'],
      },
    },
  },
  {
    displayName: 'Opções de Reativação',
    name: 'options',
    type: 'collection',
    placeholder: 'Adicionar Opção',
    default: {},
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['reactivate'],
      },
    },
    options: [
      {
        displayName: 'Realizar Nova Cobrança',
        name: 'charge',
        type: 'boolean',
        default: true,
        description: 'Processar pagamento imediatamente ao reativar',
        hint: 'true: Cobra agora e reinicia ciclo | false: Mantém data original de cobrança',
      },
    ],
  },
  {
    displayName: 'Resultado da Operação',
    name: 'successInfo',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['reactivate'],
      },
    },
    typeOptions: {
      noticeType: 'success',
      noticeContent: 'Ao reativar com sucesso:\n• Status muda para ACTIVE\n• Cliente recupera acesso imediato\n• Novo ciclo de cobrança é estabelecido\n• Email de confirmação é enviado automaticamente',
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
      const options = this.getNodeParameter('options', i, {}) as { charge?: boolean };
      const charge = options.charge !== undefined ? options.charge : true;

      const body = {
        charge,
      };

      const responseData = await hotmartApiRequest.call(
        this,
        'POST',
        `/payments/api/v1/subscriptions/${subscriberCode}/reactivate`,
        body
      );

      // O retorno da API inclui:
      // - status: Status atual da assinatura
      // - subscriber_code: Código do assinante
      // - creation_date: Data de criação
      // - interval_between_charges: Ciclo da assinatura
      // - shopper: Dados do pagador (email, phone)

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
