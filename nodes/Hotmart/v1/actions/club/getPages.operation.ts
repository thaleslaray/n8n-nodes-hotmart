import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description: 'Esta operação lista todas as páginas (aulas/conteúdos) dentro de um módulo específico. Páginas são os conteúdos individuais dentro de cada módulo.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getPages'],
      },
    },
  },
  {
    displayName: 'ID do Produto',
    name: 'product_id',
    type: 'options',
    required: true,
    default: '',
    hint: 'Selecione o produto que contém o módulo desejado',
    description: 'Produto da Área de Membros que contém o módulo a ser consultado',
    typeOptions: {
      loadOptionsMethod: 'getProducts',
    },
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getPages'],
      },
    },
  },
  {
    displayName: 'ID do Módulo',
    name: 'module_id',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'mod_xxxxxxxxxxxxx',
    hint: 'Use a operação "Obter Módulos" para listar os IDs disponíveis. O ID geralmente começa com "mod_"',
    description: 'ID único do módulo de onde listar as páginas',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getPages'],
      },
    },
  },
  {
    displayName: 'Info',
    name: 'info',
    type: 'notice',
    default: '',
    description: 'Retorna informações das páginas incluindo: ID da página, título, tipo de conteúdo (vídeo, texto, quiz, etc), duração (para vídeos), ordem de exibição e configurações de acesso.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getPages'],
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
      const productId = this.getNodeParameter('product_id', i) as string;
      const moduleId = this.getNodeParameter('module_id', i) as string;

      const qs: { product_id: string } = {
        product_id: productId,
      };

      // Usando a API v2 conforme solicitado
      const response = await hotmartApiRequest.call(
        this,
        'GET',
        `/club/api/v2/modules/${moduleId}/pages`,
        {},
        qs
      );

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray((response as IDataObject[]) || []),
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
