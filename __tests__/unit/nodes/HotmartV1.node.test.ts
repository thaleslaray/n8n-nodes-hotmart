import { HotmartV1 } from '../../../nodes/Hotmart/v1/HotmartV1.node';
import { INodeTypeBaseDescription, IExecuteFunctions } from 'n8n-workflow';
import { router } from '../../../nodes/Hotmart/v1/actions/router';

// Mock do router
jest.mock('../../../nodes/Hotmart/v1/actions/router', () => ({
  router: jest.fn().mockResolvedValue([[{ json: { test: 'data' } }]])
}));

describe('HotmartV1 Node', () => {
  let hotmartV1: HotmartV1;
  const baseDescription: INodeTypeBaseDescription = {
    displayName: 'Hotmart',
    name: 'hotmart',
    icon: 'file:hotmart.svg',
    group: ['transform'],
    description: 'Interagir com a API Hotmart',
    defaultVersion: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    hotmartV1 = new HotmartV1(baseDescription);
  });

  describe('constructor', () => {
    it('should merge base description with version description', () => {
      expect(hotmartV1.description.displayName).toBe('Hotmart');
      expect(hotmartV1.description.name).toBe('hotmart');
      expect(hotmartV1.description.icon).toBe('file:hotmart.svg');
      expect(hotmartV1.description.group).toEqual(['transform']);
      expect(hotmartV1.description.version).toEqual([1, 2]);
      expect(hotmartV1.description.subtitle).toBeDefined();
      expect(hotmartV1.description.properties).toBeDefined();
    });
  });

  describe('methods', () => {
    it('should have loadOptions methods defined', () => {
      expect(hotmartV1.methods).toBeDefined();
      expect(hotmartV1.methods.loadOptions).toBeDefined();
      expect(hotmartV1.methods.loadOptions.getProducts).toBeDefined();
      expect(hotmartV1.methods.loadOptions.getEventProducts).toBeDefined();
      expect(hotmartV1.methods.loadOptions.getCouponsByProduct).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should call router and return result', async () => {
      const mockThis: IExecuteFunctions = {
        getInputData: jest.fn().mockReturnValue([{ json: {} }]),
        getNodeParameter: jest.fn(),
      } as any;

      const expectedResult = [[{ json: { test: 'data' } }]];
      (router as jest.Mock).mockResolvedValue(expectedResult);

      const result = await hotmartV1.execute.call(mockThis);

      expect(router).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should pass execution context to router', async () => {
      const mockThis: IExecuteFunctions = {
        getInputData: jest.fn().mockReturnValue([{ json: {} }]),
        getNodeParameter: jest.fn(),
        helpers: { request: jest.fn() }
      } as any;

      await hotmartV1.execute.call(mockThis);

      expect(router).toHaveBeenCalledWith();
      // Router should be called with the correct context
      const routerCall = (router as jest.Mock).mock.instances[0];
      expect(routerCall).toBe(mockThis);
    });
  });
});