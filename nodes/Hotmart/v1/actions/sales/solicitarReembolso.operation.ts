import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description: '⚠️ **ATENÇÃO**: Esta operação é irreversível e processará o reembolso imediatamente. Certifique-se de que realmente deseja reembolsar esta transação antes de continuar.',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['solicitarReembolso'],
      },
    },
  },
  {
    displayName: 'Código da Transação',
    name: 'transaction',
    type: 'string',
    required: true,
    default: '',
    description: 'Código único da transação a ser reembolsada. Exemplo: HP12345678901234',
    hint: '⚠️ Verifique o código antes de executar - reembolsos são irreversíveis',
    placeholder: 'HP12345678901234',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['solicitarReembolso'],
      },
    },
    typeOptions: {
      minLength: 10,
      maxLength: 50,
    },
  },
  {
    displayName: 'Confirmação',
    name: 'confirmRefund',
    type: 'boolean',
    default: false,
    description: 'Marque para confirmar que deseja processar o reembolso',
    hint: 'Esta ação é permanente e não pode ser desfeita',
    displayOptions: {
      show: {
        resource: ['sales'],
        operation: ['solicitarReembolso'],
      },
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
      const transaction = this.getNodeParameter('transaction', i) as string;
      const confirmRefund = this.getNodeParameter('confirmRefund', i) as boolean;

      // Verificar confirmação antes de processar o reembolso
      if (!confirmRefund) {
        throw new Error('Por segurança, você deve marcar a confirmação antes de processar o reembolso. Esta operação é irreversível.');
      }

      const responseData = await hotmartApiRequest.call(
        this,
        'PUT',
        `/payments/api/v1/sales/${transaction}/refund`
      );

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
