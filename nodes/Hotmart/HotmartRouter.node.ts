import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class HotmartRouter implements INodeType {
  description: INodeTypeDescription;

  constructor() {
    this.description = {
      displayName: 'Hotmart Router',
      name: 'hotmartRouter',
      icon: 'file:hotmart.svg',
      group: ['transform'],
      version: 1,
      subtitle: 'Direciona eventos Hotmart por tipo',
      description: 'Encaminha eventos da Hotmart para saídas específicas baseado no tipo de evento',
      defaults: {
        name: 'Hotmart Router',
      },
      inputs: ['main'],
      outputs: ['main', 'main'],
      outputNames: ['Aprovada', 'Outros'],
      properties: [
        {
          displayName: 'Campo do Evento',
          name: 'eventField',
          type: 'string',
          default: 'event',
          description: 'Nome do campo contendo o tipo de evento Hotmart',
        },
        {
          displayName: 'Personalizar Nomes das Saídas',
          name: 'customizeOutputs',
          type: 'boolean',
          default: false,
          description: 'Opção apenas visual, não altera funcionalidade',
        },
      ],
    };
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Criar arrays vazios para cada saída
    const returnData: INodeExecutionData[][] = [[], []];

    const items = this.getInputData();
    const eventField = this.getNodeParameter('eventField', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let event: string | null = null;
        
        // Obter o valor do evento do campo apropriado
        if (items[i].json && items[i].json[eventField] !== undefined) {
          const eventValue = items[i].json[eventField];
          event = eventValue !== null && eventValue !== undefined ? String(eventValue) : null;
        }
        
        // Para simplificar, enviamos para a primeira saída apenas eventos de compra aprovada
        // e todos os outros para a segunda saída
        if (event === 'PURCHASE_APPROVED' || event === '1') {
          returnData[0].push(items[i]);
        } else {
          returnData[1].push(items[i]);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          console.error(`[HotmartRouter] Erro ao processar item ${i}: ${error.message}`);
          continue;
        }
        throw new NodeOperationError(this.getNode(), error, {
          itemIndex: i,
        });
      }
    }

    return returnData;
  }
}