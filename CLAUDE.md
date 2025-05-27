# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 Sistema 404 MCP - Instruções OBRIGATÓRIAS

**⚠️ REGRA #1: SEMPRE USE actor_think COMO PRIMEIRO COMANDO!**

Este projeto usa o **404 MCP** para análise contínua de código através de ferramentas MCP.

### 1. 🎯 PRIMEIRO COMANDO SEMPRE: actor_think

**ANTES DE QUALQUER COISA**, use actor_think para iniciar a sessão:

```javascript
actor_think({
  thought: "Iniciando análise do projeto n8n-hotmart",
  projectContext: "/Users/thaleslaray/code/projetos/n8n-hotmart",
  tags: ["session-start"],
  artifacts: []
})
```

**⚠️ IMPORTANTE:**
- NÃO use actor_think dentro de outras ferramentas (como Task)
- SEMPRE seja o PRIMEIRO comando ao iniciar trabalho
- O erro "undefined" = sessão não existe ou parâmetros incorretos

### ⚠️ ERROS COMUNS QUE CAUSAM "undefined"

❌ **ERRADO**: Usar actor_think dentro de Task ou outras ferramentas
❌ **ERRADO**: Começar com list_projects ou resume antes de actor_think
✅ **CERTO**: SEMPRE começar com actor_think como primeiro comando

### 2. 🎯 Como usar as ferramentas 404 MCP

**Mapeamento de intenções para ferramentas MCP:**

Quando o usuário disser:
- **"Continue o trabalho"** → Use `actor_think` PRIMEIRO, depois `resume`
- **"Vou fazer/criar X"** → Use `actor_think` com thought descrevendo o planejamento
- **"Modifiquei X"** → Use `actor_think` com thought sobre a modificação
- **"Analise segurança"** → Use `actor_think` primeiro, depois `security_scan`
- **"Posso publicar?"** → Use `actor_think` primeiro, depois `pre_publish_check`

**🚨 SEMPRE actor_think PRIMEIRO!**

### 3. 🗺️ Parâmetros corretos para ferramentas MCP

**actor_think** - Ferramenta principal para registrar trabalho:
```
Parâmetros OBRIGATÓRIOS:
- thought: string (descrição do que está fazendo)
- projectContext: "/Users/thaleslaray/code/projetos/n8n-hotmart"
- tags: array com PELO MENOS 1 tag (ex: ["planning"], ["file-modification"], ["task-complete"])
- artifacts: array (pode ser vazio [] ou com arquivos: [{"name": "README", "path": "README.md"}])

ESTRUTURA CORRETA DE ARTIFACTS:
{
  "name": string (nome descritivo),
  "path": string (caminho do arquivo)
}
```

**Outras ferramentas importantes:**
- `list_projects()` - Ver projetos existentes
- `resume(projectContext, limit)` - Ver trabalho anterior
- `security_scan(projectContext, files)` - Análise de segurança
- `analyze_project(projectContext)` - Análise completa

### 4. 🔄 Fluxo de Trabalho Correto

```
1. Usuário diz "continue o trabalho" ou similar
2. IMEDIATAMENTE use actor_think (NÃO use Task, list_projects ou resume primeiro!)
3. actor_think com:
   - thought: descrição clara
   - projectContext: "/Users/thaleslaray/code/projetos/n8n-hotmart" 
   - tags: ["session-start"] ou similar
   - artifacts: []
4. SOMENTE DEPOIS de actor_think funcionar, use outras ferramentas
5. O sistema crítico analisa automaticamente
6. Mostre o feedback do crítico
```

**🚨 ORDEM OBRIGATÓRIA: actor_think → depois outras ferramentas**

### 5. 📝 Exemplo Prático

