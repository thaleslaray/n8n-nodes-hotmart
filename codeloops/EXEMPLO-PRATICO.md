# 🎯 Exemplo Prático: Implementar Endpoint de Cupons

## 1️⃣ Iniciar CodeLoop
```bash
./codeloops/codeloop.sh
# Escolha: 1 (Nova sessão completa)
# Tarefa: "Implementar endpoint para listar cupons de um produto"
```

## 2️⃣ Actor Gera Código
O script cria `sessions/[timestamp]/actor-prompt.md`

**No Claude:**
1. Copie o conteúdo do prompt
2. Claude gera o código seguindo padrões
3. Salve como `generated-code.ts` na pasta da sessão

## 3️⃣ Critic Revisa
O script cria `sessions/[timestamp]/critic-prompt.md`

**No Claude:**
1. Copie o prompt de revisão
2. Claude analisa e encontra problemas
3. Salve feedback como `feedback.md`

**Exemplo de feedback:**
```markdown
### 🚨 Crítico
- Faltou implementar paginação com getAllItems
- Tipos any em vez de interface específica

### ⚠️ Recomendado
- Adicionar tratamento para produtos sem cupons
- Melhorar mensagens de erro

### ✅ Bem Feito
- Estrutura segue padrão do projeto
- Usa hotmartApiRequest corretamente
```

## 4️⃣ Actor Melhora
O script cria `sessions/[timestamp]/improve-prompt.md`

**No Claude:**
1. Copie o prompt de melhoria
2. Claude corrige todos os problemas
3. Salve como `improved-code.ts`

## 5️⃣ Atualizar Memória
Script pergunta o que aprender:

**Novo padrão descoberto:**
"Endpoint de cupons requer productId como query param, não path param"

**Erro a evitar:**
"API Hotmart retorna 404 para produtos sem cupons - tratar como array vazio"

## 📁 Resultado Final
```
sessions/20250123_143022/
├── actor-prompt.md      # Prompt inicial
├── generated-code.ts    # Primeira versão
├── critic-prompt.md     # Prompt de revisão
├── feedback.md          # Problemas encontrados
├── improve-prompt.md    # Prompt de melhoria
└── improved-code.ts     # Versão final melhorada
```

## 🧠 Memória Atualizada
```markdown
# patterns.md
## 2025-01-23 - Sessão 20250123_143022
Endpoint de cupons requer productId como query param

# mistakes.md  
## 2025-01-23 - Sessão 20250123_143022
API retorna 404 para produtos sem cupons - tratar como array vazio
```

## ✨ Próxima Vez
Quando implementar outro endpoint, o Actor já saberá:
- Usar query params para IDs em cupons
- Tratar 404 como caso válido
- Sempre implementar paginação