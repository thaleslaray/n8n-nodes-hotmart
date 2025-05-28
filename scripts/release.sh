#!/bin/bash

# 🚀 SCRIPT DE RELEASE COMPLETO
# Cria release e executa validação automática

echo "🎯 PROCESSO DE RELEASE - n8n-nodes-hotmart"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar se foi passado o tipo de release
if [ -z "$1" ]; then
    echo -e "${YELLOW}Uso: ./scripts/release.sh [patch|minor|major]${NC}"
    echo ""
    echo "Exemplos:"
    echo "  ./scripts/release.sh patch  # 0.6.1 → 0.6.2"
    echo "  ./scripts/release.sh minor  # 0.6.1 → 0.7.0"
    echo "  ./scripts/release.sh major  # 0.6.1 → 1.0.0"
    exit 1
fi

RELEASE_TYPE=$1

# 1. VERIFICAR STATUS GIT
echo -e "${BLUE}📋 Verificando status do Git...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Existem mudanças não commitadas!${NC}"
    echo "Por favor, faça commit ou stash das mudanças antes de criar o release."
    exit 1
fi

# 2. EXECUTAR TESTES
echo ""
echo -e "${BLUE}🧪 Executando testes...${NC}"
pnpm test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Testes falharam! Corrija antes de fazer release.${NC}"
    exit 1
fi

# 3. VERIFICAR LINT
echo ""
echo -e "${BLUE}🔍 Verificando código (lint)...${NC}"
pnpm lint

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Problemas de lint encontrados!${NC}"
    exit 1
fi

# 4. CRIAR RELEASE
echo ""
echo -e "${BLUE}📦 Criando release ${RELEASE_TYPE}...${NC}"
pnpm release:${RELEASE_TYPE}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao criar release${NC}"
    exit 1
fi

# Pegar nova versão
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Release v${NEW_VERSION} criado!${NC}"

# 5. BUILD
echo ""
echo -e "${BLUE}🏗️  Compilando projeto...${NC}"
pnpm build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro na compilação${NC}"
    exit 1
fi

# 6. CRIAR PACOTE
echo ""
echo -e "${BLUE}📦 Criando pacote .tgz...${NC}"
pnpm pack

# 7. PUSH PARA GITHUB
echo ""
echo -e "${BLUE}📤 Enviando para GitHub...${NC}"
git push origin main --follow-tags

# 8. EXECUTAR VALIDAÇÃO PÓS-RELEASE
echo ""
echo -e "${BLUE}🔧 Executando validação pós-release...${NC}"
echo ""
./scripts/test-automation/post-release-validation.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Validação falhou!${NC}"
    echo -e "${YELLOW}⚠️  O release foi criado mas a validação falhou.${NC}"
    echo "Por favor, verifique os logs e corrija os problemas."
    exit 1
fi

# 9. RESUMO FINAL
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 RELEASE v${NEW_VERSION} COMPLETO!${NC}"
echo ""
echo -e "${BLUE}📋 Resumo:${NC}"
echo "   ✅ Testes passaram"
echo "   ✅ Lint OK"
echo "   ✅ Build OK"
echo "   ✅ Tag criada e enviada"
echo "   ✅ Validação pós-release OK"
echo ""
echo -e "${YELLOW}📌 Próximos passos:${NC}"
echo "   1. Vá para: https://github.com/SEU_USUARIO/n8n-nodes-hotmart/releases"
echo "   2. Clique em 'Draft a new release'"
echo "   3. Escolha a tag v${NEW_VERSION}"
echo "   4. Adicione as release notes"
echo "   5. Anexe o arquivo: n8n-nodes-hotmart-${NEW_VERSION}.tgz"
echo "   6. Publique o release"
echo ""
echo -e "${GREEN}✨ Parabéns pelo novo release!${NC}"

exit 0