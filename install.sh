#!/bin/bash

# Diretório de nós personalizados do n8n
N8N_CUSTOM_DIR="$HOME/.n8n/custom"

# Criar diretório se não existir
mkdir -p "$N8N_CUSTOM_DIR"

# Compilar o código
echo "Compilando o código..."
pnpm install
pnpm build

# Verificar se a compilação foi bem-sucedida
if [ $? -ne 0 ]; then
  echo "Erro na compilação. Abortando instalação."
  exit 1
fi

# Copiar arquivos para o diretório de nós personalizados
echo "Copiando arquivos para $N8N_CUSTOM_DIR..."
cp -r dist/* "$N8N_CUSTOM_DIR/"
cp package.json "$N8N_CUSTOM_DIR/"
cp README.md "$N8N_CUSTOM_DIR/"

echo "Instalação concluída!"
echo "Reinicie o n8n para carregar os novos nós."
