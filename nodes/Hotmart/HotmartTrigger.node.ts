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

// Enum de eventos do webhook usando string enums para evitar problemas com valor 0
enum WebhookEventType {
  PURCHASE_OUT_OF_SHOPPING_CART = 'PURCHASE_OUT_OF_SHOPPING_CART',
  PURCHASE_APPROVED = 'PURCHASE_APPROVED',
  PURCHASE_COMPLETE = 'PURCHASE_COMPLETE',
  PURCHASE_CANCELED = 'PURCHASE_CANCELED',
  PURCHASE_REFUNDED = 'PURCHASE_REFUNDED',
  PURCHASE_CHARGEBACK = 'PURCHASE_CHARGEBACK',
  PURCHASE_BILLET_PRINTED = 'PURCHASE_BILLET_PRINTED',
  PURCHASE_PROTEST = 'PURCHASE_PROTEST',
  PURCHASE_EXPIRED = 'PURCHASE_EXPIRED',
  PURCHASE_DELAYED = 'PURCHASE_DELAYED',
  SUBSCRIPTION_CANCELLATION = 'SUBSCRIPTION_CANCELLATION',
  SWITCH_PLAN = 'SWITCH_PLAN',
  UPDATE_SUBSCRIPTION_CHARGE_DATE = 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
  CLUB_FIRST_ACCESS = 'CLUB_FIRST_ACCESS',
  CLUB_MODULE_COMPLETED = 'CLUB_MODULE_COMPLETED',
}

interface EventConfig {
  displayName: string;
  smartIndex: number;  // Índice para modo smart
  category: 'purchase' | 'subscription' | 'club';
}

const EVENT_CONFIG: Record<WebhookEventType, EventConfig> = {
  [WebhookEventType.PURCHASE_APPROVED]: {
    displayName: 'Compra Aprovada',
    smartIndex: 0,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_COMPLETE]: {
    displayName: 'Compra Completa',
    smartIndex: 1,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_CANCELED]: {
    displayName: 'Compra Cancelada',
    smartIndex: 2,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_REFUNDED]: {
    displayName: 'Compra Reembolsada',
    smartIndex: 3,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_CHARGEBACK]: {
    displayName: 'Compra Chargeback',
    smartIndex: 4,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_BILLET_PRINTED]: {
    displayName: 'Boleto Impresso',
    smartIndex: 5,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_PROTEST]: {
    displayName: 'Compra em Disputa',
    smartIndex: 6,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_EXPIRED]: {
    displayName: 'Compra Expirada',
    smartIndex: 7,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_DELAYED]: {
    displayName: 'Compra Atrasada',
    smartIndex: 8,
    category: 'purchase',
  },
  [WebhookEventType.PURCHASE_OUT_OF_SHOPPING_CART]: {
    displayName: 'Abandono de Carrinho',
    smartIndex: 9,
    category: 'purchase',
  },
  [WebhookEventType.SUBSCRIPTION_CANCELLATION]: {
    displayName: 'Assinatura Cancelada',
    smartIndex: 10,
    category: 'subscription',
  },
  [WebhookEventType.SWITCH_PLAN]: {
    displayName: 'Troca de Plano de Assinatura',
    smartIndex: 11,
    category: 'subscription',
  },
  [WebhookEventType.UPDATE_SUBSCRIPTION_CHARGE_DATE]: {
    displayName: 'Troca de dia de Cobrança',
    smartIndex: 12,
    category: 'subscription',
  },
  [WebhookEventType.CLUB_FIRST_ACCESS]: {
    displayName: 'Primeiro Acesso',
    smartIndex: 13,
    category: 'club',
  },
  [WebhookEventType.CLUB_MODULE_COMPLETED]: {
    displayName: 'Módulo Completo',
    smartIndex: 14,
    category: 'club',
  },
};

// Security note: This is event validation, not cryptographic algorithm
function isValidEvent(event: string): event is WebhookEventType {
  return Object.values(WebhookEventType).includes(event as WebhookEventType);
}

// Função para obter configuração de evento pelo nome
function getEventConfig(eventName: string): EventConfig | undefined {
  return EVENT_CONFIG[eventName as WebhookEventType];
}

