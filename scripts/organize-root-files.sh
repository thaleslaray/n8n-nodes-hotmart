#!/bin/bash

# Script para organizar automaticamente arquivos da raiz

echo "🗂️  Organizando arquivos da raiz do projeto..."

# Criar diretórios se não existirem
mkdir -p docs/reports docs/analysis docs/refactoring docs/integration

# Contador de arquivos movidos
MOVED=0

# Mover relatórios de teste
for file in test-report*.md test-report*.json created-workflows*.json; do
    if [ -f "$file" ]; then
        mv "$file" docs/reports/
        echo "✅ Movido: $file → docs/reports/"
        ((MOVED++))
    fi
done

# Mover relatórios do CodeRabbit
for file in coderabbit-report*.md coderabbit-report*.json CODERABBIT-*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/integration/
        echo "✅ Movido: $file → docs/integration/"
        ((MOVED++))
    fi
done

# Mover análises
for file in EDGE-CASE-*.md WEBHOOK-*.md *-ANALYSIS.md analysis-report*.json; do
    if [ -f "$file" ]; then
        mv "$file" docs/analysis/
        echo "✅ Movido: $file → docs/analysis/"
        ((MOVED++))
    fi
done

# Mover documentos de refatoração
for file in REFACTORING-*.md refactor-*.md; do
    if [ -f "$file" ]; then
        mv "$file" docs/refactoring/
        echo "✅ Movido: $file → docs/refactoring/"
        ((MOVED++))
    fi
done

# Mover outros arquivos temporários
for file in *.tmp *.bak *.backup *.old; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "🗑️  Removido: $file"
        ((MOVED++))
    fi
done

echo ""
if [ $MOVED -eq 0 ]; then
    echo "✨ Nenhum arquivo para organizar - raiz já está limpa!"
else
    echo "📊 Total: $MOVED arquivos organizados"
    echo ""
    echo "💡 Para prevenir isso no futuro:"
    echo "   1. Scripts devem criar arquivos em docs/reports/"
    echo "   2. Use ./scripts/monitor-root-files.sh antes de commits"
    echo "   3. Configure o pre-commit hook"
fi

# Listar arquivos restantes na raiz (exceto os permitidos)
echo ""
echo "📋 Arquivos na raiz (verificar se estão corretos):"
ls -1 | grep -vE "^(node_modules|dist|coverage|\.git|\.local|docs|scripts|__tests__|nodes|credentials|examples|backups)$" | grep -vE "^\." | sort