```
Usuário: "Continue o trabalho anterior"

Você DEVE fazer EXATAMENTE nesta ordem:

1. PRIMEIRO E SEMPRE:
actor_think({
  thought: "Iniciando sessão para continuar trabalho no projeto n8n-hotmart",
  projectContext: "/Users/thaleslaray/code/projetos/n8n-hotmart",
  tags: ["session-start", "continuation"],
  artifacts: []
})

2. SOMENTE DEPOIS que actor_think funcionar:
- Use resume() para ver contexto
- Use outras ferramentas conforme necessário
- NÃO use Task antes de actor_think!

[Implementa código]
[Chama: actor_think "Implementado modelo Product e rotas básicas" --tags file-modification]

O crítico analisou e sugeriu:
- ✅ Estrutura está boa
- ⚠️ Adicionar validação de entrada
- 💡 Considerar paginação para listagem

Vou implementar essas melhorias...
```

### 6. ⚙️ Comandos Essenciais

**Análises Rápidas:**
- `security_scan` - Vulnerabilidades OWASP
- `code_evolution_analysis` - Hotspots e dívida técnica
- `git_workflow_analysis` - Saúde do repositório

**Gestão de Contexto:**
- `save_context` - Antes de pausas
- `load_context` - Ao retomar trabalho
- `autosave_status` - Ver salvamentos automáticos

**Ferramentas de Sessão:**
- `list_projects()` - Ver projetos existentes
- `resume(projectContext, limit)` - Ver histórico de trabalho

### 7. 🚨 Regras Críticas

1. **SEMPRE** use actor_think PRIMEIRO antes de qualquer outra ferramenta
2. **NUNCA** use actor_think dentro de Task ou outras ferramentas
3. **SEMPRE** use projectContext COMPLETO: "/Users/thaleslaray/code/projetos/n8n-hotmart"
4. **NUNCA** omita parâmetros obrigatórios (thought, projectContext, tags, artifacts)
5. **SEMPRE** inclua pelo menos 1 tag no array tags
6. **SEMPRE** mostre feedback do crítico quando disponível
7. **USE PORTUGUÊS** nas mensagens e parâmetros thought

### 8. 🏷️ Tags Importantes

- `planning` - Planejamento inicial
- `file-modification` - Mudanças em arquivos
- `task-complete` - Conclusão de tarefas
- `bugfix` - Correções
- `feature` - Novas funcionalidades
- `refactor` - Refatorações
- `test` - Testes
- `docs` - Documentação

### 9. 💾 Auto-Save Configurado

O sistema salva automaticamente:
- A cada 10 operações
- A cada 5 minutos
- Em operações críticas

Lembre o usuário periodicamente sobre o status com `reminder_status`.

## 📚 n8n-nodes-hotmart - Guia do Desenvolvedor

Este é um projeto de nós personalizados para integrar a API Hotmart com o n8n, incluindo funcionalidades de IA conversacional e compatibilidade com AI Agents.

## 🚀 Instalação

### Script de Instalação Rápida

```bash
./install
```

Este comando faz tudo automaticamente:
- ✅ Cria backup de segurança antes de instalar
- ✅ Instala todas as dependências
- ✅ Compila o projeto
- ✅ Cria o pacote .tgz
- ✅ Instala no n8n

### Detalhes Técnicos

O script `./install` executa internamente:
1. `pnpm install` - Instala dependências de desenvolvimento
2. `pnpm build` - Compila TypeScript e copia assets
3. `pnpm pack` - Cria arquivo .tgz
4. `npm install --prefix ~/.n8n/nodes` - Instala no n8n

> **Por que pnpm + npm?** Usamos pnpm para desenvolvimento (mais eficiente) e npm para instalar no n8n (requisito da versão 1.94.0+)

## 💾 Sistema de Backup

O projeto inclui um sistema completo de backup para proteger contra perda de dados:

### Scripts de Conveniência (diretório raiz)
```bash
./backup                                         # Backup completo
./restore backup_20250522_144604                 # Restaurar backup
./install                                        # Instalar com backup automático
./clear                                          # Limpar com backup automático
```