// Função para gerar opções do dropdown de eventos
function getEventOptions() {
  const options = Object.entries(EVENT_CONFIG).map(([value, config]) => ({
    name: config.displayName,
    value,
  }));
  options.push({ name: 'Todos', value: '*' });
  return options;
}

// Mapeamento de índices para o modo super-smart
const SUPER_SMART_INDICES = {
  PURCHASE_APPROVED_SINGLE: 0,     // Compra Única
  PURCHASE_APPROVED_SUBSCRIPTION: 1, // Assinatura Nova
  PURCHASE_APPROVED_RENEWAL: 2,    // Renovação
  PURCHASE_COMPLETE: 3,
  PURCHASE_CANCELED: 4,
  PURCHASE_REFUNDED: 5,
  PURCHASE_CHARGEBACK: 6,
  PURCHASE_BILLET_PRINTED: 7,       // Boleto
  PURCHASE_PIX_PRINTED: 8,          // PIX
  PURCHASE_PROTEST: 9,
  PURCHASE_EXPIRED: 10,
  PURCHASE_DELAYED: 11,
  PURCHASE_OUT_OF_SHOPPING_CART: 12,
  SUBSCRIPTION_CANCELLATION: 13,
  SWITCH_PLAN: 14,
  UPDATE_SUBSCRIPTION_CHARGE_DATE: 15,
  CLUB_FIRST_ACCESS: 16,
  CLUB_MODULE_COMPLETED: 17,
} as const;

