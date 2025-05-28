#!/bin/bash

# Script para gerar relatório limpo do CodeRabbit
# Uso: ./generate-clean-coderabbit-report.sh <PR_NUMBER>

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Verificar parâmetros
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Número do PR não fornecido${NC}"
    echo "Uso: $0 <PR_NUMBER>"
    echo "Exemplo: $0 14"
    exit 1
fi

PR_NUMBER=$1
OUTPUT_FILE="docs/reports/coderabbit-report-pr-${PR_NUMBER}.md"

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Erro: GitHub CLI (gh) não está instalado${NC}"
    echo "Instale com: brew install gh"
    exit 1
fi

echo -e "${BLUE}🤖 Gerando Relatório Limpo CodeRabbit - PR #${PR_NUMBER}${NC}"
echo "=================================================================="

# Função para limpar texto markdown/HTML
clean_text() {
    local text="$1"
    echo "$text" | \
        sed 's/<!-- .* -->//g' | \
        sed 's/<details>.*<\/details>//g' | \
        sed 's/<summary>.*<\/summary>//g' | \
        sed 's/```suggestion.*```//g' | \
        sed 's/```diff.*```//g' | \
        sed 's/```mermaid.*```//g' | \
        sed '/^$/d' | \
        sed 's/^[[:space:]]*//' | \
        sed 's/[[:space:]]*$//' | \
        grep -v "^$" | \
        head -3
}

# Função para extrair sugestões específicas
extract_actionable_suggestions() {
    local text="$1"
    echo "$text" | \
        grep -E "(Fix|Change|Update|Remove|Add|Replace|Consider|Should|Must|Avoid)" | \
        head -1 | \
        sed 's/^\*\*//' | \
        sed 's/\*\*$//' | \
        sed 's/^_⚠️ Potential issue_//' | \
        sed 's/^- //'
}

# Criar cabeçalho do relatório
cat > "$OUTPUT_FILE" << EOF
# 🤖 CodeRabbit - Relatório PR #${PR_NUMBER}

**Data:** $(date '+%d/%m/%Y %H:%M')  
**Status:** Análise Automática  

## 📋 Resumo Executivo

EOF

# Buscar informações do PR
echo -e "${CYAN}📥 Coletando dados do PR...${NC}"

PR_INFO=$(gh pr view "$PR_NUMBER" --json title,body,author,createdAt,url)
PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
PR_AUTHOR=$(echo "$PR_INFO" | jq -r '.author.login')
PR_URL=$(echo "$PR_INFO" | jq -r '.url')

# Adicionar info do PR ao relatório
cat >> "$OUTPUT_FILE" << EOF
**PR:** [$PR_TITLE]($PR_URL)  
**Autor:** @$PR_AUTHOR  

EOF

# Buscar comentários do CodeRabbit
echo -e "${CYAN}🔍 Analisando comentários do CodeRabbit...${NC}"

# Contador de issues
CRITICAL_COUNT=0
SUGGESTION_COUNT=0
STYLE_COUNT=0

# Arquivo temporário para issues críticas
CRITICAL_ISSUES=$(mktemp)
SUGGESTIONS=$(mktemp)
STYLE_ISSUES=$(mktemp)

# Buscar review comments (comentários em linhas específicas)
echo -e "${CYAN}📝 Processando comentários...${NC}"

# Buscar todos os comentários do CodeRabbit e salvar como array JSON
gh api "repos/{owner}/{repo}/pulls/$PR_NUMBER/comments" --jq '[.[] | select(.user.login | test("coderabbit"; "i")) | {path: .path, line: .line, body: .body}]' > /tmp/coderabbit_comments.json 2>/dev/null || echo "[]" > /tmp/coderabbit_comments.json

