#!/bin/bash

echo "🔧 Configurando branch público..."

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado"
    echo "📦 Instale com: brew install gh"
    exit 1
fi

# Nome do branch público
PUBLIC_BRANCH="main-public"
CURRENT_BRANCH=$(git branch --show-current)

# Criar branch público se não existir
if ! git show-ref --verify --quiet refs/heads/$PUBLIC_BRANCH; then
    echo "📝 Criando branch público..."
    
    # Criar branch órfão (sem histórico)
    git checkout --orphan $PUBLIC_BRANCH
    
    # Usar .gitinclude
    cp .gitinclude .gitignore
    git add .
    git commit -m "Initial public version"
    
    # Push do branch público
    git push -u origin $PUBLIC_BRANCH
else
    echo "✅ Branch público já existe"
fi

# Voltar ao branch original
git checkout $CURRENT_BRANCH

echo ""
echo "📋 Próximos passos:"
echo "1. Vá para: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings"
echo "2. Em 'Default branch', mude para '$PUBLIC_BRANCH'"
echo "3. Configure branch protection rules:"
echo "   - Proteja seus branches privados"
echo "   - Configure '$PUBLIC_BRANCH' como branch padrão"
echo ""
echo "🔐 Branches sugeridos:"
echo "   - main-public: Branch padrão (público)"
echo "   - develop: Desenvolvimento privado"
echo "   - feature/*: Features privadas"