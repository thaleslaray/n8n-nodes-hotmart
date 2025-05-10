# Monitorando Logs Detalhados do Nó Hotmart

Este documento explica como configurar e monitorar logs detalhados para o nó Hotmart no n8n, capturando requisições HTTP completas e respostas para depuração.

## Iniciando o n8n com Logs Detalhados

Para obter logs detalhados incluindo requisições e respostas HTTP completas:

1. Pare a instância n8n atual:
```bash
pkill -f n8n
```

2. Inicie o n8n com nível de log detalhado e redirecionamento:
```bash
N8N_LOG_LEVEL=verbose N8N_LOG_OUTPUT=console n8n start > hotmart-debug.log 2>&1 &
```

3. Monitore os logs em tempo real:
```bash
tail -f hotmart-debug.log | grep -A 20 -B 5 "Hotmart API"
```

## Configuração de Depuração Temporária

Se você estiver usando o script build-and-install.sh, pode modificar temporariamente a linha final do script para capturar logs em um arquivo:

De:
```bash
N8N_LOG_LEVEL=debug n8n start &
```

Para:
```bash
N8N_LOG_LEVEL=verbose N8N_LOG_OUTPUT=console n8n start > ~/hotmart-debug.log 2>&1 &
```

## Encontrando Logs nos Recursos da Hotmart

Os logs detalhados mostrarão informações como:

```
[Hotmart API Request]
URL: https://developers.hotmart.com/payments/api/v1/subscriptions/transactions
Method: GET
Query Parameters: {
  "max_results": 1
}

[Hotmart API Response]
Status: 200
Headers: {
  "content-type": "application/json",
  ...
}
Response: {
  "items": [
    ...
  ],
  "page_info": {
    ...
  }
}
```

## Depurando Recursos Específicos

Para focar em recursos específicos da API Hotmart, adicione filtros mais granulares:

- Para assinaturas:
```bash
tail -f hotmart-debug.log | grep -A 20 -B 5 "subscriptions"
```

- Para vendas:
```bash
tail -f hotmart-debug.log | grep -A 20 -B 5 "sales"
```

- Para um período específico:
```bash
tail -f hotmart-debug.log | grep -A 20 -B 5 -E "$(date +"%H:%M")"
```

## Reiniciando o n8n Normalmente

Após concluir a depuração, volte ao modo normal:

```bash
pkill -f n8n
n8n start &
```

Ou use o script build-and-install.sh sem modificações.