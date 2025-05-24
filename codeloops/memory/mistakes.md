# ❌ Erros para Evitar - n8n-hotmart

## 1. Enum Value 0 como Falsy
```typescript
// ❌ ERRADO
if (!event) { 
  // Vai falhar para PURCHASE_OUT_OF_SHOPPING_CART (valor 0)
}

// ✅ CORRETO
if (event === undefined) {
  // Trata undefined corretamente
}
```

## 2. Esquecer Paginação
```typescript
// ❌ ERRADO - Retorna só primeira página
const response = await hotmartApiRequest.call(this, 'GET', '/sales/history');
return response.items;

// ✅ CORRETO - Pega todos os items
if (returnAll) {
  return getAllItems.call(this, 'items', '/sales/history', {});
}
```

## 3. Credenciais Incorretas
```typescript
// ❌ ERRADO
const credentials = this.getCredentials('hotmartApi');

// ✅ CORRETO
const credentials = await this.getCredentials('hotmartOAuth2Api') as IDataObject;
```

## 4. Retorno Incorreto
```typescript
// ❌ ERRADO
return returnData; // Array simples

// ✅ CORRETO
return [returnData]; // Array de arrays
```

## 5. Tipos Genéricos
```typescript
// ❌ ERRADO
const response: any = await hotmartApiRequest...

// ✅ CORRETO
interface SalesResponse {
  items: Sale[];
  page_info: PageInfo;
}
const response: SalesResponse = await...
```

## 6. Parâmetros Hardcoded
```typescript
// ❌ ERRADO
const productId = 'ABC123';

// ✅ CORRETO
const productId = this.getNodeParameter('productId', i) as string;
```

## 7. Logs com Dados Sensíveis
```typescript
// ❌ ERRADO
console.log('User data:', userData); // Pode conter PII

// ✅ CORRETO
this.logger.debug('Processing user', { userId: userData.id });
```