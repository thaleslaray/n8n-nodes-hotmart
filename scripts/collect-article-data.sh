#!/bin/bash

# collect-article-data.sh
# Coleta dados e métricas do projeto n8n-nodes-hotmart para o artigo

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Diretório base
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$PROJECT_DIR/docs/diario"
OUTPUT_FILE="$DOCS_DIR/dados-coletados.md"

# Função para print colorido
print_header() {
    echo -e "\n${BLUE}${BOLD}=== $1 ===${NC}"
}

print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Função para coletar estatísticas do git
collect_git_stats() {
    print_header "Coletando Estatísticas do Git"
    
    cd "$PROJECT_DIR"
    
    # Total de commits
    TOTAL_COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    print_info "Total de commits: $TOTAL_COMMITS"
    
    # Primeiro e último commit
    FIRST_COMMIT_DATE=$(git log --reverse --format="%ad" --date=short | head -1 2>/dev/null || echo "N/A")
    LAST_COMMIT_DATE=$(git log -1 --format="%ad" --date=short 2>/dev/null || echo "N/A")
    print_info "Período: $FIRST_COMMIT_DATE até $LAST_COMMIT_DATE"
    
    # Contribuidores
    CONTRIBUTORS=$(git shortlog -sn 2>/dev/null | wc -l | tr -d ' ' || echo "1")
    print_info "Contribuidores: $CONTRIBUTORS"
    
    # Estatísticas de linha
    GIT_STATS=$(git log --numstat --format="" | awk '{add+=$1; del+=$2} END {print "+"add" -"del}' 2>/dev/null || echo "+0 -0")
    print_info "Linhas modificadas: $GIT_STATS"
    
    # Commits por dia (compatível com macOS)
    if [ "$FIRST_COMMIT_DATE" != "N/A" ] && [ "$LAST_COMMIT_DATE" != "N/A" ]; then
        # macOS date syntax
        if [[ "$OSTYPE" == "darwin"* ]]; then
            START_EPOCH=$(date -j -f "%Y-%m-%d" "$FIRST_COMMIT_DATE" +%s 2>/dev/null)
            END_EPOCH=$(date -j -f "%Y-%m-%d" "$LAST_COMMIT_DATE" +%s 2>/dev/null)
        else
            START_EPOCH=$(date -d "$FIRST_COMMIT_DATE" +%s 2>/dev/null)
            END_EPOCH=$(date -d "$LAST_COMMIT_DATE" +%s 2>/dev/null)
        fi
        
        if [ -n "$START_EPOCH" ] && [ -n "$END_EPOCH" ]; then
            DAYS=$(( ($END_EPOCH - $START_EPOCH) / 86400 + 1 ))
            COMMITS_PER_DAY=$(echo "scale=2; $TOTAL_COMMITS / $DAYS" | bc 2>/dev/null || echo "N/A")
            print_info "Commits por dia: $COMMITS_PER_DAY"
        else
            DAYS="N/A"
            COMMITS_PER_DAY="N/A"
        fi
    fi
}

