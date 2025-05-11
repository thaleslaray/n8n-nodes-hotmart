# HotmartSmartTrigger - Documentação

## Visão Geral

O **HotmartSmartTrigger** é um nó avançado que combina as funcionalidades do HotmartTrigger e do HotmartRouter em um único componente. Ele recebe webhooks da Hotmart e direciona automaticamente os eventos para saídas específicas, sem necessidade de um nó adicional de roteamento.

## Vantagens

- **Simplicidade**: Um único nó para receber e rotear eventos
- **Saídas dedicadas**: Cada tipo de evento Hotmart tem sua própria saída
- **Nomes personalizáveis**: Os nomes das saídas podem ser personalizados
- **Segurança integrada**: Verificação de token e URL secreta
- **Compatibilidade total**: Suporta todos os eventos da API de webhooks da Hotmart

## Configuração

### Parâmetros Básicos

- **URL Secreta**: Ativa/desativa o uso de uma URL com parâmetro secreto
- **Segredo**: O segredo a ser usado na URL quando a opção "URL Secreta" está ativada
- **Hottok Token de Verificação**: Token enviado pela Hotmart no cabeçalho X-HOTMART-HOTTOK

### Personalização de Nomes das Saídas

- **Personalizar Nomes das Saídas**: Toggle para ativar/desativar a personalização
- **Nome alternativo para: [EVENTO]**: Campos para personalizar o nome de cada saída

## Lista de Eventos e Saídas

O HotmartSmartTrigger possui 15 saídas diferentes, uma para cada tipo de evento da Hotmart:

1. **Aprovada** (PURCHASE_APPROVED)
2. **Completa** (PURCHASE_COMPLETE)
3. **Cancelada** (PURCHASE_CANCELED)
4. **Reembolso** (PURCHASE_REFUNDED)
5. **Chargeback** (PURCHASE_CHARGEBACK)
6. **Boleto** (PURCHASE_BILLET_PRINTED)
7. **Disputa** (PURCHASE_PROTEST)
8. **Expirada** (PURCHASE_EXPIRED)
9. **Atrasada** (PURCHASE_DELAYED)
10. **Abandono** (PURCHASE_OUT_OF_SHOPPING_CART)
11. **Ass. Cancelada** (SUBSCRIPTION_CANCELLATION)
12. **Troca de Plano** (SWITCH_PLAN)
13. **Troca de Data** (UPDATE_SUBSCRIPTION_CHARGE_DATE)
14. **Primeiro Acesso** (CLUB_FIRST_ACCESS)
15. **Módulo Completo** (CLUB_MODULE_COMPLETED)

## Como Usar

### 1. Adicionar o Nó

Adicione o nó **Hotmart Smart Trigger** ao seu fluxo de trabalho. Este nó não precisa de nenhuma conexão de entrada.

### 2. Configurar a URL do Webhook

Após adicionar o nó, uma URL de webhook será gerada. Você precisará configurar esta URL no painel da Hotmart:

1. Copie a URL exibida no log do n8n (ou nas notas de execução)
2. Acesse o painel da Hotmart em https://app-vlc.hotmart.com/tools/webhook
3. Adicione um novo webhook com esta URL
4. Selecione os eventos que deseja receber

### 3. Configurar Segurança (Opcional)

Para aumentar a segurança:

1. Ative a opção "URL Secreta" e defina um segredo
2. Configure o "Hottok Token de Verificação" caso tenha um token específico da Hotmart

### 4. Conectar Fluxos

Conecte diferentes fluxos de trabalho a cada uma das saídas do nó:

- Conecte um fluxo à saída "Aprovada" para processar compras aprovadas
- Conecte outro fluxo à saída "Ass. Cancelada" para tratar cancelamentos
- Continue com as demais saídas conforme necessário

## Exemplos de Uso

### Exemplo 1: Notificação de Vendas

1. Conecte a saída "Aprovada" a um nó HTTP Request para enviar uma notificação
2. Configure o HTTP Request para enviar dados da venda para seu sistema

### Exemplo 2: Automação de Cancelamentos

1. Conecte a saída "Ass. Cancelada" a um nó Function
2. No nó Function, implemente a lógica para registrar o cancelamento ou iniciar um fluxo de retenção

### Exemplo 3: Monitoramento de Progresso

1. Conecte as saídas "Primeiro Acesso" e "Módulo Completo" a diferentes fluxos
2. Use esses fluxos para acompanhar o progresso dos alunos e enviar comunicações personalizadas

## Considerações Técnicas

- A URL do webhook deve ser acessível pela internet
- Configure corretamente o token "hottok" para garantir a segurança
- Certifique-se de que o n8n está em execução para receber os eventos
- Teste o webhook antes de usar em produção

## Diferenças para HotmartTrigger + HotmartRouter

| Característica | HotmartSmartTrigger | HotmartTrigger + HotmartRouter |
|----------------|---------------------|-------------------------------|
| Componentes    | Um único nó         | Dois nós separados            |
| Configuração   | Uma vez             | Duas vezes                    |
| Performance    | Mais eficiente      | Ligeiramente mais lento       |
| Complexidade   | Menor               | Maior                         |
| Flexibilidade  | Foco em eventos     | Mais adaptável                |

## Resolução de Problemas

### Não recebe eventos

1. Verifique se a URL está corretamente configurada na Hotmart
2. Confirme que o token "hottok" está correto, se configurado
3. Verifique se o n8n está acessível pela internet

### Eventos vão para saída errada

1. Verifique o valor do campo "event" nos dados recebidos
2. Confirme que o evento está corretamente mapeado no nó

## Conclusão

O HotmartSmartTrigger oferece uma maneira simplificada e eficiente de receber e processar eventos da Hotmart diretamente no n8n, eliminando a necessidade de configurar múltiplos nós para esta tarefa.