#!/bin/bash

# Script para iniciar o Guardião corrigido no diretório correto
# Executa na raiz do projeto, monitorando nodes/**/*.ts

echo "🛡️ Iniciando Guardião Corrigido..."

# Encontrar a raiz do projeto (um nível acima do diretório scripts)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Verificar se o projeto existe
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ Projeto não encontrado em $PROJECT_ROOT"
    exit 1
fi

echo "📍 Projeto encontrado: $PROJECT_ROOT"

# Verificar se guardiao-watch.js existe
if [ ! -f "$PROJECT_ROOT/scripts/guardiao-watch.js" ]; then
    echo "❌ Script guardiao-watch.js não encontrado"
    exit 1
fi

echo "✅ Script encontrado: $PROJECT_ROOT/scripts/guardiao-watch.js"

# Parar Guardiões existentes
echo "🔄 Parando instâncias anteriores..."
pkill -f "guardiao-watch" 2>/dev/null || true

# Aguardar um momento
sleep 2

# Iniciar novo Guardião
echo "🚀 Iniciando novo Guardião..."
cd "$PROJECT_ROOT" && node scripts/guardiao-watch.js &

GUARDIAO_PID=$!

echo "✅ Guardião iniciado com PID: $GUARDIAO_PID"
echo "📂 Monitorando: $PROJECT_ROOT/nodes/**/*.ts"
echo ""
echo "Para parar o Guardião:"
echo "  kill $GUARDIAO_PID"
echo "  ou"
echo "  pkill -f guardiao-watch"
echo ""
echo "Para ver logs em tempo real:"
echo "  tail -f ~/.guardiao.log"

# Verificar se está rodando
sleep 3
if ps -p $GUARDIAO_PID > /dev/null 2>&1; then
    echo "🎉 Guardião está funcionando corretamente!"
else
    echo "❌ Guardião falhou ao iniciar"
    exit 1
fi