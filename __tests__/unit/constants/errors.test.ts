import { ERROR_MESSAGES, ERROR_HINTS, createErrorMessage, getErrorMessageByStatus } from '../../../nodes/Hotmart/v1/constants/errors';

describe('errors.ts - 100% Coverage', () => {
  describe('ERROR_MESSAGES constant', () => {
    it('should contain all required error message categories', () => {
      expect(ERROR_MESSAGES.API).toBeDefined();
      expect(ERROR_MESSAGES.VALIDATION).toBeDefined();
      expect(ERROR_MESSAGES.BUSINESS).toBeDefined();
      expect(ERROR_MESSAGES.RESOURCE).toBeDefined();
      expect(ERROR_MESSAGES.NETWORK).toBeDefined();
      expect(ERROR_MESSAGES.CONFIG).toBeDefined();
    });

    it('should have proper API error messages', () => {
      expect(ERROR_MESSAGES.API.UNAUTHORIZED).toContain('autenticação');
      expect(ERROR_MESSAGES.API.FORBIDDEN).toContain('Acesso negado');
      expect(ERROR_MESSAGES.API.NOT_FOUND).toContain('não encontrado');
    });
  });

  describe('ERROR_HINTS constant', () => {
    it('should contain hints for common HTTP status codes', () => {
      expect(ERROR_HINTS[401]).toContain('credenciais');
      expect(ERROR_HINTS[403]).toContain('permissão');
      expect(ERROR_HINTS[404]).toContain('ID');
      expect(ERROR_HINTS[429]).toContain('minutos');
      expect(ERROR_HINTS[500]).toContain('servidor');
      expect(ERROR_HINTS[502]).toContain('conectividade');
      expect(ERROR_HINTS[503]).toContain('indisponível');
    });
  });

  describe('createErrorMessage function', () => {
    it('should return base message when no details provided', () => {
      const result = createErrorMessage('Erro base');
      expect(result).toBe('Erro base');
    });

    it('should append code when provided', () => {
      const result = createErrorMessage('Erro base', { code: 'ERR001' });
      expect(result).toBe('Erro base (Código: ERR001)');
    });

    it('should append status code when provided', () => {
      const result = createErrorMessage('Erro base', { statusCode: 404 });
      expect(result).toBe('Erro base [HTTP 404]');
    });

    it('should append resource and operation when both provided', () => {
      const result = createErrorMessage('Erro base', { 
        resource: 'subscription', 
        operation: 'cancel' 
      });
      expect(result).toBe('Erro base - subscription/cancel');
    });

    it('should append hint when provided', () => {
      const result = createErrorMessage('Erro base', { hint: 'Verifique suas credenciais' });
      expect(result).toBe('Erro base\n💡 Dica: Verifique suas credenciais');
    });

    it('should handle all details together', () => {
      const result = createErrorMessage('Erro base', {
        code: 'ERR001',
        statusCode: 401,
        resource: 'subscription',
        operation: 'getAll',
        hint: 'Verifique as credenciais'
      });
      expect(result).toBe('Erro base (Código: ERR001) [HTTP 401] - subscription/getAll\n💡 Dica: Verifique as credenciais');
    });

    it('should not append resource/operation if only one is provided', () => {
      const resultResource = createErrorMessage('Erro base', { resource: 'subscription' });
      const resultOperation = createErrorMessage('Erro base', { operation: 'getAll' });
      const resultResourceUndefined = createErrorMessage('Erro base', { resource: 'subscription', operation: undefined });
      const resultOperationUndefined = createErrorMessage('Erro base', { resource: undefined, operation: 'getAll' });
      
      expect(resultResource).toBe('Erro base');
      expect(resultOperation).toBe('Erro base');
      expect(resultResourceUndefined).toBe('Erro base');
      expect(resultOperationUndefined).toBe('Erro base');
    });

    it('should not append resource/operation with falsy values', () => {
      const resultEmptyResource = createErrorMessage('Erro base', { resource: '', operation: 'getAll' });
      const resultEmptyOperation = createErrorMessage('Erro base', { resource: 'subscription', operation: '' });
      const resultBothEmpty = createErrorMessage('Erro base', { resource: '', operation: '' });
      const resultNullDetails = createErrorMessage('Erro base', null as any);
      
      expect(resultEmptyResource).toBe('Erro base');
      expect(resultEmptyOperation).toBe('Erro base');
      expect(resultBothEmpty).toBe('Erro base');
      expect(resultNullDetails).toBe('Erro base');
    });

    it('should test short-circuit evaluation: resource truthy but operation falsy', () => {
      // Este é o edge case específico: resource é truthy, mas operation é falsy
      // Testa o segundo branch da condição details?.resource && details?.operation
      // 
      // NOTA: Há 1 branch não testável (97.22% coverage) relacionado ao optional chaining
      // Ver documentação: EDGE-CASE-ANALYSIS.md para detalhes técnicos
      const resultTruthyResourceFalsyOperation = createErrorMessage('Erro base', { 
        resource: 'subscription', 
        operation: false as any  // boolean false
      });
      
      const resultTruthyResourceNullOperation = createErrorMessage('Erro base', { 
        resource: 'subscription', 
        operation: null as any  // null
      });

      const resultTruthyResourceZeroOperation = createErrorMessage('Erro base', { 
        resource: 'subscription', 
        operation: 0 as any  // number 0
      });

      const resultTruthyResourceNaNOperation = createErrorMessage('Erro base', { 
        resource: 'subscription', 
        operation: NaN as any  // NaN
      });
      
      expect(resultTruthyResourceFalsyOperation).toBe('Erro base');
      expect(resultTruthyResourceNullOperation).toBe('Erro base');
      expect(resultTruthyResourceZeroOperation).toBe('Erro base');
      expect(resultTruthyResourceNaNOperation).toBe('Erro base');
    });
  });

  describe('getErrorMessageByStatus function', () => {
    it('should return correct message for 400', () => {
      const result = getErrorMessageByStatus(400);
      expect(result).toBe(ERROR_MESSAGES.API.INVALID_REQUEST);
    });

    it('should return correct message for 401', () => {
      const result = getErrorMessageByStatus(401);
      expect(result).toBe(ERROR_MESSAGES.API.UNAUTHORIZED);
    });

    it('should return correct message for 403', () => {
      const result = getErrorMessageByStatus(403);
      expect(result).toBe(ERROR_MESSAGES.API.FORBIDDEN);
    });

    it('should return correct message for 404', () => {
      const result = getErrorMessageByStatus(404);
      expect(result).toBe(ERROR_MESSAGES.API.NOT_FOUND);
    });

    it('should return correct message for 429', () => {
      const result = getErrorMessageByStatus(429);
      expect(result).toBe(ERROR_MESSAGES.API.RATE_LIMIT);
    });

    it('should return correct message for 500', () => {
      const result = getErrorMessageByStatus(500);
      expect(result).toBe(ERROR_MESSAGES.API.SERVER_ERROR);
    });

    it('should return correct message for 502', () => {
      const result = getErrorMessageByStatus(502);
      expect(result).toBe(ERROR_MESSAGES.API.SERVER_ERROR);
    });

    it('should return correct message for 503', () => {
      const result = getErrorMessageByStatus(503);
      expect(result).toBe(ERROR_MESSAGES.API.SERVER_ERROR);
    });

    it('should return correct message for 504', () => {
      const result = getErrorMessageByStatus(504);
      expect(result).toBe(ERROR_MESSAGES.API.TIMEOUT);
    });

    it('should return default message for unknown status codes', () => {
      const result = getErrorMessageByStatus(999);
      expect(result).toBe('Erro na API Hotmart (HTTP 999)');
    });

    it('should handle edge case status codes', () => {
      expect(getErrorMessageByStatus(418)).toBe('Erro na API Hotmart (HTTP 418)');
      expect(getErrorMessageByStatus(0)).toBe('Erro na API Hotmart (HTTP 0)');
      expect(getErrorMessageByStatus(-1)).toBe('Erro na API Hotmart (HTTP -1)');
    });
  });
});