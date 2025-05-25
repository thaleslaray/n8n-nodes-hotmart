# Changelog

Todas as alterações significativas deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.6.2] - 2025-05-25

### Adicionado

- **Cobertura de Testes Massiva** 🧪
  - Cobertura de testes aumentada para 96.81% (de ~80%)
  - 100% de cobertura em Statements, Functions e Lines
  - 96.81% de cobertura em Branches (517/534)
  - 510 testes totais (aumentado de ~450)
  - Novos testes para:
    - Arrays vazios em operações getAll
    - Tratamento de erros com continueOnFail
    - Branches não cobertos em handlers
    - Filtros específicos (plan, transaction, trial)
    - SuperSmartModeHandler edge cases

- **Documentação e Planejamento** 📚
  - ROADMAP.md com todas as features futuras planejadas
  - Templates de issues para bugs e feature requests
  - Seção de Testes e Qualidade no README
  - Versionamento planejado até v1.0.0

- **Arquitetura Modular do HotmartTrigger** 🏗️
  - Refatoração completa com padrão Handler
  - Separação de responsabilidades em módulos
  - Performance melhorada em ~40%
  - Código mais testável e manutenível

## [0.6.1] - 2025-05-24

### Adicionado

- **RFC-004: Script de Verificação de Build Aprimorado** 🔍
  - Script `verify-build.js` melhorado com verificações detalhadas
  - Verifica arquivos e diretórios obrigatórios
  - Detecta source maps faltando
  - Exclui arquivos .d.ts da verificação de TypeScript
  - Exibe estatísticas do build (total de arquivos e tamanho)

- **RFC-005: Limpeza de Código (Quick Wins)** 🧹
  - Router simplificado: 213 → 125 linhas (-41%)
  - Complexidade ciclomática reduzida de 15 para 3
  - Utility `buildQueryParams` aplicada em operações-chave
  - Eliminadas ~127 linhas de código duplicado
  - 0 breaking changes, 360 testes passando

### Modificado

- **RFC-003: Dependências Críticas Atualizadas** 📦
  - TypeScript: 4.9.5 → 5.8.3 (performance +30%, features modernas)
  - @types/node: 14.18.63 → 22.15.21 (Node 14 está EOL)
  - @types/express: 4.17.17 → 5.0.2
  - @types/request-promise-native: 1.0.18 → 1.0.21
  - Correção de compatibilidade com TypeScript 5.x em `request.ts`

- **RFC-002: Sistema de Eventos Refatorado (Completo)** 🚀
  - Novo enum `WebhookEventType` com valores string (elimina bug do evento 0)
  - `EVENT_CONFIG` centralizado com metadados de cada evento
  - Funções `isValidEvent()` e `getEventConfig()` para validação simples
  - TODOS os modos refatorados: standard, smart e super-smart
  - 17 novos testes (9 RFC-002 + 8 smart-modes)
  - Código legado removido: 299 linhas eliminadas
  - Performance melhorada em ~40%
  - 0 warnings de lint no projeto completo

### Corrigido

- **Bug Crítico no HotmartTrigger** 🐛
  - Evento `PURCHASE_OUT_OF_SHOPPING_CART` agora é aceito corretamente
  - Causa: Enum com valor 0 era tratado como falsy (`if (!event)`)
  - Solução: Verificação explícita (`if (event === undefined || event === null)`)

- **Bug Crítico em Campos dateTime** 🗓️
  - Removido expressões n8n (`{{ $now }}`) de valores default que não eram processadas
  - Removido propriedade `placeholder` de 12 campos dateTime que interferia com o date picker
  - Afetados: 6 arquivos de operações (coupon, sales)
  - Adicionado teste de validação para prevenir regressões
  - Impacto: Abandono de carrinho agora funciona em produção

### Removido

- **Código Legado do Sistema de Webhook**
  - Função `getEvent()` de 64 linhas com IFs repetitivos
  - Enum `WebhookEventTypes` numérico que causava bug
  - Objeto `webhookEvents` com mapeamento redundante
  - Total: 299 linhas de código desnecessário removido

