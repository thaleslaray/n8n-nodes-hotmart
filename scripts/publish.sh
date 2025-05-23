#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de output
success() { echo -e "${GREEN}[✓]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
warning() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${BLUE}[PUBLISH]${NC} $1"; }

# Função para detectar diretório do projeto
detect_project_dir() {
    local current_dir="$(pwd)"
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Se estamos no diretório scripts/, voltar um nível
    if [[ "$script_dir" == *"/scripts" ]]; then
        echo "$(dirname "$script_dir")"
    else
        echo "$current_dir"
    fi
}

PROJECT_DIR="$(detect_project_dir)"
cd "$PROJECT_DIR" || {
    error "Não foi possível acessar o diretório do projeto: $PROJECT_DIR"
    exit 1
}

echo -e "${CYAN}📦 PUBLICAÇÃO AUTOMATIZADA NPM${NC}"
echo -e "${CYAN}===============================${NC}"
echo

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    error "package.json não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# Verificar autenticação NPM
info "Verificando autenticação NPM..."
if ! npm whoami >/dev/null 2>&1; then
    error "Não autenticado no NPM. Execute primeiro:"
    echo "  ./scripts/setup-npm-token.sh"
    exit 1
fi

NPM_USER=$(npm whoami 2>/dev/null)
success "Autenticado como: $NPM_USER"

# Obter versão atual
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
if [[ -z "$CURRENT_VERSION" ]]; then
    error "Não foi possível ler a versão do package.json"
    exit 1
fi

info "Versão atual: $CURRENT_VERSION"

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    warning "Há mudanças não commitadas no git. Considere fazer commit antes da publicação."
    echo "Mudanças não commitadas:"
    git status --porcelain | head -10
    echo
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Publicação cancelada pelo usuário."
        exit 0
    fi
fi

# Criar backup antes da publicação
info "Criando backup antes da publicação..."
BACKUP_NAME="before_npm_publish_${CURRENT_VERSION}_$(date +%Y%m%d_%H%M%S)"

if [[ -f "./scripts/backup.sh" ]]; then
    if ./scripts/backup.sh "$BACKUP_NAME" >/dev/null 2>&1; then
        success "Backup criado: $BACKUP_NAME"
    else
        warning "Erro ao criar backup, mas continuando..."
    fi
else
    warning "Script de backup não encontrado, continuando sem backup..."
fi

# Limpar e compilar o projeto
info "Compilando projeto..."
if pnpm clean >/dev/null 2>&1 && pnpm build >/dev/null 2>&1; then
    success "Projeto compilado com sucesso"
else
    error "Erro na compilação do projeto"
    exit 1
fi

# Verificar se dist/ foi criado
if [[ ! -d "dist" ]]; then
    error "Diretório dist/ não foi criado após compilação"
    exit 1
fi

# Mostrar preview dos arquivos que serão incluídos
info "Arquivos que serão incluídos na publicação:"
echo -e "${YELLOW}"
if command -v npm-packlist >/dev/null 2>&1; then
    npm-packlist 2>/dev/null | head -20
else
    # Fallback: usar npm pack --dry-run
    npm pack --dry-run 2>/dev/null | grep -E "^\s" | head -20
fi
echo -e "${NC}"

# Confirmar publicação
echo
read -p "Confirma a publicação da versão $CURRENT_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Publicação cancelada pelo usuário."
    exit 0
fi

# Publicar no NPM
info "Publicando no NPM..."
echo

if npm publish; then
    echo
    success "✨ Pacote $CURRENT_VERSION publicado com sucesso!"
    success "🌐 Disponível em: https://www.npmjs.com/package/n8n-nodes-hotmart"
    echo
    echo -e "${CYAN}🎉 PUBLICAÇÃO CONCLUÍDA!${NC}"
    echo -e "   ${BLUE}Versão:${NC} $CURRENT_VERSION"
    echo -e "   ${BLUE}Usuário:${NC} $NPM_USER"
    echo -e "   ${BLUE}URL:${NC} https://www.npmjs.com/package/n8n-nodes-hotmart"
    echo
else
    echo
    error "Erro durante a publicação"
    error "Verifique os logs acima e tente novamente"
    exit 1
fi

# Limpeza opcional
if [[ -d "dist" ]]; then
    info "Mantendo diretório dist/ para futuros builds..."
fi

info "Publicação concluída com sucesso! 🚀"