# Processar cada comentário
jq -c '.[]' /tmp/coderabbit_comments.json | while IFS= read -r comment; do
    if [ "$comment" != "" ] && [ "$comment" != "null" ]; then
        FILE_PATH=$(echo "$comment" | jq -r '.path // "unknown"')
        LINE_NUM=$(echo "$comment" | jq -r '.line // "N/A"')
        BODY=$(echo "$comment" | jq -r '.body // ""')
        
        # Extrair sugestão principal
        ACTIONABLE=$(echo "$BODY" | grep -E "^\*\*.*\*\*" | head -1 | sed 's/^\*\*//' | sed 's/\*\*$//')
        
        # Se não encontrou título em negrito, pegar primeira linha não vazia
        if [ -z "$ACTIONABLE" ]; then
            ACTIONABLE=$(echo "$BODY" | grep -v "^_⚠️" | grep -v "^$" | head -1 | sed 's/^[[:space:]]*//')
        fi
        
        # Limitar tamanho da sugestão
        ACTIONABLE=$(echo "$ACTIONABLE" | cut -c1-100)
        
        # Classificar por tipo
        if echo "$BODY" | grep -qi "error\|critical\|security\|vulnerability\|breaking\|syntax error"; then
            echo "- **$FILE_PATH:$LINE_NUM** - $ACTIONABLE" >> "$CRITICAL_ISSUES"
            CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
        elif echo "$BODY" | grep -qi "style\|format\|convention\|spacing\|naming\|lint"; then
            echo "- **$FILE_PATH:$LINE_NUM** - $ACTIONABLE" >> "$STYLE_ISSUES"
            STYLE_COUNT=$((STYLE_COUNT + 1))
        else
            echo "- **$FILE_PATH:$LINE_NUM** - $ACTIONABLE" >> "$SUGGESTIONS"
            SUGGESTION_COUNT=$((SUGGESTION_COUNT + 1))
        fi
    fi
done

# Limpar arquivo temporário
rm -f /tmp/coderabbit_comments.json

# Adicionar seção de métricas
cat >> "$OUTPUT_FILE" << EOF
| Categoria | Quantidade |
|-----------|------------|
| 🚨 Crítico | $CRITICAL_COUNT |
| 💡 Sugestões | $SUGGESTION_COUNT |
| 🎨 Estilo | $STYLE_COUNT |
| **Total** | **$((CRITICAL_COUNT + SUGGESTION_COUNT + STYLE_COUNT))** |

EOF

# Adicionar issues críticas se existirem
if [ $CRITICAL_COUNT -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## 🚨 Issues Críticas (Resolver Primeiro)

$(cat "$CRITICAL_ISSUES")

EOF
fi

# Adicionar sugestões se existirem
if [ $SUGGESTION_COUNT -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## 💡 Sugestões de Melhoria

$(cat "$SUGGESTIONS")

EOF
fi

# Adicionar issues de estilo se existirem
if [ $STYLE_COUNT -gt 0 ]; then
    cat >> "$OUTPUT_FILE" << EOF
## 🎨 Melhorias de Estilo

$(cat "$STYLE_ISSUES")

EOF
fi

# Adicionar seção de ações
cat >> "$OUTPUT_FILE" << EOF
## 🎯 Plano de Ação

### ✅ Para o Desenvolvedor

1. **Prioridade Alta:** Resolver issues críticas primeiro
2. **Prioridade Média:** Aplicar sugestões de melhoria  
3. **Prioridade Baixa:** Ajustar questões de estilo

### 🔄 Próximos Passos

- [ ] Revisar issues críticas
- [ ] Implementar correções necessárias
- [ ] Executar testes após mudanças
- [ ] Solicitar nova revisão se necessário

---
*Relatório gerado automaticamente em $(date '+%d/%m/%Y %H:%M')*
EOF

# Limpar arquivos temporários
rm -f "$CRITICAL_ISSUES" "$SUGGESTIONS" "$STYLE_ISSUES"

echo -e "\n${GREEN}✅ Relatório gerado com sucesso!${NC}"
echo -e "${YELLOW}📄 Arquivo: $OUTPUT_FILE${NC}"
echo -e "${CYAN}📊 Resumo: $CRITICAL_COUNT críticos, $SUGGESTION_COUNT sugestões, $STYLE_COUNT estilo${NC}"

# Estatísticas finais
TOTAL_ISSUES=$((CRITICAL_COUNT + SUGGESTION_COUNT + STYLE_COUNT))
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 Nenhuma issue encontrada! PR está limpo.${NC}"
elif [ $CRITICAL_COUNT -gt 0 ]; then
    echo -e "${RED}⚠️  Atenção: $CRITICAL_COUNT issues críticas precisam ser resolvidas${NC}"
else
    echo -e "${YELLOW}💡 PR com $TOTAL_ISSUES sugestões de melhoria${NC}"
fi

# Perguntar se quer abrir
echo -e "\n${YELLOW}Deseja abrir o relatório? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^[Ss]$ ]]; then
    if command -v code &> /dev/null; then
        code "$OUTPUT_FILE"
    elif command -v open &> /dev/null; then
        open "$OUTPUT_FILE"
    else
        less "$OUTPUT_FILE"
    fi
fi