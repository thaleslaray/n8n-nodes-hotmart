#!/bin/bash
# session-manager.sh - Enhanced session management for CodeLoop

set -euo pipefail

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Session states
SESSION_STATE_NEW="new"
SESSION_STATE_IN_PROGRESS="in_progress"
SESSION_STATE_COMPLETED="completed"
SESSION_STATE_FAILED="failed"
SESSION_STATE_PAUSED="paused"

# Create new session with metadata
create_session_metadata() {
    local session_id="$1"
    local task="${2:-No task description}"
    local tags="${3:-}"
    
    local metadata_file="$SESSIONS_DIR/$session_id/metadata.json"
    
    # Create session directory
    mkdir -p "$SESSIONS_DIR/$session_id"
    
    # Generate metadata
    cat > "$metadata_file" <<EOF
{
    "id": "$session_id",
    "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "task": "$task",
    "tags": [$(echo "$tags" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/' | sed 's/""//g')],
    "related_sessions": [],
    "parent_session": null,
    "status": "$SESSION_STATE_NEW",
    "phases": {
        "actor": {"status": "pending", "started": null, "completed": null},
        "critic": {"status": "pending", "started": null, "completed": null},
        "improve": {"status": "pending", "started": null, "completed": null}
    },
    "metrics": {
        "iterations": 0,
        "issues_found": 0,
        "issues_fixed": 0,
        "duration_seconds": 0,
        "validation_score": 0,
        "code_lines": 0
    },
    "files": {
        "actor_response": null,
        "critic_response": null,
        "improve_response": null,
        "final_code": null
    },
    "learnings": {
        "patterns": [],
        "mistakes": [],
        "decisions": []
    }
}
EOF
    
    echo -e "${GREEN}✅ Session created: $session_id${NC}"
}

# Update session status
update_session_status() {
    local session_id="$1"
    local status="$2"
    local metadata_file="$SESSIONS_DIR/$session_id/metadata.json"
    
    if [ ! -f "$metadata_file" ]; then
        echo -e "${RED}❌ Session $session_id not found${NC}"
        return 1
    fi
    
    # Update status and timestamp
    jq ".status = \"$status\" | .updated = \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" "$metadata_file" > tmp.json
    mv tmp.json "$metadata_file"
}

# Update phase status
update_phase_status() {
    local session_id="$1"
    local phase="$2"
    local status="$3"
    local metadata_file="$SESSIONS_DIR/$session_id/metadata.json"
    
    local timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    
    if [ "$status" = "started" ]; then
        jq ".phases.$phase.status = \"in_progress\" | .phases.$phase.started = \"$timestamp\"" "$metadata_file" > tmp.json
    elif [ "$status" = "completed" ]; then
        jq ".phases.$phase.status = \"completed\" | .phases.$phase.completed = \"$timestamp\"" "$metadata_file" > tmp.json
    else
        jq ".phases.$phase.status = \"$status\"" "$metadata_file" > tmp.json
    fi
    
    mv tmp.json "$metadata_file"
}

# Search sessions by various criteria
search_sessions() {
    local query="${1:-}"
    local search_type="${2:-all}" # all, task, tag, status, date
    
    echo -e "${BLUE}🔍 Searching sessions...${NC}"
    
    case "$search_type" in
        "task")
            find "$SESSIONS_DIR" -name "metadata.json" -exec grep -l "\"task\".*$query" {} \; | while read -r file; do
                display_session_summary "$file"
            done
            ;;
            
        "tag")
            find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r "select(.tags[] | contains(\"$query\")) | .id" {} \; 2>/dev/null | while read -r session_id; do
                [ -n "$session_id" ] && display_session_summary "$SESSIONS_DIR/$session_id/metadata.json"
            done
            ;;
            
        "status")
            find "$SESSIONS_DIR" -name "metadata.json" -exec grep -l "\"status\": \"$query\"" {} \; | while read -r file; do
                display_session_summary "$file"
            done
            ;;
            
        "date")
            # Search by date (format: YYYY-MM-DD)
            find "$SESSIONS_DIR" -name "metadata.json" -exec grep -l "\"created\".*$query" {} \; | while read -r file; do
                display_session_summary "$file"
            done
            ;;
            
        "all"|*)
            # Search in all content
            find "$SESSIONS_DIR" -type f \( -name "*.md" -o -name "*.json" \) -exec grep -l "$query" {} \; | while read -r file; do
                local session_dir=$(dirname "$file")
                local metadata_file="$session_dir/metadata.json"
                if [ -f "$metadata_file" ]; then
                    display_session_summary "$metadata_file" "$(grep -m1 "$query" "$file")"
                fi
            done | sort -u
            ;;
    esac
}

