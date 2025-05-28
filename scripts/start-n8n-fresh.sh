#!/bin/bash

echo "🔄 INICIANDO N8N SEM CACHE"
echo "=========================="
echo

# Configurar n8n para NÃO usar cache
export N8N_PACKAGE_CACHE_TIME="0"        # Desabilitar cache de pacotes
export N8N_NODE_TYPE_CACHE_SIZE="0"      # Desabilitar cache de tipos
export N8N_SKIP_WEBHOOK_DEREGISTRATION="false"

# Configurações para reload fresco
export NODE_ENV="development"
export N8N_LOG_LEVEL="info"

echo "⚙️  Configurações aplicadas:"
echo "   - Cache de pacotes: DESABILITADO"
echo "   - Cache de tipos: DESABILITADO"
echo "   - Modo: Desenvolvimento"
echo

echo "🚀 Iniciando n8n..."
echo "   URL: http://localhost:5678"
echo "   Para parar: Ctrl+C"
echo

# Iniciar com configurações de desenvolvimento
n8n start