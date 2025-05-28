#!/bin/bash
# validation.sh - Automated code validation for CodeLoop

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_PASSED=true
VALIDATION_REPORT=""

# Initialize validation directory
init_validation() {
    local session_id="$1"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    mkdir -p "$validation_dir"
    
    # Create validation summary file
    cat > "$validation_dir/summary.json" <<EOF
{
    "session_id": "$session_id",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "checks": {},
    "passed": false,
    "score": 0
}
EOF
}

# Validate TypeScript syntax
validate_typescript() {
    local file="$1"
    local session_id="$2"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    echo -e "${YELLOW}🔍 Validating TypeScript syntax...${NC}"
    
    # Create temporary tsconfig if needed
    local temp_tsconfig=$(mktemp)
    cat > "$temp_tsconfig" <<EOF
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": ["$file"]
}
EOF
    
    # Run TypeScript compiler
    if npx tsc --project "$temp_tsconfig" > "$validation_dir/typescript.log" 2>&1; then
        echo -e "${GREEN}✅ TypeScript validation passed${NC}"
        update_validation_result "$session_id" "typescript" "passed" 100
    else
        echo -e "${RED}❌ TypeScript validation failed${NC}"
        cat "$validation_dir/typescript.log"
        VALIDATION_PASSED=false
        update_validation_result "$session_id" "typescript" "failed" 0
    fi
    
    rm "$temp_tsconfig"
}

# Validate with ESLint
validate_eslint() {
    local file="$1"
    local session_id="$2"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    echo -e "${YELLOW}🔍 Running ESLint...${NC}"
    
    # Check if eslint config exists
    if [ ! -f "$SCRIPT_DIR/../../.eslintrc.js" ]; then
        echo -e "${YELLOW}⚠️  No ESLint config found, skipping${NC}"
        return
    fi
    
    # Run ESLint
    if npx eslint "$file" --format json > "$validation_dir/eslint.json" 2> "$validation_dir/eslint.log"; then
        echo -e "${GREEN}✅ ESLint validation passed${NC}"
        update_validation_result "$session_id" "eslint" "passed" 100
    else
        echo -e "${RED}❌ ESLint found issues${NC}"
        
        # Parse and display errors
        local error_count=$(jq '.[0].errorCount // 0' "$validation_dir/eslint.json")
        local warning_count=$(jq '.[0].warningCount // 0' "$validation_dir/eslint.json")
        
        echo "  Errors: $error_count, Warnings: $warning_count"
        
        # Calculate score (100 - 10 per error - 5 per warning, min 0)
        local score=$((100 - error_count * 10 - warning_count * 5))
        [ $score -lt 0 ] && score=0
        
        update_validation_result "$session_id" "eslint" "failed" "$score"
        
        if [ "$error_count" -gt 0 ]; then
            VALIDATION_PASSED=false
        fi
    fi
}

# Validate n8n specific patterns
validate_n8n_patterns() {
    local file="$1"
    local session_id="$2"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    echo -e "${YELLOW}🔍 Checking n8n patterns...${NC}"
    
    local issues=0
    local checks=0
    
    # Check for INodeExecuteFunctions usage
    checks=$((checks + 1))
    if ! grep -q "INodeExecuteFunctions" "$file"; then
        echo -e "${RED}  ❌ Missing INodeExecuteFunctions interface${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for proper return type
    checks=$((checks + 1))
    if ! grep -q "Promise<INodeExecutionData\[\]\[\]>" "$file"; then
        echo -e "${RED}  ❌ Missing proper return type Promise<INodeExecutionData[][]>${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for hotmartApiRequest usage
    checks=$((checks + 1))
    if grep -q "fetch\|axios\|request" "$file" && ! grep -q "hotmartApiRequest" "$file"; then
        echo -e "${YELLOW}  ⚠️  Using direct HTTP calls instead of hotmartApiRequest${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for error handling
    checks=$((checks + 1))
    if ! grep -q "try\|catch\|NodeApiError" "$file"; then
        echo -e "${RED}  ❌ Missing error handling${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for credential handling
    checks=$((checks + 1))
    if grep -q "getCredentials" "$file" && ! grep -q "hotmartOAuth2Api" "$file"; then
        echo -e "${YELLOW}  ⚠️  Possibly using wrong credential type${NC}"
        issues=$((issues + 1))
    fi
    
    # Calculate score
    local score=$((100 * (checks - issues) / checks))
    
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}✅ All n8n patterns validated${NC}"
        update_validation_result "$session_id" "n8n_patterns" "passed" "$score"
    else
        echo -e "${RED}❌ Found $issues n8n pattern issues${NC}"
        update_validation_result "$session_id" "n8n_patterns" "failed" "$score"
        VALIDATION_PASSED=false
    fi
}

