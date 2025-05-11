# Implementação de Renomeação Dinâmica de Outputs em Nós Personalizados n8n

## Contexto do Problema

No n8n, quando criamos nós personalizados com múltiplas saídas, precisamos permitir que o usuário possa personalizar os nomes dessas saídas para uma melhor experiência de uso. No caso do nó **HotmartRouter**, encontramos um desafio: mesmo tendo os campos para personalizar os nomes das saídas, esses nomes personalizados não estavam sendo refletidos na interface de workflow do n8n.

## Causa do Problema

A implementação original usava uma abordagem estática para definir as saídas:

```typescript
outputs: ['main', 'main'],
outputNames: ['Aprovada', 'Outros'],
```

E embora tivéssemos campos na interface para personalizar os nomes:

```typescript
{
  displayName: 'Nome para Saída de Compra Aprovada',
  name: 'outputName0',
  type: 'string',
  default: 'Aprovada',
  // ...
},
{
  displayName: 'Nome para Saída de Outros Eventos',
  name: 'outputName1',
  type: 'string',
  default: 'Outros',
  // ...
},
```

O problema é que não havia conexão entre esses campos de personalização e a definição real dos nomes das saídas na propriedade `outputNames`. Os valores inseridos pelo usuário não estavam sendo aplicados aos nomes das saídas na interface do n8n.

## Solução Implementada

Após analisar o código do nó Switch do n8n, identificamos que a forma correta de implementar essa funcionalidade é:

1. Usar uma função que gera dinamicamente as saídas com seus respectivos displayNames
2. Injetar essa função na propriedade `outputs` usando uma expressão JavaScript

### Implementação da Solução

1. Criamos uma função `configureOutputNames` que gera as saídas com base nos parâmetros:

```typescript
const configureOutputNames = (parameters: INodeParameters) => {
  const customizeOutputs = parameters.customizeOutputs as boolean;
  
  if (customizeOutputs) {
    return [
      {
        type: 'main',
        displayName: parameters.outputName0 || 'Aprovada',
      },
      {
        type: 'main',
        displayName: parameters.outputName1 || 'Outros',
      },
    ];
  } else {
    return [
      {
        type: 'main',
        displayName: 'Aprovada',
      },
      {
        type: 'main',
        displayName: 'Outros',
      },
    ];
  }
};
```

2. Substituímos as definições estáticas por uma expressão JavaScript que usa essa função:

```typescript
outputs: `={{(${configureOutputNames})($parameter)}}`,
```

3. Removemos a propriedade `outputNames` pois agora os nomes estão sendo definidos diretamente na configuração de cada saída.

## Como Funciona

1. Quando o nó é inicializado, o n8n executa a expressão JavaScript na propriedade `outputs`
2. A função `configureOutputNames` é chamada com os parâmetros atuais do nó
3. A função determina se a personalização está ativada verificando `parameters.customizeOutputs`
4. Se ativada, usa os valores inseridos pelo usuário (`parameters.outputName0` e `parameters.outputName1`)
5. Se não, usa os nomes padrão ("Aprovada" e "Outros")
6. A função retorna um array com objetos definindo cada saída, incluindo seu tipo e nome de exibição
7. O n8n usa essas definições para renderizar as saídas na interface com os nomes corretos

## Comparação com o Switch Node

O nó Switch do n8n usa uma abordagem similar, mas mais sofisticada:

1. Tem uma função `configuredOutputs` que gera as saídas com base no modo (rules ou expression)
2. No modo "rules", gera um output para cada regra definida
3. Permite fallback outputs configuráveis
4. Suporta renomeação de cada saída individualmente

Nossa implementação segue o mesmo princípio, mas de forma mais simples, apenas para resolver o caso específico do HotmartRouter com duas saídas fixas.

## Lições Aprendidas

1. Os nomes de outputs no n8n precisam ser definidos dinamicamente usando expressões JavaScript para permitir personalização
2. A propriedade `outputs` deve retornar um array de objetos com `type` e `displayName`
3. Para acessar os parâmetros do nó dentro da expressão, use `$parameter`
4. As funções injetadas via expressão são transpiladas e executadas dentro do ambiente do n8n

## Referências

- Implementação do Switch node no n8n v3: `/Users/thaleslaray/Code/docs/n8n/packages/nodes-base/nodes/Switch/V3/SwitchV3.node.ts`
- Documentação n8n sobre nós personalizados: [https://docs.n8n.io/integrations/creating-nodes/](https://docs.n8n.io/integrations/creating-nodes/)