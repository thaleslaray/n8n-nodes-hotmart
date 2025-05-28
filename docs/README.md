# 📚 Documentação do Projeto

Este diretório contém toda a documentação organizada do projeto n8n-nodes-hotmart.

## 📁 Estrutura de Diretórios

### 📊 `/analysis/`
Análises técnicas e estudos do projeto:
- Análises de casos extremos
- Análises de estrutura de webhooks
- Estudos de performance e arquitetura

### 📋 `/contexto/`
Contextos de sessões de desenvolvimento:
- Resumos de sessões de trabalho
- Estado do projeto em momentos específicos
- Histórico de decisões importantes

### 🔌 `/integration/`
Documentação de integrações externas:
- Integração com CodeRabbit
- Configurações de CI/CD
- Integrações com outras ferramentas

### 🔧 `/refactoring/`
Documentação de refatorações:
- Protocolos de segurança para refatoração
- Análises de impacto
- Planos de refatoração

### 📈 `/reports/`
Relatórios gerados automaticamente:
- Relatórios de testes (`test-report-*.md`)
- Relatórios de análise de código
- Informações de workflows criados
- **IMPORTANTE**: Todos os scripts devem gerar relatórios aqui, não na raiz!

### 📑 `/RFCs/`
Request for Comments - Propostas técnicas:
- RFCs implementadas
- Propostas de novas funcionalidades
- Discussões técnicas

### 📝 `/PRDs/`
Product Requirement Documents:
- Especificações de produtos
- Requisitos de funcionalidades
- Documentação de planejamento

## ⚠️ Regras Importantes

1. **NUNCA crie arquivos de relatório na raiz do projeto**
2. **Sempre use o diretório apropriado para cada tipo de documento**
3. **Scripts devem gerar saídas em `docs/reports/` por padrão**
4. **Arquivos temporários devem ir para `.local/`**

## 🛠️ Scripts Úteis

- `./scripts/organize-root-files.sh` - Organiza arquivos da raiz automaticamente
- `./scripts/monitor-root-files.sh` - Verifica se há arquivos indevidos na raiz

## 📝 Convenções de Nomenclatura

- **Relatórios de teste**: `test-report-[tipo]-YYYY-MM-DD.md`
- **Análises**: `[TIPO]-ANALYSIS-YYYY-MM-DD.md`
- **Contextos de sessão**: `SESSAO-DD-MM-YYYY.md`
- **RFCs**: `RFC-[numero]-[titulo].md`
- **PRDs**: `PRD-[numero]-[titulo].md`