# 🛡️ Guia do Sistema de Backup

Sistema de backup automático para proteger o projeto n8n-hotmart contra perda de dados.

## 🚀 Scripts Disponíveis

### Scripts de Conveniência (Diretório Raiz)

```bash
./backup                    # Backup completo
./restore [nome_backup]     # Restaurar backup
./install                   # Instalar com backup automático
./clear                     # Limpar com backup automático
```

### Scripts Completos (Pasta scripts/)

### 1. `scripts/backup.sh` - Backup Completo

```bash
./scripts/backup.sh
# ou usando conveniência:
./backup
```

- **Uso**: Backup completo com timestamp
- **Exclusões**: node_modules, dist, .git, logs, \*.tgz
- **Mantém**: Últimos 10 backups
- **Compressão**: tar.gz
- **Tempo**: ~5-10 segundos

### 2. `scripts/quick-backup.sh` - Backup Rápido

```bash
./scripts/quick-backup.sh [mensagem]
./scripts/quick-backup.sh "antes_de_alterar_x"
```

- **Uso**: Backup rápido de emergência
- **Mais rápido**: Apenas arquivos essenciais
- **Mensagem**: Personaliza o nome do backup

### 3. `scripts/auto-backup.sh` - Backup Inteligente

```bash
./scripts/auto-backup.sh
```

- **Uso**: Verifica se precisa de backup
- **Inteligente**: Só faz backup se houve mudanças
- **Tempo**: Verifica último backup (5 min)
- **Git**: Detecta mudanças não commitadas

### 4. `scripts/restore.sh` - Restauração

```bash
./scripts/restore.sh [nome_do_backup]
# ou usando conveniência:
./restore [nome_do_backup]
```

- **Uso**: Restaura backup específico
- **Segurança**: Cria backup atual antes de restaurar
- **Preserva**: node_modules, dist, .git
- **Confirmação**: Pede confirmação antes de restaurar

## 🔄 Integração Automática

### Scripts que fazem backup automático:

- **`./install`** ou **`scripts/install.sh`** - Backup antes de instalar
- **`./clear`** ou **`scripts/clear.sh`** - Backup antes de limpar

### Como funciona:

1. **Antes de operações arriscadas** → backup automático
2. **Detecção de mudanças** → backup inteligente
3. **Preservação de diretórios importantes** → restauração segura

## 📋 Exemplos de Uso

### Backup antes de alterar código:

```bash
./scripts/quick-backup.sh "antes_implementar_mcp"
# ... fazer alterações ...
# Se der problema:
./restore quick_antes_implementar_mcp_20250522_143022
```

### Backup manual quando necessário:

```bash
./backup  # Backup completo manual
```

### Verificar backups disponíveis:

```bash
ls -la backups/backup_*.tar.gz
# ou
./restore  # mostra lista de backups
```

## 📁 Estrutura de Backups

```
backups/
├── backup_20250522_140530.tar.gz     # Backup completo
├── backup_20250522_141022.tar.gz     # Backup completo
├── quick_antes_implementar_20250522_143022.tar.gz  # Backup rápido
├── quick_before_clear_20250522_144015.tar.gz       # Backup automático
└── safety_backup_20250522_144530.tar.gz            # Backup de segurança
```

### Nomenclatura:

- **`backup_YYYYMMDD_HHMMSS.tar.gz`** - Backup completo
- **`quick_[mensagem]_YYYYMMDD_HHMMSS.tar.gz`** - Backup rápido
- **`safety_backup_YYYYMMDD_HHMMSS.tar.gz`** - Backup de segurança (antes de restore)

## ⚙️ Configurações

### Alterar número de backups mantidos:

```bash
# Editar scripts/backup.sh
MAX_BACKUPS=1000  # Manter 1000 backups ao invés de 500
```

### Alterar exclusões:

```bash
# Editar EXCLUDE_DIRS nos scripts
EXCLUDE_DIRS=(
    "node_modules"
    "dist"
    "backups"
    ".git"
    "logs/*.log"
    "debugging/*.log"
    "*.tgz"
    "temp"
    "tmp"
    "minha_pasta_exclusao"  # Adicionar nova exclusão
)
```

## 🚨 Emergência - Como Recuperar

### Se você perdeu arquivos:

1. **Liste backups disponíveis:**

```bash
ls -la backups/
```

2. **Restaure o backup mais recente:**

```bash
./restore.sh backup_20250522_140530
```

3. **Se o script de restore não funcionar:**

```bash
cd backups
tar -xzf backup_20250522_140530.tar.gz -C /tmp/restore
cp -r /tmp/restore/* /caminho/do/projeto/
```

### Se você não tem os scripts de backup:

```bash
# Criar backup manual de emergência
tar -czf emergency_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    .
```

## 🔧 Troubleshooting

### Backup falha:

- Verificar espaço em disco: `df -h`
- Verificar permissões: `ls -la`
- Executar com debug: `bash -x ./backup.sh`

### Restore falha:

- Verificar se backup existe: `ls -la backups/`
- Verificar integridade: `tar -tzf backups/backup.tar.gz`
- Restaurar manualmente conforme exemplo acima

### Scripts não executam:

```bash
chmod +x *.sh
```

## 💡 Dicas de Uso

1. **Sempre faça backup antes de**:

   - Implementar funcionalidades complexas
   - Fazer refactoring grande
   - Executar scripts de limpeza
   - Atualizar dependências

2. **Use quick-backup para**:

   - Testes rápidos
   - Backup antes de mudanças pequenas
   - Backup de emergência

3. **Use backup completo para**:

   - Backup diário/semanal
   - Antes de releases
   - Marcos importantes do projeto

4. **Monitore o espaço**:
   - Backups ocupam espaço (mantidos automaticamente apenas os últimos 500)
   - Sistema limpa backups antigos automaticamente
   - Cada backup ~320KB (muito leve - 500 backups = ~160MB)

## 🎯 Boas Práticas

- ✅ Sempre teste o restore em ambiente separado primeiro
- ✅ Mantenha backups em local externo também (git, cloud)
- ✅ Documente mudanças importantes nos nomes dos backups
- ✅ Verifique integridade dos backups periodicamente
- ⚠️ Nunca confie apenas nos backups locais
- ⚠️ Teste os scripts de restore regularmente
