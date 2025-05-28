#!/bin/bash

# Script para extrair apenas os problemas importantes do CodeRabbit
set -e

PR_NUMBER=${1:-14}
REPO="thaleslaray/n8n-nodes-hotmart"

echo "🔍 Extraindo problemas críticos do CodeRabbit - PR #${PR_NUMBER}"
echo ""

# Extrair comentários específicos de código (os mais importantes)
echo "🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:"
echo "====================================="

gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --jq '.[] | select(.user.login=="coderabbitai") | {
  file: .path,
  line: (.line // .original_line),
  body: .body
}' 2>/dev/null | jq -r '
if .line then 
  "📁 " + .file + ":" + (.line | tostring) + "\n" + .body + "\n" + ("=" * 60) + "\n"
else 
  "📁 " + .file + "\n" + .body + "\n" + ("=" * 60) + "\n"
end'

echo ""
echo "📊 RESUMO DE PROBLEMAS POR SEVERIDADE:"
echo "======================================"

# Contar problemas por tipo
echo "🔴 CRÍTICOS (Potential Issue):"
gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --jq '.[] | select(.user.login=="coderabbitai") | .body' | grep -c -i "potential issue" || echo "0"

echo "🟡 WARNINGS:"
gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --jq '.[] | select(.user.login=="coderabbitai") | .body' | grep -c -i "warning" || echo "0"

echo "💡 SUGESTÕES (Refactor Suggestion):"
gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --jq '.[] | select(.user.login=="coderabbitai") | .body' | grep -c -i "refactor suggestion" || echo "0"

echo ""
echo "📝 ARQUIVOS COM PROBLEMAS:"
echo "=========================="
gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --jq '.[] | select(.user.login=="coderabbitai") | .path' | sort | uniq -c | sort -nr

echo ""
echo "🎯 AÇÕES RECOMENDADAS:"
echo "====================="
echo "1. Investigar problemas CRÍTICOS primeiro"
echo "2. Corrigir WARNINGs se possível"
echo "3. Considerar sugestões de refatoração para PRs futuros"