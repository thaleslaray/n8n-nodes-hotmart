import * as getAll from './getAll.operation';
import * as getInfo from './getInfo.operation';

/**
 * Resource de Ingressos (Tickets) para Eventos
 * 
 * Este resource permite gerenciar ingressos e participantes de eventos na Hotmart.
 * 
 * Operações disponíveis:
 * - getAll: Lista todos os participantes/compradores de ingressos de um evento
 * - getInfo: Obtém informações detalhadas sobre um evento específico
 * 
 * Use cases comuns:
 * - Controle de acesso e check-in em eventos
 * - Gestão de lista de presença
 * - Integração com sistemas de controle de acesso
 * - Relatórios de vendas de ingressos
 * - Monitoramento de capacidade do evento
 */
export const operations = {
  getAll,
  getInfo,
};

export const description = [...getAll.description, ...getInfo.description];
