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

echo -e "${YELLOW}Iniciando processo de build e instalação...${NC}"

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
set +e  # Desabilitar saída imediata em caso de erro

# Verificar se a compilação foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}Erro na compilação. Abortando instalação.${NC}"
  exit 1
fi

# Criar diretório temporário
echo -e "${YELLOW}Criando diretório temporário...${NC}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/nodes/Hotmart"
mkdir -p "$TEMP_DIR/credentials"

# Copiar apenas os arquivos do nó Hotmart
echo -e "${YELLOW}Copiando arquivos do nó Hotmart...${NC}"
if [ -d "./dist/nodes/Hotmart" ]; then
  cp -r ./dist/nodes/Hotmart/* "$TEMP_DIR/nodes/Hotmart/"
else
  echo -e "${RED}Diretório do nó Hotmart não encontrado. A compilação pode ter falhado.${NC}"
  exit 1
fi

# Copiar apenas as credenciais do Hotmart
echo -e "${YELLOW}Copiando credenciais do Hotmart...${NC}"
if [ -f "./dist/credentials/HotmartOAuth2Api.credentials.js" ]; then
  cp ./dist/credentials/HotmartOAuth2Api.credentials.js "$TEMP_DIR/credentials/"
else
  echo -e "${RED}Arquivo de credenciais do Hotmart não encontrado. A compilação pode ter falhado.${NC}"
  exit 1
fi

# Copiar arquivos SVG
echo -e "${YELLOW}Copiando arquivos SVG...${NC}"
if [ -f "./nodes/Hotmart/hotmart.svg" ]; then
  # Copia para o diretório raiz do Hotmart
  mkdir -p "$TEMP_DIR/nodes/Hotmart/"
  cp ./nodes/Hotmart/hotmart.svg "$TEMP_DIR/nodes/Hotmart/"

  # Copia também para o diretório v1/icons
  mkdir -p "$TEMP_DIR/nodes/Hotmart/v1/icons/"
  cp ./nodes/Hotmart/hotmart.svg "$TEMP_DIR/nodes/Hotmart/v1/icons/"
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
  "homepage": "https://github.com/yourusername/n8n-nodes-hotmart",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/HotmartOAuth2Api.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Hotmart/Hotmart.node.js",
      "dist/nodes/Hotmart/HotmartTrigger.node.js",
      "dist/nodes/Hotmart/HotmartRouter.node.js"
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
    require('./nodes/Hotmart/Hotmart.node.js'),
    require('./nodes/Hotmart/HotmartTrigger.node.js'),
    require('./nodes/Hotmart/HotmartRouter.node.js'),
  ],
  credentials: [
    require('./credentials/HotmartOAuth2Api.credentials.js'),
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
echo -e "${YELLOW}Reiniciando o n8n em modo debug completo para carregar os novos nós...${NC}"
pkill -f n8n
sleep 2
N8N_LOG_LEVEL=debug N8N_LOG_OUTPUT=console N8N_LOG_LABELS=true n8n start &
# Configurar variáveis de ambiente para o n8n usar com o Cloudflare Tunnel
echo -e "${YELLOW}Configurando variáveis de ambiente para o domínio n8n.laray.com.br...${NC}"
N8N_ENV_FILE="$HOME/.n8n/n8n_env"
cat > "$N8N_ENV_FILE" << EOF
N8N_HOST=n8n.laray.com.br
N8N_PROTOCOL=https
N8N_PORT=443
N8N_WEBHOOK_URL=https://n8n.laray.com.br
EOF

# Iniciar Cloudflare Tunnel
echo -e "${YELLOW}Iniciando o Cloudflare Tunnel...${NC}"
# Verificar se o tunnel já está em execução
TUNNEL_PID=$(pgrep -f "cloudflared tunnel run 964f58f6-6dab-4997-b1fc-5a9b2edea379" || echo "")
if [ -n "$TUNNEL_PID" ]; then
  echo -e "${YELLOW}Cloudflare Tunnel já está em execução (PID: $TUNNEL_PID). Reiniciando...${NC}"
  kill $TUNNEL_PID
  sleep 2
fi

# Iniciar o tunnel em segundo plano
nohup cloudflared tunnel run 964f58f6-6dab-4997-b1fc-5a9b2edea379 > $HOME/.n8n/tunnel.log 2>&1 &
TUNNEL_PID=$!
echo -e "${GREEN}Cloudflare Tunnel iniciado em segundo plano (PID: $TUNNEL_PID)${NC}"
echo -e "${GREEN}Log do tunnel disponível em $HOME/.n8n/tunnel.log${NC}"

echo -e "${YELLOW}Exportando variáveis de ambiente...${NC}"
export N8N_HOST=n8n.laray.com.br
export N8N_PROTOCOL=https
export N8N_PORT=443
export N8N_WEBHOOK_URL=https://n8n.laray.com.br

echo -e "${GREEN}n8n iniciado em modo debug completo!${NC}"
echo -e "${GREEN}Seu webhook está disponível em: https://n8n.laray.com.br/webhook-test/hotmart${NC}"
