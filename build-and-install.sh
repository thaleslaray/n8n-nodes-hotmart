#!/bin/bash

# Diretório de nós personalizados do n8n
N8N_CUSTOM_DIR="$HOME/.n8n/custom"
PACKAGE_NAME="n8n-nodes-hotmart"
TEMP_DIR="./dist-custom"

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Funções auxiliares
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Erro: $1 não está instalado. Por favor, instale-o para continuar.${NC}"
    exit 1
  fi
}

# Verificar se o pnpm está instalado
check_command pnpm

echo -e "${YELLOW}Iniciando processo de build e instalação...${NC}"

# Criar diretórios necessários para o n8n
mkdir -p "$N8N_CUSTOM_DIR"

# Remover qualquer instalação anterior
if [ -d "$N8N_CUSTOM_DIR/$PACKAGE_NAME" ]; then
  echo -e "${YELLOW}Removendo instalação anterior...${NC}"
  rm -rf "$N8N_CUSTOM_DIR/$PACKAGE_NAME"
fi

# Remover qualquer link simbólico anterior
if [ -L "$N8N_CUSTOM_DIR/$PACKAGE_NAME" ]; then
  echo -e "${YELLOW}Removendo link simbólico anterior...${NC}"
  rm -f "$N8N_CUSTOM_DIR/$PACKAGE_NAME"
fi

# Compilar o código
echo -e "${YELLOW}Compilando o código...${NC}"
pnpm install
set -e  # Sair imediatamente se um comando falhar
pnpm build
COMPILE_RESULT=$?
set +e  # Desabilitar saída imediata em caso de erro

# Verificar se a compilação foi bem-sucedida
if [ $COMPILE_RESULT -ne 0 ]; then
  echo -e "${RED}Erro na compilação. Abortando instalação.${NC}"
  exit 1
fi

# Criar diretório temporário
echo -e "${YELLOW}Criando diretório temporário...${NC}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/dist/nodes/Hotmart"
mkdir -p "$TEMP_DIR/dist/credentials"

