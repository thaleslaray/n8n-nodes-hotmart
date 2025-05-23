# CLAUDE.md

Este arquivo fornece orientações para o Claude Code (claude.ai/code) ao trabalhar com o código neste repositório.

## Comandos Comuns

### Instalação e Compilação

```bash
# Instalar dependências
pnpm install

# Limpar os arquivos compilados anteriormente
pnpm clean

# Compilar o projeto (usando Gulp para automatização)
pnpm build

# Tarefas individuais do Gulp
gulp clean         # Limpa arquivos .js/.js.map/.d.ts
gulp build:icons   # Copia ícones para dist/

# Compilar o projeto em modo watch (desenvolvimento)
# Nota: Este comando não é usado neste projeto
```

### Instalação para Teste

```bash
# Desenvolvimento (continue usando pnpm)
pnpm install
pnpm build
pnpm pack

# Instalação no n8n (use npm - necessário para n8n 1.94.0+)
npm install --prefix ~/.n8n/nodes ./n8n-nodes-hotmart-0.4.7.tgz
```

Ou pode usar o script de instalação fornecido:

```bash
./install
```

O script automatiza todo o processo de desenvolvimento e instalação:

- Cria backup automático antes de instalar
- Instala dependências com pnpm
- Compila o projeto
- Cria o pacote (.tgz)
- Instala no n8n usando npm

### Por Que pnpm para Desenvolvimento e npm para Instalação?

- **pnpm**: Mais eficiente para desenvolvimento, gerenciamento de dependências
- **npm**: Necessário para instalação no n8n devido a mudanças na descoberta de nós na versão 1.94.0+
- **n8n 1.94.0+**: Só reconhece nós instalados com estrutura "flat" do npm, não symlinks do pnpm

**Importante**: Não tentamos mais desinstalar via pnpm no ~/.n8n pois não há package.json lá.

### Sistema de Backup Automático

O projeto inclui um sistema completo de backup para proteger contra perda de dados:

```bash
# Scripts de conveniência (diretório raiz)
./backup                                         # Backup completo
./restore backup_20250522_144604                 # Restaurar backup
./install                                        # Instalar com backup automático
./clear                                          # Limpar com backup automático

# Scripts completos (pasta scripts/)
./scripts/backup.sh                              # Backup completo
./scripts/quick-backup.sh "antes_de_alteracao"   # Backup rápido de emergência
./scripts/auto-backup.sh                         # Backup inteligente
./scripts/restore.sh backup_20250522_144604      # Restaurar backup
```

**Integração Automática:**

- `./install` - Cria backup antes de instalar
- `./clear` - Cria backup antes de limpar
- Scripts detectam mudanças e fazem backup quando necessário

**Ver guia completo:** `BACKUP-GUIDE.md`

### Publicação Automatizada no NPM

O projeto inclui scripts para publicar no NPM sem precisar fazer login no browser:

```bash
# Configurar token NPM (uma vez só)
./scripts/setup-npm-token.sh

# Publicar automaticamente
./publish                    # Script de conveniência
./scripts/publish.sh         # Script completo

# Depois da configuração, npm publish também funciona automaticamente
npm publish
```

**Processo automatizado:**

- Backup automático antes da publicação
- Compilação automática do projeto
- Verificação de autenticação
- Publicação sem login no browser
- Limpeza de arquivos temporários

### Iniciar o n8n

```bash
# Método recomendado (sem warnings chatos)
./start-n8n

# Debug ultra detalhado para desenvolvimento
./debug-n8n

# Ou usando os scripts completos
./scripts/start-n8n.sh
LOG_LEVEL=verbose N8N_LOG_LEVEL=debug n8n start
```

### Reiniciar o n8n após alterações

```bash
# Parar n8n
pkill -f n8n

# Iniciar sem warnings
./start-n8n
```

### Correções Automáticas Aplicadas

O sistema automaticamente resolve os warnings comuns do n8n:

- **✅ Permissões do arquivo config** - corrigidas automaticamente (600)
- **✅ Task runners habilitados** - configuração futura do n8n
- **✅ Variáveis de ambiente** - arquivo .env criado em ~/.n8n/.env
- **✅ Logs otimizados** - level info para produção

## Estrutura do Código

O pacote `n8n-nodes-hotmart` segue uma arquitetura modular para integração com a API Hotmart:

### Estrutura de Diretórios

