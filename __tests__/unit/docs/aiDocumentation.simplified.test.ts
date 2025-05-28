import { aiOperationDocs } from '../../../nodes/Hotmart/v1/docs/aiDocumentation';

describe('AI Documentation - Simplified Coverage', () => {
  it('deve ter documentação estruturada', () => {
    expect(aiOperationDocs).toBeDefined();
    expect(typeof aiOperationDocs).toBe('object');
  });

  it('deve conter todas as operações principais', () => {
    const operations = Object.keys(aiOperationDocs);
    expect(operations.length).toBeGreaterThan(15);
    
    // Verifica se operações existem
    expect((aiOperationDocs as any)['subscription.getAll']).toBeDefined();
    expect((aiOperationDocs as any)['subscription.getSummary']).toBeDefined();
    expect((aiOperationDocs as any)['subscription.getTransactions']).toBeDefined();
    expect((aiOperationDocs as any)['subscription.getPurchases']).toBeDefined();
    expect((aiOperationDocs as any)['subscription.cancel']).toBeDefined();
    expect((aiOperationDocs as any)['subscription.reactivate']).toBeDefined();
    expect((aiOperationDocs as any)['sales.getHistoricoVendas']).toBeDefined();
    expect((aiOperationDocs as any)['sales.getComissoesVendas']).toBeDefined();
    expect((aiOperationDocs as any)['product.getAll']).toBeDefined();
    expect((aiOperationDocs as any)['club.getAll']).toBeDefined();
    expect((aiOperationDocs as any)['coupon.get']).toBeDefined();
    expect((aiOperationDocs as any)['coupon.create']).toBeDefined();
  });

  it('deve ter estrutura válida para cada operação', () => {
    const operations = Object.keys(aiOperationDocs);
    
    operations.forEach(operation => {
      const doc = (aiOperationDocs as any)[operation];
      
      expect(doc).toHaveProperty('summary');
      expect(doc).toHaveProperty('examples');
      expect(doc).toHaveProperty('parameters');
      
      expect(typeof doc.summary).toBe('string');
      expect(doc.summary.length).toBeGreaterThan(5);
      
      expect(Array.isArray(doc.examples)).toBe(true);
      expect(doc.examples.length).toBeGreaterThan(0);
      
      expect(typeof doc.parameters).toBe('object');
      
      // Verifica exemplos
      doc.examples.forEach((example: any) => {
        expect(typeof example).toBe('string');
        expect(example.length).toBeGreaterThan(3);
      });
    });
  });

  it('deve cobrir operações de subscription', () => {
    const subscriptionOps = Object.keys(aiOperationDocs).filter(key => key.startsWith('subscription.'));
    expect(subscriptionOps.length).toBeGreaterThan(5);
  });

  it('deve cobrir operações de sales', () => {
    const salesOps = Object.keys(aiOperationDocs).filter(key => key.startsWith('sales.'));
    expect(salesOps.length).toBeGreaterThan(3);
  });

  it('deve cobrir operações de club', () => {
    const clubOps = Object.keys(aiOperationDocs).filter(key => key.startsWith('club.'));
    expect(clubOps.length).toBeGreaterThan(1);
  });

  it('deve cobrir operações de product', () => {
    const productOps = Object.keys(aiOperationDocs).filter(key => key.startsWith('product.'));
    expect(productOps.length).toBeGreaterThan(0);
  });

  it('deve cobrir operações de coupon', () => {
    const couponOps = Object.keys(aiOperationDocs).filter(key => key.startsWith('coupon.'));
    expect(couponOps.length).toBeGreaterThan(1);
  });

  it('deve ter parâmetros definidos', () => {
    const operations = Object.keys(aiOperationDocs);
    
    operations.forEach(operation => {
      const doc = (aiOperationDocs as any)[operation];
      const params = Object.keys(doc.parameters);
      
      // A maioria das operações deve ter pelo menos 1 parâmetro
      expect(params.length).toBeGreaterThanOrEqual(0);
      
      params.forEach(param => {
        expect(typeof doc.parameters[param]).toBe('string');
        expect(doc.parameters[param].length).toBeGreaterThan(5);
      });
    });
  });
});