# Copiar apenas os arquivos do nó Hotmart
echo -e "${YELLOW}Copiando arquivos do nó Hotmart...${NC}"
if [ -d "./dist/nodes/Hotmart" ]; then
  cp -r ./dist/nodes/Hotmart/* "$TEMP_DIR/dist/nodes/Hotmart/"
else
  echo -e "${RED}Diretório do nó Hotmart não encontrado. A compilação pode ter falhado.${NC}"
  exit 1
fi

# Copiar apenas as credenciais do Hotmart
echo -e "${YELLOW}Copiando credenciais do Hotmart...${NC}"
if [ -f "./dist/credentials/HotmartOAuth2Api.credentials.js" ]; then
  cp ./dist/credentials/HotmartOAuth2Api.credentials.js "$TEMP_DIR/dist/credentials/"
else
  echo -e "${RED}Arquivo de credenciais do Hotmart não encontrado. A compilação pode ter falhado.${NC}"
  exit 1
fi

# Copiar arquivos SVG
echo -e "${YELLOW}Copiando arquivos SVG...${NC}"
if [ -f "./nodes/Hotmart/hotmart.svg" ]; then
  # Copia para o diretório raiz do Hotmart
  mkdir -p "$TEMP_DIR/dist/nodes/Hotmart/"
  cp ./nodes/Hotmart/hotmart.svg "$TEMP_DIR/dist/nodes/Hotmart/"

  # Copia também para o diretório v1/icons
  mkdir -p "$TEMP_DIR/dist/nodes/Hotmart/v1/icons/"
  cp ./nodes/Hotmart/hotmart.svg "$TEMP_DIR/dist/nodes/Hotmart/v1/icons/"
  echo -e "${GREEN}Arquivos SVG do Hotmart copiados com sucesso.${NC}"
else
  echo -e "${YELLOW}Arquivo SVG do Hotmart não encontrado.${NC}"
fi

# Criar package.json específico para a instalação
echo -e "${YELLOW}Criando package.json para instalação...${NC}"
cat > "$TEMP_DIR/package.json" << EOF
{
  "name": "n8n-nodes-hotmart",
  "version": "0.1.0",
  "description": "n8n nodes to interact with Hotmart API",
  "keywords": [
    "n8n-community-node-package",
    "hotmart"
  ],
  "license": "MIT",
  "homepage": "https://github.com/thaleslaray/n8n-nodes-hotmart",
  "author": {
    "name": "Thales Laray",
    "email": "thales.laray@gmail.com"
  },
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/HotmartOAuth2Api.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Hotmart/Hotmart.node.js",
      "dist/nodes/Hotmart/HotmartTrigger.node.js",
      "dist/nodes/Hotmart/HotmartSmartTrigger.node.js"
    ]
  },
  "files": [
    "dist"
  ],
  "main": "index.js"
}
EOF

# Criar index.js para a instalação
echo -e "${YELLOW}Criando index.js para instalação...${NC}"
cat > "$TEMP_DIR/index.js" << EOF
module.exports = {
  nodes: [
    require('./dist/nodes/Hotmart/Hotmart.node.js'),
    require('./dist/nodes/Hotmart/HotmartTrigger.node.js'),
    require('./dist/nodes/Hotmart/HotmartSmartTrigger.node.js'),
  ],
  credentials: [
    require('./dist/credentials/HotmartOAuth2Api.credentials.js'),
  ],
};
EOF

# Criar diretório no n8n custom
echo -e "${YELLOW}Criando diretório no n8n custom...${NC}"
mkdir -p "$N8N_CUSTOM_DIR/$PACKAGE_NAME"

# Copiar arquivos para o diretório de nós personalizados
echo -e "${YELLOW}Copiando arquivos para $N8N_CUSTOM_DIR/$PACKAGE_NAME...${NC}"
cp -r "$TEMP_DIR"/* "$N8N_CUSTOM_DIR/$PACKAGE_NAME/"

# Limpar diretório temporário
echo -e "${YELLOW}Limpando diretório temporário...${NC}"
rm -rf "$TEMP_DIR"

echo -e "${GREEN}Instalação concluída!${NC}"
echo -e "${GREEN}Os nós Hotmart foram instalados em $N8N_CUSTOM_DIR/$PACKAGE_NAME${NC}"

# Criar pacote npm para instalação direta (opcional)
echo -e "${YELLOW}Criando pacote npm para referência...${NC}"
pnpm pack

# Limpar caches do n8n para garantir que detecte os novos nós
echo -e "${YELLOW}Limpando caches do n8n...${NC}"
if [ -d "$HOME/.n8n/.cache" ]; then
  rm -rf "$HOME/.n8n/.cache"
fi

# Instruções para reiniciar o n8n
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Instalação concluída com sucesso!${NC}"
echo -e "${GREEN}Para aplicar as alterações:${NC}"
echo -e "${YELLOW}1. Pare o n8n, se estiver em execução:${NC}"
echo -e "   pkill -f n8n"
echo -e "${YELLOW}2. Inicie o n8n novamente:${NC}"
echo -e "   n8n start"
echo -e "${GREEN}============================================${NC}"

# Perguntar se o usuário quer reiniciar o n8n
read -p "Deseja reiniciar o n8n agora? (s/n) " REINICIAR

if [[ "$REINICIAR" =~ ^[Ss]$ ]]; then
  echo -e "${YELLOW}Reiniciando o n8n...${NC}"
  pkill -f n8n || true
  sleep 2
  n8n start &
  echo -e "${GREEN}n8n reiniciado!${NC}"
  echo -e "${GREEN}Acesse http://localhost:5678 para verificar os nós instalados.${NC}"
else
  echo -e "${YELLOW}Lembre-se de reiniciar o n8n manualmente para aplicar as alterações.${NC}"
fi
