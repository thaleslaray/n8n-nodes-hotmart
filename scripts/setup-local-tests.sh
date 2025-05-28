#!/bin/bash

# Script para configurar ambiente de testes locais
# Este script restaura os scripts de automação que não são versionados no git

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Configurando ambiente de testes locais...${NC}"
echo "================================================"

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ] || [ ! -d "scripts" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto!${NC}"
    exit 1
fi

# Criar estrutura local
echo -e "${BLUE}📁 Criando estrutura de diretórios locais...${NC}"
mkdir -p .local/scripts/test-automation
mkdir -p .local/scripts/old

# Verificar se existe backup
BACKUP_FILE="$HOME/backups/n8n-hotmart-test-scripts.tar.gz"
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${BLUE}📦 Backup encontrado! Restaurando scripts...${NC}"
    tar -xzf "$BACKUP_FILE" -C .local/scripts/
    echo -e "${GREEN}✅ Scripts restaurados de $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  Backup não encontrado em: $BACKUP_FILE${NC}"
    echo -e "${YELLOW}   Procurando em backups do projeto...${NC}"
    
    # Tentar encontrar nos backups do projeto
    LATEST_BACKUP=$(find backups -name "*.tar.gz" -type f | grep -E "(backup_|quick_)" | sort -r | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        echo -e "${BLUE}📦 Extraindo scripts de $LATEST_BACKUP...${NC}"
        # Extrair apenas os arquivos de test-automation
        tar -xzf "$LATEST_BACKUP" ./scripts/test-automation --strip-components=1 -C .local/scripts/ 2>/dev/null || true
        
        echo -e "${GREEN}✅ Scripts extraídos do backup${NC}"
    else
        echo -e "${RED}❌ Nenhum backup encontrado!${NC}"
        echo -e "${YELLOW}💡 Você precisará restaurar manualmente os scripts de teste${NC}"
    fi
fi

# Verificar se os scripts foram restaurados
if [ -d ".local/scripts/test-automation" ] && [ -n "$(ls -A .local/scripts/test-automation 2>/dev/null)" ]; then
    echo -e "${GREEN}✅ Scripts de teste configurados com sucesso!${NC}"
    echo ""
    echo -e "${BLUE}📋 Arquivos restaurados:${NC}"
    find .local/scripts/test-automation -name "*.js" -type f | head -10
    TOTAL_FILES=$(find .local/scripts/test-automation -name "*.js" -type f | wc -l)
    echo -e "${GRAY}   ... e mais $(($TOTAL_FILES - 10)) arquivos${NC}"
    
    # Mover scripts não essenciais para old
    echo ""
    echo -e "${BLUE}📂 Organizando scripts...${NC}"
    # Criar lista de scripts essenciais
    ESSENTIAL="create-three-modes-optimal.js test-with-real-data.js cleanup-all.js"
    
    # Mover todos para old primeiro
    mkdir -p .local/scripts/old/test-automation
    cp -r .local/scripts/test-automation/* .local/scripts/old/test-automation/ 2>/dev/null || true
    
    # Limpar test-automation
    find .local/scripts/test-automation -name "*.js" -type f | while read file; do
        basename=$(basename "$file")
        if ! echo "$ESSENTIAL" | grep -q "$basename"; then
            rm "$file" 2>/dev/null || true
        fi
    done
    
    echo -e "${GREEN}✅ Scripts organizados${NC}"
else
    echo -e "${YELLOW}⚠️  Diretório de testes criado mas vazio${NC}"
    echo -e "${YELLOW}   Você precisará adicionar os scripts manualmente${NC}"
fi

# Instalar dependências se necessário
if [ -f ".local/scripts/test-automation/package.json" ]; then
    echo ""
    echo -e "${BLUE}📦 Instalando dependências do test-automation...${NC}"
    cd .local/scripts/test-automation
    npm install --silent
    cd ../../..
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
fi

# Criar backup local para o futuro
echo ""
echo -e "${BLUE}💾 Criando backup local para uso futuro...${NC}"
mkdir -p ~/backups
if [ -d ".local/scripts" ] && [ -n "$(ls -A .local/scripts 2>/dev/null)" ]; then
    tar -czf ~/backups/n8n-hotmart-test-scripts.tar.gz -C .local scripts
    echo -e "${GREEN}✅ Backup salvo em: ~/backups/n8n-hotmart-test-scripts.tar.gz${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo ""
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo "  1. Scripts essenciais em: .local/scripts/test-automation/"
echo "  2. Scripts completos em: .local/scripts/old/"
echo "  3. Execute o test-full normalmente: ./test-full"
echo "  4. O diretório .local/ não será versionado no git"
echo ""
echo -e "${YELLOW}💡 Dica: Para fazer backup dos scripts locais:${NC}"
echo "  tar -czf ~/backups/n8n-hotmart-test-scripts.tar.gz -C .local scripts"