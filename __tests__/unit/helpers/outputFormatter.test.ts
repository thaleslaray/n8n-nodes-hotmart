import { formatOutput } from '../../../nodes/Hotmart/v1/helpers/outputFormatter';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';
import { IExecuteFunctions } from 'n8n-workflow';

describe('OutputFormatter', () => {
  let mockThis: IExecuteFunctions;
  let mockReturnJsonArray: jest.Mock;
  let mockConstructExecutionMetaData: jest.Mock;

  beforeEach(() => {
    mockThis = createMockExecuteFunctions();
    
    // Mock helpers methods
    mockReturnJsonArray = jest.fn();
    mockConstructExecutionMetaData = jest.fn();
    
    mockThis.helpers = {
      ...mockThis.helpers,
      returnJsonArray: mockReturnJsonArray,
      constructExecutionMetaData: mockConstructExecutionMetaData
    } as any;
  });

  describe('formatOutput', () => {
    it('should format array of items correctly', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      const itemIndex = 0;
      
      const mockJsonArray = items.map(item => ({ json: item }));
      const mockResult = [
        { json: items[0], pairedItem: { item: itemIndex } },
        { json: items[1], pairedItem: { item: itemIndex } }
      ];
      
      mockReturnJsonArray.mockReturnValue(mockJsonArray);
      mockConstructExecutionMetaData.mockReturnValue(mockResult);
      
      const result = formatOutput.call(mockThis, items, itemIndex);
      
      expect(mockReturnJsonArray).toHaveBeenCalledWith(items);
      expect(mockConstructExecutionMetaData).toHaveBeenCalledWith(
        mockJsonArray,
        { itemData: { item: itemIndex } }
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle empty array', () => {
      const items: any[] = [];
      const itemIndex = 0;
      
      mockReturnJsonArray.mockReturnValue([]);
      mockConstructExecutionMetaData.mockReturnValue([]);
      
      const result = formatOutput.call(mockThis, items, itemIndex);
      
      expect(mockReturnJsonArray).toHaveBeenCalledWith([]);
      expect(mockConstructExecutionMetaData).toHaveBeenCalledWith(
        [],
        { itemData: { item: itemIndex } }
      );
      expect(result).toEqual([]);
    });

    it('should handle non-array input', () => {
      const items = null;
      const itemIndex = 0;
      
      mockReturnJsonArray.mockReturnValue([]);
      mockConstructExecutionMetaData.mockReturnValue([]);
      
      const result = formatOutput.call(mockThis, items as any, itemIndex);
      
      expect(mockReturnJsonArray).toHaveBeenCalledWith([]);
      expect(mockConstructExecutionMetaData).toHaveBeenCalledWith(
        [],
        { itemData: { item: itemIndex } }
      );
      expect(result).toEqual([]);
    });

    it('should handle undefined input', () => {
      const items = undefined;
      const itemIndex = 0;
      
      mockReturnJsonArray.mockReturnValue([]);
      mockConstructExecutionMetaData.mockReturnValue([]);
      
      const result = formatOutput.call(mockThis, items as any, itemIndex);
      
      expect(mockReturnJsonArray).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should pass correct itemIndex', () => {
      const items = [{ id: 1 }];
      const itemIndex = 5;
      
      mockReturnJsonArray.mockReturnValue([{ json: items[0] }]);
      mockConstructExecutionMetaData.mockReturnValue([
        { json: items[0], pairedItem: { item: itemIndex } }
      ]);
      
      formatOutput.call(mockThis, items, itemIndex);
      
      expect(mockConstructExecutionMetaData).toHaveBeenCalledWith(
        expect.anything(),
        { itemData: { item: 5 } }
      );
    });
  });
});