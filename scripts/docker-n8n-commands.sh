#!/bin/bash

echo "🐳 COMANDOS ÚTEIS N8N DOCKER"
echo "============================"
echo

# Detectar container
N8N_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i n8n | head -n1)

if [[ -z "$N8N_CONTAINER" ]]; then
    echo "❌ Container n8n não encontrado"
    echo "📋 Containers ativos:"
    docker ps --format "table {{.Names}}\t{{.Image}}"
    exit 1
fi

echo "📦 Container: $N8N_CONTAINER"
echo

echo "🔧 Comandos disponíveis:"
echo
echo "1. Ver logs:"
echo "   docker logs $N8N_CONTAINER -f"
echo
echo "2. Acessar shell do container:"
echo "   docker exec -it $N8N_CONTAINER sh"
echo
echo "3. Reiniciar:"
echo "   docker restart $N8N_CONTAINER"
echo
echo "4. Ver community nodes instalados:"
echo "   docker exec $N8N_CONTAINER ls -la /home/node/.n8n/nodes/ 2>/dev/null"
echo
echo "5. Remover community nodes:"
echo "   docker exec $N8N_CONTAINER rm -rf /home/node/.n8n/nodes/"
echo
echo "6. Ver variáveis de ambiente:"
echo "   docker exec $N8N_CONTAINER env | grep N8N"
echo
echo "7. Forçar reload sem cache:"
echo "   docker exec $N8N_CONTAINER sh -c 'N8N_PACKAGE_CACHE_TIME=0 n8n start'"
echo

# Executar comando se fornecido
if [[ $# -gt 0 ]]; then
    echo "🚀 Executando: $*"
    "$@"
fi