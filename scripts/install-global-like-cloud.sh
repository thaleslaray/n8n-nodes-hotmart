#!/bin/bash

# Script para instalar nó globalmente (simulando n8n Cloud)

echo "📦 INSTALAÇÃO GLOBAL (SIMULANDO N8N CLOUD)"
echo "=========================================="
echo

# Detectar diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

echo "🔨 Compilando projeto..."
pnpm build

echo "📦 Criando pacote..."
npm pack

# Pegar o arquivo .tgz mais recente
TGZ_FILE=$(ls -t n8n-nodes-hotmart-*.tgz | head -n1)

if [[ -z "$TGZ_FILE" ]]; then
    echo "❌ Erro: Arquivo .tgz não encontrado"
    exit 1
fi

echo "📥 Instalando globalmente: $TGZ_FILE"

# Instalar globalmente (como n8n Cloud faz)
npm install -g "./$TGZ_FILE"

echo "✅ Pacote instalado globalmente!"
echo
echo "🌥️ Para simular remoção como n8n Cloud:"
echo "   npm uninstall -g n8n-nodes-hotmart"
echo
echo "🔍 Para verificar instalação:"
echo "   npm list -g --depth=0 | grep hotmart"

# Limpar arquivo temporário
rm -f "$TGZ_FILE"