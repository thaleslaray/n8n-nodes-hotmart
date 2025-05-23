# 📦 Guia de Publicação NPM

Guia completo para publicar o pacote n8n-nodes-hotmart no NPM sem precisar fazer login no browser.

## 🚀 Configuração Inicial (Uma Vez Só)

### 1. Obter Token NPM

1. Acesse: https://www.npmjs.com/settings/tokens
2. Clique em **"Generate New Token"**
3. Escolha o tipo:
   - **🤖 Automation** (recomendado) - selecione "Publish"
   - **🔧 Granular** - configure permissões específicas

### 2. Configurar Token

```bash
./scripts/setup-npm-token.sh
```

O script irá:

- ✅ Solicitar seu token NPM
- ✅ Configurar autenticação automática
- ✅ Criar scripts de publicação
- ✅ Testar a configuração

## 📋 Processo de Publicação

### Método 1: Script Automatizado (Recomendado)

```bash
./publish
```

### Método 2: Script Completo

```bash
./scripts/publish.sh
```

### Método 3: NPM Direto (após configuração)

```bash
npm publish
```

## 🔄 Fluxo Automatizado

O script de publicação executa automaticamente:

1. **🔍 Verificações:**

   - Verifica se está no diretório correto
   - Confirma autenticação NPM
   - Mostra versão atual
   - Verifica mudanças no git

2. **💾 Backup:**

   - Cria backup automático antes da publicação
   - Nomeia com versão: `before_npm_publish_[versao]`

3. **🔨 Build:**

   - Executa `pnpm build`
   - Verifica se compilação foi bem-sucedida

4. **👀 Preview:**

   - Mostra arquivos que serão incluídos
   - Solicita confirmação do usuário

5. **📤 Publicação:**
   - Publica no NPM usando token
   - Mostra URL do pacote publicado
   - Limpa arquivos temporários

## 📊 Exemplo de Uso

```bash
$ ./publish

📦 PUBLICAÇÃO AUTOMATIZADA NPM
===============================

[PUBLISH] Verificando autenticação NPM...
[✓] Autenticado como: thaleslaray
[PUBLISH] Versão atual: 0.5.0
[PUBLISH] Criando backup antes da publicação...
[✓] Backup criado
[PUBLISH] Compilando projeto...
[✓] Projeto compilado
[PUBLISH] Arquivos que serão incluídos na publicação:
  dist/
  nodes/
  credentials/
  package.json
  README.md
  ...

Confirma a publicação da versão 0.5.0? (y/N): y

[PUBLISH] Publicando no NPM...
[✓] ✨ Pacote 0.5.0 publicado com sucesso!
[✓] 🌐 Disponível em: https://www.npmjs.com/package/n8n-nodes-hotmart

🎉 PUBLICAÇÃO CONCLUÍDA!
   Versão: 0.5.0
   Usuário: thaleslaray
   URL: https://www.npmjs.com/package/n8n-nodes-hotmart
```

## 🔐 Segurança

### Arquivos Criados:

- **`~/.npmrc`** - Token de autenticação (permissões 600)
- **`~/.npmrc_env`** - Backup do token como variável de ambiente

### ⚠️ Importante:

- **Nunca compartilhe** o arquivo `~/.npmrc`
- **Nunca commite** tokens no git
- **Revogue tokens** se comprometidos: https://www.npmjs.com/settings/tokens

### 🛡️ Proteções:

- Arquivos de token com permissões restritas (600)
- Backup automático antes da publicação
- Confirmação manual antes de publicar
- Limpeza de arquivos temporários

## 🔧 Troubleshooting

### Erro de Autenticação:

```bash
# Reconfigurar token
./scripts/setup-npm-token.sh
```

### Erro de Permissões:

```bash
# Verificar permissões dos arquivos
ls -la ~/.npmrc
chmod 600 ~/.npmrc
```

### Erro de Build:

```bash
# Limpar e rebuild
pnpm clean
pnpm install
pnpm build
```

### Token Expirado:

1. Gere novo token no NPM
2. Execute novamente: `./scripts/setup-npm-token.sh`

## 📝 Versionamento

### Antes de Publicar:

```bash
# Atualizar versão no package.json
npm version patch    # 0.5.0 -> 0.5.1
npm version minor    # 0.5.0 -> 0.6.0
npm version major    # 0.5.0 -> 1.0.0

# Ou manualmente editar package.json
```

### Publicar Versão Beta:

```bash
npm publish --tag beta
```

### Publicar Versão Específica:

```bash
npm publish --tag latest
```

## 🎯 Boas Práticas

1. **✅ Sempre teste** localmente antes de publicar
2. **✅ Atualize CHANGELOG.md** antes da publicação
3. **✅ Verifique README.md** está atualizado
4. **✅ Confirme versão** no package.json
5. **✅ Teste instalação** após publicação:
   ```bash
   npm install n8n-nodes-hotmart@latest
   ```

## 🚀 Scripts de Conveniência

| Script                         | Descrição                        |
| ------------------------------ | -------------------------------- |
| `./publish`                    | Publicação automatizada completa |
| `./scripts/publish.sh`         | Script completo de publicação    |
| `./scripts/setup-npm-token.sh` | Configurar token NPM             |

## 🔄 Workflow Completo

```bash
# 1. Desenvolvimento
pnpm install
pnpm build

# 2. Testes
./install                    # Testar instalação local

# 3. Atualizar versão
npm version patch

# 4. Publicar
./publish

# 5. Verificar
# Checar https://www.npmjs.com/package/n8n-nodes-hotmart
```

## 💡 Dicas

- **Use o script automatizado** para evitar erros
- **Backup é criado automaticamente** antes da publicação
- **Token é configurado uma vez só** e funciona para sempre
- **Script limpa arquivos temporários** automaticamente
- **Confirmação manual** evita publicações acidentais

---

**🎉 Agora você pode publicar no NPM sem login no browser!** ✨
