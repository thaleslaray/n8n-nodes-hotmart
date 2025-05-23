# RFC-009.2: Implementação de CI/CD com GitHub Actions

**Status**: Proposto  
**Data**: 22/05/2025  
**Autor**: Thales Laray  
**RFC Pai**: RFC-009  
**Dependência**: RFC-009.1 (Testes devem estar implementados)

## Resumo

Sub-RFC focada na implementação de pipelines CI/CD usando GitHub Actions para automatizar testes, build e publicação do nó Hotmart.

## Contexto

Com os testes implementados (RFC-009.1), precisamos garantir que sejam executados automaticamente em cada push/PR, além de automatizar o processo de build e release.

## Implementação Detalhada

### Passo 1: Criar Estrutura de Workflows

```bash
mkdir -p .github/workflows
```

### Passo 2: Workflow de Testes

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ master, develop, 'feature/**' ]
  pull_request:
    branches: [ master ]
    types: [ opened, synchronize, reopened ]

jobs:
  test:
    name: Test Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}

    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10.10.0

    - name: Get pnpm store directory
      id: pnpm-cache
      shell: bash
      run: |
        echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

    - name: Setup pnpm cache
      uses: actions/cache@v3
      with:
        path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: |
          ${{ runner.os }}-pnpm-store-

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run linter
      run: pnpm lint

    - name: Run type check
      run: pnpm typecheck

    - name: Run tests
      run: pnpm test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: true

    - name: Comment PR with coverage
      if: github.event_name == 'pull_request'
      uses: romeovs/lcov-reporter-action@v0.3.1
      with:
        lcov-file: ./coverage/lcov.info
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Passo 3: Workflow de Build

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    name: Build and Validate
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'

    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10.10.0

    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.pnpm-store
        key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: |
          ${{ runner.os }}-pnpm-

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Clean previous build
      run: pnpm clean

    - name: Build project
      run: pnpm build

    - name: Verify build output
      run: |
        echo "📁 Checking build output..."
        test -f dist/nodes/Hotmart/Hotmart.node.js || exit 1
        test -f dist/nodes/Hotmart/HotmartTrigger.node.js || exit 1
        test -f dist/credentials/HotmartOAuth2Api.credentials.js || exit 1
        echo "✅ Build verification passed!"

    - name: Create package
      run: pnpm pack

    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-artifacts
        path: |
          dist/
          n8n-nodes-hotmart-*.tgz
        retention-days: 7
```

### Passo 4: Workflow de Release

```yaml
# .github/workflows/release.yml
name: Release

on:
  release:
    types: [created]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., 0.5.0)'
        required: true
        type: string

permissions:
  contents: write
  packages: write

jobs:
  release:
    name: Build and Publish
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      with:
        token: ${{ secrets.GITHUB_TOKEN }}

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'
        registry-url: 'https://registry.npmjs.org'

    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10.10.0

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run tests
      run: pnpm test

    - name: Build project
      run: |
        pnpm clean
        pnpm build

    - name: Update version
      if: github.event_name == 'workflow_dispatch'
      run: |
        npm version ${{ github.event.inputs.version }} --no-git-tag-version
        git config user.name github-actions
        git config user.email github-actions@github.com
        git add package.json
        git commit -m "chore: bump version to ${{ github.event.inputs.version }}"
        git push

    - name: Create package
      run: pnpm pack

    - name: Publish to NPM
      run: npm publish --access public
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

    - name: Upload Release Assets
      if: github.event_name == 'release'
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ github.event.release.upload_url }}
        asset_path: ./n8n-nodes-hotmart-*.tgz
        asset_name: n8n-nodes-hotmart-${{ github.event.release.tag_name }}.tgz
        asset_content_type: application/gzip

    - name: Update CHANGELOG
      run: |
        echo "📝 Release ${{ github.event.release.tag_name }} published!" >> release-notes.txt
        echo "NPM: https://www.npmjs.com/package/n8n-nodes-hotmart" >> release-notes.txt
```

### Passo 5: Workflow de Qualidade de Código

```yaml
# .github/workflows/code-quality.yml
name: Code Quality

on:
  pull_request:
    branches: [ master, develop ]

