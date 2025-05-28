# 📁 Executáveis Locais

Este diretório contém todos os scripts executáveis organizados por categoria.

## 📋 Estrutura

```
.local/bin/
├── test/           # Scripts de teste
│   ├── test-full   # Teste completo (unitários + webhooks)
│   ├── test-unit   # Apenas testes unitários
│   ├── test-webhooks # Apenas testes de webhook
│   └── test-validate # Validação de campos
└── utils/          # Utilitários
    ├── clean       # Limpa cache e build
    ├── clean-workspace # Organiza arquivos do workspace
    └── validate    # Validação geral
```

## 🚀 Como Usar

### Da raiz do projeto:
```bash
# Executar teste completo (atalho disponível)
./test-full

# Executar diretamente
./.local/bin/test/test-full

# Limpar workspace
./.local/bin/utils/clean-workspace
```

### Atalhos Disponíveis na Raiz:
- `./install` - Instalação do projeto
- `./test` - Teste padrão
- `./test-full` - Teste completo (aponta para .local/bin/test/test-full)

## 💡 Por que esta estrutura?

1. **Raiz limpa** - Apenas scripts essenciais na raiz
2. **Organização** - Scripts agrupados por função
3. **Não versionado** - .local/ está no .gitignore
4. **Fácil manutenção** - Tudo em um só lugar