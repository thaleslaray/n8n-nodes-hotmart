#!/bin/bash

# Health Check Completo do Projeto n8n-hotmart
# Verifica integridade, configurações e funcionalidades

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Função para log
log() {
    echo -e "${BLUE}[HEALTH]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((WARNING_CHECKS++))
}

info() {
    echo -e "${CYAN}[ℹ]${NC} $1"
}

check() {
    ((TOTAL_CHECKS++))
    echo -e "${PURPLE}[CHECK]${NC} $1"
}

# Detectar diretório do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}🏥 HEALTH CHECK COMPLETO - n8n-hotmart${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

# 1. Verificar estrutura básica do projeto
log "Verificando estrutura básica do projeto..."
cd "$PROJECT_DIR"

check "Arquivo package.json"
if [ -f "package.json" ]; then
    VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "erro")
    if [ "$VERSION" != "erro" ]; then
        success "package.json encontrado - versão $VERSION"
    else
        error "package.json com problema de sintaxe"
    fi
else
    error "package.json não encontrado"
fi

check "Arquivo tsconfig.json"
if [ -f "tsconfig.json" ]; then
    success "tsconfig.json encontrado"
else
    error "tsconfig.json não encontrado"
fi

check "Diretório nodes/"
if [ -d "nodes" ]; then
    NODE_COUNT=$(find nodes -name "*.ts" | wc -l)
    success "Diretório nodes/ encontrado ($NODE_COUNT arquivos .ts)"
else
    error "Diretório nodes/ não encontrado"
fi

check "Diretório credentials/"
if [ -d "credentials" ]; then
    CRED_COUNT=$(find credentials -name "*.ts" | wc -l)
    success "Diretório credentials/ encontrado ($CRED_COUNT arquivos .ts)"
else
    error "Diretório credentials/ não encontrado"
fi

# 2. Verificar dependências
log "Verificando dependências..."

check "Node.js instalado"
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    success "Node.js instalado: $NODE_VERSION"
else
    error "Node.js não encontrado"
fi

check "pnpm instalado"
if command -v pnpm >/dev/null 2>&1; then
    PNPM_VERSION=$(pnpm --version)
    success "pnpm instalado: $PNPM_VERSION"
else
    error "pnpm não encontrado"
fi

check "npm instalado"
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    success "npm instalado: $NPM_VERSION"
else
    error "npm não encontrado"
fi

check "n8n instalado"
if command -v n8n >/dev/null 2>&1; then
    N8N_VERSION=$(n8n --version 2>/dev/null | head -1 || echo "erro")
    success "n8n instalado: $N8N_VERSION"
else
    warning "n8n não encontrado globalmente"
fi

# 3. Verificar node_modules
log "Verificando node_modules..."

check "node_modules existente"
if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    success "node_modules encontrado ($NODE_MODULES_SIZE)"
else
    warning "node_modules não encontrado - execute: pnpm install"
fi

check "pnpm-lock.yaml"
if [ -f "pnpm-lock.yaml" ]; then
    success "pnpm-lock.yaml encontrado"
else
    warning "pnpm-lock.yaml não encontrado"
fi

# 4. Verificar compilação
log "Verificando compilação..."

check "Diretório dist/"
if [ -d "dist" ]; then
    DIST_FILES=$(find dist -name "*.js" | wc -l)
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
    success "Diretório dist/ encontrado ($DIST_FILES arquivos JS, $DIST_SIZE)"
else
    warning "Diretório dist/ não encontrado - execute: pnpm build"
fi

check "Arquivos TypeScript compilados"
if [ -d "dist" ] && [ "$(find dist -name "*.js" | wc -l)" -gt 0 ]; then
    success "Arquivos TypeScript compilados encontrados"
else
    warning "Arquivos compilados não encontrados"
fi

# 5. Verificar scripts
log "Verificando scripts..."

SCRIPTS=("backup" "restore" "install" "clear" "start-n8n")
for script in "${SCRIPTS[@]}"; do
    check "Script $script"
    if [ -x "$script" ]; then
        success "Script $script executável"
    else
        error "Script $script não encontrado ou não executável"
    fi
done

