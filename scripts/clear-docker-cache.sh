#!/bin/bash

echo "🐳 LIMPEZA DE CACHE N8N DOCKER"
echo "=============================="
echo

# Detectar container n8n
N8N_CONTAINER=$(docker ps --format "table {{.Names}}" | grep -i n8n | head -n1)

if [[ -z "$N8N_CONTAINER" ]]; then
    echo "❌ Container n8n não encontrado"
    echo "📋 Containers disponíveis:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
    exit 1
fi

echo "✅ Container encontrado: $N8N_CONTAINER"
echo

# Opções de limpeza
echo "🧹 Escolha o método de limpeza:"
echo "1) Reiniciar container (recomendado)"
echo "2) Limpar cache dentro do container"
echo "3) Remover e recriar container"
echo "4) Limpar apenas community nodes"
echo

read -p "Opção (1-4): " choice

case $choice in
    1)
        echo "🔄 Reiniciando container..."
        docker restart "$N8N_CONTAINER"
        echo "✅ Container reiniciado!"
        ;;
    2)
        echo "🧹 Limpando cache dentro do container..."
        docker exec "$N8N_CONTAINER" rm -rf /home/node/.n8n/nodes 2>/dev/null || true
        docker exec "$N8N_CONTAINER" rm -rf /home/node/.n8n/node_modules 2>/dev/null || true
        docker exec "$N8N_CONTAINER" rm -rf /home/node/.n8n/.npm 2>/dev/null || true
        docker restart "$N8N_CONTAINER"
        echo "✅ Cache limpo e container reiniciado!"
        ;;
    3)
        echo "⚠️  ATENÇÃO: Isso vai remover TODOS os dados do n8n!"
        read -p "Tem certeza? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            echo "🗑️  Removendo container..."
            docker stop "$N8N_CONTAINER"
            docker rm "$N8N_CONTAINER"
            echo "🔄 Recrie o container via EasyAdmin"
        else
            echo "❌ Operação cancelada"
        fi
        ;;
    4)
        echo "📦 Removendo apenas community nodes..."
        docker exec "$N8N_CONTAINER" rm -rf /home/node/.n8n/nodes 2>/dev/null || true
        docker restart "$N8N_CONTAINER"
        echo "✅ Community nodes removidos!"
        ;;
    *)
        echo "❌ Opção inválida"
        ;;
esac

echo
echo "🌐 Para acessar n8n:"
echo "   http://localhost:5678 (ou porta configurada no EasyAdmin)"