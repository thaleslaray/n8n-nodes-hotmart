#!/bin/bash

# 🌳 Setup de Worktrees para desenvolvimento paralelo

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(pwd)"
PARENT_DIR="$(dirname "$PROJECT_ROOT")"

echo -e "${BLUE}🌳 Configurando Worktrees para desenvolvimento paralelo${NC}\n"

# Função para criar worktree
create_worktree() {
    local branch_name="$1"
    local description="$2"
    local worktree_path="$PARENT_DIR/n8n-hotmart-$branch_name"
    
    echo -e "${YELLOW}Criando worktree: $branch_name${NC}"
    
    # Criar branch se não existir
    if ! git rev-parse --verify "$branch_name" >/dev/null 2>&1; then
        git branch "$branch_name"
    fi
    
    # Criar worktree
    if [ ! -d "$worktree_path" ]; then
        git worktree add "$worktree_path" "$branch_name"
        echo -e "${GREEN}✅ $description${NC}"
        echo -e "   📁 Localização: $worktree_path"
    else
        echo -e "${YELLOW}⚠️  Worktree já existe: $worktree_path${NC}"
    fi
    echo ""
}

# Criar worktrees para diferentes contextos
echo -e "${BLUE}Criando worktrees especializados:${NC}\n"

create_worktree "webhook-fix" "Correção do bug do webhook (enum 0)"
create_worktree "test-system" "Sistema de testes automatizados"
create_worktree "rfc-implementation" "Implementação sequencial dos RFCs"
create_worktree "experiments" "Testes com CodeLoops e Task Master"
create_worktree "hotfix" "Correções urgentes"

# Mostrar status
echo -e "${BLUE}📋 Worktrees criados:${NC}"
git worktree list

echo -e "\n${GREEN}✅ Setup completo!${NC}"
echo -e "\n${BLUE}🎯 Como usar:${NC}"
echo -e "   • Main/Master: $PROJECT_ROOT"
echo -e "   • Bug webhook: $PARENT_DIR/n8n-hotmart-webhook-fix"
echo -e "   • Testes: $PARENT_DIR/n8n-hotmart-test-system"
echo -e "   • RFCs: $PARENT_DIR/n8n-hotmart-rfc-implementation"
echo -e "   • Experimentos: $PARENT_DIR/n8n-hotmart-experiments"
echo -e ""
echo -e "${YELLOW}💡 Comandos úteis:${NC}"
echo -e "   git worktree list                    # Ver todos os worktrees"
echo -e "   git worktree remove [nome]           # Remover worktree"
echo -e "   git worktree prune                   # Limpar worktrees órfãos"