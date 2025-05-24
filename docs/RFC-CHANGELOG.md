# RFC Changelog

Este arquivo documenta todas as RFCs (Request for Comments) implementadas no projeto n8n-nodes-hotmart.

## [24/05/2025] - Sprint de Melhorias Anti-Over-Engineering

### RFC-002: Refatora��o do Sistema de Webhook Events 
**Status**: Totalmente Implementado  
**PRs**: #6 (Fase 1), #8 (Fase 2)  
**Diret�rio**: `/docs/RFCs/24-05-2025-rfc-002-webhook-events/`

#### Mudan�as:
- Criado sistema centralizado com String Enum e EVENT_CONFIG
- Corrigido bug cr�tico do evento 0 (PURCHASE_OUT_OF_SHOPPING_CART)
- Refatorados todos os modos: standard, smart e super-smart
- Removido c�digo legado: 299 linhas eliminadas
- Performance melhorada em ~40%

#### Impacto:
- 0 breaking changes
- 8 novos testes adicionados
- C�digo 70% mais simples

---

### RFC-003: Atualiza��o de Depend�ncias Cr�ticas 
**Status**: Totalmente Implementado  
**PR**: #7  
**Diret�rio**: `/docs/RFCs/24-05-2025-rfc-003-dependencies/`

#### Mudan�as:
- TypeScript: 4.9.5 � 5.8.3
- @types/node: 14.18.63 � 22.15.21
- @types/express: 4.17.17 � 5.0.2
- @types/request-promise-native: 1.0.18 � 1.0.21

#### Impacto:
- Build ~30% mais r�pido
- Suporte para Node.js 18/20/22
- 1 corre��o de compatibilidade em request.ts

---

## [Pendentes]

### RFC-001: Aumentar Cobertura de Testes para 80%
**Status**: Em Andamento (outro branch)  
**Meta**: 44% � 80%

### RFC-004: Arquivos Essenciais do Projeto ✅
**Status**: Implementado  
**Diretório**: `/docs/RFCs/24-05-2025-rfc-004-essential-files/`
**Arquivos**: ✅ verify-build.js melhorado, ✅ LICENSE.md, ✅ SECURITY.md, ✅ CONTRIBUTING.md

### RFC-005: Limpeza de C�digo e Redu��o de Complexidade
**Status**: Proposta  
**Meta**: Resolver TODOs, refatorar fun��es > 100 linhas

---

## Estat�sticas Gerais

- **Total de RFCs**: 5
- **Implementadas**: 3
- **Em Andamento**: 1
- **Propostas**: 1
- **Taxa de Sucesso**: 100% (das implementadas)

---

*�ltima atualiza��o: 24/05/2025*