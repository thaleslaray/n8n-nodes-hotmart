import { configureOutputNames } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { INodeParameters } from 'n8n-workflow';

describe('configureOutputNames function', () => {
  describe('super-smart mode', () => {
    it('should return default output names when customizeOutputs is false', () => {
      const parameters: INodeParameters = {
        triggerMode: 'super-smart',
        customizeOutputs: false,
      };

      const result = configureOutputNames(parameters);

      expect(result).toHaveLength(18);
      expect(result[0]).toEqual({ type: 'main', displayName: 'Compra Única' });
      expect(result[1]).toEqual({ type: 'main', displayName: 'Assinatura' });
      expect(result[2]).toEqual({ type: 'main', displayName: 'Renovação' });
      expect(result[3]).toEqual({ type: 'main', displayName: 'Completa' });
      expect(result[4]).toEqual({ type: 'main', displayName: 'Cancelada' });
      expect(result[5]).toEqual({ type: 'main', displayName: 'Reembolso' });
      expect(result[6]).toEqual({ type: 'main', displayName: 'Chargeback' });
      expect(result[7]).toEqual({ type: 'main', displayName: 'Boleto' });
      expect(result[8]).toEqual({ type: 'main', displayName: 'PIX' });
      expect(result[9]).toEqual({ type: 'main', displayName: 'Disputa' });
      expect(result[10]).toEqual({ type: 'main', displayName: 'Expirada' });
      expect(result[11]).toEqual({ type: 'main', displayName: 'Atrasada' });
      expect(result[12]).toEqual({ type: 'main', displayName: 'Abandono' });
      expect(result[13]).toEqual({ type: 'main', displayName: 'Ass. Cancelada' });
      expect(result[14]).toEqual({ type: 'main', displayName: 'Troca de Plano' });
      expect(result[15]).toEqual({ type: 'main', displayName: 'Troca de Data' });
      expect(result[16]).toEqual({ type: 'main', displayName: 'Primeiro Acesso' });
      expect(result[17]).toEqual({ type: 'main', displayName: 'Módulo Completo' });
    });

    it('should return custom output names when customizeOutputs is true', () => {
      const parameters: INodeParameters = {
        triggerMode: 'super-smart',
        customizeOutputs: true,
        outputNameSuper0: 'Custom Single',
        outputNameSuper1: 'Custom Sub',
        outputNameSuper2: 'Custom Renewal',
        outputNameSuper3: 'Custom Complete',
        outputNameSuper4: 'Custom Cancel',
        outputNameSuper5: 'Custom Refund',
        outputNameSuper6: 'Custom Charge',
        outputNameSuper7: 'Custom Billet',
        outputNameSuper8: 'Custom PIX', // Note: PIX is now Super8 (corrected alignment)
        outputNameSuper9: 'Custom Dispute',
        outputNameSuper10: 'Custom Expired',
        outputNameSuper11: 'Custom Delayed',
        outputNameSuper12: 'Custom Abandon',
        outputNameSuper13: 'Custom Sub Cancel',
        outputNameSuper14: 'Custom Switch',
        outputNameSuper15: 'Custom Date',
        outputNameSuper16: 'Custom First',
        outputNameSuper17: 'Custom Module',
      };

      const result = configureOutputNames(parameters);

      expect(result).toHaveLength(18);
      expect(result[0]).toEqual({ type: 'main', displayName: 'Custom Single' });
      expect(result[1]).toEqual({ type: 'main', displayName: 'Custom Sub' });
      expect(result[2]).toEqual({ type: 'main', displayName: 'Custom Renewal' });
      expect(result[3]).toEqual({ type: 'main', displayName: 'Custom Complete' });
      expect(result[4]).toEqual({ type: 'main', displayName: 'Custom Cancel' });
      expect(result[5]).toEqual({ type: 'main', displayName: 'Custom Refund' });
      expect(result[6]).toEqual({ type: 'main', displayName: 'Custom Charge' });
      expect(result[7]).toEqual({ type: 'main', displayName: 'Custom Billet' });
      expect(result[8]).toEqual({ type: 'main', displayName: 'Custom PIX' });
      expect(result[9]).toEqual({ type: 'main', displayName: 'Custom Dispute' });
      expect(result[10]).toEqual({ type: 'main', displayName: 'Custom Expired' });
      expect(result[11]).toEqual({ type: 'main', displayName: 'Custom Delayed' });
      expect(result[12]).toEqual({ type: 'main', displayName: 'Custom Abandon' });
      expect(result[13]).toEqual({ type: 'main', displayName: 'Custom Sub Cancel' });
      expect(result[14]).toEqual({ type: 'main', displayName: 'Custom Switch' });
      expect(result[15]).toEqual({ type: 'main', displayName: 'Custom Date' });
      expect(result[16]).toEqual({ type: 'main', displayName: 'Custom First' });
      expect(result[17]).toEqual({ type: 'main', displayName: 'Custom Module' });
    });

    it('should use default names when custom names are not provided', () => {
      const parameters: INodeParameters = {
        triggerMode: 'super-smart',
        customizeOutputs: true,
        // No custom names provided
      };

      const result = configureOutputNames(parameters);

      expect(result).toHaveLength(18);
      // Should fall back to default names
      expect(result[0]).toEqual({ type: 'main', displayName: 'Compra Única' });
      expect(result[1]).toEqual({ type: 'main', displayName: 'Assinatura' });
    });
  });

  describe('smart mode', () => {
    it('should return default output names when customizeOutputs is false', () => {
      const parameters: INodeParameters = {
        triggerMode: 'smart',
        customizeOutputs: false,
      };

      const result = configureOutputNames(parameters);

      expect(result).toHaveLength(15);
      expect(result[0]).toEqual({ type: 'main', displayName: 'Aprovada' });
      expect(result[1]).toEqual({ type: 'main', displayName: 'Completa' });
      expect(result[2]).toEqual({ type: 'main', displayName: 'Cancelada' });
      expect(result[3]).toEqual({ type: 'main', displayName: 'Reembolso' });
      expect(result[4]).toEqual({ type: 'main', displayName: 'Chargeback' });
      expect(result[5]).toEqual({ type: 'main', displayName: 'Boleto' });
      expect(result[6]).toEqual({ type: 'main', displayName: 'Disputa' });
      expect(result[7]).toEqual({ type: 'main', displayName: 'Expirada' });
      expect(result[8]).toEqual({ type: 'main', displayName: 'Atrasada' });
      expect(result[9]).toEqual({ type: 'main', displayName: 'Abandono' });
      expect(result[10]).toEqual({ type: 'main', displayName: 'Ass. Cancelada' });
      expect(result[11]).toEqual({ type: 'main', displayName: 'Troca de Plano' });
      expect(result[12]).toEqual({ type: 'main', displayName: 'Troca de Data' });
      expect(result[13]).toEqual({ type: 'main', displayName: 'Primeiro Acesso' });
      expect(result[14]).toEqual({ type: 'main', displayName: 'Módulo Completo' });
    });

    it('should return custom output names when customizeOutputs is true', () => {
      const parameters: INodeParameters = {
        triggerMode: 'smart',
        customizeOutputs: true,
        outputName0: 'Custom Approved',
        outputName1: 'Custom Complete',
        outputName2: 'Custom Canceled',
        outputName3: 'Custom Refund',
        outputName4: 'Custom Chargeback',
        outputName5: 'Custom Boleto',
        outputName6: 'Custom Dispute',
        outputName7: 'Custom Expired',
        outputName8: 'Custom Delayed',
        outputName9: 'Custom Abandon',
        outputName10: 'Custom Sub Canceled',
        outputName11: 'Custom Switch Plan',
        outputName12: 'Custom Date Change',
        outputName13: 'Custom First Access',
        outputName14: 'Custom Module Done',
      };

      const result = configureOutputNames(parameters);

      expect(result).toHaveLength(15);
      expect(result[0]).toEqual({ type: 'main', displayName: 'Custom Approved' });
      expect(result[1]).toEqual({ type: 'main', displayName: 'Custom Complete' });
      expect(result[2]).toEqual({ type: 'main', displayName: 'Custom Canceled' });
      expect(result[3]).toEqual({ type: 'main', displayName: 'Custom Refund' });
      expect(result[4]).toEqual({ type: 'main', displayName: 'Custom Chargeback' });
      expect(result[5]).toEqual({ type: 'main', displayName: 'Custom Boleto' });
      expect(result[6]).toEqual({ type: 'main', displayName: 'Custom Dispute' });
      expect(result[7]).toEqual({ type: 'main', displayName: 'Custom Expired' });
      expect(result[8]).toEqual({ type: 'main', displayName: 'Custom Delayed' });
      expect(result[9]).toEqual({ type: 'main', displayName: 'Custom Abandon' });
      expect(result[10]).toEqual({ type: 'main', displayName: 'Custom Sub Canceled' });
      expect(result[11]).toEqual({ type: 'main', displayName: 'Custom Switch Plan' });
      expect(result[12]).toEqual({ type: 'main', displayName: 'Custom Date Change' });
      expect(result[13]).toEqual({ type: 'main', displayName: 'Custom First Access' });
      expect(result[14]).toEqual({ type: 'main', displayName: 'Custom Module Done' });
    });

    it('should use default names when custom names are not provided', () => {
      const parameters: INodeParameters = {
        triggerMode: 'smart',
        customizeOutputs: true,
        // No custom names provided
      };

      const result = configureOutputNames(parameters);

      expect(result).toHaveLength(15);
      // Should fall back to default names
      expect(result[0]).toEqual({ type: 'main', displayName: 'Aprovada' });
      expect(result[1]).toEqual({ type: 'main', displayName: 'Completa' });
    });
  });

  describe('standard mode', () => {
    it('should return single output for standard mode', () => {
      const parameters: INodeParameters = {
        triggerMode: 'standard',
      };

      const result = configureOutputNames(parameters);

      expect(result).toEqual([{ type: 'main', displayName: 'Webhook Data' }]);
    });

    it('should return single output regardless of customizeOutputs in standard mode', () => {
      const parameters: INodeParameters = {
        triggerMode: 'standard',
        customizeOutputs: true,
      };

      const result = configureOutputNames(parameters);

      expect(result).toEqual([{ type: 'main', displayName: 'Webhook Data' }]);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined trigger mode', () => {
      const parameters: INodeParameters = {};

      const result = configureOutputNames(parameters);

      // Should default to standard mode behavior
      expect(result).toEqual([{ type: 'main', displayName: 'Webhook Data' }]);
    });

    it('should handle invalid trigger mode', () => {
      const parameters: INodeParameters = {
        triggerMode: 'invalid-mode',
      };

      const result = configureOutputNames(parameters);

      // Invalid modes default to smart mode outputs
      expect(result).toHaveLength(15);
      expect(result[0]).toEqual({ type: 'main', displayName: 'Aprovada' });
    });
  });
});