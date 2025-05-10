# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Comandos Comuns

### Instalação e Build

# Compilar e instalar no diretório de nós personalizados do n8n
./build-and-install.sh

## Arquitetura do Projeto

O projeto segue uma arquitetura modular para integrar a API Hotmart com o n8n:

1. **Estrutura de Diretórios:**
   ```
   n8n-nodes-hotmart/
      credentials/
         HotmartOAuth2Api.credentials.ts     # Autenticação OAuth2
      nodes/
         Hotmart/
            Hotmart.node.json               # Definição do nó
            Hotmart.node.ts                 # Ponto de entrada do nó
            hotmart.svg                     # Logo do Hotmart
            v1/
               HotmartV1.node.ts           # Implementação da versão 1
               actions/                    # Recursos e operações
                  club/                   # Área de membros
                  coupon/                 # Cupons
                  product/                # Produtos
                  sales/                  # Vendas
                  subscription/           # Assinaturas
                  tickets/                # Ingressos
               methods/                    # Métodos auxiliares
               transport/                  # Comunicação com a API
               helpers/                    # Funções úteis
   ```

2. **Fluxo de Execução:**
   - `Hotmart.node.ts` define a entrada do nó
   - `HotmartV1.node.ts` implementa a versão 1 da API
   - `router.ts` direciona para o recurso e operação específicos
   - Cada recurso (ex: subscription) contém operações (ex: getAll, cancel)
   - A camada de transporte gerencia as requisições HTTP e autenticação

3. **Sistema de Paginação:**
   - Helper `pagination.ts` implementa busca automática de múltiplas páginas
   - Parâmetro "Retornar Todos os Resultados" ativa paginação automática

4. **Autenticação:**
   - Usa OAuth2 com client credentials
   - Implementa refresh token automático
   - Suporta ambientes de produção e sandbox

5. **Prevenção de Custom API Call:**
   - Mecanismo especial implementado em versionDescription.ts e router.ts
   - Cria deliberadamente uma discrepância entre version e defaultVersion
   - Filtragem preventiva de tentativas de uso de Custom API Call

## Considerações no Desenvolvimento

1. **Novos Recursos/Operações:**
   - Adicionar ao router.ts
   - Criar pasta do recurso se necessário
   - Implementar operações seguindo o padrão existente
   - Atualizar a descrição da versão

2. **Tratamento de Erros:**
   - Implementar tratamento específico para erros da API Hotmart
   - Respeitar os rate limits com delays entre requisições

3. **Testes:**
   - Verificar o comportamento de paginação para conjuntos grandes de dados

4. **Nomenclatura:**
   - Usar nomes descritivos para funções e variáveis