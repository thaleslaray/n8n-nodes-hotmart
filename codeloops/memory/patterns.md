# 📋 Padrões Estabelecidos - n8n-hotmart

## Estrutura de Arquivos
- Sempre usar: `nodes/Hotmart/v1/actions/[resource]/[operation].operation.ts`
- Recurso em PascalCase: `Sales`, `Product`, `Subscription`
- Operação em camelCase: `getAll`, `create`, `update`

## Padrões de Código

### 1. Estrutura de Execute Function
```typescript
export const execute: INodeExecuteFunctions = async function (
  this: INodeExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
  const returnData: INodeExecutionData[] = [];
  const resource = this.getNodeParameter('resource', 0) as string;
  const operation = this.getNodeParameter('operation', 0) as string;
  
  // Implementação aqui
  
  return [returnData];
}
```

### 2. Chamadas API
```typescript
// SEMPRE usar hotmartApiRequest
const response = await hotmartApiRequest.call(
  this,
  'GET',
  '/sales/history',
  {},
  qs
);
```

### 3. Paginação
```typescript
// Para listagens, SEMPRE implementar getAllItems
if (returnAll) {
  returnData.push(...await getAllItems.call(
    this,
    'items',
    '/sales/history'
  ));
}
```

### 4. Tratamento de Erros
```typescript
try {
  // código
} catch (error) {
  throw new NodeApiError(this.getNode(), error);
}
```

### 5. Tipos
- Sempre definir interfaces para responses
- Usar tipos do n8n-workflow
- Evitar `any`

## Decisões Importantes
1. Usar `description` objects separados para organização
2. Implementar `returnAll` em todas as listagens
3. Datas sempre em formato ISO 8601
4. IDs sempre como string, não number