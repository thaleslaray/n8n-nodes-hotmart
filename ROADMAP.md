# 🗺️ Roadmap - n8n-nodes-hotmart

Este documento lista as próximas features e melhorias planejadas para o projeto.

## 📌 Versão Atual: 0.6.4 (STABLE)

### ✅ Conquistas da v0.6.4
- Outputs dinâmicos 100% funcionais
- Smart mode: 15 outputs
- Super Smart mode: 18 outputs
- Scripts sem avisos de deprecação

## 🎯 Próximas Prioridades

### 1. **Cobertura de Testes - Os 3.19% Finais** 🧪
- **Status**: Planejado
- **Esforço**: 3-4 horas
- **Descrição**: Implementar testes para os 17 branches restantes
- **Detalhes**:
  - Branches de validação null/undefined (~5 branches)
  - Condições de arrays vazios (~4 branches)
  - Combinações de filtros específicos (~6 branches)
  - Casos de erro específicos (~2 branches)

### 2. **Novos Eventos de Webhook** 📡
- **Status**: Planejado
- **Esforço**: 1-2 dias por evento
- **Eventos planejados**:
  - [ ] CART_ABANDONED - Carrinho abandonado
  - [ ] CERTIFICATE_ISSUED - Certificado emitido
  - [ ] CERTIFICATE_REQUESTED - Certificado solicitado
  - [ ] PRODUCT_REVIEW - Avaliação de produto
  - [ ] LESSON_COMPLETED - Aula concluída
  - [ ] QUIZ_COMPLETED - Quiz concluído
  - [ ] SUPPORT_TICKET_CREATED - Ticket de suporte criado
  - [ ] SUPPORT_TICKET_CLOSED - Ticket de suporte fechado

### 3. **Documentação Aprimorada** 📚
- **Status**: Em andamento
- **Esforço**: Contínuo
- **Tarefas**:
  - [ ] Criar guia de troubleshooting detalhado
  - [ ] Adicionar exemplos de código para cada operação
  - [ ] Gravar vídeos tutoriais
  - [ ] Documentar casos de uso comuns
  - [ ] Criar FAQ com problemas frequentes
  - [ ] Traduzir documentação para inglês

### 4. **Templates de Workflows** 🔧
- **Status**: Planejado
- **Esforço**: 1 semana
- **Templates planejados**:
  - [ ] Onboarding automatizado de novos clientes
  - [ ] Sistema de notificações de vendas
  - [ ] Gestão de assinaturas vencidas
  - [ ] Relatórios automatizados de vendas
  - [ ] Integração com CRM (HubSpot, Pipedrive)
  - [ ] Integração com plataformas de email
  - [ ] Dashboard de métricas em tempo real

### 5. **Otimizações de Performance** ⚡
- **Status**: Pesquisa
- **Esforço**: 2-3 semanas
- **Melhorias**:
  - [ ] Implementar cache Redis para requisições frequentes
  - [ ] Batch processing para operações em massa
  - [ ] Pool de conexões HTTP persistentes
  - [ ] Compressão de payloads grandes
  - [ ] Rate limiting inteligente
  - [ ] Processamento assíncrono de webhooks

### 6. **CI/CD Completo** 🔄
- **Status**: Planejado
- **Esforço**: 1 semana
- **Componentes**:
  - [ ] GitHub Actions para testes automáticos
  - [ ] Verificação de cobertura em PRs
  - [ ] Build e release automático
  - [ ] Deploy automático para NPM
  - [ ] Testes de integração automatizados
  - [ ] Verificação de segurança (Snyk/Dependabot)
  - [ ] Changelog automático

## 🚀 Features Futuras (Backlog)

### Integrações Avançadas
- [ ] Suporte para Hotmart Connect
- [ ] Integração com Hotmart Sparkle
- [ ] API de Analytics avançada
- [ ] Webhooks bidirecionais

### Melhorias de UX
- [ ] Interface customizada para configuração
- [ ] Validação em tempo real de credenciais
- [ ] Preview de dados antes de executar
- [ ] Modo debug aprimorado

### Funcionalidades Enterprise
- [ ] Multi-tenant support
- [ ] Audit logs detalhados
- [ ] Métricas de uso por operação
- [ ] Rate limiting por cliente

## 📊 Métricas de Sucesso

- Manter cobertura de testes > 95%
- Tempo de resposta < 500ms para 95% das requisições
- Zero breaking changes em minor releases
- Documentação atualizada para 100% das features

## 🤝 Como Contribuir

1. Escolha um item do roadmap
2. Abra uma issue para discussão
3. Implemente seguindo os padrões do projeto
4. Abra um PR com testes completos

## 📅 Versionamento Planejado

- **v0.7.0**: Novos eventos de webhook (Q1 2025)
- **v0.8.0**: Templates de workflows (Q2 2025)
- **v0.9.0**: Otimizações de performance (Q2 2025)
- **v1.0.0**: Release estável com CI/CD completo (Q3 2025)

---

💡 **Sugestões?** Abra uma issue com a tag `enhancement`!