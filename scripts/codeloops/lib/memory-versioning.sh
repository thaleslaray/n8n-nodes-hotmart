#!/bin/bash
# memory-versioning.sh - Git-based memory versioning for CodeLoop

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Memory versioning configuration
MEMORY_GIT_DIR="$MEMORY_DIR/.git"
MEMORY_BACKUP_INTERVAL=10  # Create backup branch every N commits
MEMORY_RETENTION_DAYS=90   # Keep memory history for N days

# Initialize git repository for memory
init_memory_git() {
    if [ -d "$MEMORY_GIT_DIR" ]; then
        echo -e "${YELLOW}Memory versioning already initialized${NC}"
        return 0
    fi
    
    echo -e "${BLUE}🔧 Initializing memory versioning...${NC}"
    
    cd "$MEMORY_DIR"
    
    # Initialize git
    git init
    
    # Configure git
    git config user.name "CodeLoop Memory System"
    git config user.email "codeloop@local"
    git config core.autocrlf false
    
    # Create .gitignore
    cat > .gitignore <<EOF
*.tmp
*.log
*.swp
.DS_Store
EOF
    
    # Initial commit
    git add .
    git commit -m "Initial memory state" || {
        echo -e "${YELLOW}No files to commit initially${NC}"
    }
    
    # Create main branch
    git branch -M main
    
    echo -e "${GREEN}✅ Memory versioning initialized${NC}"
}

# Create memory snapshot
create_memory_snapshot() {
    local message="${1:-Manual snapshot}"
    local session_id="${2:-manual}"
    
    cd "$MEMORY_DIR"
    
    # Check if there are changes
    if git diff --quiet && git diff --staged --quiet; then
        echo -e "${YELLOW}No changes to snapshot${NC}"
        return 0
    fi
    
    # Stage all changes
    git add -A
    
    # Create commit with metadata
    local commit_message="[$session_id] $message

Session: $session_id
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
User: ${USER:-unknown}"
    
    git commit -m "$commit_message"
    
    local commit_hash=$(git rev-parse HEAD)
    echo -e "${GREEN}✅ Memory snapshot created: $commit_hash${NC}"
    
    # Check if backup branch needed
    check_and_create_backup
    
    # Clean old history if needed
    clean_old_memory_history
    
    return 0
}

# Update specific memory file with version control
update_memory_with_version() {
    local file="$1"
    local message="$2"
    local session_id="${3:-unknown}"
    
    cd "$MEMORY_DIR"
    
    # Validate file exists
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Memory file not found: $file${NC}"
        return 1
    fi
    
    # Create pre-update snapshot
    create_memory_snapshot "Pre-update: $message" "$session_id"
    
    # Stage the specific file
    git add "$file"
    
    # Commit the change
    git commit -m "[$session_id] Update $file: $message" || {
        echo -e "${YELLOW}No changes in $file${NC}"
        return 0
    }
    
    echo -e "${GREEN}✅ Memory file updated: $file${NC}"
}

# Check and create backup branch if needed
check_and_create_backup() {
    cd "$MEMORY_DIR"
    
    # Get commit count
    local commit_count=$(git rev-list --count HEAD)
    
    if [ $((commit_count % MEMORY_BACKUP_INTERVAL)) -eq 0 ]; then
        local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
        git branch "$backup_name"
        echo -e "${BLUE}📦 Created backup branch: $backup_name${NC}"
        
        # Tag important backups
        git tag -a "backup-$commit_count" -m "Automatic backup at $commit_count commits"
    fi
}

# List memory versions
list_memory_versions() {
    local limit="${1:-20}"
    
    cd "$MEMORY_DIR"
    
    echo -e "${BLUE}📜 Memory Version History${NC}"
    echo "========================"
    
    # Show recent commits
    git log --oneline --graph --decorate -n "$limit" --pretty=format:"%C(yellow)%h%C(reset) - %C(green)%ar%C(reset) - %s %C(blue)<%an>%C(reset)"
    
    echo -e "\n\n${YELLOW}Backup Branches:${NC}"
    git branch | grep backup- || echo "  No backups yet"
    
    echo -e "\n${YELLOW}Tags:${NC}"
    git tag -l "backup-*" | tail -5 || echo "  No backup tags yet"
}

# Show memory diff between versions
diff_memory_versions() {
    local version1="${1:-HEAD~1}"
    local version2="${2:-HEAD}"
    local file="${3:-}"
    
    cd "$MEMORY_DIR"
    
    echo -e "${BLUE}📊 Memory Diff: $version1..$version2${NC}"
    echo "======================================"
    
    if [ -n "$file" ]; then
        # Diff specific file
        git diff "$version1" "$version2" -- "$file"
    else
        # Diff all memory files
        git diff "$version1" "$version2" --stat
        echo ""
        git diff "$version1" "$version2"
    fi
}

