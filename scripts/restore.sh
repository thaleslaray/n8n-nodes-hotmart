#!/bin/bash

# Sistema de Restauração - n8n-hotmart
# Restaura backups criados pelo backup.sh

# Configurações - detecta automaticamente o diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para log colorido
log() {
    echo -e "${BLUE}[RESTORE]${NC} $1"
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

# Verificar se foi fornecido nome do backup
if [ -z "$1" ]; then
    error "Uso: ./restore.sh <nome_do_backup>"
    log "Backups disponíveis:"
    ls -1t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | sed 's|.*/backup_||' | sed 's|\.tar\.gz||' | head -10
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_FILE="$BACKUP_DIR/backup_$BACKUP_NAME.tar.gz"

# Verificar se o backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup não encontrado: $BACKUP_FILE"
    log "Backups disponíveis:"
    ls -1t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | sed 's|.*/backup_||' | sed 's|\.tar\.gz||' | head -10
    exit 1
fi

# Confirmar restauração
warning "ATENÇÃO: Esta operação irá substituir os arquivos atuais!"
log "Backup a ser restaurado: $BACKUP_FILE"
echo -n "Deseja continuar? (y/N): "
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    log "Restauração cancelada pelo usuário"
    exit 0
fi

# Criar backup de segurança antes da restauração
SAFETY_BACKUP="$BACKUP_DIR/safety_backup_$(date +"%Y%m%d_%H%M%S").tar.gz"
log "Criando backup de segurança atual..."

cd "$PROJECT_DIR"
if tar -czf "$SAFETY_BACKUP" --exclude=node_modules --exclude=dist --exclude=backups --exclude=.git --exclude="logs/*.log" --exclude="debugging/*.log" --exclude="*.tgz" .; then
    success "Backup de segurança criado: $SAFETY_BACKUP"
else
    error "Falha ao criar backup de segurança!"
    exit 1
fi

# Restaurar backup
log "Iniciando restauração de $BACKUP_NAME..."

# Criar diretório temporário para extração
TEMP_DIR="/tmp/n8n_restore_$$"
mkdir -p "$TEMP_DIR"

# Extrair backup
if tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"; then
    log "Backup extraído com sucesso"
else
    error "Falha ao extrair backup!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copiar arquivos (preservando node_modules, dist, .git se existirem)
log "Restaurando arquivos..."

# Salvar diretórios que queremos preservar
PRESERVE_DIRS=("node_modules" "dist" ".git")
TEMP_PRESERVE="/tmp/n8n_preserve_$$"
mkdir -p "$TEMP_PRESERVE"

for dir in "${PRESERVE_DIRS[@]}"; do
    if [ -d "$PROJECT_DIR/$dir" ]; then
        log "Preservando $dir..."
        mv "$PROJECT_DIR/$dir" "$TEMP_PRESERVE/"
    fi
done

# Remover arquivos atuais (exceto preservados)
find "$PROJECT_DIR" -mindepth 1 -maxdepth 1 ! -name "backups" -exec rm -rf {} +

# Copiar arquivos do backup
cp -r "$TEMP_DIR"/* "$PROJECT_DIR/"

# Restaurar diretórios preservados
for dir in "${PRESERVE_DIRS[@]}"; do
    if [ -d "$TEMP_PRESERVE/$dir" ]; then
        log "Restaurando $dir preservado..."
        mv "$TEMP_PRESERVE/$dir" "$PROJECT_DIR/"
    fi
done

# Limpeza
rm -rf "$TEMP_DIR" "$TEMP_PRESERVE"

success "Restauração concluída!"
log "Backup de segurança mantido em: $SAFETY_BACKUP"

# Mostrar status do projeto
if [ -f "$PROJECT_DIR/package.json" ]; then
    log "Verificando integridade do projeto..."
    cd "$PROJECT_DIR"
    if command -v node >/dev/null 2>&1; then
        VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "erro")
        log "Versão do projeto: $VERSION"
    fi
fi

warning "Lembre-se de reinstalar dependências se necessário: pnpm install"