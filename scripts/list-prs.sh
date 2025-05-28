#!/bin/bash

# Script para listar PRs e facilitar a escolha
# Uso: ./list-prs.sh

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Listando Pull Requests...${NC}"
echo "=============================="

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) não está instalado${NC}"
    echo "Instale com: brew install gh"
    echo ""
    echo "Alternativamente, visite:"
    git config --get remote.origin.url | sed 's/.git$/\/pulls/g' | sed 's/git@github.com:/https:\/\/github.com\//g'
    exit 1
fi

# Listar PRs abertos
echo -e "\n${GREEN}📂 PRs Abertos:${NC}"
gh pr list --limit 10

# Listar PRs recentes (abertos e fechados)
echo -e "\n${GREEN}📚 PRs Recentes (incluindo fechados):${NC}"
gh pr list --limit 10 --state all

echo -e "\n${YELLOW}💡 Como usar:${NC}"
echo "1. Escolha o número do PR da lista acima"
echo "2. Execute: ./.local/scripts/apply-coderabbit-gh.sh NUMERO"
echo "   Exemplo: ./.local/scripts/apply-coderabbit-gh.sh 47"

# Perguntar se quer executar direto
echo -e "\n${YELLOW}Deseja analisar algum PR agora? Digite o número (ou 'n' para sair):${NC}"
read -r PR_NUMBER

if [[ "$PR_NUMBER" != "n" ]] && [[ "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
    echo -e "${GREEN}🚀 Buscando sugestões do PR #$PR_NUMBER...${NC}"
    
    # Encontrar o script apply-coderabbit-gh.sh (versão que funciona)
    SCRIPT_PATH=""
    if [ -f "./apply-coderabbit-gh.sh" ]; then
        SCRIPT_PATH="./apply-coderabbit-gh.sh"
    elif [ -f "./.local/scripts/apply-coderabbit-gh.sh" ]; then
        SCRIPT_PATH="./.local/scripts/apply-coderabbit-gh.sh"
    elif [ -f "./scripts/apply-coderabbit-gh.sh" ]; then
        SCRIPT_PATH="./scripts/apply-coderabbit-gh.sh"
    # Fallback para versões antigas
    elif [ -f "./apply-coderabbit.sh" ]; then
        SCRIPT_PATH="./apply-coderabbit.sh"
    elif [ -f "./.local/scripts/apply-coderabbit.sh" ]; then
        SCRIPT_PATH="./.local/scripts/apply-coderabbit.sh"
    fi
    
    if [ -n "$SCRIPT_PATH" ]; then
        "$SCRIPT_PATH" "$PR_NUMBER"
    else
        echo -e "${RED}❌ Script apply-coderabbit-gh.sh não encontrado${NC}"
        echo "Diretório atual: $(pwd)"
        echo "Arquivos disponíveis em .local/scripts: $(ls .local/scripts 2>/dev/null || echo 'pasta não encontrada')"
    fi
fi