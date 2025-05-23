#!/bin/bash

# Script para resolver warnings do n8n de uma vez por todas
# Corrige permissões e configura variáveis de ambiente

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[FIX-N8N]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log "Corrigindo warnings do n8n..."

# 1. Corrigir permissões do arquivo de configuração
log "Corrigindo permissões do arquivo de configuração..."
if [ -f "$HOME/.n8n/config" ]; then
    chmod 600 "$HOME/.n8n/config"
    success "Permissões do config corrigidas (600)"
else
    warning "Arquivo de config não encontrado ainda"
fi

# 2. Criar arquivo de variáveis de ambiente para n8n
log "Criando arquivo de configuração de ambiente..."

ENV_FILE="$HOME/.n8n/.env"
cat > "$ENV_FILE" << 'EOF'
# Configurações do n8n para evitar warnings

# Corrigir warning de permissões automaticamente
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

# Habilitar task runners (futuro padrão)
N8N_RUNNERS_ENABLED=true

# Configurações de log para desenvolvimento
N8N_LOG_LEVEL=info
LOG_LEVEL=info

# Configurações de segurança
N8N_SECURE_COOKIE=false
N8N_PROTOCOL=http
N8N_HOST=localhost
N8N_PORT=5678
EOF

chmod 600 "$ENV_FILE"
success "Arquivo .env criado: $ENV_FILE"

# 3. Criar script de inicialização do n8n com configurações corretas
log "Criando script de inicialização otimizado..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_SCRIPT="$SCRIPT_DIR/start-n8n.sh"

cat > "$START_SCRIPT" << 'EOF'
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
EOF

chmod +x "$START_SCRIPT"
success "Script de inicialização criado: $START_SCRIPT"

# 4. Atualizar o install.sh para usar o novo script
log "Atualizando script de instalação..."

INSTALL_SCRIPT="$SCRIPT_DIR/install.sh"
if [ -f "$INSTALL_SCRIPT" ]; then
    # Fazer backup do install.sh atual
    cp "$INSTALL_SCRIPT" "$INSTALL_SCRIPT.bak"
    
    # Substituir a linha de inicialização do n8n
    sed -i.tmp 's/LOG_LEVEL=verbose N8N_LOG_LEVEL=debug n8n start/echo "🚀 Iniciando n8n sem warnings..."; "$SCRIPT_DIR\/start-n8n.sh"/' "$INSTALL_SCRIPT"
    rm "$INSTALL_SCRIPT.tmp" 2>/dev/null || true
    
    success "Script de instalação atualizado"
else
    warning "Script de instalação não encontrado"
fi

# 5. Criar script de conveniência para iniciar n8n
log "Criando script de conveniência..."

PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONVENIENCE_SCRIPT="$PROJECT_DIR/start-n8n"

cat > "$CONVENIENCE_SCRIPT" << 'EOF'
#!/bin/bash
# Conveniência: inicia n8n sem warnings
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/start-n8n.sh" "$@"
EOF

chmod +x "$CONVENIENCE_SCRIPT"
success "Script de conveniência criado: ./start-n8n"

log "Testando configurações..."

# Verificar se as variáveis estão configuradas
if [ -f "$ENV_FILE" ]; then
    success "Arquivo .env criado e configurado"
fi

if [ -x "$START_SCRIPT" ]; then
    success "Script de inicialização pronto"
fi

if [ -x "$CONVENIENCE_SCRIPT" ]; then
    success "Script de conveniência pronto"
fi

echo -e ""
echo -e "${GREEN}🎉 Correções aplicadas com sucesso!${NC}"
echo -e ""
echo -e "${YELLOW}📋 Como usar agora:${NC}"
echo -e "   ${BLUE}./install${NC}           # Instalar (já usa configurações otimizadas)"
echo -e "   ${BLUE}./start-n8n${NC}         # Iniciar n8n sem warnings"
echo -e "   ${BLUE}./scripts/start-n8n.sh${NC}  # Script completo"
echo -e ""
echo -e "${GREEN}✅ Sem mais warnings chatos!${NC}"