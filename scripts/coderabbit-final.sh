#!/bin/bash

# Script final otimizado para relatórios CodeRabbit
# Uso: ./coderabbit-final.sh <PR_NUMBER>

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}❌ Uso: $0 <PR_NUMBER>${NC}"
    exit 1
fi

PR_NUMBER=$1
OUTPUT_FILE="coderabbit-pr-${PR_NUMBER}.md"

echo -e "${BLUE}🤖 CodeRabbit Analysis - PR #${PR_NUMBER}${NC}"
echo "================================================"

# Verificar dependências
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI não instalado (brew install gh)${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq não instalado (brew install jq)${NC}"
    exit 1
fi

# Buscar dados do PR
echo -e "${CYAN}📥 Coletando dados do PR...${NC}"
PR_INFO=$(gh pr view "$PR_NUMBER" --json title,author,url,createdAt)
PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
PR_AUTHOR=$(echo "$PR_INFO" | jq -r '.author.login')
PR_URL=$(echo "$PR_INFO" | jq -r '.url')

# Função para extrair descrição limpa
extract_description() {
    local body="$1"
    
    # Extrair título em negrito
    local title=$(echo "$body" | grep -E "^\*\*.*\*\*" | head -1 | sed 's/^\*\*//' | sed 's/\*\*$//')
    
    # Se não tem título, pegar primeira linha significativa
    if [ -z "$title" ]; then
        title=$(echo "$body" | grep -v "^_⚠️" | grep -v "^$" | grep -v "^<!--" | head -1)
    fi
    
    # Limpar e truncar
    echo "$title" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | cut -c1-100
}

# Função para determinar prioridade
get_priority() {
    local body="$1"
    
    if echo "$body" | grep -qi "error\|critical\|security\|vulnerability\|breaking\|syntax error"; then
        echo "🚨"
    elif echo "$body" | grep -qi "style\|format\|convention\|spacing\|naming\|lint"; then
        echo "🎨"
    else
        echo "💡"
    fi
}

# Criar cabeçalho
cat > "$OUTPUT_FILE" << EOF
# 🤖 CodeRabbit - PR #${PR_NUMBER}

| Campo | Valor |
|-------|-------|
| **Título** | [$PR_TITLE]($PR_URL) |
| **Autor** | @$PR_AUTHOR |
| **Data Análise** | $(date '+%d/%m/%Y %H:%M') |

EOF

# Buscar comentários
echo -e "${CYAN}🔍 Analisando comentários...${NC}"

# Contador e arrays para categorizar
CRITICAL_COUNT=0
SUGGESTION_COUNT=0
STYLE_COUNT=0

CRITICAL_FILE=$(mktemp)
SUGGESTION_FILE=$(mktemp)
STYLE_FILE=$(mktemp)

# Buscar e processar comentários
gh api "repos/{owner}/{repo}/pulls/$PR_NUMBER/comments" | jq -r '.[] | select(.user.login | test("coderabbit"; "i")) | @base64' | while read -r comment; do
    # Decodificar JSON
    DECODED=$(echo "$comment" | base64 --decode)
    
    FILE_PATH=$(echo "$DECODED" | jq -r '.path // "unknown"')
    LINE_NUM=$(echo "$DECODED" | jq -r '.line // "?"')
    BODY=$(echo "$DECODED" | jq -r '.body // ""')
    
    if [ ! -z "$BODY" ]; then
        DESCRIPTION=$(extract_description "$BODY")
        PRIORITY=$(get_priority "$BODY")
        
        ENTRY="- **${FILE_PATH}:${LINE_NUM}** - ${DESCRIPTION}"
        
        case "$PRIORITY" in
            "🚨")
                echo "$ENTRY" >> "$CRITICAL_FILE"
                CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
                ;;
            "🎨")
                echo "$ENTRY" >> "$STYLE_FILE"
                STYLE_COUNT=$((STYLE_COUNT + 1))
                ;;
            *)
                echo "$ENTRY" >> "$SUGGESTION_FILE"
                SUGGESTION_COUNT=$((SUGGESTION_COUNT + 1))
                ;;
        esac
    fi
