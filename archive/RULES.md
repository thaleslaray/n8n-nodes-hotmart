# RULES.md

Este documento estabelece as diretrizes técnicas e gerais para o desenvolvimento da integração do Node Hotmart com o Model Context Protocol (MCP). Estas regras garantem consistência, qualidade e alinhamento com os requisitos do projeto.

## Visão Geral do Projeto

Este projeto visa transformar o node Hotmart existente para n8n em uma ferramenta compatível com Model Context Protocol (MCP), permitindo que infoprodutores sem conhecimento técnico interajam com a plataforma Hotmart através de linguagem natural via modelos de IA como Claude. Esta integração democratizará o acesso à automação da Hotmart, possibilitando que usuários não-técnicos possam gerenciar assinaturas, vendas, produtos e outros recursos através de interações conversacionais com assistentes de IA.

## 1. Tecnologias e Stack

### 1.1. Tecnologias Principais

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| TypeScript | 4.6.4 | Linguagem principal de desenvolvimento |
| Node.js | 14.x | Ambiente de execução |
| n8n Workflow | 1.0.1 | Framework para nós n8n |
| n8n Core | 1.0.1 | Core do n8n |
| OAuth2 | 2.0 | Autenticação com API Hotmart |
| API Hotmart | Atual | API para interação com plataforma Hotmart |
| Model Context Protocol | Atual | Protocolo para integração com IA |

### 1.2. Requisitos Técnicos

- **Compatibilidade com n8n**: O código deve ser compatível com n8n versão 0.214.0 ou superior
- **Compatibilidade com MCP**: O código deve seguir as especificações atuais do Model Context Protocol
- **Modelo OAuth2**: Manter o modelo de autenticação OAuth2 existente para API Hotmart
- **Server-Sent Events (SSE)**: Suportar SSE para comunicação assíncrona via MCP

### 1.3. Ferramentas e Utilitários

- **Compilação**: Usar `tsc` para compilação de TypeScript
- **Desenvolvimento**: Utilizar `tsc --watch` para desenvolvimento contínuo
- **Testes**: Implementar testes unitários com framework já utilizado no projeto
- **Lint**: Seguir regras de linting existentes no projeto

## 2. Preferências Técnicas

### 2.1. Convenções de Nomenclatura

#### 2.1.1. Arquivos e Diretórios

- **Arquivos de Nós**: `[NomeDaClasse].node.ts`
- **Arquivos de Credenciais**: `[NomeDaAPI].credentials.ts`
- **Arquivos de Recursos**: `[Recurso].resource.ts`
- **Arquivos de Operações**: `[operacao].operation.ts`
- **Arquivos de Tipos**: `[contexto].types.ts`
- **Arquivos de Helpers**: `[funcionalidade].ts`

#### 2.1.2. Convenções de Código

- **Classes**: PascalCase (ex: `HotmartV1`)
- **Interfaces/Types**: PascalCase com prefixo `I` para interfaces (ex: `INodeTypeDescription`)
- **Variáveis e Funções**: camelCase (ex: `getNodeParameter`)
- **Constantes**: SNAKE_CASE_MAIÚSCULO (ex: `DEFAULT_TIMEOUT`)
- **Enums**: PascalCase para o nome do enum, PascalCase para valores (ex: `WebhookEventTypes.PurchaseApproved`)
- **Propriedades MCP**: camelCase para propriedades relacionadas ao MCP (ex: `usableAsTool`)

### 2.2. Organização do Código

- **Estrutura Modular**: Manter a estrutura existente de diretórios por recurso
- **Separação de Responsabilidades**: Manter recursos, operações, helpers e transport em módulos separados
- **Localização de MCP**: Implementar mudanças MCP nos níveis apropriados sem duplicação

```
nodes/
  Hotmart/
    Hotmart.node.ts              # Propriedade usableAsTool aqui
    hotmart.svg                  # Ícone
    HotmartTrigger.node.ts       # Propriedade usableAsTool se aplicável
    v1/
      HotmartV1.node.ts          # Passar propriedade usableAsTool
      actions/                   # Recursos e operações
        [recurso]/               # Um diretório por recurso (subscription, sales, etc.)
          [Recurso].resource.ts  # Classe de recurso
          [operacao].operation.ts # Implementação de operação
      helpers/                   # Funções auxiliares
      transport/                 # Camada de comunicação HTTP
```

