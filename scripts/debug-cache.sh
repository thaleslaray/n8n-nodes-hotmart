#!/bin/bash

echo "🔍 DIAGNÓSTICO DE CACHE N8N"
echo "=========================="
echo

echo "📁 Diretórios de cache:"
echo "   ~/.n8n/: $(du -sh ~/.n8n 2>/dev/null || echo 'não existe')"
echo "   ~/.n8n/nodes/: $(du -sh ~/.n8n/nodes 2>/dev/null || echo 'não existe')"
echo "   ~/.n8n/node_modules/: $(du -sh ~/.n8n/node_modules 2>/dev/null || echo 'não existe')"
echo

echo "📦 Pacotes instalados:"
if [[ -d "$HOME/.n8n/nodes" ]]; then
    ls -la "$HOME/.n8n/nodes/" 2>/dev/null || echo "   Nenhum pacote encontrado"
else
    echo "   Diretório nodes/ não existe"
fi
echo

echo "🔧 Cache npm:"
npm cache ls 2>/dev/null | head -10 || echo "   Cache npm vazio"
echo

echo "🌐 Processos n8n:"
pgrep -f "n8n" >/dev/null && echo "   ✅ n8n rodando" || echo "   ❌ n8n parado"
echo

echo "💾 Variáveis de ambiente relevantes:"
env | grep -E "^N8N_|^NODE_|^LOG_" | sort || echo "   Nenhuma variável N8N definida"