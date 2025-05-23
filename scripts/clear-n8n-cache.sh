#!/bin/bash

echo "🧹 LIMPEZA FORÇADA DE CACHE N8N"
echo "==============================="
echo

# Detectar se é n8n local ou precisa de configuração específica
if command -v n8n >/dev/null 2>&1; then
    echo "✅ n8n encontrado"
else
    echo "❌ n8n não encontrado no PATH"
    exit 1
fi

echo "🔍 Verificando processos n8n ativos..."
if pgrep -f "n8n" >/dev/null; then
    echo "⚠️  n8n está rodando. Parando..."
    pkill -f "n8n" 2>/dev/null || true
    sleep 2
fi

echo "🗑️  Limpando caches..."

# 1. Limpar cache de node_modules (se existir)
if [[ -d "$HOME/.n8n/node_modules" ]]; then
    echo "   - Removendo node_modules do n8n..."
    rm -rf "$HOME/.n8n/node_modules"
fi

# 2. Limpar cache npm global
echo "   - Limpando cache npm..."
npm cache clean --force 2>/dev/null || true

# 3. Limpar diretório de packages instalados
if [[ -d "$HOME/.n8n/nodes" ]]; then
    echo "   - Removendo nós instalados..."
    rm -rf "$HOME/.n8n/nodes"
fi

# 4. Remover arquivos de cache específicos
echo "   - Removendo arquivos de cache..."
rm -f "$HOME/.n8n/.cache" 2>/dev/null || true
rm -rf "$HOME/.n8n/.npm" 2>/dev/null || true
rm -rf "$HOME/.n8n/cache" 2>/dev/null || true

# 5. Limpar logs que podem conter cache
echo "   - Limpando logs..."
rm -f "$HOME/.n8n/logs/"*.log 2>/dev/null || true

echo "✅ Cache limpo!"
echo
echo "🚀 Para iniciar n8n com cache zerado:"
echo "   export N8N_PACKAGE_CACHE_TIME=\"0\""
echo "   export N8N_NODE_TYPE_CACHE_SIZE=\"0\""
echo "   n8n start"
echo
echo "💡 Ou use o script start-fresh:"
echo "   ./scripts/start-n8n-fresh.sh"