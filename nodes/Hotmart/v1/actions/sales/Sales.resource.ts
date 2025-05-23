import type { INodeProperties } from 'n8n-workflow';

import * as getHistoricoVendas from './getHistoricoVendas.operation';
import * as getComissoesVendas from './getComissoesVendas.operation';
import * as getDetalhamentoPrecos from './getDetalhamentoPrecos.operation';
import * as getParticipantesVendas from './getParticipantesVendas.operation';
import * as solicitarReembolso from './solicitarReembolso.operation';
import * as getResumoVendas from './getResumoVendas.operation';

export const operations = {
  getHistoricoVendas,
  getComissoesVendas,
  getDetalhamentoPrecos,
  getParticipantesVendas,
  solicitarReembolso,
  getResumoVendas,
};

export const description: INodeProperties[] = [
  ...getHistoricoVendas.description,
  ...getComissoesVendas.description,
  ...getDetalhamentoPrecos.description,
  ...getParticipantesVendas.description,
  ...solicitarReembolso.description,
  ...getResumoVendas.description,
];
