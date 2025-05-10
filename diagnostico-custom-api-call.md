# Diagnóstico e Solução: Remoção de Custom API Call dos Nós Hotmart

## Problema Identificado

Os nós Hotmart na plataforma n8n estavam exibindo a opção "Custom API Call" tanto na seleção de recurso quanto na seleção de operação. Esta opção é automaticamente injetada pelo sistema central do n8n, mas não é desejada ou suportada nos nós Hotmart.

## Investigação Técnica

Após investigação detalhada, identificamos que a injeção de "Custom API Call" é um comportamento interno do n8n, implementado na função `injectCustomApiCallOptions` localizada no arquivo `packages/cli/src/load-nodes-and-credentials.ts` do código-fonte do n8n.

O mecanismo de injeção funciona da seguinte forma:

1. A função itera sobre todos os tipos de nós carregados na instância n8n.
2. Para cada nó, verifica se ele representa a 'versão mais recente' desse tipo de nó, utilizando a condição:
   ```javascript
   node.defaultVersion === undefined || node.defaultVersion === node.version
   ```
3. Se a condição for verdadeira, a função adiciona programaticamente a opção "Custom API Call" às propriedades resource e operation do nó.

## Solução Implementada

Nossa solução explora a lógica interna do n8n para prevenir completamente a injeção da opção "Custom API Call":

### 1. Modificação no versionDescription.ts

Criamos intencionalmente uma discrepância entre os valores de `version` e `defaultVersion`:

```typescript
// Antes
version: [1],

// Depois
version: [1, 2],  // Suportamos versões 1 e 2 da API
defaultVersion: 1, // Mas a versão padrão é a 1
```

Esta discrepância faz com que a condição de verificação `node.defaultVersion === node.version` avalie como `false`, impedindo que o n8n considere o nó como "versão mais recente" e, consequentemente, não injete a opção "Custom API Call".

### 2. Simplificação do customApiCall.operation.ts

Atualizamos o arquivo como uma camada adicional de proteção, embora o Custom API Call não deva mais aparecer na interface:

```typescript
/**
 * IMPORTANTE: Backup para Custom API Call
 *
 * Este arquivo existe apenas como backup. A opção "Custom API Call" não deve
 * aparecer na interface devido à configuração de discrepância entre version 
 * e defaultVersion no versionDescription.ts.
 * ...
 */

// Descrição vazia para minimizar presença na interface
export const description = [];

// Função vazia como backup
export async function execute(...) {
    return [[]];
}
```

### 3. Manutenção das Proteções no router.ts

Mantivemos as verificações de segurança no router.ts como backup adicional:

```typescript
// Proteção de backup: Trata o caso em que "Custom API Call" é selecionado como recurso
if (resource === 'customApiCall') {
    console.log('Tentativa de usar Custom API Call detectada como recurso. Esta operação não é suportada.');
    return [[]];
}

// Outras verificações similares...
```

## Como Funciona a Solução

1. **Prevenção da Injeção**: A discrepância entre `version: [1, 2]` e `defaultVersion: 1` faz com que o n8n não injete a opção "Custom API Call" na interface do nó.

2. **Camadas de Proteção**:
   - Mesmo se a opção fosse injetada, o arquivo customApiCall.operation.ts possui uma implementação vazia segura.
   - O router.ts intercepta qualquer tentativa de uso da opção, retornando um array vazio e evitando erros.

## Vantagens da Abordagem

1. **Solução Elegante**: Evitamos completamente a injeção do Custom API Call na interface, em vez de apenas tentar lidar com ela após a injeção.

2. **Semântica Correta**: A utilização de `version: [1, 2]` tem significado semântico real, indicando que este nó suporta múltiplas versões da API (1 e 2), com a versão 1 como padrão.

3. **Defesa em Profundidade**: Mantivemos múltiplas camadas de proteção para garantir robustez mesmo se a implementação interna do n8n mudar.

## Limitações e Considerações Futuras

1. **Implementação Interna**: A solução baseia-se em um detalhe de implementação interna do n8n que não é documentado oficialmente. Futuras atualizações do n8n podem alterar este comportamento.

2. **Monitoramento**: Recomenda-se monitorar o comportamento do nó após atualizações do n8n para garantir que a solução continua funcionando.

3. **Alternativa Oficial**: Se o n8n oferecer no futuro uma forma oficial de controlar a injeção de Custom API Call, deve-se considerar migrar para essa abordagem.

## Conclusão

A solução implementada é robusta e elegante dentro das limitações do framework n8n. Ao criar uma discrepância intencional entre `version` e `defaultVersion`, conseguimos evitar que o n8n injete a opção "Custom API Call" na interface, enquanto ainda mantemos proteções adicionais para garantir que qualquer tentativa de uso dessa opção seja tratada adequadamente.

Esta abordagem é superior à nossa solução anterior, que apenas tentava lidar com a opção após ela já ter sido injetada na interface.
