# 🗺️ Roadmap - n8n-nodes-hotmart

Este documento lista as próximas features e melhorias planejadas para o projeto.

## 📌 Versão Atual: 0.6.6 (STABLE)

### ✅ Conquistas Recentes
- Outputs dinâmicos 100% funcionais
- Smart mode: 15 outputs separados por tipo de evento
- Super Smart mode: 18 outputs com separação granular
- Scripts sem avisos de deprecação
- Lint 100% limpo (zero warnings)
- RFC-007 completa (workflows exemplo, templates GitHub, CI/CD)
- Cobertura de testes: 93.24%

## 🎯 Próximas Prioridades

### 1. **Cobertura de Testes - Os Últimos 6.76%** 🧪
- **Status**: Planejado
- **Esforço**: 3-4 horas
- **Meta**: Alcançar 100% de cobertura
- **Detalhes**:
  - Branches de validação null/undefined
  - Condições de arrays vazios
  - Combinações de filtros específicos
  - Casos de erro específicos

### 2. **Melhorias na Documentação** 📚
- **Status**: Em andamento
- **Esforço**: Contínuo
- **Tarefas**:
  - [ ] Criar guia completo de troubleshooting
  - [ ] Documentar cada operação com exemplos reais
  - [ ] Criar vídeos tutoriais em português
  - [ ] FAQ com problemas e soluções comuns
  - [ ] Guia de migração de versões antigas

### 3. **Templates de Workflows Avançados** 🔧
- **Status**: Parcialmente completo (6 templates básicos já criados)
- **Esforço**: 1 semana
- **Templates planejados**:
  - [ ] Sistema completo de onboarding de clientes
  - [ ] Automação de cobranças e inadimplência
  - [ ] Gestão avançada de assinaturas
  - [ ] Relatórios automatizados com gráficos
  - [ ] Integração com CRMs populares (HubSpot, RD Station)
  - [ ] Integração com plataformas de email marketing
  - [ ] Sistema de notificações multi-canal

### 4. **Completar Cobertura de Operações da API** 🔌
- **Status**: Análise
- **Esforço**: 1-2 dias por operação
- **Operações já implementadas**:
  - ✅ Club - getAll, getModules, getPages, getProgress
  - ✅ Coupon - create, delete, get
  - ✅ Product - getAll
  - ✅ Sales - 6 operações completas
  - ✅ Subscription - 10 operações completas
  - ✅ Tickets - getAll, getInfo
  - ✅ Negotiate - generateNegotiation
- **Possíveis adições** (verificar disponibilidade na API):
  - [ ] Operações batch para cupons
  - [ ] Mais filtros em consultas existentes
  - [ ] Endpoints novos que a Hotmart liberar

### 5. **Melhorias de Performance** ⚡
- **Status**: Planejado
- **Esforço**: 1-2 semanas
- **Otimizações**:
  - [ ] Cache inteligente para operações GET
  - [ ] Processamento em lote (batch)
  - [ ] Retry automático com backoff exponencial
  - [ ] Conexões HTTP persistentes
  - [ ] Compressão de requests/responses

### 6. **Melhorias no HotmartTrigger** 🎯
- **Status**: Planejado
- **Esforço**: 3-5 dias
- **Features**:
  - [ ] Filtros avançados por produto/oferta
  - [ ] Validação de assinatura do webhook (HMAC)
  - [ ] Modo de debug com logs detalhados
  - [ ] Suporte a múltiplos webhooks simultâneos
  - [ ] Fila de processamento para alta carga

## 🚀 Features Futuras (Backlog)

### Integrações com Ecossistema Hotmart
- [ ] Novas APIs que a Hotmart disponibilizar
- [ ] Endpoints adicionais conforme documentação oficial

### Melhorias de Developer Experience
- [ ] CLI para gerar boilerplate de operações
- [ ] Testes automatizados contra sandbox Hotmart
- [ ] Mock server para desenvolvimento local
- [ ] Gerador de tipos TypeScript da API

### Features Enterprise
- [ ] Rate limiting inteligente por conta
- [ ] Logs estruturados para observability
- [ ] Métricas Prometheus/Grafana
- [ ] Suporte a proxy corporativo

## 📊 Métricas de Qualidade

### Metas Atuais
- ✅ Cobertura de testes > 90% (atual: 93.24%)
- ✅ Zero warnings de lint
- ✅ Build sem erros de TypeScript
- ✅ Todos os eventos webhook suportados
- 🎯 Documentação 100% completa
- 🎯 Tempo de resposta < 1s para 95% das operações

## 🤝 Como Contribuir

1. Verifique se a feature existe na API Hotmart
2. Abra uma issue para discussão
3. Siga o padrão de código existente
4. Implemente com testes (mínimo 80% cobertura)
5. Atualize documentação
6. Abra PR com descrição detalhada

## 📅 Histórico de Versões

- **v0.6.6**: Lint 100% limpo, RFC-007 completa
- **v0.6.4**: Outputs dinâmicos, modo Super Smart
- **v0.6.0**: Webhook trigger completo
- **v0.5.x**: Operações básicas da API

## ⚠️ Notas Importantes

1. **Sempre verifique a documentação oficial da Hotmart** antes de adicionar features
2. **Não invente eventos ou operações** - use apenas o que a API suporta
3. **Mantenha retrocompatibilidade** - nunca quebre fluxos existentes
4. **Teste em produção** antes de marcar como estável

## 📌 Operações e Eventos Confirmados da API

### Operações Implementadas ✅
- **Club**: getAll, getModules, getPages, getProgress
- **Coupon**: create, delete, get
- **Product**: getAll
- **Sales**: getComissoesVendas, getDetalhamentoPrecos, getHistoricoVendas, getParticipantesVendas, getResumoVendas, solicitarReembolso
- **Subscription**: getAll, cancel, cancelList, changeBillingDate, getPurchases, getSummary, getTransactions, reactivate, reactivateList
- **Tickets**: getAll, getInfo
- **Negotiate**: generateNegotiation

### Eventos de Webhook Suportados ✅
- **Eventos de Compra**: PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_CANCELED, PURCHASE_REFUNDED, PURCHASE_CHARGEBACK, PURCHASE_BILLET_PRINTED, PURCHASE_DELAYED, PURCHASE_PROTEST, PURCHASE_OUT_OF_SHOPPING_CART, PURCHASE_EXPIRED
- **Eventos de Assinatura**: SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, UPDATE_SUBSCRIPTION_CHARGE_DATE
- **Eventos de Área de Membros**: CLUB_FIRST_ACCESS, CLUB_MODULE_COMPLETED

---

💡 **Sugestões?** Abra uma issue com link para documentação oficial da API Hotmart!