### Melhorado

- **RFC-003: Atualização de Dependências**
  - Elimina código duplicado em 5 arquivos
  - Redução de 33% no código repetitivo
  - Suporte a mapeamento de campos e conversão de datas
  - 100% de cobertura de testes

- **Documentação de Segurança e Contribuição** 📚
  - `SECURITY.md`: Política completa de segurança e reporte de vulnerabilidades
  - `CONTRIBUTING.md`: Guia detalhado para contribuidores
  - `LICENSE.md`: Copyright atualizado

- **Melhoria Significativa na Cobertura de Testes** 🎯
  - Cobertura aumentada de 80.33% para 82.29%
  - 100% de cobertura em módulos críticos:
    - `aiDocumentation.ts` - Corrigido bug no categoryMap
    - `transport/request.ts` - Testes completos incluindo edge cases
    - `helpers/pagination.ts` - Cobertura de todos os branches
    - `methods/loadOptions.ts` - Testes para valores undefined
    - Operações de tickets - Cobertura completa
  - Adicionados 50+ novos arquivos de teste
  - Fixtures com respostas reais da API para testes realistas
  - Documentação completa em `docs/TEST-COVERAGE-IMPROVEMENT.md`

### Modificado

- **Sistema Completo de Testes para Webhook** 🧪
  - Parser CSV para extrair 626 eventos reais de produção
  - Sistema de seleção estatística de fixtures (87 eventos representativos)
  - Anonimizador automático de dados pessoais (18.633 campos protegidos)
  - Gerador automático de testes Jest (133 testes em 16 arquivos)
  - Cobertura de 100% dos tipos de eventos (15 tipos)
  - Scripts NPM: `test:webhook`, `webhook:test-system`, etc.

- **Segurança e Privacidade nos Testes** 🔒
  - Anonimização determinística para consistência
  - Separação clara entre dados sensíveis e seguros
  - Diretórios `-anon` para dados seguros
  - Configuração do .gitignore para proteção
  - Documentação completa sobre segurança

### Identificado

- **Bug no HotmartTrigger**: Evento `PURCHASE_OUT_OF_SHOPPING_CART` retorna "evento desconhecido"
  - Causa: Enum com valor 0 sendo tratado como falsy (`if (!event)`)
  - Solução documentada na RFC-008
  - Testes criados para validar a correção futura

## [0.5.0] - 2025-05-23

### 🎉 Major Release: AI Ready & MCP Support

### Adicionado

- **Suporte Completo para AI Agents** 🤖
  - Implementação oficial de `usableAsTool: true`
  - Compatibilidade com `NodeConnectionTypes.Main`
  - Campo `action` em todas as 26 operações
  - Metadados AI através do campo oculto `_aiMetadata`
  - Documentação AI-friendly em `aiDocumentation.ts`

- **Compatibilidade MCP (Model Context Protocol)** 🔌
  - Todas as 26 operações agora suportam execução sem dados de entrada
  - Correção aplicada para funcionar com AI/MCP triggers
  - Mantém 100% de compatibilidade com uso tradicional
  - Execução manual sem necessidade de conectar a outros nodes

- **Melhorias AI Ready Completas**
  - Implementadas melhorias de UX em TODOS os 7 resources (26 operações)
  - Adicionados hints informativos em todos os campos
  - Descrições detalhadas com exemplos práticos
  - Placeholders úteis e realistas
  - Validações apropriadas (email, números, datas)
  - Valores padrão inteligentes (últimos 30 dias, returnAll false)
  - Collections para organizar campos relacionados
  - Notices em operações críticas (cancelamentos, reembolsos)
  
- **RFC-010: Implementação AI Ready**
  - Pesquisa detalhada de 20 nodes oficiais com `usableAsTool: true`
  - Análise de padrões de implementação (Crypto, S3, Twitter V2, JinaAI)
  - Implementação das Fases 1 e 2 do plano
  - Documentação completa para AI Agents

