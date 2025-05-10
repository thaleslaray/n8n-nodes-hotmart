#!/bin/bash

# Cores para output
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando captura de logs detalhados do Hotmart...${NC}"

# Criando diretório para logs se não existir
mkdir -p logs

# Nome do arquivo de log com timestamp
LOG_FILE="logs/hotmart-debug-$(date +"%Y%m%d-%H%M%S").log"

# Limpar logs existentes do n8n
echo -e "${YELLOW}Limpando logs existentes...${NC}"
> ~/.n8n/n8nEventLog.log
> ~/.n8n/n8nEventLog-1.log
> ~/.n8n/n8nEventLog-2.log
> ~/.n8n/n8nEventLog-3.log
echo -e "${GREEN}Logs existentes foram limpos${NC}"

# Parando instância atual do n8n
echo -e "${YELLOW}Parando instância atual do n8n...${NC}"
pkill -f n8n
sleep 2

# Iniciando n8n com nível de log verbose e redirecionando para arquivo
echo -e "${YELLOW}Iniciando n8n com log nível verbose...${NC}"
N8N_LOG_LEVEL=verbose N8N_LOG_OUTPUT=console n8n start > "$LOG_FILE" 2>&1 &
N8N_PID=$!
echo -e "${GREEN}n8n iniciado com PID $N8N_PID${NC}"
echo -e "${GREEN}Logs sendo salvos em $LOG_FILE${NC}"

# Aguardando inicialização
echo -e "${YELLOW}Aguardando inicialização do n8n (10 segundos)...${NC}"
sleep 10

# Instrução para monitorar logs
echo -e "${GREEN}Para monitorar logs em tempo real:${NC}"
echo -e "  ${YELLOW}tail -f $LOG_FILE | grep -A 20 -B 5 \"Hotmart API\"${NC}"
echo -e ""
echo -e "${GREEN}Para monitorar apenas os erros:${NC}"
echo -e "  ${YELLOW}tail -f $LOG_FILE | grep -i -E \"error|failed|bad request\"${NC}"
echo -e ""
echo -e "${GREEN}Para voltar à configuração normal quando terminar:${NC}"
echo -e "  ${RED}pkill -f n8n${NC}"
echo -e "  ${RED}n8n start &${NC}"
echo -e ""
echo -e "${GREEN}Arquivo de log completo: $LOG_FILE${NC}"