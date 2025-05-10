# n8n-nodes-hotmart

Este pacote contém nós personalizados para integrar a [API Hotmart](https://developers.hotmart.com/docs/pt-BR/) com o [n8n](https://n8n.io/).

## Instalação

### Instalação Local Recomendada

Para compilar e instalar o pacote no diretório de nós personalizados do n8n:

```bash
# Torna o script executável
chmod +x build-and-install.sh

# Executa o script
./build-and-install.sh
```

Este script:
1. Remove qualquer instalação anterior
2. Compila o código TypeScript
3. Cria um pacote com apenas os arquivos necessários (excluindo nós de exemplo)
4. Instala o pacote no diretório `~/.n8n/custom/n8n-nodes-hotmart`

Após a instalação, reinicie o n8n para carregar os novos nós.

### Instalação para Desenvolvimento (Não Recomendada)

Para desenvolvimento e testes rápidos, você pode criar um link simbólico para o diretório de nós personalizados do n8n:

```bash
# Torna o script executável
chmod +x dev-link.sh

# Executa o script
./dev-link.sh
```

Este método pode causar problemas se o projeto contiver nós de exemplo ou dependências ausentes.

### Instalação via npm

```bash
npm install n8n-nodes-hotmart
```

## Recursos Disponíveis

### Assinaturas

- **Obter Assinaturas**: Lista todas as assinaturas com suporte a filtros e paginação
- **Cancelar Assinatura**: Cancela uma assinatura específica
- **Cancelar Lista de Assinaturas**: Cancela múltiplas assinaturas
- **Alterar Dia de Cobrança**: Modifica a data de cobrança de uma assinatura
- **Obter Compras de Assinantes**: Lista compras de um assinante específico
- **Reativar e Cobrar Assinatura**: Reativa uma assinatura cancelada
- **Sumário de Assinaturas**: Obtém dados sumarizados de assinaturas

## Autenticação

Este pacote utiliza autenticação OAuth 2.0 com client credentials. Para configurar:

1. Acesse o [Hotmart Developers](https://app-vlc.hotmart.com/tools/credentials)
2. Crie uma credencial para o ambiente desejado (produção ou sandbox)
3. Anote o Client ID, Client Secret e o token Basic
4. Configure essas credenciais no n8n

## Exemplos de Uso

### Listar Assinaturas Ativas e Enviar Notificação

1. **Nó Trigger**: Agendamento (a cada dia)
2. **Nó Hotmart**: 
   - Recurso: Assinatura
   - Operação: Obter Assinaturas
   - Retornar Todos os Resultados: Sim
   - Filtros: Status = ACTIVE
3. **Nó Filter**: Filtrar assinaturas que vencem em 3 dias
4. **Nó Slack/Email**: Enviar notificação com lista de assinaturas

### Cancelar Assinaturas Atrasadas

1. **Nó Trigger**: Webhook ou Agendamento
2. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Obter Assinaturas
   - Filtros: Status = DELAYED
3. **Nó Loop**: Iterar sobre as assinaturas atrasadas
4. **Nó Hotmart**:
   - Recurso: Assinatura
   - Operação: Cancelar Assinatura
   - ID da Assinatura: =item.json.id
   - Motivo: "Cancelamento automático por atraso"

## Desenvolvimento

### Estrutura do Projeto

```
n8n-nodes-hotmart/
├── credentials/
│   └── HotmartOAuth2Api.credentials.ts
├── nodes/
│   ├── Hotmart/
│   │   ├── Hotmart.node.json
│   │   ├── Hotmart.node.ts
│   │   ├── hotmart.svg
│   │   ├── v1/
│   │   │   ├── HotmartV1.node.ts
│   │   │   ├── actions/
│   │   │   ├── methods/
│   │   │   ├── transport/
│   │   │   └── helpers/
```

### Comandos

- `pnpm build`: Compila o código TypeScript
- `pnpm dev`: Compila em modo watch para desenvolvimento
- `pnpm lint`: Executa o linter
- `pnpm lintfix`: Corrige automaticamente problemas de lint
- `./build-and-install.sh`: Compila e instala no diretório de nós personalizados do n8n

## Licença

[MIT](LICENSE.md)
