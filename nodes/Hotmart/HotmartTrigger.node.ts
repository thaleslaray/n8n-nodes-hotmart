import type {
  IDataObject,
  IHookFunctions,
  INodeExecutionData,
  INodeParameters,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

enum WebhookEventTypes {
  PURCHASE_OUT_OF_SHOPPING_CART,
  PURCHASE_APPROVED,
  PURCHASE_COMPLETE,
  PURCHASE_CANCELED,
  PURCHASE_REFUNDED,
  PURCHASE_CHARGEBACK,
  PURCHASE_BILLET_PRINTED,
  PURCHASE_PROTEST,
  PURCHASE_EXPIRED,
  PURCHASE_DELAYED,
  SUBSCRIPTION_CANCELLATION,
  SUBSCRIPTION_PLAN_CHANGE,
  SUBSCRIPTION_BILLING_DATE_CHANGE,
  CLUB_FIRST_ACCESS,
  CLUB_MODULE_COMPLETED,
  // Tipo personalizado para diferenciar PIX de Boleto
  PURCHASE_PIX_GENERATED,
}

const webhookEvents: Record<WebhookEventTypes | 'all', { name: string; value: string }> = {
  [WebhookEventTypes.PURCHASE_OUT_OF_SHOPPING_CART]: {
    name: 'Abandono de Carrinho',
    value: 'PURCHASE_OUT_OF_SHOPPING_CART',
  },
  [WebhookEventTypes.PURCHASE_APPROVED]: {
    name: 'Compra Aprovada',
    value: 'PURCHASE_APPROVED',
  },
  [WebhookEventTypes.PURCHASE_COMPLETE]: {
    name: 'Compra Completa',
    value: 'PURCHASE_COMPLETE',
  },
  [WebhookEventTypes.PURCHASE_CANCELED]: {
    name: 'Compra Cancelada',
    value: 'PURCHASE_CANCELED',
  },
  [WebhookEventTypes.PURCHASE_REFUNDED]: {
    name: 'Compra Reembolsada',
    value: 'PURCHASE_REFUNDED',
  },
  [WebhookEventTypes.PURCHASE_CHARGEBACK]: {
    name: 'Compra Chargeback',
    value: 'PURCHASE_CHARGEBACK',
  },
  [WebhookEventTypes.PURCHASE_BILLET_PRINTED]: {
    name: 'Boleto Impresso',
    value: 'PURCHASE_BILLET_PRINTED',
  },
  [WebhookEventTypes.PURCHASE_PIX_GENERATED]: {
    name: 'PIX Gerado',
    value: 'PURCHASE_BILLET_PRINTED', // Mesmo valor do evento original para compatibilidade
  },
  [WebhookEventTypes.PURCHASE_PROTEST]: {
    name: 'Compra em Disputa',
    value: 'PURCHASE_PROTEST',
  },
  [WebhookEventTypes.PURCHASE_EXPIRED]: {
    name: 'Compra Expirada',
    value: 'PURCHASE_EXPIRED',
  },
  [WebhookEventTypes.PURCHASE_DELAYED]: {
    name: 'Compra Atrasada',
    value: 'PURCHASE_DELAYED',
  },
  [WebhookEventTypes.SUBSCRIPTION_CANCELLATION]: {
    name: 'Assinatura Cancelada',
    value: 'SUBSCRIPTION_CANCELLATION',
  },
  [WebhookEventTypes.SUBSCRIPTION_PLAN_CHANGE]: {
    name: 'Troca de Plano de Assinatura',
    value: 'SWITCH_PLAN',
  },
  [WebhookEventTypes.SUBSCRIPTION_BILLING_DATE_CHANGE]: {
    name: 'Troca de dia de Cobrança',
    value: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
  },
  [WebhookEventTypes.CLUB_FIRST_ACCESS]: {
    name: 'Primeiro Acesso',
    value: 'CLUB_FIRST_ACCESS',
  },
  [WebhookEventTypes.CLUB_MODULE_COMPLETED]: {
    name: 'Módulo Completo',
    value: 'CLUB_MODULE_COMPLETED',
  },
  all: {
    name: 'Todos',
    value: '*',
  },
};

// Função para obter o tipo de evento a partir do corpo da requisição
function getEvent(this: IWebhookFunctions): WebhookEventTypes | undefined {
  const body = this.getBodyData() as IDataObject;

  if (body.event === 'PURCHASE_CANCELED') {
    return WebhookEventTypes.PURCHASE_CANCELED;
  }

  if (body.event === 'PURCHASE_COMPLETE') {
    return WebhookEventTypes.PURCHASE_COMPLETE;
  }

  if (body.event === 'PURCHASE_APPROVED') {
    return WebhookEventTypes.PURCHASE_APPROVED;
  }

  if (body.event === 'PURCHASE_EXPIRED') {
    return WebhookEventTypes.PURCHASE_EXPIRED;
  }

  if (body.event === 'PURCHASE_REFUNDED') {
    return WebhookEventTypes.PURCHASE_REFUNDED;
  }

  if (body.event === 'PURCHASE_CHARGEBACK') {
    return WebhookEventTypes.PURCHASE_CHARGEBACK;
  }

  if (body.event === 'PURCHASE_BILLET_PRINTED') {
    return WebhookEventTypes.PURCHASE_BILLET_PRINTED;
  }

  if (body.event === 'PURCHASE_PROTEST') {
    return WebhookEventTypes.PURCHASE_PROTEST;
  }

  if (body.event === 'PURCHASE_DELAYED') {
    return WebhookEventTypes.PURCHASE_DELAYED;
  }

  if (body.event === 'PURCHASE_OUT_OF_SHOPPING_CART') {
    return WebhookEventTypes.PURCHASE_OUT_OF_SHOPPING_CART;
  }

  if (body.event === 'SUBSCRIPTION_CANCELLATION') {
    return WebhookEventTypes.SUBSCRIPTION_CANCELLATION;
  }

  if (body.event === 'SWITCH_PLAN') {
    return WebhookEventTypes.SUBSCRIPTION_PLAN_CHANGE;
  }

  if (body.event === 'UPDATE_SUBSCRIPTION_CHARGE_DATE') {
    return WebhookEventTypes.SUBSCRIPTION_BILLING_DATE_CHANGE;
  }

  if (body.event === 'CLUB_FIRST_ACCESS') {
    return WebhookEventTypes.CLUB_FIRST_ACCESS;
  }

  if (body.event === 'CLUB_MODULE_COMPLETED') {
    return WebhookEventTypes.CLUB_MODULE_COMPLETED;
  }

  return undefined;
}

// Função para configurar os nomes das saídas dinamicamente
const configureOutputNames = (parameters: INodeParameters) => {
  const customizeOutputs = parameters.customizeOutputs as boolean;
  const triggerMode = parameters.triggerMode as string;

  // Modo Super Smart - separa compras normais, assinaturas novas e renovações para o evento Aprovado
  if (triggerMode === 'super-smart') {
    if (customizeOutputs) {
      return [
        {
          type: 'main',
          displayName: parameters.outputNameSuper0 || 'Compra Única',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper1 || 'Assinatura',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper2 || 'Renovação',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper3 || 'Completa',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper4 || 'Cancelada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper5 || 'Reembolso',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper6 || 'Chargeback',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper7 || 'Boleto',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper17 || 'PIX',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper8 || 'Disputa',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper9 || 'Expirada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper10 || 'Atrasada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper11 || 'Abandono',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper12 || 'Ass. Cancelada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper13 || 'Troca de Plano',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper14 || 'Troca de Data',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper15 || 'Primeiro Acesso',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper16 || 'Módulo Completo',
        },
      ];
    } else {
      return [
        {
          type: 'main',
          displayName: 'Compra Única',
        },
        {
          type: 'main',
          displayName: 'Assinatura',
        },
        {
          type: 'main',
          displayName: 'Renovação',
        },
        {
          type: 'main',
          displayName: 'Completa',
        },
        {
          type: 'main',
          displayName: 'Cancelada',
        },
        {
          type: 'main',
          displayName: 'Reembolso',
        },
        {
          type: 'main',
          displayName: 'Chargeback',
        },
        {
          type: 'main',
          displayName: 'Boleto',
        },
        {
          type: 'main',
          displayName: 'PIX',
        },
        {
          type: 'main',
          displayName: 'Disputa',
        },
        {
          type: 'main',
          displayName: 'Expirada',
        },
        {
          type: 'main',
          displayName: 'Atrasada',
        },
        {
          type: 'main',
          displayName: 'Abandono',
        },
        {
          type: 'main',
          displayName: 'Ass. Cancelada',
        },
        {
          type: 'main',
          displayName: 'Troca de Plano',
        },
        {
          type: 'main',
          displayName: 'Troca de Data',
        },
        {
          type: 'main',
          displayName: 'Primeiro Acesso',
        },
        {
          type: 'main',
          displayName: 'Módulo Completo',
        },
      ];
    }
  }
  // Modo Smart com nomes customizados
  else if (customizeOutputs) {
    return [
      {
        type: 'main',
        displayName: parameters.outputName0 || 'Aprovada',
      },
      {
        type: 'main',
        displayName: parameters.outputName1 || 'Completa',
      },
      {
        type: 'main',
        displayName: parameters.outputName2 || 'Cancelada',
      },
      {
        type: 'main',
        displayName: parameters.outputName3 || 'Reembolso',
      },
      {
        type: 'main',
        displayName: parameters.outputName4 || 'Chargeback',
      },
      {
        type: 'main',
        displayName: parameters.outputName5 || 'Boleto',
      },
      {
        type: 'main',
        displayName: parameters.outputName6 || 'Disputa',
      },
      {
        type: 'main',
        displayName: parameters.outputName7 || 'Expirada',
      },
      {
        type: 'main',
        displayName: parameters.outputName8 || 'Atrasada',
      },
      {
        type: 'main',
        displayName: parameters.outputName9 || 'Abandono',
      },
      {
        type: 'main',
        displayName: parameters.outputName10 || 'Ass. Cancelada',
      },
      {
        type: 'main',
        displayName: parameters.outputName11 || 'Troca de Plano',
      },
      {
        type: 'main',
        displayName: parameters.outputName12 || 'Troca de Data',
      },
      {
        type: 'main',
        displayName: parameters.outputName13 || 'Primeiro Acesso',
      },
      {
        type: 'main',
        displayName: parameters.outputName14 || 'Módulo Completo',
      },
    ];
  }
  // Modo Smart padrão
  else {
    return [
      {
        type: 'main',
        displayName: 'Aprovada',
      },
      {
        type: 'main',
        displayName: 'Completa',
      },
      {
        type: 'main',
        displayName: 'Cancelada',
      },
      {
        type: 'main',
        displayName: 'Reembolso',
      },
      {
        type: 'main',
        displayName: 'Chargeback',
      },
      {
        type: 'main',
        displayName: 'Boleto',
      },
      {
        type: 'main',
        displayName: 'Disputa',
      },
      {
        type: 'main',
        displayName: 'Expirada',
      },
      {
        type: 'main',
        displayName: 'Atrasada',
      },
      {
        type: 'main',
        displayName: 'Abandono',
      },
      {
        type: 'main',
        displayName: 'Ass. Cancelada',
      },
      {
        type: 'main',
        displayName: 'Troca de Plano',
      },
      {
        type: 'main',
        displayName: 'Troca de Data',
      },
      {
        type: 'main',
        displayName: 'Primeiro Acesso',
      },
      {
        type: 'main',
        displayName: 'Módulo Completo',
      },
    ];
  }
};

export class HotmartTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hotmart Trigger',
    name: 'hotmartTrigger',
    icon: 'file:hotmart.svg',
    group: ['trigger'],
    version: 1,
    subtitle:
      '={{$parameter["triggerMode"] === "standard" ? ($parameter["event"] === "*" ? "Todos os Eventos" : ($parameter["event"] === "PURCHASE_OUT_OF_SHOPPING_CART" ? "Abandono de Carrinho" : ($parameter["event"] === "PURCHASE_APPROVED" ? "Compra Aprovada" : ($parameter["event"] === "PURCHASE_COMPLETE" ? "Compra Completa" : ($parameter["event"] === "PURCHASE_CANCELED" ? "Compra Cancelada" : ($parameter["event"] === "PURCHASE_REFUNDED" ? "Compra Reembolsada" : ($parameter["event"] === "PURCHASE_CHARGEBACK" ? "Compra Chargeback" : ($parameter["event"] === "PURCHASE_BILLET_PRINTED" ? "Boleto Impresso" : ($parameter["event"] === "PURCHASE_PROTEST" ? "Compra em Disputa" : ($parameter["event"] === "PURCHASE_EXPIRED" ? "Compra Expirada" : ($parameter["event"] === "PURCHASE_DELAYED" ? "Compra Atrasada" : ($parameter["event"] === "SUBSCRIPTION_CANCELLATION" ? "Assinatura Cancelada" : ($parameter["event"] === "SWITCH_PLAN" ? "Troca de Plano de Assinatura" : ($parameter["event"] === "UPDATE_SUBSCRIPTION_CHARGE_DATE" ? "Troca de dia de Cobrança" : ($parameter["event"] === "CLUB_FIRST_ACCESS" ? "Primeiro Acesso" : ($parameter["event"] === "CLUB_MODULE_COMPLETED" ? "Módulo Completo" : $parameter["event"])))))))))))))))) : ($parameter["triggerMode"] === "smart" ? "Smart Trigger: Múltiplas Saídas" : "Super Smart: Separação de Assinaturas")}}',
    description: 'Recebe eventos da Hotmart via webhooks',
    defaults: {
      name: 'Hotmart Trigger',
    },
    inputs: [],
    outputs:
      `={{$parameter["triggerMode"] === "standard" ? ['main'] : (${configureOutputNames})($parameter)}}`,
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        responseData: 'OK',
        path: `={{$parameter["triggerMode"] === "standard" ? "hotmart" : ($parameter["triggerMode"] === "smart" ? "hotmart-smart" : "hotmart-super-smart")}}`,
        // Removido isFullPath para usar o padrão do n8n com identificadores únicos
        eventTriggerDescription: 'Aguardando chamada para a URL do webhook',
        activationMessage:
          'Seu webhook Hotmart está ativo. Configure no painel da Hotmart a URL acima.',
      },
    ],
    properties: [
      // Notice explicativo com link para documentação
      {
        displayName:
          'Como configurar este webhook na Hotmart? <a href="https://developers.hotmart.com/docs/pt-BR/1.0.0/webhook/using-webhook/" target="_blank">Clique aqui</a>',
        name: 'webhookNotice',
        type: 'notice',
        default: '',
      },
      {
        displayName: 'Modo de Trigger',
        name: 'triggerMode',
        type: 'options',
        options: [
          {
            name: 'Padrão (Uma Saída)',
            value: 'standard',
          },
          {
            name: 'Smart (Múltiplas Saídas)',
            value: 'smart',
          },
          {
            name: 'Super Smart (Separa Assinaturas)',
            value: 'super-smart',
          },
        ],
        default: 'standard',
        description: 'Define como os dados serão processados',
      },
      // Notice explicativa para modo Smart Trigger
      {
        displayName:
          'O modo Smart Trigger permite fluxos diferentes para cada tipo de evento sem precisar de nós condicionais adicionais',
        name: 'smartTriggerExplanation',
        type: 'notice',
        default: '',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
          },
        },
      },
      // Notice explicativa para modo Super Smart
      {
        displayName:
          'O modo Super Smart separa automaticamente compras normais, assinaturas novas e renovações de assinaturas, facilitando mensagens personalizadas para cada caso',
        name: 'superSmartTriggerExplanation',
        type: 'notice',
        default: '',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
          },
        },
      },
      // Notice explicativa para modo Padrão
      {
        displayName:
          'Dica: O modo Smart Trigger está disponível se você precisar de fluxos diferentes para cada tipo de evento',
        name: 'standardTriggerExplanation',
        type: 'notice',
        default: '',
        displayOptions: {
          show: {
            triggerMode: ['standard'],
          },
        },
      },
      {
        displayName: 'Evento',
        name: 'event',
        type: 'options',
        required: true,
        default: '*',
        options: Object.values(webhookEvents),
        description:
          'Selecione o evento específico que este webhook deve processar. Escolha "Todos" para receber qualquer tipo de evento da Hotmart. Eventos são notificações de ações como compras, assinaturas e acessos.',
        displayOptions: {
          show: {
            triggerMode: ['standard'],
          },
        },
      },
      {
        displayName: 'Usar Token de Verificação',
        name: 'useHotTokToken',
        type: 'boolean',
        default: false,
        description:
          'Se deve validar o token enviado no cabeçalho X-HOTMART-HOTTOK. Aumenta a segurança validando que o webhook veio da Hotmart.',
      },
      {
        displayName: 'Token de Verificação',
        name: 'hotTokToken',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            useHotTokToken: [true],
          },
        },
        description: 'Token de verificação enviado pela Hotmart no cabeçalho X-HOTMART-HOTTOK',
      },
      // Propriedades para personalização de saídas
      {
        displayName: 'Personalizar Nomes das Saídas',
        name: 'customizeOutputs',
        type: 'boolean',
        default: false,
        description: 'Use nomes alternativos mais curtos para as saídas (visual apenas)',
        displayOptions: {
          show: {
            triggerMode: ['smart', 'super-smart'],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_APPROVED',
        name: 'outputName0',
        type: 'string',
        default: 'Aprovada',
        description: 'Nome personalizado para a saída de Compra Aprovada',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_COMPLETE',
        name: 'outputName1',
        type: 'string',
        default: 'Completa',
        description: 'Nome personalizado para a saída de Compra Completa',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_CANCELED',
        name: 'outputName2',
        type: 'string',
        default: 'Cancelada',
        description: 'Nome personalizado para a saída de Compra Cancelada',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_REFUNDED',
        name: 'outputName3',
        type: 'string',
        default: 'Reembolso',
        description: 'Nome personalizado para a saída de Compra Reembolsada',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_CHARGEBACK',
        name: 'outputName4',
        type: 'string',
        default: 'Chargeback',
        description: 'Nome personalizado para a saída de Compra com Chargeback',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_BILLET_PRINTED',
        name: 'outputName5',
        type: 'string',
        default: 'Boleto',
        description: 'Nome personalizado para a saída de Boleto Impresso',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_PROTEST',
        name: 'outputName6',
        type: 'string',
        default: 'Disputa',
        description: 'Nome personalizado para a saída de Compra em Disputa',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_EXPIRED',
        name: 'outputName7',
        type: 'string',
        default: 'Expirada',
        description: 'Nome personalizado para a saída de Compra Expirada',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_DELAYED',
        name: 'outputName8',
        type: 'string',
        default: 'Atrasada',
        description: 'Nome personalizado para a saída de Compra Atrasada',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_OUT_OF_SHOPPING_CART',
        name: 'outputName9',
        type: 'string',
        default: 'Abandono',
        description: 'Nome personalizado para a saída de Abandono de Carrinho',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: SUBSCRIPTION_CANCELLATION',
        name: 'outputName10',
        type: 'string',
        default: 'Ass. Cancelada',
        description: 'Nome personalizado para a saída de Assinatura Cancelada',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: SWITCH_PLAN',
        name: 'outputName11',
        type: 'string',
        default: 'Troca de Plano',
        description: 'Nome personalizado para a saída de Troca de Plano',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: UPDATE_SUBSCRIPTION_CHARGE_DATE',
        name: 'outputName12',
        type: 'string',
        default: 'Troca de Data',
        description: 'Nome personalizado para a saída de Troca de dia de Cobrança',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: CLUB_FIRST_ACCESS',
        name: 'outputName13',
        type: 'string',
        default: 'Primeiro Acesso',
        description: 'Nome personalizado para a saída de Primeiro Acesso',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: CLUB_MODULE_COMPLETED',
        name: 'outputName14',
        type: 'string',
        default: 'Módulo Completo',
        description: 'Nome personalizado para a saída de Módulo Completo',
        displayOptions: {
          show: {
            triggerMode: ['smart'],
            customizeOutputs: [true],
          },
        },
      },
      // Adicionando campos para personalização dos nomes das saídas no modo Super Smart
      {
        displayName: 'Nome alternativo para: PURCHASE_APPROVED (Compra Única)',
        name: 'outputNameSuper0',
        type: 'string',
        default: 'Compra Única',
        description: 'Nome personalizado para a saída de Compra Aprovada (pagamento único)',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_APPROVED (Assinatura)',
        name: 'outputNameSuper1',
        type: 'string',
        default: 'Assinatura',
        description: 'Nome personalizado para a saída de Assinatura Nova Aprovada',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_APPROVED (Renovação)',
        name: 'outputNameSuper2',
        type: 'string',
        default: 'Renovação',
        description: 'Nome personalizado para a saída de Renovação de Assinatura',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_COMPLETE',
        name: 'outputNameSuper3',
        type: 'string',
        default: 'Completa',
        description: 'Nome personalizado para a saída de Compra Completa',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_CANCELED',
        name: 'outputNameSuper4',
        type: 'string',
        default: 'Cancelada',
        description: 'Nome personalizado para a saída de Compra Cancelada',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_REFUNDED',
        name: 'outputNameSuper5',
        type: 'string',
        default: 'Reembolso',
        description: 'Nome personalizado para a saída de Reembolso',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_CHARGEBACK',
        name: 'outputNameSuper6',
        type: 'string',
        default: 'Chargeback',
        description: 'Nome personalizado para a saída de Compra com Chargeback',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_BILLET_PRINTED',
        name: 'outputNameSuper7',
        type: 'string',
        default: 'Boleto',
        description: 'Nome personalizado para a saída de Boleto Impresso',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_BILLET_PRINTED (PIX)',
        name: 'outputNameSuper17',
        type: 'string',
        default: 'PIX',
        description: 'Nome personalizado para a saída de PIX Gerado',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_PROTEST',
        name: 'outputNameSuper8',
        type: 'string',
        default: 'Disputa',
        description: 'Nome personalizado para a saída de Compra em Disputa',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_EXPIRED',
        name: 'outputNameSuper9',
        type: 'string',
        default: 'Expirada',
        description: 'Nome personalizado para a saída de Compra Expirada',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_DELAYED',
        name: 'outputNameSuper10',
        type: 'string',
        default: 'Atrasada',
        description: 'Nome personalizado para a saída de Compra Atrasada',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: PURCHASE_OUT_OF_SHOPPING_CART',
        name: 'outputNameSuper11',
        type: 'string',
        default: 'Abandono',
        description: 'Nome personalizado para a saída de Abandono de Carrinho',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: SUBSCRIPTION_CANCELLATION',
        name: 'outputNameSuper12',
        type: 'string',
        default: 'Ass. Cancelada',
        description: 'Nome personalizado para a saída de Assinatura Cancelada',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: SWITCH_PLAN',
        name: 'outputNameSuper13',
        type: 'string',
        default: 'Troca de Plano',
        description: 'Nome personalizado para a saída de Troca de Plano',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: UPDATE_SUBSCRIPTION_CHARGE_DATE',
        name: 'outputNameSuper14',
        type: 'string',
        default: 'Troca de Data',
        description: 'Nome personalizado para a saída de Troca de dia de Cobrança',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: CLUB_FIRST_ACCESS',
        name: 'outputNameSuper15',
        type: 'string',
        default: 'Primeiro Acesso',
        description: 'Nome personalizado para a saída de Primeiro Acesso',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
      {
        displayName: 'Nome alternativo para: CLUB_MODULE_COMPLETED',
        name: 'outputNameSuper16',
        type: 'string',
        default: 'Módulo Completo',
        description: 'Nome personalizado para a saída de Módulo Completo',
        displayOptions: {
          show: {
            triggerMode: ['super-smart'],
            customizeOutputs: [true],
          },
        },
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');

        // No caso dos webhooks Hotmart, não precisamos verificar um registro externo
        // pois o webhook é registrado manualmente no painel da Hotmart
        if (webhookData.webhookId === undefined) {
          return false;
        }

        return true;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const triggerMode = this.getNodeParameter('triggerMode', 'standard') as string;

        let webhookUrlWithSecret = webhookUrl;

        // Adicionar um campo na descrição com a URL do webhook
        const webhookData = this.getWorkflowStaticData('node');
        webhookData.webhookId = `manual-${Date.now()}`;
        webhookData.webhookUrl = webhookUrlWithSecret;

        const nodeName = triggerMode === 'standard' ? 'HotmartTrigger' : 'HotmartSmartTrigger';

        // Log informando a URL de webhook configurada
        this.logger.debug(`\n[${nodeName}] ======== IMPORTANTE ========`);
        this.logger.debug(`[${nodeName}] Configure esta URL no painel de webhooks da Hotmart:`);
        this.logger.debug(`[${nodeName}]`, { url: webhookUrlWithSecret });

        if (triggerMode === 'standard') {
          webhookData.webhookEvent = this.getNodeParameter('event', '*') as string;
          this.logger.debug(`[${nodeName}] Selecione o evento:`, { event: webhookData.webhookEvent });
        } else {
          this.logger.debug(`[${nodeName}] Selecione os eventos de interesse`);
        }

        this.logger.debug(`[${nodeName}] ==============================\n`);

        // Salvar o token de verificação se a verificação estiver ativada
        const useHotTokToken = this.getNodeParameter('useHotTokToken', false) as boolean;
        if (useHotTokToken) {
          const hotTokToken = this.getNodeParameter('hotTokToken', '') as string;
          if (hotTokToken) {
            webhookData.hotTokToken = hotTokToken;
          }
        }

        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const triggerMode = this.getNodeParameter('triggerMode', 'standard') as string;
        const nodeName = triggerMode === 'standard' ? 'HotmartTrigger' : 'HotmartSmartTrigger';

        if (webhookData.webhookId !== undefined) {
          // O webhook está configurado manualmente na Hotmart, então só precisamos
          // remover os dados locais e orientar o usuário a remover o webhook na Hotmart
          this.logger.debug(
            `\n[${nodeName}] Webhook local removido. Lembre-se de remover também o webhook no painel da Hotmart:`
          );
          this.logger.debug(`[${nodeName}] https://app-vlc.hotmart.com/tools/webhook\n`);

          // Remover dados do webhook do armazenamento estático
          delete webhookData.webhookId;
          delete webhookData.webhookEvent;
          delete webhookData.hotTokToken;
          delete webhookData.webhookUrl;
        }

        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();
    // Como removemos a função de verificação de URL secreta, não precisamos mais do req
    // const req = this.getRequestObject();
    const headerData = this.getHeaderData();
    const webhookData = this.getWorkflowStaticData('node');
    const res = this.getResponseObject();
    const triggerMode = this.getNodeParameter('triggerMode', 'standard') as string;
    const nodeName = triggerMode === 'standard' ? 'HotmartTrigger' : 'HotmartSmartTrigger';

    // Verificar token de verificação enviado no cabeçalho HTTP
    const hottok =
      headerData && headerData['x-hotmart-hottok']
        ? (headerData['x-hotmart-hottok'] as string)
        : undefined;

    // Verificar se o token de verificação está configurado e corresponde
    if (hottok && webhookData.hotTokToken && hottok !== webhookData.hotTokToken) {
      this.logger.debug(`[${nodeName}] Erro: Token de verificação não corresponde ao configurado`);
      res.status(401).send('Token inválido');
      return {
        noWebhookResponse: true,
      };
    }

    // Verificar o evento
    const event = getEvent.call(this);
    if (event === undefined || event === null) {
      this.logger.debug(`[${nodeName}] Evento desconhecido:`, { event: (bodyData as IDataObject).event || 'undefined' });
      res.status(400).send('Evento desconhecido');
      return {
        noWebhookResponse: true,
      };
    }

    // Modo padrão (uma única saída)
    if (triggerMode === 'standard') {
      if (
        event !== undefined &&
        (webhookEvents[event as WebhookEventTypes].value === this.getNodeParameter('event') ||
        this.getNodeParameter('event') === '*')
      ) {
        // Verificar se é uma transação de assinatura
        // Um evento é considerado assinatura se:
        // 1. Contém dados de assinatura (subscription.subscriber.code)
        // 2. Indica compra de assinatura (purchase.is_subscription = true)
        // 3. É um evento específico de assinatura (SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, UPDATE_SUBSCRIPTION_CHARGE_DATE)
        // Resolve problema de tipagem convertendo explicitamente
        const dataObj = ((bodyData as IDataObject).data as IDataObject) || {};
        const eventValue = String((bodyData as IDataObject).event || '');

        const isSubscription = Boolean(
          (dataObj.subscription &&
            ((dataObj.subscription as IDataObject)?.subscriber as IDataObject)?.code) ||
            (dataObj.purchase && (dataObj.purchase as IDataObject)?.is_subscription) ||
            [
              'SUBSCRIPTION_CANCELLATION',
              'SWITCH_PLAN',
              'UPDATE_SUBSCRIPTION_CHARGE_DATE',
            ].includes(eventValue)
        );

        // Logar informações para depuração
        this.logger.debug(`[${nodeName}] ============ DEBUG ============`);
        this.logger.debug(`[${nodeName}] Evento recebido:`, { event: event !== undefined ? webhookEvents[event as WebhookEventTypes].name : 'Unknown' });
        this.logger.debug(`[${nodeName}] É assinatura:`, { isSubscription: isSubscription ? 'Sim' : 'Não' });
        this.logger.debug(`[${nodeName}] Token de verificação recebido:`, { token: hottok });
        this.logger.debug(`[${nodeName}] ================================`);

        // Adicionar informações úteis aos dados retornados com metadados melhorados
        const returnData = {
          ...(bodyData as IDataObject),
          eventName: event !== undefined ? webhookEvents[event as WebhookEventTypes].name : 'Unknown',
          eventType: event !== undefined ? webhookEvents[event as WebhookEventTypes].value : 'UNKNOWN',
          receivedAt: new Date().toISOString(),
          isSubscription,
          metadata: {
            hottok,
            headers: headerData,
          },
        };

        return {
          workflowData: [this.helpers.returnJsonArray(returnData)],
        };
      }

      res.status(400).send('Evento não corresponde à inscrição');
      return {
        noWebhookResponse: true,
      };
    }

    // Criar arrays vazios para cada saída possível
    let outputData: INodeExecutionData[][] = [];
    let outputIndex = -1;

    // Modo Smart normal
    if (triggerMode === 'smart') {
      // Determinar para qual saída o evento deve ser direcionado
      outputData = Array(15)
        .fill(0)
        .map(() => []);

      switch ((bodyData as IDataObject).event) {
        case 'PURCHASE_APPROVED':
        case '1': // Compatibilidade com valor numérico
          outputIndex = 0;
          break;
        case 'PURCHASE_COMPLETE':
          outputIndex = 1;
          break;
        case 'PURCHASE_CANCELED':
          outputIndex = 2;
          break;
        case 'PURCHASE_REFUNDED':
          outputIndex = 3;
          break;
        case 'PURCHASE_CHARGEBACK':
          outputIndex = 4;
          break;
        case 'PURCHASE_BILLET_PRINTED':
          outputIndex = 5;
          break;
        case 'PURCHASE_PROTEST':
          outputIndex = 6;
          break;
        case 'PURCHASE_EXPIRED':
          outputIndex = 7;
          break;
        case 'PURCHASE_DELAYED':
          outputIndex = 8;
          break;
        case 'PURCHASE_OUT_OF_SHOPPING_CART':
          outputIndex = 9;
          break;
        case 'SUBSCRIPTION_CANCELLATION':
          outputIndex = 10;
          break;
        case 'SWITCH_PLAN':
          outputIndex = 11;
          break;
        case 'UPDATE_SUBSCRIPTION_CHARGE_DATE':
          outputIndex = 12;
          break;
        case 'CLUB_FIRST_ACCESS':
          outputIndex = 13;
          break;
        case 'CLUB_MODULE_COMPLETED':
          outputIndex = 14;
          break;
        default:
          // Se for um evento não mapeado, não enviamos para nenhuma saída
          this.logger.debug(`[${nodeName}] Evento não reconhecido: ${(bodyData as IDataObject).event}`);
          res.status(400).send('Evento desconhecido');
          return {
            noWebhookResponse: true,
          };
      }

      // Adicionar os dados apenas na saída correspondente ao evento
      if (outputIndex >= 0) {
        const jsonData = this.helpers.returnJsonArray(bodyData);
        outputData[outputIndex] = jsonData;
        return {
          workflowData: outputData,
        };
      }
    }
    // Modo Super Smart - separa compras normais, assinaturas novas e renovações
    else if (triggerMode === 'super-smart') {
      // Criar arrays vazios para cada saída possível (18 saídas, incluindo a nova saída para PIX)
      outputData = Array(18)
        .fill(0)
        .map(() => []);

      // Verificar dados para classificação de assinatura
      const dataObj = ((bodyData as IDataObject).data as IDataObject) || {};
      const recurrenceNumber = dataObj.purchase
        ? ((dataObj.purchase as IDataObject).recurrence_number as number) || 0
        : 0;

      // Verificar se é uma transação de assinatura
      // Um evento é considerado assinatura se:
      // 1. Contém dados de assinatura (subscription.subscriber.code)
      // 2. Indica compra de assinatura (purchase.is_subscription = true)
      // 3. É um evento específico de assinatura (SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, UPDATE_SUBSCRIPTION_CHARGE_DATE)
      const eventValue = String((bodyData as IDataObject).event || '');

      const isSubscription = Boolean(
        (dataObj.subscription &&
          ((dataObj.subscription as IDataObject)?.subscriber as IDataObject)?.code) ||
          (dataObj.purchase && (dataObj.purchase as IDataObject)?.is_subscription) ||
          ['SUBSCRIPTION_CANCELLATION', 'SWITCH_PLAN', 'UPDATE_SUBSCRIPTION_CHARGE_DATE'].includes(
            eventValue
          )
      );

      // Determinar se é renovação ou nova assinatura
      const isRenewal = isSubscription && recurrenceNumber > 1;

      // Adicionar aos dados retornados para debugging
      const superSmartData = {
        ...(bodyData as IDataObject),
        eventName: event !== undefined ? webhookEvents[event as WebhookEventTypes].name : 'Unknown',
        eventType: event !== undefined ? webhookEvents[event as WebhookEventTypes].value : 'UNKNOWN',
        receivedAt: new Date().toISOString(),
        isSubscription,
        isRenewal,
        recurrenceNumber,
        isPrimarySubscription: isSubscription && !isRenewal,
        metadata: {
          hottok,
          headers: headerData,
        },
      };

      // Determinar para qual saída o evento deve ser direcionado com base no tipo de compra
      switch ((bodyData as IDataObject).event) {
        case 'PURCHASE_APPROVED':
        case '1': // Compatibilidade com valor numérico
          if (isSubscription) {
            outputIndex = isRenewal ? 2 : 1; // Renovação ou Nova Assinatura
          } else {
            outputIndex = 0; // Compra normal
          }
          break;
        case 'PURCHASE_COMPLETE':
          // Simplificado para uma única saída
          outputIndex = 3;
          break;
        case 'PURCHASE_CANCELED':
          outputIndex = 4;
          break;
        case 'PURCHASE_REFUNDED':
          outputIndex = 5;
          break;
        case 'PURCHASE_CHARGEBACK':
          outputIndex = 6;
          break;
        case 'PURCHASE_BILLET_PRINTED':
          // Verificar se o método de pagamento é PIX
          const paymentData = dataObj.purchase
            ? ((dataObj.purchase as IDataObject)?.payment as IDataObject)
            : undefined;
          const paymentType = paymentData?.type as string;

          // Adicionar informações de método de pagamento aos metadados
          (superSmartData as IDataObject).paymentMethod = paymentType || 'UNKNOWN';
          (superSmartData as IDataObject).paymentInfo = {
            isBillet: paymentType === 'BILLET',
            isPix: paymentType === 'PIX',
            isCard: paymentType === 'CREDIT_CARD',
            isDigital: ['PIX', 'PAYPAL', 'WALLET'].includes(paymentType as string),
          };

          // Rotear para saída específica com base no método de pagamento
          if (paymentType === 'PIX') {
            outputIndex = 8; // Nova saída para PIX (logo após Boleto)
            this.logger.debug(`[${nodeName}] Detectado pagamento PIX, roteando para saída PIX`);
          } else {
            outputIndex = 7; // Saída padrão para Boleto
          }
          break;
        case 'PURCHASE_PROTEST':
          outputIndex = 9; // Incrementado por causa da nova saída PIX
          break;
        case 'PURCHASE_EXPIRED':
          outputIndex = 10; // Incrementado por causa da nova saída PIX
          break;
        case 'PURCHASE_DELAYED':
          outputIndex = 11; // Incrementado por causa da nova saída PIX
          break;
        case 'PURCHASE_OUT_OF_SHOPPING_CART':
          outputIndex = 12; // Incrementado por causa da nova saída PIX
          break;
        case 'SUBSCRIPTION_CANCELLATION':
          outputIndex = 13; // Incrementado por causa da nova saída PIX
          break;
        case 'SWITCH_PLAN':
          outputIndex = 14; // Incrementado por causa da nova saída PIX
          break;
        case 'UPDATE_SUBSCRIPTION_CHARGE_DATE':
          outputIndex = 15; // Incrementado por causa da nova saída PIX
          break;
        case 'CLUB_FIRST_ACCESS':
          outputIndex = 16; // Incrementado por causa da nova saída PIX
          break;
        case 'CLUB_MODULE_COMPLETED':
          outputIndex = 17; // Incrementado por causa da nova saída PIX
          break;
        default:
          // Se for um evento não mapeado, não enviamos para nenhuma saída
          this.logger.debug(`[${nodeName}] Evento não reconhecido: ${(bodyData as IDataObject).event}`);
          res.status(400).send('Evento desconhecido');
          return {
            noWebhookResponse: true,
          };
      }

      // Logging específico para modo Super Smart
      this.logger.debug(`[${nodeName}] ============ SUPER SMART DEBUG ============`);
      this.logger.debug(`[${nodeName}] Evento:`, { event: (bodyData as IDataObject).event });
      this.logger.debug(`[${nodeName}] É assinatura:`, { isSubscription: isSubscription ? 'Sim' : 'Não' });
      this.logger.debug(`[${nodeName}] Número da recorrência:`, { recurrenceNumber });
      this.logger.debug(`[${nodeName}] É renovação:`, { isRenewal: isRenewal ? 'Sim' : 'Não' });
      this.logger.debug(`[${nodeName}] Saída selecionada:`, { outputIndex });
      this.logger.debug(`[${nodeName}] ===========================================`);

      // Adicionar os dados apenas na saída correspondente ao evento
      if (outputIndex >= 0) {
        const jsonData = this.helpers.returnJsonArray(superSmartData);
        outputData[outputIndex] = jsonData;
        return {
          workflowData: outputData,
        };
      }
    }

    // Se chegou aqui, algo deu errado
    res.status(500).send('Erro interno');
    return {
      noWebhookResponse: true,
    };
  }
}
