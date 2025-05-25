import type { INodeTypeDescription } from 'n8n-workflow';
import { WEBHOOK_EVENTS, EVENT_CONFIG } from './constants/events';
import { TRIGGER_MODES, TRIGGER_OPTIONS } from './constants/options';

export const HotmartTriggerDescription: INodeTypeDescription = {
  displayName: 'Hotmart Trigger',
  name: 'hotmartTrigger',
  icon: {
    light: 'file:hotmart.svg',
    dark: 'file:hotmart.svg',
  },
  group: ['trigger'],
  version: 1,
  subtitle: generateSubtitle(),
  description: 'Inicia o fluxo quando eventos específicos ocorrem na Hotmart',
  eventTriggerDescription: 'Aguardando eventos do webhook Hotmart',
  activationMessage: 'Agora você receberá dados automaticamente da Hotmart',
  defaults: {
    name: 'Hotmart Trigger',
  },
  inputs: [],
  outputs: ['main'],
  webhooks: [
    {
      name: 'default',
      httpMethod: 'POST',
      responseMode: 'onReceived',
      path: 'webhook',
    },
  ],
  properties: [
    TRIGGER_MODES,
    TRIGGER_OPTIONS,
    generateEventOptions(),
    generateInfoBox(),
  ],
};

function generateSubtitle(): string {
  const eventNames = WEBHOOK_EVENTS.map(event => EVENT_CONFIG[event].displayName);
  const base = '={{$parameter["mode"] === "standard" ? ';
  const conditions = eventNames.map((name, index) => 
    `$parameter["event"] === "${WEBHOOK_EVENTS[index]}" ? "Evento: ${name}" : `
  ).join('');
  
  return `${base}($parameter["event"] === "all" ? "Todos os eventos" : ${conditions}"Evento não configurado") : $parameter["mode"] === "smart" ? "Modo Smart (múltiplas saídas)" : "Modo Super Smart (purchase types)"}}`;
}

function generateEventOptions() {
  return {
    displayName: 'Evento',
    name: 'event',
    type: 'options' as const,
    displayOptions: {
      show: {
        mode: ['standard'],
      },
    },
    options: [
      {
        name: 'Todos os Eventos',
        value: 'all',
        description: 'Recebe todos os eventos do webhook',
      },
      ...WEBHOOK_EVENTS.map(event => ({
        name: EVENT_CONFIG[event].displayName,
        value: event,
        description: `Evento ${event}`,
      })),
    ],
    default: 'all',
    description: 'Qual evento do webhook deve disparar este nó',
  };
}

function generateInfoBox() {
  return {
    displayName: 'Informação',
    name: 'info',
    type: 'notice' as const,
    displayOptions: {
      show: {
        mode: ['smart', 'superSmart'],
      },
    },
    default: '',
    description: 'No modo Smart, cada tipo de evento terá sua própria saída. Configure as conexões apropriadas para cada tipo de evento que deseja processar.',
  };
}