#!/bin/bash

# 🧠 CodeLoops Implementation Script
# Implementa o padrão Actor-Critic com memória persistente

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Diretórios
CODELOOPS_DIR="$(cd "$(dirname "$0")" && pwd)"
PROMPTS_DIR="$CODELOOPS_DIR/prompts"
MEMORY_DIR="$CODELOOPS_DIR/memory"
SESSIONS_DIR="$CODELOOPS_DIR/sessions"

# Criar diretórios se não existirem
mkdir -p "$SESSIONS_DIR"

# Função para criar nova sessão
new_session() {
    SESSION_ID=$(date +%Y%m%d_%H%M%S)
    SESSION_DIR="$SESSIONS_DIR/$SESSION_ID"
    mkdir -p "$SESSION_DIR"
    echo -e "${GREEN}✅ Nova sessão criada: $SESSION_ID${NC}"
    echo $SESSION_ID
}

# Função Actor - Gerar código
actor_generate() {
    local task="$1"
    local session_dir="$2"
    
    echo -e "${BLUE}🎭 ACTOR: Gerando código...${NC}"
    
    # Criar prompt combinado
    cat > "$session_dir/actor-prompt.md" << EOF
$(cat "$PROMPTS_DIR/actor.md")

## Tarefa Específica
$task

## Memória do Projeto
$(cat "$MEMORY_DIR/patterns.md" 2>/dev/null || echo "Nenhum padrão registrado ainda")

## Erros a Evitar
$(cat "$MEMORY_DIR/mistakes.md" 2>/dev/null || echo "Nenhum erro registrado ainda")
EOF
    
    echo -e "${YELLOW}Prompt criado em: $session_dir/actor-prompt.md${NC}"
    echo -e "${YELLOW}Use este prompt no Claude para gerar o código${NC}"
    
    read -p "Quando terminar, salve o código em $session_dir/generated-code.ts e pressione ENTER..."
}