# Display session summary
display_session_summary() {
    local metadata_file="$1"
    local context="${2:-}"
    
    if [ ! -f "$metadata_file" ]; then
        return
    fi
    
    local session_data=$(jq -r '. | @json' "$metadata_file")
    local id=$(echo "$session_data" | jq -r '.id')
    local task=$(echo "$session_data" | jq -r '.task')
    local status=$(echo "$session_data" | jq -r '.status')
    local created=$(echo "$session_data" | jq -r '.created')
    local score=$(echo "$session_data" | jq -r '.metrics.validation_score')
    local tags=$(echo "$session_data" | jq -r '.tags | join(", ")')
    
    # Color code by status
    local status_color=""
    case "$status" in
        "$SESSION_STATE_COMPLETED") status_color="${GREEN}" ;;
        "$SESSION_STATE_IN_PROGRESS") status_color="${YELLOW}" ;;
        "$SESSION_STATE_FAILED") status_color="${RED}" ;;
        *) status_color="${NC}" ;;
    esac
    
    echo -e "\n${BLUE}📁 Session: $id${NC}"
    echo -e "  Task: $task"
    echo -e "  Status: ${status_color}$status${NC}"
    echo -e "  Created: $created"
    echo -e "  Score: $score/100"
    [ -n "$tags" ] && echo -e "  Tags: $tags"
    [ -n "$context" ] && echo -e "  Context: ${YELLOW}$context${NC}"
}

# Link related sessions
link_sessions() {
    local session1="$1"
    local session2="$2"
    local relationship="${3:-related}" # related, parent, child, continuation
    
    local metadata1="$SESSIONS_DIR/$session1/metadata.json"
    local metadata2="$SESSIONS_DIR/$session2/metadata.json"
    
    if [ ! -f "$metadata1" ] || [ ! -f "$metadata2" ]; then
        echo -e "${RED}❌ One or both sessions not found${NC}"
        return 1
    fi
    
    # Add bidirectional link
    case "$relationship" in
        "parent")
            jq ".parent_session = \"$session2\"" "$metadata1" > tmp.json
            mv tmp.json "$metadata1"
            jq ".related_sessions += [{\"id\": \"$session1\", \"type\": \"child\"}]" "$metadata2" > tmp.json
            mv tmp.json "$metadata2"
            ;;
            
        "child")
            jq ".parent_session = \"$session1\"" "$metadata2" > tmp.json
            mv tmp.json "$metadata2"
            jq ".related_sessions += [{\"id\": \"$session2\", \"type\": \"child\"}]" "$metadata1" > tmp.json
            mv tmp.json "$metadata1"
            ;;
            
        *)
            jq ".related_sessions += [{\"id\": \"$session2\", \"type\": \"$relationship\"}]" "$metadata1" > tmp.json
            mv tmp.json "$metadata1"
            jq ".related_sessions += [{\"id\": \"$session1\", \"type\": \"$relationship\"}]" "$metadata2" > tmp.json
            mv tmp.json "$metadata2"
            ;;
    esac
    
    echo -e "${GREEN}✅ Sessions linked: $session1 ↔ $session2 ($relationship)${NC}"
}

