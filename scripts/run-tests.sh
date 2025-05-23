#!/bin/bash
# scripts/run-tests.sh

echo "🧪 Running Hotmart Node Tests..."

# Clean coverage directory
rm -rf coverage

# Run tests with coverage
pnpm test:coverage

# Check coverage thresholds
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
  echo "📊 Coverage report: coverage/lcov-report/index.html"
else
  echo "❌ Tests failed. Please fix before committing."
  exit 1
fi