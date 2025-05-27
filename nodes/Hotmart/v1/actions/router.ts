import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ERROR_MESSAGES } from '../constants/errors';

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

// Mapa centralizado de recursos e suas operações
const RESOURCE_HANDLERS = {
  subscription: subscriptionResource.operations,
  sales: salesResource.operations,
  product: productResource.operations,
  coupon: couponResource.operations,
  club: clubResource.operations,
  tickets: ticketsResource.operations,
  negotiate: negotiateResource.operations,
} as const;

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
    // Buscar handlers do recurso
    const resourceHandlers = RESOURCE_HANDLERS[resource as keyof typeof RESOURCE_HANDLERS];
    
    if (!resourceHandlers) {
      throw new NodeOperationError(
        this.getNode(),
        ERROR_MESSAGES.RESOURCE.NOT_SUPPORTED,
        {
          description: `Recurso "${resource}" não encontrado. Recursos disponíveis: subscription, sales, product, coupon, club, tickets, negotiate`,
        }
      );
    }

    // Buscar operação específica
    const operationHandler = resourceHandlers[operation as keyof typeof resourceHandlers] as IHotmartOperation;
    
    if (!operationHandler || typeof operationHandler.execute !== 'function') {
      throw new NodeOperationError(
        this.getNode(),
        ERROR_MESSAGES.RESOURCE.OPERATION_NOT_SUPPORTED,
        {
          description: `Operação "${operation}" não disponível para o recurso "${resource}". Verifique as operações disponíveis no menu dropdown.`,
        }
      );
    }

    // Executar operação
    executionResult = await operationHandler.execute.call(this, items);
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
