#!/bin/bash
# codeloop-enhanced.sh - Enhanced CodeLoop with all improvements

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSIONS_DIR="$SCRIPT_DIR/sessions"
MEMORY_DIR="$SCRIPT_DIR/memory"
PROMPTS_DIR="$SCRIPT_DIR/prompts"
LIB_DIR="$SCRIPT_DIR/lib"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Create directories if needed
mkdir -p "$SESSIONS_DIR" "$MEMORY_DIR" "$LIB_DIR"

# Load modules
for module in "$LIB_DIR"/*.sh; do
    if [ -f "$module" ]; then
        source "$module"
    fi
done

# Check prerequisites
check_prerequisites() {
    local missing=()
    
    # Check required commands
    for cmd in git jq npm npx; do
        if ! command -v "$cmd" &> /dev/null; then
            missing+=("$cmd")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required commands: ${missing[*]}${NC}"
        echo "Please install them and try again."
        exit 1
    fi
    
    # Initialize memory git if needed
    init_memory_git
}

# Display banner
show_banner() {
    cat << 'EOF'
╔═══════════════════════════════════════╗
║       CodeLoop Enhanced v2.0          ║
║   Actor-Critic-Improve Pattern        ║
║     Now with 100% more magic! 🎩      ║
╚═══════════════════════════════════════╝
EOF
}

# Create new session
create_new_session() {
    # Get task description
    echo -e "${BLUE}📝 Descreva a tarefa:${NC}"
    read -r TASK
    
    # Get optional tags
    echo -e "${BLUE}🏷️  Tags (separadas por vírgula, opcional):${NC}"
    read -r TAGS
    
    # Generate session ID
    SESSION_ID=$(date +%Y%m%d_%H%M%S)_$(openssl rand -hex 3)
    export SESSION_ID
    
    # Create session with metadata
    create_session_metadata "$SESSION_ID" "$TASK" "$TAGS"
    
    # Store task for prompts
    export TASK
    
    echo -e "${GREEN}✅ Sessão criada: $SESSION_ID${NC}"
}

# Build enhanced prompt with full context
build_enhanced_prompt() {
    local phase="$1"
    local prompt_file="$PROMPTS_DIR/$phase.md"
    
    if [ ! -f "$prompt_file" ]; then
        echo -e "${RED}❌ Prompt file not found: $prompt_file${NC}"
        return 1
    fi
    
    # Load base prompt
    local base_prompt=$(cat "$prompt_file")
    
    # Build full prompt with context
    local full_prompt="$base_prompt"
    
    # Add memory context
    full_prompt+="\n\n## 📚 Memória Atual\n"
    full_prompt+="\n### Padrões Estabelecidos\n"
    full_prompt+=$(tail -20 "$MEMORY_DIR/patterns.md" 2>/dev/null || echo "Nenhum padrão ainda.")
    full_prompt+="\n\n### Erros Conhecidos\n"
    full_prompt+=$(tail -20 "$MEMORY_DIR/mistakes.md" 2>/dev/null || echo "Nenhum erro registrado.")
    full_prompt+="\n\n### Decisões Arquiteturais\n"
    full_prompt+=$(tail -20 "$MEMORY_DIR/decisions.md" 2>/dev/null || echo "Nenhuma decisão registrada.")
    
    # Add task
    full_prompt=$(echo "$full_prompt" | sed "s/\[TAREFA SERÁ INSERIDA AQUI\]/$TASK/g")
    
    # Add previous phase context
    case "$phase" in
        "critic")
            if [ -f "$SESSIONS_DIR/$SESSION_ID/actor-response.md" ]; then
                full_prompt+="\n\n## 📄 Código do Actor\n"
                full_prompt+=$(cat "$SESSIONS_DIR/$SESSION_ID/actor-response.md")
            fi
            ;;
            
        "improve")
            if [ -f "$SESSIONS_DIR/$SESSION_ID/actor-response.md" ]; then
                full_prompt+="\n\n## 📄 Código Original (Actor)\n"
                full_prompt+=$(cat "$SESSIONS_DIR/$SESSION_ID/actor-response.md")
            fi
            if [ -f "$SESSIONS_DIR/$SESSION_ID/critic-response.md" ]; then
                full_prompt+="\n\n## 🔍 Feedback do Critic\n"
                full_prompt+=$(cat "$SESSIONS_DIR/$SESSION_ID/critic-response.md")
            fi
            ;;
    esac
    
    echo "$full_prompt"
}

# Execute with Claude (API or manual)
execute_with_claude() {
    local prompt="$1"
    local phase="$2"
    
    # Check for API key
    if [ -n "${CLAUDE_API_KEY:-}" ]; then
        echo -e "${BLUE}🤖 Executando com Claude API...${NC}"
        
        # Prepare request
        local request_body=$(jq -n \
            --arg prompt "$prompt" \
            '{
                "model": "claude-3-opus-20240229",
                "messages": [{"role": "user", "content": $prompt}],
                "max_tokens": 4096,
                "temperature": 0.7
            }')
        
        # Make API call
        local response=$(curl -s -X POST https://api.anthropic.com/v1/messages \
            -H "x-api-key: $CLAUDE_API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -H "content-type: application/json" \
            -d "$request_body")
        
        # Extract content
        echo "$response" | jq -r '.content[0].text // empty' || {
            echo -e "${RED}❌ API call failed${NC}"
            echo "$response"
            return 1
        }
    else
        # Manual mode
        echo -e "${YELLOW}📋 Modo manual - Cole o prompt no Claude${NC}"
        
        # Save prompt to file
        echo "$prompt" > "$SESSIONS_DIR/$SESSION_ID/$phase-prompt.md"
        
        # Copy to clipboard if available
        if command -v pbcopy &> /dev/null; then
            echo "$prompt" | pbcopy
            echo -e "${GREEN}✅ Prompt copiado para a área de transferência${NC}"
        elif command -v xclip &> /dev/null; then
            echo "$prompt" | xclip -selection clipboard
            echo -e "${GREEN}✅ Prompt copiado para a área de transferência${NC}"
        fi
        
        echo -e "\n${YELLOW}Instruções:${NC}"
        echo "1. Cole o prompt no Claude"
        echo "2. Copie a resposta completa"
        echo "3. Cole no arquivo que será aberto"
        echo -e "\n${BLUE}Pressione ENTER para abrir o editor...${NC}"
        read
        
        # Open editor for response
        local response_file="$SESSIONS_DIR/$SESSION_ID/$phase-response.md"
        ${EDITOR:-nano} "$response_file"
        
        # Read response
        cat "$response_file"
    fi
}

# Execute phase with validation
execute_phase() {
    local phase="$1"
    
    echo -e "\n${BLUE}🎬 Executando fase: $phase${NC}"
    echo "======================================"
    
    # Update phase status
    update_phase_status "$SESSION_ID" "$phase" "started"
    
    # Build prompt
    local prompt=$(build_enhanced_prompt "$phase")
    
    # Save prompt for reference
    echo "$prompt" > "$SESSIONS_DIR/$SESSION_ID/$phase-prompt.md"
    
    # Execute with Claude
    local response=$(execute_with_claude "$prompt" "$phase")
    
    # Save response
    echo "$response" > "$SESSIONS_DIR/$SESSION_ID/$phase-response.md"
    
    # Validate phase output
    if [ -f "$LIB_DIR/validation.sh" ]; then
        validate_phase_output "$phase"
    fi
    
    # Extract learnings
    extract_learnings "$phase" "$response"
    
    # Update phase status
    update_phase_status "$SESSION_ID" "$phase" "completed"
    
    # Update metrics
    update_session_metrics "$phase"
}

# Extract learnings from responses
extract_learnings() {
    local phase="$1"
    local content="$2"
    
    case "$phase" in
        "improve")
            # Extract new patterns
            if echo "$content" | grep -q "Padrão descoberto:"; then
                local patterns=$(echo "$content" | grep -A1 "Padrão descoberto:" | grep -v "Padrão descoberto:")
                while IFS= read -r pattern; do
                    if [ -n "$pattern" ]; then
                        echo "- $pattern" >> "$MEMORY_DIR/patterns.md"
                        echo -e "${GREEN}✅ Novo padrão adicionado${NC}"
                    fi
                done <<< "$patterns"
            fi
            
            # Extract new mistakes
            if echo "$content" | grep -q "Erro a evitar:"; then
                local mistakes=$(echo "$content" | grep -A1 "Erro a evitar:" | grep -v "Erro a evitar:")
                while IFS= read -r mistake; do
                    if [ -n "$mistake" ]; then
                        echo -e "\n## $mistake" >> "$MEMORY_DIR/mistakes.md"
                        echo -e "${GREEN}✅ Novo erro documentado${NC}"
                    fi
                done <<< "$mistakes"
            fi
            
            # Extract decisions
            if echo "$content" | grep -q "Decisão tomada:"; then
                local decisions=$(echo "$content" | grep -A1 "Decisão tomada:" | grep -v "Decisão tomada:")
                while IFS= read -r decision; do
                    if [ -n "$decision" ]; then
                        echo "- $decision" >> "$MEMORY_DIR/decisions.md"
                        echo -e "${GREEN}✅ Nova decisão registrada${NC}"
                    fi
                done <<< "$decisions"
            fi
            
            # Create memory snapshot
            if [ -f "$LIB_DIR/memory-versioning.sh" ]; then
                create_memory_snapshot "Learnings from session $SESSION_ID" "$SESSION_ID"
            fi
            ;;
    esac
}

# Update session metrics
update_session_metrics() {
    local phase="$1"
    local metadata_file="$SESSIONS_DIR/$SESSION_ID/metadata.json"
    
    case "$phase" in
        "actor")
            # Count lines of code generated
            local code_lines=$(grep -c "^" "$SESSIONS_DIR/$SESSION_ID/actor-response.md" 2>/dev/null || echo 0)
            jq ".metrics.code_lines = $code_lines" "$metadata_file" > tmp.json
            mv tmp.json "$metadata_file"
            ;;
            
        "critic")
            # Count issues found
            local issues=$(grep -c "Crítico\|Recomendado" "$SESSIONS_DIR/$SESSION_ID/critic-response.md" 2>/dev/null || echo 0)
            jq ".metrics.issues_found = $issues" "$metadata_file" > tmp.json
            mv tmp.json "$metadata_file"
            ;;
            
        "improve")
            # Count issues fixed
            local fixed=$(grep -c "\[x\]" "$SESSIONS_DIR/$SESSION_ID/improve-response.md" 2>/dev/null || echo 0)
            jq ".metrics.issues_fixed = $fixed" "$metadata_file" > tmp.json
            mv tmp.json "$metadata_file"
            
            # Update validation score if available
            if [ -f "$SESSIONS_DIR/$SESSION_ID/validation/summary.json" ]; then
                local score=$(jq '.score' "$SESSIONS_DIR/$SESSION_ID/validation/summary.json")
                jq ".metrics.validation_score = $score" "$metadata_file" > tmp.json
                mv tmp.json "$metadata_file"
            fi
            ;;
    esac
    
    # Update iteration count
    local iterations=$(jq '.metrics.iterations' "$metadata_file")
    jq ".metrics.iterations = $((iterations + 1))" "$metadata_file" > tmp.json
    mv tmp.json "$metadata_file"
}

# Generate final report
generate_final_report() {
    local report_file="$SESSIONS_DIR/$SESSION_ID/final-report.md"
    local metadata=$(cat "$SESSIONS_DIR/$SESSION_ID/metadata.json")
    
    cat > "$report_file" <<EOF
# 📊 CodeLoop Session Report

## Session Information
- **ID**: $SESSION_ID
- **Task**: $(echo "$metadata" | jq -r '.task')
- **Status**: $(echo "$metadata" | jq -r '.status')
- **Created**: $(echo "$metadata" | jq -r '.created')
- **Duration**: $(echo "$metadata" | jq -r '.metrics.duration_seconds') seconds

## Metrics
- **Code Lines**: $(echo "$metadata" | jq -r '.metrics.code_lines')
- **Issues Found**: $(echo "$metadata" | jq -r '.metrics.issues_found')
- **Issues Fixed**: $(echo "$metadata" | jq -r '.metrics.issues_fixed')
- **Validation Score**: $(echo "$metadata" | jq -r '.metrics.validation_score')/100

## Phase Summary

### Actor Phase
$(head -20 "$SESSIONS_DIR/$SESSION_ID/actor-response.md" 2>/dev/null || echo "No actor response")

### Critic Phase
$(grep -E "Crítico|Recomendado|Sugestões" "$SESSIONS_DIR/$SESSION_ID/critic-response.md" 2>/dev/null || echo "No critic feedback")

### Improve Phase
$(grep -E "Mudanças Aplicadas" -A10 "$SESSIONS_DIR/$SESSION_ID/improve-response.md" 2>/dev/null || echo "No improvements")

## Learnings Captured
- Patterns: $(grep -c "^-" "$MEMORY_DIR/patterns.md" 2>/dev/null || echo 0)
- Mistakes: $(grep -c "^##" "$MEMORY_DIR/mistakes.md" 2>/dev/null || echo 0)
- Decisions: $(grep -c "^-" "$MEMORY_DIR/decisions.md" 2>/dev/null || echo 0)

## Files Generated
$(ls -la "$SESSIONS_DIR/$SESSION_ID/" | grep -E "\.md$|\.json$" | awk '{print "- " $9}')

---
Generated: $(date)
EOF
    
    echo -e "${GREEN}✅ Report generated: $report_file${NC}"
}

# Main menu
show_menu() {
    while true; do
        echo -e "\n${BLUE}🎯 CodeLoop Enhanced - Main Menu${NC}"
        echo "================================"
        echo "1. Start new session"
        echo "2. Resume session"
        echo "3. Browse sessions"
        echo "4. Memory management"
        echo "5. View statistics"
        echo "6. Settings"
        echo "7. Exit"
        
        read -p "Choose option: " choice
        
        case "$choice" in
            1) return 0 ;;  # Start new session
            2) 
                list_sessions "active" "summary"
                read -p "Session ID to resume: " sid
                if [ -n "$sid" ]; then
                    resume_session "$sid"
                    return 1  # Resume mode
                fi
                ;;
            3) browse_sessions ;;
            4) browse_memory_versions ;;
            5) 
                session_stats
                echo ""
                memory_analytics
                ;;
            6) configure_settings ;;
            7) exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
    done
}

# Configure settings
configure_settings() {
    echo -e "\n${BLUE}⚙️  Settings${NC}"
    echo "============"
    echo "1. Set Claude API key"
    echo "2. Set editor"
    echo "3. Configure memory retention"
    echo "4. Back"
    
    read -p "Choose option: " choice
    
    case "$choice" in
        1)
            read -p "Claude API key: " api_key
            export CLAUDE_API_KEY="$api_key"
            echo "export CLAUDE_API_KEY='$api_key'" >> ~/.bashrc
            echo -e "${GREEN}✅ API key set${NC}"
            ;;
        2)
            read -p "Editor command (current: ${EDITOR:-nano}): " editor
            export EDITOR="$editor"
            echo "export EDITOR='$editor'" >> ~/.bashrc
            echo -e "${GREEN}✅ Editor set${NC}"
            ;;
        3)
            read -p "Memory retention days (current: $MEMORY_RETENTION_DAYS): " days
            sed -i "s/MEMORY_RETENTION_DAYS=.*/MEMORY_RETENTION_DAYS=$days/" "$0"
            echo -e "${GREEN}✅ Retention period set${NC}"
            ;;
    esac
}

