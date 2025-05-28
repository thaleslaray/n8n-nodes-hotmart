# 🤖 Scripts CodeRabbit - Sistema Otimizado

Sistema renovado para análise automática de PRs com CodeRabbit, gerando relatórios limpos e organizados.

## 🚀 Scripts Principais

### 1. **coderabbit-analysis.sh** (Interface Principal)
Script menu interativo unificado para todas as operações.

```bash
# Usar diretamente com número do PR
./coderabbit-analysis.sh 14

# Ou executar menu interativo
./coderabbit-analysis.sh
```

**Opções do menu:**
- 📋 Listar PRs disponíveis
- 🔍 Analisar PR específico (relatório limpo)
- 🛠️ Análise local (sem PR)
- 📄 Gerar relatório completo (formato legado)

### 2. **coderabbit-final.sh** (Motor de Análise)
Script otimizado que gera relatórios limpos e categorizados.

```bash
./coderabbit-final.sh 14
```

**Saída:** `coderabbit-pr-14.md` com:
- 🚨 Issues críticas (erros, segurança)
- 💡 Sugestões de melhoria (performance, qualidade)
- 🎨 Melhorias de estilo (formatação, convenções)

### 3. **list-prs.sh** (Utilitário)
Lista PRs disponíveis para análise.

```bash
./list-prs.sh
```

## 📊 Formato do Relatório Otimizado

O novo formato é **limpo** e **objetivo**:

```markdown
# 🤖 CodeRabbit - PR #14

| Campo | Valor |
|-------|-------|
| **Título** | [feat: RFC-007...](url) |
| **Autor** | @thaleslaray |
| **Data Análise** | 28/05/2025 10:18 |

## 📊 Resumo

| Categoria | Quantidade |
|-----------|------------|
| 🚨 **Críticas** | 2 |
| 💡 **Sugestões** | 8 |
| 🎨 **Estilo** | 3 |
| **Total** | **13** |

## 🚨 Issues Críticas (Prioridade Alta)

- **arquivo.ts:42** - Fix syntax error in YAML mapping
- **config.json:15** - Security vulnerability in API key

## 💡 Sugestões de Melhoria

- **main.ts:123** - Use async/await instead of callbacks
- **utils.js:67** - Add input validation for user data

## 🎯 Plano de Ação

### ✅ Para o Desenvolvedor
1. **Resolver issues críticas** 🚨
2. **Aplicar sugestões** 💡
3. **Ajustar estilo** 🎨
```

## 🔧 Scripts Legados (Mantidos)

### Para Compatibilidade
- `apply-coderabbit-fixed.sh` - Versão original com API Octokit
- `apply-coderabbit-gh.sh` - Versão com GitHub CLI
- `coderabbit-local.sh` - Análise local sem PR
- `coderabbit.sh` - Script original Node.js

## ⚡ Uso Rápido

### Fluxo Recomendado
```bash
# 1. Ver PRs disponíveis
./list-prs.sh

# 2. Analisar PR específico
./coderabbit-analysis.sh 14

# 3. Arquivo gerado: coderabbit-pr-14.md
```

### Integração com Claude
1. Execute o script de análise
2. Copie conteúdo do arquivo `.md` gerado
3. Cole no Claude Code
4. Claude aplicará as correções automaticamente

## 🎯 Vantagens do Novo Sistema

### ✅ Melhorias
- **Relatórios limpos** sem caracteres desnecessários
- **Categorização inteligente** por prioridade
- **Interface unificada** para todas as operações
- **Formato padronizado** e profissional
- **Estatísticas claras** de issues encontradas

### 🚀 Performance
- **Processamento otimizado** com menos calls à API
- **Caching inteligente** de dados do PR
- **Erro handling robusto** com fallbacks

### 📋 Organização
- **Priorização automática** (crítico > sugestão > estilo)
- **Plano de ação** incluído no relatório
- **Checklist** para desenvolvedor

## 🔗 Dependências

- **GitHub CLI** (`gh`) - `brew install gh`
- **jq** - `brew install jq`
- **Autenticação GitHub** configurada

## 📝 Configuração Inicial

```bash
# 1. Instalar dependências
brew install gh jq

# 2. Autenticar GitHub CLI
gh auth login

# 3. Tornar scripts executáveis
chmod +x .local/scripts/*.sh

# 4. Testar
.local/scripts/coderabbit-analysis.sh
```

---

**Última atualização:** 28/05/2025  
**Versão:** 2.0 (Sistema Otimizado)