# Função Critic - Revisar código
critic_review() {
    local session_dir="$1"
    
    echo -e "${BLUE}🔍 CRITIC: Preparando revisão...${NC}"
    
    if [ ! -f "$session_dir/generated-code.ts" ]; then
        echo -e "${RED}❌ Código não encontrado em $session_dir/generated-code.ts${NC}"
        return 1
    fi
    
    # Criar prompt de revisão
    cat > "$session_dir/critic-prompt.md" << EOF
$(cat "$PROMPTS_DIR/critic.md")

## Código para Revisar
\`\`\`typescript
$(cat "$session_dir/generated-code.ts")
\`\`\`

## Contexto da Tarefa
$(cat "$session_dir/actor-prompt.md" | grep -A 10 "Tarefa Específica")
EOF
    
    echo -e "${YELLOW}Prompt de revisão criado em: $session_dir/critic-prompt.md${NC}"
    echo -e "${YELLOW}Use este prompt no Claude para revisar${NC}"
    
    read -p "Quando terminar, salve o feedback em $session_dir/feedback.md e pressione ENTER..."
}

# Função Improve - Melhorar código
actor_improve() {
    local session_dir="$1"
    
    echo -e "${BLUE}🔄 IMPROVE: Preparando melhoria...${NC}"
    
    if [ ! -f "$session_dir/feedback.md" ]; then
        echo -e "${RED}❌ Feedback não encontrado${NC}"
        return 1
    fi
    
    # Criar prompt de melhoria
    cat > "$session_dir/improve-prompt.md" << EOF
$(cat "$PROMPTS_DIR/improve.md")

## Código Original
\`\`\`typescript
$(cat "$session_dir/generated-code.ts")
\`\`\`

## Feedback do Critic
$(cat "$session_dir/feedback.md")
EOF
    
    echo -e "${YELLOW}Prompt de melhoria criado em: $session_dir/improve-prompt.md${NC}"
    echo -e "${YELLOW}Use este prompt no Claude para melhorar o código${NC}"
    
    read -p "Quando terminar, salve em $session_dir/improved-code.ts e pressione ENTER..."
}

# Função para atualizar memória
update_memory() {
    local session_dir="$1"
    
    echo -e "${BLUE}💾 Atualizando memória...${NC}"
    
    echo -e "\n${YELLOW}Que aprendizados devemos salvar desta sessão?${NC}"
    echo "1. Novo padrão descoberto"
    echo "2. Erro a evitar"
    echo "3. Decisão arquitetural"
    echo "4. Pular"
    
    read -p "Escolha: " choice
    
    case $choice in
        1)
            read -p "Descreva o padrão: " pattern
            echo -e "\n## $(date +%Y-%m-%d) - Sessão $SESSION_ID" >> "$MEMORY_DIR/patterns.md"
            echo "$pattern" >> "$MEMORY_DIR/patterns.md"
            echo -e "${GREEN}✅ Padrão salvo${NC}"
            ;;
        2)
            read -p "Descreva o erro: " mistake
            echo -e "\n## $(date +%Y-%m-%d) - Sessão $SESSION_ID" >> "$MEMORY_DIR/mistakes.md"
            echo "$mistake" >> "$MEMORY_DIR/mistakes.md"
            echo -e "${GREEN}✅ Erro registrado${NC}"
            ;;
        3)
            read -p "Descreva a decisão: " decision
            echo -e "\n## $(date +%Y-%m-%d) - Sessão $SESSION_ID" >> "$MEMORY_DIR/decisions.md"
            echo "$decision" >> "$MEMORY_DIR/decisions.md"
            echo -e "${GREEN}✅ Decisão documentada${NC}"
            ;;
        4)
            echo -e "${YELLOW}Memória não atualizada${NC}"
            ;;
    esac
}

# Menu principal
main_menu() {
    while true; do
        echo -e "\n${BLUE}=== CODELOOPS MENU ===${NC}"
        echo "1. Nova sessão completa (Actor → Critic → Improve)"
        echo "2. Apenas gerar código (Actor)"
        echo "3. Apenas revisar código existente (Critic)"
        echo "4. Ver memória atual"
        echo "5. Limpar memória"
        echo "0. Sair"
        
        read -p "Escolha: " choice
        
        case $choice in
            1)
                read -p "Descreva a tarefa: " task
                SESSION_ID=$(new_session)
                SESSION_DIR="$SESSIONS_DIR/$SESSION_ID"
                
                actor_generate "$task" "$SESSION_DIR"
                critic_review "$SESSION_DIR"
                actor_improve "$SESSION_DIR"
                update_memory "$SESSION_DIR"
                
                echo -e "${GREEN}✅ Sessão completa finalizada!${NC}"
                echo -e "Arquivos em: $SESSION_DIR"
                ;;
            2)
                read -p "Descreva a tarefa: " task
                SESSION_ID=$(new_session)
                SESSION_DIR="$SESSIONS_DIR/$SESSION_ID"
                actor_generate "$task" "$SESSION_DIR"
                ;;
            3)
                read -p "Caminho do código para revisar: " code_path
                SESSION_ID=$(new_session)
                SESSION_DIR="$SESSIONS_DIR/$SESSION_ID"
                cp "$code_path" "$SESSION_DIR/generated-code.ts"
                critic_review "$SESSION_DIR"
                ;;
            4)
                echo -e "\n${BLUE}📋 PADRÕES:${NC}"
                cat "$MEMORY_DIR/patterns.md" 2>/dev/null || echo "Vazio"
                echo -e "\n${BLUE}❌ ERROS:${NC}"
                cat "$MEMORY_DIR/mistakes.md" 2>/dev/null || echo "Vazio"
                echo -e "\n${BLUE}🏗️ DECISÕES:${NC}"
                cat "$MEMORY_DIR/decisions.md" 2>/dev/null || echo "Vazio"
                ;;
            5)
                read -p "Tem certeza? (s/n): " confirm
                if [ "$confirm" = "s" ]; then
                    rm -f "$MEMORY_DIR"/*.md
                    echo -e "${GREEN}✅ Memória limpa${NC}"
                fi
                ;;
            0)
                break
                ;;
        esac
    done
}

# Header
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    ${GREEN}🧠 CODELOOPS IMPLEMENTATION${BLUE}      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"

# Executar menu
main_menu