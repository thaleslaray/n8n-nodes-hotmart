#!/bin/bash

# 🎯 Debug específico para Webhooks

echo "🎯 DEBUG FOCADO EM WEBHOOKS"

# Logs focados
export LOG_LEVEL=debug
export N8N_LOG_LEVEL=debug
export DEBUG=n8n:webhook*,n8n:node*

# Salvar logs de webhook
export N8N_WEBHOOK_LOG_FILE=~/.n8n/logs/webhook-debug.log

# Iniciar com filtro
echo "📝 Logs serão salvos em: ~/.n8n/logs/webhook-debug.log"
echo ""

n8n start 2>&1 | tee ~/.n8n/logs/webhook-debug.log | grep -E "(webhook|Webhook|WEBHOOK|Hotmart|trigger)" --color=always