```
n8n-nodes-hotmart/
   credentials/
      HotmartOAuth2Api.credentials.ts    # Autenticação OAuth2
   nodes/
      Hotmart/
         Hotmart.node.json               # Definição do nó
         Hotmart.node.ts                 # Ponto de entrada do nó
         hotmart.svg                     # Logo do Hotmart
         HotmartTrigger.node.json        # Definição do nó trigger
         HotmartTrigger.node.ts          # Implementação do nó trigger
         v1/
            HotmartV1.node.ts            # Implementação da versão 1
            actions/                     # Recursos e operações
               club/                     # Área de membros
               coupon/                   # Cupons
               product/                  # Produtos
               sales/                    # Vendas
               subscription/             # Assinaturas
               tickets/                  # Ingressos
               negotiate/                # Negociação
               router.ts                 # Roteador de ações
               versionDescription.ts     # Descrições das versões
            helpers/                     # Funções auxiliares
               dateUtils.ts              # Utilidades para datas
               outputFormatter.ts        # Formatação de resultados
               pagination.ts             # Paginação automática
            methods/                     # Métodos adicionais
               loadOptions.ts            # Carregamento de opções dinâmicas
            transport/                   # Comunicação HTTP
               request.ts                # Cliente HTTP
```

### Componentes Principais

1. **Hotmart.node.ts**: Classe principal que utiliza o sistema de versionamento do n8n
2. **HotmartV1.node.ts**: Implementação específica da versão 1 da API
3. **HotmartTrigger.node.ts**: Nó de trigger para receber webhooks da Hotmart
4. **router.ts**: Roteia as chamadas para os recursos e operações apropriados
5. **transport/request.ts**: Gerencia comunicação HTTP com a API da Hotmart

## Funcionamento do Nó Hotmart

O nó Hotmart permite interagir com a API Hotmart para acessar e gerenciar diversos recursos da plataforma:

1. **Assinaturas**: Gerenciamento de assinaturas, cancelamentos, renovações
2. **Vendas**: Histórico de vendas, comissões, detalhamento de preços
3. **Produtos**: Obtenção de produtos disponíveis
4. **Cupons**: Criação, leitura e remoção de cupons de desconto
5. **Club (Área de Membros)**: Dados de alunos, módulos, progresso
6. **Ingressos**: Informações de eventos e participantes
7. **Negotiate**: Geração de negociações para pagamentos

## Funcionamento do HotmartTrigger

O HotmartTrigger é um nó webhook que recebe eventos da Hotmart e os processa de três formas distintas:

1. **Modo Padrão**: Recebe eventos específicos ou todos os eventos em uma saída única
2. **Modo Smart**: Separa automaticamente cada tipo de evento em saídas distintas
3. **Modo Super Smart**: Separa compras únicas, novas assinaturas e renovações, permitindo fluxos personalizados para cada caso

### Tipos de Eventos Suportados

- Eventos de Compra: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_CANCELED`, etc.
- Eventos de Pagamento: `PURCHASE_BILLET_PRINTED` (Boleto e PIX)
- Eventos de Assinatura: `SUBSCRIPTION_CANCELLATION`, `SWITCH_PLAN`, etc.
- Eventos de Área de Membros: `CLUB_FIRST_ACCESS`, `CLUB_MODULE_COMPLETED`

## Boas Práticas de Desenvolvimento

1. **Adição de Novas Operações**:

   - Criar um arquivo de operação em `nodes/Hotmart/v1/actions/[resource]/[operation].operation.ts`
   - Atualizar o arquivo de recurso em `[resource].resource.ts`
   - Atualizar a descrição da versão em `versionDescription.ts`

2. **Ícones**:

   - Garantir que o ícone `hotmart.svg` seja copiado para todos os diretórios necessários
   - O sistema de build usa Gulp (`gulp build:icons`) para copiar automaticamente todos os ícones

3. **Paginação**:

   - Usar o helper de paginação para operações que retornam múltiplos resultados
   - Implementar a opção de retornar todos os resultados (`returnAll`)

4. **Tratamento de Erros**:

   - Seguir o padrão de tratamento de erros da API Hotmart
   - Fornecer mensagens de erro claras e específicas

5. **Formatação de Saída**:
   - Usar `outputFormatter.ts` para formatar as saídas de forma consistente

## Fluxo de Execução de Requisições

1. **Autenticação**: Obtenção de token OAuth2 usando credenciais de cliente
2. **Roteamento**: Identificação do recurso e operação através do router
3. **Execução**: Chamada à operação específica com os parâmetros fornecidos
4. **Paginação**: Processamento de paginação automática quando necessário
5. **Formatação**: Formatação da resposta no formato esperado pelo n8n
