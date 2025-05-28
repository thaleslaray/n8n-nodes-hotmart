#!/bin/bash

# Script para atualizar todos os scripts que criam arquivos na raiz
# para criá-los em diretórios apropriados dentro de docs/

echo "🔧 Atualizando caminhos de saída dos scripts..."

# 1. Atualizar create-three-modes-optimal.js
if [ -f ".local/scripts/old/create-three-modes-optimal.js" ]; then
    sed -i.bak "s|'docs/reports/created-workflows-optimal.json'|'docs/reports/created-workflows-optimal.json'|g" \
        .local/scripts/old/create-three-modes-optimal.js
    echo "✅ Atualizado: create-three-modes-optimal.js"
fi

# 2. Procurar e atualizar outros scripts que criam relatórios
find scripts .local/scripts -type f \( -name "*.js" -o -name "*.ts" -o -name "*.sh" \) | while read -r file; do
    # Backup antes de modificar
    if grep -q "test-report.*\.md\|coderabbit-report\|created-workflows" "$file" 2>/dev/null; then
        # Criar backup
        cp "$file" "$file.bak"
        
        # Atualizar caminhos
        sed -i '' \
            -e "s|'test-report-full\.md'|'docs/reports/test-report-full.md'|g" \
            -e "s|\"test-report-full\.md\"|\"docs/reports/test-report-full.md\"|g" \
            -e "s|> test-report-full\.md|> docs/reports/test-report-full.md|g" \
            -e "s|'docs/reports/coderabbit-report|'docs/reports/coderabbit-report|g" \
            -e "s|\"docs/reports/coderabbit-report|\"docs/reports/coderabbit-report|g" \
            -e "s|> docs/reports/coderabbit-report|> docs/reports/coderabbit-report|g" \
            -e "s|'docs/reports/created-workflows|'docs/reports/created-workflows|g" \
            -e "s|\"docs/reports/created-workflows|\"docs/reports/created-workflows|g" \
            "$file"
        
        echo "✅ Atualizado: $file"
    fi
done

# 3. Criar README.md nos diretórios docs/
cat > docs/analysis/README.md << 'EOF'
# 📊 Análises

Este diretório contém análises técnicas do projeto:

- **EDGE-CASE-ANALYSIS.md** - Análise de casos extremos
- **WEBHOOK-STRUCTURE-ANALYSIS.md** - Análise da estrutura de webhooks
- Outras análises técnicas

Arquivos são movidos automaticamente da raiz para manter organização.
EOF

cat > docs/reports/README.md << 'EOF'
# 📈 Relatórios

Este diretório contém relatórios gerados automaticamente:

- **test-report-*.md** - Relatórios de teste
- **coderabbit-report-*.md** - Relatórios do CodeRabbit
- **created-workflows-*.json** - Informações de workflows criados
- Outros relatórios de execução

Arquivos são gerados automaticamente pelos scripts em docs/reports/.
EOF

cat > docs/refactoring/README.md << 'EOF'
# 🔧 Refatoração

Este diretório contém documentação de refatorações:

- **REFACTORING-IMPACT-ANALYSIS.md** - Análise de impacto
- **REFACTORING-SAFETY-PROTOCOL.md** - Protocolo de segurança
- Planos e análises de refatoração

Documentação importante para mudanças estruturais.
EOF

cat > docs/integration/README.md << 'EOF'
# 🔌 Integrações

Este diretório contém documentação de integrações:

- **README-CODERABBIT-INTEGRATION.md** - Integração com CodeRabbit
- **CODERABBIT-SUGGESTIONS.md** - Sugestões do CodeRabbit
- Outras integrações e configurações

Documentação de ferramentas e serviços integrados.
EOF

echo ""
echo "✅ Script de atualização criado!"
echo ""
echo "📝 Próximos passos:"
echo "1. Execute: chmod +x scripts/update-output-paths.sh"
echo "2. Execute: ./scripts/update-output-paths.sh"
echo "3. Remova os arquivos .bak após verificar que tudo funciona"