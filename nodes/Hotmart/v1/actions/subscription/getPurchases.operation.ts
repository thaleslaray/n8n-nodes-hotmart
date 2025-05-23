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
    description: 'Código único do assinante para buscar histórico de compras. Formato: sub_[código]',
    hint: 'Retorna todas as transações de pagamento realizadas por este assinante, incluindo pagamentos recorrentes e upgrades',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getPurchases'],
      },
    },
  },
  {
    displayName: 'Informação sobre os Dados',
    name: 'dataInfo',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['subscription'],
        operation: ['getPurchases'],
      },
    },
    typeOptions: {
      noticeType: 'info',
      noticeContent: 'Esta operação retorna:\n• Código da transação (transaction)\n• Data de aprovação\n• Status do pagamento\n• Valor e moeda\n• Método de pagamento\n• Número da recorrência\n• Status de garantia',
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

      const responseData = await hotmartApiRequest.call(
        this,
        'GET',
        `/payments/api/v1/subscriptions/${subscriberCode}/purchases`
      );

      // A API retorna um array de compras com:
      // - transaction: código de referência
      // - approved_date: data de aprovação
      // - payment_engine: plataforma de pagamento
      // - status: status da compra
      // - price: valor e moeda
      // - payment_type: tipo de pagamento
      // - payment_method: método de pagamento
      // - recurrency_number: número da recorrência
      // - under_warranty: se está em garantia
      // - purchase_subscription: se é compra de assinatura

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray(responseData as IDataObject[]),
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
