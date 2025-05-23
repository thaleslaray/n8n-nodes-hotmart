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
    hint: 'Encontre o código no painel de assinaturas do Hotmart, na coluna "Código"',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['changeBillingDate'],
      },
    },
  },
  {
    displayName: 'Novo Dia de Cobrança',
    name: 'dueDay',
    type: 'number',
    required: true,
    default: 10,
    placeholder: '10',
    description: 'Dia do mês para realizar a cobrança recorrente (1 a 31)',
    hint: '⚠️ Para dias 29-31: Se o mês não tiver o dia escolhido, a cobrança ocorrerá no último dia do mês',
    typeOptions: {
      minValue: 1,
      maxValue: 31,
      numberStepSize: 1,
      numberPrecision: 0,
    },
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['changeBillingDate'],
      },
    },
  },
  {
    displayName: 'Informação',
    name: 'info',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['changeBillingDate'],
      },
    },
    typeOptions: {
      noticeType: 'info',
      noticeContent: 'A mudança do dia de cobrança entrará em vigor no próximo ciclo de faturamento. O cliente será notificado automaticamente sobre a alteração.',
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
      const dueDay = this.getNodeParameter('dueDay', i) as number;

      const body = {
        due_day: dueDay,
      };

      const responseData = await hotmartApiRequest.call(
        this,
        'PATCH',
        `/payments/api/v1/subscriptions/${subscriberCode}`,
        body
      );

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([(responseData as IDataObject) || {}]), // API retorna vazio em caso de sucesso
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
