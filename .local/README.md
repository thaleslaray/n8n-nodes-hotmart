# Diretório .local/

Este diretório contém arquivos de desenvolvimento local que **não são versionados** no Git.

## Estrutura

```
.local/
├── archive/     # Documentação antiga e releases .tgz anteriores
├── backups/     # Backups automáticos e manuais do projeto
├── bin/         # Scripts executáveis organizados
│   ├── test/    # Scripts de teste (test-full, test-unit, etc.)
│   └── utils/   # Utilitários (clean, validate, etc.)
├── coverage/    # Relatórios de cobertura de testes (gerado pelo Jest)
├── docs/        # Documentação detalhada, diários, RFCs, PRDs
├── logs/        # Logs de desenvolvimento e debug
├── scripts/     # Scripts de automação local
│   ├── test-automation/  # Scripts de teste automatizado
│   └── old/             # Scripts antigos/legados
└── temp/        # Arquivos temporários
```

## Por que .local/?

1. **Separação clara**: Mantém o repositório limpo, com apenas código essencial
2. **Privacidade**: Scripts e documentos pessoais não vão para o GitHub
3. **Organização**: Facilita navegação e foco no código principal
4. **Performance**: Git não precisa rastrear arquivos temporários grandes

## Scripts de Conveniência

O diretório raiz mantém apenas 3 scripts executáveis principais:
- `install` - Instala o projeto
- `test` - Roda testes básicos
- `test-full` - Redireciona para `.local/bin/test/test-full`

Todos os outros scripts executáveis estão em `.local/bin/`.

## Configuração Inicial

Se você clonou o repositório e precisa dos scripts de teste locais:

```bash
./scripts/setup-local-tests.sh
```

Isso restaurará os scripts de automação de um backup.

## Importante

- Este diretório está no `.gitignore`
- Faça backup regularmente se tiver scripts importantes aqui
- Use `./backup` no diretório raiz para criar backups completos