# Restore memory to specific version
restore_memory_version() {
    local version="${1:-}"
    local file="${2:-}"
    
    if [ -z "$version" ]; then
        echo -e "${RED}❌ Please specify a version to restore${NC}"
        echo "Usage: restore_memory_version <commit-hash|tag|branch> [file]"
        return 1
    fi
    
    cd "$MEMORY_DIR"
    
    # Create backup before restore
    create_memory_snapshot "Pre-restore backup" "restore"
    
    if [ -n "$file" ]; then
        # Restore specific file
        echo -e "${YELLOW}⏮️  Restoring $file to version $version...${NC}"
        git checkout "$version" -- "$file"
        git add "$file"
        git commit -m "Restored $file to version $version"
    else
        # Full restore with safety check
        echo -e "${RED}⚠️  WARNING: This will restore ALL memory files to version $version${NC}"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            echo -e "${YELLOW}⏮️  Restoring all memory to version $version...${NC}"
            
            # Create restore branch
            local restore_branch="restore-$(date +%Y%m%d-%H%M%S)"
            git checkout -b "$restore_branch" "$version"
            
            # Merge back to main
            git checkout main
            git merge "$restore_branch" -m "Restored memory to version $version"
            
            # Clean up
            git branch -d "$restore_branch"
        else
            echo -e "${BLUE}Restore cancelled${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ Memory restored successfully${NC}"
}

# Search memory history
search_memory_history() {
    local search_term="$1"
    local context_lines="${2:-3}"
    
    cd "$MEMORY_DIR"
    
    echo -e "${BLUE}🔍 Searching memory history for: $search_term${NC}"
    echo "=========================================="
    
    # Search in commit messages
    echo -e "\n${YELLOW}Commits mentioning '$search_term':${NC}"
    git log --grep="$search_term" --oneline
    
    # Search in file changes
    echo -e "\n${YELLOW}Changes containing '$search_term':${NC}"
    git log -p -S"$search_term" --oneline | head -50
    
    # Search in current memory
    echo -e "\n${YELLOW}Current memory containing '$search_term':${NC}"
    grep -r "$search_term" . --exclude-dir=.git -n -C "$context_lines" 2>/dev/null || echo "  Not found in current memory"
}

# Memory analytics
memory_analytics() {
    cd "$MEMORY_DIR"
    
    echo -e "${BLUE}📊 Memory Analytics${NC}"
    echo "=================="
    
    # File statistics
    echo -e "\n${YELLOW}Memory Files:${NC}"
    for file in *.md; do
        if [ -f "$file" ]; then
            local lines=$(wc -l < "$file")
            local size=$(du -h "$file" | cut -f1)
            local last_modified=$(git log -1 --format="%ar" -- "$file")
            printf "  %-20s %5d lines  %6s  (modified %s)\n" "$file" "$lines" "$size" "$last_modified"
        fi
    done
    
    # Growth over time
    echo -e "\n${YELLOW}Memory Growth:${NC}"
    local initial_size=$(git show --format="" --numstat $(git rev-list --max-parents=0 HEAD) | awk '{added+=$1; deleted+=$2} END {print added-deleted}')
    local current_size=$(wc -l *.md 2>/dev/null | tail -1 | awk '{print $1}')
    echo "  Initial size: $initial_size lines"
    echo "  Current size: $current_size lines"
    echo "  Growth: $((current_size - initial_size)) lines"
    
    # Most active files
    echo -e "\n${YELLOW}Most Active Files:${NC}"
    git log --format="" --numstat | grep -E "\.md$" | awk '{print $3}' | sort | uniq -c | sort -rn | head -5
    
    # Contribution by session
    echo -e "\n${YELLOW}Top Contributing Sessions:${NC}"
    git log --format="%s" | grep -oE "^\[[^]]+\]" | sort | uniq -c | sort -rn | head -10
}

# Clean old memory history
clean_old_memory_history() {
    cd "$MEMORY_DIR"
    
    # Only clean if retention period is set
    if [ "$MEMORY_RETENTION_DAYS" -le 0 ]; then
        return 0
    fi
    
    # Check last cleanup
    local last_cleanup_file=".last_cleanup"
    if [ -f "$last_cleanup_file" ]; then
        local last_cleanup=$(cat "$last_cleanup_file")
        local days_since=$((( $(date +%s) - last_cleanup ) / 86400))
        
        if [ "$days_since" -lt 7 ]; then
            return 0  # Only cleanup weekly
        fi
    fi
    
    echo -e "${YELLOW}🧹 Cleaning old memory history...${NC}"
    
    # Create cleanup branch
    local cleanup_branch="cleanup-$(date +%Y%m%d)"
    git checkout -b "$cleanup_branch"
    
    # Rewrite history to remove old commits
    local cutoff_date=$(date -d "$MEMORY_RETENTION_DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${MEMORY_RETENTION_DAYS}d +%Y-%m-%d)
    
    # This is a placeholder - actual history rewriting is complex and risky
    echo -e "${BLUE}Would clean commits older than $cutoff_date${NC}"
    
    # For now, just delete old backup branches
    git branch | grep backup- | while read branch; do
        local branch_date=$(git log -1 --format="%ai" "$branch" | cut -d' ' -f1)
        if [[ "$branch_date" < "$cutoff_date" ]]; then
            git branch -D "$branch"
            echo "  Deleted old backup: $branch"
        fi
    done
    
    # Return to main
    git checkout main
    git branch -d "$cleanup_branch"
    
    # Update last cleanup time
    date +%s > "$last_cleanup_file"
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Export memory with history
export_memory_with_history() {
    local export_path="${1:-./memory-export}"
    local format="${2:-bundle}" # bundle or archive
    
    cd "$MEMORY_DIR"
    
    echo -e "${BLUE}📦 Exporting memory with history...${NC}"
    
    case "$format" in
        "bundle")
            # Git bundle includes full history
            git bundle create "$export_path.bundle" --all
            echo -e "${GREEN}✅ Exported to: $export_path.bundle${NC}"
            echo "Import with: git clone $export_path.bundle"
            ;;
            
        "archive")
            # Create archive with current state and history summary
            local temp_dir=$(mktemp -d)
            
            # Copy current files
            cp -r . "$temp_dir/memory"
            
            # Generate history report
            {
                echo "# Memory History Report"
                echo "Generated: $(date)"
                echo ""
                echo "## Recent History"
                git log --oneline -n 50
                echo ""
                echo "## File History"
                for file in *.md; do
                    [ -f "$file" ] && echo "### $file" && git log --oneline -n 10 -- "$file"
                done
            } > "$temp_dir/history.md"
            
            # Create archive
            tar -czf "$export_path.tar.gz" -C "$temp_dir" .
            rm -rf "$temp_dir"
            
            echo -e "${GREEN}✅ Exported to: $export_path.tar.gz${NC}"
            ;;
    esac
}

