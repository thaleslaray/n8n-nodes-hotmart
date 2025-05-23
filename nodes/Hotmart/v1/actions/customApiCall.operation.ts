import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

/**
 * IMPORTANTE: Backup para Custom API Call
 *
 * Este arquivo existe apenas como backup. A opção "Custom API Call" não deve
 * aparecer na interface devido à configuração de discrepância entre version
 * e defaultVersion no versionDescription.ts.
 *
 * Nossa estratégia principal é:
 * 1. Criar uma discrepância entre version e defaultVersion em versionDescription.ts
 *    - Usamos version: [1, 2] e defaultVersion: 1
 *    - Isso faz com que o n8n não injete o Custom API Call na interface
 *
 * Camadas adicionais de proteção:
 * 1. A descrição abaixo está como array vazio
 * 2. No router.ts, há verificações para interceptar tentativas de uso
 * 3. A função execute abaixo retorna um array vazio para evitar erros
 */

// Removendo a descrição da operação customApiCall para que ela não apareça na interface
export const description = [];

/**
 * Função de execução para Custom API Call
 * Esta função é intencionalmente vazia e retorna um array vazio
 * Ela existe apenas para evitar erros caso o Custom API Call seja selecionado
 */
export async function execute(
  this: IExecuteFunctions,
  _items: INodeExecutionData[]
): Promise<INodeExecutionData[][]> {
  // Log usando o logger do n8n ao invés de console.log
  this.logger.warn('Tentativa de usar Custom API Call no nó Hotmart. Esta funcionalidade está desativada.');
  
  // Retorna um array vazio para evitar erros
  // Não execute nenhuma operação real aqui
  this.logger.warn(
    'Tentativa de usar Custom API Call no nó Hotmart. Esta funcionalidade está desativada.'
  );
  return [[]];
}
