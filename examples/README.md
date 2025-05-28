# 📚 Exemplos de Workflows - n8n-nodes-hotmart

Este diretório contém workflows de exemplo para demonstrar as capacidades do n8n-nodes-hotmart.

## 📁 Estrutura

### 🎯 `/basic` - Exemplos Básicos
Workflows simples para começar rapidamente:
- **01-simple-product-list.json** - Lista produtos da Hotmart
- **02-subscription-management.json** - Gerencia assinaturas
- **03-webhook-handler.json** - Processa webhooks da Hotmart

### 🚀 `/intermediate` - Exemplos Intermediários
Workflows com lógica mais complexa:
- **01-sales-report-automation.json** - Relatórios automatizados de vendas
- **02-customer-lifecycle.json** - Gerenciamento do ciclo de vida do cliente
- **03-coupon-campaign.json** - Campanhas automatizadas com cupons

### 💎 `/advanced` - Exemplos Avançados
Workflows completos para produção:
- **01-complete-ecommerce-integration.json** - Integração completa de e-commerce
- **02-multi-product-launch.json** - Lançamento de múltiplos produtos
- **03-analytics-dashboard.json** - Dashboard de analytics em tempo real

### 🔧 `/templates` - Templates Reutilizáveis
Componentes para usar em seus workflows:
- **error-handling-template.json** - Tratamento de erros padrão
- **pagination-template.json** - Paginação automática
- **webhook-security-template.json** - Segurança para webhooks

## 🚀 Como Usar

### 1. Importar no n8n

1. Abra seu n8n
2. Vá em **Workflows** → **Import**
3. Selecione o arquivo JSON desejado
4. Configure suas credenciais Hotmart

### 2. Configurar Credenciais

Todos os workflows precisam de credenciais OAuth2 da Hotmart:

1. Em **Credentials** → **New**
2. Procure por **Hotmart OAuth2 API**
3. Adicione seu Client ID e Client Secret
4. Salve e teste a conexão

### 3. Personalizar

Cada workflow tem comentários explicando:
- O que faz cada nó
- Parâmetros que podem ser ajustados
- Pontos de extensão

## 📝 Exemplos por Caso de Uso

### 💰 Vendas e Pagamentos
- `basic/01-simple-product-list.json` - Listar produtos
- `intermediate/01-sales-report-automation.json` - Relatórios de vendas
- `advanced/01-complete-ecommerce-integration.json` - E-commerce completo

### 👥 Gestão de Clientes
- `basic/02-subscription-management.json` - Gerenciar assinaturas
- `intermediate/02-customer-lifecycle.json` - Ciclo de vida
- `advanced/03-analytics-dashboard.json` - Analytics de clientes

### 🎯 Marketing e Promoções
- `intermediate/03-coupon-campaign.json` - Campanhas com cupons
- `advanced/02-multi-product-launch.json` - Lançamentos

### 🔔 Webhooks e Automações
- `basic/03-webhook-handler.json` - Processar webhooks
- `templates/webhook-security-template.json` - Segurança

## 💡 Dicas

1. **Comece pelo básico**: Entenda os conceitos antes de partir para workflows complexos
2. **Teste em sandbox**: Use ambiente de teste da Hotmart primeiro
3. **Monitore execuções**: Use os logs do n8n para debug
4. **Versionamento**: Salve versões dos seus workflows

## 🤝 Contribuindo

Tem um workflow interessante? Contribua!

1. Fork o repositório
2. Adicione seu workflow em `/community`
3. Inclua documentação clara
4. Abra um Pull Request

## 📖 Recursos Adicionais

- [Documentação da API Hotmart](https://developers.hotmart.com/docs/pt-BR/)
- [Documentação do n8n](https://docs.n8n.io/)
- [Vídeos Tutoriais](https://www.youtube.com/n8n)

---

**Dúvidas?** Abra uma issue no [GitHub](https://github.com/thaleslaray/n8n-nodes-hotmart/issues)