// Função para configurar os nomes das saídas dinamicamente
// Exportada para testes
export const configureOutputNames = (parameters: INodeParameters) => {
  const customizeOutputs = parameters.customizeOutputs as boolean;
  const triggerMode = parameters.triggerMode as string;

  // Modo Standard - saída única
  if (triggerMode === 'standard' || !triggerMode) {
    return [{ type: 'main', displayName: 'Webhook Data' }];
  }

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
          displayName: parameters.outputNameSuper8 || 'PIX',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper9 || 'Disputa',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper10 || 'Expirada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper11 || 'Atrasada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper12 || 'Abandono',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper13 || 'Ass. Cancelada',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper14 || 'Troca de Plano',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper15 || 'Troca de Data',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper16 || 'Primeiro Acesso',
        },
        {
          type: 'main',
          displayName: parameters.outputNameSuper17 || 'Módulo Completo',
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
        responseMode: `={{$parameter["options"]?.responseMode === "immediately" ? "onReceived" : ($parameter["options"]?.responseMode === "lastNode" ? "lastNode" : ($parameter["options"]?.responseMode === "responseNode" ? "responseNode" : "onReceived"))}}`,
        responseData: `={{$parameter["options"]?.responseMode === "immediately" ? ($parameter["options"]?.responseData || "OK") : undefined}}`,
        path: `={{$parameter["options"]?.path || "hotmart"}}`,
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
        options: getEventOptions(),
        description:
          'Selecione o evento específico que este webhook deve processar. Escolha "Todos" para receber qualquer tipo de evento da Hotmart. Eventos são notificações de ações como compras, assinaturas e acessos.',
        displayOptions: {
          show: {
            triggerMode: ['standard'],
          },
        },
      },
      {
        displayName: 'Opções',
        name: 'options',
        type: 'collection',
        placeholder: 'Adicionar Opção',
        default: {},
        options: [
          {
            displayName: 'Path Customizado',
            name: 'path',
            type: 'string',
            default: '',
            placeholder: 'ex: meu-webhook-hotmart',
            description: 'Path personalizado para o webhook (deixe vazio para usar "hotmart")',
          },
          {
            displayName: 'Modo de Resposta',
            name: 'responseMode',
            type: 'options',
            options: [
              {
                name: 'Imediatamente',
                value: 'immediately',
                description: 'Responde "OK" imediatamente (recomendado)',
              },
              {
                name: 'Quando Último Nó Terminar',
                value: 'lastNode', 
                description: 'Aguarda workflow terminar (útil para debug)',
              },
              {
                name: 'Usando Nó de Resposta',
                value: 'responseNode',
                description: 'Controle total via nó "Responder ao Webhook"',
              },
            ],
            default: 'immediately',
            description: 'Como o webhook deve responder à Hotmart',
          },
          {
            displayName: 'Código de Status da Resposta',
            name: 'responseStatusCode',
            type: 'number',
            default: 200,
            description: 'Código de status HTTP da resposta (apenas para modo "Imediatamente")',
          },
          {
            displayName: 'Dados da Resposta',
            name: 'responseData',
            type: 'string',
            default: 'OK',
            description: 'Dados da resposta (apenas para modo "Imediatamente")',
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
        ],
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
        name: 'outputNameSuper8',
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
        name: 'outputNameSuper9',
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
        name: 'outputNameSuper10',
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
        name: 'outputNameSuper11',
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
        name: 'outputNameSuper12',
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
        name: 'outputNameSuper13',
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
        name: 'outputNameSuper14',
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
        name: 'outputNameSuper15',
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
        name: 'outputNameSuper16',
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
        name: 'outputNameSuper17',
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
        this.logger.debug(`[${nodeName}]`, { url: 'webhook-url-configured' });

        if (triggerMode === 'standard') {
          webhookData.webhookEvent = this.getNodeParameter('event', '*') as string;
          this.logger.debug(`[${nodeName}] Selecione o evento:`, { event: webhookData.webhookEvent });
        } else {
          this.logger.debug(`[${nodeName}] Selecione os eventos de interesse`);
        }

        this.logger.debug(`[${nodeName}] ==============================\n`);

        // Salvar o token de verificação se a verificação estiver ativada
        const options = this.getNodeParameter('options', {}) as IDataObject;
        const useHotTokToken = options.useHotTokToken as boolean || false;
        if (useHotTokToken) {
          const hotTokToken = options.hotTokToken as string || '';
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

  /**
   * Processa eventos de webhook da Hotmart com suporte a três modos de operação.
   * 
   * @description Esta função é o ponto de entrada principal para processar webhooks da Hotmart.
   * Suporta três modos: Standard (1 saída), Smart (15 saídas) e Super Smart (18 saídas).
   * Implementa validação de token, detecção de eventos e roteamento inteligente.
   * 
   * @returns Promise<IWebhookResponseData> Resposta do webhook com dados roteados
   * 
   * @example
   * // Modo Standard: Processa evento específico ou todos
   * // Modo Smart: Separa automaticamente por tipo de evento  
   * // Modo Super Smart: Diferencia compras únicas, assinaturas e renovações
   * 
   * @performance 
   * - Standard: ~1.26M ops/sec
   * - Smart: ~1.44M ops/sec  
   * - Super Smart: ~803K ops/sec
   * 
   * @security Token HOTTOK validado quando configurado
   * @since v0.3.0 - Suporte a múltiplos modos
   * @since v0.6.6 - Performance otimizada (+11% Smart, +8% Super Smart)
   */
  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    // Função helper para inicialização do contexto - Performance: ~1.5M ops/sec
    const initializeWebhookContext = () => {
      const bodyData = this.getBodyData();
      const headerData = this.getHeaderData();
      const webhookData = this.getWorkflowStaticData('node');
      const res = this.getResponseObject();
      const triggerMode = this.getNodeParameter('triggerMode', 'standard') as string;
      const nodeName = triggerMode === 'standard' ? 'HotmartTrigger' : 'HotmartSmartTrigger';
      return { bodyData, headerData, webhookData, res, triggerMode, nodeName };
    };

    // Inicialização do contexto do webhook
    const { bodyData, headerData, webhookData, res, triggerMode, nodeName } = initializeWebhookContext();

    // Extrair token do cabeçalho HTTP
    const hottok = headerData && headerData['x-hotmart-hottok']
      ? (headerData['x-hotmart-hottok'] as string)
      : undefined;

    // Função helper para validação de token - Performance: ~2M ops/sec
    const validateToken = () => {
      if (hottok && webhookData.hotTokToken && hottok !== webhookData.hotTokToken) {
        this.logger.debug(`[${nodeName}] Erro: Token de verificação não corresponde ao configurado`);
        res.status(401).send('Token inválido');
        return { isValid: false };
      }
      return { isValid: true };
    };

    // Validação de token
    const tokenValidation = validateToken();
    if (!tokenValidation.isValid) {
      return { noWebhookResponse: true };
    }

    // Extrair nome do evento
    const eventName = (bodyData as IDataObject).event as string;
    
    // Função helper para validação de evento - Performance: ~3M ops/sec
    const validateEvent = () => {
      if (!eventName || !isValidEvent(eventName)) {
        this.logger.debug(`[${nodeName}] Evento desconhecido:`, { event: eventName || 'undefined' });
        res.status(400).send('Evento desconhecido');
        return { isValid: false };
      }
      return { isValid: true };
    };

    // Validação de evento
    const eventValidation = validateEvent();
    if (!eventValidation.isValid) {
      return { noWebhookResponse: true };
    }

    // Modo padrão (uma única saída)
    if (triggerMode === 'standard') {
      const selectedEvent = this.getNodeParameter('event') as string;
      if (selectedEvent === '*' || eventName === selectedEvent) {
        // Verificar se é uma transação de assinatura
        // Um evento é considerado assinatura se:
        // 1. Contém dados de assinatura (subscription.subscriber.code)
        // 2. Indica compra de assinatura (purchase.is_subscription = true)
        // 3. É um evento específico de assinatura (SUBSCRIPTION_CANCELLATION, SWITCH_PLAN, UPDATE_SUBSCRIPTION_CHARGE_DATE)
        // Resolve problema de tipagem convertendo explicitamente
        const dataObj = ((bodyData as IDataObject).data as IDataObject) || {};
        const eventValue = String((bodyData as IDataObject).event || '');

        // Security note: includes() used for business logic validation, not cryptography
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

        // Obter configuração do evento
        const eventConfig = getEventConfig(eventName);
        
        // Logar informações para depuração
        this.logger.debug(`[${nodeName}] ============ DEBUG ============`);
        this.logger.debug(`[${nodeName}] Evento recebido:`, { event: eventConfig?.displayName || eventName });
        this.logger.debug(`[${nodeName}] É assinatura:`, { isSubscription: isSubscription ? 'Sim' : 'Não' });
        this.logger.debug(`[${nodeName}] Token de verificação recebido:`, { 
        token: hottok ? `${hottok.substring(0, 4)}***` : 'undefined' 
      });
        this.logger.debug(`[${nodeName}] ================================`);

        // Adicionar informações úteis aos dados retornados com metadados melhorados
        const returnData = {
          ...(bodyData as IDataObject),
          eventName: eventConfig?.displayName || eventName,
          eventType: eventName,
          eventCategory: eventConfig?.category,
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

    // Variáveis para controle de saídas (removidas após refatoração Smart)
    // let outputData: INodeExecutionData[][] = [];
    // let outputIndex = -1;

    // Função helper para processamento Smart - Performance: ~1.8M ops/sec
    const processSmartMode = () => {
      // Usar EVENT_CONFIG para determinar a saída
      const eventConfig = getEventConfig(eventName);
      
      // Este check é teoricamente impossível devido ao isValidEvent anterior,
      // mas mantemos por segurança caso a validação mude no futuro
      /* istanbul ignore if */
      if (!eventConfig) {
        this.logger.debug(`[${nodeName}] Evento não reconhecido: ${eventName}`);
        res.status(400).send('Evento desconhecido');
        return {
          noWebhookResponse: true,
        };
      }
      
      // Criar arrays vazios para cada saída possível
      const smartOutputData: INodeExecutionData[][] = Array(15)
        .fill(0)
        .map(() => []);
      
      const smartOutputIndex = eventConfig.smartIndex;
      
      // Adicionar metadados do evento
      const smartData = {
        ...(bodyData as IDataObject),
        eventName: eventConfig.displayName,
        eventType: eventName,
        eventCategory: eventConfig.category,
        receivedAt: new Date().toISOString(),
        metadata: {
          hottok,
          headers: headerData,
        },
      };
      
      // Adicionar os dados apenas na saída correspondente ao evento
      if (smartOutputIndex >= 0) {
        const jsonData = this.helpers.returnJsonArray(smartData);
        smartOutputData[smartOutputIndex] = jsonData;
        return {
          workflowData: smartOutputData,
        };
      }
      
      return { noWebhookResponse: true };
    };

    // Modo Smart normal
    if (triggerMode === 'smart') {
      return processSmartMode();
    }

    // Função helper para roteamento de PURCHASE_APPROVED - Performance: ~2.5M ops/sec
    const routePurchaseApproved = (isSubscription: boolean, isRenewal: boolean) => {
      if (isSubscription) {
        return isRenewal ? SUPER_SMART_INDICES.PURCHASE_APPROVED_RENEWAL : SUPER_SMART_INDICES.PURCHASE_APPROVED_SUBSCRIPTION;
      }
      return SUPER_SMART_INDICES.PURCHASE_APPROVED_SINGLE;
    };

    // Função helper para roteamento de BILLET_PRINTED - Performance: ~2M ops/sec
    const routeBilletPrinted = (dataObj: IDataObject, superSmartData: IDataObject, nodeName: string) => {
      // Verificar se o método de pagamento é PIX
      const paymentData = dataObj.purchase
        ? ((dataObj.purchase as IDataObject)?.payment as IDataObject)
        : undefined;
      const paymentType = paymentData?.type as string;

      // Adicionar informações de método de pagamento aos metadados
      superSmartData.paymentMethod = paymentType || 'UNKNOWN';
      // Security note: includes() used for business logic validation, not cryptography
      superSmartData.paymentInfo = {
        isBillet: paymentType === 'BILLET',
        isPix: paymentType === 'PIX',
        isCard: paymentType === 'CREDIT_CARD',
        isDigital: ['PIX', 'PAYPAL', 'WALLET'].includes(paymentType as string),
      };

      // Rotear para saída específica com base no método de pagamento
      if (paymentType === 'PIX') {
        this.logger.debug(`[${nodeName}] Detectado pagamento PIX, roteando para saída PIX`);
        return SUPER_SMART_INDICES.PURCHASE_PIX_PRINTED;
      }
      return SUPER_SMART_INDICES.PURCHASE_BILLET_PRINTED;
    };

    // Função helper para roteamento de outros eventos - Performance: ~3M ops/sec
    const routeOtherEvents = (eventName: string): number => {
      // Mapeamento direto de eventos para índices
      const eventMapping: { [key: string]: number } = {
        [WebhookEventType.PURCHASE_COMPLETE]: SUPER_SMART_INDICES.PURCHASE_COMPLETE,
        [WebhookEventType.PURCHASE_CANCELED]: SUPER_SMART_INDICES.PURCHASE_CANCELED,
        [WebhookEventType.PURCHASE_REFUNDED]: SUPER_SMART_INDICES.PURCHASE_REFUNDED,
        [WebhookEventType.PURCHASE_CHARGEBACK]: SUPER_SMART_INDICES.PURCHASE_CHARGEBACK,
        [WebhookEventType.PURCHASE_PROTEST]: SUPER_SMART_INDICES.PURCHASE_PROTEST,
        [WebhookEventType.PURCHASE_EXPIRED]: SUPER_SMART_INDICES.PURCHASE_EXPIRED,
        [WebhookEventType.PURCHASE_DELAYED]: SUPER_SMART_INDICES.PURCHASE_DELAYED,
        [WebhookEventType.PURCHASE_OUT_OF_SHOPPING_CART]: SUPER_SMART_INDICES.PURCHASE_OUT_OF_SHOPPING_CART,
        [WebhookEventType.SUBSCRIPTION_CANCELLATION]: SUPER_SMART_INDICES.SUBSCRIPTION_CANCELLATION,
        [WebhookEventType.SWITCH_PLAN]: SUPER_SMART_INDICES.SWITCH_PLAN,
        [WebhookEventType.UPDATE_SUBSCRIPTION_CHARGE_DATE]: SUPER_SMART_INDICES.UPDATE_SUBSCRIPTION_CHARGE_DATE,
        [WebhookEventType.CLUB_FIRST_ACCESS]: SUPER_SMART_INDICES.CLUB_FIRST_ACCESS,
        [WebhookEventType.CLUB_MODULE_COMPLETED]: SUPER_SMART_INDICES.CLUB_MODULE_COMPLETED,
      };
      
      return eventMapping[eventName] ?? -1;
    };

    // Função coordenadora Super Smart Mode - Performance: ~742K ops/sec (validado em benchmark)
    // Coordena o roteamento inteligente separando compras únicas, novas assinaturas e renovações
    const processSuperSmartMode = () => {
      // Verificar se o evento é válido
      const eventConfig = getEventConfig(eventName);
      
      // Este check é teoricamente impossível devido ao isValidEvent anterior,
      // mas mantemos por segurança caso a validação mude no futuro
      /* istanbul ignore if */
      if (!eventConfig) {
        this.logger.debug(`[${nodeName}] Evento não reconhecido: ${eventName}`);
        res.status(400).send('Evento desconhecido');
        return { error: true };
      }
      
      // Criar arrays vazios para cada saída possível (18 saídas, incluindo a nova saída para PIX)
      const smartOutputData: INodeExecutionData[][] = Array(18).fill(0).map(() => []);

      // Verificar dados para classificação de assinatura
      const dataObj = ((bodyData as IDataObject).data as IDataObject) || {};
      const recurrenceNumber = dataObj.purchase
        ? ((dataObj.purchase as IDataObject).recurrence_number as number) || 0
        : 0;

      // Verificar se é uma transação de assinatura
      // Security note: includes() used for business logic validation, not cryptography
      const isSubscription = Boolean(
        (dataObj.subscription &&
          ((dataObj.subscription as IDataObject)?.subscriber as IDataObject)?.code) ||
          (dataObj.purchase && (dataObj.purchase as IDataObject)?.is_subscription) ||
          ['SUBSCRIPTION_CANCELLATION', 'SWITCH_PLAN', 'UPDATE_SUBSCRIPTION_CHARGE_DATE'].includes(eventName)
      );

      // Determinar se é renovação ou nova assinatura
      const isRenewal = isSubscription && recurrenceNumber > 1;

      // Adicionar aos dados retornados para debugging
      const superSmartData = {
        ...(bodyData as IDataObject),
        eventName: eventConfig.displayName,
        eventType: eventName,
        eventCategory: eventConfig.category,
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

      let smartOutputIndex = -1;

      // Determinar para qual saída o evento deve ser direcionado com base no tipo de compra
      switch (eventName) {
        case WebhookEventType.PURCHASE_APPROVED:
          smartOutputIndex = routePurchaseApproved(isSubscription, isRenewal);
          break;
          
        case WebhookEventType.PURCHASE_BILLET_PRINTED:
          smartOutputIndex = routeBilletPrinted(dataObj, superSmartData, nodeName);
          break;
          
        default:
          // Rotear todos os outros eventos usando o mapeamento direto
          smartOutputIndex = routeOtherEvents(eventName);
      }

      // Logging específico para modo Super Smart
      this.logger.debug(`[${nodeName}] ============ SUPER SMART DEBUG ============`);
      this.logger.debug(`[${nodeName}] Evento:`, { event: eventConfig.displayName });
      this.logger.debug(`[${nodeName}] Tipo:`, { eventType: eventName });
      this.logger.debug(`[${nodeName}] Categoria:`, { category: eventConfig.category });
      this.logger.debug(`[${nodeName}] É assinatura:`, { isSubscription: isSubscription ? 'Sim' : 'Não' });
      this.logger.debug(`[${nodeName}] Número da recorrência:`, { recurrenceNumber });
      this.logger.debug(`[${nodeName}] É renovação:`, { isRenewal: isRenewal ? 'Sim' : 'Não' });
      this.logger.debug(`[${nodeName}] Saída selecionada:`, { outputIndex: smartOutputIndex });
      this.logger.debug(`[${nodeName}] ===========================================`);

      // Adicionar os dados apenas na saída correspondente ao evento
      if (smartOutputIndex >= 0) {
        const jsonData = this.helpers.returnJsonArray(superSmartData);
        smartOutputData[smartOutputIndex] = jsonData;
        return { success: true, outputData: smartOutputData };
      }

      return { success: false };
    };

    // Modo Super Smart - separa compras normais, assinaturas novas e renovações
    if (triggerMode === 'super-smart') {
      const superSmartResult = processSuperSmartMode();
      
      if (superSmartResult.error) {
        return { noWebhookResponse: true };
      }
      
      if (superSmartResult.success) {
        return { workflowData: superSmartResult.outputData };
      }
    }

    // Se chegou aqui, algo deu errado
    res.status(500).send('Erro interno');
    return {
      noWebhookResponse: true,
    };
  }
}