### Scripts Completos (pasta scripts/)
```bash
./scripts/backup.sh                              # Backup completo
./scripts/quick-backup.sh "antes_de_alteracao"   # Backup rápido de emergência
./scripts/auto-backup.sh                         # Backup inteligente
./scripts/restore.sh backup_20250522_144604      # Restaurar backup
```

### Integração Automática
- `./install` - Cria backup antes de instalar
- `./clear` - Cria backup antes de limpar
- Scripts detectam mudanças e fazem backup quando necessário

> Ver guia completo: BACKUP-GUIDE.md

## 🏃 Execução do n8n

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

- ✅ Permissões do arquivo config - corrigidas automaticamente (600)
- ✅ Task runners habilitados - configuração futura do n8n
- ✅ Variáveis de ambiente - arquivo .env criado em ~/.n8n/.env
- ✅ Logs otimizados - level info para produção

## 🛡️ Prevenção de Quebras - CRÍTICO para Certificação n8n

### Checklist OBRIGATÓRIO antes de qualquer mudança

```bash
# 1. SEMPRE crie um backup antes de começar
./backup

# 2. Crie um branch para a nova feature
git checkout -b feat/nova-funcionalidade

# 3. Rode os testes ANTES de fazer mudanças
pnpm test

# 4. Faça suas alterações

# 5. Rode TODOS os testes novamente
pnpm test
pnpm lint
pnpm typecheck

# 6. Teste manualmente no n8n
./install && ./start-n8n

# 7. Só faça merge se TUDO passar
```

### Regras de Ouro para NÃO Quebrar o Código

1. **NUNCA mude interfaces públicas existentes**
   - Adicione novos parâmetros como opcionais
   - Crie novas operações ao invés de modificar existentes

2. **SEMPRE mantenha retrocompatibilidade**
   ```typescript
   // ❌ ERRADO - quebra fluxos existentes
   async execute(items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
     // mudou completamente o comportamento
   }

   // ✅ CORRETO - mantém compatibilidade
   async execute(items: INodeExecutionData[]): Promise<INodeExecutionData[][]> {
     // adiciona nova funcionalidade sem quebrar a antiga
     if (this.getNodeParameter('newFeature', 0, false)) {
       // novo comportamento
     } else {
       // comportamento antigo preservado
     }
   }
   ```

3. **Use Feature Flags para mudanças grandes**
   ```typescript
   const useNewBehavior = this.getNodeParameter('useNewBehavior', 0, false) as boolean;
   ```

4. **Teste em ambiente isolado primeiro**
   ```bash
   # Criar ambiente de teste isolado
   cp -r ~/.n8n ~/.n8n-test
   N8N_USER_FOLDER=~/.n8n-test ./start-n8n
   ```

### Pipeline de Segurança

```bash
# Script de validação completa
./scripts/validate-changes.sh

# Ou manualmente:
pnpm test:coverage:check  # Garante 80% de cobertura
pnpm lint                 # Sem erros de lint
pnpm typecheck           # Sem erros de tipo
pnpm build               # Compila sem erros
```

### Testes de Regressão

Sempre adicione testes para bugs corrigidos:

```typescript
describe('Regressão: Issue #XXX', () => {
  it('não deve quebrar quando...', () => {
    // teste específico para o bug
  });
});
```

## 🛡️ Desenvolvimento Seguro - Workflow Recomendado

### 1. **SEMPRE Trabalhe em Branches**

```bash
# ❌ NUNCA desenvolva direto no main
# ✅ SEMPRE crie um branch para cada feature/fix
git checkout -b feat/nova-funcionalidade

# Desenvolva, teste, commite
git add .
git commit -m "feat: implementar X"

# Teste EXAUSTIVAMENTE antes do merge
npm test
npm run lint
npm run build
./install && ./start-n8n

# Só então faça merge
git checkout main
git merge feat/nova-funcionalidade
```

### 2. **Crie Tag de Segurança Antes de Desenvolver**

