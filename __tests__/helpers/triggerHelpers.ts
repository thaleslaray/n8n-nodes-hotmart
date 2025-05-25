import type { ITriggerFunctions, IWebhookFunctions } from 'n8n-workflow';

export function createMockTriggerFunctions(overrides?: Partial<ITriggerFunctions>): ITriggerFunctions {
  return {
    emit: jest.fn(),
    getNodeParameter: jest.fn(),
    getMode: jest.fn().mockReturnValue('trigger'),
    getWorkflow: jest.fn().mockReturnValue({
      id: 'test-workflow-id',
      name: 'Test Workflow'
    }),
    getNode: jest.fn().mockReturnValue({
      name: 'HotmartTrigger',
      type: 'n8n-nodes-hotmart.hotmartTrigger',
      typeVersion: 1
    }),
    helpers: {
      returnJsonArray: jest.fn().mockImplementation((items: any[]) => items),
      constructExecutionMetaData: jest.fn().mockImplementation((items: any[], metaData: any) => {
        return items.map((item, index) => ({
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
    ...overrides,
  } as unknown as ITriggerFunctions;
}

export function createMockWebhookFunctions(overrides?: Partial<IWebhookFunctions>): IWebhookFunctions {
  return {
    getBodyData: jest.fn(),
    getHeaderData: jest.fn(),
    getNodeParameter: jest.fn(),
    getNodeWebhookUrl: jest.fn().mockReturnValue('http://test.com/webhook'),
    getMode: jest.fn().mockReturnValue('webhook'),
    getWorkflow: jest.fn().mockReturnValue({
      id: 'test-workflow-id',
      name: 'Test Workflow'
    }),
    getNode: jest.fn().mockReturnValue({
      name: 'HotmartTrigger',
      type: 'n8n-nodes-hotmart.hotmartTrigger',
      typeVersion: 1
    }),
    helpers: {
      returnJsonArray: jest.fn().mockImplementation((items: any[]) => items),
      constructExecutionMetaData: jest.fn().mockImplementation((items: any[], metaData: any) => {
        return items.map((item, index) => ({
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
    getResponseObject: jest.fn().mockReturnValue({
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
      end: jest.fn(),
    }),
    getRequestObject: jest.fn().mockReturnValue({
      body: {},
      headers: {},
      query: {},
      params: {},
    }),
    ...overrides,
  } as unknown as IWebhookFunctions;
}

export function createMockWebhookContext(overrides: any = {}) {
  return {
    request: {
      body: overrides.body || {},
      headers: overrides.headers || {},
      ...overrides.request,
    },
    parameters: overrides.parameters || {},
    cache: {
      get: jest.fn(),
      set: jest.fn(),
      has: jest.fn(),
      ...overrides.cache,
    },
    helpers: {
      returnJsonArray: jest.fn().mockImplementation((items: any[]) => items),
      constructExecutionMetaData: jest.fn().mockImplementation((items: any[], metaData: any) => {
        return items.map((item, index) => ({
          json: item,
          pairedItem: metaData?.itemData || { item: index }
        }));
      }),
      ...overrides.helpers,
    },
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      ...overrides.logger,
    },
    ...overrides,
  };
}