#!/bin/bash

echo "🔒 Preparando repositório para compartilhamento público..."

# Lista de arquivos sensíveis para remover
SENSITIVE_FILES=(
    "CLAUDE.md"
    "PLANO-*.md"
    "RELATORIO-*.md"
    "RFC-*.md"
    "NPM-PUBLISH-GUIDE.md"
    "BACKUP-GUIDE.md"
    "lint.txt"
    "test.txt"
    "backups/"
    "logs/"
)

# Criar branch público se não existir
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Branch atual: $CURRENT_BRANCH"

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "❌ Erro: Há mudanças não commitadas. Faça commit ou stash primeiro."
    exit 1
fi

# Criar ou mudar para branch público
if git show-ref --verify --quiet refs/heads/public; then
    echo "🔄 Mudando para branch 'public' existente..."
    git checkout public
    git merge $CURRENT_BRANCH --no-edit
else
    echo "🆕 Criando novo branch 'public'..."
    git checkout -b public
fi

# Remover arquivos sensíveis
echo "🗑️  Removendo arquivos sensíveis..."
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -e "$file" ]; then
        git rm -rf "$file" 2>/dev/null || rm -rf "$file"
        echo "   ❌ Removido: $file"
    fi
done

# Usar .gitinclude como .gitignore (estratégia whitelist)
cp .gitinclude .gitignore
git add .gitignore

# Commit das mudanças
if ! git diff --staged --quiet; then
    git commit -m "chore: prepare for public sharing"
    echo "✅ Arquivos sensíveis removidos e .gitignore público aplicado"
else
    echo "ℹ️  Nenhuma mudança necessária"
fi

echo ""
echo "📋 Próximos passos:"
echo "1. Revise o branch 'public' para garantir que está tudo ok"
echo "2. Use 'git push origin public' para enviar ao repositório público"
echo "3. Para voltar ao desenvolvimento: 'git checkout $CURRENT_BRANCH'"