```bash
# Antes de começar desenvolvimento pesado
# Crie uma tag de "último estado estável conhecido"
git tag -a v0.6.4-stable -m "Último estado 100% estável"
git push origin v0.6.4-stable

# Se algo quebrar, você pode voltar
git checkout v0.6.4-stable
```

### 3. **Workflow Seguro Completo**

```bash
# 1. Sempre crie branch do main atualizado
git checkout main
git pull
git checkout -b feat/minha-feature

# 2. Desenvolva com o Guardião ativo
npm run dev

# 3. Teste frequentemente (em outro terminal)
npm test:watch

# 4. Antes de fazer merge, valide TUDO
npm test
npm run lint
npm run typecheck
npm run build
./install  # testa instalação

# 5. Se tudo passar, merge
git checkout main
git merge feat/minha-feature
```

### 4. **Script de Validação Pré-Push**

Crie `scripts/pre-push-check.sh`:

```bash
#!/bin/bash
echo "🔍 Verificando antes do push..."

# 1. Testes
npm test || { echo "❌ Testes falharam"; exit 1; }

# 2. Lint
npm run lint || { echo "❌ Lint falhou"; exit 1; }

# 3. Build
npm run build || { echo "❌ Build falhou"; exit 1; }

# 4. Instalação
./install || { echo "❌ Instalação falhou"; exit 1; }

echo "✅ Tudo OK! Seguro para push"
```

### 5. **Sinais de Alerta - NÃO faça push se:**

- ❌ Algum teste falhar
- ❌ Build quebrar
- ❌ Lint tiver erros
- ❌ Instalação falhar no n8n
- ❌ Guardião reportar problemas

### 6. **Recuperação de Emergência**

```bash
# Se quebrar algo no branch atual
git reset --hard HEAD~1

# Se precisar voltar para estado estável
git checkout v0.6.4-stable
git checkout -b fix/recuperacao

# Se quebrou no main (emergência)
git checkout main
git reset --hard v0.6.4-stable
git push --force-with-lease origin main  # CUIDADO!
```

### 7. **Checklist Antes de Cada Push**

- [ ] Todos os testes passam (`npm test`)
- [ ] Sem erros de lint (`npm run lint`)
- [ ] Build funciona (`npm run build`)
- [ ] Instalação funciona (`./install`)
- [ ] Testado manualmente no n8n
- [ ] Guardião não reportou problemas
- [ ] Branch está atualizado com main

### 8. **Proteções Automáticas do Projeto**

Você já tem estas proteções ativas:
- ✅ **99.47% de cobertura de testes**
- ✅ **Sistema Guardião** monitora mudanças
- ✅ **Hooks de commit** (husky + commitlint)
- ✅ **476+ testes** executados automaticamente
- ✅ **Scripts de backup** automáticos

## 🧪 Testes

### Executar Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar testes em modo watch
pnpm test:watch

# Rodar testes com coverage
pnpm test:coverage

# Rodar apenas testes unitários
pnpm test:unit

# Rodar apenas testes de integração
pnpm test:integration
```

### Verificação de Código

```bash
# Rodar linter
pnpm lint

# Corrigir problemas do linter automaticamente
pnpm lint:fix

# Verificar tipos TypeScript
pnpm typecheck
```

### Estrutura de Testes

- `__tests__/unit/` - Testes unitários
- `__tests__/integration/` - Testes de integração
- `__tests__/fixtures/` - Dados de teste e mocks
- Meta de cobertura: 80%

## 📦 Sistema de Releases

### Semantic Versioning

Usamos versionamento semântico (MAJOR.MINOR.PATCH):
- **MAJOR**: Mudanças incompatíveis com versões anteriores
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

Exemplo: v0.5.2 → v0.6.0 (nova funcionalidade) ou v0.5.3 (correção)

### Tipos de Releases

1. **Releases Estáveis**: Versões testadas para produção (v0.5.2, v1.0.0)
2. **Pre-releases**: Versões de teste
   - **Alpha**: Muito experimental (v0.6.0-alpha.1)
   - **Beta**: Para testers externos (v0.6.0-beta.1)
   - **RC**: Release Candidate, quase final (v0.6.0-rc.1)

### Criando Releases

#### 🚀 Processo Automatizado (RECOMENDADO)

```bash
# Script completo que faz tudo automaticamente
./scripts/release.sh patch  # ou minor/major

