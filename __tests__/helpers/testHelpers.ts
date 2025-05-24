import type { IExecuteFunctions, INode } from 'n8n-workflow';

export function createMockExecuteFunctions(overrides?: Partial<IExecuteFunctions>): IExecuteFunctions {
  return {
    getNodeParameter: jest.fn(),
    getCredentials: jest.fn(),
    helpers: {
      request: jest.fn(),
      requestOAuth2: jest.fn(),
      returnJsonArray: jest.fn().mockImplementation((items: any[]) => items),
      constructExecutionMetaData: jest.fn().mockImplementation((items: any[], metaData: any) => {
        // Garantir que items seja um array
        const itemsArray = Array.isArray(items) ? items : [items];
        return itemsArray.map((item, index) => ({
          json: item,
          pairedItem: metaData?.itemData || { item: index }
        }));
      }),
    },
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
    continueOnFail: jest.fn().mockReturnValue(false),
    ...overrides,
  } as unknown as IExecuteFunctions;
}

export function createMockNode(): INode {
  return {
    id: 'test-node-id',
    name: 'Hotmart Test',
    type: 'n8n-nodes-hotmart.hotmart',
    typeVersion: 1,
    position: [0, 0],
    parameters: {},
  };
}

export function createMockTriggerFunctions(overrides?: any): any {
  return {
    getNodeParameter: jest.fn(),
    getCredentials: jest.fn(),
    getNode: jest.fn().mockReturnValue({ name: 'HotmartTrigger' }),
    helpers: {
      returnJsonArray: jest.fn().mockImplementation((items) => items),
      httpRequest: jest.fn(),
      httpRequestWithAuthentication: jest.fn(),
    },
    getNodeWebhookUrl: jest.fn().mockReturnValue('http://localhost:5678/webhook/test'),
    getTimezone: jest.fn().mockReturnValue('America/Sao_Paulo'),
    ...overrides,
  };
}