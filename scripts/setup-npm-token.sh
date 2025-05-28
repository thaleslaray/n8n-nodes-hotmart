#!/bin/bash

# Script para configurar token NPM para publicação automática
# Evita ter que fazer login no browser toda vez

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[NPM-SETUP]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo -e "${BLUE}🔐 CONFIGURAÇÃO DE TOKEN NPM${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

log "Este script irá configurar um token NPM para publicação automática"
echo ""

# 1. Verificar se já está logado
log "Verificando status atual do NPM..."
if npm whoami &>/dev/null; then
    CURRENT_USER=$(npm whoami)
    success "Já logado como: $CURRENT_USER"
else
    warning "Não está logado no NPM"
fi

echo ""
echo -e "${YELLOW}📋 COMO OBTER UM TOKEN NPM:${NC}"
echo ""
echo -e "1. Acesse: ${BLUE}https://www.npmjs.com/settings/tokens${NC}"
echo -e "2. Clique em 'Generate New Token'"
echo -e "3. Escolha o tipo: ${GREEN}Automation${NC} (recomendado) ou ${YELLOW}Granular${NC}"
echo -e "4. Para Automation: selecione ${GREEN}Publish${NC}"
echo -e "5. Para Granular: configure permissões específicas"
echo -e "6. Copie o token gerado"
echo ""

# 2. Solicitar o token
echo -e "${YELLOW}🔑 CONFIGURAR TOKEN:${NC}"
echo ""
echo -n "Cole seu token NPM aqui (será ocultado): "
read -s NPM_TOKEN
echo ""

if [ -z "$NPM_TOKEN" ]; then
    error "Token não fornecido. Saindo..."
    exit 1
fi

# 3. Configurar o token
log "Configurando token NPM..."

# Método 1: Via npmrc global
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
success "Token adicionado ao ~/.npmrc"

# Método 2: Via variável de ambiente (opcional)
ENV_FILE="$HOME/.npmrc_env"
echo "export NPM_TOKEN=$NPM_TOKEN" > "$ENV_FILE"
chmod 600 "$ENV_FILE"
success "Token salvo em $ENV_FILE (para uso como variável de ambiente)"

# 4. Verificar se funciona
log "Testando autenticação..."
if npm whoami &>/dev/null; then
    USER=$(npm whoami)
    success "Autenticação funcionando! Usuário: $USER"
else
    error "Falha na autenticação. Verifique o token."
    exit 1
fi

# 5. Criar script de publicação automatizada
log "Criando script de publicação automatizada..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLISH_SCRIPT="$SCRIPT_DIR/publish.sh"

cat > "$PUBLISH_SCRIPT" << 'EOF'
#!/bin/bash

# Script de Publicação Automatizada para NPM
# Usa token configurado para publicar sem login no browser

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[PUBLISH]${NC} $1"
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

echo -e "${BLUE}📦 PUBLICAÇÃO AUTOMATIZADA NPM${NC}"
echo -e "${BLUE}===============================${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute no diretório raiz do projeto."
    exit 1
fi

# Verificar autenticação
log "Verificando autenticação NPM..."
if ! npm whoami &>/dev/null; then
    error "Não autenticado no NPM. Execute: ./scripts/setup-npm-token.sh"
    exit 1
fi

USER=$(npm whoami)
success "Autenticado como: $USER"

# Obter versão atual
CURRENT_VERSION=$(node -p "require('./package.json').version")
log "Versão atual: $CURRENT_VERSION"

# Verificar se há mudanças não commitadas
if [ -d ".git" ]; then
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        warning "Há mudanças não commitadas no git"
        echo -n "Continuar mesmo assim? (y/N): "
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Publicação cancelada"
            exit 0
        fi
    fi
fi

# Backup automático antes da publicação
log "Criando backup antes da publicação..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/quick-backup.sh" ]; then
    "$SCRIPT_DIR/quick-backup.sh" "before_npm_publish_$CURRENT_VERSION"
    success "Backup criado"
else
    warning "Script de backup não encontrado"
fi

# Build do projeto
log "Compilando projeto..."
if ! pnpm build; then
    error "Falha na compilação"
    exit 1
fi
success "Projeto compilado"

# Verificar arquivos que serão incluídos
log "Arquivos que serão incluídos na publicação:"
npm pack --dry-run

echo ""
echo -n "Confirma a publicação da versão $CURRENT_VERSION? (y/N): "
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    log "Publicação cancelada pelo usuário"
    exit 0
fi

# Publicar no NPM
log "Publicando no NPM..."
if npm publish; then
    success "✨ Pacote $CURRENT_VERSION publicado com sucesso!"
    success "🌐 Disponível em: https://www.npmjs.com/package/n8n-nodes-hotmart"
    
    # Limpar arquivo .tgz local se foi criado
    rm -f n8n-nodes-hotmart-*.tgz 2>/dev/null
    
    echo ""
    echo -e "${GREEN}🎉 PUBLICAÇÃO CONCLUÍDA!${NC}"
    echo -e "   Versão: ${GREEN}$CURRENT_VERSION${NC}"
    echo -e "   Usuário: ${GREEN}$USER${NC}"
    echo -e "   URL: ${BLUE}https://www.npmjs.com/package/n8n-nodes-hotmart${NC}"
    
else
    error "Falha na publicação"
    exit 1
fi
EOF

chmod +x "$PUBLISH_SCRIPT"
success "Script de publicação criado: $PUBLISH_SCRIPT"

# 6. Criar script de conveniência
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONVENIENCE_SCRIPT="$PROJECT_DIR/publish"

cat > "$CONVENIENCE_SCRIPT" << 'EOF'
#!/bin/bash
# Conveniência: publica no NPM usando token
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/scripts/publish.sh" "$@"
EOF

chmod +x "$CONVENIENCE_SCRIPT"
success "Script de conveniência criado: ./publish"

# 7. Segurança
log "Configurando segurança..."
chmod 600 ~/.npmrc
chmod 600 "$ENV_FILE" 2>/dev/null
success "Permissões de arquivos configuradas"

echo ""
echo -e "${GREEN}🎉 CONFIGURAÇÃO CONCLUÍDA!${NC}"
echo ""
echo -e "${YELLOW}📋 COMO USAR:${NC}"
echo -e "   ${GREEN}./publish${NC}              # Publicar usando script de conveniência"
echo -e "   ${GREEN}./scripts/publish.sh${NC}   # Script completo de publicação"
echo -e "   ${GREEN}npm publish${NC}            # Comando direto (agora funciona automaticamente)"
echo ""
echo -e "${YELLOW}🔐 SEGURANÇA:${NC}"
echo -e "   • Token salvo em ~/.npmrc (permissões 600)"
echo -e "   • Backup do token em ~/.npmrc_env"
echo -e "   • Nunca compartilhe estes arquivos!"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "   • O token tem acesso à sua conta NPM"
echo -e "   • Mantenha o arquivo ~/.npmrc seguro"
echo -e "   • Para revogar: https://www.npmjs.com/settings/tokens"
echo ""
echo -e "${GREEN}✅ Agora você pode publicar sem login no browser!${NC}"