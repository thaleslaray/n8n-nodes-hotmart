import { execute, description } from '../../../nodes/Hotmart/v1/actions/customApiCall.operation';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

describe('CustomApiCall Operation', () => {
  let mockThis: IExecuteFunctions;

  describe('description', () => {
    it('should be an empty array', () => {
      expect(description).toEqual([]);
      expect(Array.isArray(description)).toBe(true);
      expect(description.length).toBe(0);
    });
  });

  describe('execute', () => {
    const testItems: INodeExecutionData[] = [{ json: { test: 'data' } }];
    
    beforeEach(() => {
      jest.clearAllMocks();
      mockThis = createMockExecuteFunctions();
    });

    it('should return empty array', async () => {
      const result = await execute.call(mockThis, testItems);
      
      expect(result).toEqual([[]]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual([]);
    });

    it('should log warning message', async () => {
      await execute.call(mockThis, testItems);
      
      // Verificar que foi chamado pelo menos uma vez com a mensagem correta
      expect(mockThis.logger.warn).toHaveBeenCalledWith(
        'Tentativa de usar Custom API Call no nó Hotmart. Esta funcionalidade está desativada.'
      );
    });

    it('should ignore input items', async () => {
      const multipleItems: INodeExecutionData[] = [
        { json: { id: 1 } },
        { json: { id: 2 } },
        { json: { id: 3 } }
      ];
      
      const result = await execute.call(mockThis, multipleItems);
      
      expect(result).toEqual([[]]);
    });

    it('should handle empty input', async () => {
      const result = await execute.call(mockThis, []);
      
      expect(result).toEqual([[]]);
    });

    it('should not call any external APIs', async () => {
      await execute.call(mockThis, testItems);
      
      // Verify no external calls were made
      expect(mockThis.helpers.request).not.toHaveBeenCalled();
      expect(mockThis.helpers.requestOAuth2).not.toHaveBeenCalled();
    });
  });
});