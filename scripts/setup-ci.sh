#!/bin/bash
# scripts/setup-ci.sh

echo "🚀 Setting up CI/CD..."

# Check if .github/workflows exists
if [ ! -d ".github/workflows" ]; then
  mkdir -p .github/workflows
  echo "✅ Created .github/workflows directory"
fi

# Check for required scripts in package.json
REQUIRED_SCRIPTS=("lint" "format" "format:check" "typecheck" "test" "test:coverage")

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if ! grep -q "\"$script\":" package.json; then
    echo "❌ Missing script: $script"
    echo "Please add it to package.json"
  else
    echo "✅ Script found: $script"
  fi
done

echo "
📋 Next steps:
1. Add NPM_TOKEN to GitHub Secrets
2. Sign up for Codecov and add CODECOV_TOKEN
3. Push workflows to repository
4. Create a test PR to verify workflows
"