#!/bin/bash

# Script para coletar métricas do projeto para o artigo

echo "📊 Coletando métricas do projeto n8n-hotmart..."

# Data atual
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Criar arquivo de métricas
METRICS_FILE="docs/development-diary/metrics-$(date +%Y%m%d-%H%M%S).md"

cat > "$METRICS_FILE" << EOF
# Métricas do Projeto - $DATE

## Estatísticas do Git
### Commits
\`\`\`
Total de commits: $(git rev-list --count HEAD)
Commits hoje: $(git log --oneline --since="1 day ago" | wc -l)
Commits esta semana: $(git log --oneline --since="1 week ago" | wc -l)
\`\`\`

### Contribuidores
\`\`\`
$(git shortlog -sn)
\`\`\`

## Estatísticas do Código
### Linhas de Código (sem node_modules)
\`\`\`
TypeScript: $(find . -name "*.ts" -not -path "./node_modules/*" | xargs wc -l | tail -1)
JavaScript: $(find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l | tail -1)
Total: $(find . \( -name "*.ts" -o -name "*.js" \) -not -path "./node_modules/*" | xargs wc -l | tail -1)
\`\`\`

### Arquivos
\`\`\`
Total de arquivos TS: $(find . -name "*.ts" -not -path "./node_modules/*" | wc -l)
Total de arquivos de teste: $(find . -name "*.test.ts" -not -path "./node_modules/*" | wc -l)
\`\`\`

## Cobertura de Testes
\`\`\`
$(npm test -- --coverage --silent 2>/dev/null | grep -A 10 "Coverage summary" || echo "Execute npm test para ver cobertura")
\`\`\`

## Tamanho do Projeto
\`\`\`
Tamanho total (sem node_modules): $(du -sh . --exclude=node_modules 2>/dev/null | cut -f1)
Arquivos no git: $(git ls-files | wc -l)
\`\`\`

## Timeline de Desenvolvimento
### Primeiro commit
\`\`\`
$(git log --reverse --pretty=format:"%h %ad %s" --date=short | head -1)
\`\`\`

### Último commit
\`\`\`
$(git log --pretty=format:"%h %ad %s" --date=short | head -1)
\`\`\`

### Dias de desenvolvimento
\`\`\`
$(echo "De $(git log --reverse --pretty=format:"%ad" --date=short | head -1) até $(git log --pretty=format:"%ad" --date=short | head -1)")
\`\`\`
EOF

echo "✅ Métricas salvas em: $METRICS_FILE"

# Mostrar resumo
echo ""
echo "📈 Resumo Rápido:"
echo "- Commits totais: $(git rev-list --count HEAD)"
echo "- Arquivos TypeScript: $(find . -name "*.ts" -not -path "./node_modules/*" | wc -l)"
echo "- Testes: $(find . -name "*.test.ts" -not -path "./node_modules/*" | wc -l)"