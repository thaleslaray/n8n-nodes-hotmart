#!/bin/bash

# Script de validação pré-push
# Executa todos os testes necessários antes de fazer push

echo "🔍 Verificando antes do push..."
echo "================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Executar testes
echo -e "\n📋 Executando testes..."
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Testes passaram${NC}"
else
    echo -e "${RED}❌ Testes falharam${NC}"
    ((ERRORS++))
fi

# 2. Verificar lint
echo -e "\n🔍 Verificando lint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Lint OK${NC}"
else
    echo -e "${RED}❌ Lint falhou${NC}"
    ((ERRORS++))
fi

# 3. Verificar tipos TypeScript
echo -e "\n📝 Verificando tipos TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript OK${NC}"
else
    echo -e "${RED}❌ TypeScript falhou${NC}"
    ((ERRORS++))
fi

# 4. Verificar build
echo -e "\n🔨 Verificando build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build OK${NC}"
else
    echo -e "${RED}❌ Build falhou${NC}"
    ((ERRORS++))
fi

# 5. Verificar instalação (opcional, mais demorado)
if [ "$1" == "--full" ]; then
    echo -e "\n📦 Testando instalação completa..."
    if ./install > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Instalação OK${NC}"
    else
        echo -e "${RED}❌ Instalação falhou${NC}"
        ((ERRORS++))
    fi
fi

# Resultado final
echo -e "\n================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo OK! Seguro para push${NC}"
    echo -e "\nPróximo passo: ${YELLOW}git push origin <branch>${NC}"
    exit 0
else
    echo -e "${RED}❌ Encontrados $ERRORS problemas${NC}"
    echo -e "\nCorreija os problemas antes de fazer push!"
    echo -e "Para mais detalhes, execute os comandos individualmente."
    exit 1
fi