# O script:
# ✅ Verifica status do Git
# ✅ Executa todos os testes
# ✅ Verifica lint
# ✅ Cria a release
# ✅ Compila o projeto
# ✅ Cria o pacote .tgz
# ✅ Envia para GitHub
# ✅ Executa validação pós-release
```

#### 📋 Validação Pós-Release

Após cada release, execute automaticamente:

```bash
# Validação completa (já incluída no release.sh)
./scripts/test-automation/post-release-validation.sh

# Valida:
# - Instalação no n8n
# - Testes unitários
# - Cobertura de código
# - 48 testes de webhook (todos os modos)
# - Performance
# - Gera relatório em scripts/test-automation/reports/
```

#### 🛠️ Processo Manual (se necessário)

```bash
# Para release estável
npm version patch  # ou minor/major
git push origin main --tags

# Para pre-release beta
npm version 0.6.0-beta.1
git push origin main --tags

# No GitHub:
# 1. Vá em Releases > Create new release
# 2. Escolha a tag criada
# 3. Para betas, marque "This is a pre-release"
# 4. Anexe o arquivo .tgz compilado
```

### Fluxo de Lançamento SEGURO

1. **Desenvolvimento em branch isolado**
   ```bash
   git checkout -b feat/nova-feature
   ```

2. **Testes exaustivos**
   ```bash
   pnpm test:coverage:check
   pnpm lint && pnpm typecheck
   ```

3. **Beta para validação**
   ```bash
   npm version 0.6.0-beta.1
   git push origin feat/nova-feature --tags
   # Instale e teste por alguns dias
   ```

4. **Validação em produção**
   - Teste em workflows reais
   - Monitore por pelo menos 48h
   - Colete feedback de usuários beta

5. **Release final apenas após validação**
   ```bash
   npm version 0.6.0
   git push origin main --tags
   ```

### ⚠️ NUNCA faça isso:

- ❌ Merge direto no main sem testes
- ❌ Release sem período beta
- ❌ Mudanças que quebram compatibilidade sem major version
- ❌ Remover parâmetros ou mudar tipos existentes
- ❌ Alterar formato de saída sem flag opcional

### Publicação no GitHub Packages (Futuro)

Quando configurado, permitirá instalação direta:
```bash
npm install @thaleslaray/n8n-nodes-hotmart@0.6.0
npm install @thaleslaray/n8n-nodes-hotmart@beta  # última beta
```

## 🚀 Boas Práticas Git

### Workflow Correto para Branches

#### 1. **Sempre trabalhe a partir do main atualizado**
```bash
# Antes de criar qualquer branch novo
git checkout main
git pull origin main
git checkout -b feat/nova-funcionalidade
```

#### 2. **Mantenha seu branch atualizado**
```bash
# Regularmente, atualize com main
git fetch origin
git rebase origin/main
```

#### 3. **Delete branches após merge**
```bash
# Após PR ser mergeado
git checkout main
git pull origin main
git branch -d feat/branch-antigo
```

#### 4. **Limpeza regular**
```bash
# Remover branches remotos que não existem mais
git remote prune origin

# Listar branches que podem ser deletados
git branch --merged | grep -v main

