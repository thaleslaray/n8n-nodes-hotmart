#!/bin/bash

# Script de instalação para n8n-nodes-hotmart
# IMPORTANTE: Usa pnpm para desenvolvimento e npm para instalação no n8n
# Inclui sistema de backup automático

set -e

# Cores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[INSTALL]${NC} $1"
}

# Criar backup automático antes da instalação
log "Criando backup automático antes da instalação..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/auto-backup.sh" ]; then
    "$SCRIPT_DIR/auto-backup.sh"
else
    log "Script de auto-backup não encontrado, continuando sem backup..."
fi

echo "🚀 Instalando n8n-nodes-hotmart..."
echo ""
echo "ℹ️  DESENVOLVIMENTO vs INSTALAÇÃO:"
echo "   • pnpm: Para build, pack e desenvolvimento (continue usando)"
echo "   • npm:  Para instalar o nó no n8n (necessário para n8n 1.94.0+)"
echo ""

# Parar n8n se estiver rodando
echo "🛑 Parando n8n..."
pkill -f "n8n" 2>/dev/null || echo "   n8n não estava rodando"
sleep 2

# Limpar instalações anteriores
echo "🧹 Limpando instalações anteriores..."
"$SCRIPT_DIR/clear.sh"

# Construir o pacote (usando pnpm)
echo "🔨 Construindo o pacote com pnpm..."
pnpm install
pnpm build
pnpm pack

# Obter o arquivo .tgz mais recente
TGZ_FILE=$(ls -t n8n-nodes-hotmart-*.tgz | head -n1)
echo "📦 Pacote criado: $TGZ_FILE"

# Instalar no n8n (usando npm)
echo "📥 Instalando no n8n com npm..."
mkdir -p ~/.n8n/nodes
if npm install --prefix ~/.n8n/nodes "./$TGZ_FILE"; then
    echo "✅ Instalação bem-sucedida!"
    echo ""
    echo "📋 RESUMO:"
    echo "   • Desenvolvimento: Continue usando pnpm build, pnpm pack, etc."
    echo "   • Instalação: npm install --prefix ~/.n8n/nodes ./arquivo.tgz"
    echo ""
    
    # Iniciar n8n com debug ultra ativado no console
    echo "🚀 Iniciando n8n com debug ultra ativado no console..."
    echo "   Logs detalhados ao vivo para depuração do nó Hotmart"
    echo ""
    echo "🔥 DEBUG ULTRA ATIVADO:"
    echo "   • LOG_LEVEL=verbose"
    echo "   • N8N_LOG_LEVEL=debug"
    echo "   • N8N_RUNNERS_ENABLED=true (sem avisos de deprecação)"
    echo ""
    echo "✅ Instalação concluída! O nó Hotmart deve aparecer na interface"
    echo "🛑 Para parar: Ctrl+C"
    echo ""
    echo "==============================================="
    echo "🚀 INICIANDO N8N COM DEBUG..."
    echo "==============================================="
    echo ""
    
    # Executar n8n diretamente no console com debug ultra ativado
    LOG_LEVEL=verbose N8N_LOG_LEVEL=debug N8N_RUNNERS_ENABLED=true n8n start
    exit 0
fi

echo "❌ Falha na instalação"
echo "💡 Tente manualmente:"
echo "   npm install --prefix ~/.n8n/nodes ./$TGZ_FILE"
exit 1