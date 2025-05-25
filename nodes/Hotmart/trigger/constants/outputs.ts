/**
 * Output configurations for different trigger modes
 */

import type { INodeOutputConfiguration } from 'n8n-workflow';

/**
 * Default output names for each mode
 */
export const DEFAULT_OUTPUT_NAMES = {
  standard: ['main'],
  smart: [
    'Compra Aprovada',
    'Compra Completa',
    'Compra Cancelada',
    'Compra Devolvida',
    'Chargeback',
    'Boleto/PIX',
    'Protesto',
    'Compra Expirada',
    'Compra Atrasada',
    'Carrinho Abandonado',
    'Assinatura Cancelada',
    'Plano Trocado',
    'Data de Cobrança Alterada',
    'Área de Membros - Primeiro Acesso',
    'Área de Membros - Módulo Completado',
  ],
  'super-smart': [
    'Compra Única',
    'Assinatura',
    'Renovação',
    'Completa',
    'Cancelada',
    'Reembolso',
    'Chargeback',
    'Boleto',
    'PIX',
    'Disputa',
    'Expirada',
    'Atrasada',
    'Abandono',
    'Ass. Cancelada',
    'Troca de Plano',
    'Troca de Data',
    'Primeiro Acesso',
    'Módulo Completo',
  ],
} as const;

/**
 * Build output configuration based on parameters
 */
export function buildOutputConfiguration(parameters: any): INodeOutputConfiguration[] {
  const triggerMode = parameters.triggerMode as string;
  const customizeOutputs = parameters.customizeOutputs as boolean;

  if (triggerMode === 'standard') {
    return [{
      type: 'main' as const,
      displayName: 'main',
    }];
  }

  const names = triggerMode === 'super-smart'
    ? buildSuperSmartOutputs(parameters, customizeOutputs)
    : buildSmartOutputs(parameters, customizeOutputs);

  return names.map(name => ({
    type: 'main',
    displayName: name,
  }));
}

/**
 * Build smart mode outputs
 */
function buildSmartOutputs(parameters: any, customize: boolean): string[] {
  if (!customize) {
    return [...DEFAULT_OUTPUT_NAMES.smart];
  }

  const events = (parameters.events || []) as string[];
  return events.map((_, index) => 
    parameters[`outputName${index}`] || DEFAULT_OUTPUT_NAMES.smart[index] || `Output ${index + 1}`
  );
}

/**
 * Build super smart mode outputs
 */
function buildSuperSmartOutputs(parameters: any, customize: boolean): string[] {
  if (!customize) {
    return [...DEFAULT_OUTPUT_NAMES['super-smart']];
  }

  return DEFAULT_OUTPUT_NAMES['super-smart'].map((defaultName, index) => 
    parameters[`outputNameSuper${index}`] || defaultName
  );
}