#!/bin/bash

# Script para garantir integridade do código de produção

echo "🔐 VERIFICAÇÃO DE INTEGRIDADE DO CÓDIGO DE PRODUÇÃO"
echo "===================================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para calcular hash de arquivo
calculate_hash() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        shasum -a 256 "$1" | awk '{print $1}'
    else
        # Linux
        sha256sum "$1" | awk '{print $1}'
    fi
}

echo -e "\n${BLUE}📁 Arquivos críticos para validação:${NC}"
echo "nodes/Hotmart/HotmartTrigger.node.ts"
echo "nodes/Hotmart/v1/HotmartV1.node.ts"

# Calcular hash do código fonte
TRIGGER_HASH=$(calculate_hash "nodes/Hotmart/HotmartTrigger.node.ts")
V1_HASH=$(calculate_hash "nodes/Hotmart/v1/HotmartV1.node.ts")

echo -e "\n${BLUE}🔑 Hashes do código fonte:${NC}"
echo "HotmartTrigger: $TRIGGER_HASH"
echo "HotmartV1: $V1_HASH"

# Salvar hashes para comparação futura
HASH_FILE="production-hashes.txt"
echo "# Hashes do código de produção - $(date)" > $HASH_FILE
echo "HotmartTrigger.node.ts: $TRIGGER_HASH" >> $HASH_FILE
echo "HotmartV1.node.ts: $V1_HASH" >> $HASH_FILE

# Verificar se há headers de debug
echo -e "\n${BLUE}🔍 Verificando presença de código de debug...${NC}"
if grep -q "X-Output-Index" nodes/Hotmart/HotmartTrigger.node.ts; then
    echo -e "${RED}❌ ATENÇÃO: Headers de debug encontrados!${NC}"
    echo "   Este NÃO é código de produção!"
    exit 1
else
    echo -e "${GREEN}✅ Código limpo - sem headers de debug${NC}"
fi

# Compilar e gerar hash do compilado
echo -e "\n${BLUE}🔨 Compilando código...${NC}"
pnpm build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Compilação bem-sucedida${NC}"
    
    # Hash dos arquivos compilados
    DIST_TRIGGER_HASH=$(calculate_hash "dist/nodes/Hotmart/HotmartTrigger.node.js")
    DIST_V1_HASH=$(calculate_hash "dist/nodes/Hotmart/v1/HotmartV1.node.js")
    
    echo -e "\n${BLUE}🔑 Hashes do código compilado:${NC}"
    echo "dist/HotmartTrigger: $DIST_TRIGGER_HASH"
    echo "dist/HotmartV1: $DIST_V1_HASH"
    
    # Adicionar ao arquivo
    echo "" >> $HASH_FILE
    echo "# Código compilado" >> $HASH_FILE
    echo "dist/HotmartTrigger.node.js: $DIST_TRIGGER_HASH" >> $HASH_FILE
    echo "dist/HotmartV1.node.js: $DIST_V1_HASH" >> $HASH_FILE
else
    echo -e "${RED}❌ Erro na compilação${NC}"
    exit 1
fi

# Executar testes de roteamento
echo -e "\n${BLUE}🧪 Executando testes de roteamento...${NC}"
pnpm test -- __tests__/unit/nodes/HotmartTrigger.routing.test.ts --silent

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Testes de roteamento passaram${NC}"
else
    echo -e "${RED}❌ Testes de roteamento falharam${NC}"
    exit 1
fi

# Criar pacote
echo -e "\n${BLUE}📦 Criando pacote...${NC}"
pnpm pack > /dev/null 2>&1
PACKAGE_FILE=$(ls -t *.tgz | head -1)

if [ -f "$PACKAGE_FILE" ]; then
    PACKAGE_HASH=$(calculate_hash "$PACKAGE_FILE")
    echo -e "${GREEN}✅ Pacote criado: $PACKAGE_FILE${NC}"
    echo "   Hash: $PACKAGE_HASH"
    
    echo "" >> $HASH_FILE
    echo "# Pacote final" >> $HASH_FILE
    echo "$PACKAGE_FILE: $PACKAGE_HASH" >> $HASH_FILE
else
    echo -e "${RED}❌ Erro ao criar pacote${NC}"
    exit 1
fi

# Resumo final
echo -e "\n${GREEN}===================================================="
echo "✅ CÓDIGO DE PRODUÇÃO VALIDADO"
echo "====================================================${NC}"
echo ""
echo "📋 Resumo:"
echo "- Código fonte sem debug: ✅"
echo "- Compilação bem-sucedida: ✅"
echo "- Testes de roteamento: ✅"
echo "- Pacote gerado: ✅"
echo ""
echo "📁 Hashes salvos em: $HASH_FILE"
echo ""
echo "🔐 Para verificar integridade futura:"
echo "   diff $HASH_FILE <(./scripts/verify-production-integrity.sh)"
echo ""
echo "📦 Para instalar:"
echo "   npm install --prefix ~/.n8n/nodes $PACKAGE_FILE"
echo ""