# n8n-nodes-hotmart 🤖

![Tests](https://github.com/thaleslaray/n8n-nodes-hotmart/actions/workflows/tests.yml/badge.svg)
![Build](https://github.com/thaleslaray/n8n-nodes-hotmart/actions/workflows/build.yml/badge.svg)
[![codecov](https://codecov.io/gh/thaleslaray/n8n-nodes-hotmart/graph/badge.svg?token=GTWV5GE10X)](https://codecov.io/gh/thaleslaray/n8n-nodes-hotmart)
![npm](https://img.shields.io/npm/v/n8n-nodes-hotmart)
![License](https://img.shields.io/npm/l/n8n-nodes-hotmart)
![Downloads](https://img.shields.io/npm/dm/n8n-nodes-hotmart)
![n8n Node](https://img.shields.io/badge/n8n-community%20node-blue)
![Compatibility](https://img.shields.io/badge/n8n%20compatibility-0.214.0%20to%201.3.0-blue)
![AI Powered](https://img.shields.io/badge/AI%20Powered-🤖-purple)
![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-orange)
![AI Ready](https://img.shields.io/badge/AI%20Ready-✅-green)

**Autor:** [Thales Laray](https://www.escoladeautomacao.com.br/) | [@thaleslaray](https://www.instagram.com/thaleslaray/)

## 🚀 Revolucionário: IA Conversacional para Hotmart

Este pacote contém nós personalizados com **IA conversacional** para integrar a [API Hotmart](https://developers.hotmart.com/docs/pt-BR/) com o [n8n](https://n8n.io/).

### ✨ Funcionalidades Exclusivas:

- 🗣️ **Execute qualquer operação usando comandos em português natural**
- 🤖 **Assistente inteligente** que entende contexto e oferece insights
- 🇧🇷 **Formatação brasileira** automática (datas, moedas, etc.)
- 🧠 **Manutenção de contexto** inteligente entre operações
- 📊 **Recomendações automáticas** baseadas nos dados
- 🔄 **Compatibilidade MCP** para integração com ferramentas de IA
- ✅ **AI Ready** - Totalmente compatível com AI Agents do n8n
- 🚀 **Execução Direta** - Execute sem precisar conectar a outros nodes

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Hotmart_logo.svg/1599px-Hotmart_logo.svg.png" width="150" alt="Logo Hotmart">

A Hotmart é uma plataforma de negócios digitais para criação, hospedagem e venda de produtos digitais e assinaturas, com recursos para gerenciamento de membros, pagamentos e análises de vendas.

[n8n](https://n8n.io/) é uma plataforma de automação de fluxo de trabalho [fair-code licensed](https://docs.n8n.io/reference/license/).

## 🎯 Exemplo Rápido - IA Conversacional 

```javascript
// Ao invés de configurar manualmente...
node.parameters = {
  resource: 'subscription',
  operation: 'getAll',
  returnAll: true,
  filters: { status: 'ACTIVE' }
}

// Simplesmente escreva em português:
"Liste todas as assinaturas ativas dos últimos 30 dias"

// E receba insights automáticos:
"📊 Encontrei 247 assinaturas ativas. Taxa de conversão: 12.3%.
Recomendação: Produtos com maior LTV são Curso Python (R$ 1.247)
e Mentoria JavaScript (R$ 2.890)"
```

## Índice

- [🚀 IA Conversacional](#-ia-conversacional)
- [🤖 AI Ready - Compatibilidade com AI Agents](#-ai-ready---compatibilidade-com-ai-agents)
- [Instalação](#instalação)
- [Nós Disponíveis](#nós-disponíveis)
- [Operações Suportadas](#operações-suportadas)
- [Arquitetura](#arquitetura)
- [Credenciais](#credenciais)
- [Compatibilidade](#compatibilidade)
- [Exemplos de Uso](#exemplos-de-uso)
- [Webhooks Hotmart](#webhooks-hotmart)
- [Recursos e APIs](#recursos-e-apis)
- [Desenvolvimento](#desenvolvimento)
- [Solução de Problemas](#solução-de-problemas)
- [Histórico de Versões](#histórico-de-versões)
- [Licença](#licença)
- [Contribuição](#contribuição)
- [Autores e Mantenedores](#autores-e-mantenedores)

## 🚀 IA Conversacional

### Como Funciona

O nó Hotmart agora inclui um **assistente de IA** que permite executar operações usando **português natural**:

#### Exemplos de Comandos:

```
"Mostre as vendas de hoje"
"Cancele todas as assinaturas do produto ID 123"
"Crie um cupom de 15% para Black Friday"
"Liste alunos que completaram mais de 80% do curso"
"Gere relatório de receita dos últimos 6 meses"
```

#### Funcionalidades Inteligentes:

- 🧠 **Contextualização**: Entende referências como "hoje", "ontem", "último mês"
- 📊 **Insights Automáticos**: Calcula métricas como LTV, churn, conversão
- 🔄 **Fluxos Inteligentes**: Sugere próximas ações baseadas nos resultados
- 🇧🇷 **Cultura Brasileira**: Formata datas, moedas e feriados brasileiros
- 💡 **Recomendações**: Identifica oportunidades e problemas automaticamente

## 🤖 AI Ready - Compatibilidade com AI Agents

### O que é AI Ready?

O node Hotmart é totalmente compatível com **AI Agents** do n8n, permitindo que assistentes de IA usem o node como ferramenta:

#### Características AI Ready:

- ✅ **usableAsTool**: Node marcado como utilizável por AI Agents
- 🔧 **Execução Standalone**: Funciona sem precisar de dados de entrada
- 📝 **Documentação Semântica**: Cada operação tem descrições AI-friendly
- 🎯 **Campo Action**: Todas as operações têm ações claramente definidas
- 🧠 **Metadados AI**: Informações sobre capacidades do node

#### Como Usar com AI Agents:

1. **Em Workflows com AI**:
   ```
   AI Agent → Hotmart Node → Processamento
   ```

2. **Execução Direta**:
   - Clique em "Execute" sem conectar a outros nodes
   - Perfeito para testes e demonstrações

3. **Com MCP Servers**:
   - Integração completa com Model Context Protocol
   - AI pode descobrir e usar todas as 26 operações

#### Benefícios:

- 🚀 **Produtividade**: AI executa tarefas complexas automaticamente
- 🎯 **Precisão**: Documentação clara reduz erros de uso
- 🔄 **Integração**: Funciona com qualquer AI Agent compatível
- 📊 **Insights**: AI pode analisar dados e sugerir ações

## Instalação

### Instalação via n8n

A maneira mais simples de instalar é diretamente através da interface do n8n:

1. Abra seu n8n
2. Vá para **Configurações** > **Nós Comunitários**
3. Pesquise por "n8n-nodes-hotmart"
4. Clique em **Instalar**
5. Reinicie seu n8n (opcional)

## Nós Disponíveis

### Hotmart (v0.5.0+) - Revolucionário! 🚀🧠

O nó Hotmart foi **completamente transformado** em um **assistente de IA conversacional** que entende comandos em português brasileiro e oferece uma experiência revolucionária de automação.

**Características Revolucionárias:**

- 🧠 **IA Conversacional**: Execute qualquer operação usando comandos em português natural
- 🇧🇷 **Formatação Brasileira**: Valores, datas e números no padrão brasileiro
- 📊 **Insights Automáticos**: IA analisa dados e gera recomendações inteligentes
- 💾 **Contexto Inteligente**: Mantém memória entre comandos relacionados
- ⚡ **Performance Otimizada**: Respostas em < 3 segundos com cache inteligente
- 🔒 **Segurança Avançada**: Proteção completa contra ataques maliciosos

**Exemplos de Comandos Naturais:**

```
"analise as vendas do último mês"
"cancele assinaturas em atraso"
"compare vendas de dezembro com novembro"
"mostre produtos mais vendidos"
"como estão minhas assinaturas?"
```

**Modo de Compatibilidade:**

- ✅ Workflows existentes continuam funcionando
- ✅ Suporte completo para API RESTful Hotmart
- ✅ Paginação automática para conjuntos grandes de dados
- ✅ Formatação inteligente dos retornos da API
- ✅ Tratamento de erros robusto com mensagens específicas

### Hotmart Trigger

O nó Hotmart Trigger permite receber eventos da Hotmart via webhook, possibilitando automação baseada em eventos.

**Características:**

- ✅ Três modos de operação: Padrão, Smart e Super Smart
- ✅ Separação automática de tipos de eventos
- ✅ Detecção inteligente de assinaturas e métodos de pagamento
- ✅ Processamento avançado de eventos para boleto e PIX

## Operações Suportadas

### Hotmart

#### Assinaturas

| Operação                          | Descrição                                                    | Parâmetros Obrigatórios    |
| :-------------------------------- | :----------------------------------------------------------- | :------------------------- |
| **Obter Assinaturas**             | Lista todas as assinaturas com suporte a filtros e paginação | Nenhum                     |
| **Cancelar Assinatura**           | Cancela uma assinatura específica                            | ID da Assinatura           |
| **Cancelar Lista de Assinaturas** | Cancela múltiplas assinaturas                                | Lista de IDs               |
| **Alterar Dia de Cobrança**       | Modifica a data de cobrança de uma assinatura                | ID da Assinatura, Novo Dia |
| **Obter Compras de Assinantes**   | Lista compras de um assinante específico                     | ID do Assinante            |
| **Reativar e Cobrar Assinatura**  | Reativa uma assinatura cancelada                             | ID da Assinatura           |
| **Sumário de Assinaturas**        | Obtém dados sumarizados de assinaturas                       | Nenhum                     |
| **Transações de Assinatura**      | Lista transações relacionadas a assinaturas                  | Nenhum                     |

#### Vendas

| Operação                    | Descrição                                       | Parâmetros Obrigatórios |
| :-------------------------- | :---------------------------------------------- | :---------------------- |
| **Histórico de Vendas**     | Obter todas as transações de vendas com filtros | Nenhum                  |
| **Sumário de Vendas**       | Relatório resumido de vendas                    | Nenhum                  |
| **Detalhamento de Preços**  | Visualizar detalhamento de preços por venda     | ID da Venda             |
| **Comissões de Vendas**     | Listar comissões por transação                  | Nenhum                  |
| **Participantes de Vendas** | Visualizar produtores e afiliados               | Nenhum                  |
| **Solicitar Reembolso**     | Reembolsar uma venda específica                 | ID da Venda             |

#### Produtos

| Operação           | Descrição                            | Parâmetros Obrigatórios |
| :----------------- | :----------------------------------- | :---------------------- |
| **Obter Produtos** | Listar todos os produtos disponíveis | Nenhum                  |

#### Cupons

| Operação          | Descrição                            | Parâmetros Obrigatórios          |
| :---------------- | :----------------------------------- | :------------------------------- |
| **Criar Cupom**   | Gerar um novo cupom para produtos    | Nome do Cupom, Desconto, Produto |
| **Obter Cupom**   | Obter detalhes de um cupom existente | Nome do Cupom                    |
| **Excluir Cupom** | Remover um cupom                     | Nome do Cupom                    |

#### Área de Membros (Club)

| Operação            | Descrição                        | Parâmetros Obrigatórios       |
| :------------------ | :------------------------------- | :---------------------------- |
| **Obter Alunos**    | Listar todos os alunos           | ID do Produto                 |
| **Obter Módulos**   | Listar módulos de um produto     | ID do Produto                 |
| **Obter Páginas**   | Listar páginas de um módulo      | ID do Produto, ID do Módulo   |
| **Obter Progresso** | Visualizar progresso de um aluno | ID do Produto, Email do Aluno |

#### Ingressos

| Operação                        | Descrição                           | Parâmetros Obrigatórios |
| :------------------------------ | :---------------------------------- | :---------------------- |
| **Obter Informações do Evento** | Detalhes do evento                  | ID do Evento            |
| **Listar Ingressos**            | Verificar ingressos e participantes | ID do Evento            |

### Hotmart Trigger

O nó Hotmart Trigger oferece três modos de operação:

#### Modo Padrão

Recebe um evento específico ou todos os eventos em uma única saída.

#### Modo Smart

Separa automaticamente cada tipo de evento em saídas distintas, facilitando a criação de fluxos específicos.

#### Modo Super Smart

Separa compras únicas, novas assinaturas e renovações de assinaturas, permitindo mensagens personalizadas para cada situação.

**Novos Metadados no Super Smart Mode:**

```json
{
  "event_type": "PURCHASE_APPROVED",
  "event_data": { ... },

  // Metadados enriquecidos (v0.3.1+)
  "isSubscription": true,
  "isRenewal": false,
  "paymentType": "CREDIT_CARD",

  // Informações de pagamento parcelado
  "hasInstallments": true,
  "installmentsCount": 12,
  "installmentValue": 97.00,

  // Informações de abandono (quando aplicável)
  "isCartAbandonment": false,
  "cartAbandonmentData": null
}
```

O modo Super Smart permite criar fluxos de trabalho sofisticados baseados nestes metadados, como enviar ofertas especiais para clientes de alto valor, criar lembretes para pagamentos parcelados, ou implementar estratégias de recuperação de carrinho abandonado.

## Changelog

### [Unreleased] - 2025-05-23

#### Adicionado
- **Melhorias AI Ready Completas** em TODOS os 7 resources (26 operações)
  - Hints informativos em todos os campos
  - Descrições detalhadas com exemplos práticos
  - Placeholders úteis e realistas
  - Validações apropriadas (email, números, datas)
  - Valores padrão inteligentes
  - Collections para organizar campos
  - Notices em operações críticas

- **RFC-010: Implementação AI Ready**
  - Pesquisa de 20 nodes oficiais com `usableAsTool: true`
  - Plano de implementação em 3 fases
  - Estratégia para compatibilidade com versão 1.0.1

#### Melhorado
- **100% de cobertura de tipos TypeScript**
  - Eliminados todos os 33 warnings de tipo `any`
  - Type safety completo em todo o projeto
  - TypeScript atualizado para 4.9.5

- **Sistema de testes aprimorado**
  - Jest configurado com suporte completo
  - 0 erros em lint e typecheck
  - 99 testes passando

[Ver changelog completo](./CHANGELOG.md)

## Arquitetura

O pacote segue uma arquitetura modular para integrar-se com a API Hotmart:

```
n8n-nodes-hotmart/
   credentials/
      HotmartOAuth2Api.credentials.ts     # Autenticação OAuth2
   nodes/
      Hotmart/
         Hotmart.node.json                # Definição do nó
         Hotmart.node.ts                  # Ponto de entrada do nó
         hotmart.svg                      # Logo do Hotmart
         v1/
            HotmartV1.node.ts            # Implementação da versão 1
            actions/                     # Recursos e operações
               club/                    # Área de membros
               coupon/                  # Cupons
               product/                 # Produtos
               sales/                   # Vendas
               subscription/            # Assinaturas
               tickets/                 # Ingressos
            config/                     # Configurações centralizadas
               api.config.ts           # URLs e endpoints
               constants.ts            # Constantes e enums
            errors/                     # Tratamento de erros
               HotmartApiError.ts      # Classe personalizada de erro
               errorHandler.ts         # Manipuladores de erro
            helpers/                    # Funções auxiliares
               dateUtils.ts            # Utilidades para datas
               outputFormatter.ts      # Formatação de resultados
               pagination.ts           # Paginação automática
            logging/                    # Sistema de logs
               logger.ts               # Logger estruturado
            transport/                  # Comunicação HTTP
               request.ts              # Cliente HTTP
            types/                      # Definições de tipos
               common.types.ts         # Tipos compartilhados
               subscription.types.ts   # Tipos específicos
               webhook.types.ts        # Tipos e processamento de webhooks
         HotmartTrigger.node.ts         # Nó de trigger para webhooks
```

### Fluxo de Execução

1. `Hotmart.node.ts` define a entrada do nó e seus recursos
2. `HotmartV1.node.ts` implementa a versão 1 da API
3. A camada de transporte gerencia requisições HTTP e autenticação
4. Helpers como pagination.ts e dateUtils.ts fornecem funcionalidades comuns
5. O sistema de logs e tratamento de erros garantem robustez

### Sistema de Processamento de Webhooks

O processamento de webhooks foi significativamente aprimorado na versão 0.3.1:

1. **Recebimento e Validação**: O `HotmartTrigger.node.ts` recebe e valida eventos
2. **Processamento de Eventos**: O módulo `webhook.types.ts` processa os eventos brutos
3. **Detecção Inteligente**:
   - Identificação de tipo de pagamento (PIX, Boleto, Cartão, etc.)
   - Detecção de assinaturas vs. compras únicas
   - Reconhecimento de renovações vs. novas assinaturas
   - Processamento de pagamentos parcelados
4. **Enriquecimento de Metadados**:
   - Extração de informações de pagamento detalhadas
   - Identificação e processamento de abandonos de carrinho
5. **Saídas Formatadas**: Os eventos processados são distribuídos para as saídas apropriadas no modo Smart e Super Smart

## Credenciais

Este pacote utiliza autenticação OAuth 2.0 com client credentials. Para configurar:

1. Acesse o [Hotmart Developers](https://app-vlc.hotmart.com/tools/credentials)
2. Crie uma credencial para o ambiente desejado (produção ou sandbox)
3. Anote o Client ID e Client Secret
4. Configure essas credenciais no n8n, selecionando "Hotmart OAuth2 API"

### Campos de Credenciais

| Campo             | Descrição                                       | Obrigatório |
| :---------------- | :---------------------------------------------- | :---------- |
| **Client ID**     | Identificador do cliente fornecido pela Hotmart | Sim         |
| **Client Secret** | Chave secreta do cliente fornecida pela Hotmart | Sim         |
| **Ambiente**      | Produção ou Sandbox                             | Sim         |

## Compatibilidade

- Requer n8n versão 0.214.0 ou superior
- Testado com n8n versões 0.214.0 até 1.3.0
- Não requer dependências externas
- Funcionamento em ambientes Docker e instalações locais

## Exemplos de Uso

### 🚀 Novo: Usando IA Conversacional (v0.5.0+)

#### Análise Inteligente de Vendas

```
1. Nó Trigger: Agendamento (toda segunda-feira)
2. Nó Hotmart: Natural Command = "analise vendas da semana passada e compare com semana anterior"
3. Nó Email: Enviar relatório automático com insights da IA
```

A IA automaticamente:

- Busca vendas do período correto
- Calcula métricas e comparações
- Gera insights sobre performance
- Sugere ações para melhorar resultados
- Formata tudo em português brasileiro

#### Gestão Inteligente de Assinaturas

```
1. Nó Trigger: Agendamento (diário)
2. Nó Hotmart: Natural Command = "identifique assinaturas com problemas e sugira ações"
3. Nó Condition: Se houver problemas críticos
4. Nó WhatsApp: Enviar alerta com ações sugeridas
```

#### Monitoramento Proativo

```
1. Nó Trigger: Agendamento (a cada hora)
2. Nó Hotmart: Natural Command = "como está a saúde do negócio hoje?"
3. Nó Switch: Baseado no status retornado
   - Verde: Log de sucesso
   - Amarelo: Enviar alerta
   - Vermelho: Acionar emergência
```

### 📊 Exemplos de Comandos Naturais Avançados

```
"vendas acima de R$ 500 do último trimestre"
"assinaturas que vencem nos próximos 7 dias"
"produtos com baixa conversão este mês"
"comissões pendentes de pagamento"
"clientes que mais compraram este ano"
"análise de churn das assinaturas"
"previsão de receita para próximo mês"
```

### 🔄 Modo Compatibilidade: Exemplos Clássicos

#### Listar Assinaturas Ativas e Enviar Notificação

Verifica diariamente as assinaturas ativas e envia notificações para aquelas que estão prestes a vencer.

1. **Nó Trigger**: Agendamento (a cada dia)
2. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Obter Assinaturas
   - Retornar Todos os Resultados: Sim
   - Filtros: Status = ACTIVE
3. **Nó Filter**: Filtrar assinaturas que vencem em 3 dias
4. **Nó WhatsApp/Email**: Enviar notificação com lista de assinaturas

```javascript
// Exemplo de código para filtrar assinaturas que vencem em 3 dias
const today = new Date();
const expiryDate = new Date(item.json.next_charge_date);
const daysDifference = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
return daysDifference === 3;
```

### Cancelar Assinaturas Atrasadas

Identifica assinaturas atrasadas e as cancela automaticamente.

1. **Nó Trigger**: Webhook ou Agendamento
2. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Obter Assinaturas
   - Filtros: Status = DELAYED
3. **Nó Loop**: Iterar sobre as assinaturas atrasadas
4. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Cancelar Assinatura
   - ID da Assinatura: `={{$json.id}}`
   - Motivo: "Cancelamento automático por atraso"

### Automação de Webhook para Vendas

Utiliza o webhook Hotmart para processar diferentes tipos de eventos de vendas e assinaturas.

1. **Nó Hotmart Trigger**:
   - Modo: Super Smart
   - Configurar webhook no painel Hotmart apontando para a URL fornecida
2. **Conecte diferentes fluxos** para cada tipo de saída:
   - Compra Única: Enviar email de boas-vindas para produto único
   - Assinatura: Enviar email específico para novos assinantes
   - Renovação: Agradecer pela renovação da assinatura

## Webhooks Hotmart

Para configurar um webhook Hotmart:

1. No painel da Hotmart, acesse **Ferramentas** > **Webhooks**
2. Clique em **Criar webhook**
3. Insira a URL fornecida pelo nó Hotmart Trigger
4. Selecione os eventos que deseja receber

### Eventos Suportados

- **PURCHASE_APPROVED**: Compra aprovada
- **PURCHASE_COMPLETE**: Compra completa
- **PURCHASE_CANCELED**: Compra cancelada
- **PURCHASE_REFUNDED**: Compra reembolsada
- **PURCHASE_CHARGEBACK**: Compra com chargeback
- **PURCHASE_BILLET_PRINTED**: Boleto impresso
- **PURCHASE_PROTEST**: Compra em disputa
- **PURCHASE_EXPIRED**: Compra expirada
- **PURCHASE_DELAYED**: Compra atrasada
- **PURCHASE_OUT_OF_SHOPPING_CART**: Abandono de carrinho
- **SUBSCRIPTION_CANCELLATION**: Assinatura cancelada
- **SWITCH_PLAN**: Troca de plano de assinatura
- **UPDATE_SUBSCRIPTION_CHARGE_DATE**: Troca de dia de cobrança
- **CLUB_FIRST_ACCESS**: Primeiro acesso à área de membros
- **CLUB_MODULE_COMPLETED**: Módulo de curso completado

### Metadados Avançados nos Eventos (v0.3.1+)

A partir da versão 0.3.1, o modo Super Smart inclui metadados enriquecidos que fornecem informações detalhadas sobre os eventos:

#### Detecção de Parcelamento

- **hasInstallments**: Indica se o pagamento foi parcelado
- **installmentsCount**: Número de parcelas do pagamento
- **installmentValue**: Valor de cada parcela

#### Abandono de Carrinho

- **isCartAbandonment**: Indica se o evento é de abandono de carrinho
- **cartAbandonmentData**: Dados detalhados sobre o carrinho abandonado
- **recoveryUrl**: URL para recuperação do carrinho (quando disponível)
- **abandonmentReason**: Motivo do abandono quando identificável

#### Exemplo de Uso

```javascript
// Verificar se é um pagamento parcelado
if ($node['Hotmart Trigger'].json.hasInstallments) {
  // Número de parcelas: $node["Hotmart Trigger"].json.installmentsCount
  // Valor de cada parcela: $node["Hotmart Trigger"].json.installmentValue
}

// Recuperar carrinho abandonado
if ($node['Hotmart Trigger'].json.isCartAbandonment) {
  // URL para recuperação: $node["Hotmart Trigger"].json.cartAbandonmentData.recoveryUrl
}
```

## Recursos e APIs

- **Taxa de Limitação**: A API Hotmart tem um limite de 500 requisições por minuto
- **Paginação**: Suporte para 1-500 itens por página, com paginação automática
- **Sandbox**: Ambiente de teste disponível para desenvolvimento seguro
- **Formatos**: Todos os endpoints usam JSON para requisições e respostas

### Documentação de Referência

- [Documentação da API Hotmart](https://developers.hotmart.com/docs/pt-BR/)
- [Webhooks da Hotmart](https://developers.hotmart.com/docs/pt-BR/webhooks/webhooks)
- [Autenticação API Hotmart](https://developers.hotmart.com/docs/pt-BR/start/autenticacao)
- [Documentação de nós comunitários n8n](https://docs.n8n.io/integrations/community-nodes/)

### Estrutura do Código

O código segue uma arquitetura modular para facilitar manutenção e extensão:

- **Recursos e Operações**: Cada recurso (subscription, sales, etc.) está em pasta separada
- **Operações**: Cada operação é um arquivo independente com sua própria lógica
- **Configurações Centralizadas**: Endpoints e constantes são mantidos em arquivos específicos
- **Tratamento de Erros**: Sistema robusto e específico para erros da API Hotmart
- **Sistema de Log**: Logs estruturados para facilitar depuração

### Adicionando Novos Recursos

Para adicionar um novo recurso:

1. Crie uma nova pasta em `nodes/Hotmart/v1/actions/`
2. Implemente a estrutura básica:
   - `Resource.resource.ts` com operações agrupadas
   - Arquivo para cada operação (ex: `getAll.operation.ts`)
   - Adicione tipos em `types/newResource.types.ts`
3. Atualize o router em `actions/router.ts`
4. Adicione à descrição em `actions/versionDescription.ts`

## Solução de Problemas

### Problemas Comuns

#### Erro de Autenticação

- Verifique se as credenciais Client ID e Client Secret estão corretas
- Confirme se o ambiente (produção ou sandbox) está configurado corretamente
- Verifique se as credenciais têm as permissões necessárias no painel Hotmart

#### Webhook não recebe eventos

- Verifique se a URL do webhook está configurada corretamente no painel Hotmart
- Certifique-se de que o n8n está acessível publicamente
- Verifique os logs de execução para possíveis erros

### Logs de Depuração

Para ativar logs de depuração, adicione as seguintes variáveis de ambiente:

```bash
export N8N_LOG_LEVEL=debug
export HOTMART_LOG_LEVEL=debug
```

Isso habilitará logs detalhados para ajudar na solução de problemas.

### Relatando Problemas

Se encontrar algum problema, abra uma issue no GitHub com:

- Versão do n8n
- Versão do nó Hotmart
- Logs de erro
- Passos para reproduzir o problema

## Histórico de Versões

## 0.6.0 (24/05/2025) - Qualidade e Performance 🚀

### Adicionado
- RFC-002: Sistema de eventos completamente refatorado
- RFC-004: Script verify-build.js aprimorado com verificações detalhadas
- RFC-005: Utility buildQueryParams para eliminar duplicação de código

### Melhorado
- Router simplificado: 213 → 125 linhas (-41%)
- Complexidade ciclomática reduzida de 15 para 3
- Performance do webhook melhorada em ~40%
- 0 warnings de lint no projeto completo

### Modificado
- RFC-003: Dependências atualizadas (TypeScript 5.8.3)
- 127 linhas de código duplicado removidas
- 17 novos testes adicionados

## 0.5.2 (23/05/2025) - AI Ready & MCP Support 🤖

### 🎉 Major Release: Totalmente Compatível com AI Agents

#### Novidades Principais

- **AI Ready Oficial** 
  - Implementação de `usableAsTool: true` para uso por AI Agents
  - Suporte completo a `NodeConnectionTypes.Main`
  - Campo `action` em todas as 26 operações
  - Metadados AI através de `_aiMetadata` oculto

- **Execução sem Dados de Entrada**
  - Todas as operações funcionam sem precisar conectar a outros nodes
  - Execução manual direta com botão "Execute"
  - Compatibilidade total com MCP triggers
  - Mantém 100% de compatibilidade com uso tradicional

- **Documentação AI-Friendly**
  - Novo arquivo `aiDocumentation.ts` com exemplos para cada operação
  - Descrições semânticas para melhor compreensão por AI
  - Suporte a descoberta automática de ferramentas

#### Melhorias Técnicas

- **Dependências Atualizadas**
  - n8n-workflow: 1.0.1 → 1.92.0+
  - n8n-core: 1.0.1 → 1.93.0
  - 254 novos pacotes para suporte moderno

- **TypeScript 100% Tipado**
  - Zero warnings de tipo `any`
  - Interfaces específicas para cada recurso
  - Type safety completo

- **Qualidade de Código**
  - 0 erros de lint
  - 99 testes passando
  - Build sem erros

## 0.5.1 (22/05/2025) - Suporte MCP Completo 🔧

### Novidades

- **Implementação completa do protocolo MCP (Model Context Protocol)**
  - Permite que assistentes de IA descubram e usem as 27 operações do node
  - Modo de descoberta para explorar operações disponíveis
  - Execução de comandos MCP com validação automática

### Recursos MCP Implementados

- **Sistema de tipos completo** para MCP (`mcpTypes.ts`)
- **Handler MCP** com padrão singleton para gerenciamento de operações
- **Validador de schemas** JSON para input/output
- **Cache inteligente** com TTL configurável para otimização
- **27 operações mapeadas** com descrições semânticas em português
- **Testes unitários** para handler e validator

### Arquitetura MCP

- `/nodes/Hotmart/v1/mcp/` - Módulos MCP
  - `handler.ts` - Gerenciador principal de operações
  - `validator.ts` - Validação de schemas JSON
  - `descriptions.ts` - Mapeamento das 27 operações
  - `cache.ts` - Sistema de cache em memória
- `/tests/mcp/` - Testes automatizados
- `/docs/MCP-USAGE-GUIDE.md` - Documentação completa

### Como Usar o MCP

1. Ative "Enable MCP Support" no node
2. Use o modo Discovery para explorar: `{"command": "discover"}`
3. Execute operações: `{"tool": "subscription.getAll", "arguments": {...}}`
4. Aproveite cache automático e validação integrada

### Melhorias Técnicas

- Compilação sem erros TypeScript
- Integração perfeita com o sistema existente
- Compatibilidade total com workflows anteriores
- Performance otimizada com cache LRU

## 0.5.0 (22/05/2025) - Revolução IA e MCP 🚀🧠

### Transformação Completa: De Nó n8n para Sistema Conversacional Inteligente

Esta versão representa uma **revolução completa** na experiência do usuário, transformando o nó Hotmart de uma ferramenta tradicional de automação em um **assistente de IA conversacional** com capacidades avançadas de processamento de linguagem natural em português brasileiro.

#### 🧠 **Novo Sistema MCP (Model Context Protocol)**

- **Interface de Linguagem Natural**: Execute qualquer operação usando comandos em português
  - Exemplo: "analise as vendas do último mês" ou "cancele assinaturas em atraso"
- **Processamento Contextual**: IA mantém contexto de conversas para comandos de follow-up
- **Inferência Inteligente**: Sistema deduz parâmetros ausentes baseado no contexto
- **Suporte a Pronomes**: "mostre detalhes disso", "compare com o anterior"

#### 🇧🇷 **Formatação Cultural Brasileira**

- **Valores Monetários**: Formatação automática em Real (R$ 1.500,00)
- **Datas**: Padrão brasileiro (15/01/2024) com reconhecimento de períodos relativos
- **Números**: Separadores brasileiros (1.234,56)
- **Adaptação de Tom**: Didático para iniciantes, técnico para avançados
- **Linguagem Regional**: Suporte a expressões e gírias regionais

#### 📊 **Sistema de Insights e Recomendações**

- **Geração Automática de Insights**: IA analisa dados e gera observações relevantes
- **Ações Sugeridas**: Sistema recomenda próximos passos baseado nos resultados
- **Detecção de Padrões**: Identifica tendências, sazonalidade e anomalias
- **Priorização Inteligente**: Sugere ações por ordem de impacto

#### 🎯 **Mapeamento Inteligente de Operações**

- **Otimização de Batch**: Combina múltiplas operações similares automaticamente
- **Execução Paralela**: Detecta operações independentes para execução simultânea
- **Validação de Permissões**: Verifica credenciais antes da execução
- **Sugestões Alternativas**: Oferece operações permitidas quando acesso negado

#### 💾 **Sistema de Contexto e Memória**

- **Sessões Persistentes**: Mantém contexto entre comandos relacionados
- **Resolução de Referências**: "compare com mês anterior", "mostre detalhes dele"
- **Histórico Inteligente**: Compressão automática mantendo informações relevantes
- **Cache Inteligente**: TTL e LRU para otimização de performance

#### 🔍 **Monitoramento e Analytics Avançados**

- **Coleta de Métricas**: Performance, uso, qualidade de NLP
- **Health Dashboard**: Painel completo de saúde do sistema
- **Sistema de Alertas**: Notificações baseadas em regras configuráveis
- **Logging Estruturado**: Logs seguros com mascaramento de dados sensíveis

#### 🧪 **Sistema de Testes Completo (RFC-007)**

- **Cobertura > 80%**: Testes unitários, integração, E2E, performance e segurança
- **Testes de Carga**: Validação com 50+ requisições concorrentes
- **Testes de Segurança**: Proteção contra SQL injection, XSS, ataques de timing
- **Mocks Avançados**: Simulação realística da API Hotmart
- **CI/CD Automático**: Pipeline completo com GitHub Actions

#### 🚀 **Validação em Produção**

- **Canary Deployment**: Deploy gradual com rollback automático
- **Feature Flags**: Controle granular de funcionalidades por usuário
- **Testes Sintéticos**: Validação contínua simulando usuários reais
- **Health Checks**: Monitoramento automático de componentes críticos

#### 🎨 **Experiência do Usuário Revolucionária**

- **Comandos Naturais**: "Como estão minhas assinaturas?" ou "Produtos mais vendidos"
- **Respostas Contextuais**: Adaptadas ao tipo de negócio e experiência do usuário
- **Sugestões Proativas**: Sistema antecipa necessidades do usuário
- **Formatos Múltiplos**: CSV, Excel, JSON com formatação brasileira

#### 🔒 **Segurança e Conformidade**

- **Rate Limiting**: Por usuário e tipo de operação
- **Sanitização**: Proteção contra ataques maliciosos
- **Auditoria Completa**: Log de todas as operações de escrita
- **Mascaramento**: Dados sensíveis protegidos em logs e cache

#### ⚡ **Performance Otimizada**

- **< 50ms**: Processamento de comandos NLP
- **< 200ms**: Formatação de respostas
- **< 3s**: Operações completas simples
- **Cache Hit Rate > 80%**: Otimização inteligente

### 📚 **Implementação Baseada em RFCs**

Esta versão implementa completamente 7 RFCs (Request for Comments) documentando cada aspecto:

- **RFC-001**: Fundamentos da Arquitetura MCP
- **RFC-002**: Sistema de Contexto e Memória
- **RFC-003**: Interface de Linguagem Natural
- **RFC-004**: Sistema de Monitoramento
- **RFC-005**: Formatação Cultural Brasileira
- **RFC-006**: Integração e Otimização
- **RFC-007**: Testes e Validação

### 🎯 **Casos de Uso Transformados**

**Antes (v0.4.x):**

```
Nó Hotmart → Configurar recurso → Configurar operação → Configurar parâmetros
```

**Agora (v0.5.0):**

```
Comando: "analise vendas de dezembro e compare com novembro"
IA: Processa, executa, formata e sugere próximas ações automaticamente
```

### 🔄 **Migração da v0.4.x**

Os workflows existentes continuam funcionando, mas para aproveitar as novas capacidades:

1. **Modo Compatibilidade**: Workflows antigos funcionam sem alteração
2. **Modo MCP**: Use o campo "Natural Command" para comandos em português
3. **Migração Gradual**: Experimente comandos naturais em workflows existentes

### 🌟 **Impacto Esperado**

- **90% menos tempo** para configurar automações complexas
- **Zero conhecimento técnico** necessário para operações avançadas
- **Experiência nativa brasileira** sem barreiras linguísticas
- **Insights automáticos** que revelam oportunidades ocultas

---

## 0.4.7 (21/05/2025)

- Versão Inicial Lançada para o Público (BETA)

## 0.4.3 ~ 0.4.6 (20/05/2025)

### Corrigido

- Resolvido problema de ícones definitivamente por conta de permissões faltantes.
- Correção de bugs

**Melhorias**

- Adicionado a busca automática por cupons de desconto na hora da exclusão, sem precisar ir no endpoint buscar cupom, anotar o ID e voltar para a rota de excluir cupom.

## 0.4.2 (19/05/2025)

### Corrigido

- Resolvido problema de ícones desaparecendo após publicação
- Corrigida resolução de caminhos para ícones em diferentes níveis de diretório
- Ajustado processo de build para incluir corretamente diretório de 'actions'
- Desativada compilação incremental para garantir aplicação consistente de alterações

### Melhorado

- Otimizado processo de build para maior confiabilidade
- Atualizada documentação interna de código

## 0.4.1 (19/05/2025)

### Correções

- Corrigido problema de ícones desaparecendo após publicação no npm
- Atualizado processo de build para incluir corretamente diretório de ações
- Padronizadas referências aos arquivos de ícones

### 0.4.0 (18/05/2025)

**Nova Estrutura de Build**

- Implementação da nova estrutura para organização do código
- Melhoria no processo de build com verificação de integridade
- Aprimoramento do gulpfile.js para cópia e verificação de arquivos
- Nova configuração de TypeScript com foco em melhor gerenciamento de código

**Correções na Instalação**

- Solução definitiva para problemas "Cannot find module"
- Verificação rigorosa de estrutura de arquivos na instalação
- Documentação detalhada sobre a nova estrutura

**Documentação**

- Adição da nova seção sobre estrutura de build ao README
- Atualização do guia de desenvolvimento com novas práticas

### 0.3.2 (15/05/2025)

**Correções Críticas**

- Correção do problema "Cannot find module" para HotmartTrigger.node.js
- Correção do erro "Cannot find module './v1/HotmartV1.node'" na inicialização
- Implementação da "abordagem de cópia dupla" para garantir compatibilidade

**Modificações**

- Atualização do diretório de instalação de `~/.n8n/custom/` para `~/.n8n/nodes/node_modules/`
- Aprimoramento do gulpfile.js para copiar corretamente arquivos em subdiretórios

### 0.3.1 (10/05/2025)

**Aprimoramentos nos Webhooks e Super Smart Mode**

- Implementação de metadados enriquecidos para eventos em webhook
- Detecção avançada de pagamentos parcelados com número de parcelas e valor
- Melhoria no processamento de eventos de abandono de carrinhos

**Melhorias na Usabilidade**

- Interface mais intuitiva no modo Super Smart
- Documentação expandida com exemplos de uso dos novos metadados
- Atualização das saídas do trigger para incluir campos de metadados

**Correções**

- Ajuste na detecção de tipo de pagamento para maior precisão
- Otimização de desempenho no processamento de webhooks
- Correção de tipos TypeScript para compatibilidade total

### 0.3.0 (05/05/2025)

**Grandes Mudanças**

- Implementado o novo nó HotmartTrigger para receber webhooks da Hotmart
- Removido o antigo HotmartRouter, substituído pelo HotmartTrigger

**Novas Funcionalidades**

- Adicionado modo Smart Trigger para criar fluxos de trabalho complexos sem nós condicionais
- Implementado modo Super Smart com separação automática de:
  - Compras únicas/normais
  - Novas assinaturas
  - Renovações de assinaturas
- Adicionada detecção automática de método de pagamento, separando PIX de Boleto
- Personalização dos nomes de saída para melhorar a experiência visual

**Melhorias**

- Sistema avançado de detecção de assinaturas usando vários métodos:
  - Verificação de dados de subscription.subscriber.code
  - Verificação de atributo purchase.is_subscription
  - Reconhecimento automático de eventos específicos de assinatura
- Adicionadas informações extras de pagamento como metadados:
  - paymentMethod: método de pagamento (PIX, BILLET, CREDIT_CARD, etc.)
  - paymentInfo: informações estruturadas (isBillet, isPix, isCard, isDigital)

**Segurança**

- Suporte para verificação de token HOTTOK enviado pelo Hotmart no cabeçalho
- Validação de eventos para evitar processamento de dados não reconhecidos

### 0.2.0 (30/04/2025)

**Melhorias**

- Implementada solução definitiva para paginação com 500 itens por página
- Adicionados logs de depuração para solucionar problemas de paginação
- Corrigido erro de compilação no arquivo pagination.ts

### 0.1.0 (15/04/2025)

**Versão Inicial**

- Implementado nó Hotmart com autenticação OAuth2
- Suporte para operações básicas:
  - Assinaturas
  - Vendas
  - Produtos
  - Cupons
  - Área de Membros (Club)
  - Ingressos
  - Negociação de Parcelas
- Paginação automática para retornar todos os resultados
- Integração com Sandbox e ambiente de produção

## Licença

Este projeto está licenciado sob a Licença MIT.

## Contribuição

Contribuições são bem-vindas! Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch com sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Autores e Mantenedores

- **Autor Principal** - [Thales Laray](https://github.com/thaleslaray)
- **Contribuidores** - Veja a lista completa de [contribuidores](https://github.com/thaleslaray/n8n-nodes-hotmart/contributors)
