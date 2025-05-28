# 📁 Scripts do Projeto

Esta pasta contém todos os scripts utilitários do projeto n8n-nodes-hotmart.

## 🛡️ **Guardião Automático**

### Scripts Principais
- **`guardiao-watch.js`** - Motor principal do Guardião
- **`dev-with-guardiao.sh`** - Ambiente completo de desenvolvimento
- **`start-guardiao-fixed.sh`** - Inicialização standalone do Guardião
- **`guardiao-status.sh`** - Diagnóstico e status do Guardião

### Comandos Rápidos
```bash
# Ambiente completo
npm run dev

# Apenas Guardião
npm run guardiao:start

# Status
npm run guardiao:status

# Parar
npm run guardiao:stop
```

## 🤖 **CodeRabbit Analysis**

### Scripts Principais
- **`coderabbit`** - Interface principal (simplicada)
- **`coderabbit-analysis.sh`** - Menu interativo completo
- **`coderabbit-final.sh`** - Motor de análise otimizada
- **`list-prs.sh`** - Listagem de PRs
- **`coderabbit-simple.sh`** - Versão simplificada

### Comandos Rápidos
```bash
# Interface principal
npm run coderabbit

# Analisar PR específico
npm run coderabbit:pr 14

# Listar PRs
npm run coderabbit:list

# Uso direto
./scripts/coderabbit 14
```

## 🔧 **Scripts de Desenvolvimento**

### Utilitários Gerais
- **`dev-with-guardiao.sh`** - Ambiente de desenvolvimento completo
- **`backup.sh`** - Sistema de backup
- **`validate-changes.sh`** - Validação de mudanças
- **`health-check.sh`** - Verificação de saúde do projeto

### Build e Deploy
- **`build-and-install.sh`** - Build e instalação
- **`release.sh`** - Processo de release
- **`pre-push-check.sh`** - Verificações pré-push

## 📊 **Scripts de Teste**

### Webhook Testing
- **`generate-webhook-tests.ts`** - Geração de testes de webhook
- **`simulate-hotmart-events.ts`** - Simulação de eventos
- **`test-webhook-simple.sh`** - Testes simples de webhook

### Sistema de Testes
- **`run-tests.sh`** - Execução de testes
- **`test-combined.sh`** - Testes combinados
- **`validate-modifications.sh`** - Validação de modificações

## 🎯 **Como Usar**

### Desenvolvimento Diário
```bash
# 1. Iniciar ambiente
npm run dev

# 2. Análise de PR quando necessário
npm run coderabbit

# 3. Verificar status
npm run guardiao:status
```

### Setup Inicial
```bash
# Configurar tudo
./setup-guardiao

# Verificar saúde
./scripts/health-check.sh
```

### CI/CD
```bash
# Validações
./scripts/pre-push-check.sh

# Release
./scripts/release.sh patch
```

## 📋 **Estrutura Organizada**

```
scripts/
├── 🛡️ Guardião/
│   ├── guardiao-watch.js
│   ├── dev-with-guardiao.sh
│   ├── start-guardiao-fixed.sh
│   └── guardiao-status.sh
├── 🤖 CodeRabbit/
│   ├── coderabbit
│   ├── coderabbit-analysis.sh
│   ├── coderabbit-final.sh
│   ├── list-prs.sh
│   └── coderabbit-simple.sh
├── 🔧 Build/Deploy/
│   ├── build-and-install.sh
│   ├── release.sh
│   └── pre-push-check.sh
└── 🧪 Testing/
    ├── run-tests.sh
    ├── test-combined.sh
    └── webhook-test-system/
```

## ✅ **Vantagens da Nova Estrutura**

- **📦 Versionados no Git** - Todos os desenvolvedores têm acesso
- **🔧 Comando unificados** - Via npm scripts
- **📝 Documentação centralizada** - Tudo em um lugar
- **🚀 Setup automático** - Novos devs podem usar imediatamente
- **🛡️ Sem dependências externas** - Tudo auto-contido

---

**Atualizado em:** 28/05/2025  
**Versão:** 2.0 - Scripts Integrados ao Git