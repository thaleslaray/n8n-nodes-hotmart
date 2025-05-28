#!/bin/bash

# Script para limpar e organizar o workspace
# Mantém apenas arquivos essenciais na raiz

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧹 Limpando e organizando workspace...${NC}"
echo "================================================"

# Criar diretórios se não existirem
mkdir -p .local/temp
mkdir -p docs/reports
mkdir -p docs/codeloop

# Mover arquivos do Guardião
if ls .guardiao-snapshot*.json 1> /dev/null 2>&1; then
    echo -e "${BLUE}📁 Movendo arquivos do Guardião...${NC}"
    mv .guardiao-snapshot*.json .local/ 2>/dev/null || true
fi

# Mover relatórios de teste
if ls test-report*.md test-report*.json test-results.json test-report.log test-full-output.log webhook-test-results.tmp 1> /dev/null 2>&1; then
    echo -e "${BLUE}📊 Movendo relatórios de teste...${NC}"
    mv test-report*.md test-report*.json test-results.json test-report.log test-full-output.log webhook-test-results.tmp docs/reports/ 2>/dev/null || true
fi

# Mover documentação específica
if ls CODELOOP*.md CONTEXTO*.md 1> /dev/null 2>&1; then
    echo -e "${BLUE}📚 Movendo documentação do Codeloop...${NC}"
    mv CODELOOP*.md CONTEXTO*.md docs/codeloop/ 2>/dev/null || true
fi

# Mover outros documentos
if ls BRANCH-STRATEGY.md REFACTORING-SUMMARY.md SECURITY*.md SECURITY*.html 1> /dev/null 2>&1; then
    echo -e "${BLUE}📄 Movendo documentação adicional...${NC}"
    mv BRANCH-STRATEGY.md REFACTORING-SUMMARY.md docs/ 2>/dev/null || true
    mv SECURITY*.md SECURITY*.html docs/ 2>/dev/null || true
fi

# Mover arquivos temporários
if ls n8n.log junit.xml created-workflows*.json production-hashes.txt claude-conversations-report.json 1> /dev/null 2>&1; then
    echo -e "${BLUE}🗑️  Movendo arquivos temporários...${NC}"
    mv n8n.log junit.xml created-workflows*.json production-hashes.txt claude-conversations-report.json .local/temp/ 2>/dev/null || true
fi

# Remover arquivos desnecessários
echo -e "${BLUE}🗑️  Removendo arquivos desnecessários...${NC}"
rm -f .DS_Store n8n-nodes-hotmart-*.tgz 2>/dev/null || true

# Contar arquivos na raiz
ROOT_FILES=$(ls -la | grep "^-" | wc -l)
ESSENTIAL_FILES=$(ls -la | grep -E "^-" | grep -E "(README|LICENSE|CHANGELOG|package.json|tsconfig.json|jest.config.js|gulpfile.js|.gitignore|eslint.config.js|pnpm-lock.yaml|codecov.yml|typedoc.json|CLAUDE.md)" | wc -l)
NON_ESSENTIAL=$((ROOT_FILES - ESSENTIAL_FILES))

echo ""
echo -e "${GREEN}✅ Workspace limpo e organizado!${NC}"
echo ""
echo -e "${BLUE}📊 Estatísticas:${NC}"
echo "  - Arquivos na raiz: $ROOT_FILES"
echo "  - Arquivos essenciais: $ESSENTIAL_FILES"
echo "  - Arquivos movidos/removidos: $NON_ESSENTIAL"
echo ""
echo -e "${BLUE}📁 Estrutura organizada:${NC}"
echo "  - .local/temp/ → Arquivos temporários"
echo "  - .local/scripts/ → Scripts de desenvolvimento"
echo "  - docs/reports/ → Relatórios de teste"
echo "  - docs/codeloop/ → Documentação do Codeloop"
echo ""
echo -e "${YELLOW}💡 Dica: Execute regularmente para manter o workspace limpo!${NC}"