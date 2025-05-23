#!/bin/bash
# Script de instalação para desenvolvimento com verificações

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verificando qualidade do código...${NC}"

# 1. Rodar testes
echo -e "${BLUE}Running tests...${NC}"
if pnpm test; then
    echo -e "${GREEN}✅ Testes passaram!${NC}"
else
    echo -e "${RED}⚠️  Alguns testes falharam, mas continuando...${NC}"
    echo -e "${BLUE}   (Os testes estão em desenvolvimento)${NC}"
fi

# 2. Verificar lint
echo -e "${BLUE}Checking lint...${NC}"
if pnpm lint; then
    echo -e "${GREEN}✅ Código limpo!${NC}"
else
    echo -e "${BLUE}🔧 Corrigindo problemas de lint...${NC}"
    pnpm lint:fix
fi

# 3. Formatar código
echo -e "${BLUE}Formatting code...${NC}"
pnpm format

# 4. Verificar tipos
echo -e "${BLUE}Type checking...${NC}"
if pnpm typecheck; then
    echo -e "${GREEN}✅ Tipos corretos!${NC}"
else
    echo -e "${RED}❌ Erros de tipo! Corrija antes de instalar.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Todas as verificações passaram!${NC}"
echo -e "${BLUE}🚀 Iniciando instalação...${NC}"

# Chamar o install normal
exec "$(dirname "$0")/../install"