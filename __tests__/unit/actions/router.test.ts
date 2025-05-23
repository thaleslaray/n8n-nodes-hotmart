import { router } from '../../../nodes/Hotmart/v1/actions/router';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';
import { IExecuteFunctions } from 'n8n-workflow';

// Mock dos recursos - estrutura correta que espelha a exportação real
jest.mock('../../../nodes/Hotmart/v1/actions/subscription/Subscription.resource', () => ({
  operations: {
    getAll: {
      description: [],
      execute: jest.fn().mockResolvedValue([[{ json: { subscription: 'test' } }]])
    },
    getSummary: {
      description: [],
      execute: jest.fn()
    },
    getTransactions: {
      description: [],
      execute: jest.fn()
    },
    getPurchases: {
      description: [],
      execute: jest.fn()
    },
    cancel: {
      description: [],
      execute: jest.fn()
    },
    cancelList: {
      description: [],
      execute: jest.fn()
    },
    reactivate: {
      description: [],
      execute: jest.fn()
    },
    reactivateList: {
      description: [],
      execute: jest.fn()
    },
    changeBillingDate: {
      description: [],
      execute: jest.fn()
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/sales/Sales.resource', () => ({
  operations: {
    getHistoricoVendas: {
      description: [],
      execute: jest.fn().mockResolvedValue([[{ json: { sale: 'test' } }]])
    },
    getResumoVendas: {
      description: [],
      execute: jest.fn()
    },
    getComissoesVendas: {
      description: [],
      execute: jest.fn()
    },
    getParticipantesVendas: {
      description: [],
      execute: jest.fn()
    },
    getDetalhamentoPrecos: {
      description: [],
      execute: jest.fn()
    },
    solicitarReembolso: {
      description: [],
      execute: jest.fn()
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/product/Product.resource', () => ({
  operations: {
    getAll: {
      description: [],
      execute: jest.fn().mockResolvedValue([[{ json: { product: 'test' } }]])
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/coupon/Coupon.resource', () => ({
  operations: {
    get: {
      description: [],
      execute: jest.fn().mockResolvedValue([[{ json: { coupon: 'test' } }]])
    },
    create: {
      description: [],
      execute: jest.fn()
    },
    delete: {
      description: [],
      execute: jest.fn()
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/club/Club.resource', () => ({
  operations: {
    getAll: {
      description: [],
      execute: jest.fn()
    },
    getModules: {
      description: [],
      execute: jest.fn()
    },
    getPages: {
      description: [],
      execute: jest.fn()
    },
    getProgress: {
      description: [],
      execute: jest.fn()
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/tickets/Tickets.resource', () => ({
  operations: {
    getAll: {
      description: [],
      execute: jest.fn()
    },
    getInfo: {
      description: [],
      execute: jest.fn()
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/negotiate/Negotiate.resource', () => ({
  operations: {
    generateNegotiation: {
      description: [],
      execute: jest.fn()
    }
  }
}));

// Mock console.log
global.console.log = jest.fn();

describe('Router', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.getInputData = jest.fn().mockReturnValue([{ json: {} }]);
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);
  });

  describe('router', () => {
    it.skip('should route to subscription operations', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('getAll'); // operation

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it.skip('should route to sales operations', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('sales') // resource
        .mockReturnValueOnce('getHistoricoVendas'); // operation

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it.skip('should route to product operations', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('product') // resource
        .mockReturnValueOnce('getAll'); // operation

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });

    it('should route to coupon operations', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('coupon') // resource
        .mockReturnValueOnce('get'); // operation

      await router.call(mockThis);

      // Verificar se a operação correta foi chamada
      const couponResource = require('../../../nodes/Hotmart/v1/actions/coupon/Coupon.resource');
      expect(couponResource.operations.get.execute).toHaveBeenCalled();
    });

    it('should handle customApiCall resource by returning empty array', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('customApiCall'); // resource

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call detectada como recurso. Esta operação não é suportada.'
      );
    });

    it('should handle resource containing "custom api call" text', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('some Custom API Call text'); // resource

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
    });

    it('should handle __CUSTOM_API_CALL__ operation by returning empty array', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('__CUSTOM_API_CALL__'); // operation

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call detectada como operação. Esta operação não é suportada.'
      );
    });

    it('should handle operation containing "custom api call" text', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('some Custom API Call operation'); // operation

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call detectada na operação. Esta operação não é suportada.'
      );
    });

    it('should return error for unknown resource', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('unknownResource') // resource
        .mockReturnValueOnce('someOperation'); // operation

      const result = await router.call(mockThis);
      expect(result).toBeDefined();
      expect(result[0][0].json.error).toBeDefined();
      expect(result[0][0].json.error).toContain('O recurso "unknownResource" não é suportado!');
    });

    it('should return error for unknown operation', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('unknownOperation'); // operation

      const result = await router.call(mockThis);
      expect(result).toBeDefined();
      expect(result[0][0].json.error).toBeDefined();
      expect(result[0][0].json.error).toContain('A operação "unknownOperation" não é suportada para o recurso "subscription"!');
    });

    it('should return error for missing operation on resource', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('nonExistentOperation'); // operation

      const result = await router.call(mockThis);
      expect(result).toBeDefined();
      expect(result[0][0].json.error).toBeDefined();
      expect(result[0][0].json.error).toContain('A operação "nonExistentOperation" não é suportada para o recurso "subscription"!');
    });

    it('should handle getNodeParameter errors by returning empty array', async () => {
      mockThis.getNodeParameter = jest.fn().mockImplementation(() => {
        throw new Error('Parameter error');
      });

      const result = await router.call(mockThis);
      
      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Erro ao obter parâmetros no nó Hotmart:',
        expect.any(Error)
      );
    });
  });
});