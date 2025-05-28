#!/bin/bash

# Script principal para análise CodeRabbit - Interface unificada
# Uso: ./coderabbit-analysis.sh [PR_NUMBER]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${PURPLE}🤖 CodeRabbit Analysis Suite${NC}"
echo "================================="

# Função para mostrar menu
show_menu() {
    echo -e "\n${CYAN}Escolha uma opção:${NC}"
    echo "1. 📋 Listar PRs disponíveis"
    echo "2. 🔍 Analisar PR específico (relatório limpo)"
    echo "3. 🛠️ Análise local (sem PR)"
    echo "4. 📄 Gerar relatório completo (formato antigo)"
    echo "5. ❌ Sair"
    echo ""
}

# Função para listar PRs
list_prs() {
    echo -e "${BLUE}📋 PRs Disponíveis:${NC}"
    if command -v gh &> /dev/null; then
        gh pr list --limit 10 --json number,title,author | jq -r '.[] | "PR #\(.number): \(.title) (@\(.author.login))"'
    else
        echo -e "${RED}❌ GitHub CLI não instalado. Use: brew install gh${NC}"
        return 1
    fi
}

# Função para análise de PR específico
analyze_pr() {
    local pr_number="$1"
    
    if [ -z "$pr_number" ]; then
        echo -e "${YELLOW}Digite o número do PR:${NC}"
        read -r pr_number
    fi
    
    if ! [[ "$pr_number" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}❌ Número de PR inválido${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🔄 Gerando relatório otimizado para PR #$pr_number...${NC}"
    
    if [ -f "$SCRIPT_DIR/coderabbit-final.sh" ]; then
        chmod +x "$SCRIPT_DIR/coderabbit-final.sh"
        "$SCRIPT_DIR/coderabbit-final.sh" "$pr_number"
    elif [ -f "$SCRIPT_DIR/coderabbit-simple.sh" ]; then
        chmod +x "$SCRIPT_DIR/coderabbit-simple.sh"
        "$SCRIPT_DIR/coderabbit-simple.sh" "$pr_number"
    else
        echo -e "${RED}❌ Script de análise otimizada não encontrado${NC}"
        return 1
    fi
}

# Função para análise local
local_analysis() {
    echo -e "${CYAN}🔧 Iniciando análise local...${NC}"
    
    if [ -f "$SCRIPT_DIR/coderabbit-local.sh" ]; then
        chmod +x "$SCRIPT_DIR/coderabbit-local.sh"
        "$SCRIPT_DIR/coderabbit-local.sh"
    else
        echo -e "${RED}❌ Script de análise local não encontrado${NC}"
        return 1
    fi
}

# Função para relatório completo (legado)
full_report() {
    local pr_number="$1"
    
    if [ -z "$pr_number" ]; then
        echo -e "${YELLOW}Digite o número do PR:${NC}"
        read -r pr_number
    fi
    
    if ! [[ "$pr_number" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}❌ Número de PR inválido${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🔄 Gerando relatório completo para PR #$pr_number...${NC}"
    
    # Tentar o script mais confiável primeiro
    if [ -f "$SCRIPT_DIR/apply-coderabbit-fixed.sh" ]; then
        chmod +x "$SCRIPT_DIR/apply-coderabbit-fixed.sh"
        "$SCRIPT_DIR/apply-coderabbit-fixed.sh" "$pr_number"
    elif [ -f "$SCRIPT_DIR/apply-coderabbit-gh.sh" ]; then
        chmod +x "$SCRIPT_DIR/apply-coderabbit-gh.sh"
        "$SCRIPT_DIR/apply-coderabbit-gh.sh" "$pr_number"
    else
        echo -e "${RED}❌ Nenhum script de análise encontrado${NC}"
        return 1
    fi
}

# Se número do PR foi passado como parâmetro, usar diretamente
if [ ! -z "$1" ]; then
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        analyze_pr "$1"
        exit 0
    else
        echo -e "${RED}❌ Parâmetro inválido. Use: $0 [NUMERO_PR]${NC}"
        exit 1
    fi
fi

# Loop do menu interativo
while true; do
    show_menu
    echo -n "Sua escolha: "
    read -r choice
    
    case $choice in
        1)
            list_prs
            ;;
        2)
            analyze_pr
            ;;
        3)
            local_analysis
            ;;
        4)
            full_report
            ;;
        5)
            echo -e "${GREEN}👋 Até logo!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida. Tente novamente.${NC}"
            ;;
    esac
    
    echo -e "\n${YELLOW}Pressione Enter para continuar...${NC}"
    read -r
done