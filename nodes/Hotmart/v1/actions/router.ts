import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as subscriptionResource from './subscription/Subscription.resource';
import * as salesResource from './sales/Sales.resource';
import * as productResource from './product/Product.resource';
import * as couponResource from './coupon/Coupon.resource';
import * as clubResource from './club/Club.resource';
import * as ticketsResource from './tickets/Tickets.resource';
import * as negotiateResource from './negotiate/Negotiate.resource';

interface IHotmartOperation {
  description: INodeProperties[];
  execute: (
    this: IExecuteFunctions,
    items: INodeExecutionData[]
  ) => Promise<INodeExecutionData[][]>;
}

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  let resource: string;
  let operation: string;

  try {
    /**
     * NOTA SOBRE PREVENÇÃO DE CUSTOM API CALL:
     *
     * Nossa estratégia principal é impedir a injeção de "Custom API Call" através da
     * discrepância entre version: [1, 2] e defaultVersion: 1 no versionDescription.ts.
     *
     * As verificações abaixo servem como camada adicional de proteção, caso algum
     * usuário tente usar a opção via manipulação direta ou em caso de mudanças
     * na implementação interna do n8n em versões futuras.
     */

    // Obtém o recurso selecionado
    resource = this.getNodeParameter('resource', 0) as string;

    // Proteção de backup: Trata o caso em que "Custom API Call" é selecionado como recurso
    if (resource === 'customApiCall') {
      this.logger.debug(
        'Tentativa de usar Custom API Call detectada como recurso. Esta operação não é suportada.'
      );
      return [[]];
    }

    // Proteção de backup: Trata o caso em que o valor do recurso contém "Custom API Call" (independente do case)
    if (resource.toLowerCase().includes('custom api call')) {
      this.logger.debug(
        'Tentativa de usar Custom API Call detectada no recurso. Esta operação não é suportada.'
      );
      return [[]];
    }

    // Obtém a operação selecionada
    operation = this.getNodeParameter('operation', 0) as string;

    // Proteção de backup: Tratamento especial para Custom API Call como operação
    if (operation === '__CUSTOM_API_CALL__') {
      this.logger.debug(
        'Tentativa de usar Custom API Call detectada como operação. Esta operação não é suportada.'
      );
      return [[]];
    }

    // Proteção de backup: Trata o caso em que o valor da operação contém "Custom API Call" (independente do case)
    if (operation.toLowerCase().includes('custom api call')) {
      this.logger.debug(
        'Tentativa de usar Custom API Call detectada na operação. Esta operação não é suportada.'
      );
      return [[]];
    }
  } catch (error) {
    // Se não conseguir obter os parâmetros, retorna um array vazio
    this.logger.debug('Erro ao obter parâmetros no nó Hotmart:', error);
    return [[]];
  }

  let executionResult: INodeExecutionData[][] = [];

  try {
    switch (resource) {
      case 'subscription': {
        const subscriptionOperation = subscriptionResource.operations[
          operation as keyof typeof subscriptionResource.operations
        ] as IHotmartOperation;

        if (typeof subscriptionOperation?.execute === 'function') {
          executionResult = await subscriptionOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      case 'sales': {
        const salesOperation = salesResource.operations[
          operation as keyof typeof salesResource.operations
        ] as IHotmartOperation;

        if (typeof salesOperation?.execute === 'function') {
          executionResult = await salesOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      case 'product': {
        const productOperation = productResource.operations[
          operation as keyof typeof productResource.operations
        ] as IHotmartOperation;

        if (typeof productOperation?.execute === 'function') {
          executionResult = await productOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      case 'coupon': {
        const couponOperation = couponResource.operations[
          operation as keyof typeof couponResource.operations
        ] as IHotmartOperation;

        if (typeof couponOperation?.execute === 'function') {
          executionResult = await couponOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      case 'club': {
        const clubOperation = clubResource.operations[
          operation as keyof typeof clubResource.operations
        ] as IHotmartOperation;

        if (typeof clubOperation?.execute === 'function') {
          executionResult = await clubOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      case 'tickets': {
        const ticketsOperation = ticketsResource.operations[
          operation as keyof typeof ticketsResource.operations
        ] as IHotmartOperation;

        if (typeof ticketsOperation?.execute === 'function') {
          executionResult = await ticketsOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      case 'negotiate': {
        const negotiateOperation = negotiateResource.operations[
          operation as keyof typeof negotiateResource.operations
        ] as IHotmartOperation;

        if (typeof negotiateOperation?.execute === 'function') {
          executionResult = await negotiateOperation.execute.call(this, items);
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `A operação "${operation}" não é suportada para o recurso "${resource}"!`
          );
        }
        break;
      }
      default:
        throw new NodeOperationError(this.getNode(), `O recurso "${resource}" não é suportado!`);
    }
  } catch (error) {
    if (this.continueOnFail()) {
      const errorData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([{ error: (error as Error).message }]),
        { itemData: { item: 0 } }
      );
      return [errorData];
    }
    throw error;
  }

  return executionResult;
}

// [INÍCIO DA IMPLEMENTAÇÃO DOS NOVOS NÓS HOTMART]
// Este bloco é apenas um marcador para facilitar a navegação e controle das próximas etapas.
// Próximos arquivos a criar:
// - nodes/Hotmart/v1/actions/product/getAll.operation.ts
// - nodes/Hotmart/v1/actions/coupon/getAll.operation.ts
// - nodes/Hotmart/v1/actions/club/getAll.operation.ts
// - nodes/Hotmart/v1/actions/tickets/getAll.operation.ts
