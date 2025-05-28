#!/bin/bash

# Script simplificado para testar webhooks
# Usa os mesmos dados reais mas sem dependência de workflows criados

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 TESTE DE WEBHOOK SIMPLIFICADO${NC}"
echo "===================================="

# Verificar se n8n está rodando
if ! curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
    echo -e "${RED}❌ n8n não está rodando!${NC}"
    echo "Execute ./start-n8n primeiro"
    exit 1
fi

# Função para testar webhook
test_webhook() {
    local WEBHOOK_PATH=$1
    local EVENT_TYPE=$2
    local FIXTURE_FILE=$3
    
    echo -n "  - $EVENT_TYPE: "
    
    # Se o arquivo de fixture existe, use-o
    if [ -f "$FIXTURE_FILE" ]; then
        RESPONSE=$(curl -X POST "http://localhost:5678/webhook/$WEBHOOK_PATH" \
            -H "Content-Type: application/json" \
            -H "X-Hotmart-Hottok: test-token" \
            -d @"$FIXTURE_FILE" \
            -s -w "\n%{http_code}" 2>&1 | tail -1)
    else
        # Usar dados mínimos
        RESPONSE=$(curl -X POST "http://localhost:5678/webhook/$WEBHOOK_PATH" \
            -H "Content-Type: application/json" \
            -H "X-Hotmart-Hottok: test-token" \
            -d "{\"event\":\"$EVENT_TYPE\",\"data\":{\"test\":true}}" \
            -s -w "\n%{http_code}" 2>&1 | tail -1)
    fi
    
    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅${NC}"
        return 0
    else
        echo -e "${RED}❌ (HTTP $RESPONSE)${NC}"
        return 1
    fi
}

# Lista de eventos para testar
declare -a EVENTS=(
    "PURCHASE_APPROVED"
    "PURCHASE_COMPLETE"
    "PURCHASE_CANCELED"
    "PURCHASE_REFUNDED"
    "PURCHASE_OUT_OF_SHOPPING_CART"
    "SUBSCRIPTION_CANCELLATION"
)

echo ""
echo -e "${YELLOW}NOTA: Este teste assume que você tem workflows ativos com webhooks.${NC}"
echo -e "${YELLOW}Se não tiver, crie manualmente no n8n e anote os paths.${NC}"
echo ""

# Pedir o path do webhook
echo -n "Digite o path do webhook (ex: test-hotmart ou pressione ENTER para pular): "
read WEBHOOK_PATH

if [ -z "$WEBHOOK_PATH" ]; then
    echo -e "${YELLOW}⚠️  Teste de webhook pulado${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🌐 Testando webhook: /webhook/$WEBHOOK_PATH${NC}"
echo "--------------------------------------------"

SUCCESS=0
FAILED=0

# Testar cada evento
for EVENT in "${EVENTS[@]}"; do
    # Converter evento para nome de arquivo
    FIXTURE_NAME=$(echo "$EVENT" | tr '[:upper:]' '[:lower:]' | tr '_' '-')
    FIXTURE_PATH="__tests__/fixtures/webhook-fixtures-anon/$FIXTURE_NAME/1.json"
    
    if test_webhook "$WEBHOOK_PATH" "$EVENT" "$FIXTURE_PATH"; then
        ((SUCCESS++))
    else
        ((FAILED++))
    fi
done

# Resumo
echo ""
echo -e "${BLUE}📊 RESUMO${NC}"
echo "--------------------------------------------"
echo -e "${GREEN}✅ Sucesso: $SUCCESS${NC}"
echo -e "${RED}❌ Falhou: $FAILED${NC}"
echo -e "${BLUE}📊 Total: $((SUCCESS + FAILED))${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    exit 0
else
    exit 1
fi