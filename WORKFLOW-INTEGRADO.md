# 🚀 Workflow Integrado: CodeLoops + Task Master

## 📋 Setup Inicial (fazer uma vez)

```bash
# 1. Instalar Task Master
npm install -g task-master-ai

# 2. Inicializar no projeto
task-master init

# 3. Importar seu PRD
task-master parse-prd docs/prd/PRD-melhorado.md

# 4. Criar diretório CodeLoops
mkdir -p .codeloops
```

## 🔄 Workflow Diário

### 1️⃣ **Começar o Dia**
```bash
# Ver tarefas pendentes
task-master list

# Sincronizar conhecimento
./scripts/integrate-codeloops-taskmaster.sh
# Escolha opção 1 (Sincronizar)
```

### 2️⃣ **Pegar uma Tarefa**
```bash
# Ver próxima tarefa
task-master next

# Ou executar o script
./scripts/integrate-codeloops-taskmaster.sh
# Escolha opção 2 (Executar próxima)
```

### 3️⃣ **Implementar com CodeLoops**

O script gera um prompt em `.codeloops/execution-prompt.txt`. Use assim:

**No Claude/Cursor:**
```
[Cole o conteúdo de .codeloops/execution-prompt.txt]

Por favor, implemente mantendo consistência com os padrões do projeto.
Use o conhecimento em .codeloops/project-context.md
```

### 4️⃣ **Revisar com Critic**
```bash
# Após implementar, revisar
./scripts/integrate-codeloops-taskmaster.sh
# Escolha opção 4 (Revisar)
```

**No Claude/Cursor:**
```
[Cole o conteúdo de .codeloops/critic-prompt.txt]

Revise minha implementação e sugira melhorias.
```

### 5️⃣ **Marcar como Concluída**
```bash
# Atualizar status
task-master update [TASK_ID] --status done

# Ou via script
./scripts/integrate-codeloops-taskmaster.sh
# Escolha opção 5
```

## 🎯 Exemplo Prático

### Cenário: Implementar novo endpoint de relatórios

```bash
# 1. Task Master cria a tarefa
task-master add "Implementar endpoint de relatórios de vendas"

# 2. Script prepara contexto para CodeLoops
./scripts/integrate-codeloops-taskmaster.sh
# Opção 1: Sincronizar
# Opção 3: Executar tarefa específica

# 3. CodeLoops mantém padrões
# O prompt gerado incluirá:
# - Estrutura similar a getHistoricoVendas.operation.ts
# - Padrões de autenticação do projeto
# - Estrutura de testes esperada

# 4. Implementar no Cursor/Claude
# Cole o prompt e desenvolva

# 5. Critic revisa
# Opção 4 do script gera prompt de revisão

# 6. Marcar concluída
task-master update TASK_ID --status done
```

## 💾 O que o CodeLoops "Lembra"

1. **Estrutura de Arquivos**
   ```
   nodes/Hotmart/v1/actions/[recurso]/[operacao].operation.ts
   ```

2. **Padrões de Código**
   ```typescript
   export const execute: INodeExecuteFunctions = async (...) => {
     // Sempre segue este padrão
   }
   ```

3. **Decisões Anteriores**
   - Usar hotmartApiRequest para chamadas
   - Sempre incluir paginação quando aplicável
   - Estrutura de testes específica

## 🔧 Customizações

### Adicionar Nova Fonte de Conhecimento
Edite `codeloops-config.json`:
```json
"knowledge_sources": [
  // ... existing
  "docs/new-important-doc.md"
]
```

### Criar Novo Tipo de Revisão
Adicione em `integrate-codeloops-taskmaster.sh`:
```bash
review_security() {
    cat > .codeloops/security-review.txt << EOF
Revise aspectos de segurança:
- Autenticação adequada
- Validação de inputs
- Sem exposição de dados sensíveis
EOF
}
```

## 📊 Benefícios da Integração

1. **Task Master** = Organização e tracking
2. **CodeLoops** = Memória e consistência
3. **Juntos** = Produtividade máxima com qualidade

## 🚨 Dicas Importantes

- Sempre sincronize antes de começar tarefas grandes
- Use o Critic após cada implementação significativa
- Mantenha os arquivos de contexto atualizados
- Commite regularmente para não perder progresso