# Resume a session
resume_session() {
    local session_id="$1"
    local metadata_file="$SESSIONS_DIR/$session_id/metadata.json"
    
    if [ ! -f "$metadata_file" ]; then
        echo -e "${RED}❌ Session $session_id not found${NC}"
        return 1
    fi
    
    # Export session info
    export SESSION_ID="$session_id"
    export SESSION_METADATA="$metadata_file"
    
    # Load session data
    local session_data=$(jq -r '. | @json' "$metadata_file")
    local task=$(echo "$session_data" | jq -r '.task')
    local status=$(echo "$session_data" | jq -r '.status')
    
    echo -e "${BLUE}📂 Resuming session: $session_id${NC}"
    echo -e "Task: $task"
    echo -e "Status: $status"
    echo ""
    
    # Show phase status
    echo -e "${YELLOW}Phase Status:${NC}"
    for phase in actor critic improve; do
        local phase_status=$(echo "$session_data" | jq -r ".phases.$phase.status")
        local phase_icon="⏳"
        
        case "$phase_status" in
            "completed") phase_icon="✅" ;;
            "in_progress") phase_icon="🔄" ;;
            "failed") phase_icon="❌" ;;
        esac
        
        echo -e "  $phase_icon $phase: $phase_status"
    done
    
    # Find next phase to execute
    local next_phase=""
    for phase in actor critic improve; do
        local phase_status=$(echo "$session_data" | jq -r ".phases.$phase.status")
        if [ "$phase_status" != "completed" ]; then
            next_phase="$phase"
            break
        fi
    done
    
    if [ -n "$next_phase" ]; then
        echo -e "\n${GREEN}▶️  Next phase: $next_phase${NC}"
        export NEXT_PHASE="$next_phase"
    else
        echo -e "\n${GREEN}✅ All phases completed${NC}"
    fi
    
    # Update session status
    update_session_status "$session_id" "$SESSION_STATE_IN_PROGRESS"
    
    # Load session state
    if [ -f "$SESSIONS_DIR/$session_id/state.json" ]; then
        echo -e "\n${BLUE}Loading session state...${NC}"
        cat "$SESSIONS_DIR/$session_id/state.json"
    fi
}

# List sessions with filters
list_sessions() {
    local filter="${1:-all}" # all, active, completed, today, week
    local format="${2:-summary}" # summary, detailed, json
    
    echo -e "${BLUE}📋 Session List ($filter)${NC}"
    echo "================================"
    
    local sessions=()
    
    case "$filter" in
        "active")
            sessions=($(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "in_progress" or .status == "new") | .id' {} \; 2>/dev/null))
            ;;
            
        "completed")
            sessions=($(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "completed") | .id' {} \; 2>/dev/null))
            ;;
            
        "today")
            local today=$(date +%Y-%m-%d)
            sessions=($(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r "select(.created | startswith(\"$today\")) | .id" {} \; 2>/dev/null))
            ;;
            
        "week")
            local week_ago=$(date -d "7 days ago" +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d)
            sessions=($(find "$SESSIONS_DIR" -name "metadata.json" -newermt "$week_ago" -exec jq -r '.id' {} \; 2>/dev/null))
            ;;
            
        "all"|*)
            sessions=($(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r '.id' {} \; 2>/dev/null | sort))
            ;;
    esac
    
    if [ ${#sessions[@]} -eq 0 ]; then
        echo -e "${YELLOW}No sessions found${NC}"
        return
    fi
    
    # Display sessions
    for session_id in "${sessions[@]}"; do
        case "$format" in
            "json")
                cat "$SESSIONS_DIR/$session_id/metadata.json"
                ;;
                
            "detailed")
                display_session_details "$session_id"
                ;;
                
            "summary"|*)
                display_session_summary "$SESSIONS_DIR/$session_id/metadata.json"
                ;;
        esac
    done
    
    echo -e "\n${GREEN}Total: ${#sessions[@]} sessions${NC}"
}

