# Eventos Mockados - Webhook Hotmart

## ⚠️ ATENÇÃO
Estes são eventos MOCKADOS baseados na documentação oficial da Hotmart. 
Devem ser substituídos por eventos reais assim que capturados.

## Eventos Mockados

### 1. PURCHASE_EXPIRED
**Arquivo**: `purchase-expired.json`

**Descrição**: Disparado quando um boleto bancário expira sem pagamento.

**Características do mock**:
- Status: `EXPIRED`
- Tipo de pagamento: `BILLET`
- Campos específicos:
  - `payment.billet_url`: URL do boleto expirado
  - `payment.billet_barcode`: Código de barras
  - `payment.refusal_reason`: "Boleto expirado sem pagamento"
  - `approved_date`: null (nunca foi aprovado)

**Baseado em**:
- Documentação oficial: `/docs/docs-ht/webhooks/2.0.0-Eventos de pedido.txt`
- Estrutura similar a: PURCHASE_BILLET_PRINTED (capturado)
- Status possíveis documentados incluem EXPIRED

### 2. SWITCH_PLAN
**Arquivo**: `switch-plan.json`

**Descrição**: Disparado quando há mudança de plano em uma assinatura ativa.

**Características do mock**:
- Evento: `SWITCH_PLAN`
- Estrutura única com array `plans`:
  - `current: true` - Novo plano
  - `current: false` - Plano anterior
- Campos específicos:
  - `switch_plan_date`: Data da troca
  - `subscription.status`: ACTIVE
  - `plans[].offer.key`: Código da oferta

**Baseado em**:
- Documentação oficial: `/docs/docs-ht/webhooks/2.0.0-Evento de troca de plano.txt`
- Exemplo completo fornecido na documentação
- Adaptado com IDs consistentes com outros eventos capturados

## Validação dos Mocks

### Campos Garantidos (da documentação):
✅ Estrutura geral: id, creation_date, event, version, hottok
✅ PURCHASE_EXPIRED: Segue padrão de eventos de purchase
✅ SWITCH_PLAN: Estrutura exata da documentação

### Campos Inferidos:
⚠️ PURCHASE_EXPIRED: Alguns campos baseados em PURCHASE_BILLET_PRINTED
⚠️ Valores monetários: Baseados em eventos similares capturados

## Como Capturar Eventos Reais

### Para PURCHASE_EXPIRED:
1. Criar compra com boleto em ambiente de teste
2. Configurar webhook para capturar
3. Aguardar 3-7 dias para expiração
4. Substituir mock quando capturado

### Para SWITCH_PLAN:
1. Criar assinatura ativa
2. Fazer upgrade/downgrade do plano
3. Capturar evento no momento da troca
4. Substituir mock quando capturado

## Status dos Mocks

| Evento | Status | Confiança | Fonte |
|--------|--------|-----------|--------|
| PURCHASE_EXPIRED | 🟡 Mock | Média | Documentação + Inferência |
| SWITCH_PLAN | 🟢 Mock | Alta | Documentação com exemplo completo |

## Notas Importantes

1. **hottok**: Usar tokens diferentes para testes (`mock-token-*`)
2. **IDs**: Prefixados com "mock-" para fácil identificação
3. **Datas**: Timestamps realistas baseados em eventos capturados
4. **Valores**: Consistentes com produtos reais (997, 1497, etc)

## Próximos Passos

1. [ ] Configurar captura contínua de webhooks
2. [ ] Executar ações para gerar PURCHASE_EXPIRED
3. [ ] Executar ações para gerar SWITCH_PLAN
4. [ ] Substituir mocks por eventos reais
5. [ ] Atualizar testes com dados validados