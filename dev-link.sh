#!/bin/bash

# Diretório de nós personalizados do n8n
N8N_CUSTOM_DIR="$HOME/.n8n/custom"

# Criar diretório se não existir
mkdir -p "$N8N_CUSTOM_DIR"

# Obter o caminho absoluto do diretório atual
CURRENT_DIR=$(pwd)

# Criar link simbólico para o diretório atual
echo "Criando link simbólico para $CURRENT_DIR em $N8N_CUSTOM_DIR/n8n-nodes-hotmart..."
ln -sf "$CURRENT_DIR" "$N8N_CUSTOM_DIR/n8n-nodes-hotmart"

echo "Link simbólico criado!"
echo "Agora você pode editar os arquivos diretamente e as alterações serão refletidas no n8n."
echo "Reinicie o n8n para carregar os novos nós."
