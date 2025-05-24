# 🧠 CodeLoops Implementation para n8n-hotmart

## Estrutura do Sistema

```
codeloops/
├── prompts/
│   ├── actor.md         # Prompt para gerar código
│   ├── critic.md        # Prompt para revisar
│   └── improve.md       # Prompt para melhorar
├── memory/
│   ├── patterns.md      # Padrões aprendidos
│   ├── mistakes.md      # Erros para evitar
│   └── decisions.md     # Decisões arquiteturais
└── sessions/
    └── [data]/          # Sessões de trabalho
```

## Como Usar

### 1. Gerar Código (Actor)
```bash
# Use o prompt actor.md com sua tarefa
claude --file codeloops/prompts/actor.md
```

### 2. Revisar (Critic)
```bash
# Use o prompt critic.md com o código gerado
claude --file codeloops/prompts/critic.md --file [código-gerado]
```

### 3. Melhorar (Actor + Feedback)
```bash
# Use o prompt improve.md com código + feedback
claude --file codeloops/prompts/improve.md
```

### 4. Salvar Aprendizado
Adicione insights importantes em `memory/`