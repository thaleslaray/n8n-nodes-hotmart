# Guia de Padronização de Status

## Objetivo
Este guia explica como padronizar a exibição de status em endpoints da integração Hotmart, mantendo o valor em maiúsculo para a API e um texto amigável em português para o usuário.

## Processo

### 1. Identificar o Arquivo
1. Localize o arquivo de operação do endpoint desejado em `nodes/Hotmart/v1/actions/`
2. Verifique se ele importa opções de status do `common.descriptions.ts`
3. Se não existir, crie um novo array de opções no `common.descriptions.ts`

### 2. Estrutura do Array
```typescript
export const nomeDoArrayOptions = [
  {
    name: 'Nome em Português',
    value: 'VALOR_PARA_API',
  },
  // ... outros status
];
```

### 3. Exemplo de Implementação
Para implementar em um novo endpoint:

1. No arquivo `common.descriptions.ts`:
```typescript
export const novoStatusOptions = [
  {
    name: 'Nome Amigável',
    value: 'API_VALUE',
  },
];
```

2. No arquivo da operação:
```typescript
import { novoStatusOptions } from '../common.descriptions';

export const description: INodeProperties[] = [
  {
    displayName: 'Status',
    name: 'status',
    type: 'multiOptions',
    options: novoStatusOptions,
    default: [],
    description: 'Descrição do campo',
  },
];
```

## Boas Práticas
1. Manter consistência nos nomes em português
2. Usar valores em maiúsculo para a API
3. Documentar qualquer caso especial
4. Manter a ordem lógica dos status
5. Garantir que todos os valores correspondam aos aceitos pela API

## Exemplo Real
Como implementado no endpoint "Obter Assinaturas":
```typescript
export const subscriptionStatusOptions = [
  {
    name: 'Iniciada',
    value: 'STARTED',
  },
  {
    name: 'Inativa',
    value: 'INACTIVE',
  },
  // ... outros status
];
```

## Checklist de Implementação
- [ ] Identificar o endpoint alvo
- [ ] Verificar documentação da API para valores aceitos
- [ ] Criar/atualizar array de opções
- [ ] Implementar no arquivo de operação
- [ ] Testar funcionamento
- [ ] Validar textos em português
- [ ] Confirmar valores corretos na API
