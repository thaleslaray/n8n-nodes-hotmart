import { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';

/**
 * Processa os resultados da API e retorna no formato esperado pelo n8n
 * Usa uma abordagem padronizada para garantir que todos os resultados
 * sejam formatados consistentemente.
 *
 * @param this - Contexto de execução do nó
 * @param items - Array de itens retornados pela API Hotmart
 * @param itemIndex - Índice do item atual na execução
 * @returns Array de objetos INodeExecutionData formatados para o n8n
 */
export function formatOutput<T extends IDataObject = IDataObject>(
  this: IExecuteFunctions,
  items: T[],
  itemIndex: number
): INodeExecutionData[] {
  // Verificar se items é um array válido
  if (!Array.isArray(items)) {
    items = [];
  }

  // Usar a função padrão do n8n para formatar a saída
  // Esta abordagem simples e padronizada evita tentativas de personalização dinâmica
  // que não são suportadas pela API do n8n
  return this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(items), {
    itemData: { item: itemIndex },
  });
}
