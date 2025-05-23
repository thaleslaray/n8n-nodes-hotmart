import type { INodeProperties } from 'n8n-workflow';

// Import operation modules
import * as generateNegotiation from './generateNegotiation.operation';

// Export operations grouped together
export const operations = {
  generateNegotiation,
};

// Resource description with enhanced details
export const resourceDescription: INodeProperties = {
  displayName: 'Negociação de Parcelas',
  name: 'negotiate',
  type: 'options',
  noDataExpression: true,
  options: [
    {
      name: 'Gerar Link de Negociação',
      value: 'generateNegotiation',
      description: 'Cria um link de pagamento para negociar parcelas em atraso de uma assinatura',
      action: 'Gerar link de negociação de parcelas',
    },
  ],
  default: 'generateNegotiation',
  description: 'Gerencie negociações de parcelas em atraso, permitindo que clientes paguem múltiplas parcelas de uma vez com desconto opcional',
};

// Export description separately
export const description: INodeProperties[] = [
  // Spread descriptions from individual operation files
  ...generateNegotiation.description,
];
