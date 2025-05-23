#!/bin/bash

echo "🌐 LIMPEZA DE CACHE VIA API"
echo "=========================="
echo

N8N_URL="http://localhost:5678"

# Verificar se n8n está rodando
if ! curl -s "$N8N_URL/healthz" >/dev/null 2>&1; then
    echo "❌ n8n não está rodando em $N8N_URL"
    echo "   Inicie o n8n primeiro: n8n start"
    exit 1
fi

echo "✅ n8n detectado em $N8N_URL"

# Tentar limpar cache via API (se endpoint existir)
echo "🧹 Tentando limpar cache..."

# Endpoint de restart (força reload)
if curl -s -X POST "$N8N_URL/rest/debug/restart" 2>/dev/null; then
    echo "✅ Restart solicitado via API"
else
    echo "⚠️  Endpoint de restart não disponível"
fi

# Endpoint de clear cache (se existir)
if curl -s -X POST "$N8N_URL/rest/debug/clear-cache" 2>/dev/null; then
    echo "✅ Cache limpo via API"
else
    echo "⚠️  Endpoint de clear-cache não disponível"
fi

echo
echo "💡 Se API não funcionar, use:"
echo "   ./scripts/clear-n8n-cache.sh"
echo "   ./scripts/start-n8n-fresh.sh"