# Security validation
validate_security() {
    local file="$1"
    local session_id="$2"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    echo -e "${YELLOW}🔍 Running security checks...${NC}"
    
    local issues=0
    
    # Check for hardcoded secrets
    if grep -E "(api_key|secret|password|token)\s*=\s*[\"'][^\"']+[\"']" "$file"; then
        echo -e "${RED}  ❌ Possible hardcoded secrets detected${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for console.log with sensitive data
    if grep -E "console\.log.*\b(password|token|secret|key)\b" "$file"; then
        echo -e "${RED}  ❌ Logging potentially sensitive data${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for SQL injection vulnerabilities
    if grep -E "\+.*query|query.*\+" "$file"; then
        echo -e "${YELLOW}  ⚠️  Possible SQL injection vulnerability${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for eval usage
    if grep -E "\beval\s*\(" "$file"; then
        echo -e "${RED}  ❌ Using eval() is dangerous${NC}"
        issues=$((issues + 1))
    fi
    
    # Check for proper URL validation
    if grep -q "customApiCall\|userProvidedUrl" "$file" && ! grep -q "isAllowedUrl\|ALLOWED_DOMAINS" "$file"; then
        echo -e "${RED}  ❌ Missing URL validation (SSRF risk)${NC}"
        issues=$((issues + 1))
    fi
    
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}✅ Security validation passed${NC}"
        update_validation_result "$session_id" "security" "passed" 100
    else
        echo -e "${RED}❌ Found $issues security issues${NC}"
        update_validation_result "$session_id" "security" "failed" $((100 - issues * 20))
        VALIDATION_PASSED=false
    fi
}

# Validate code complexity
validate_complexity() {
    local file="$1"
    local session_id="$2"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    echo -e "${YELLOW}🔍 Checking code complexity...${NC}"
    
    # Count lines
    local total_lines=$(wc -l < "$file")
    local code_lines=$(grep -v "^\s*$\|^\s*//" "$file" | wc -l)
    
    # Count functions
    local function_count=$(grep -E "function\s+\w+|=>\s*{|\w+\s*:\s*function" "$file" | wc -l)
    
    # Estimate cyclomatic complexity (simplified)
    local conditions=$(grep -E "if\s*\(|while\s*\(|for\s*\(|case\s+|catch\s*\(" "$file" | wc -l)
    
    # Calculate metrics
    local avg_function_length=0
    if [ $function_count -gt 0 ]; then
        avg_function_length=$((code_lines / function_count))
    fi
    
    echo "  Total lines: $total_lines"
    echo "  Code lines: $code_lines"
    echo "  Functions: $function_count"
    echo "  Conditions: $conditions"
    echo "  Avg function length: $avg_function_length lines"
    
    # Score based on complexity
    local score=100
    
    # Penalize long functions
    if [ $avg_function_length -gt 50 ]; then
        score=$((score - 20))
        echo -e "${YELLOW}  ⚠️  Functions are too long (avg: $avg_function_length lines)${NC}"
    fi
    
    # Penalize high complexity
    if [ $conditions -gt 20 ]; then
        score=$((score - 15))
        echo -e "${YELLOW}  ⚠️  High cyclomatic complexity (conditions: $conditions)${NC}"
    fi
    
    # Penalize very long files
    if [ $total_lines -gt 500 ]; then
        score=$((score - 10))
        echo -e "${YELLOW}  ⚠️  File is very long ($total_lines lines)${NC}"
    fi
    
    update_validation_result "$session_id" "complexity" "passed" "$score"
    
    if [ $score -lt 60 ]; then
        echo -e "${RED}❌ Code is too complex${NC}"
        VALIDATION_PASSED=false
    else
        echo -e "${GREEN}✅ Complexity is acceptable${NC}"
    fi
}

# Update validation result
update_validation_result() {
    local session_id="$1"
    local check_name="$2"
    local status="$3"
    local score="$4"
    
    local summary_file="$SESSIONS_DIR/$session_id/validation/summary.json"
    
    # Update the check result
    jq ".checks.$check_name = {\"status\": \"$status\", \"score\": $score}" "$summary_file" > tmp.json
    mv tmp.json "$summary_file"
}

# Generate validation report
generate_validation_report() {
    local session_id="$1"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    local summary_file="$validation_dir/summary.json"
    
    echo -e "\n${YELLOW}📊 Validation Report${NC}"
    echo "===================="
    
    # Calculate overall score
    local total_score=0
    local check_count=0
    
    while read -r check; do
        local check_name=$(echo "$check" | jq -r '.key')
        local check_status=$(echo "$check" | jq -r '.value.status')
        local check_score=$(echo "$check" | jq -r '.value.score')
        
        total_score=$((total_score + check_score))
        check_count=$((check_count + 1))
        
        if [ "$check_status" = "passed" ]; then
            echo -e "  ${GREEN}✅ $check_name: $check_score/100${NC}"
        else
            echo -e "  ${RED}❌ $check_name: $check_score/100${NC}"
        fi
    done < <(jq -c '.checks | to_entries[]' "$summary_file")
    
    # Calculate average score
    local avg_score=0
    if [ $check_count -gt 0 ]; then
        avg_score=$((total_score / check_count))
    fi
    
    echo -e "\n${YELLOW}Overall Score: $avg_score/100${NC}"
    
    # Update summary with final results
    jq ".passed = $VALIDATION_PASSED | .score = $avg_score" "$summary_file" > tmp.json
    mv tmp.json "$summary_file"
    
    # Generate detailed HTML report
    generate_html_report "$session_id" "$avg_score"
    
    if [ "$VALIDATION_PASSED" = true ]; then
        echo -e "\n${GREEN}🎉 All validations passed!${NC}"
        return 0
    else
        echo -e "\n${RED}❌ Validation failed. Please fix the issues above.${NC}"
        return 1
    fi
}

