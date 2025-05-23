import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { hotmartApiRequestTyped } from '../../transport/requestTyped';
import { returnAllOption, limitOption, maxResultsOption } from '../common.descriptions';
import type { ClubQueryParams, ClubStudent } from '../../types';

type ClubListResponse = { items: ClubStudent[]; page_info?: { next_page_token?: string } };

export const description: INodeProperties[] = [
  {
    displayName: 'Notice',
    name: 'notice',
    type: 'notice',
    default: '',
    description: 'Esta operação lista todos os alunos cadastrados em sua Área de Membros. Você pode filtrar por e-mail ou obter todos os alunos de uma vez.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...returnAllOption,
    description: 'Se deseja buscar todos os alunos ou limitar os resultados. A API retorna até 500 alunos por página.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
      },
    },
  },
  {
    ...limitOption,
    description: 'Quantos alunos retornar por execução. Máximo: 500 por página.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
  },
  {
    ...maxResultsOption,
    description: 'Limite total de alunos a retornar. Use para evitar requisições excessivas em áreas com muitos membros.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
        returnAll: [false],
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
    description: 'Subdomínio da Área de Membros onde os alunos estão cadastrados',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
      },
    },
  },
  {
    displayName: 'Filtros',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar Filtro',
    default: {},
    description: 'Filtros opcionais para refinar a busca de alunos',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'E-mail do Aluno',
        name: 'email',
        type: 'string',
        default: '',
        placeholder: 'aluno@email.com',
        hint: 'Busca exata por e-mail. Use para encontrar um aluno específico',
        description: 'E-mail completo do aluno para busca específica',
      },
    ],
  },
  {
    displayName: 'Info',
    name: 'info',
    type: 'notice',
    default: '',
    description: 'Retorna informações dos alunos incluindo: ID, nome, email, status de acesso, data de inscrição e progresso geral no curso.',
    displayOptions: {
      show: {
        resource: ['club'],
        operation: ['getAll'],
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
      const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
      const subdomain = this.getNodeParameter('subdomain', i) as string;
      const filters = this.getNodeParameter('filters', i, {}) as {
        email?: string;
      };

      const qs: ClubQueryParams = { subdomain };
      if (filters.email) qs.email = filters.email;

      // SOLUÇÃO DIRETA: Implementação manual de paginação
      if (returnAll) {
        // Inicializar com valor máximo permitido pela API (500)
        qs.max_results = 500;

        // Resultados acumulados
        const allItems: ClubStudent[] = [];
        let hasMorePages = true;

        // Loop manual de paginação
        while (hasMorePages) {
          // Log para depuração
          this.logger.debug(
            '\n[Paginação manual] Requisição com parâmetros:',
            qs
          );

          // Fazer requisição
          const response = await hotmartApiRequestTyped<ClubListResponse>(this, 'GET', '/club/api/v1/users', {}, qs);

          // Adicionar itens da página atual
          if (response && response.items && Array.isArray(response.items)) {
            this.logger.debug(`\n[Paginação manual] Recebidos ${response.items.length} itens`);
            allItems.push(...response.items);
          }

          // Verificar se há mais páginas
          if (response && response.page_info && response.page_info.next_page_token) {
            // Tem próxima página, atualizar token
            qs.page_token = response.page_info.next_page_token;
            this.logger.debug(`\n[Paginação manual] Próxima página disponível: ${qs.page_token}`);

            // Pequeno delay para evitar problemas de rate limit
            await new Promise((resolve) => setTimeout(resolve, 100));
          } else {
            // Não tem mais páginas
            hasMorePages = false;
            this.logger.debug('\n[Paginação manual] Fim da paginação');
          }
        }

        this.logger.debug(`\n[Paginação manual] Total de itens: ${allItems.length}`);
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(allItems),
          { itemData: { item: i } }
        );

        returnData.push(...executionData);
      } else {
        // Caso não queira retornar todos, usa o limit normal
        const limit = this.getNodeParameter('limit', i, 50) as number;
        qs.max_results = limit;

        // Fazer requisição única
        const response = await hotmartApiRequestTyped<ClubListResponse>(this, 'GET', '/club/api/v1/users', {}, qs);

        // Processar resultados
        const items = response.items || [];
        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(items),
          { itemData: { item: i } }
        );

        returnData.push(...executionData);
      }
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