done

# Atualizar contadores globais (necessário para o shell)
CRITICAL_COUNT=$(wc -l < "$CRITICAL_FILE" | tr -d ' ')
SUGGESTION_COUNT=$(wc -l < "$SUGGESTION_FILE" | tr -d ' ')
STYLE_COUNT=$(wc -l < "$STYLE_FILE" | tr -d ' ')
TOTAL_COUNT=$((CRITICAL_COUNT + SUGGESTION_COUNT + STYLE_COUNT))

# Adicionar resumo
cat >> "$OUTPUT_FILE" << EOF
## 📊 Resumo

| Categoria | Quantidade |
|-----------|------------|
| 🚨 **Críticas** | $CRITICAL_COUNT |
| 💡 **Sugestões** | $SUGGESTION_COUNT |
| 🎨 **Estilo** | $STYLE_COUNT |
| **Total** | **$TOTAL_COUNT** |

EOF

# Adicionar issues críticas
if [ $CRITICAL_COUNT -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## 🚨 Issues Críticas (Prioridade Alta)

$(cat "$CRITICAL_FILE")

EOF
fi

# Adicionar sugestões
if [ $SUGGESTION_COUNT -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## 💡 Sugestões de Melhoria

$(cat "$SUGGESTION_FILE")

EOF
fi

# Adicionar questões de estilo
if [ $STYLE_COUNT -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## 🎨 Melhorias de Estilo

$(cat "$STYLE_FILE")

EOF
fi

# Adicionar plano de ação
cat >> "$OUTPUT_FILE" << EOF
## 🎯 Plano de Ação

### ✅ Para o Desenvolvedor
1. **Resolver issues críticas** 🚨 (podem quebrar funcionalidade)
2. **Aplicar sugestões** 💡 (melhoram qualidade/performance)
3. **Ajustar estilo** 🎨 (padronização/legibilidade)

### 📋 Checklist
- [ ] Revisar e corrigir issues críticas
- [ ] Implementar sugestões relevantes
- [ ] Ajustar questões de estilo
- [ ] Executar testes após mudanças
- [ ] Solicitar nova revisão

---
*Relatório gerado automaticamente por CodeRabbit em $(date '+%d/%m/%Y %H:%M')*
EOF

# Limpar arquivos temporários
rm -f "$CRITICAL_FILE" "$SUGGESTION_FILE" "$STYLE_FILE"

# Exibir resultado
echo -e "\n${GREEN}✅ Relatório gerado: $OUTPUT_FILE${NC}"
echo -e "${CYAN}📊 Estatísticas:${NC}"
echo -e "   🚨 Críticas: $CRITICAL_COUNT"
echo -e "   💡 Sugestões: $SUGGESTION_COUNT"
echo -e "   🎨 Estilo: $STYLE_COUNT"
echo -e "   📋 Total: $TOTAL_COUNT"

# Status final
if [ $TOTAL_COUNT -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Nenhuma issue encontrada! PR está limpo.${NC}"
elif [ $CRITICAL_COUNT -gt 0 ]; then
    echo -e "\n${RED}⚠️  ATENÇÃO: $CRITICAL_COUNT issues críticas precisam ser resolvidas!${NC}"
else
    echo -e "\n${YELLOW}💡 PR com sugestões de melhoria. Nenhuma issue crítica.${NC}"
fi

# Perguntar se quer abrir
echo -e "\n${YELLOW}Abrir relatório? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^[Ss]$ ]]; then
    if command -v code &> /dev/null; then
        code "$OUTPUT_FILE"
    elif command -v open &> /dev/null; then
        open "$OUTPUT_FILE"
    else
        echo -e "${BLUE}📄 Conteúdo do relatório:${NC}"
        cat "$OUTPUT_FILE"
    fi
fi