SCRIPT_FILES=("backup.sh" "restore.sh" "install.sh" "clear.sh" "start-n8n.sh" "auto-backup.sh" "quick-backup.sh" "fix-n8n-warnings.sh")
for script_file in "${SCRIPT_FILES[@]}"; do
    check "scripts/$script_file"
    if [ -x "scripts/$script_file" ]; then
        success "scripts/$script_file executável"
    else
        error "scripts/$script_file não encontrado ou não executável"
    fi
done

# 6. Verificar sistema de backup
log "Verificando sistema de backup..."

check "Diretório backups/"
if [ -d "backups" ]; then
    BACKUP_COUNT=$(ls backups/*.tar.gz 2>/dev/null | wc -l)
    BACKUP_SIZE=$(du -sh backups 2>/dev/null | cut -f1)
    success "Diretório backups/ encontrado ($BACKUP_COUNT backups, $BACKUP_SIZE)"
else
    warning "Diretório backups/ não encontrado"
fi

check "Backups recentes"
if [ -d "backups" ]; then
    RECENT_BACKUP=$(ls -t backups/*.tar.gz 2>/dev/null | head -1)
    if [ -n "$RECENT_BACKUP" ]; then
        BACKUP_AGE=$(stat -f %m "$RECENT_BACKUP" 2>/dev/null || stat -c %Y "$RECENT_BACKUP" 2>/dev/null)
        CURRENT_TIME=$(date +%s)
        AGE_HOURS=$(( (CURRENT_TIME - BACKUP_AGE) / 3600 ))
        success "Backup mais recente: $(basename "$RECENT_BACKUP") (${AGE_HOURS}h atrás)"
    else
        warning "Nenhum backup encontrado"
    fi
fi

# 7. Verificar configurações do n8n
log "Verificando configurações do n8n..."

check "Arquivo ~/.n8n/.env"
if [ -f "$HOME/.n8n/.env" ]; then
    success "Arquivo ~/.n8n/.env encontrado"
    
    # Verificar configurações específicas
    if grep -q "N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true" "$HOME/.n8n/.env"; then
        success "Correção de permissões habilitada"
    else
        warning "Correção de permissões não configurada"
    fi
    
    if grep -q "N8N_RUNNERS_ENABLED=true" "$HOME/.n8n/.env"; then
        success "Task runners habilitados"
    else
        warning "Task runners não habilitados"
    fi
else
    warning "Arquivo ~/.n8n/.env não encontrado"
fi

check "Permissões ~/.n8n/config"
if [ -f "$HOME/.n8n/config" ]; then
    PERMS=$(stat -f %A "$HOME/.n8n/config" 2>/dev/null || stat -c %a "$HOME/.n8n/config" 2>/dev/null)
    if [ "$PERMS" = "600" ]; then
        success "Permissões do config corretas (600)"
    else
        warning "Permissões do config: $PERMS (deveria ser 600)"
    fi
else
    info "Arquivo ~/.n8n/config não existe ainda"
fi

# 8. Verificar instalação no n8n
log "Verificando instalação no n8n..."

check "Diretório ~/.n8n/nodes"
if [ -d "$HOME/.n8n/nodes" ]; then
    success "Diretório ~/.n8n/nodes encontrado"
else
    warning "Diretório ~/.n8n/nodes não encontrado"
fi

check "Nó Hotmart instalado"
if [ -d "$HOME/.n8n/nodes/node_modules/n8n-nodes-hotmart" ]; then
    INSTALLED_VERSION=$(node -p "require('$HOME/.n8n/nodes/node_modules/n8n-nodes-hotmart/package.json').version" 2>/dev/null || echo "erro")
    success "Nó Hotmart instalado: versão $INSTALLED_VERSION"
else
    warning "Nó Hotmart não instalado no n8n"
fi

# 9. Verificar arquivos essenciais
log "Verificando arquivos essenciais..."

ESSENTIAL_FILES=("README.md" "CHANGELOG.md" "LICENSE.md" "CLAUDE.md" "BACKUP-GUIDE.md")
for file in "${ESSENTIAL_FILES[@]}"; do
    check "$file"
    if [ -f "$file" ]; then
        FILE_SIZE=$(wc -l < "$file" 2>/dev/null)
        success "$file encontrado ($FILE_SIZE linhas)"
    else
        error "$file não encontrado"
    fi
done

# 10. Verificar lint e build
log "Verificando configurações de lint e build..."

check "eslint.config.js"
if [ -f "eslint.config.js" ]; then
    success "eslint.config.js encontrado"
else
    warning "eslint.config.js não encontrado"
fi

check "gulpfile.js"
if [ -f "gulpfile.js" ]; then
    success "gulpfile.js encontrado"
else
    error "gulpfile.js não encontrado"
fi

# 11. Verificar arquivos de documentação
log "Verificando documentação..."

check "Diretório docs/"
if [ -d "docs" ]; then
    DOC_COUNT=$(find docs -name "*.txt" -o -name "*.md" | wc -l)
    success "Diretório docs/ encontrado ($DOC_COUNT arquivos de doc)"
else
    warning "Diretório docs/ não encontrado"
fi

check "Diretório RFCs/"
if [ -d "RFCs" ]; then
    RFC_COUNT=$(find RFCs -name "*.md" | wc -l)
    success "Diretório RFCs/ encontrado ($RFC_COUNT RFCs)"
else
    warning "Diretório RFCs/ não encontrado"
fi

# 12. Verificar espaço em disco
log "Verificando recursos do sistema..."

check "Espaço em disco"
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    success "Espaço em disco: ${DISK_USAGE}% usado"
else
    warning "Espaço em disco: ${DISK_USAGE}% usado (pouco espaço)"
fi

check "Memória disponível"
if command -v free >/dev/null 2>&1; then
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    success "Memória: ${MEM_USAGE}% usada"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    success "Sistema macOS detectado"
fi

# Resumo final
echo ""
echo -e "${CYAN}=================================================${NC}"
echo -e "${CYAN}📊 RESUMO DO HEALTH CHECK${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""

echo -e "${PURPLE}📈 Estatísticas:${NC}"
echo -e "   Total de verificações: ${TOTAL_CHECKS}"
echo -e "   ${GREEN}✓ Passou: ${PASSED_CHECKS}${NC}"
echo -e "   ${RED}✗ Falhou: ${FAILED_CHECKS}${NC}"
echo -e "   ${YELLOW}! Avisos: ${WARNING_CHECKS}${NC}"
echo ""

# Calcular percentual de saúde
HEALTH_SCORE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))

if [ $HEALTH_SCORE -ge 90 ]; then
    echo -e "${GREEN}🎉 SAÚDE EXCELENTE: ${HEALTH_SCORE}%${NC}"
    echo -e "${GREEN}   Projeto em ótimo estado!${NC}"
elif [ $HEALTH_SCORE -ge 70 ]; then
    echo -e "${YELLOW}⚡ SAÚDE BOA: ${HEALTH_SCORE}%${NC}"
    echo -e "${YELLOW}   Alguns pontos precisam de atenção${NC}"
elif [ $HEALTH_SCORE -ge 50 ]; then
    echo -e "${YELLOW}⚠️  SAÚDE REGULAR: ${HEALTH_SCORE}%${NC}"
    echo -e "${YELLOW}   Vários pontos precisam de correção${NC}"
else
    echo -e "${RED}🚨 SAÚDE CRÍTICA: ${HEALTH_SCORE}%${NC}"
    echo -e "${RED}   Muitos problemas precisam ser resolvidos${NC}"
fi

echo ""

# Recomendações
if [ $FAILED_CHECKS -gt 0 ] || [ $WARNING_CHECKS -gt 3 ]; then
    echo -e "${YELLOW}🔧 Recomendações:${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "   • Execute: ${CYAN}pnpm install${NC}"
    fi
    
    if [ ! -d "dist" ]; then
        echo -e "   • Execute: ${CYAN}pnpm build${NC}"
    fi
    
    if [ ! -f "$HOME/.n8n/.env" ]; then
        echo -e "   • Execute: ${CYAN}./scripts/fix-n8n-warnings.sh${NC}"
    fi
    
    if [ ! -d "$HOME/.n8n/nodes/node_modules/n8n-nodes-hotmart" ]; then
        echo -e "   • Execute: ${CYAN}./install${NC}"
    fi
    
    echo ""
fi

echo -e "${CYAN}🏁 Health check concluído!${NC}"