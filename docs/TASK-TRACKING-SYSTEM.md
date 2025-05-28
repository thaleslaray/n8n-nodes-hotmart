# 🎯 Sistema de Rastreamento de Tarefas - Single Source of Truth

## ❌ O Problema Atual

Hoje temos múltiplas fontes de "verdade" desconectadas:
- RFCs em `.local/docs/RFCs/` (nem sempre visíveis)
- ROADMAP.md com tarefas genéricas
- Issues no GitHub (se existirem)
- TODOs espalhados no código
- Branches sem contexto claro
- Sessões de trabalho sem rastreamento

**Resultado**: Confusão sobre o que já foi feito e qual o próximo passo real.

## ✅ Solução Proposta: GitHub Issues como Single Source of Truth

### 1. **Cada RFC/ADR vira uma Issue Epic**

```markdown
# Issue Title: [RFC-007] Repository Enhancements
Labels: RFC, Epic
Milestone: v0.7.0

## RFC Document
Link: /docs/RFCs/RFC-007-repository-enhancements.md

## Checklist de Implementação
- [ ] Workflows de exemplo (#101)
- [ ] Templates GitHub (#102)  
- [ ] GitHub Actions CI/CD (#103)
- [x] Badges no README
- [x] CONTRIBUTING.md
- [x] CODE_OF_CONDUCT.md

## Status
Progress: 3/6 (50%)
```

### 2. **Branch SEMPRE vinculado a Issue**

```bash
# Formato: tipo/issue-numero-descricao
git checkout -b feat/101-workflow-examples
git checkout -b feat/102-github-templates
git checkout -b fix/104-lint-warning-request
```

### 3. **Commits referenciam Issues**

```bash
git commit -m "feat: add basic workflow examples

- Add simple product list example
- Add subscription management example
- Add webhook handler example

Implements part of #101
Related to RFC #100"
```

### 4. **Status File na Raiz (TASKS.md)**

```markdown
# 📋 TASKS.md - Status Atual do Projeto

> Última atualização: 28/05/2025 por @thaleslaray
> Veja issues completas em: https://github.com/thaleslaray/n8n-nodes-hotmart/issues

## 🚧 Em Progresso

### [#100] RFC-007: Repository Enhancements (Epic)
- **Branch**: main (sub-tarefas têm branches próprios)
- **Status**: 3/6 completo (50%)
- **Próximo**: Issue #101 - Workflow Examples

### [#104] Fix lint warning in request.ts
- **Branch**: fix/104-lint-warning-request
- **Status**: Não iniciado
- **Estimativa**: 30min

## ✅ Concluído Recentemente

### [#99] Webhook Refactoring - Baby Steps Protocol
- **Branches**: Múltiplos commits no main
- **Status**: COMPLETO ✅
- **Commits**: 0b35c9b, 40bd095, bb9ea4d, aebf48e, 9e904c3, 8336a0c

## 📅 Próximos na Fila

1. [#101] Criar workflows de exemplo - **Prioridade ALTA**
2. [#102] Templates GitHub - Prioridade média
3. [#103] GitHub Actions - Prioridade média
4. [#104] Fix lint warning - Prioridade baixa

## 🔗 Links Úteis

- [Todas as Issues](https://github.com/thaleslaray/n8n-nodes-hotmart/issues)
- [Projeto Board](https://github.com/thaleslaray/n8n-nodes-hotmart/projects/1)
- [Milestones](https://github.com/thaleslaray/n8n-nodes-hotmart/milestones)
```

### 5. **GitHub Project Board Automático**

Criar um Project Board com colunas:
- **Backlog**: Issues criadas
- **Ready**: Issues refinadas e prontas
- **In Progress**: Branch criado e trabalho iniciado
- **Review**: PR aberto
- **Done**: PR mergeado

### 6. **Automação com GitHub Actions**

```yaml
# .github/workflows/update-tasks.yml
name: Update TASKS.md

on:
  issues:
    types: [opened, closed, reopened]
  pull_request:
    types: [opened, closed]

jobs:
  update-tasks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update TASKS.md
        run: |
          # Script para atualizar TASKS.md automaticamente
          # baseado no estado das issues
```

### 7. **Template de Issue para RFCs**

```yaml
# .github/ISSUE_TEMPLATE/rfc.yml
name: 📋 RFC Implementation
description: Track implementation of an RFC
title: "[RFC-XXX] "
labels: ["RFC", "Epic"]
body:
  - type: input
    id: rfc-number
    attributes:
      label: RFC Number
      placeholder: "RFC-007"
    validations:
      required: true
      
  - type: textarea
    id: checklist
    attributes:
      label: Implementation Checklist
      value: |
        - [ ] Task 1
        - [ ] Task 2
        - [ ] Task 3
      
  - type: input
    id: rfc-link
    attributes:
      label: RFC Document Link
      placeholder: "/docs/RFCs/RFC-007.md"
```

## 🔄 Workflow Completo

1. **Criar RFC** → Arquivo em `/docs/RFCs/`
2. **Criar Issue Epic** → GitHub Issue com checklist
3. **Criar Sub-Issues** → Uma para cada item do checklist
4. **Criar Branch** → `tipo/issue-numero-descricao`
5. **Desenvolver** → Commits referenciam issue
6. **Abrir PR** → Fecha automaticamente a issue
7. **TASKS.md** → Atualizado automaticamente

## 🎯 Benefícios

1. **Single Source of Truth**: GitHub Issues
2. **Rastreabilidade**: Cada mudança tem contexto
3. **Visibilidade**: Status claro em TASKS.md
4. **Automação**: Menos trabalho manual
5. **Histórico**: Tudo documentado
6. **Colaboração**: Fácil para novos contribuidores

## 🚀 Implementação Imediata

```bash
# 1. Criar Issue para RFC-007
gh issue create --title "[RFC-007] Repository Enhancements" \
  --body "Implementation tracking for RFC-007" \
  --label "RFC,Epic"

# 2. Criar sub-issues
gh issue create --title "Create workflow examples" \
  --body "Implements examples/ directory from RFC-007" \
  --label "enhancement"

# 3. Criar TASKS.md inicial
touch TASKS.md

# 4. Configurar alias útil
git config --global alias.task '!f() { git checkout -b feat/$1-$(echo $2 | tr " " "-" | tr "[:upper:]" "[:lower:]"); }; f'

# Uso: git task 101 "workflow examples"
# Cria: feat/101-workflow-examples
```

## 📝 Regras de Ouro

1. **NUNCA** trabalhe sem uma issue associada
2. **SEMPRE** atualize TASKS.md ao iniciar/terminar trabalho
3. **SEMPRE** use branches descritivos com número da issue
4. **SEMPRE** feche issues com commits ou PRs
5. **REVISE** TASKS.md semanalmente

---

**Com esse sistema, NUNCA MAIS teremos confusão sobre o que fazer em seguida!**