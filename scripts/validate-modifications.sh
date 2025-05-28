#!/bin/bash

# Script para validar que as modificações estão presentes antes de compilar

echo "🔍 Validando modificações no código..."
echo "========================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "\n📌 Branch atual: ${YELLOW}$CURRENT_BRANCH${NC}"

# Verificar se há modificações não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Existem modificações não commitadas:${NC}"
    git status --short
fi

# Verificar se o arquivo HotmartTrigger tem as modificações de headers
echo -e "\n🔍 Verificando headers de debug no HotmartTrigger..."
if grep -q "X-Output-Index" nodes/Hotmart/HotmartTrigger.node.ts; then
    echo -e "${GREEN}✅ Headers de debug encontrados!${NC}"
    echo "   - X-Output-Index"
    echo "   - X-Output-Name"
    echo "   - X-Event-Type"
    echo "   - X-Mode"
else
    echo -e "${RED}❌ Headers de debug NÃO encontrados!${NC}"
    echo "   O código parece estar na versão de produção (sem headers)"
fi

# Verificar última modificação do arquivo
echo -e "\n📅 Última modificação do HotmartTrigger.node.ts:"
ls -la nodes/Hotmart/HotmartTrigger.node.ts | awk '{print "   " $6, $7, $8}'

# Verificar último commit que modificou o arquivo
echo -e "\n📝 Último commit que modificou o arquivo:"
git log -1 --pretty=format:"   %h - %s (%cr) <%an>" -- nodes/Hotmart/HotmartTrigger.node.ts

# Resumo
echo -e "\n\n========================================="
echo "📊 RESUMO:"
echo "========================================="

if grep -q "X-Output-Index" nodes/Hotmart/HotmartTrigger.node.ts; then
    echo -e "${GREEN}✅ Versão de DEBUG/TESTE detectada${NC}"
    echo "   Esta versão inclui headers para validação de roteamento"
    echo ""
    echo "   ⚠️  IMPORTANTE: Esta versão é apenas para testes!"
    echo "   Para produção, remova os headers de debug."
else
    echo -e "${YELLOW}📦 Versão de PRODUÇÃO detectada${NC}"
    echo "   Esta versão NÃO inclui headers de debug"
    echo ""
    echo "   Se precisar validar roteamento, use:"
    echo "   git checkout feat/codeloop-100-percent"
fi

echo ""
echo "Para compilar a versão atual:"
echo "  pnpm build"
echo "  pnpm pack"
echo ""