# Deletar branches já mergeados
git branch -d branch1 branch2 branch3
```

#### 5. **Evitar conflitos e divergências**
- Sempre faça pull antes de push
- Use rebase ao invés de merge para histórico limpo
- Nunca force push em branches compartilhados
- Resolva conflitos assim que aparecerem

#### 6. **Nomenclatura de branches**
- `feat/` - novas funcionalidades
- `fix/` - correções de bugs
- `chore/` - tarefas de manutenção
- `docs/` - documentação
- `refactor/` - refatorações

## 📁 Estrutura do Projeto

```
n8n-nodes-hotmart/
├── credentials/
│   └── HotmartOAuth2Api.credentials.ts    # Autenticação OAuth2
├── nodes/
│   └── Hotmart/
│       ├── Hotmart.node.json               # Definição do nó
│       ├── Hotmart.node.ts                 # Ponto de entrada do nó
│       ├── hotmart.svg                     # Logo do Hotmart
│       ├── HotmartTrigger.node.json        # Definição do nó trigger
│       ├── HotmartTrigger.node.ts          # Implementação do nó trigger
│       └── v1/
│           ├── HotmartV1.node.ts           # Implementação da versão 1
│           ├── actions/                    # Recursos e operações
│           │   ├── club/                   # Área de membros
│           │   ├── coupon/                 # Cupons
│           │   ├── product/                # Produtos
│           │   ├── sales/                  # Vendas
│           │   ├── subscription/           # Assinaturas
│           │   ├── tickets/                # Ingressos
│           │   ├── negotiate/              # Negociação
│           │   ├── router.ts               # Roteador de ações
│           │   └── versionDescription.ts   # Descrições das versões
│           ├── helpers/                    # Funções auxiliares
│           │   ├── dateUtils.ts            # Utilidades para datas
│           │   ├── outputFormatter.ts      # Formatação de resultados
│           │   └── pagination.ts           # Paginação automática
│           ├── methods/                    # Métodos adicionais
│           │   └── loadOptions.ts          # Carregamento de opções dinâmicas
│           └── transport/                  # Comunicação HTTP
│               └── request.ts              # Cliente HTTP
├── __tests__/                              # Testes
├── docs/                                   # Documentação
└── scripts/                                # Scripts de automação
```

### Componentes Principais

1. **Hotmart.node.ts**: Classe principal que utiliza o sistema de versionamento do n8n
2. **HotmartV1.node.ts**: Implementação específica da versão 1 da API
3. **HotmartTrigger.node.ts**: Nó de trigger para receber webhooks da Hotmart
4. **router.ts**: Roteia as chamadas para os recursos e operações apropriados
5. **transport/request.ts**: Gerencia comunicação HTTP com a API da Hotmart

## 🛠️ Desenvolvimento

### Funcionamento do Nó Hotmart

O nó Hotmart permite interagir com a API Hotmart para acessar e gerenciar diversos recursos:

1. **Assinaturas**: Gerenciamento de assinaturas, cancelamentos, renovações
2. **Vendas**: Histórico de vendas, comissões, detalhamento de preços
3. **Produtos**: Obtenção de produtos disponíveis
4. **Cupons**: Criação, leitura e remoção de cupons de desconto
5. **Club (Área de Membros)**: Dados de alunos, módulos, progresso
6. **Ingressos**: Informações de eventos e participantes
7. **Negotiate**: Geração de negociações para pagamentos

### Funcionamento do HotmartTrigger

O HotmartTrigger é um nó webhook que recebe eventos da Hotmart e os processa de três formas:

1. **Modo Padrão**: Recebe eventos específicos ou todos os eventos em uma saída única
2. **Modo Smart**: Separa automaticamente cada tipo de evento em saídas distintas
3. **Modo Super Smart**: Separa compras únicas, novas assinaturas e renovações

### Tipos de Eventos Suportados

- **Eventos de Compra**: PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_CANCELED, etc.
- **Eventos de Pagamento**: PURCHASE_BILLET_PRINTED (Boleto e PIX)
- **Eventos de Assinatura**: SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, etc.
- **Eventos de Área de Membros**: CLUB_FIRST_ACCESS, CLUB_MODULE_COMPLETED

### Boas Práticas de Desenvolvimento

1. **Adição de Novas Operações**:
   - Criar arquivo em `nodes/Hotmart/v1/actions/[resource]/[operation].operation.ts`
   - Atualizar o arquivo de recurso em `[resource].resource.ts`
   - Atualizar a descrição da versão em `versionDescription.ts`

2. **Ícones**:
   - Garantir que o ícone hotmart.svg seja copiado para todos os diretórios
   - O sistema de build usa Gulp (`gulp build:icons`) para copiar automaticamente

3. **Tratamento de Erros**:
   - Seguir o padrão de tratamento de erros da API Hotmart
   - Fornecer mensagens de erro claras e específicas

4. **Formatação de Saída**:
   - Usar `outputFormatter.ts` para formatar as saídas de forma consistente

### Fluxo de Execução de Requisições

1. **Autenticação**: Obtenção de token OAuth2 usando credenciais de cliente
2. **Roteamento**: Identificação do recurso e operação através do router
3. **Execução**: Chamada à operação específica com os parâmetros fornecidos
4. **Paginação**: Processamento de paginação automática quando necessário
5. **Formatação**: Formatação da resposta no formato esperado pelo n8n

## 🔧 Troubleshooting

### Problemas Comuns

#### n8n não reconhece o nó após instalação
```bash
# Verificar se foi instalado com npm (não pnpm)
ls -la ~/.n8n/nodes/node_modules/