# Função para coletar métricas de código
collect_code_metrics() {
    print_header "Coletando Métricas de Código"
    
    cd "$PROJECT_DIR"
    
    # Total de arquivos TypeScript
    TS_FILES=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./coverage/*" -not -path "./dist/*" | wc -l)
    print_info "Arquivos TypeScript: $TS_FILES"
    
    # Total de arquivos de teste
    TEST_FILES=$(find . -name "*.test.ts" -not -path "./node_modules/*" | wc -l)
    print_info "Arquivos de teste: $TEST_FILES"
    
    # Linhas de código (excluindo node_modules, coverage, dist)
    TOTAL_LINES=$(find . -name "*.ts" -not -path "./node_modules/*" -not -path "./coverage/*" -not -path "./dist/*" -exec cat {} \; | wc -l)
    print_info "Total de linhas de código: $TOTAL_LINES"
    
    # Linhas de teste
    TEST_LINES=$(find . -name "*.test.ts" -not -path "./node_modules/*" -exec cat {} \; | wc -l)
    print_info "Linhas de código de teste: $TEST_LINES"
    
    # Arquivos de documentação
    DOC_FILES=$(find . -name "*.md" -not -path "./node_modules/*" | wc -l)
    print_info "Arquivos de documentação: $DOC_FILES"
}

# Função para coletar métricas de qualidade
collect_quality_metrics() {
    print_header "Coletando Métricas de Qualidade"
    
    cd "$PROJECT_DIR"
    
    # Cobertura de testes (se disponível)
    if [ -f "coverage/coverage-summary.json" ]; then
        COVERAGE=$(node -p "require('./coverage/coverage-summary.json').total.lines.pct" 2>/dev/null || echo "N/A")
        print_info "Cobertura de testes: ${COVERAGE}%"
    else
        print_warning "Arquivo de cobertura não encontrado"
    fi
    
    # Verificar TypeScript errors
    if command -v npx &> /dev/null; then
        print_info "Verificando erros TypeScript..."
        TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
        print_info "Erros TypeScript: $TS_ERRORS"
    fi
}

# Função para coletar estrutura do projeto
collect_project_structure() {
    print_header "Analisando Estrutura do Projeto"
    
    cd "$PROJECT_DIR"
    
    # Contar operações/recursos
    OPERATIONS=$(find nodes/Hotmart/v1/actions -name "*.operation.ts" -not -name "*.test.ts" | wc -l)
    print_info "Operações implementadas: $OPERATIONS"
    
    # Recursos (diretórios em actions)
    RESOURCES=$(find nodes/Hotmart/v1/actions -maxdepth 1 -type d | grep -v "^nodes/Hotmart/v1/actions$" | wc -l)
    print_info "Recursos da API: $RESOURCES"
    
    # Helpers
    HELPERS=$(find nodes/Hotmart/v1/helpers -name "*.ts" -not -name "*.test.ts" 2>/dev/null | wc -l)
    print_info "Arquivos auxiliares: $HELPERS"
}

# Função para gerar timeline do git
generate_git_timeline() {
    print_header "Gerando Timeline de Commits"
    
    cd "$PROJECT_DIR"
    
    # Commits por dia
    git log --format="%ad" --date=short | sort | uniq -c | sort -k2 > "$DOCS_DIR/commits-por-dia.txt"
    print_info "Timeline salva em commits-por-dia.txt"
    
    # Top 10 arquivos mais modificados
    git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -20 > "$DOCS_DIR/arquivos-mais-modificados.txt"
    print_info "Arquivos mais modificados salvos"
}

# Função para gerar relatório
generate_report() {
    print_header "Gerando Relatório Final"
    
    cat > "$OUTPUT_FILE" << EOF
# 📊 Dados Coletados - n8n-nodes-hotmart

**Data da coleta**: $(date +"%d/%m/%Y %H:%M")

## 📈 Estatísticas do Git

- **Total de commits**: $TOTAL_COMMITS
- **Período**: $FIRST_COMMIT_DATE até $LAST_COMMIT_DATE
- **Dias de desenvolvimento**: ${DAYS:-N/A}
- **Commits por dia**: ${COMMITS_PER_DAY:-N/A}
- **Contribuidores**: $CONTRIBUTORS
- **Modificações**: $GIT_STATS

## 📁 Métricas de Código

- **Arquivos TypeScript**: $TS_FILES
- **Arquivos de teste**: $TEST_FILES
- **Total de linhas**: $TOTAL_LINES
- **Linhas de teste**: $TEST_LINES
- **Arquivos de documentação**: $DOC_FILES
- **Proporção teste/código**: $(echo "scale=2; $TEST_LINES * 100 / $TOTAL_LINES" | bc 2>/dev/null || echo "N/A")%

## ✅ Métricas de Qualidade

- **Cobertura de testes**: ${COVERAGE:-N/A}%
- **Erros TypeScript**: ${TS_ERRORS:-N/A}

## 🏗️ Estrutura do Projeto

- **Operações implementadas**: $OPERATIONS
- **Recursos da API**: $RESOURCES
- **Arquivos auxiliares**: $HELPERS

## 📊 Análise de Produtividade

- **Linhas por dia**: $(echo "scale=0; $TOTAL_LINES / ${DAYS:-1}" | bc 2>/dev/null || echo "N/A")
- **Commits por recurso**: $(echo "scale=2; $TOTAL_COMMITS / ${RESOURCES:-1}" | bc 2>/dev/null || echo "N/A")
- **Média de linhas por arquivo**: $(echo "scale=0; $TOTAL_LINES / ${TS_FILES:-1}" | bc 2>/dev/null || echo "N/A")

## 🎯 Comparação com Desenvolvimento Tradicional

Assumindo desenvolvimento tradicional (100 linhas/dev/dia):
- **Dias necessários (tradicional)**: $(echo "scale=0; $TOTAL_LINES / 100" | bc 2>/dev/null || echo "N/A")
- **Dias reais**: ${DAYS:-N/A}
- **Aceleração**: $(echo "scale=1; ($TOTAL_LINES / 100) / ${DAYS:-1}" | bc 2>/dev/null || echo "N/A")x

---

*Arquivos adicionais gerados*:
- \`commits-por-dia.txt\` - Timeline detalhada
- \`arquivos-mais-modificados.txt\` - Arquivos com mais mudanças
EOF

    print_info "Relatório completo salvo em: $OUTPUT_FILE"
}

# Função principal
main() {
    echo -e "${BOLD}🚀 Coletando dados do projeto n8n-nodes-hotmart${NC}"
    
    # Verificar se estamos no diretório correto
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        print_error "Erro: package.json não encontrado. Execute o script do diretório do projeto."
        exit 1
    fi
    
    # Criar diretório de saída se não existir
    mkdir -p "$DOCS_DIR"
    
    # Executar coletas
    collect_git_stats
    collect_code_metrics
    collect_quality_metrics
    collect_project_structure
    generate_git_timeline
    generate_report
    
    echo -e "\n${GREEN}${BOLD}✅ Coleta concluída!${NC}"
    echo -e "Resultados salvos em: ${BLUE}$DOCS_DIR${NC}"
}

# Processar argumentos
case "${1:-all}" in
    metrics)
        collect_code_metrics
        collect_quality_metrics
        ;;
    git)
        collect_git_stats
        generate_git_timeline
        ;;
    timeline)
        generate_git_timeline
        ;;
    all|*)
        main
        ;;
esac