# Main execution flow
main() {
    show_banner
    check_prerequisites
    
    # Check for command line arguments
    case "${1:-}" in
        "resume")
            if [ -n "${2:-}" ]; then
                resume_session "$2"
                SESSION_MODE="resume"
            else
                echo -e "${RED}❌ Please specify session ID${NC}"
                exit 1
            fi
            ;;
            
        "list")
            list_sessions "${2:-all}" "${3:-summary}"
            exit 0
            ;;
            
        "stats")
            session_stats
            memory_analytics
            exit 0
            ;;
            
        "search")
            if [ -n "${2:-}" ]; then
                search_sessions "$2" "${3:-all}"
            else
                echo -e "${RED}❌ Please specify search term${NC}"
            fi
            exit 0
            ;;
            
        "help"|"--help"|"-h")
            cat <<EOF
Usage: $0 [command] [options]

Commands:
  (none)              Start interactive mode
  resume <id>         Resume specific session
  list [filter]       List sessions (all/active/completed/today/week)
  stats               Show statistics
  search <term>       Search sessions
  help                Show this help

Examples:
  $0                  # Start new session interactively
  $0 resume abc123    # Resume session abc123
  $0 list active      # List active sessions
  $0 search "API"     # Search for sessions mentioning API
EOF
            exit 0
            ;;
            
        *)
            # Interactive mode
            show_menu
            SESSION_MODE="new"
            ;;
    esac
    
    # Start or resume session
    if [ "$SESSION_MODE" = "new" ]; then
        create_new_session
    fi
    
    # Record start time
    START_TIME=$(date +%s)
    
    # Execute phases
    if [ -n "${NEXT_PHASE:-}" ]; then
        # Resume from specific phase
        case "$NEXT_PHASE" in
            "actor") phases=(actor critic improve) ;;
            "critic") phases=(critic improve) ;;
            "improve") phases=(improve) ;;
        esac
    else
        # All phases
        phases=(actor critic improve)
    fi
    
    # Execute each phase
    for phase in "${phases[@]}"; do
        execute_phase "$phase"
        
        # Ask to continue
        if [ "$phase" != "improve" ]; then
            echo -e "\n${YELLOW}Continue to next phase? (y/n)${NC}"
            read -r continue
            if [ "$continue" != "y" ]; then
                update_session_status "$SESSION_ID" "$SESSION_STATE_PAUSED"
                echo -e "${YELLOW}Session paused. Resume with: $0 resume $SESSION_ID${NC}"
                exit 0
            fi
        fi
    done
    
    # Calculate duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    # Update final metrics
    jq ".metrics.duration_seconds = $DURATION" "$SESSIONS_DIR/$SESSION_ID/metadata.json" > tmp.json
    mv tmp.json "$SESSIONS_DIR/$SESSION_ID/metadata.json"
    
    # Update session status
    update_session_status "$SESSION_ID" "$SESSION_STATE_COMPLETED"
    
    # Generate final report
    generate_final_report
    
    # Show summary
    echo -e "\n${GREEN}🎉 Session completed successfully!${NC}"
    echo -e "Session ID: $SESSION_ID"
    echo -e "Duration: $DURATION seconds"
    echo -e "Report: $SESSIONS_DIR/$SESSION_ID/final-report.md"
    
    # Extract final code if present
    if [ -f "$SESSIONS_DIR/$SESSION_ID/improve-response.md" ]; then
        local final_code="$SESSIONS_DIR/$SESSION_ID/final-code.ts"
        sed -n '/```typescript/,/```/p' "$SESSIONS_DIR/$SESSION_ID/improve-response.md" | sed '1d;$d' > "$final_code"
        
        if [ -s "$final_code" ]; then
            echo -e "Final code: $final_code"
        fi
    fi
    
    # Auto-backup memory if significant changes
    if [ -f "$LIB_DIR/memory-versioning.sh" ]; then
        auto_backup_memory
    fi
}

# Run main
main "$@"