# Reinstalar se necessário
npm install --prefix ~/.n8n/nodes ./n8n-nodes-hotmart-0.5.2.tgz

# Reiniciar n8n
pkill -f n8n && ./start-n8n
```

#### Erros de compilação TypeScript
```bash
# Limpar e recompilar
pnpm clean
pnpm install
pnpm build
```

#### Webhook não está recebendo eventos
1. Verificar URL do webhook no n8n
2. Confirmar que o webhook está ativo na Hotmart
3. Testar com ferramenta externa (curl/Postman)
4. Verificar logs com `./debug-n8n`

### Debugging

```bash
# Logs detalhados
LOG_LEVEL=debug n8n start

# Apenas logs do Hotmart
LOG_LEVEL=debug n8n start | grep -i hotmart

# Salvar logs em arquivo
LOG_LEVEL=debug n8n start 2>&1 | tee debug.log
```

## 📝 Diretrizes para Documentação

### CHANGELOG Automático

O projeto usa `standard-version` para gerar CHANGELOG automaticamente baseado nos commits:

```bash
# Gerar release patch (0.5.2 → 0.5.3)
pnpm release:patch

# Gerar release minor (0.5.2 → 0.6.0)
pnpm release:minor

# Gerar release major (0.5.2 → 1.0.0)
pnpm release:major

# Release automático baseado nos commits
pnpm release
```

**Importante**: Use mensagens de commit seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nova funcionalidade (gera minor release)
- `fix:` Correção de bug (gera patch release)
- `BREAKING CHANGE:` Mudança incompatível (gera major release)
- `docs:` Apenas documentação
- `chore:` Manutenção
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes

### Documentação Automática do Código

```bash
# Gerar documentação TypeDoc
pnpm docs

