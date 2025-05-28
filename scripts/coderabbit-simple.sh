#!/bin/bash

# Script simplificado para relatório CodeRabbit
# Uso: ./coderabbit-simple.sh <PR_NUMBER>

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}❌ Uso: $0 <PR_NUMBER>${NC}"
    exit 1
fi

PR_NUMBER=$1
OUTPUT_FILE="coderabbit-clean-pr-${PR_NUMBER}.md"

echo -e "${BLUE}🤖 CodeRabbit - Relatório Simplificado PR #${PR_NUMBER}${NC}"

# Verificar gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI não instalado${NC}"
    exit 1
fi

# Buscar dados do PR
PR_INFO=$(gh pr view "$PR_NUMBER" --json title,author,url)
PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
PR_AUTHOR=$(echo "$PR_INFO" | jq -r '.author.login')
PR_URL=$(echo "$PR_INFO" | jq -r '.url')

# Criar cabeçalho
cat > "$OUTPUT_FILE" << EOF
# 🤖 CodeRabbit - PR #${PR_NUMBER}

**Título:** [$PR_TITLE]($PR_URL)  
**Autor:** @$PR_AUTHOR  
**Data:** $(date '+%d/%m/%Y %H:%M')

## 📋 Issues Encontradas

EOF

# Buscar comentários e processar
echo -e "${YELLOW}🔍 Buscando comentários...${NC}"

COUNT=0
gh api "repos/{owner}/{repo}/pulls/$PR_NUMBER/comments" | jq -r '.[] | select(.user.login | test("coderabbit"; "i")) | "\(.path):\(.line)|\(.body)"' | while IFS='|' read -r file_line body; do
    if [ ! -z "$body" ]; then
        COUNT=$((COUNT + 1))
        
        # Extrair primeira linha significativa do corpo
        SUMMARY=$(echo "$body" | grep -E "^\*\*.*\*\*" | head -1 | sed 's/^\*\*//' | sed 's/\*\*$//' | cut -c1-80)
        
        if [ -z "$SUMMARY" ]; then
            SUMMARY=$(echo "$body" | head -1 | cut -c1-80)
        fi
        
        # Determinar prioridade
        PRIORITY="💡"
        if echo "$body" | grep -qi "error\|critical\|security\|syntax"; then
            PRIORITY="🚨"
        elif echo "$body" | grep -qi "style\|format\|lint"; then
            PRIORITY="🎨"
        fi
        
        echo "${COUNT}. ${PRIORITY} **${file_line}**" >> "$OUTPUT_FILE"
        echo "   ${SUMMARY}" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

# Verificar se arquivo foi criado corretamente
if [ ! -f "$OUTPUT_FILE" ] || [ ! -s "$OUTPUT_FILE" ]; then
    echo "❌ Erro ao gerar relatório" >&2
    exit 1
fi

# Contar linhas para ver quantas issues foram encontradas
ISSUE_COUNT=$(grep -c "^[0-9]" "$OUTPUT_FILE" || echo "0")

# Adicionar footer
cat >> "$OUTPUT_FILE" << EOF

---

**Total de issues:** $ISSUE_COUNT  
**Legenda:** 🚨 Crítico | 💡 Sugestão | 🎨 Estilo

*Relatório gerado em $(date '+%d/%m/%Y %H:%M')*
EOF

echo -e "${GREEN}✅ Relatório criado: $OUTPUT_FILE${NC}"
echo -e "${YELLOW}📊 Issues encontradas: $ISSUE_COUNT${NC}"

# Mostrar preview
echo -e "\n${BLUE}📄 Preview:${NC}"
head -20 "$OUTPUT_FILE"

echo -e "\n${YELLOW}Abrir arquivo completo? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^[Ss]$ ]]; then
    if command -v code &> /dev/null; then
        code "$OUTPUT_FILE"
    else
        open "$OUTPUT_FILE" 2>/dev/null || less "$OUTPUT_FILE"
    fi
fi