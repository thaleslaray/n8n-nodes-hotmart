#!/bin/bash

# Script para extrair relatório completo do CodeRabbit
# Uso: ./scripts/get-coderabbit-report.sh [PR_NUMBER]

set -e

# Configuração
REPO="thaleslaray/n8n-nodes-hotmart"
PR_NUMBER=${1:-14}
OUTPUT_FILE="docs/reports/coderabbit-report-pr-${PR_NUMBER}.md"

echo "🤖 Extraindo relatório completo do CodeRabbit..."
echo "📋 PR: #${PR_NUMBER}"
echo "📁 Repositório: ${REPO}"
echo ""

# Criar arquivo de saída
cat > "${OUTPUT_FILE}" << EOF
# CodeRabbit Report - PR #${PR_NUMBER}

**Gerado em:** $(date)
**Repositório:** ${REPO}

---

EOF

echo "📥 1. Extraindo comentários do CodeRabbit..."

# Extrair comentários do CodeRabbit no PR
echo "## 💬 Comentários do CodeRabbit" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

gh pr view "${PR_NUMBER}" --json comments --jq '.comments[] | select(.author.login=="coderabbitai") | "### Comentário " + (.createdAt | split("T")[0]) + "\n\n" + .body + "\n\n---\n"' >> "${OUTPUT_FILE}" 2>/dev/null || echo "❌ Erro ao extrair comentários do PR"

echo "📝 2. Extraindo reviews do CodeRabbit..."

# Extrair reviews do CodeRabbit
echo "" >> "${OUTPUT_FILE}"
echo "## 🔍 Reviews do CodeRabbit" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

gh api "repos/${REPO}/pulls/${PR_NUMBER}/reviews" --jq '.[] | select(.user.login=="coderabbitai") | "### Review " + (.submitted_at | split("T")[0]) + "\n\n**Estado:** " + .state + "\n\n" + (.body // "Sem comentário geral") + "\n\n---\n"' >> "${OUTPUT_FILE}" 2>/dev/null || echo "❌ Erro ao extrair reviews"

echo "📋 3. Extraindo comentários de review específicos..."

# Extrair comentários específicos de review
echo "" >> "${OUTPUT_FILE}"
echo "## 📍 Comentários Específicos de Código" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --jq '.[] | select(.user.login=="coderabbitai") | "### " + .path + ":" + (.line // .original_line | tostring) + "\n\n" + .body + "\n\n---\n"' >> "${OUTPUT_FILE}" 2>/dev/null || echo "❌ Erro ao extrair comentários específicos"

echo "🔍 4. Extraindo status de checks..."

# Extrair status dos checks
echo "" >> "${OUTPUT_FILE}"
echo "## ✅ Status dos Checks" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

gh pr checks "${PR_NUMBER}" >> "${OUTPUT_FILE}" 2>/dev/null || echo "❌ Erro ao extrair checks"

echo "📊 5. Extraindo informações gerais do PR..."

# Extrair informações gerais
echo "" >> "${OUTPUT_FILE}"
echo "## 📊 Informações Gerais do PR" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

gh pr view "${PR_NUMBER}" --json title,body,state,mergeable,additions,deletions,changedFiles --jq '"**Título:** " + .title + "\n\n**Estado:** " + .state + "\n**Mergeable:** " + (.mergeable | tostring) + "\n**Adições:** " + (.additions | tostring) + "\n**Remoções:** " + (.deletions | tostring) + "\n**Arquivos alterados:** " + (.changedFiles | tostring) + "\n\n**Descrição:**\n" + (.body // "Sem descrição")' >> "${OUTPUT_FILE}"

echo ""
echo "✅ Relatório extraído com sucesso!"
echo "📁 Arquivo: ${OUTPUT_FILE}"
echo "📏 Tamanho: $(wc -l < "${OUTPUT_FILE}") linhas"
echo ""
echo "🔍 Para visualizar:"
echo "   cat ${OUTPUT_FILE}"
echo "   less ${OUTPUT_FILE}"
echo "   code ${OUTPUT_FILE}"
echo ""

# Mostrar resumo
echo "📋 Resumo rápido dos problemas encontrados:"
echo "----------------------------------------"
grep -i "potential issue\|warning\|error\|critical\|problema" "${OUTPUT_FILE}" | head -10 || echo "   Nenhum problema crítico identificado na busca rápida"