# Gerar e assistir mudanças (desenvolvimento)
pnpm docs:watch
```

A documentação é gerada automaticamente na pasta `docs/` usando TypeDoc.

### PRDs (Product Requirement Documents)
- Criar arquivo diretamente em `/docs/PRDs/` com nome descritivo
- Formato: `PRD-[numero]-[titulo-descritivo].md`
- Referenciar no arquivo `/docs/PRD-CHANGELOG.md`

### RFCs (Request for Comments)
- **Para RFCs simples (1 arquivo)**: Criar diretamente em `/docs/RFCs/`
  - Formato: `RFC-[numero]-[titulo-descritivo].md`
- **Para RFCs complexas (múltiplos arquivos)**: Criar pasta em `/docs/RFCs/`
  - Nome da pasta: `DD-MM-AAAA-[titulo-descritivo]/`
  - Incluir: RFC principal, diagramas, arquivos de implementação, etc.
- Sempre referenciar no arquivo `/docs/RFC-CHANGELOG.md`

### Exemplo de estrutura:
```
docs/
├── PRDs/
│   ├── PRD-001-sistema-autenticacao.md
│   ├── PRD-002-integracao-webhooks.md
│   └── PRD-CHANGELOG.md
└── RFCs/
    ├── RFC-001-resource-locator.md          # RFC simples (1 arquivo)
    ├── RFC-002-error-handling.md            # RFC simples (1 arquivo)
    ├── 15-06-2024-refactor-completo/        # RFC complexa (múltiplos arquivos)
    │   ├── RFC.md
    │   ├── diagrama-arquitetura.png
    │   └── implementation-plan.md
    └── RFC-CHANGELOG.md
```

### Regras de Decisão para RFCs:
1. **Use arquivo único quando**:
   - RFC contém apenas especificação técnica
   - Não há diagramas ou arquivos auxiliares
   - É uma melhoria pontual ou feature isolada

2. **Use pasta separada quando**:
   - RFC tem múltiplos documentos relacionados
   - Inclui diagramas, mockups ou assets
   - É uma mudança arquitetural grande
   - Tem planos de implementação em fases

## 📊 Informações do Projeto

- **Versão atual**: 0.6.4
- **AI Ready**: Node marcado com `usableAsTool: true` para uso por AI Agents
- **Dependências mínimas**: n8n-workflow 1.92.0+, n8n-core 1.93.0
- **TypeScript**: 100% tipado, sem warnings de tipo any
- **Testes**: Jest configurado, meta de 80% de cobertura
- **CI/CD**: GitHub Actions para testes e validação

---

**Última atualização**: Maio 2025

## 📦 Comando /compact - Como Usar

### Sintaxe Básica
```bash
/compact [resumo] [--opções]
```

### Opções Disponíveis

1. **Sem argumentos** (compactação padrão):
   ```bash
   /compact
   ```

2. **Com resumo customizado**:
   ```bash
   /compact "Implementamos feature X e corrigimos bug Y"
   ```

3. **Manter arquivos específicos**:
   ```bash
   /compact --keep-files README.md,package.json
   ```

4. **Definir prioridade de contexto**:
   ```bash
   /compact --priority high  # high/medium/low
   ```

5. **Comando completo**:
   ```bash
   /compact "Resumo do trabalho" --keep-files arquivo1.ts,arquivo2.md --priority high
   ```

### 🎯 Estratégia Recomendada: Arquivo de Sessão

**MELHOR PRÁTICA**: Criar um arquivo de resumo da sessão antes de compactar:

1. **Criar arquivo de sessão em `docs/contexto/`** (ex: `SESSAO-DD-MM-AAAA.md`):
   - **IMPORTANTE**: Sempre salvar em `docs/contexto/` (não na raiz!)
   - Estado atual do projeto
   - O que foi feito na sessão
   - Próximos passos
   - Arquivos modificados
   - Comandos importantes

2. **Usar comando compact referenciando o arquivo**:
   ```bash
   /compact "Ver docs/contexto/SESSAO-27-05-2025.md para contexto completo" --keep-files docs/contexto/SESSAO-27-05-2025.md,CLAUDE.md --priority high
   ```

3. **Na próxima sessão, começar com**:
   ```
   Continue o trabalho anterior. Ver docs/contexto/SESSAO-DD-MM-AAAA.md para contexto completo.
   ```

**⚠️ NUNCA salve arquivos .md na raiz do projeto - use sempre `docs/` ou `docs/contexto/`**

### 💡 Dicas
- Use `/compact` quando contexto estiver em ~10%
- Sempre inclua um resumo descritivo
- Mantenha arquivos que ainda vai modificar
- Use `--priority high` para trabalhos complexos
- Crie arquivo de sessão para histórico completo
