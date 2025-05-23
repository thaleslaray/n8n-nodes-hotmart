// Constantes para os filtros de Transações de Assinatura

export const billingTypeOptions = [
  {
    name: 'Assinatura',
    value: 'SUBSCRIPTION',
  },
  {
    name: 'Parcelamento Inteligente',
    value: 'SMART_INSTALLMENT',
  },
  {
    name: 'Recuperação Inteligente',
    value: 'SMART_RECOVERY',
  },
];

export const recurrencyStatusOptions = [
  {
    name: 'Pago',
    value: 'PAID',
  },
  {
    name: 'Não Pago',
    value: 'NOT_PAID',
  },
  {
    name: 'Contestado',
    value: 'CLAIMED',
  },
  {
    name: 'Reembolsado',
    value: 'REFUNDED',
  },
  {
    name: 'Chargeback',
    value: 'CHARGEBACK',
  },
];

export const paymentTypeOptions = [
  {
    name: 'Boleto',
    value: 'BILLET',
  },
  {
    name: 'Pagamento à Vista',
    value: 'CASH_PAYMENT',
  },
  {
    name: 'Cartão de Crédito',
    value: 'CREDIT_CARD',
  },
  {
    name: 'Transferência Bancária',
    value: 'DIRECT_BANK_TRANSFER',
  },
  {
    name: 'Débito Direto',
    value: 'DIRECT_DEBIT',
  },
  {
    name: 'Boleto Financiado',
    value: 'FINANCED_BILLET',
  },
  {
    name: 'Parcelamento Financiado',
    value: 'FINANCED_INSTALLMENT',
  },
  {
    name: 'Google Pay',
    value: 'GOOGLE_PAY',
  },
  {
    name: 'Hotcard',
    value: 'HOTCARD',
  },
  {
    name: 'Híbrido',
    value: 'HYBRID',
  },
  {
    name: 'Transferência Manual',
    value: 'MANUAL_TRANSFER',
  },
  {
    name: 'PayPal',
    value: 'PAYPAL',
  },
  {
    name: 'PayPal Internacional',
    value: 'PAYPAL_INTERNACIONAL',
  },
  {
    name: 'PicPay',
    value: 'PICPAY',
  },
  {
    name: 'PIX',
    value: 'PIX',
  },
  {
    name: 'Samsung Pay',
    value: 'SAMSUNG_PAY',
  },
  {
    name: 'Wallet',
    value: 'WALLET',
  },
  {
    name: 'Saldo Hotmart',
    value: 'BALANCE_HOTMART',
  },
];