### 2.3. Padrões Arquiteturais

- **Versioned Node Type**: Manter o padrão de nó versionado existente
- **Resource-Operation**: Continuar organizando código por recursos e operações
- **Descrição Extensiva**: Ampliar descrições para compatibilidade com MCP
- **Tratamento de Erros em Camadas**: Implementar tratamento de erros específico para MCP na camada apropriada

### 2.4. Manipulação de Dados e Estado

- **Imutabilidade**: Preferir padrões imutáveis para manipulação de dados
- **Type Safety**: Utilizar tipos TypeScript para garantir segurança de tipos
- **Validação de Entrada**: Validar entradas em todas as funções públicas
- **Formato de Saída MCP**: Seguir estrutura JSON-RPC 2.0 para respostas MCP:

```typescript
{
  content: [
    {
      type: 'text',
      text: 'Conteúdo da resposta'
    }
  ],
  isError: false
}
```

### 2.5. Interações com API

- **Reutilização**: Utilizar a camada de transporte existente para chamadas à API Hotmart
- **Tratamento de Erros**: Capturar e formatar erros de API no formato esperado pelo MCP
- **Paginação**: Manter suporte a paginação automática para grandes conjuntos de dados
- **Rate Limiting**: Respeitar limites de taxa da API Hotmart e implementar estratégias de retry
- **Timeout**: Implementar timeouts apropriados para todas as chamadas de API

### 2.6. Desempenho

- **Processamento Eficiente**: Minimizar overhead de processamento adicional para MCP (<100ms)
- **Lazy Loading**: Utilizar lazy loading para recursos grandes quando aplicável
- **Caching**: Implementar caching de dados frequentemente acessados quando apropriado
- **Paralelização**: Utilizar Promise.all para requisições paralelas independentes

### 2.7. Segurança

- **Validação de Entrada MCP**: Validar rigorosamente todas as entradas provenientes de modelos de IA
- **Prevenção de Injeção**: Sanitizar entradas para prevenir injeção de código
- **Proteção de Credenciais**: Garantir que credenciais não sejam expostas em mensagens de erro
- **Operações Destrutivas**: Implementar confirmações explícitas para operações destrutivas
- **Escopo de Acesso**: Limitar escopo de acesso concedido aos assistentes de IA

## 3. Padrões de Desenvolvimento

### 3.1. Testes

- **Cobertura**: Implementar testes para todas as novas funcionalidades MCP
- **Casos de Teste**: Incluir testes para casos de uso de linguagem natural
- **Testes de Integração**: Testar integração com MCP Server Trigger
- **Testes de Regressão**: Garantir que funcionalidades existentes continuem funcionando
- **Mocking**: Usar mocks para testes de integração com API Hotmart

### 3.2. Documentação

- **Descrições**: Atualizar descrições de todas as operações para serem detalhadas e úteis para IA
- **JSDoc**: Documentar todas as funções públicas com JSDoc
- **README**: Atualizar o README com instruções para uso MCP
- **Exemplos**: Incluir exemplos de uso em linguagem natural para cada operação
- **Esquema MCP**: Documentar o esquema MCP para cada operação

#### 3.2.1. Exemplo de Descrição Aprimorada

```typescript
// Antes
description: 'Obtém todas as assinaturas',

// Depois
description: 'Recupera uma lista completa ou filtrada de assinaturas na plataforma Hotmart. Use esta operação quando precisar visualizar todas as assinaturas, filtrar por status (ativas, canceladas, atrasadas, etc.) ou buscar uma assinatura específica. Útil para análise de receita recorrente, identificação de clientes para renovação, ou verificação do estado atual de assinantes. Suporta paginação para grandes conjuntos de dados.',
```

### 3.3. Tratamento de Erros

- **Formato MCP**: Retornar erros no formato esperado pelo MCP
- **Mensagens Claras**: Fornecer mensagens de erro claras, informativas e orientadas a soluções
- **Granularidade**: Distinguir entre diferentes tipos de erros (validação, API, autenticação)
- **Contextualização**: Incluir informações de contexto em mensagens de erro
- **Código de Erro**: Incluir código de erro quando disponível

#### 3.3.1. Exemplo de Tratamento de Erro MCP

