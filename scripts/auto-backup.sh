#!/bin/bash

# Auto-Backup antes de operações arriscadas
# Hook que pode ser chamado antes de git operations, builds, etc.

# Configurações - detecta automaticamente o diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[AUTO-BACKUP]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Verificar se mudanças foram feitas recentemente
LAST_BACKUP=$(ls -1t "$PROJECT_DIR/backups"/backup_*.tar.gz 2>/dev/null | head -1)

if [ -n "$LAST_BACKUP" ]; then
    # Verificar se o último backup é muito recente (menos de 5 minutos)
    LAST_BACKUP_TIME=$(stat -f %m "$LAST_BACKUP" 2>/dev/null || stat -c %Y "$LAST_BACKUP" 2>/dev/null)
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_BACKUP_TIME))
    
    if [ $TIME_DIFF -lt 300 ]; then  # 5 minutos = 300 segundos
        log "Backup recente existe ($(($TIME_DIFF / 60)) min atrás), pulando..."
        exit 0
    fi
fi

# Verificar se há alterações não commitadas no git
cd "$PROJECT_DIR"
if [ -d ".git" ]; then
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        log "Alterações detectadas, criando backup automático..."
        "$SCRIPT_DIR/backup.sh"
        success "Backup automático concluído"
    else
        log "Nenhuma alteração detectada no git"
    fi
else
    log "Não é um repositório git, criando backup automático..."
    "$SCRIPT_DIR/backup.sh"
    success "Backup automático concluído"
fi