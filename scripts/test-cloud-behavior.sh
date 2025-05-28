#!/bin/bash

# Script para simular comportamento do n8n Cloud localmente

echo "🌥️ SIMULANDO COMPORTAMENTO N8N CLOUD"
echo "====================================="
echo

# Configurações que simulam n8n Cloud
export N8N_DISABLE_UI="false"
export N8N_TEMPLATES_ENABLED="true"
export N8N_COMMUNITY_PACKAGES_ENABLED="true"
export N8N_PACKAGE_CACHE_TIME="3600"
export N8N_NODE_TYPE_CACHE_SIZE="1000"

# Simular cache mais agressivo (como n8n Cloud)
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🔧 Configurações aplicadas:"
echo "   - Community packages habilitados"
echo "   - Cache agressivo simulado"
echo "   - Templates habilitados"
echo

echo "🚀 Iniciando n8n com configuração similar ao Cloud..."
echo "   URL: http://localhost:5678"
echo "   Para parar: Ctrl+C"
echo

# Iniciar n8n com configuração similar ao Cloud
n8n start