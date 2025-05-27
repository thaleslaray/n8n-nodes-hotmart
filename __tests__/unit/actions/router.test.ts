import { router } from '../../../nodes/Hotmart/v1/actions/router';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';
import { IExecuteFunctions } from 'n8n-workflow';

// Mock dos recursos - estrutura correta que espelha a exportação real
jest.mock('../../../nodes/Hotmart/v1/actions/subscription/Subscription.resource', () => ({
  operations: {
    getAll: {
      description: [],
      execute: jest.fn()
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
      execute: jest.fn()
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
      execute: jest.fn()
    }
  }
}));

jest.mock('../../../nodes/Hotmart/v1/actions/coupon/Coupon.resource', () => ({
  operations: {
    get: {
      description: [],
      execute: jest.fn()
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
    mockThis.logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    } as any;
  });

  describe('router', () => {
    it('should route to subscription operations', async () => {
      // Setup mock
      const subscriptionResource = require('../../../nodes/Hotmart/v1/actions/subscription/Subscription.resource');
      subscriptionResource.operations.getAll.execute.mockResolvedValue([[{ json: { subscription: 'test' } }]]);

      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('getAll'); // operation

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toEqual([[{ json: { subscription: 'test' } }]]);
      expect(subscriptionResource.operations.getAll.execute).toHaveBeenCalledWith([{ json: {} }]);
    });

    it('should route to sales operations', async () => {
      // Setup mock
      const salesResource = require('../../../nodes/Hotmart/v1/actions/sales/Sales.resource');
      salesResource.operations.getHistoricoVendas.execute.mockResolvedValue([[{ json: { sale: 'test' } }]]);

      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('sales') // resource
        .mockReturnValueOnce('getHistoricoVendas'); // operation

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toEqual([[{ json: { sale: 'test' } }]]);
      expect(salesResource.operations.getHistoricoVendas.execute).toHaveBeenCalledWith([{ json: {} }]);
    });

    it('should route to product operations', async () => {
      // Setup mock
      const productResource = require('../../../nodes/Hotmart/v1/actions/product/Product.resource');
      productResource.operations.getAll.execute.mockResolvedValue([[{ json: { product: 'test' } }]]);

      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('product') // resource
        .mockReturnValueOnce('getAll'); // operation

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toEqual([[{ json: { product: 'test' } }]]);
      expect(productResource.operations.getAll.execute).toHaveBeenCalledWith([{ json: {} }]);
    });

    it('should route to coupon operations', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('coupon') // resource
        .mockReturnValueOnce('get'); // operation

      // Add mock return value for coupon get operation
      const couponResource = require('../../../nodes/Hotmart/v1/actions/coupon/Coupon.resource');
      couponResource.operations.get.execute.mockResolvedValue([[{ json: { coupon: 'test' } }]]);

      const result = await router.call(mockThis);

      expect(result).toBeDefined();
      expect(result).toEqual([[{ json: { coupon: 'test' } }]]);
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

    it('should handle custom api call in resource name', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('Custom API Call'); // resource with different case

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call detectada no recurso. Esta operação não é suportada.'
      );
    });

    it('should handle __CUSTOM_API_CALL__ as operation', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('__CUSTOM_API_CALL__'); // operation

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call detectada como operação. Esta operação não é suportada.'
      );
    });

    it('should handle custom api call in operation name', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // resource
        .mockReturnValueOnce('Custom API Call'); // operation with different case

      const result = await router.call(mockThis);

      expect(result).toEqual([[]]);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call detectada na operação. Esta operação não é suportada.'
      );
    });

    it('should throw error for unsupported resource', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('unsupported') // resource
        .mockReturnValueOnce('someOperation'); // operation

      await expect(router.call(mockThis)).rejects.toThrow('Recurso não suportado');
    });

    it('should throw error for unsupported operation', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('subscription') // valid resource
        .mockReturnValueOnce('unsupportedOperation'); // invalid operation

      await expect(router.call(mockThis)).rejects.toThrow(
        'Operação não suportada para este recurso'
      );
    });

    it('should handle errors when continueOnFail is true', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);
      mockThis.helpers.constructExecutionMetaData = jest.fn().mockReturnValue([{ error: 'test error' }]);
      mockThis.helpers.returnJsonArray = jest.fn((data) => [{ json: data }]) as any;
      
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('unsupported') // resource
        .mockReturnValueOnce('someOperation'); // operation

      const result = await router.call(mockThis);

      expect(result).toEqual([[{ error: 'test error' }]]);
      expect(mockThis.helpers.constructExecutionMetaData).toHaveBeenCalled();
    });

    it('should handle error when getting parameters fails', async () => {
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