import { generateAIContextualHelp } from '../../../nodes/Hotmart/v1/docs/aiDocumentation';

describe('aiDocumentation - 100% Coverage', () => {
  describe('generateAIContextualHelp - Line 393 branch', () => {
    it('should handle null context gracefully', () => {
      // Test com context null
      const result = generateAIContextualHelp('getAll', null as any);
      
      expect(result).toBeDefined();
      expect(result.operation).toBe('getAll');
      expect(result.context).toEqual({});
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle undefined context gracefully', () => {
      // Test com context undefined
      const result = generateAIContextualHelp('getAll', undefined as any);
      
      expect(result).toBeDefined();
      expect(result.operation).toBe('getAll');
      expect(result.context).toEqual({});
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle unknown operation', () => {
      // Test com operação desconhecida
      const result = generateAIContextualHelp('unknownOperation', { test: true });
      
      expect(result).toBeDefined();
      expect(result.operation).toBe('unknownOperation');
      expect(result.context).toEqual({ test: true });
      expect(result.suggestions).toEqual(['❌ Operação não encontrada na documentação']);
    });
  });
});