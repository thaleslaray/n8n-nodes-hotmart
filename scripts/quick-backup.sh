#!/bin/bash

# Quick Backup - Backup rápido de emergência
# Para usar antes de operações arriscadas

# Configurações - detecta automaticamente o diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[QUICK-BACKUP]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Mensagem opcional
MESSAGE="$1"
if [ -z "$MESSAGE" ]; then
    MESSAGE="emergency"
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="quick_${MESSAGE}_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME.tar.gz"

mkdir -p "$BACKUP_DIR"

log "Criando backup rápido: $BACKUP_NAME"

cd "$PROJECT_DIR"

# Backup apenas dos arquivos essenciais (mais rápido)
if tar -czf "$BACKUP_PATH" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=backups \
    --exclude=.git \
    --exclude="logs/*.log" \
    --exclude="debugging/*.log" \
    --exclude="*.tgz" \
    --exclude=temp \
    --exclude=tmp \
    . >/dev/null 2>&1; then
    
    SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    success "Backup rápido criado: $BACKUP_NAME ($SIZE)"
    success "Local: $BACKUP_PATH"
    
    # Salvar referência do último quick backup
    echo "$BACKUP_NAME" > "$BACKUP_DIR/.last_quick_backup"
    
    # Adicionar entrada no log de backups
    BACKUP_LOG="$BACKUP_DIR/BACKUP-LOG.md"
    if [ -f "$BACKUP_LOG" ]; then
        # Verificar se já existe seção para hoje
        TODAY=$(date +"%Y-%m-%d")
        if ! grep -q "## 📅 $TODAY" "$BACKUP_LOG"; then
            # Adicionar nova seção para hoje antes dos backups rápidos
            sed -i '' "/## 📝 Backups Rápidos/i\\\n## 📅 $TODAY\\\n" "$BACKUP_LOG"
        fi
        
        # Adicionar entrada do backup rápido
        ENTRY="\n### $BACKUP_NAME.tar.gz\n- **Hora:** $(date +"%H:%M:%S")\n- **Tamanho:** $SIZE\n- **Descrição:** $MESSAGE\n- **Tipo:** Backup rápido\n"
        
        # Inserir antes da seção de backups rápidos
        sed -i '' "/## 📝 Backups Rápidos/i\\$ENTRY" "$BACKUP_LOG"
        
        success "Entrada adicionada ao BACKUP-LOG.md"
    fi
    
else
    error "Falha ao criar backup rápido!"
    exit 1
fi