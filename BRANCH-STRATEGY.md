# 🌳 Estratégia de Branches - n8n-nodes-hotmart

## 📋 Branches e suas funções:

### 1. `main` (produção)
- Código limpo, sem modificações de debug
- Versão para releases oficiais
- SEM headers de validação
- SEM console.logs extras

### 2. `feat/codeloop-100-percent` (desenvolvimento)
- Possui todas as features em desenvolvimento
- Pode ter código de debug temporário
- Base para novos desenvolvimentos

### 3. `debug/routing-validation` (validação de roteamento)
- Branch específico com headers de debug
- Usado APENAS para validar roteamento
- Contém modificações do HotmartTrigger com headers
- NÃO deve ser mergeado no main

## 🔄 Workflow de desenvolvimento:

### Para desenvolvimento normal:
```bash
git checkout main
git pull origin main
git checkout -b feat/nova-feature
# ... desenvolver ...
# ... testar ...
git push origin feat/nova-feature
# Criar PR para main
```

### Para validar roteamento:
```bash
# Mudar para branch de debug
git checkout debug/routing-validation

# Compilar versão de debug
pnpm build
./install

# Testar com headers
# ... validar roteamento ...

# Voltar para desenvolvimento
git checkout feat/codeloop-100-percent
```

### Para release de produção:
```bash
# Garantir que está no main
git checkout main
git pull origin main

# Verificar que NÃO tem headers de debug
./scripts/validate-modifications.sh

# Se tiver headers, remover:
git checkout nodes/Hotmart/HotmartTrigger.node.ts

# Compilar versão limpa
pnpm build
pnpm pack

# Criar release
npm version patch
git push origin main --tags
```

## ⚠️ IMPORTANTE:

1. **NUNCA** fazer merge do branch `debug/routing-validation` no `main`
2. **SEMPRE** verificar com `./scripts/validate-modifications.sh` antes de release
3. **Headers de debug** são APENAS para desenvolvimento/teste

## 🛡️ Proteções:

### Script pre-release:
```bash
#!/bin/bash
# Adicionar ao package.json scripts

if grep -q "X-Output-Index" nodes/Hotmart/HotmartTrigger.node.ts; then
    echo "❌ ERRO: Headers de debug detectados!"
    echo "Remova os headers antes do release."
    exit 1
fi
```

## 📝 Comandos úteis:

### Ver diferenças entre branches:
```bash
git diff main..debug/routing-validation -- nodes/Hotmart/HotmartTrigger.node.ts
```

### Criar branch de debug a partir do atual:
```bash
git checkout -b debug/routing-validation
git add nodes/Hotmart/HotmartTrigger.node.ts
git commit -m "debug: adicionar headers de validação de roteamento"
```

### Verificar qual versão está instalada:
```bash
# No n8n, verificar se aparecem headers na resposta
curl -i -X POST "URL_WEBHOOK" -d '{"event":"PURCHASE_APPROVED"...}'
# Se aparecer X-Output-Index = versão debug
# Se não aparecer = versão produção
```