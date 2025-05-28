#!/bin/bash

# 🚀 Script de Integração CodeLoops + Task Master
# Para o projeto n8n-hotmart

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔗 Integrando CodeLoops + Task Master${NC}\n"

# 1. Verificar se Task Master está instalado
if ! command -v task-master &> /dev/null; then
    echo -e "${YELLOW}Task Master não encontrado. Instalando...${NC}"
    npm install -g task-master-ai
fi

# 2. Inicializar Task Master se necessário
if [ ! -d ".task-master" ]; then
    echo -e "${YELLOW}Inicializando Task Master...${NC}"
    task-master init
fi

# 3. Sincronizar conhecimento do CodeLoops
sync_knowledge() {
    echo -e "${BLUE}📚 Sincronizando conhecimento...${NC}"
    
    # Exportar tarefas atuais para CodeLoops
    task-master list --json > .codeloops/current-tasks.json
    
    # Exportar contexto do projeto
    cat > .codeloops/project-context.md << EOF
# Contexto do Projeto n8n-hotmart

## Padrões Estabelecidos
$(cat docs/prd/REGRAS.md)

## Funcionalidades
$(cat docs/prd/funcionalidades.md)

## Tarefas Atuais
$(task-master list)
EOF
}

# 4. Função para executar tarefa com CodeLoops
execute_with_codeloops() {
    local task_id=$1
    
    echo -e "${GREEN}🎯 Executando tarefa $task_id com CodeLoops${NC}"
    
    # Obter detalhes da tarefa
    task-master show $task_id > .codeloops/current-task.txt
    
    # Preparar prompt para CodeLoops
    cat > .codeloops/execution-prompt.txt << EOF
Execute a seguinte tarefa mantendo consistência com o projeto:

$(cat .codeloops/current-task.txt)

Contexto do projeto está em .codeloops/project-context.md
Padrões estão em docs/prd/REGRAS.md

Lembre-se de:
1. Seguir os padrões TypeScript estabelecidos
2. Manter consistência com outros endpoints
3. Criar testes apropriados
4. Documentar adequadamente
EOF
    
    echo -e "${YELLOW}Prompt criado em .codeloops/execution-prompt.txt${NC}"
    echo -e "${YELLOW}Use este prompt no CodeLoops para executar a tarefa${NC}"
}

# 5. Função para revisar com Critic
review_implementation() {
    echo -e "${BLUE}🔍 Preparando revisão com CodeLoops Critic${NC}"
    
    cat > .codeloops/critic-prompt.txt << EOF
Revise a implementação atual considerando:

1. Conformidade com PRD: docs/prd/PRD-melhorado.md
2. Padrões técnicos: docs/prd/REGRAS.md
3. Consistência com código existente
4. Cobertura de testes
5. Documentação

Aponte melhorias necessárias.
EOF
    
    echo -e "${YELLOW}Prompt de revisão criado em .codeloops/critic-prompt.txt${NC}"
}

# 6. Menu interativo
while true; do
    echo -e "\n${BLUE}=== MENU INTEGRAÇÃO ===${NC}"
    echo "1. Sincronizar conhecimento"
    echo "2. Executar próxima tarefa"
    echo "3. Executar tarefa específica"
    echo "4. Revisar implementação"
    echo "5. Atualizar status de tarefa"
    echo "6. Ver tarefas"
    echo "0. Sair"
    
    read -p "Escolha: " choice
    
    case $choice in
        1) sync_knowledge ;;
        2) 
            next_task=$(task-master next --id-only)
            execute_with_codeloops $next_task
            ;;
        3)
            read -p "ID da tarefa: " task_id
            execute_with_codeloops $task_id
            ;;
        4) review_implementation ;;
        5)
            read -p "ID da tarefa: " task_id
            read -p "Novo status (todo/in-progress/done): " status
            task-master update $task_id --status $status
            ;;
        6) task-master list ;;
        0) break ;;
    esac
done

echo -e "${GREEN}✅ Integração finalizada${NC}"