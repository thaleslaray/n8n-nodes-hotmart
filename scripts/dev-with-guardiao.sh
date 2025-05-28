#!/bin/bash

# Script para iniciar desenvolvimento com Guardião automático
# Executa: Guardião + TypeScript watch + logs organizados

echo "🚀 Iniciando Ambiente de Desenvolvimento Completo"
echo "================================================="

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Limpar processos anteriores
echo -e "${BLUE}🧹 Limpando processos anteriores...${NC}"
pkill -f "guardiao-watch" 2>/dev/null || true
pkill -f "tsc --watch" 2>/dev/null || true
sleep 2

# 2. Verificar dependências
echo -e "${BLUE}📦 Verificando dependências...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado"
    exit 1
fi

if [ ! -f "scripts/guardiao-watch.js" ]; then
    echo "❌ Guardião não encontrado em scripts/guardiao-watch.js"
    exit 1
fi

# 3. Iniciar Guardião
echo -e "${BLUE}🛡️ Iniciando Guardião...${NC}"
node scripts/guardiao-watch.js > .guardiao.log 2>&1 &
GUARDIAO_PID=$!

# Aguardar inicialização
sleep 3

# Verificar se Guardião iniciou
if ! ps -p $GUARDIAO_PID > /dev/null 2>&1; then
    echo "❌ Falha ao iniciar Guardião"
    cat .guardiao.log
    exit 1
fi

echo -e "${GREEN}✅ Guardião ativo (PID: $GUARDIAO_PID)${NC}"

# 4. Iniciar TypeScript Watch
echo -e "${BLUE}⚙️ Iniciando TypeScript Watch...${NC}"
npx tsc --watch > .tsc.log 2>&1 &
TSC_PID=$!

# Aguardar inicialização
sleep 3

# Verificar se TSC iniciou
if ! ps -p $TSC_PID > /dev/null 2>&1; then
    echo "❌ Falha ao iniciar TypeScript Watch"
    kill $GUARDIAO_PID 2>/dev/null
    cat .tsc.log
    exit 1
fi

echo -e "${GREEN}✅ TypeScript Watch ativo (PID: $TSC_PID)${NC}"

# 5. Informações úteis
echo ""
echo -e "${YELLOW}📊 Status do Ambiente:${NC}"
echo "🛡️ Guardião: Monitorando nodes/**/*.ts para mudanças de UI"
echo "⚙️ TypeScript: Compilando automaticamente mudanças"
echo ""
echo -e "${YELLOW}📋 Comandos úteis:${NC}"
echo "👀 Ver logs do Guardião: tail -f .guardiao.log"
echo "🔧 Ver logs do TypeScript: tail -f .tsc.log"
echo "📊 Status: npm run guardiao:status"
echo "⏹️ Parar tudo: Ctrl+C neste terminal"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo "1. Edite qualquer arquivo .ts em nodes/"
echo "2. Veja o Guardião detectar mudanças automaticamente"
echo "3. TypeScript recompila automaticamente"
echo ""

# 6. Função de limpeza ao sair
cleanup() {
    echo -e "\n${BLUE}🧹 Encerrando processos...${NC}"
    kill $GUARDIAO_PID 2>/dev/null && echo "✅ Guardião parado"
    kill $TSC_PID 2>/dev/null && echo "✅ TypeScript Watch parado"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 7. Loop principal - mostrar logs em tempo real
echo -e "${GREEN}🎉 Ambiente pronto! Monitorando atividade...${NC}"
echo -e "${BLUE}Pressione Ctrl+C para parar tudo${NC}"
echo ""

# Alternar entre logs dos dois processos
while true; do
    # Mostrar últimas linhas do Guardião se houver atividade
    if [ -f .guardiao.log ]; then
        GUARDIAO_LINES=$(wc -l < .guardiao.log)
        if [ ${GUARDIAO_LINES:-0} -gt ${LAST_GUARDIAO_LINES:-0} ]; then
            echo "📡 GUARDIÃO:"
            tail -n +$((LAST_GUARDIAO_LINES + 1)) .guardiao.log | head -5
            LAST_GUARDIAO_LINES=$GUARDIAO_LINES
            echo ""
        fi
    fi
    
    # Mostrar últimas linhas do TypeScript se houver atividade
    if [ -f .tsc.log ]; then
        TSC_LINES=$(wc -l < .tsc.log)
        if [ ${TSC_LINES:-0} -gt ${LAST_TSC_LINES:-0} ]; then
            echo "🔧 TYPESCRIPT:"
            tail -n +$((LAST_TSC_LINES + 1)) .tsc.log | head -3
            LAST_TSC_LINES=$TSC_LINES
            echo ""
        fi
    fi
    
    sleep 2
done