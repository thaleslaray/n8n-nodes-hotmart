#!/bin/bash

# 🔍 Script para n8n em modo DEBUG ULTRA DETALHADO

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}🔍 MODO DEBUG ULTRA ATIVADO!${NC}"
echo -e "${YELLOW}⚠️  AVISO: Muitos logs serão gerados!${NC}\n"

# Configurar TODOS os logs possíveis
export LOG_LEVEL=verbose               # Log geral máximo
export N8N_LOG_LEVEL=verbose          # n8n específico
export N8N_LOG_OUTPUT=console         # Saída no console
export DEBUG=*                        # Debug de TUDO
export NODE_ENV=development           # Modo desenvolvimento
export N8N_DIAGNOSTICS_ENABLED=true   # Diagnósticos extras
export N8N_PUSH_BACKEND=websocket     # Logs de websocket

# Logs específicos de webhook se necessário
export N8N_WEBHOOK_DEBUG=true
export N8N_WORKFLOW_DEBUG=true

# Permissões e configs básicas
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export N8N_RUNNERS_ENABLED=true
export N8N_PROTOCOL=http
export N8N_HOST=localhost
export N8N_PORT=5678

echo -e "${BLUE}📋 Configurações de Debug:${NC}"
echo -e "   • LOG_LEVEL: ${RED}verbose${NC}"
echo -e "   • N8N_LOG_LEVEL: ${RED}verbose${NC}"
echo -e "   • DEBUG: ${RED}* (tudo)${NC}"
echo -e "   • NODE_ENV: ${RED}development${NC}"
echo -e "   • DIAGNOSTICS: ${RED}enabled${NC}"
echo -e ""
echo -e "${YELLOW}💡 Dicas:${NC}"
echo -e "   • Logs de webhook em: ${GREEN}~/.n8n/logs/webhook.log${NC}"
echo -e "   • Para filtrar: ${GREEN}n8n start | grep -i webhook${NC}"
echo -e "   • Para salvar: ${GREEN}n8n start > debug.log 2>&1${NC}"
echo -e ""
echo -e "${YELLOW}🌐 n8n debug em: http://localhost:5678${NC}"
echo -e "${YELLOW}🛑 Para parar: Ctrl+C${NC}"
echo -e ""

# Criar diretório de logs se não existir
mkdir -p ~/.n8n/logs

# Iniciar n8n com timestamp nos logs
n8n start 2>&1 | while IFS= read -r line; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $line"
done