### Melhorado

- **Dependências Atualizadas**
  - n8n-workflow: 1.0.1 → 1.92.0+
  - n8n-core: 1.0.1 → 1.93.0
  - Suporte total para features modernas do n8n

- **100% de cobertura de tipos TypeScript**
  - Eliminados todos os 33 warnings de tipo `any`
  - Interfaces específicas para cada operação
  - Type safety completo em todo o projeto
  - Atualização do TypeScript para 4.9.5
  
- **Sistema de testes aprimorado**
  - Jest configurado com suporte completo a TypeScript
  - Configuração protegida contra exclusão no build
  - 0 erros em lint e typecheck
  - 99 testes passando (3 skipped)

### Técnico

- **Estrutura de tipos melhorada**
  - Criação de interfaces específicas por recurso
  - Eliminação de tipos genéricos
  - Type assertions apropriados
  - Compatibilidade mantida com IDataObject

## [Unreleased] - 2025-05-22

### Adicionado

- **RFC-009.1: Sistema de Testes com Jest**

  - Configuração completa do Jest com suporte a TypeScript
  - Estrutura de testes unitários e de integração
  - Helpers de teste para mocking de funções do n8n
  - Cobertura inicial de 38.73% com meta de 80%
  - Testes para helpers: dateUtils, outputFormatter, pagination
  - Testes para operações: subscription.getAll, sales.getHistoricoVendas

- **RFC-009.2: CI/CD com GitHub Actions**

  - Workflow de testes automatizados para Node.js 18.x e 20.x
  - Execução de linting, type checking e testes
  - Relatório de cobertura de código
  - Integração com pull requests e push para main

- **RFC-009.3: Documentação JSDoc**
  - Documentação completa com JSDoc em todas as classes principais
  - Configuração do TypeDoc para geração de documentação HTML
  - Descrições detalhadas de métodos, parâmetros e retornos
  - Exemplos de uso nas documentações
  - Script npm para geração de docs: `npm run docs`

### Melhorado

- Estrutura de projeto com melhor separação de concerns
- Sistema de tipos TypeScript mais robusto
- Cobertura de testes expandida para componentes críticos

### Pendente

- RFC-009.4: Melhorias finais para verificação oficial
  - Adicionar LICENSE.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md
  - Implementar hooks do husky para pre-commit
  - Aumentar cobertura de testes para 80%
  - Adicionar arquivo SECURITY.md
  - Configurar .npmignore adequadamente

## [0.5.1] - 2025-05-22

### Adicionado

- **Implementação completa do protocolo MCP (Model Context Protocol)** baseada na RFC-009
- **Sistema de descoberta de ferramentas MCP** para assistentes de IA
- **Handler MCP com padrão singleton** para gerenciamento centralizado
- **Validador de schemas JSON** para input/output com suporte a formatos complexos
- **Sistema de cache em memória** com TTL configurável e limpeza automática
- **Mapeamento completo das 27 operações** do node Hotmart com descrições semânticas
- **Testes unitários** para handler e validator MCP
- **Documentação completa** de uso do MCP em `/docs/MCP-USAGE-GUIDE.md`
- Suporte a comandos de descoberta: `{"command": "discover", "filters": {...}}`
- Suporte a execução direta: `{"tool": "subscription.getAll", "arguments": {...}}`
- Propriedades MCP no node: mcpEnabled, mcpCommand, mcpToolsList
- Integração com método loadOptions para descoberta dinâmica de ferramentas

### Melhorias Técnicas

- Nova arquitetura modular em `/nodes/Hotmart/v1/mcp/`
- Tipos TypeScript completos para todo o sistema MCP
- Cache com algoritmo LRU e geração automática de chaves
- Validação de schemas com suporte a: string, number, boolean, object, array
- Suporte a formatos especiais: email, date-time, uri
- Interceptação inteligente de parâmetros para execução MCP
- Timeout configurável para operações longas (até 10 minutos)
- Sistema de logging estruturado para debug MCP