```typescript
try {
  // Lógica de execução
} catch (error) {
  return {
    content: [
      {
        type: 'text',
        text: `Erro ao acessar API Hotmart: ${error.message}. Verifique as credenciais e tente novamente. Código de erro: ${error.code || 'N/A'}`
      }
    ],
    isError: true
  };
}
```

### 3.4. Logging

- **Contexto**: Incluir contexto suficiente em mensagens de log
- **Níveis**: Utilizar níveis apropriados (debug, info, warn, error)
- **Performance**: Evitar logging excessivo em caminhos críticos de desempenho
- **Informações Sensíveis**: Nunca logar credenciais ou informações sensíveis

### 3.5. Acessibilidade e Internacionalização

- **Mensagens em Português**: Manter mensagens de interface em português para o público-alvo (infoprodutores brasileiros)
- **Suporte a Múltiplas Variações**: Assegurar que o sistema entenda variações linguísticas e regionais nos comandos

## 4. Prioridades de Implementação

### 4.1. Sequência de Desenvolvimento

1. **Fundação MCP**: Implementar propriedades básicas `usableAsTool` e estrutura MCP
2. **Melhorias de Descrições**: Aprimorar descrições para todos os recursos e operações
3. **Core API Integration**: Adaptar funcionalidades de maior prioridade (assinaturas, vendas)
4. **Tratamento de Entrada/Saída**: Implementar processamento de comandos em linguagem natural
5. **Funcionalidades Adicionais**: Implementar recursos secundários (cupons, área de membros)
6. **Testes e Documentação**: Finalizar testes e documentação

### 4.2. Prioridades por Categoria

- **Must Have**: Propriedade usableAsTool, descrições aprimoradas, tratamento de erros MCP, funções de assinaturas e vendas
- **Should Have**: Exemplos em linguagem natural, reconhecimento de padrões de comandos, cupons e área de membros
- **Could Have**: Funções analíticas avançadas, tickets/eventos
- **Won't Have**: Novas funcionalidades API, integrações externas, suporte dedicado

### 4.3. Critérios de Qualidade

- **Taxa de Sucesso**: 90% de taxa de sucesso na interpretação de comandos comuns em linguagem natural
- **Regressão Zero**: Nenhuma regressão em funcionalidade existente
- **Cobertura de Testes**: Mínimo de 80% de cobertura para novo código
- **Documentação Completa**: Todas as funções e parâmetros documentados

## 5. Diretrizes Gerais

### 5.1. Aderência aos Requisitos

- **Precisão**: Seguir exatamente o que está especificado no PRD e lista de features
- **Validação**: Verificar implementação contra critérios de aceitação
- **Consulta**: Em caso de ambiguidade, solicitar esclarecimento antes de implementar

### 5.2. Qualidade de Código

- **Legibilidade**: Escrever código claro e auto-explicativo
- **DRY**: Não repetir código - extrair funções comuns
- **SOLID**: Seguir princípios SOLID quando aplicável
- **Simplicidade**: Preferir abordagens simples a complexas quando possível
- **Comentários**: Comentar apenas o não-óbvio e decisões de design importantes

### 5.3. Completude

- **Sem TODO**: Não deixar comentários TODO no código final
- **Sem Placeholders**: Implementar completamente todas as funções
- **Produtos Finalizados**: Entregar componentes prontos para uso em produção
- **Testes Completos**: Incluir testes para todos os novos recursos

### 5.4. Comunicação

- **Questões Técnicas**: Para dúvidas técnicas, consultar documentação do n8n e MCP
- **Ambiguidades**: Para ambiguidades nos requisitos, solicitar esclarecimento
- **Bloqueadores**: Reportar bloqueadores imediatamente

### 5.5. Lidando com Incertezas

- **Documentação Oficial**: Consultar documentação oficial do n8n, TypeScript e MCP
- **Abordagem Conservadora**: Em caso de dúvida, escolher a abordagem mais segura
- **Decisões Documentadas**: Documentar decisões tomadas em caso de incerteza

## 6. Exemplos e Padrões

### 6.1. Implementação da Propriedade usableAsTool

