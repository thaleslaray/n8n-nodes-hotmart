# PRD: Integração do Node Hotmart com MCP

## Visão Geral

Este documento apresenta o plano de produto para transformar o node Hotmart existente para n8n em uma ferramenta compatível com Model Context Protocol (MCP). Esta integração permitirá que usuários sem conhecimento técnico em automação interajam com a plataforma Hotmart através de linguagem natural via modelos de IA como Claude, abstraindo a complexidade técnica da API Hotmart.

O objetivo principal é democratizar o acesso à automação da Hotmart, permitindo que infoprodutores possam realizar consultas, gerenciar assinaturas, analisar vendas e obter insights comerciais através de conversas naturais com assistentes de IA, sem necessidade de conhecimento técnico em programação ou APIs.

## Metas e Objetivos

### Objetivos Principais
- Transformar o atual node Hotmart em uma ferramenta compatível com MCP
- Permitir que usuários não-técnicos interajam com a Hotmart via linguagem natural
- Preservar todas as funcionalidades existentes do node Hotmart
- Ser o primeiro no mercado a oferecer integração MCP para a plataforma Hotmart

### Métricas de Sucesso
- Implementação bem-sucedida da propriedade `usableAsTool` e descrições detalhadas
- Funcionalidade comprovada com pelo menos 10 testes de casos de uso diferentes
- Capacidade de processar comandos em linguagem natural e convertê-los em operações da API Hotmart

## Escopo

### Dentro do Escopo
- Adicionar compatibilidade MCP ao node Hotmart existente
- Melhorar as descrições de todas as operações e parâmetros para orientar modelos de IA
- Garantir que todas as funcionalidades existentes sejam acessíveis via MCP
- Implementar adaptações necessárias para manipulação de entrada/saída no formato MCP
- Documentação para usuários finais sobre como usar o node com MCP

### Fora do Escopo (Fase Inicial)
- Desenvolvimento de novas funcionalidades para a API Hotmart
- Integração com serviços de notificação (WhatsApp, email)
- Suporte técnico pós-lançamento
- Mudanças na estrutura fundamental do node Hotmart

## Público-Alvo

### Usuários Primários: Infoprodutores
- **Perfil**: Criadores de conteúdo digital, educadores online, vendedores de produtos digitais
- **Características**: Baixo conhecimento técnico em programação e automação
- **Necessidades**: Gerenciar seus produtos, assinaturas e vendas na Hotmart de forma simples
- **Pontos de dor**: Dificuldade em utilizar APIs técnicas, necessidade de contratar desenvolvedores para automações simples

### Usuários Secundários
- **Assistentes Virtuais/Analistas**: Pessoas que auxiliam infoprodutores na gestão de suas operações
- **Marketing Digital**: Profissionais que gerenciam campanhas para produtos na Hotmart
- **Desenvolvedores**: Que desejam criar experiências de IA para clientes que usam Hotmart

## Requisitos Funcionais

### Modificações Principais ao Node Hotmart
1. **Adição da propriedade usableAsTool**
   - Implementar a propriedade `usableAsTool: true` na descrição do node Hotmart
   - Adicionar a mesma propriedade na classe HotmartV1 e HotmartTrigger conforme necessário

2. **Melhorias nas Descrições**
   - Aprimorar as descrições de todas as operações para serem mais compreensíveis por IA
   - Fornecer detalhes claros sobre quando e como cada operação deve ser usada
   - Incluir exemplos em descrições de parâmetros complexos

3. **Adaptações de Formato**
   - Garantir que o node processe corretamente entradas em formato MCP
   - Adaptar o formato de saída para seguir as convenções MCP
   - Implementar tratamento adequado de erros no formato MCP

### Funcionalidades Hotmart a Serem Compatíveis com MCP

#### Assinaturas
- Obter todas as assinaturas
- Cancelar assinaturas
- Alterar dia de cobrança
- Reativar assinaturas
- Obter sumário de assinaturas
- Obter transações de assinaturas

#### Vendas
- Obter histórico de vendas
- Visualizar resumo de vendas
- Verificar comissões
- Solicitar reembolsos
- Obter detalhamento de preços

#### Produtos
- Listar produtos disponíveis

#### Cupons
- Criar, obter e excluir cupons

#### Área de Membros (Club)
- Obter dados de alunos
- Verificar módulos e páginas
- Analisar progresso de alunos

#### Outros Recursos
- Funcionalidades de Tickets/Eventos
- Ferramentas de negociação

## Requisitos Não-Funcionais

### Compatibilidade
- O node deve funcionar com n8n versão 0.214.0 ou superior
- Necessária ativação da variável de ambiente `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`
- Compatibilidade garantida com modelos Claude e outros que implementam MCP

### Usabilidade
- As descrições devem ser claras o suficiente para que modelos de IA compreendam o contexto
- O fluxo de trabalho deve permitir operações em linguagem natural intuitiva
- Mensagens de erro devem ser informativas e orientadas a soluções

### Desempenho
- O node deve manter o mesmo nível de desempenho após a implementação MCP
- Tempos de resposta similares aos do node atual

### Segurança
- Manter o mesmo modelo de segurança OAuth2 do node atual
- Validação adequada de entradas fornecidas por IA

## Jornadas do Usuário