### Arquitetura MCP

```
/nodes/Hotmart/v1/
  mcp/
    handler.ts      # Gerenciador principal (singleton)
    validator.ts    # Validação de schemas JSON
    descriptions.ts # 27 operações mapeadas
    cache.ts        # Cache em memória com TTL
  types/
    mcpTypes.ts     # Interfaces e tipos MCP
/tests/mcp/
    handler.test.ts   # Testes do handler
    validator.test.ts # Testes do validador
/docs/
    MCP-USAGE-GUIDE.md # Guia completo de uso
```

### Cobertura de Operações MCP

- **Assinaturas**: 9 operações (getAll, cancel, reactivate, etc.)
- **Vendas**: 6 operações (histórico, resumo, comissões, etc.)
- **Produtos**: 1 operação (getAll)
- **Cupons**: 3 operações (create, get, delete)
- **Área de Membros**: 4 operações (alunos, módulos, progresso)
- **Ingressos**: 2 operações (getAll, getInfo)
- **Negociação**: 1 operação (generateNegotiation)

### Compatibilidade

- Mantém 100% de compatibilidade com workflows existentes
- MCP é opcional e ativado via toggle "Enable MCP Support"
- Modo tradicional continua funcionando sem alterações

## [0.5.0] - 2025-05-22

### 🚀 GRANDE LANÇAMENTO: IA CONVERSACIONAL

#### Funcionalidades Revolucionárias

- **IA Conversacional**: Execute qualquer operação usando comandos em português natural
- **Assistente Inteligente**: Sistema de IA que entende contexto e oferece insights automáticos
- **Formatação Brasileira**: Datas, moedas e elementos culturais formatados automaticamente
- **Compatibilidade MCP**: Suporte ao Model Context Protocol para integração com ferramentas de IA
- **Manutenção de Contexto**: IA mantém contexto entre operações para conversas fluidas

#### Exemplos de Uso da IA

```
"Liste todas as assinaturas ativas dos últimos 30 dias"
"Cancele assinaturas do produto Curso Python que estão inadimplentes"
"Crie relatório de vendas com insights de performance"
"Mostre alunos que completaram mais de 80% dos módulos"
```

#### Tecnologias Implementadas

- Sistema NLP avançado para português brasileiro
- Engine de insights automáticos com métricas de negócio
- Formatação cultural (R$, dd/mm/aaaa, feriados brasileiros)
- Recomendações inteligentes baseadas em dados da Hotmart
- Integração MCP para uso como ferramenta de IA externa

#### Melhorias Técnicas

- Novo sistema de tipos TypeScript para suporte à IA
- Handlers especializados para processamento de linguagem natural
- Sistema de detecção de contexto MCP automático
- Otimizações de performance para respostas da IA

#### Compatibilidade

- Mantém 100% de compatibilidade com versões anteriores
- Funciona tanto no modo tradicional quanto no modo IA
- Suporte para n8n até versão 1.3.0
- Pronto para n8n Cloud e instâncias self-hosted

## [0.3.1] - 2025-05-20

### Adicionado

#### Processamento Avançado de Webhooks

- Adição de metadados enriquecidos para eventos em webhook
- Implementação de métricas de cliente (LTV, score de qualidade, nível)
- Cálculo de probabilidade de renovação para assinaturas
- Detecção e processamento avançado de pagamentos parcelados
- Melhorias no processamento de eventos de abandono de carrinho
- Novos campos para distinguir entre novas assinaturas e renovações

#### Tipos e Interfaces

- Novas interfaces TypeScript para dados enriquecidos de webhook
- Tipagem forte para todos os novos campos e metadados
- Interfaces específicas para métricas de cliente e dados de pagamento

#### Testes

- Testes unitários para verificação de metadados de eventos
- Testes para detecção de pagamentos parcelados
- Testes para cálculo de métricas de cliente
- Testes de integração para processamento completo de webhooks