```typescript
// Em Hotmart.node.ts
export class Hotmart extends VersionedNodeType {
  constructor() {
    const baseDescription: INodeTypeBaseDescription = {
      displayName: 'Hotmart',
      name: 'hotmart',
      icon: 'file:hotmart.svg',
      group: ['transform'],
      description: 'Interagir com a API Hotmart para gerenciar produtos, assinaturas, vendas e outras operações da plataforma de produtos digitais. Use para automatizar consultas de vendas, gerenciar assinaturas, criar cupons e acessar dados da área de membros.',
      defaultVersion: 1,
      // Adicionar propriedade usableAsTool
      usableAsTool: true,
    };

    const nodeVersions = {
      1: new HotmartV1(baseDescription),
    };

    super(nodeVersions, baseDescription);
  }
}
```

### 6.2. Exemplo de Descrição de Operação Aprimorada

```typescript
{
  displayName: 'Obter Assinaturas',
  name: 'getAll',
  description: 'Recupera uma lista de assinaturas na plataforma Hotmart. Use esta operação quando precisar visualizar todas as assinaturas, filtrar por status (ativas, canceladas, atrasadas, etc.) ou buscar uma assinatura específica. Útil para análise de receita recorrente, identificação de clientes para renovação, ou verificação do estado atual de assinantes. Suporta paginação para grandes conjuntos de dados.',
  // ...
}
```

### 6.3. Exemplo de Descrição de Parâmetro Aprimorada

```typescript
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  options: [
    {
      name: 'Ativa',
      value: 'ACTIVE',
      description: 'Assinaturas que estão sendo cobradas normalmente e têm acesso ao produto',
    },
    {
      name: 'Cancelada',
      value: 'CANCELLED',
      description: 'Assinaturas que foram terminadas pelo cliente ou pelo vendedor',
    },
    // ...outras opções
  ],
  default: 'ACTIVE',
  description: 'Filtre as assinaturas por seu status atual. Use "Ativa" para ver assinaturas em cobrança normal, "Atrasada" para pagamentos pendentes, ou "Cancelada" para assinaturas terminadas. Você pode selecionar "Todos" para ver assinaturas em qualquer estado.',
}
```

### 6.4. Tratamento de Erro MCP

```typescript
try {
  // Chama o método da API de assinaturas
  return await getSubscriptions(subscriptionId, additionalFields);
} catch (error) {
  if (error.response && error.response.status === 404) {
    return {
      content: [
        {
          type: 'text',
          text: `Assinatura com ID ${subscriptionId} não encontrada. Verifique se o ID está correto e tente novamente.`
        }
      ],
      isError: true
    };
  } else if (error.response && error.response.status === 401) {
    return {
      content: [
        {
          type: 'text',
          text: `Erro de autenticação ao acessar assinaturas. Verifique se suas credenciais Hotmart estão válidas e têm as permissões necessárias.`
        }
      ],
      isError: true
    };
  } else {
    return {
      content: [
        {
          type: 'text',
          text: `Erro ao acessar assinaturas na Hotmart: ${error.message}. Código de erro: ${error.code || 'N/A'}`
        }
      ],
      isError: true
    };
  }
}
```

## 7. Considerações Especiais para MCP

### 7.1. Descrições para IA

- **Contexto**: Incluir contexto claro sobre quando e por que usar cada operação
- **Instrutivo**: Fornecer orientação sobre o uso apropriado da função
- **Exemplos**: Incluir exemplos de valores ou casos de uso quando relevante
- **Completude**: Cobrir todos os aspectos importantes da funcionalidade
- **Linguagem Natural**: Usar linguagem conversacional mas precisa

### 7.2. Tratamento de Comandos em Linguagem Natural

- **Flexibilidade**: Reconhecer variações naturais de comandos
- **Extração de Parâmetros**: Extrair valores de descrições em texto livre
- **Resolução de Ambiguidades**: Solicitar esclarecimentos quando necessário
- **Interpretação de Tempo**: Converter expressões temporais em datas específicas
- **Entidades Nomeadas**: Reconhecer produtos, cupons e outros objetos por nome

### 7.3. Formatação de Resposta para Assistentes de IA

- **Estrutura Clara**: Formatar respostas de maneira estruturada e fácil de processar
- **Priorização**: Destacar informações mais importantes primeiro
- **Síntese**: Fornecer resumos para grandes conjuntos de dados
- **Contexto**: Incluir contexto suficiente em respostas para serem compreensíveis
- **Metadados**: Incluir metadados relevantes para ajudar na interpretação