# Display detailed session information
display_session_details() {
    local session_id="$1"
    local metadata_file="$SESSIONS_DIR/$session_id/metadata.json"
    
    if [ ! -f "$metadata_file" ]; then
        return
    fi
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Session: $session_id${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Basic info
    jq -r '
        "Task: \(.task)",
        "Status: \(.status)",
        "Created: \(.created)",
        "Updated: \(.updated)",
        "Tags: \(.tags | join(", "))",
        "",
        "Phases:",
        "  Actor: \(.phases.actor.status)",
        "  Critic: \(.phases.critic.status)",
        "  Improve: \(.phases.improve.status)",
        "",
        "Metrics:",
        "  Iterations: \(.metrics.iterations)",
        "  Issues Found: \(.metrics.issues_found)",
        "  Issues Fixed: \(.metrics.issues_fixed)",
        "  Validation Score: \(.metrics.validation_score)/100",
        "  Code Lines: \(.metrics.code_lines)"
    ' "$metadata_file"
    
    # Show related sessions
    local related_count=$(jq '.related_sessions | length' "$metadata_file")
    if [ "$related_count" -gt 0 ]; then
        echo -e "\nRelated Sessions:"
        jq -r '.related_sessions[] | "  - \(.id) (\(.type))"' "$metadata_file"
    fi
    
    # Show files
    echo -e "\nFiles:"
    for file in "$SESSIONS_DIR/$session_id"/*.md; do
        if [ -f "$file" ]; then
            echo "  - $(basename "$file")"
        fi
    done
}

# Archive old sessions
archive_sessions() {
    local days_old="${1:-30}"
    local archive_dir="$SESSIONS_DIR/.archive"
    
    echo -e "${BLUE}📦 Archiving sessions older than $days_old days...${NC}"
    
    mkdir -p "$archive_dir"
    
    local archived_count=0
    
    # Find old sessions
    find "$SESSIONS_DIR" -maxdepth 1 -type d -mtime +$days_old | while read -r session_dir; do
        local session_id=$(basename "$session_dir")
        
        # Skip special directories
        if [[ "$session_id" == "." || "$session_id" == ".." || "$session_id" == ".archive" ]]; then
            continue
        fi
        
        # Check if completed
        if [ -f "$session_dir/metadata.json" ]; then
            local status=$(jq -r '.status' "$session_dir/metadata.json")
            
            if [ "$status" = "$SESSION_STATE_COMPLETED" ] || [ "$status" = "$SESSION_STATE_FAILED" ]; then
                echo "  Archiving: $session_id"
                mv "$session_dir" "$archive_dir/"
                archived_count=$((archived_count + 1))
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Archived $archived_count sessions${NC}"
}

# Session statistics
session_stats() {
    echo -e "${BLUE}📊 CodeLoop Session Statistics${NC}"
    echo "=============================="
    
    # Count sessions by status
    local total=$(find "$SESSIONS_DIR" -name "metadata.json" | wc -l)
    local completed=$(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "completed") | .id' {} \; 2>/dev/null | wc -l)
    local in_progress=$(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "in_progress") | .id' {} \; 2>/dev/null | wc -l)
    local failed=$(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "failed") | .id' {} \; 2>/dev/null | wc -l)
    
    echo "Total Sessions: $total"
    echo "  Completed: $completed"
    echo "  In Progress: $in_progress"
    echo "  Failed: $failed"
    
    # Average metrics
    if [ "$completed" -gt 0 ]; then
        echo -e "\n${YELLOW}Average Metrics (Completed Sessions):${NC}"
        
        local avg_score=$(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "completed") | .metrics.validation_score' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum/NR}')
        local avg_issues=$(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "completed") | .metrics.issues_found' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum/NR}')
        local avg_fixed=$(find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r 'select(.status == "completed") | .metrics.issues_fixed' {} \; 2>/dev/null | awk '{sum+=$1} END {print sum/NR}')
        
        printf "  Validation Score: %.1f/100\n" "$avg_score"
        printf "  Issues Found: %.1f\n" "$avg_issues"
        printf "  Issues Fixed: %.1f\n" "$avg_fixed"
    fi
    
    # Most used tags
    echo -e "\n${YELLOW}Most Used Tags:${NC}"
    find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r '.tags[]' {} \; 2>/dev/null | sort | uniq -c | sort -rn | head -5 | while read count tag; do
        echo "  $tag: $count"
    done
    
    # Recent activity
    echo -e "\n${YELLOW}Recent Activity:${NC}"
    find "$SESSIONS_DIR" -name "metadata.json" -exec jq -r '.updated' {} \; 2>/dev/null | sort -r | head -5 | while read date; do
        echo "  $date"
    done
}

# Export session data
export_session() {
    local session_id="$1"
    local export_format="${2:-tar}" # tar, zip, json
    local output_dir="${3:-.}"
    
    if [ ! -d "$SESSIONS_DIR/$session_id" ]; then
        echo -e "${RED}❌ Session $session_id not found${NC}"
        return 1
    fi
    
    local export_file="$output_dir/codeloop-session-$session_id"
    
    case "$export_format" in
        "tar")
            tar -czf "$export_file.tar.gz" -C "$SESSIONS_DIR" "$session_id"
            echo -e "${GREEN}✅ Exported to: $export_file.tar.gz${NC}"
            ;;
            
        "zip")
            (cd "$SESSIONS_DIR" && zip -r "$export_file.zip" "$session_id")
            echo -e "${GREEN}✅ Exported to: $export_file.zip${NC}"
            ;;
            
        "json")
            # Export as structured JSON
            cat > "$export_file.json" <<EOF
{
    "metadata": $(cat "$SESSIONS_DIR/$session_id/metadata.json"),
    "files": {
EOF
            
            # Add file contents
            local first=true
            for file in "$SESSIONS_DIR/$session_id"/*.md; do
                if [ -f "$file" ]; then
                    [ "$first" = false ] && echo "," >> "$export_file.json"
                    echo -n "        \"$(basename "$file")\": " >> "$export_file.json"
                    jq -Rs . < "$file" >> "$export_file.json"
                    first=false
                fi
            done
            
            echo -e "\n    }\n}" >> "$export_file.json"
            echo -e "${GREEN}✅ Exported to: $export_file.json${NC}"
            ;;
    esac
}

# Import session data
import_session() {
    local import_file="$1"
    
    if [ ! -f "$import_file" ]; then
        echo -e "${RED}❌ File not found: $import_file${NC}"
        return 1
    fi
    
    case "$import_file" in
        *.tar.gz)
            tar -xzf "$import_file" -C "$SESSIONS_DIR"
            ;;
            
        *.zip)
            unzip -q "$import_file" -d "$SESSIONS_DIR"
            ;;
            
        *.json)
            # Import from JSON format
            local session_id=$(jq -r '.metadata.id' "$import_file")
            mkdir -p "$SESSIONS_DIR/$session_id"
            
            # Import metadata
            jq '.metadata' "$import_file" > "$SESSIONS_DIR/$session_id/metadata.json"
            
            # Import files
            jq -r '.files | to_entries[] | .key' "$import_file" | while read filename; do
                jq -r ".files.\"$filename\"" "$import_file" > "$SESSIONS_DIR/$session_id/$filename"
            done
            ;;
            
        *)
            echo -e "${RED}❌ Unsupported format${NC}"
            return 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Session imported successfully${NC}"
}

# Session cleanup
cleanup_sessions() {
    local cleanup_type="${1:-orphaned}" # orphaned, failed, old
    
    echo -e "${BLUE}🧹 Cleaning up sessions ($cleanup_type)...${NC}"
    
    case "$cleanup_type" in
        "orphaned")
            # Remove sessions without metadata
            find "$SESSIONS_DIR" -maxdepth 1 -type d | while read -r dir; do
                if [ "$dir" != "$SESSIONS_DIR" ] && [ ! -f "$dir/metadata.json" ]; then
                    echo "  Removing orphaned: $(basename "$dir")"
                    rm -rf "$dir"
                fi
            done
            ;;
            
        "failed")
            # Remove failed sessions older than 7 days
            find "$SESSIONS_DIR" -name "metadata.json" -mtime +7 -exec jq -r 'select(.status == "failed") | .id' {} \; 2>/dev/null | while read session_id; do
                echo "  Removing failed: $session_id"
                rm -rf "$SESSIONS_DIR/$session_id"
            done
            ;;
            
        "old")
            # Archive very old sessions
            archive_sessions 90
            ;;
    esac
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Interactive session browser
browse_sessions() {
    while true; do
        echo -e "\n${BLUE}📂 CodeLoop Session Browser${NC}"
        echo "=========================="
        echo "1. List all sessions"
        echo "2. Search sessions"
        echo "3. View session details"
        echo "4. Resume session"
        echo "5. Link sessions"
        echo "6. Session statistics"
        echo "7. Export session"
        echo "8. Archive old sessions"
        echo "9. Exit"
        
        read -p "Choose option: " choice
        
        case "$choice" in
            1) list_sessions "all" ;;
            2) 
                read -p "Search query: " query
                search_sessions "$query"
                ;;
            3)
                read -p "Session ID: " sid
                display_session_details "$sid"
                ;;
            4)
                read -p "Session ID: " sid
                resume_session "$sid"
                break
                ;;
            5)
                read -p "Session 1 ID: " sid1
                read -p "Session 2 ID: " sid2
                read -p "Relationship (related/parent/child): " rel
                link_sessions "$sid1" "$sid2" "$rel"
                ;;
            6) session_stats ;;
            7)
                read -p "Session ID: " sid
                read -p "Format (tar/zip/json): " format
                export_session "$sid" "$format"
                ;;
            8) archive_sessions ;;
            9) break ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
        
        read -p "Press Enter to continue..."
    done
}

# Export all functions
export -f create_session_metadata
export -f update_session_status
export -f update_phase_status
export -f search_sessions
export -f link_sessions
export -f resume_session
export -f list_sessions
export -f archive_sessions
export -f session_stats
export -f export_session
export -f import_session
export -f browse_sessions