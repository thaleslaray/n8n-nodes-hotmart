#!/bin/bash

# 🔗 Script para integração sequencial de worktrees

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(pwd)"
PARENT_DIR="$(dirname "$PROJECT_ROOT")"

echo -e "${BLUE}🔗 Integrando Worktrees Sequencialmente${NC}\n"

# Função para testar branch
test_branch() {
    local branch_name="$1"
    echo -e "${YELLOW}🧪 Testando $branch_name...${NC}"
    
    npm install --silent
    npm run build
    npm test
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $branch_name passou nos testes${NC}"
        return 0
    else
        echo -e "${RED}❌ $branch_name falhou nos testes${NC}"
        return 1
    fi
}

# Função para merge seguro
safe_merge() {
    local branch_name="$1"
    local description="$2"
    
    echo -e "\n${BLUE}📋 Integrando: $description${NC}"
    echo -e "Branch: $branch_name"
    
    # Verificar se branch existe
    if ! git rev-parse --verify "$branch_name" >/dev/null 2>&1; then
        echo -e "${RED}❌ Branch $branch_name não existe${NC}"
        return 1
    fi
    
    # Backup do estado atual
    local backup_branch="backup-before-$branch_name-$(date +%Y%m%d_%H%M%S)"
    git branch "$backup_branch"
    echo -e "${YELLOW}💾 Backup criado: $backup_branch${NC}"
    
    # Tentar merge
    echo -e "${YELLOW}🔄 Fazendo merge...${NC}"
    if git merge --no-ff "$branch_name" -m "feat: integra $description"; then
        echo -e "${GREEN}✅ Merge realizado com sucesso${NC}"
        
        # Testar após merge
        if test_branch "$(git branch --show-current)"; then
            echo -e "${GREEN}✅ Integração de $description concluída${NC}"
            git branch -d "$backup_branch" 2>/dev/null || true
            return 0
        else
            echo -e "${RED}❌ Testes falharam após integração${NC}"
            echo -e "${YELLOW}🔄 Revertendo merge...${NC}"
            git reset --hard "$backup_branch"
            git branch -d "$backup_branch" 2>/dev/null || true
            return 1
        fi
    else
        echo -e "${RED}❌ Conflito no merge${NC}"
        echo -e "${YELLOW}🔄 Abortando merge...${NC}"
        git merge --abort
        git reset --hard "$backup_branch"
        git branch -d "$backup_branch" 2>/dev/null || true
        return 1
    fi
}

# Verificar se estamos na main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "master" ] && [ "$current_branch" != "main" ]; then
    echo -e "${RED}❌ Execute este script na branch main/master${NC}"
    exit 1
fi

# Menu de integração
echo -e "${BLUE}🎯 Escolha o tipo de integração:${NC}"
echo "1. Integração completa (recomendado)"
echo "2. Integração específica"
echo "3. Testar integração (dry-run)"
echo "4. Ver status dos worktrees"
echo "0. Cancelar"

read -p "Escolha: " choice

case $choice in
    1)
        echo -e "\n${BLUE}🚀 INTEGRAÇÃO COMPLETA SEQUENCIAL${NC}"
        echo -e "${YELLOW}Ordem recomendada baseada em dependências:${NC}\n"
        
        # 1. Correções críticas primeiro
        safe_merge "webhook-fix" "correção do bug enum 0 em webhooks"
        
        # 2. Sistema de testes (não afeta funcionalidade)
        safe_merge "test-system" "sistema de testes automatizados"
        
        # 3. RFCs (novas funcionalidades)
        safe_merge "rfc-implementation" "implementação dos RFCs"
        
        # 4. Experimentos (se estáveis)
        echo -e "\n${YELLOW}Integrar experimentos? (s/n)${NC}"
        read -p "Resposta: " integrate_experiments
        if [ "$integrate_experiments" = "s" ]; then
            safe_merge "experiments" "experimentos com CodeLoops/TaskMaster"
        fi
        
        echo -e "\n${GREEN}🎉 INTEGRAÇÃO COMPLETA FINALIZADA!${NC}"
        ;;
        
    2)
        echo -e "\n${BLUE}📋 Branches disponíveis:${NC}"
        git branch | grep -v "$(git branch --show-current)"
        echo ""
        read -p "Nome da branch para integrar: " branch_name
        read -p "Descrição desta integração: " description
        
        safe_merge "$branch_name" "$description"
        ;;
        
    3)
        echo -e "\n${BLUE}🧪 TESTE DE INTEGRAÇÃO (DRY-RUN)${NC}"
        echo -e "${YELLOW}Testando como seria a integração sem fazer changes...${NC}\n"
        
        branches=("webhook-fix" "test-system" "rfc-implementation")
        
        for branch in "${branches[@]}"; do
            if git rev-parse --verify "$branch" >/dev/null 2>&1; then
                echo -e "${BLUE}Testando merge de: $branch${NC}"
                
                # Criar branch temporária para teste
                temp_branch="temp-test-$(date +%s)"
                git checkout -b "$temp_branch"
                
                if git merge --no-ff "$branch" --no-commit; then
                    echo -e "${GREEN}✅ $branch: merge possível sem conflitos${NC}"
                    git merge --abort
                else
                    echo -e "${RED}❌ $branch: conflitos detectados${NC}"
                    git merge --abort
                fi
                
                git checkout master
                git branch -D "$temp_branch"
            else
                echo -e "${YELLOW}⚠️  Branch $branch não existe${NC}"
            fi
        done
        ;;
        
    4)
        echo -e "\n${BLUE}📊 STATUS DOS WORKTREES:${NC}\n"
        
        # Listar worktrees
        git worktree list
        
        echo -e "\n${BLUE}📋 STATUS DAS BRANCHES:${NC}"
        for branch in webhook-fix test-system rfc-implementation experiments hotfix; do
            if git rev-parse --verify "$branch" >/dev/null 2>&1; then
                commits_ahead=$(git rev-list --count main..$branch 2>/dev/null || echo "0")
                commits_behind=$(git rev-list --count $branch..main 2>/dev/null || echo "0")
                echo -e "${GREEN}✅ $branch${NC}: +$commits_ahead commits ahead, -$commits_behind commits behind"
            else
                echo -e "${YELLOW}⚠️  $branch${NC}: não existe"
            fi
        done
        ;;
        
    0)
        echo -e "${YELLOW}Operação cancelada${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}💡 Próximos passos:${NC}"
echo -e "   • Testar integração: npm test"
echo -e "   • Build completo: npm run build" 
echo -e "   • Push para origin: git push origin main"
echo -e "   • Limpar worktrees: git worktree prune"