#!/bin/bash

# 🤖 Instalador Automático - Integração CodeRabbit + Claude Code
# Versão: 1.0.0
# Compatível com: npm, pnpm, yarn

echo "🤖 Instalador - Integração CodeRabbit + Claude Code"
echo "=================================================="
echo ""

# 1. Verificar se estamos na raiz do projeto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script na raiz do projeto (onde está o package.json)"
    echo "📁 Diretório atual: $(pwd)"
    echo ""
    echo "💡 Solução:"
    echo "   cd /caminho/para/seu/projeto"
    echo "   bash $(realpath "$0")"
    echo ""
    exit 1
fi

echo "✅ Projeto detectado em: $(pwd)"
echo ""

# 2. Detectar gerenciador de pacotes
if command -v pnpm &> /dev/null && [ -f "pnpm-lock.yaml" ]; then
    PKG_MANAGER="pnpm"
    INSTALL_CMD="pnpm add -D"
elif [ -f "yarn.lock" ]; then
    PKG_MANAGER="yarn"
    INSTALL_CMD="yarn add -D"
else
    PKG_MANAGER="npm"
    INSTALL_CMD="npm install --save-dev"
fi

echo "📦 Gerenciador de pacotes detectado: $PKG_MANAGER"
echo ""

# 3. Instalar dependência
echo "📥 Instalando dependência @octokit/rest..."
$INSTALL_CMD @octokit/rest
echo ""

# 4. Criar .coderabbit.yml
echo "📝 Criando configuração CodeRabbit..."
cat > .coderabbit.yml << 'CODERABBIT_CONFIG'
# CodeRabbit Configuration
reviews:
  profile: chill
  request_changes_workflow: false
  high_level_summary: true
  poem: false
  review_status: true
  collapse_empty_files: true
  auto_review:
    enabled: true
    drafts: false
  path_filters:
    - "!dist/**"
    - "!coverage/**" 
    - "!node_modules/**"
    - "!**/*.min.js"
    - "!**/*.test.ts"
    - "!**/*.spec.ts"
  
chat:
  auto_reply: true
  
language: portuguese

tone: helpful

focus_areas:
  - security
  - performance
  - maintainability
  - best_practices
  - type_safety
CODERABBIT_CONFIG

# 5. Criar estrutura .github/workflows
mkdir -p .github/workflows

# 6. Criar workflow GitHub Actions
echo "⚙️  Criando workflow GitHub Actions..."
cat > .github/workflows/coderabbit-integration.yml << 'WORKFLOW_CONFIG'
name: CodeRabbit Integration

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

jobs:
  coderabbit-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: CodeRabbit Review
        uses: coderabbitai/coderabbit-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          debug: false
          max_files: 50
          
      - name: Extract CodeRabbit Suggestions
        id: extract
        run: |
          echo "suggestions_file=coderabbit-suggestions.md" >> $GITHUB_OUTPUT
          
      - name: Upload CodeRabbit Analysis
        uses: actions/upload-artifact@v4
        with:
          name: coderabbit-analysis-${{ github.event.number }}
          path: |
            coderabbit-suggestions.md
            
  claude-code-integration:
    needs: coderabbit-review
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Download CodeRabbit Analysis
        uses: actions/download-artifact@v4
        with:
          name: coderabbit-analysis-${{ github.event.number }}
          
      - name: Format for Claude Code
        run: |
          echo "🤖 CODERABBIT SYNC" > claude-instructions.md
          echo "" >> claude-instructions.md
          echo "CodeRabbit encontrou estas issues:" >> claude-instructions.md
          echo "" >> claude-instructions.md
          
          if [ -f coderabbit-suggestions.md ]; then
            cat coderabbit-suggestions.md >> claude-instructions.md
          else
            echo "Nenhuma sugestão encontrada" >> claude-instructions.md
          fi
          
          echo "" >> claude-instructions.md
          echo "Por favor:" >> claude-instructions.md
          echo "1. Analise cada sugestão" >> claude-instructions.md
          echo "2. Aplique as correções necessárias" >> claude-instructions.md
          echo "3. Explique o que foi feito" >> claude-instructions.md
          echo "4. Mostre antes/depois do código" >> claude-instructions.md
          
      - name: Comment on PR with Claude Instructions
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            
            let body = "## 🤖 CodeRabbit Analysis Ready for Claude Code\n\n";
            
            if (fs.existsSync('claude-instructions.md')) {
              const instructions = fs.readFileSync('claude-instructions.md', 'utf8');
              body += "```\n" + instructions + "\n```";
            } else {
              body += "Nenhuma sugestão do CodeRabbit encontrada.";
            }
            
            body += "\n\n---\n";
            body += "*Copy the content above and paste it to Claude Code for automatic fixes*";
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });
WORKFLOW_CONFIG

# 7. Criar script de conversão (opcional)
mkdir -p scripts
echo "🔧 Criando script de conversão..."
cat > scripts/coderabbit-to-claude.js << 'CONVERTER_SCRIPT'
#!/usr/bin/env node

