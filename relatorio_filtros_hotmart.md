# Relatório Completo dos Filtros de Todos os Endpoints Hotmart (Atualizado)

## Assinaturas (`getAll.operation.ts`)
- **Status** (lista)
- **ID do Produto**
- **Nome do Plano**
- **ID do Plano**
- **Período de Teste**
- **Email do Assinante**
- **Código da Transação**
- **Data Inicial**
- **Data Final**
- **Data Inicial de Cancelamento**
- **Data Final de Cancelamento**
- **Data da Próxima Cobrança**
- **Data Final da Próxima Cobrança**
- **Código do Assinante**

---

## Assinaturas Resumo (`getSummary.operation.ts`)
- **ID do Produto**
- **Código do Assinante**
- **Data Inicial**
- **Data Final de Início**
- **Data da Próxima Cobrança**

---

## Vendas Histórico (`getHistoricoVendas.operation.ts`)
- **ID do Produto**
- **Status da Transação** (lista: APPROVED, BLOCKED, CANCELLED, CHARGEBACK, COMPLETE, EXPIRED, NO_FUNDS, OVERDUE, PARTIALLY_REFUNDED, PRE_ORDER, PRINTED_BILLET, PROCESSING_TRANSACTION, PROTESTED, REFUNDED, STARTED, UNDER_ANALISYS, WAITING_PAYMENT)
- **Data Inicial**
- **Data Final**
- **Email do Comprador**
- **Nome do Comprador**
- **Código da Transação**
- **Origem da Venda (SRC)**
- **Tipo de Pagamento**
- **Código da Oferta**
- **Comissionado como**

---

## Vendas Resumo (`getResumoVendas.operation.ts`)
- **ID do Produto**
- **Status da Transação** (lista)
- **Data Inicial**
- **Data Final**
- **Código da Transação**
- **Origem da Venda (SRC)**
- **Nome do Afiliado**
- **Tipo de Pagamento**
- **Código da Oferta**

---

## Cupons (`getAll.operation.ts`)
- **ID do Produto**
- **Código do Cupom**

## Cupons (`create.operation.ts`)
- **ID do Produto**
- **Código do Cupom**
- **Desconto**
- **Data de Início**
- **Data de Término**
- **ID do Afiliado**
- **IDs das Ofertas**

---

## Club (`getAll.operation.ts`)
- **Subdomínio**
- **Email do aluno**
- **Token de página**

## Club (`getModules.operation.ts`)
- **Subdomínio**
- **Módulos extras**

## Club (`getPages.operation.ts`)
- **Subdomínio**
- **ID do módulo**

## Club (`getProgress.operation.ts`)
- **Subdomínio**
- **ID do aluno**

---

## Ingressos (Tickets) (`getAll.operation.ts`)
- **ID do evento**
- **Email do comprador**
- **Email do participante**
- **Última atualização**
- **ID do lote**
- **Status do ingresso** (lista: Disponível, Contestado, Excluído, Convite, Convite cancelado, Reembolsado, Reservado, Vendido)
- **Tipo de ingresso** (lista: Todos, Gratuito, Pago)
- **Status do check-in** (lista: Todos, Concluído, Parcial, Pendente)
- **ID do e-ticket**
- **QR code do ingresso**
- **Token de página**
- **Máximo de resultados**

---

## Transações de Assinatura (`/subscriptions/transactions`)
**Parâmetros principais:**
- **max_results** (integer)
- **page_token** (string)
- **product_id** (long)
- **transaction** (string)
- **subscriber_name** (string)
- **subscriber_email** (string)
- **billing_type** (string): SUBSCRIPTION, SMART_INSTALLMENT, SMART_RECOVERY
- **subscription_status** (string, lista):
  - Para Assinatura: STARTED, INACTIVE, ACTIVE, DELAYED, CANCELLED_BY_ADMIN, CANCELLED_BY_CUSTOMER, CANCELLED_BY_SELLER, OVERDUE
  - Para Smart Installment/Smart Recovery: STARTED, INACTIVE, ACTIVE, DELAYED, CANCELLED_BY_ADMIN, CANCELLED_BY_SELLER
- **recurrency_status** (string, lista): PAID, NOT_PAID, CLAIMED, REFUNDED, CHARGEBACK
- **purchase_status** (string)
- **transaction_date** (long)
- **end_transaction_date** (long)
- **offer_code** (string)
- **purchase_payment_type** (string, lista): BILLET, CASH_PAYMENT, CREDIT_CARD, DIRECT_BANK_TRANSFER, DIRECT_DEBIT, FINANCED_BILLET, FINANCED_INSTALLMENT, GOOGLE_PAY, HOTCARD, HYBRID, MANUAL_TRANSFER, PAYPAL, PAYPAL_INTERNACIONAL, PICPAY, PIX, SAMSUNG_PAY, WALLET
- **subscriber_code** (string)

**Filtros com lista de status:**
- **subscription_status**
- **recurrency_status**
- **purchase_payment_type**

---

Se precisar do detalhamento dos valores possíveis de cada status, posso incluir conforme a documentação.