# Generate HTML report
generate_html_report() {
    local session_id="$1"
    local score="$2"
    local report_file="$SESSIONS_DIR/$session_id/validation/report.html"
    
    cat > "$report_file" <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>CodeLoop Validation Report - $session_id</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 10px; border-radius: 5px; }
        .score { font-size: 24px; font-weight: bold; }
        .passed { color: green; }
        .failed { color: red; }
        .section { margin: 20px 0; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CodeLoop Validation Report</h1>
        <p>Session: $session_id</p>
        <p>Generated: $(date)</p>
        <p class="score">Score: <span class="$([ $score -ge 80 ] && echo passed || echo failed)">$score/100</span></p>
    </div>
    
    <div class="section">
        <h2>Validation Results</h2>
        <pre>$(jq . "$SESSIONS_DIR/$session_id/validation/summary.json")</pre>
    </div>
    
    <div class="section">
        <h2>TypeScript Output</h2>
        <pre>$(cat "$SESSIONS_DIR/$session_id/validation/typescript.log" 2>/dev/null || echo "No TypeScript errors")</pre>
    </div>
    
    <div class="section">
        <h2>ESLint Output</h2>
        <pre>$(jq . "$SESSIONS_DIR/$session_id/validation/eslint.json" 2>/dev/null || echo "No ESLint output")</pre>
    </div>
</body>
</html>
EOF
    
    echo -e "${GREEN}📄 HTML report generated: $report_file${NC}"
}

# Main validation function
validate_code() {
    local file="$1"
    local session_id="$2"
    
    echo -e "${YELLOW}🚀 Starting code validation for session $session_id${NC}"
    echo "============================================="
    
    # Initialize validation
    init_validation "$session_id"
    
    # Reset global validation state
    VALIDATION_PASSED=true
    
    # Run all validations
    validate_typescript "$file" "$session_id"
    validate_eslint "$file" "$session_id"
    validate_n8n_patterns "$file" "$session_id"
    validate_security "$file" "$session_id"
    validate_complexity "$file" "$session_id"
    
    # Generate report
    generate_validation_report "$session_id"
    
    return $?
}

# Validate phase output (for Actor, Critic, Improve)
validate_phase_output() {
    local phase="$1"
    local session_id="${SESSION_ID:-unknown}"
    local response_file="$SESSIONS_DIR/$session_id/$phase-response.md"
    
    echo -e "\n${YELLOW}🔍 Validating $phase output...${NC}"
    
    case "$phase" in
        "actor")
            # Extract code from actor response
            local temp_file=$(mktemp --suffix=.ts)
            sed -n '/```typescript/,/```/p' "$response_file" | sed '1d;$d' > "$temp_file"
            
            if [ -s "$temp_file" ]; then
                validate_code "$temp_file" "$session_id"
            else
                echo -e "${RED}❌ No TypeScript code found in actor response${NC}"
            fi
            rm "$temp_file"
            ;;
            
        "critic")
            # Validate critic found issues
            if ! grep -q "Crítico\|Recomendado\|Sugestões" "$response_file"; then
                echo -e "${YELLOW}⚠️  Critic didn't identify any issues${NC}"
            else
                echo -e "${GREEN}✅ Critic provided feedback${NC}"
            fi
            ;;
            
        "improve")
            # Extract improved code
            local temp_file=$(mktemp --suffix=.ts)
            sed -n '/```typescript/,/```/p' "$response_file" | sed '1d;$d' > "$temp_file"
            
            if [ -s "$temp_file" ]; then
                echo "Running validation on improved code..."
                validate_code "$temp_file" "$session_id"
                
                # Compare with original actor code
                echo -e "\n${YELLOW}📊 Improvement Analysis${NC}"
                compare_code_quality "$session_id"
            fi
            rm "$temp_file"
            ;;
    esac
}

# Compare code quality between phases
compare_code_quality() {
    local session_id="$1"
    local validation_dir="$SESSIONS_DIR/$session_id/validation"
    
    # This would compare metrics between actor and improve phases
    echo "  Comparing code quality improvements..."
    
    # Placeholder for actual comparison logic
    echo "  [Comparison results would go here]"
}

# Export functions for use in main script
export -f validate_code
export -f validate_phase_output
export -f init_validation
export -f generate_validation_report