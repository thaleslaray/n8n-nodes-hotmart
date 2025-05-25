import type { INodeProperties } from 'n8n-workflow';

export const TRIGGER_MODES: INodeProperties = {
  displayName: 'Modo',
  name: 'mode',
  type: 'options',
  options: [
    {
      name: 'Padrão',
      value: 'standard',
      description: 'Recebe eventos específicos em uma única saída',
    },
    {
      name: 'Smart',
      value: 'smart',
      description: 'Separa cada tipo de evento em saídas diferentes',
    },
    {
      name: 'Super Smart',
      value: 'superSmart',
      description: 'Agrupa eventos por tipo de compra (única, nova assinatura, renovação)',
    },
  ],
  default: 'standard',
  description: 'Como o trigger deve processar os eventos',
};

export const TRIGGER_OPTIONS: INodeProperties = {
  displayName: 'Opções',
  name: 'options',
  type: 'collection',
  placeholder: 'Adicionar Opção',
  default: {},
  options: [
    {
      displayName: 'Ignorar Eventos de Teste',
      name: 'ignoreTestEvents',
      type: 'boolean',
      default: false,
      description: 'Se ativado, eventos de teste serão ignorados',
    },
    {
      displayName: 'Validar Assinatura',
      name: 'validateSignature',
      type: 'boolean',
      default: false,
      description: 'Se ativado, valida a assinatura do webhook',
    },
  ],
};