## 📋 Descrição

<!-- Descreva suas mudanças em detalhes -->
<!-- Por que esta mudança é necessária? Qual problema ela resolve? -->

## 🔗 Issue Relacionada

<!-- Vincule a issue que este PR resolve -->
Fixes #(número da issue)

## 💡 Tipo de Mudança

<!-- Marque com "x" o tipo de mudança -->

- [ ] 🐛 Correção de bug (mudança que corrige um problema)
- [ ] ✨ Nova funcionalidade (mudança que adiciona uma funcionalidade)
- [ ] 💥 Breaking change (mudança que quebraria funcionalidade existente)
- [ ] 📚 Documentação (mudanças apenas na documentação)
- [ ] 🔧 Refatoração (mudança que não adiciona funcionalidade nem corrige bug)
- [ ] ⚡ Performance (mudança que melhora performance)
- [ ] 🧪 Testes (adição ou correção de testes)
- [ ] 🏗️ Build/CI (mudanças no build ou CI/CD)

## 📸 Screenshots

<!-- Se aplicável, adicione screenshots para demonstrar as mudanças -->
<!-- Especialmente importante para mudanças visuais -->

## 🧪 Como Testar

<!-- Descreva os passos para testar suas mudanças -->

1. Configure as credenciais Hotmart OAuth2
2. Crie um novo workflow
3. Adicione o nó Hotmart
4. ...

## ✅ Checklist

<!-- Marque com "x" os itens concluídos -->

### Código
- [ ] Meu código segue os padrões de estilo do projeto
- [ ] Fiz self-review do meu código
- [ ] Comentei partes complexas do código (se necessário)
- [ ] Minhas mudanças não geram novos warnings
- [ ] Não há `console.log` ou código de debug

### Testes
- [ ] Adicionei testes que provam que minha correção/feature funciona
- [ ] Testes novos e existentes passam localmente (`pnpm test`)
- [ ] A cobertura de testes não diminuiu (verificar com `pnpm test:coverage`)

### Documentação
- [ ] Atualizei a documentação (se necessário)
- [ ] Atualizei o CHANGELOG.md (se aplicável)
- [ ] Adicionei/atualizei comentários JSDoc nas funções públicas

### Qualidade
- [ ] Lint passa sem erros (`pnpm lint`)
- [ ] TypeScript compila sem erros (`pnpm typecheck`)
- [ ] Build funciona corretamente (`pnpm build`)

### Compatibilidade
- [ ] Mudanças são retrocompatíveis
- [ ] Se há breaking changes, estão claramente documentadas
- [ ] Testei em diferentes versões do n8n (se aplicável)

## 💬 Notas Adicionais

<!-- Informações adicionais que os revisores devem saber -->
<!-- Decisões de design, trade-offs considerados, etc. -->

## 🔄 Dependências

<!-- Este PR depende de outros PRs? -->
<!-- Precisa ser mergeado em alguma ordem específica? -->

---

### Para o Revisor

<!-- Não preencha esta seção -->

- [ ] Código está claro e bem estruturado
- [ ] Testes cobrem os casos principais
- [ ] Documentação está adequada
- [ ] Não há breaking changes não intencionais
- [ ] Performance foi considerada
- [ ] Segurança foi verificada