#!/bin/bash

# Sistema de Backup Automático - n8n-hotmart
# Cria backups incrementais com timestamp antes de qualquer alteração

# Configurações - detecta automaticamente o diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
MAX_BACKUPS=500  # Manter apenas os 500 backups mais recentes

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[BACKUP]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Timestamp para o backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log "Iniciando backup: $BACKUP_NAME"

# Criar backup excluindo diretórios desnecessários
cd "$PROJECT_DIR"

# Lista de exclusões (não fazer backup destes)
EXCLUDE_DIRS=(
    "node_modules"
    "dist" 
    "backups"
    ".git"
    "logs/*.log"
    "debugging/*.log"
    "*.tgz"
    "temp"
    "tmp"
)

# Construir parâmetros de exclusão para tar
EXCLUDE_PARAMS=""
for exclude in "${EXCLUDE_DIRS[@]}"; do
    EXCLUDE_PARAMS="$EXCLUDE_PARAMS --exclude=$exclude"
done

# Criar backup comprimido
if tar -czf "$BACKUP_PATH.tar.gz" $EXCLUDE_PARAMS .; then
    success "Backup criado: $BACKUP_PATH.tar.gz"
    
    # Mostrar tamanho do backup
    SIZE=$(du -h "$BACKUP_PATH.tar.gz" | cut -f1)
    log "Tamanho do backup: $SIZE"
    
    # Mostrar o que foi incluído no backup
    log "Arquivos incluídos no backup:"
    tar -tzf "$BACKUP_PATH.tar.gz" | head -20
    if [ $(tar -tzf "$BACKUP_PATH.tar.gz" | wc -l) -gt 20 ]; then
        log "... e mais $(( $(tar -tzf "$BACKUP_PATH.tar.gz" | wc -l) - 20 )) arquivos"
    fi
    
    # Adicionar entrada no log de backups
    BACKUP_LOG="$BACKUP_DIR/BACKUP-LOG.md"
    if [ -f "$BACKUP_LOG" ]; then
        # Obter versão do package.json
        VERSION=$(grep '"version"' "$PROJECT_DIR/package.json" | cut -d'"' -f4)
        
        # Verificar se já existe seção para hoje
        TODAY=$(date +"%Y-%m-%d")
        TODAY_FORMATTED="$TODAY ($(date +"%A" | sed 's/Monday/Segunda-feira/; s/Tuesday/Terça-feira/; s/Wednesday/Quarta-feira/; s/Thursday/Quinta-feira/; s/Friday/Sexta-feira/; s/Saturday/Sábado/; s/Sunday/Domingo/'))"
        
        if ! grep -q "## 📅 $TODAY" "$BACKUP_LOG"; then
            # Adicionar nova seção para hoje após o cabeçalho
            sed -i '' "/^---$/a\\\n## 📅 $TODAY_FORMATTED\\\n" "$BACKUP_LOG"
        fi
        
        # Adicionar entrada do backup completo
        ENTRY="\n### $BACKUP_NAME.tar.gz\n- **Hora:** $(date +"%H:%M:%S")\n- **Tamanho:** $SIZE\n- **Versão:** v$VERSION\n- **Descrição:** [ADICIONAR DESCRIÇÃO]\n- **Contexto:** Backup completo do projeto\n- **Status:** Sistema funcionando\n"
        
        # Encontrar a posição correta para inserir (após a data de hoje)
        LINE_NUM=$(grep -n "## 📅 $TODAY" "$BACKUP_LOG" | head -1 | cut -d: -f1)
        if [ -n "$LINE_NUM" ]; then
            sed -i '' "${LINE_NUM}a\\$ENTRY" "$BACKUP_LOG"
        fi
        
        success "Entrada adicionada ao BACKUP-LOG.md"
        warning "Não esqueça de atualizar a descrição no BACKUP-LOG.md!"
    fi
    
else
    error "Falha ao criar backup!"
    exit 1
fi

# Limpar backups antigos (manter apenas os MAX_BACKUPS mais recentes)
log "Limpando backups antigos..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | wc -l)

if [ $BACKUP_COUNT -gt $MAX_BACKUPS ]; then
    BACKUPS_TO_DELETE=$(( $BACKUP_COUNT - $MAX_BACKUPS ))
    warning "Excluindo $BACKUPS_TO_DELETE backup(s) antigo(s)"
    
    ls -1t "$BACKUP_DIR"/backup_*.tar.gz | tail -n $BACKUPS_TO_DELETE | xargs rm -f
    success "Backups antigos removidos"
fi

# Mostrar lista de backups disponíveis
log "Backups disponíveis:"
ls -lht "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | head -5

success "Sistema de backup concluído!"
log "Para restaurar: ./restore.sh $BACKUP_NAME"