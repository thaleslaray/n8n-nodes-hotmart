#!/bin/bash

# Gera automaticamente o CHANGELOG baseado nos commits

echo "📝 Gerando CHANGELOG..."

# Executa o standard-version sem criar tag/commit
npm run release -- --dry-run

echo "✅ CHANGELOG gerado com sucesso!"
echo ""
echo "Para fazer um release oficial, use:"
echo "  npm run release:patch  - Para versão patch (0.5.2 -> 0.5.3)"
echo "  npm run release:minor  - Para versão minor (0.5.2 -> 0.6.0)"
echo "  npm run release:major  - Para versão major (0.5.2 -> 1.0.0)"