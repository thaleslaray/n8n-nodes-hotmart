import type { INodeProperties } from 'n8n-workflow';

// Import operation modules
import * as getAll from './getAll.operation';
import * as cancel from './cancel.operation';
import * as cancelList from './cancelList.operation';
import * as changeBillingDate from './changeBillingDate.operation';
import * as getPurchases from './getPurchases.operation';
import * as reactivate from './reactivate.operation';
import * as reactivateList from './reactivateList.operation';
import * as getSummary from './getSummary.operation';
import * as getTransactions from './getTransactions.operation';

// Export operations grouped together with enhanced descriptions
export const operations = {
  getAll,
  getSummary,
  getTransactions,
  getPurchases,
  cancel,
  cancelList,
  reactivate,
  reactivateList,
  changeBillingDate,
};

// Enhanced operation descriptions for better AI/user understanding
export const resourceDescription = {
  displayName: 'Assinaturas',
  description: 'Gerencie assinaturas recorrentes, pagamentos e ciclos de cobrança no Hotmart',
  hint: '💡 Dica: Use filtros de data para melhorar a performance em grandes volumes de dados',
};

// Export description separately
export const description: INodeProperties[] = [
  // Spread descriptions from individual operation files
  ...getAll.description,
  ...getSummary.description,
  ...getTransactions.description,
  ...getPurchases.description,
  ...cancel.description,
  ...cancelList.description,
  ...reactivate.description,
  ...reactivateList.description,
  ...changeBillingDate.description,
];
