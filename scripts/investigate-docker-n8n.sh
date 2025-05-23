#!/bin/bash

echo "🔍 INVESTIGAÇÃO N8N DOCKER (SEM DELETAR NADA)"
echo "=============================================="
echo

echo "📋 1. CONTAINERS ATIVOS:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo

echo "📋 2. CONTAINERS COM 'n8n' NO NOME:"
docker ps -a | grep -i n8n || echo "   Nenhum container com 'n8n' encontrado"
echo

echo "📋 3. VOLUMES DOCKER:"
docker volume ls | grep -E "(n8n|easyadmin)" || echo "   Nenhum volume com 'n8n' ou 'easyadmin' encontrado"
echo

echo "📋 4. REDES DOCKER:"
docker network ls | grep -E "(n8n|easyadmin)" || echo "   Nenhuma rede específica encontrada"
echo

# Se encontrar container n8n, investigar mais
N8N_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i n8n | head -n1)

if [[ -n "$N8N_CONTAINER" ]]; then
    echo "🎯 CONTAINER N8N ENCONTRADO: $N8N_CONTAINER"
    echo "============================================"
    echo
    
    echo "📊 Informações do container:"
    docker inspect "$N8N_CONTAINER" --format "{{.Config.Image}}" | sed 's/^/   Imagem: /'
    docker inspect "$N8N_CONTAINER" --format "{{.State.Status}}" | sed 's/^/   Status: /'
    docker inspect "$N8N_CONTAINER" --format "{{.RestartCount}}" | sed 's/^/   Restarts: /'
    echo
    
    echo "🗂️  Volumes montados:"
    docker inspect "$N8N_CONTAINER" --format "{{range .Mounts}}{{.Type}}: {{.Source}} -> {{.Destination}}{{println}}{{end}}" | sed 's/^/   /'
    echo
    
    echo "🌐 Portas expostas:"
    docker port "$N8N_CONTAINER" 2>/dev/null | sed 's/^/   /' || echo "   Nenhuma porta exposta"
    echo
    
    echo "📦 Community nodes (se existirem):"
    docker exec "$N8N_CONTAINER" ls -la /home/node/.n8n/nodes/ 2>/dev/null | sed 's/^/   /' || echo "   Diretório nodes/ não existe ou vazio"
    echo
    
    echo "🔧 Variáveis de ambiente N8N:"
    docker exec "$N8N_CONTAINER" env 2>/dev/null | grep -E "^N8N_|^DB_" | sed 's/^/   /' || echo "   Nenhuma variável N8N encontrada"
    echo
    
    echo "💾 Uso de espaço dentro do container:"
    docker exec "$N8N_CONTAINER" du -sh /home/node/.n8n 2>/dev/null | sed 's/^/   Total .n8n: /' || echo "   Não foi possível verificar espaço"
    docker exec "$N8N_CONTAINER" du -sh /home/node/.n8n/nodes 2>/dev/null | sed 's/^/   Community nodes: /' || echo "   Diretório nodes/ não existe"
    echo
else
    echo "❌ NENHUM CONTAINER N8N ATIVO ENCONTRADO"
    echo
    echo "💡 Possíveis causas:"
    echo "   - Container parado"
    echo "   - Nome diferente (não contém 'n8n')"
    echo "   - Container gerenciado pelo EasyAdmin com nome diferente"
    echo
    echo "📋 Todos os containers (incluindo parados):"
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
fi

echo
echo "🛡️  INVESTIGAÇÃO CONCLUÍDA - NADA FOI ALTERADO"
echo "Para próximos passos seguros, informe qual container é o n8n"