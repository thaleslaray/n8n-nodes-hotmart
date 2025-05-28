#!/bin/bash

# Script para encontrar problemas específicos mencionados na imagem
set -e

echo "🔍 Procurando problemas específicos do CodeRabbit..."
echo ""

# Buscar pelo problema do PIX
echo "1. 🔴 PIX OUTPUT MISMATCH:"
echo "=========================="
if grep -l -i "pix" coderabbit-report-pr-14.md >/dev/null 2>&1; then
    grep -A5 -B5 -i "pix.*output\|output.*pix\|parameter.*index.*mismatch" coderabbit-report-pr-14.md || echo "   Não encontrado no relatório principal"
else
    echo "   Não encontrado no relatório principal"
fi

echo ""

# Buscar pelo problema do install script
echo "2. 🟡 INSTALL SCRIPT ISSUE:"
echo "============================"
grep -A5 -B5 -i "install.*script.*exists\|verify.*install" coderabbit-report-pr-14.md || echo "   Não encontrado no relatório principal"

echo ""

# Buscar pelo problema de preserving error output
echo "3. 💡 PRESERVING ERROR OUTPUT:"
echo "=============================="
grep -A5 -B5 -i "preserving.*error.*output\|consider.*preserving.*error" coderabbit-report-pr-14.md || echo "   Não encontrado no relatório principal"

echo ""

# Verificar se há comentários específicos de review que não estão no relatório principal
echo "4. 🔍 COMENTÁRIOS ESPECÍFICOS DE REVIEW:"
echo "========================================"

# Tentar buscar comentários específicos via API
gh api "repos/thaleslaray/n8n-nodes-hotmart/pulls/14/comments" 2>/dev/null | jq -r '.[] | select(.user.login=="coderabbitai") | {file: .path, line: (.line // .original_line), body: .body}' | head -50 || echo "   Erro ao acessar comentários específicos"

echo ""
echo "5. 📋 RESUMO DOS PROBLEMAS IDENTIFICADOS:"
echo "========================================="
echo "   Os problemas específicos que você viu na imagem podem estar em:"
echo "   - Comentários inline no código (não capturados no relatório principal)"
echo "   - Reviews específicos de arquivos individuais"
echo "   - Sugestões de refatoração em contexto específico"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "   1. Verificar arquivo HotmartTrigger.node.ts nas linhas ~205-212 para PIX output"
echo "   2. Verificar scripts de instalação"
echo "   3. Analisar tratamento de erros em debug"