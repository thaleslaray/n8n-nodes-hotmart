# 🚀 Workflow para Múltiplas Implementações

## 🎯 Estratégia: Worktrees Especializados

Cada worktree tem um **propósito específico** e **contexto isolado**.

### 📁 Estrutura Recomendada

```
~/code/projetos/
├── n8n-hotmart/                 # 🏠 MAIN (estável, releases)
├── n8n-hotmart-webhook-fix/     # 🐛 Bug do enum 0
├── n8n-hotmart-test-system/     # 🧪 Sistema de testes
├── n8n-hotmart-rfc-implementation/ # 📋 RFCs sequenciais
├── n8n-hotmart-experiments/     # 🔬 CodeLoops, Task Master
└── n8n-hotmart-hotfix/          # 🚨 Emergências
```

## 🔄 Workflow Diário

### **Manhã: Planejamento**
```bash
# 1. Atualizar main
cd ~/code/projetos/n8n-hotmart
git pull origin master

# 2. Sincronizar worktrees importantes
cd ~/code/projetos/n8n-hotmart-webhook-fix
git merge master  # Ou rebase se preferir

cd ~/code/projetos/n8n-hotmart-rfc-implementation  
git merge master
```

### **Durante o Dia: Contexto Focado**

#### 🐛 **Correção de Bug**
```bash
cd ~/code/projetos/n8n-hotmart-webhook-fix
# Foco total no bug do enum 0
# CodeLoops aqui para manter consistência
```

#### 🧪 **Desenvolvimento de Testes**
```bash
cd ~/code/projetos/n8n-hotmart-test-system
# Trabalha nos 626 eventos
# Sistema de anonimização
```

#### 📋 **Implementação de RFC**
```bash
cd ~/code/projetos/n8n-hotmart-rfc-implementation
# Task Master aqui para gerenciar RFCs
# Implementação sequencial
```

#### 🔬 **Experimentos**
```bash
cd ~/code/projetos/n8n-hotmart-experiments
# Testa CodeLoops + Task Master
# Prototipa novas ideias
```

### **Final do Dia: Integração**
```bash
# Cada worktree commita quando estável
cd ~/code/projetos/n8n-hotmart-webhook-fix
git add . && git commit -m "fix: corrige enum 0 em webhook"

# Main sempre puxa o que está pronto
cd ~/code/projetos/n8n-hotmart
git merge webhook-fix  # Se estiver pronto
```

## ⚡ **Vantagens Desta Estratégia**

### 1. **Contexto Isolado**
- Cada worktree tem seu próprio estado de arquivos
- node_modules independentes
- Configurações específicas

### 2. **Desenvolvimento Paralelo Real**
```bash
# Terminal 1: Bug crítico
cd n8n-hotmart-webhook-fix && npm test

# Terminal 2: Continua RFCs  
cd n8n-hotmart-rfc-implementation && ./codeloops/codeloop.sh

# Terminal 3: Testa em produção
cd n8n-hotmart && npm run build
```

### 3. **Zero Conflitos de Contexto**
- Não precisa fazer stash/unstash
- Não perde trabalho em progresso
- Cada contexto mantém seu estado

### 4. **Comparação Fácil**
```bash
# Ver diferenças entre implementações
diff -r n8n-hotmart/ n8n-hotmart-webhook-fix/

# Ou usar VSCode
code --diff n8n-hotmart/file.ts n8n-hotmart-webhook-fix/file.ts
```

## 🎛️ **Comandos Essenciais**

### **Criar novo worktree**
```bash
git worktree add ../n8n-hotmart-nova-feature nova-feature
```

### **Listar worktrees**
```bash
git worktree list
```

### **Remover worktree**
```bash
git worktree remove ../n8n-hotmart-feature
git branch -d feature  # Remove branch também
```

### **Sincronizar entre worktrees**
```bash
# Em qualquer worktree
git fetch origin
git merge master  # Ou rebase
```

## 🔥 **Situações Específicas**

### **Bug Urgente no Meio de Development**
```bash
# Não interrompe trabalho atual
cd ~/code/projetos/n8n-hotmart-hotfix
git checkout -b hotfix-critical
# Faz hotfix...
git push origin hotfix-critical

# Continua trabalhando no outro contexto
cd ~/code/projetos/n8n-hotmart-rfc-implementation
# Trabalho não foi afetado!
```

### **Testar Features Juntas**
```bash
# Criar worktree para integração
git worktree add ../n8n-hotmart-integration integration
cd ../n8n-hotmart-integration

# Merge de várias features
git merge webhook-fix
git merge test-system  
git merge rfc-implementation

# Testar integração
npm test
```

### **Demo para Cliente**
```bash
# Main sempre estável para demos
cd ~/code/projetos/n8n-hotmart
npm run build
npm start

# Development continua em paralelo nos outros worktrees
```

## 📊 **Comparação: Antes vs Depois**

### **Antes (branches tradicionais):**
```bash
git stash                    # 😰 Pode perder código
git checkout hotfix         # 🔄 Troca contexto
# faz hotfix...
git checkout feature        # 🔄 Volta
git stash pop               # 😰 Pode dar conflito
```

### **Depois (worktrees):**
```bash
# Terminal 1: continua feature
cd feature-worktree && code .

# Terminal 2: hotfix paralelo  
cd hotfix-worktree && code .

# Zero interrupção! 🚀
```

## 🎯 **Decisão Final**

Para seu projeto n8n-hotmart, recomendo:

1. **Use worktrees** para desenvolvimento paralelo
2. **Cada contexto** tem seu próprio diretório
3. **Main sempre estável** para releases
4. **Integração planejada** no final de cada sprint

Execute o script para começar:
```bash
./scripts/setup-worktrees.sh
```