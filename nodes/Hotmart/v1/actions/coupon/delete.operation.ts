import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description: '⚠️ **Atenção**: Esta ação é irreversível! O cupom será permanentemente excluído e não poderá mais ser usado por seus clientes. Cupons já aplicados em vendas anteriores não serão afetados.',
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['delete'],
      },
    },
  },
  {
    displayName: 'ID do Produto',
    name: 'product_id',
    type: 'options',
    required: true,
    default: '',
    description: 'Selecione o produto ao qual o cupom está vinculado. Necessário para localizar o cupom',
    hint: 'Primeiro selecione o produto para depois escolher o cupom a ser excluído',
    typeOptions: {
      loadOptionsMethod: 'getProducts',
    },
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['delete'],
      },
    },
  },
  {
    displayName: 'Cupom',
    name: 'coupon_id',
    type: 'options',
    required: true,
    default: '',
    description: 'Escolha o cupom que deseja excluir permanentemente. Esta lista mostra todos os cupons ativos do produto selecionado',
    hint: 'Verifique o código do cupom antes de excluir. Esta ação não pode ser desfeita!',
    typeOptions: {
      loadOptionsMethod: 'getCouponsByProduct',
      loadOptionsDependsOn: ['product_id'],
    },
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['delete'],
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
      const couponId = this.getNodeParameter('coupon_id', i) as string;

      const response = await hotmartApiRequest.call(
        this,
        'DELETE',
        `/products/api/v1/coupon/${couponId}`
      );

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([(response as IDataObject) || {}]),
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
