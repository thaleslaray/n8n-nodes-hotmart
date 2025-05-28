#!/bin/bash

echo "🔧 Configurando GitHub MCP Server..."

# Verificar se o token foi fornecido
if [ -z "$1" ]; then
    echo "❌ Erro: Forneça seu GitHub Personal Access Token"
    echo "Uso: $0 <seu-github-token>"
    echo ""
    echo "Para criar um token:"
    echo "1. Vá para https://github.com/settings/tokens/new"
    echo "2. Crie um token com permissões 'repo' e 'read:org'"
    exit 1
fi

GITHUB_TOKEN=$1

# Criar arquivo de configuração do MCP
MCP_CONFIG_DIR="$HOME/.config/claude"
MCP_CONFIG_FILE="$MCP_CONFIG_DIR/mcp-settings.json"

mkdir -p "$MCP_CONFIG_DIR"

# Verificar se já existe configuração
if [ -f "$MCP_CONFIG_FILE" ]; then
    echo "⚠️  Arquivo de configuração MCP já existe"
    echo "📄 Editando: $MCP_CONFIG_FILE"
    # Fazer backup
    cp "$MCP_CONFIG_FILE" "$MCP_CONFIG_FILE.backup"
    echo "💾 Backup criado: $MCP_CONFIG_FILE.backup"
fi

# Criar configuração do GitHub MCP
cat > "$MCP_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ]
    }
  }
}
EOF

echo "✅ Configuração do GitHub MCP criada!"
echo ""
echo "📋 Próximos passos:"
echo "1. Reinicie o Claude Desktop"
echo "2. O servidor GitHub MCP estará disponível"
echo "3. Você poderá usar comandos como:"
echo "   - Criar/gerenciar branches"
echo "   - Configurar proteção de branches"
echo "   - Criar pull requests"
echo "   - Gerenciar issues"
echo ""
echo "🔐 Token salvo em: $MCP_CONFIG_FILE"
echo "⚠️  Mantenha este arquivo seguro!"