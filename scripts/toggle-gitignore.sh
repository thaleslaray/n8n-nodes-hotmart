#!/bin/bash

# Script para alternar entre .gitignore público e privado

if [ "$1" = "public" ]; then
    echo "🔄 Mudando para .gitignore público..."
    cp .gitignore.public .gitignore
    echo "✅ Agora usando .gitignore público (seguro para compartilhar)"
elif [ "$1" = "private" ]; then
    echo "🔄 Mudando para .gitignore privado..."
    cp .gitignore.private .gitignore
    echo "✅ Agora usando .gitignore privado (com suas exclusões pessoais)"
else
    echo "Uso: $0 [public|private]"
    echo ""
    echo "  public  - Usa .gitignore público (para compartilhar)"
    echo "  private - Usa .gitignore privado (desenvolvimento local)"
    exit 1
fi