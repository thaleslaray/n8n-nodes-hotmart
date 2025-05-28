#!/bin/bash

# Sistema de Backup + Limpeza Completa do Nó Hotmart
# Cria backup automático antes de qualquer limpeza

# Cores para melhor visualização
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[CLEAR]${NC} $1"
}

# Criar backup de emergência antes da limpeza
log "Criando backup de emergência antes da limpeza..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/quick-backup.sh" ]; then
    "$SCRIPT_DIR/quick-backup.sh" "before_clear"
else
    log "Script de backup não encontrado, continuando sem backup..."
fi

echo -e "${RED}=== INICIANDO LIMPEZA COMPLETA DO NÓ HOTMART ===${NC}"
echo -e "${YELLOW}Este script removerá completamente qualquer instalação do nó Hotmart${NC}"

# Encerre o n8n se estiver em execução
echo -e "${YELLOW}Encerrando o n8n se estiver em execução...${NC}"
pkill -f n8n || true
sleep 2

# 1. Limpar instalações do diretório custom
echo -e "${YELLOW}Removendo do diretório custom...${NC}"
rm -rf "$HOME/.n8n/custom/n8n-nodes-hotmart"

# 2. Limpar instalações de node_modules
echo -e "${YELLOW}Removendo de node_modules...${NC}"
rm -rf "$HOME/.n8n/nodes/node_modules/n8n-nodes-hotmart"
rm -rf "$HOME/.n8n/node_modules/n8n-nodes-hotmart"

# 3. Limpar instalações gerenciadas pelo pnpm (legado)
echo -e "${YELLOW}Removendo instalações gerenciadas pelo pnpm...${NC}"
rm -rf "$HOME/.n8n/nodes/.pnpm/n8n-nodes-hotmart@*"
rm -rf "$HOME/.n8n/node_modules/.pnpm/n8n-nodes-hotmart@*"
rm -rf "$HOME/.pnpm-store/v3/files/*/n8n-nodes-hotmart-*"

# 4. Procurar e remover outras instalações em todos os lugares possíveis
echo -e "${YELLOW}Procurando e removendo todas as outras instalações...${NC}"
find "$HOME/.n8n" -path "*n8n-nodes-hotmart*" -type d 2>/dev/null | while read dir; do
    echo "Removendo: $dir"
    rm -rf "$dir"
done

# 5. Limpar caches do n8n e remover todos os nós e package.json
echo -e "${YELLOW}Limpando caches do n8n e removendo todos os nós...${NC}"
rm -rf "$HOME/.n8n/.cache"
rm -rf "$HOME/.n8n/.n8nNodeCache"
rm -rf "$HOME/.n8n/.n8n"
echo -e "${RED}Removendo TODOS os nós personalizados e package.json...${NC}"
rm -rf "$HOME/.n8n/nodes/"*
rm -f "$HOME/.n8n/package.json"

# 6. Remover arquivos .tgz da raiz do projeto
echo -e "${YELLOW}Removendo arquivos .tgz da raiz do projeto...${NC}"
rm -f *.tgz

# 7. Limpar arquivos de lock
echo -e "${YELLOW}Removendo arquivos de lock relacionados...${NC}"
find "$HOME/.n8n" -name "pnpm-lock.yaml" -delete
find "$HOME/.n8n" -name "package-lock.json" -delete
rm -f "$HOME/.n8n/pnpm-workspace.yaml" 2>/dev/null

# 8. Verificar se ainda existe alguma referência
echo -e "${YELLOW}Verificando se ainda resta alguma referência...${NC}"
hotmart_files=$(find "$HOME/.n8n" -path "*hotmart*" 2>/dev/null | grep -v "logs")
if [ -n "$hotmart_files" ]; then
    echo -e "${RED}AVISO: Ainda existem alguns arquivos relacionados ao Hotmart:${NC}"
    echo "$hotmart_files"
    echo -e "${YELLOW}Você pode querer remover estes manualmente se necessário.${NC}"
else
    echo -e "${GREEN}Nenhum arquivo do Hotmart encontrado. Limpeza completa!${NC}"
fi

# 9. Finalização
echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}Limpeza concluída com sucesso!${NC}"
echo -e "${RED}ATENÇÃO: TODOS os nós personalizados foram removidos!${NC}"
echo -e "${YELLOW}Para reinstalar o nó Hotmart:${NC}"
echo -e "  ${GREEN}./install${NC}     # Script automatizado"
echo -e ""
echo -e "${YELLOW}Ou manualmente:${NC}"
echo -e "  npm install --prefix ~/.n8n/nodes ./n8n-nodes-hotmart-[versao].tgz"
echo -e "${GREEN}=======================================================${NC}"
