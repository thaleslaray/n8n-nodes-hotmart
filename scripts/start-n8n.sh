#!/bin/bash

# Script otimizado para iniciar n8n sem warnings

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando n8n sem warnings...${NC}"

# Configurar variáveis de ambiente
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export N8N_RUNNERS_ENABLED=true
export N8N_LOG_LEVEL=info
export LOG_LEVEL=info
export N8N_SECURE_COOKIE=false
export N8N_PROTOCOL=http
export N8N_HOST=localhost
export N8N_PORT=5678

# Corrigir permissões se necessário
if [ -f "$HOME/.n8n/config" ]; then
    chmod 600 "$HOME/.n8n/config" 2>/dev/null || true
fi

echo -e "${GREEN}✅ Configurações aplicadas:${NC}"
echo -e "   • Permissões automáticas: ${GREEN}ativadas${NC}"
echo -e "   • Task runners: ${GREEN}ativados${NC}"
echo -e "   • Log level: ${GREEN}info${NC}"
echo -e ""
echo -e "${YELLOW}🌐 n8n será iniciado em: http://localhost:5678${NC}"
echo -e "${YELLOW}🛑 Para parar: Ctrl+C${NC}"
echo -e ""

# Iniciar n8n
n8n start
