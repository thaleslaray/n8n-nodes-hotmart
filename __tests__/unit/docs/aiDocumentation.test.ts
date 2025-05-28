import { expect } from '@jest/globals';
import {
  getAiDocForOperation,
  generateAIContextualHelp,
  getAllOperationExamples,
  getOperationByCategory,
  supportedOperations,
  aiOperationDocs,
} from '../../../nodes/Hotmart/v1/docs/aiDocumentation';

describe('AI Documentation', () => {
  describe('getAiDocForOperation', () => {
    it('should return documentation for valid operation', () => {
      const doc = getAiDocForOperation('subscription', 'getAll');
      
      expect(doc).toBeDefined();
      expect(doc?.summary).toBe('Lista assinaturas da Hotmart com filtros avançados e paginação automática');
      expect(doc?.examples).toContain('listar todas assinaturas ativas');
      expect(doc?.parameters).toHaveProperty('status');
    });

    it('should return null for invalid operation', () => {
      const doc = getAiDocForOperation('invalid', 'operation');
      
      expect(doc).toBeNull();
    });

    it('should return documentation for all subscription operations', () => {
      const operations = [
        'getAll', 'getSummary', 'getTransactions', 'getPurchases',
        'cancel', 'cancelList', 'reactivate', 'reactivateList', 'changeBillingDate'
      ];

      operations.forEach(op => {
        const doc = getAiDocForOperation('subscription', op);
        expect(doc).toBeDefined();
        expect(doc?.summary).toBeTruthy();
        expect(doc?.examples).toBeInstanceOf(Array);
        expect(doc?.examples.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateAIContextualHelp', () => {
    it('should generate help for valid operation', () => {
      const help = generateAIContextualHelp('subscription.getAll', { productId: 'prod_123' });
      
      expect(help).toBeDefined();
      expect(help.operation).toBe('subscription.getAll');
      expect(help.context).toEqual({ productId: 'prod_123' });
      expect(help.suggestions).toBeInstanceOf(Array);
      expect(help.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle invalid operation', () => {
      const help = generateAIContextualHelp('invalid.operation', {});
      
      expect(help).toBeDefined();
      expect(help.operation).toBe('invalid.operation');
      expect(help.context).toEqual({});
      expect(help.suggestions).toEqual(['❌ Operação não encontrada na documentação']);
    });

    it('should handle undefined context', () => {
      const help = generateAIContextualHelp('subscription.cancel', {});
      
      expect(help).toBeDefined();
      expect(help.context).toEqual({});
    });
  });

  describe('getAllOperationExamples', () => {
    it('should return all operation examples', () => {
      const examples = getAllOperationExamples();
      
      expect(examples).toBeInstanceOf(Array);
      expect(examples.length).toBeGreaterThan(0);
      
      // Check structure of examples
      const firstExample = examples[0];
      expect(firstExample).toHaveProperty('operation');
      expect(firstExample).toHaveProperty('example');
      expect(typeof firstExample.operation).toBe('string');
      expect(typeof firstExample.example).toBe('string');
    });

    it('should include examples from all operations', () => {
      const examples = getAllOperationExamples();
      const operations = new Set(examples.map(ex => ex.operation));
      
      // Should have examples from multiple operations
      expect(operations.size).toBeGreaterThan(10);
      
      // Check specific operations are included
      expect(operations.has('subscription.getAll')).toBe(true);
      expect(operations.has('sales.getHistoricoVendas')).toBe(true);
      expect(operations.has('product.getAll')).toBe(true);
    });
  });

  describe('getOperationByCategory', () => {
    it('should return operations for sales category', () => {
      const operations = getOperationByCategory('sales');
      
      expect(operations).toBeInstanceOf(Array);
      expect(operations.length).toBeGreaterThan(0);
      
      // Verificar estrutura das operações retornadas
      operations.forEach(op => {
        expect(op).toHaveProperty('operation');
        expect(op).toHaveProperty('doc');
        expect(op.operation).toMatch(/^sales\./);
        expect(op.doc).toHaveProperty('summary');
        expect(op.doc).toHaveProperty('examples');
        expect(op.doc).toHaveProperty('parameters');
      });
    });

    it('should return operations for subscription category', () => {
      const operations = getOperationByCategory('subscription');
      
      expect(operations).toBeInstanceOf(Array);
      expect(operations.length).toBeGreaterThan(0);
      
      // Verificar que retornou operações de subscription
      const operationNames = operations.map(op => op.operation);
      expect(operationNames).toContain('subscription.getAll');
      expect(operationNames).toContain('subscription.cancel');
      expect(operationNames).toContain('subscription.reactivate');
    });

    it('should return empty array for invalid category', () => {
      const operations = getOperationByCategory('invalid');
      
      expect(operations).toBeInstanceOf(Array);
      expect(operations.length).toBe(0);
    });

    it('should handle all defined categories', () => {
      const categories = ['sales', 'subscription', 'coupon', 'club', 'tickets', 'product', 'negotiate'];
      
      categories.forEach(category => {
        const operations = getOperationByCategory(category);
        expect(operations).toBeInstanceOf(Array);
        
        // Todas as categorias devem retornar pelo menos uma operação
        expect(operations.length).toBeGreaterThan(0);
        
        // Verificar que as operações pertencem à categoria correta
        operations.forEach(op => {
          expect(op.operation).toMatch(new RegExp(`^${category}\\.`));
        });
      });
    });
    
    it('should return correct operations for each category', () => {
      // Testar categorias específicas
      const salesOps = getOperationByCategory('sales');
      expect(salesOps.map(op => op.operation)).toContain('sales.getHistoricoVendas');
      
      const productOps = getOperationByCategory('product');
      expect(productOps.length).toBe(1);
      expect(productOps[0].operation).toBe('product.getAll');
      
      const negotiateOps = getOperationByCategory('negotiate');
      expect(negotiateOps.length).toBe(1);
      expect(negotiateOps[0].operation).toBe('negotiate.generateNegotiation');
    });
  });

  describe('supportedOperations', () => {
    it('should export list of supported operations', () => {
      expect(supportedOperations).toBeInstanceOf(Array);
      expect(supportedOperations.length).toBeGreaterThan(0);
      expect(supportedOperations).toContain('subscription.getAll');
      expect(supportedOperations).toContain('sales.getHistoricoVendas');
    });
  });

  describe('aiOperationDocs', () => {
    it('should have proper structure for all operations', () => {
      Object.entries(aiOperationDocs).forEach(([, doc]) => {
        expect(doc).toHaveProperty('summary');
        expect(doc).toHaveProperty('examples');
        expect(doc).toHaveProperty('parameters');
        expect(typeof doc.summary).toBe('string');
        expect(doc.examples).toBeInstanceOf(Array);
        expect(typeof doc.parameters).toBe('object');
      });
    });

    it('should have complete documentation for negotiate operation', () => {
      const doc = (aiOperationDocs as any)['negotiate.generateNegotiation'];
      
      expect(doc).toBeDefined();
      expect(doc.summary).toContain('link de negociação');
      expect(doc.examples).toContain('criar parcelamento para cliente');
      expect(doc.parameters).toHaveProperty('buyerEmail');
      expect(doc.parameters).toHaveProperty('installments');
    });
  });

  describe('edge cases', () => {
    it('should handle operation with dots in resource/operation names', () => {
      const doc = getAiDocForOperation('subscription', 'getAll');
      expect(doc).toBeDefined();
      
      // Test with already concatenated key
      const help = generateAIContextualHelp('subscription.getAll', {});
      expect(help.suggestions).not.toEqual(['Operação não encontrada na documentação']);
    });

    it('should handle empty parameters in documentation', () => {
      const doc = getAiDocForOperation('product', 'getAll');
      expect(doc).toBeDefined();
      expect(doc?.parameters).toBeDefined();
    });

    it('should handle null context in generateAIContextualHelp', () => {
      const result = generateAIContextualHelp('sales.getHistoricoVendas', null as any);
      
      expect(result).toBeDefined();
      expect(result.operation).toBe('sales.getHistoricoVendas');
      expect(result.context).toEqual({});
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should handle undefined context in generateAIContextualHelp', () => {
      const result = generateAIContextualHelp('sales.getHistoricoVendas', undefined as any);
      
      expect(result).toBeDefined();
      expect(result.operation).toBe('sales.getHistoricoVendas');
      expect(result.context).toEqual({});
      expect(result.suggestions).toBeInstanceOf(Array);
    });
  });
});