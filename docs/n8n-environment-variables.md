# 🔧 Variáveis de Ambiente do n8n

## 🎨 Interface e UI
```bash
N8N_DISABLE_UI="false"              # Habilita/desabilita interface web
N8N_HOST="localhost"                # Host do servidor
N8N_PORT="5678"                     # Porta do servidor
N8N_PROTOCOL="http"                 # Protocolo (http/https)
```

## 📦 Community Nodes
```bash
N8N_COMMUNITY_PACKAGES_ENABLED="true"    # Permite instalar community nodes
N8N_PACKAGE_CACHE_TIME="3600"            # Cache de pacotes (segundos)
N8N_NODE_TYPE_CACHE_SIZE="1000"          # Tamanho do cache de tipos de nó
```

## 🔐 Segurança
```bash
N8N_BASIC_AUTH_ACTIVE="false"       # Autenticação básica
N8N_BASIC_AUTH_USER=""              # Usuário da auth básica
N8N_BASIC_AUTH_PASSWORD=""          # Senha da auth básica
```

## 🗄️ Banco de Dados
```bash
DB_TYPE="sqlite"                    # Tipo: sqlite, mysql, postgres
DB_SQLITE_DATABASE="database.sqlite" # Arquivo SQLite
N8N_USER_FOLDER="~/.n8n"           # Pasta de dados do usuário
```

## 📝 Logs
```bash
N8N_LOG_LEVEL="info"                # Nível: error, warn, info, verbose, debug
LOG_LEVEL="info"                    # Alias para N8N_LOG_LEVEL
N8N_LOG_OUTPUT="console"            # Saída: console, file
```

## ⚡ Performance
```bash
N8N_PAYLOAD_SIZE_MAX="16"           # Tamanho máximo payload (MB)
EXECUTIONS_DATA_PRUNE="true"        # Limpar execuções antigas
EXECUTIONS_DATA_MAX_AGE="336"       # Idade máxima execuções (horas)
```

## 🌐 Templates e Features
```bash
N8N_TEMPLATES_ENABLED="true"        # Habilita templates da comunidade
N8N_ONBOARDING_FLOW_DISABLED="false" # Desabilita onboarding
N8N_DIAGNOSTICS_ENABLED="true"      # Habilita diagnósticos
```

## 🔄 Webhooks
```bash
WEBHOOK_URL="http://localhost:5678" # URL base para webhooks
N8N_WEBHOOK_TIMEOUT="120000"        # Timeout webhooks (ms)
```

## 📊 Métricas
```bash
N8N_METRICS="false"                 # Habilita métricas Prometheus
N8N_METRICS_PORT="9464"             # Porta das métricas
```

## 🚀 Execução
```bash
EXECUTIONS_PROCESS="main"           # Processo: main, own
N8N_SKIP_WEBHOOK_DEREGISTRATION="false" # Manter webhooks ao parar
```

## 🛡️ Permissões
```bash
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS="true" # Forçar permissões 600
N8N_RUNNERS_ENABLED="true"          # Habilitar task runners
```

## 💡 Exemplos Práticos

### Desenvolvimento Local:
```bash
export N8N_LOG_LEVEL="debug"
export N8N_COMMUNITY_PACKAGES_ENABLED="true"
export N8N_TEMPLATES_ENABLED="true"
n8n start
```

### Produção (Headless):
```bash
export N8N_DISABLE_UI="true"
export N8N_LOG_LEVEL="warn"
export N8N_BASIC_AUTH_ACTIVE="true"
export N8N_BASIC_AUTH_USER="admin"
export N8N_BASIC_AUTH_PASSWORD="secretpass"
n8n start
```

### Debug Intenso:
```bash
export N8N_LOG_LEVEL="debug"
export LOG_LEVEL="debug"
export N8N_LOG_OUTPUT="console"
n8n start
```

### Performance Otimizada:
```bash
export N8N_PAYLOAD_SIZE_MAX="32"
export EXECUTIONS_DATA_PRUNE="true"
export EXECUTIONS_DATA_MAX_AGE="168"  # 1 semana
export N8N_NODE_TYPE_CACHE_SIZE="2000"
n8n start
```