/**
 * Script para converter sugestões do CodeRabbit em formato Claude Code
 */

const fs = require('fs');
const path = require('path');

class CodeRabbitToClaude {
  constructor() {
    this.suggestions = [];
  }

  async extractFromGitHubAPI() {
    const prNumber = process.env.GITHUB_PR_NUMBER;
    const repo = process.env.GITHUB_REPOSITORY;
    const token = process.env.GITHUB_TOKEN;

    if (!prNumber || !repo || !token) {
      console.log('❌ Variáveis do GitHub Actions não encontradas');
      return;
    }

    try {
      const { Octokit } = require('@octokit/rest');
      const octokit = new Octokit({ auth: token });

      const [owner, repoName] = repo.split('/');

      // Buscar reviews do PR
      const reviews = await octokit.rest.pulls.listReviews({
        owner,
        repo: repoName,
        pull_number: prNumber
      });

      // Filtrar reviews do CodeRabbit
      const coderabbitReviews = reviews.data.filter(review => 
        review.user.login === 'coderabbitai[bot]' || 
        review.user.type === 'Bot'
      );

      // Extrair comentários
      for (const review of coderabbitReviews) {
        if (review.body) {
          this.suggestions.push({
            type: 'review',
            content: review.body,
            file: 'general',
            line: null
          });
        }
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados do GitHub:', error.message);
    }
  }

  formatForClaude() {
    if (this.suggestions.length === 0) {
      return `🤖 CODERABBIT SYNC

Nenhuma sugestão do CodeRabbit encontrada neste PR.

Status: ✅ Código aprovado ou sem problemas detectados.`;
    }

    let output = `🤖 CODERABBIT SYNC

CodeRabbit encontrou ${this.suggestions.length} sugestões:

`;

    this.suggestions.forEach((suggestion, index) => {
      output += `### ${index + 1}. ${suggestion.type === 'line_comment' ? 'Comentário de Linha' : 'Review Geral'}\n`;
      
      if (suggestion.file && suggestion.file !== 'general') {
        output += `**Arquivo**: \`${suggestion.file}\`\n`;
      }
      
      if (suggestion.line) {
        output += `**Linha**: ${suggestion.line}\n`;
      }
      
      output += `**Sugestão**:\n`;
      output += suggestion.content + '\n\n';
      output += '---\n\n';
    });

    output += `Por favor:
1. ✅ Analise cada sugestão acima
2. 🔧 Aplique as correções necessárias
3. 📝 Explique o que foi feito
4. 📊 Mostre antes/depois do código
5. ✨ Commit as mudanças

**Total de issues para resolver**: ${this.suggestions.length}`;

    return output;
  }

  async run() {
    console.log('🤖 CodeRabbit to Claude Converter');
    console.log('==================================');

    await this.extractFromGitHubAPI();
    
    const outputPath = path.join(process.cwd(), 'claude-coderabbit-sync.md');
    const formatted = this.formatForClaude();
    
    fs.writeFileSync(outputPath, formatted, 'utf8');
    console.log(`✅ Sugestões formatadas salvas em: ${outputPath}`);
    
    console.log('\n📋 Instruções para Claude Code:');
    console.log('==============================');
    console.log(formatted);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const converter = new CodeRabbitToClaude();
  converter.run().catch(console.error);
}

module.exports = CodeRabbitToClaude;
CONVERTER_SCRIPT

chmod +x scripts/coderabbit-to-claude.js

# 8. Atualizar .gitignore (se necessário)
if [ -f ".gitignore" ]; then
    if ! grep -q "claude-coderabbit-sync.md" .gitignore 2>/dev/null; then
        echo -e "\n# CodeRabbit + Claude Code Integration\nclaude-coderabbit-sync.md" >> .gitignore
    fi
fi

echo ""
echo "✅ Integração CodeRabbit + Claude Code instalada com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. 🤖 Instalar CodeRabbit App:"
echo "   • Acesse: https://github.com/apps/coderabbit"
echo "   • Click 'Install'"
echo "   • Selecione seu repositório"
echo "   • Confirme permissões: Pull requests, Contents, Metadata"
echo ""
echo "2. 🚀 Ativar no repositório:"
echo "   git add .coderabbit.yml .github/workflows/coderabbit-integration.yml package.json scripts/"
echo "   git commit -m \"feat: adicionar integração CodeRabbit + Claude Code\""
echo "   git push origin main"
echo ""
echo "3. 🧪 Testar:"
echo "   • Crie uma branch de feature"
echo "   • Abra um Pull Request"
echo "   • Aguarde o CodeRabbit comentar"
echo "   • Copie comentário formatado para Claude Code"
echo ""
echo "🎉 Sistema estará pronto para uso!"
echo ""
echo "📖 Documentação completa em: docs/CODERABBIT-CLAUDE-INTEGRATION-GUIDE.md"