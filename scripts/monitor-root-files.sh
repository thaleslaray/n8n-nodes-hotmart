#!/bin/bash

# Script para monitorar e prevenir criação de arquivos na raiz
# Deve ser executado antes de commits

echo "🔍 Verificando arquivos na raiz do projeto..."

# Lista de extensões que não devem estar na raiz
REPORT_EXTENSIONS="test-report.*\.(md|json|html|txt)|created-workflows.*\.json|coderabbit-report.*\.(md|json)|analysis-report.*\.json|REFACTORING-.*\.md|EDGE-CASE.*\.md|WEBHOOK-.*\.md"

# Verificar se há arquivos de relatório na raiz
ROOT_REPORTS=$(ls -1 2>/dev/null | grep -E "$REPORT_EXTENSIONS" || true)

if [ -n "$ROOT_REPORTS" ]; then
    echo "⚠️  AVISO: Encontrados arquivos de relatório na raiz que devem estar em docs/:"
    echo "$ROOT_REPORTS" | while read -r file; do
        echo "   - $file"
        
        # Sugerir destino apropriado
        if [[ "$file" =~ test-report|created-workflows ]]; then
            echo "     → Mover para: docs/reports/$file"
        elif [[ "$file" =~ coderabbit|integration ]]; then
            echo "     → Mover para: docs/integration/$file"
        elif [[ "$file" =~ REFACTORING|refactor ]]; then
            echo "     → Mover para: docs/refactoring/$file"
        elif [[ "$file" =~ EDGE-CASE|WEBHOOK|analysis ]]; then
            echo "     → Mover para: docs/analysis/$file"
        else
            echo "     → Mover para: docs/reports/$file"
        fi
    done
    
    echo ""
    echo "🚫 Por favor, mova estes arquivos antes de fazer commit!"
    echo ""
    echo "Execute o comando abaixo para mover automaticamente:"
    echo "./scripts/organize-root-files.sh"
    
    exit 1
else
    echo "✅ Nenhum arquivo de relatório encontrado na raiz!"
fi

# Verificar arquivos .md suspeitos (exceto os permitidos)
ALLOWED_MD="README.md|CHANGELOG.md|CODE_OF_CONDUCT.md|CONTRIBUTING.md|LICENSE.md|CLAUDE.md|ROADMAP.md|TASKS.md"
SUSPICIOUS_MD=$(ls -1 *.md 2>/dev/null | grep -vE "^($ALLOWED_MD)$" || true)

if [ -n "$SUSPICIOUS_MD" ]; then
    echo ""
    echo "⚠️  Arquivos .md suspeitos na raiz:"
    echo "$SUSPICIOUS_MD" | while read -r file; do
        echo "   - $file → considere mover para docs/"
    done
fi

echo ""
echo "💡 Dica: Use 'git status' para verificar antes de commit"
echo "💡 Configure pre-commit hook: cp scripts/monitor-root-files.sh .git/hooks/pre-commit"