jobs:
  quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'

    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10.10.0

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Check code formatting
      run: |
        pnpm format:check || (echo "❌ Code formatting issues found. Run 'pnpm format' to fix." && exit 1)

    - name: Run ESLint
      run: pnpm lint

    - name: Check for TypeScript errors
      run: pnpm typecheck

    - name: Check bundle size
      run: |
        pnpm pack
        SIZE=$(stat -f%z n8n-nodes-hotmart-*.tgz 2>/dev/null || stat -c%s n8n-nodes-hotmart-*.tgz)
        echo "📦 Package size: $((SIZE / 1024)) KB"
        if [ $SIZE -gt 5242880 ]; then
          echo "❌ Package too large (>5MB)"
          exit 1
        fi

    - name: Security audit
      run: pnpm audit --production
      continue-on-error: true
```

### Passo 6: Workflow de Dependências

```yaml
# .github/workflows/dependencies.yml
name: Dependencies

on:
  schedule:
    - cron: '0 0 * * 1' # Every Monday
  workflow_dispatch:

jobs:
  update:
    name: Update Dependencies
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'

    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 10.10.0

    - name: Update dependencies
      run: |
        pnpm update --interactive=false
        pnpm audit fix

    - name: Run tests
      run: pnpm test

    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v5
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        commit-message: 'chore: update dependencies'
        title: 'chore: update dependencies'
        body: |
          ## 📦 Dependency Updates
          
          This PR updates the project dependencies to their latest versions.
          
          ### Checklist
          - [ ] All tests passing
          - [ ] No breaking changes
          - [ ] Security vulnerabilities fixed
        branch: chore/update-dependencies
        delete-branch: true
```

### Passo 7: Configurar Secrets do GitHub

```bash
# No repositório GitHub, vá para Settings > Secrets and variables > Actions

# Adicionar os seguintes secrets:
# - NPM_TOKEN: Token de autenticação do NPM
# - CODECOV_TOKEN: Token do Codecov (opcional, mas recomendado)
```

### Passo 8: Badges para o README

```markdown
<!-- Adicionar ao topo do README.md -->
![Tests](https://github.com/thaleslaray/n8n-nodes-hotmart/workflows/Tests/badge.svg)
![Build](https://github.com/thaleslaray/n8n-nodes-hotmart/workflows/Build/badge.svg)
![Coverage](https://codecov.io/gh/thaleslaray/n8n-nodes-hotmart/branch/master/graph/badge.svg)
![npm](https://img.shields.io/npm/v/n8n-nodes-hotmart)
![License](https://img.shields.io/npm/l/n8n-nodes-hotmart)
![Downloads](https://img.shields.io/npm/dm/n8n-nodes-hotmart)
```

### Passo 9: Script de Configuração Local

```bash
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
  fi
done

echo "
📋 Next steps:
1. Add NPM_TOKEN to GitHub Secrets
2. Sign up for Codecov and add CODECOV_TOKEN
3. Push workflows to repository
4. Create a test PR to verify workflows
"
```

### Passo 10: Atualizar package.json

```json
{
  "scripts": {
    "lint": "eslint nodes credentials --ext .ts",
    "lint:fix": "eslint nodes credentials --ext .ts --fix",
    "format": "prettier --write '**/*.{js,ts,json,md}'",
    "format:check": "prettier --check '**/*.{js,ts,json,md}'",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "prepare": "husky install"
  }
}
```

### Cronograma de Implementação

| Dia | Tarefas |
|-----|---------|
| 1 | Criar workflows de test e build |
| 2 | Configurar secrets e Codecov |
| 3 | Implementar workflow de release |
| 4 | Adicionar workflows de qualidade |
| 5 | Testar todos os workflows |

### Métricas de Sucesso

- [ ] Todos os workflows criados
- [ ] Testes rodando em cada PR
- [ ] Build automático funcionando
- [ ] Release automatizado para NPM
- [ ] Badges funcionando no README

### Benefícios

1. **Qualidade**: Código quebrado não entra na master
2. **Automação**: Zero trabalho manual para releases
3. **Visibilidade**: Badges mostram saúde do projeto
4. **Confiança**: Verificação em múltiplas versões Node

### Próximos Passos

Após conclusão desta RFC, prosseguir para RFC-009.3 (JSDoc).