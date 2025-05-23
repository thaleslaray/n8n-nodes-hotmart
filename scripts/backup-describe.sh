#!/bin/bash

# Script para adicionar ou editar descrições de backups no BACKUP-LOG.md

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
BACKUP_LOG="$BACKUP_DIR/BACKUP-LOG.md"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[BACKUP-DESC]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar se o arquivo de log existe
if [ ! -f "$BACKUP_LOG" ]; then
    error "Arquivo BACKUP-LOG.md não encontrado!"
    exit 1
fi

# Se nenhum argumento, mostrar backups recentes
if [ $# -eq 0 ]; then
    log "Backups recentes sem descrição:"
    echo ""
    
    # Listar backups das últimas 24 horas
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime -1 -type f | while read -r backup; do
        BASENAME=$(basename "$backup")
        # Verificar se já tem descrição (não tem [ADICIONAR DESCRIÇÃO])
        if grep -q "$BASENAME" "$BACKUP_LOG" && grep -A5 "$BASENAME" "$BACKUP_LOG" | grep -q "\[ADICIONAR DESCRIÇÃO\]"; then
            echo -e "${YELLOW}•${NC} $BASENAME"
        fi
    done
    
    echo ""
    log "Uso: $0 <nome-do-backup> \"<descrição>\""
    log "Exemplo: $0 backup_20250522_160348 \"Antes das melhorias AI/MCP\""
    exit 0
fi

BACKUP_NAME="$1"
DESCRIPTION="$2"

# Adicionar .tar.gz se não tiver
if [[ ! "$BACKUP_NAME" == *.tar.gz ]]; then
    BACKUP_NAME="${BACKUP_NAME}.tar.gz"
fi

# Verificar se o backup existe
if [ ! -f "$BACKUP_DIR/$BACKUP_NAME" ]; then
    error "Backup não encontrado: $BACKUP_NAME"
    exit 1
fi

# Se não foi fornecida descrição, abrir editor
if [ -z "$DESCRIPTION" ]; then
    # Criar arquivo temporário com template
    TEMP_FILE="/tmp/backup_desc_$$.txt"
    echo "# Descrição para: $BACKUP_NAME" > "$TEMP_FILE"
    echo "# Linhas começando com # serão ignoradas" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "DESCRIÇÃO: " >> "$TEMP_FILE"
    echo "CONTEXTO: " >> "$TEMP_FILE"
    echo "MUDANÇAS: " >> "$TEMP_FILE"
    echo "PODE RESTAURAR PARA: " >> "$TEMP_FILE"
    
    # Abrir editor (usa o padrão do sistema ou nano)
    ${EDITOR:-nano} "$TEMP_FILE"
    
    # Ler descrição do arquivo
    DESCRIPTION=$(grep -v "^#" "$TEMP_FILE" | grep "DESCRIÇÃO:" | cut -d: -f2- | xargs)
    CONTEXT=$(grep -v "^#" "$TEMP_FILE" | grep "CONTEXTO:" | cut -d: -f2- | xargs)
    CHANGES=$(grep -v "^#" "$TEMP_FILE" | grep "MUDANÇAS:" | cut -d: -f2- | xargs)
    RESTORE_TO=$(grep -v "^#" "$TEMP_FILE" | grep "PODE RESTAURAR PARA:" | cut -d: -f2- | xargs)
    
    rm -f "$TEMP_FILE"
    
    if [ -z "$DESCRIPTION" ]; then
        error "Descrição não pode estar vazia!"
        exit 1
    fi
fi

# Procurar o backup no log
if ! grep -q "$BACKUP_NAME" "$BACKUP_LOG"; then
    error "Backup não encontrado no BACKUP-LOG.md"
    warning "Execute um novo backup para criar entrada automática"
    exit 1
fi

# Atualizar a descrição
log "Atualizando descrição para: $BACKUP_NAME"

# Se foi fornecida descrição completa via editor
if [ -n "$CONTEXT" ]; then
    # Criar entrada completa
    TEMP_UPDATE="/tmp/backup_log_update_$$.txt"
    
    # Copiar o arquivo original
    cp "$BACKUP_LOG" "$TEMP_UPDATE"
    
    # Usar awk para fazer a substituição
    awk -v backup="$BACKUP_NAME" -v desc="$DESCRIPTION" -v ctx="$CONTEXT" -v chg="$CHANGES" -v rst="$RESTORE_TO" '
    BEGIN { found = 0; }
    {
        if ($0 ~ backup) {
            found = 1;
            print $0;
        } else if (found && $0 ~ /^- \*\*Descrição:/) {
            print "- **Descrição:** " desc;
            if (ctx != "") print "- **Contexto:** " ctx;
            if (chg != "") print "- **Mudanças:** " chg;
            if (rst != "") print "- **Pode restaurar para:** " rst;
            # Pular linhas antigas de contexto/mudanças
            while (getline && $0 ~ /^- \*\*(Contexto|Mudanças|Pode restaurar para):/) { }
            # Imprimir a linha atual se não for uma das que pulamos
            if ($0 !~ /^- \*\*(Contexto|Mudanças|Pode restaurar para):/) print $0;
            found = 0;
        } else {
            print $0;
        }
    }
    ' "$BACKUP_LOG" > "$TEMP_UPDATE"
    
    mv "$TEMP_UPDATE" "$BACKUP_LOG"
else
    # Substituir apenas a descrição simples
    sed -i '' "/$BACKUP_NAME/,/^$/s/\*\*Descrição:\*\*.*/\*\*Descrição:\*\* $DESCRIPTION/" "$BACKUP_LOG"
fi

success "Descrição atualizada com sucesso!"

# Mostrar a entrada atualizada
echo ""
log "Entrada atualizada:"
grep -A10 "$BACKUP_NAME" "$BACKUP_LOG" | head -15

# Commit automático no git se estiver em um repositório
if [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR"
    git add "$BACKUP_LOG"
    git commit -m "📝 Atualiza descrição do backup: $BACKUP_NAME" --no-verify 2>/dev/null && \
        success "Alterações commitadas no git" || \
        warning "Não foi possível commitar (pode já estar commitado)"
fi