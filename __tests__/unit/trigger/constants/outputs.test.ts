import { 
  buildOutputConfiguration,
  DEFAULT_OUTPUT_NAMES 
} from '../../../../nodes/Hotmart/trigger/constants/outputs';

describe('Trigger Constants - Outputs', () => {
  describe('buildOutputConfiguration', () => {
    it('should return main output for standard mode', () => {
      const params = {
        triggerMode: 'standard',
        customizeOutputs: false,
      };

      const result = buildOutputConfiguration(params);

      expect(result).toEqual([
        {
          type: 'main',
          displayName: 'main',
        },
      ]);
    });

    describe('Smart Mode', () => {
      it('should return default smart outputs when not customized', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: false,
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(DEFAULT_OUTPUT_NAMES.smart.length);
        result.forEach((output, index) => {
          expect(output).toEqual({
            type: 'main',
            displayName: DEFAULT_OUTPUT_NAMES.smart[index],
          });
        });
      });

      it('should return customized smart outputs', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          events: ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'],
          outputName0: 'Custom Approved',
          outputName1: 'Custom Complete',
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          type: 'main',
          displayName: 'Custom Approved',
        });
        expect(result[1]).toEqual({
          type: 'main',
          displayName: 'Custom Complete',
        });
      });

      it('should use default names when custom names not provided', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          events: ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'],
          // No custom names provided
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          type: 'main',
          displayName: DEFAULT_OUTPUT_NAMES.smart[0],
        });
        expect(result[1]).toEqual({
          type: 'main',
          displayName: DEFAULT_OUTPUT_NAMES.smart[1],
        });
      });

      it('should handle mixed custom and default names', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          events: ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'PURCHASE_CANCELED'],
          outputName0: 'Custom Approved',
          // outputName1 not provided - should use default
          outputName2: 'Custom Canceled',
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(3);
        expect(result[0].displayName).toBe('Custom Approved');
        expect(result[1].displayName).toBe(DEFAULT_OUTPUT_NAMES.smart[1]);
        expect(result[2].displayName).toBe('Custom Canceled');
      });

      it('should handle events beyond default output names', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          events: new Array(20).fill('EVENT'), // 20 events
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(20);
        // Check that outputs beyond DEFAULT_OUTPUT_NAMES.smart use fallback
        expect(result[19].displayName).toBe('Output 20');
      });
    });

    describe('Super Smart Mode', () => {
      it('should return default super-smart outputs when not customized', () => {
        const params = {
          triggerMode: 'super-smart',
          customizeOutputs: false,
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(DEFAULT_OUTPUT_NAMES['super-smart'].length);
        result.forEach((output, index) => {
          expect(output).toEqual({
            type: 'main',
            displayName: DEFAULT_OUTPUT_NAMES['super-smart'][index],
          });
        });
      });

      it('should return customized super-smart outputs', () => {
        const params = {
          triggerMode: 'super-smart',
          customizeOutputs: true,
          outputNameSuper0: 'Custom Single Purchase',
          outputNameSuper1: 'Custom Subscription',
          outputNameSuper2: 'Custom Renewal',
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(DEFAULT_OUTPUT_NAMES['super-smart'].length);
        expect(result[0].displayName).toBe('Custom Single Purchase');
        expect(result[1].displayName).toBe('Custom Subscription');
        expect(result[2].displayName).toBe('Custom Renewal');
        // Rest should use default names
        for (let i = 3; i < result.length; i++) {
          expect(result[i].displayName).toBe(DEFAULT_OUTPUT_NAMES['super-smart'][i]);
        }
      });

      it('should use default names when custom names not provided', () => {
        const params = {
          triggerMode: 'super-smart',
          customizeOutputs: true,
          // No custom names provided
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(DEFAULT_OUTPUT_NAMES['super-smart'].length);
        result.forEach((output, index) => {
          expect(output.displayName).toBe(DEFAULT_OUTPUT_NAMES['super-smart'][index]);
        });
      });
    });

    describe('Edge cases', () => {
      it('should handle empty events array', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          events: [],
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(0);
      });

      it('should handle undefined events', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          // events not defined
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(0);
      });

      it('should handle null parameters safely', () => {
        const params = {
          triggerMode: 'smart',
          customizeOutputs: true,
          events: ['EVENT1'],
          outputName0: null,
        };

        const result = buildOutputConfiguration(params);

        expect(result).toHaveLength(1);
        expect(result[0].displayName).toBe(DEFAULT_OUTPUT_NAMES.smart[0]);
      });
    });
  });

  describe('DEFAULT_OUTPUT_NAMES', () => {
    it('should have smart output names', () => {
      expect(DEFAULT_OUTPUT_NAMES.smart).toBeDefined();
      expect(Array.isArray(DEFAULT_OUTPUT_NAMES.smart)).toBe(true);
      expect(DEFAULT_OUTPUT_NAMES.smart.length).toBeGreaterThan(0);
    });

    it('should have super-smart output names', () => {
      expect(DEFAULT_OUTPUT_NAMES['super-smart']).toBeDefined();
      expect(Array.isArray(DEFAULT_OUTPUT_NAMES['super-smart'])).toBe(true);
      expect(DEFAULT_OUTPUT_NAMES['super-smart'].length).toBeGreaterThan(0);
    });

    it('should have all expected smart output names', () => {
      expect(DEFAULT_OUTPUT_NAMES.smart).toHaveLength(15);
      expect(DEFAULT_OUTPUT_NAMES.smart[0]).toBe('Compra Aprovada');
      expect(DEFAULT_OUTPUT_NAMES.smart[1]).toBe('Compra Completa');
      expect(DEFAULT_OUTPUT_NAMES.smart[2]).toBe('Compra Cancelada');
      expect(DEFAULT_OUTPUT_NAMES.smart[3]).toBe('Compra Devolvida');
      expect(DEFAULT_OUTPUT_NAMES.smart[4]).toBe('Chargeback');
      expect(DEFAULT_OUTPUT_NAMES.smart[5]).toBe('Boleto/PIX');
      expect(DEFAULT_OUTPUT_NAMES.smart[6]).toBe('Protesto');
      expect(DEFAULT_OUTPUT_NAMES.smart[7]).toBe('Compra Expirada');
      expect(DEFAULT_OUTPUT_NAMES.smart[8]).toBe('Compra Atrasada');
      expect(DEFAULT_OUTPUT_NAMES.smart[9]).toBe('Carrinho Abandonado');
      expect(DEFAULT_OUTPUT_NAMES.smart[10]).toBe('Assinatura Cancelada');
      expect(DEFAULT_OUTPUT_NAMES.smart[11]).toBe('Plano Trocado');
      // Skip encoding checks for the rest
    });
  });
});