### Jornada 1: Consulta de Assinaturas Ativas
1. Usuário pergunta ao assistente de IA: "Quais são minhas assinaturas ativas na Hotmart?"
2. IA identifica a intenção e utiliza o node Hotmart via MCP
3. O node executa a operação "Obter Assinaturas" com o filtro status=ACTIVE
4. Resultados são retornados à IA que os formata de modo compreensível
5. Usuário recebe uma lista formatada de suas assinaturas ativas

### Jornada 2: Análise de Vendas Recentes
1. Usuário pergunta: "Como foram minhas vendas na última semana?"
2. IA entende a consulta e determina o período (última semana)
3. IA usa o node Hotmart para obter histórico e sumário de vendas
4. O node retorna dados das vendas no período especificado
5. IA processa e apresenta um relatório resumido com tendências importantes

### Jornada 3: Gerenciamento de Cupons
1. Usuário solicita: "Crie um cupom de 20% de desconto para meu curso de marketing digital"
2. IA identifica o produto com base na descrição
3. IA utiliza o node Hotmart para criar um novo cupom
4. O node executa a operação e retorna detalhes do cupom criado
5. IA confirma a criação e apresenta os detalhes do cupom ao usuário

## Especificações Técnicas

### Modificações no Código

#### 1. Atualização da Classe Hotmart.node.ts
```typescript
export class Hotmart extends VersionedNodeType {
  constructor() {
    const baseDescription: INodeTypeBaseDescription = {
      displayName: 'Hotmart',
      name: 'hotmart',
      icon: 'file:hotmart.svg',
      group: ['transform'],
      description: 'Interagir com a API Hotmart para gerenciar produtos, assinaturas, vendas e outras operações',
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

#### 2. Melhorias nas Descrições de Operações (exemplo)
```typescript
// Antes
{
  displayName: 'Obter Assinaturas',
  name: 'getAll',
  description: 'Obtém todas as assinaturas',
  // ...
}

// Depois
{
  displayName: 'Obter Assinaturas',
  name: 'getAll',
  description: 'Recupera uma lista de assinaturas na plataforma Hotmart. Use esta operação quando precisar visualizar todas as assinaturas, filtrar por status (ativas, canceladas, etc.) ou buscar uma assinatura específica. Suporta paginação para grandes conjuntos de dados.',
  // ...
}
```

#### 3. Tratamento de Erros Aprimorado
```typescript
try {
  // Lógica de execução
} catch (error) {
  // Formato de erro específico para MCP
  return {
    content: [
      {
        type: 'text',
        text: `Erro ao acessar API Hotmart: ${error.message}. Verifique as credenciais e tente novamente.`
      }
    ],
    isError: true
  };
}
```

### Fluxo de Integração com MCP Server Trigger

1. Cliente MCP (Claude) conecta-se ao MCP Server Trigger no n8n
2. MCP Server envia lista de ferramentas disponíveis, incluindo o node Hotmart
3. Claude apresenta a ferramenta Hotmart como disponível para o usuário
4. Usuário faz uma solicitação em linguagem natural
5. Claude converte a solicitação em uma chamada estruturada para o node Hotmart
6. Node Hotmart processa a solicitação e devolve resultados
7. Claude formata e apresenta os resultados para o usuário

## Implementação

### Etapas de Implementação

1. **Fase 1: Preparação (1-2 dias)**
   - Análise do código atual do node Hotmart
   - Definição detalhada das descrições para todas as operações
   - Planejamento das adaptações necessárias

2. **Fase 2: Implementação da Compatibilidade MCP (3-5 dias)**
   - Adição da propriedade `usableAsTool`
   - Implementação das melhorias nas descrições
   - Adaptação dos formatos de entrada/saída

3. **Fase 3: Testes (2-3 dias)**
   - Testes com MCP Server Trigger
   - Verificação da descoberta de ferramentas
   - Testes de integração com Claude

4. **Fase 4: Documentação e Finalização (1-2 dias)**
   - Atualização do README
   - Criação de exemplos de uso
   - Preparação para distribuição

### Considerações de Implementação

- Uso de comentários `// @ts-ignore` se necessário para propriedade `usableAsTool`
- Garantir que todas as descrições sejam detalhadas e úteis para IA
- Manter compatibilidade com a implementação atual

## Métricas de Sucesso

### Critérios de Aceitação

- O node Hotmart é descoberto corretamente pelo MCP Server Trigger
- Todas as operações existentes funcionam via MCP
- Comandos em linguagem natural são interpretados corretamente
- Respostas são formatadas de maneira útil para o usuário final

### KPIs

- Funcionalidade completa demonstrada com sucesso
- Capacidade de processar solicitações complexas em linguagem natural
- Manutenção da performance comparável ao node original

## Limitações e Considerações

- Requer a variável de ambiente `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` ativada
- O desempenho pode variar dependendo do modelo de IA utilizado
- A interpretação de linguagem natural depende da capacidade do modelo de IA

## Conclusão

A integração do node Hotmart com MCP representa uma oportunidade significativa para democratizar o acesso às funcionalidades da plataforma Hotmart. Esta implementação permitirá que usuários com pouco conhecimento técnico gerenciem suas operações na Hotmart através de interações em linguagem natural com assistentes de IA, eliminando a necessidade de entender APIs ou programação.

Como primeiro no mercado a oferecer esta capacidade, este projeto tem potencial para criar valor significativo para infoprodutores e estabelecer um novo padrão para interações com plataformas de produtos digitais.