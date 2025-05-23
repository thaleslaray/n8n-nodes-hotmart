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
    description: 'Lista de códigos de assinantes para reativar, separados por vírgula. Formato: sub_[código]',
    hint: '✅ Máximo recomendado: 100 assinaturas por vez. Apenas assinaturas CANCELADAS ou ATRASADAS',
    typeOptions: {
      rows: 3,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['reactivateList'],
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
        operation: ['reactivateList'],
      },
    },
    options: [
      {
        displayName: 'Realizar Nova Cobrança',
        name: 'charge',
        type: 'boolean',
        default: true,
        description: 'Processar pagamento imediatamente ao reativar cada assinatura',
        hint: 'true: Cobra todas agora | false: Mantém datas originais de cobrança',
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
        operation: ['reactivateList'],
      },
    },
    typeOptions: {
      noticeType: 'warning',
      noticeContent: '🔄 REATIVAÇÃO EM MASSA: A resposta incluirá:\n• success_subscriptions: Lista de assinaturas reativadas com sucesso\n• fail_subscriptions: Lista de assinaturas que falharam (com motivo)\n\nVerifique ambas as listas no resultado!',
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

      const options = this.getNodeParameter('options', i, {}) as { charge?: boolean };
      const charge = options.charge !== undefined ? options.charge : true;

      const body = {
        subscriber_code: subscriberCodes,
        charge,
      };

      const responseData = await hotmartApiRequest.call(
        this,
        'POST',
        '/payments/api/v1/subscriptions/reactivate',
        body
      );

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
