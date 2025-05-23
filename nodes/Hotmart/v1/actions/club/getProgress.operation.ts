import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description: 'Esta operação retorna o progresso detalhado de um aluno específico em todos os conteúdos da Área de Membros. Ideal para acompanhar o avanço individual dos alunos.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getProgress'],
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
    description: 'Subdomínio da Área de Membros onde o aluno está inscrito',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getProgress'],
      },
    },
  },
  {
    displayName: 'ID do Aluno',
    name: 'user_id',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'usr_xxxxxxxxxxxxx',
    hint: 'Use a operação "Obter Alunos" para listar os IDs dos alunos. O ID geralmente começa com "usr_"',
    description: 'ID único do aluno para consultar o progresso detalhado',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getProgress'],
      },
    },
  },
  {
    displayName: 'Info',
    name: 'info',
    type: 'notice',
    default: '',
    description: 'Retorna o progresso do aluno incluindo: ID da lição, status de conclusão (completo/incompleto), porcentagem assistida (para vídeos), data de início, data de conclusão e tempo total assistido.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getProgress'],
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
      const userId = this.getNodeParameter('user_id', i) as string;

      const qs: { subdomain: string } = { subdomain };

      const response = await hotmartApiRequest.call(
        this,
        'GET',
        `/club/api/v1/users/${userId}/lessons`,
        {},
        qs
      ) as IDataObject;

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray((response.lessons as IDataObject[]) || []),
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
