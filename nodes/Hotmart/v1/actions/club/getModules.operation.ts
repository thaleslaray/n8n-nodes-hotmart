import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description: 'Esta operação lista todos os módulos disponíveis em sua Área de Membros. Módulos são as seções principais que organizam o conteúdo do seu curso.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getModules'],
      },
    },
  },
  {
    displayName: 'Subdomínio',
    name: 'subdomain',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'minha-area-de-membros',
    hint: 'Nome do subdomínio da sua Área de Membros na Hotmart. Ex: Se sua área é "minha-area.club.hotmart.com", use "minha-area"',
    description: 'Subdomínio da Área de Membros de onde listar os módulos',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getModules'],
      },
    },
  },
  {
    displayName: 'Módulos Extras',
    name: 'is_extra',
    type: 'boolean',
    default: false,
    hint: 'Módulos extras são conteúdos adicionais, bônus ou materiais complementares separados do curso principal',
    description: 'Ative para retornar apenas módulos extras/bônus. Desative para retornar todos os módulos do curso principal',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getModules'],
      },
    },
  },
  {
    displayName: 'Info',
    name: 'info',
    type: 'notice',
    default: '',
    description: 'Retorna informações dos módulos incluindo: ID do módulo, nome, descrição, ordem de exibição, quantidade de páginas e se é um módulo extra.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getModules'],
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
      const subdomain = this.getNodeParameter('subdomain', i) as string;
      const isExtra = this.getNodeParameter('is_extra', i, false) as boolean;

      const qs: { subdomain: string; is_extra?: boolean } = { subdomain };
      if (isExtra) qs.is_extra = true;

      const response = await hotmartApiRequest.call(this, 'GET', '/club/api/v1/modules', {}, qs);

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
