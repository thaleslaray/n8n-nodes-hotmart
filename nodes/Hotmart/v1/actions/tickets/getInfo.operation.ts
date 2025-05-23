import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description:
      'Esta operação retorna informações detalhadas sobre um evento específico, incluindo dados de organização, localização, datas, lotes de ingressos disponíveis, preços e capacidade. Ideal para exibir detalhes do evento antes da compra ou para integrações com sistemas de gestão de eventos.',
    displayOptions: {
      show: {
        resource: ['tickets'],
        operation: ['getInfo'],
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
    hint: 'Escolha o evento para obter informações detalhadas como local, data, lotes de ingressos, preços e capacidade total',
    typeOptions: {
      loadOptionsMethod: 'getEventProducts',
    },
    displayOptions: {
      show: {
        resource: ['tickets'],
        operation: ['getInfo'],
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
      const eventId = this.getNodeParameter('event_id', i) as string;

      const response = await hotmartApiRequest.call(this, 'GET', `/events/api/v1/${eventId}/info`);

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
