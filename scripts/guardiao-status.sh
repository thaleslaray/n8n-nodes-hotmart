#!/bin/bash

# Script para verificar status do Guardião

echo "🛡️ Status do Guardião Automático"
echo "================================="

# 1. Verificar se está rodando
echo -e "\n📊 Processos ativos:"
GUARDIAO_PIDS=$(ps aux | grep "guardiao-watch" | grep -v grep | awk '{print $2}')

if [ -z "$GUARDIAO_PIDS" ]; then
    echo "❌ Nenhum processo do Guardião encontrado"
else
    echo "✅ Guardião rodando com PIDs: $GUARDIAO_PIDS"
    for PID in $GUARDIAO_PIDS; do
        echo "   PID $PID - $(ps -p $PID -o etime= | xargs) de uptime"
    done
fi

# 2. Verificar arquivos de configuração
echo -e "\n📁 Arquivos de configuração:"

if [ -f "/Users/thaleslaray/code/projetos/n8n-hotmart/scripts/guardiao-watch.js" ]; then
    echo "✅ Script principal: /Users/thaleslaray/code/projetos/n8n-hotmart/scripts/guardiao-watch.js"
else
    echo "❌ Script principal não encontrado"
fi

if [ -f "/Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json" ]; then
    SNAPSHOT_SIZE=$(wc -l < "/Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json")
    echo "✅ Snapshot: $SNAPSHOT_SIZE linhas"
else
    echo "❌ Snapshot não encontrado"
fi

# 3. Estatísticas do snapshot
echo -e "\n📈 Estatísticas do snapshot:"
if [ -f "/Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json" ]; then
    TOTAL_FILES=$(jq '. | keys | length' "/Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json" 2>/dev/null || echo "erro")
    TOTAL_FIELDS=$(jq '[.[] | keys | length] | add' "/Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json" 2>/dev/null || echo "erro")
    
    echo "📂 Arquivos monitorados: $TOTAL_FILES"
    echo "🔤 Campos protegidos: $TOTAL_FIELDS"
    
    # Campos por tipo
    echo -e "\nTipos de campos:"
    for FIELD_TYPE in displayName description placeholder hint label default type; do
        COUNT=$(jq -r ".[] | to_entries[] | select(.key | startswith(\"${FIELD_TYPE}_\")) | .key" "/Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json" 2>/dev/null | wc -l | xargs)
        echo "  • $FIELD_TYPE: $COUNT"
    done
else
    echo "❌ Não foi possível ler estatísticas"
fi

# 4. Comandos úteis
echo -e "\n🔧 Comandos úteis:"
echo "📋 Ver log em tempo real:"
echo "   tail -f ~/.guardiao.log"
echo ""
echo "🔄 Reiniciar Guardião:"
echo "   npm run guardiao:restart"
echo "   # ou: ./scripts/start-guardiao-fixed.sh"
echo ""
echo "⏹️ Parar Guardião:"
echo "   pkill -f guardiao-watch"
echo ""
echo "📄 Ver últimas mudanças no snapshot:"
echo "   jq '[.[] | to_entries[] | .value | select(.timestamp)] | sort_by(.timestamp) | tail(5)' /Users/thaleslaray/code/projetos/n8n-hotmart/.guardiao-snapshot.json"

# 5. Teste rápido
echo -e "\n🧪 Teste de monitoramento:"
echo "Para testar se está funcionando:"
echo "1. Edite qualquer arquivo .ts em nodes/"
echo "2. Mude um displayName ou description"
echo "3. O Guardião deve detectar automaticamente"

echo -e "\n✅ Verificação completa!"