# Import memory with history
import_memory_with_history() {
    local import_path="$1"
    
    if [ ! -f "$import_path" ]; then
        echo -e "${RED}❌ Import file not found: $import_path${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📥 Importing memory...${NC}"
    
    # Backup current memory first
    export_memory_with_history "./memory-backup-$(date +%Y%m%d-%H%M%S)"
    
    case "$import_path" in
        *.bundle)
            # Import git bundle
            cd "$MEMORY_DIR"
            git remote add import "$import_path"
            git fetch import
            git merge import/main -m "Imported memory from bundle"
            git remote remove import
            ;;
            
        *.tar.gz)
            # Import archive
            local temp_dir=$(mktemp -d)
            tar -xzf "$import_path" -C "$temp_dir"
            
            if [ -d "$temp_dir/memory" ]; then
                cp -r "$temp_dir/memory/"* "$MEMORY_DIR/"
                create_memory_snapshot "Imported from archive" "import"
            fi
            
            rm -rf "$temp_dir"
            ;;
            
        *)
            echo -e "${RED}❌ Unsupported format${NC}"
            return 1
            ;;
    esac
    
    echo -e "${GREEN}✅ Memory imported successfully${NC}"
}

# Interactive memory version browser
browse_memory_versions() {
    while true; do
        echo -e "\n${BLUE}📚 Memory Version Browser${NC}"
        echo "========================"
        echo "1. List versions"
        echo "2. Show diff between versions"
        echo "3. Search history"
        echo "4. Restore version"
        echo "5. Create snapshot"
        echo "6. View analytics"
        echo "7. Export memory"
        echo "8. Back"
        
        read -p "Choose option: " choice
        
        case "$choice" in
            1)
                read -p "Number of versions to show (20): " limit
                list_memory_versions "${limit:-20}"
                ;;
            2)
                read -p "From version (HEAD~1): " v1
                read -p "To version (HEAD): " v2
                read -p "Specific file (empty for all): " file
                diff_memory_versions "${v1:-HEAD~1}" "${v2:-HEAD}" "$file"
                ;;
            3)
                read -p "Search term: " term
                search_memory_history "$term"
                ;;
            4)
                read -p "Version to restore: " version
                read -p "Specific file (empty for all): " file
                restore_memory_version "$version" "$file"
                ;;
            5)
                read -p "Snapshot message: " msg
                create_memory_snapshot "$msg" "manual"
                ;;
            6)
                memory_analytics
                ;;
            7)
                read -p "Export path: " path
                read -p "Format (bundle/archive): " format
                export_memory_with_history "${path:-./memory-export}" "${format:-bundle}"
                ;;
            8)
                break
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
        
        read -p "Press Enter to continue..."
    done
}

# Auto-backup memory on significant changes
auto_backup_memory() {
    cd "$MEMORY_DIR"
    
    # Calculate change size
    local changes=$(git diff --numstat | awk '{added+=$1; deleted+=$2} END {print added+deleted}')
    
    # Backup if significant changes (>50 lines)
    if [ "$changes" -gt 50 ]; then
        echo -e "${YELLOW}Significant changes detected ($changes lines)${NC}"
        create_memory_snapshot "Auto-backup: $changes lines changed" "auto"
    fi
}

# Export functions
export -f init_memory_git
export -f create_memory_snapshot
export -f update_memory_with_version
export -f list_memory_versions
export -f diff_memory_versions
export -f restore_memory_version
export -f search_memory_history
export -f memory_analytics
export -f export_memory_with_history
export -f import_memory_with_history
export -f browse_memory_versions
export -f auto_backup_memory