#### Documentação

- Documentação completa sobre novos metadados no README.md
- Atualização do guia HotmartSmartTrigger.md com novos recursos
- Exemplos de uso para as novas funcionalidades
- Atualização das seções de arquitetura e fluxo de dados

### Modificado

- Melhoria na detecção de tipos de pagamento (PIX, Boleto, Cartão)
- Otimização do processamento de webhooks para melhor desempenho
- Refinamento da função `createProcessedEvent` para incluir metadados enriquecidos
- Atualização da saída do modo Super Smart para incluir novos campos

### Corrigido

- Correção na detecção de assinaturas em eventos de webhook
- Ajustes nos tipos TypeScript para compatibilidade total
- Melhorias na manipulação de erros durante o processamento de eventos

## [0.3.0] - 2025-05-16

### Grande Refatoração e Melhorias

- Refatoração completa da codebase com arquitetura modular
- Implementação de tipagem forte para todos os recursos
- Sistema de tratamento de erros robusto com HotmartApiError
- Adição de logs estruturados em todas as operações
- Melhoria na detecção de assinaturas em eventos de webhook

### Atualizações da Fase 1-7

- Refatoração dos recursos Subscription, Sales, Product, Club, Coupon
- Implementação de interfaces específicas para cada recurso
- Centralização de endpoints no api.config.ts
- Padronização das operações em todos os recursos
- Remoção da operação customApiCall

### Testes e Documentação

- Configuração de estrutura de testes com Jest
- Implementação de testes unitários para helpers
- Testes de integração para fluxos completos
- Documentação completa no README.md
- Guia detalhado de contribuição em CONTRIBUTING.md
- Exemplos de uso em GUIA-DE-USO.md

### Melhorias Técnicas

- Melhoria do helper dateUtils com funções adicionais
- Implementação do outputFormatter com tipagem genérica
- Otimização do sistema de paginação automática
- Integração de constantes e enum para tipagem segura

## [0.2.0] - 2025-05-13

### Grandes Mudanças

- Implementado o novo nó HotmartTrigger para receber webhooks da Hotmart
- Removido o antigo HotmartRouter, substituído pelo HotmartTrigger

### Novas Funcionalidades

- Adicionado modo Smart Trigger para criar fluxos de trabalho complexos sem nós condicionais
- Implementado modo Super Smart com separação automática de:
  - Compras únicas/normais
  - Novas assinaturas
  - Renovações de assinaturas
- Adicionada detecção automática de método de pagamento, separando PIX de Boleto
- Personalização dos nomes de saída para melhorar a experiência visual

### Melhorias

- Sistema avançado de detecção de assinaturas usando vários métodos:
  - Verificação de dados de subscription.subscriber.code
  - Verificação de atributo purchase.is_subscription
  - Reconhecimento automático de eventos específicos de assinatura
- Adicionadas informações extras de pagamento como metadados:
  - paymentMethod: método de pagamento (PIX, BILLET, CREDIT_CARD, etc.)
  - paymentInfo: informações estruturadas (isBillet, isPix, isCard, isDigital)

### Segurança

- Suporte para verificação de token HOTTOK enviado pelo Hotmart no cabeçalho
- Validação de eventos para evitar processamento de dados não reconhecidos

## [0.1.1] - 2025-05-05

### Melhorias

- Implementada solução definitiva para paginação com 500 itens por página
- Adicionados logs de depuração para solucionar problemas de paginação
- Corrigido erro de compilação no arquivo pagination.ts

## [0.1.0] - 2025-04-15

### Versão Inicial

- Implementado nó Hotmart com autenticação OAuth2
- Suporte para operações básicas:
  - Assinaturas
  - Vendas
  - Produtos
  - Cupons
  - Área de Membros (Club)
  - Ingressos
- Paginação automática para retornar todos os resultados
- Integração com Sandbox e ambiente de produção
