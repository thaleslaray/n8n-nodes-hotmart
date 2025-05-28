#!/bin/bash

# Script de Validação de Mudanças - Previne quebras no código
# Executa todos os testes necessários antes de fazer merge

set -e  # Para em caso de erro

echo "🛡️ Iniciando validação completa de mudanças..."
echo "================================================"

# 1. Verificar se estamos em um branch feature
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "❌ ERRO: Você está no branch main!"
    echo "Por favor, crie um branch para suas mudanças:"
    echo "git checkout -b feat/sua-feature"
    exit 1
fi

echo "✅ Branch atual: $CURRENT_BRANCH"

# 2. Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Aviso: Você tem mudanças não commitadas"
    echo "Considere fazer commit antes de validar"
fi

# 3. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
pnpm install

# 4. Limpar e compilar
echo ""
echo "🧹 Limpando arquivos antigos..."
pnpm clean

echo ""
echo "🔨 Compilando projeto..."
if ! pnpm build; then
    echo "❌ ERRO: Falha na compilação!"
    exit 1
fi

# 5. Executar linter
echo ""
echo "🔍 Verificando código com linter..."
if ! pnpm lint; then
    echo "❌ ERRO: Problemas encontrados pelo linter!"
    echo "Execute 'pnpm lint:fix' para corrigir automaticamente"
    exit 1
fi

# 6. Verificar tipos TypeScript
echo ""
echo "📝 Verificando tipos TypeScript..."
if ! pnpm typecheck; then
    echo "❌ ERRO: Erros de tipo encontrados!"
    exit 1
fi

# 7. Executar testes
echo ""
echo "🧪 Executando testes..."
if ! pnpm test; then
    echo "❌ ERRO: Testes falharam!"
    exit 1
fi

# 8. Verificar cobertura
echo ""
echo "📊 Verificando cobertura de testes..."
if ! pnpm test:coverage:check; then
    echo "❌ ERRO: Cobertura abaixo de 80%!"
    echo "Adicione mais testes antes de continuar"
    exit 1
fi

# 9. Criar pacote de teste
echo ""
echo "📦 Criando pacote..."
if ! pnpm pack; then
    echo "❌ ERRO: Falha ao criar pacote!"
    exit 1
fi

# 10. Sucesso!
echo ""
echo "================================================"
echo "✅ VALIDAÇÃO COMPLETA COM SUCESSO!"
echo "================================================"
echo ""
echo "Próximos passos:"
echo "1. Teste manualmente: ./install && ./start-n8n"
echo "2. Crie um PR para revisão"
echo "3. Aguarde aprovação antes de fazer merge"
echo ""
echo "🎉 Seu código está pronto para revisão!"