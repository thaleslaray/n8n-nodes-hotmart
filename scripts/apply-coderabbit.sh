#!/bin/bash

# Script para buscar e aplicar sugestões do CodeRabbit automaticamente
# Uso: ./apply-coderabbit.sh <PR_NUMBER>

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se foi passado o número do PR
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Número do PR não fornecido${NC}"
    echo "Uso: $0 <PR_NUMBER>"
    echo "Exemplo: $0 123"
    exit 1
fi

PR_NUMBER=$1

# Detectar o repositório atual
REPO_URL=$(git config --get remote.origin.url)
if [[ $REPO_URL == git@github.com:* ]]; then
    # SSH URL
    REPO=$(echo $REPO_URL | sed 's/git@github.com://g' | sed 's/.git$//g')
elif [[ $REPO_URL == https://github.com/* ]]; then
    # HTTPS URL
    REPO=$(echo $REPO_URL | sed 's/https:\/\/github.com\///g' | sed 's/.git$//g')
else
    echo -e "${RED}❌ Erro: Não foi possível detectar o repositório${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Buscando sugestões do CodeRabbit para PR #${PR_NUMBER}...${NC}"
echo "📦 Repositório: $REPO"

# Verificar se tem token do GitHub
if [ -z "$GITHUB_TOKEN" ] && [ -z "$GH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Token do GitHub não encontrado${NC}"
    echo "Configure com: export GITHUB_TOKEN=seu_token"
    echo "Tentando sem autenticação (limite de 60 requests/hora)..."
fi

# Usar o token se disponível
TOKEN=${GITHUB_TOKEN:-$GH_TOKEN}

# Criar arquivo temporário para o script Node.js
TEMP_SCRIPT=$(mktemp)
cat > "$TEMP_SCRIPT" << 'EOF'
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

async function fetchCodeRabbitSuggestions() {
    const prNumber = process.argv[2];
    const repo = process.argv[3];
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    
    const [owner, repoName] = repo.split('/');
    
    const octokit = new Octokit({
        auth: token || undefined
    });

    const suggestions = [];

    try {
        // Buscar reviews
        const { data: reviews } = await octokit.pulls.listReviews({
            owner,
            repo: repoName,
            pull_number: prNumber
        });

        // Filtrar reviews do CodeRabbit
        const coderabbitReviews = reviews.filter(review => 
            review.user.login.toLowerCase().includes('coderabbit')
        );

        // Buscar comentários do review
        for (const review of coderabbitReviews) {
            const { data: comments } = await octokit.pulls.listCommentsForReview({
                owner,
                repo: repoName,
                pull_number: prNumber,
                review_id: review.id
            });

            for (const comment of comments) {
                if (comment.body && comment.body.trim()) {
                    suggestions.push({
                        type: 'line',
                        file: comment.path,
                        line: comment.line || comment.original_line,
                        content: comment.body
                    });
                }
            }

            // Review geral
            if (review.body && review.body.trim() && !review.body.includes('CODERABBIT SYNC')) {
                suggestions.push({
                    type: 'review',
                    file: 'general',
                    line: null,
                    content: review.body
                });
            }
        }

        // Buscar comentários de issue
        const { data: issueComments } = await octokit.issues.listComments({
            owner,
            repo: repoName,
            issue_number: prNumber
        });

        const coderabbitIssueComments = issueComments.filter(comment =>
            comment.user.login.toLowerCase().includes('coderabbit') &&
            !comment.body.includes('CODERABBIT SYNC')
        );

        for (const comment of coderabbitIssueComments) {
            if (comment.body && comment.body.trim()) {
                suggestions.push({
                    type: 'issue',
                    file: 'general',
                    line: null,
                    content: comment.body
                });
            }
        }

    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error.message);
        process.exit(1);
    }

    // Formatar para Claude
    let output = `🤖 CODERABBIT SYNC - PR #${prNumber}
==================
Cole este conteúdo no Claude Code para aplicar automaticamente todas as sugestões do CodeRabbit.

## 📋 Sugestões do CodeRabbit para PR #${prNumber}

`;

    if (suggestions.length === 0) {
        output += '✅ Nenhuma sugestão encontrada neste PR!\n';
    } else {
        suggestions.forEach((suggestion, index) => {
            output += `### 🔧 ${suggestion.file}`;
            if (suggestion.line) {
                output += ` (linha ${suggestion.line})`;
            }
            output += '\n';
            output += `**Tipo**: ${suggestion.type}\n`;
            output += `**Sugestão**: ${suggestion.content}\n\n`;
        });

        output += `\n## 🎯 Instruções para Claude

Por favor, aplique todas as ${suggestions.length} sugestões acima seguindo estes passos:

1. 📖 Leia cada sugestão cuidadosamente
2. 🔍 Localize o arquivo e linha mencionados
3. ✏️ Aplique a correção sugerida
4. 📊 Mostre antes/depois do código
5. ✨ Commit as mudanças

**Total de issues para resolver**: ${suggestions.length}`;
    }

    // Salvar na raiz do projeto
    const outputPath = path.join(process.cwd(), 'CODERABBIT-SUGGESTIONS.md');
    fs.writeFileSync(outputPath, output, 'utf8');
    
    console.log(`✅ Sugestões salvas em: ${outputPath}`);
    console.log(`📋 Total de sugestões: ${suggestions.length}`);
    
    // Também mostrar no terminal
    console.log('\n' + '='.repeat(50));
    console.log(output);
}

fetchCodeRabbitSuggestions().catch(console.error);
EOF

# Executar o script Node.js
echo -e "${GREEN}🚀 Executando busca...${NC}"
node "$TEMP_SCRIPT" "$PR_NUMBER" "$REPO"

# Limpar arquivo temporário
rm -f "$TEMP_SCRIPT"

# Verificar se o arquivo foi criado
if [ -f "CODERABBIT-SUGGESTIONS.md" ]; then
    echo -e "\n${GREEN}✅ Sucesso! Sugestões salvas em: CODERABBIT-SUGGESTIONS.md${NC}"
    echo -e "${YELLOW}📋 Próximos passos:${NC}"
    echo "1. Abra o arquivo CODERABBIT-SUGGESTIONS.md"
    echo "2. Copie TODO o conteúdo (Cmd+A, Cmd+C)"
    echo "3. Cole no Claude Code"
    echo "4. Claude aplicará todas as correções automaticamente!"
    
    # Perguntar se quer abrir o arquivo
    echo -e "\n${YELLOW}Deseja abrir o arquivo agora? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        if command -v code &> /dev/null; then
            code CODERABBIT-SUGGESTIONS.md
        elif command -v open &> /dev/null; then
            open CODERABBIT-SUGGESTIONS.md
        else
            cat CODERABBIT-SUGGESTIONS.md
        fi
    fi
else
    echo -e "${RED}❌ Erro: Arquivo não foi criado${NC}"
    exit 1
fi