import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';

export const description: INodeProperties[] = [
  {
    displayName: 'Aviso Importante',
    name: 'notice',
    type: 'notice',
    default: '',
    description: '⚠️ Esta operação gera um link de pagamento para negociação de parcelas em atraso. O link gerado tem validade de 30 dias e permite o pagamento de múltiplas parcelas de uma só vez.',
    displayOptions: {
      show: {
        resource: ['negotiate'],
        operation: ['generateNegotiation'],
      },
    },
  },
  {
    displayName: 'ID da Assinatura',
    name: 'subscriptionId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sub_AbCdEfGhIjKlMnOp',
    description: 'Número de identificação da assinatura na Hotmart. Exemplo: sub_AbCdEfGhIjKlMnOp',
    hint: 'Encontre o ID na listagem de assinaturas ou nos detalhes da venda',
    displayOptions: {
      show: {
        resource: ['negotiate'],
        operation: ['generateNegotiation'],
      },
    },
  },
  {
    displayName: 'Número de Parcelas para Negociar',
    name: 'recurrences',
    type: 'string',
    required: true,
    default: '1',
    placeholder: '1,2,3',
    description: 'Números das parcelas em atraso para incluir na negociação. Separe por vírgula. Exemplo: 1,2,3',
    hint: 'Informe até 5 parcelas. A parcela 1 é a mais antiga em atraso',
    displayOptions: {
      show: {
        resource: ['negotiate'],
        operation: ['generateNegotiation'],
      },
    },
  },
  {
    displayName: 'Tipo de Pagamento',
    name: 'paymentType',
    type: 'options',
    options: [
      { 
        name: 'Boleto Bancário', 
        value: 'BILLET',
        description: 'Gera boleto com vencimento em 3 dias úteis'
      },
      { 
        name: 'PIX', 
        value: 'PIX',
        description: 'Gera código PIX para pagamento imediato'
      },
    ],
    required: true,
    default: 'BILLET',
    description: 'Método de pagamento para quitar as parcelas em atraso',
    hint: 'PIX tem compensação imediata, Boleto em até 2 dias úteis',
    displayOptions: {
      show: {
        resource: ['negotiate'],
        operation: ['generateNegotiation'],
      },
    },
  },
  {
    displayName: 'Configurações Opcionais',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Adicionar Configuração',
    default: {},
    description: 'Configurações adicionais para a negociação',
    displayOptions: {
      show: {
        resource: ['negotiate'],
        operation: ['generateNegotiation'],
      },
    },
    options: [
      {
        displayName: 'Valor do Desconto',
        name: 'discountValue',
        type: 'number',
        typeOptions: {
          minValue: 0,
          numberPrecision: 2,
          numberStepSize: 0.01,
        },
        default: 0,
        placeholder: '50.00',
        description: 'Valor absoluto do desconto a ser aplicado no total. Exemplo: 50.00 para R$ 50,00',
        hint: 'O desconto será aplicado proporcionalmente entre as parcelas',
      },
      {
        displayName: 'CPF/CNPJ do Pagador',
        name: 'document',
        type: 'string',
        default: '',
        placeholder: '123.456.789-00',
        description: 'CPF ou CNPJ do pagador. Obrigatório para pagamento via boleto',
        hint: 'Informe apenas números ou no formato completo',
      },
    ],
  },
];

export const execute = async function (
  this: IExecuteFunctions,
  items: INodeExecutionData[]
): Promise<INodeExecutionData[][]> {
  const returnData: INodeExecutionData[] = [];

  // Se não houver itens de entrada (comum quando usado via AI/MCP), cria um item vazio
  const itemsToProcess = items.length === 0 ? [{ json: {} }] : items;

  for (let i = 0; i < itemsToProcess.length; i++) {
    try {
      const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
      const recurrencesStr = this.getNodeParameter('recurrences', i) as string;
      const paymentType = this.getNodeParameter('paymentType', i) as string;
      const additionalOptions = this.getNodeParameter('additionalOptions', i) as {
        discountValue?: number;
        document?: string;
      };

      // Converter a string de recorrências em um array de números
      const recurrencesArray = recurrencesStr
        .split(',')
        .map((r) => parseInt(r.trim()))
        .filter((n) => !isNaN(n));

      if (recurrencesArray.length === 0) {
        throw new Error('Pelo menos uma parcela válida deve ser fornecida');
      }

      if (recurrencesArray.length > 5) {
        throw new Error('No máximo 5 parcelas podem ser negociadas por vez');
      }

      // Validar que as parcelas são números positivos
      for (const parcela of recurrencesArray) {
        if (parcela < 1) {
          throw new Error('Os números das parcelas devem ser positivos (1, 2, 3...)');
        }
      }

      const body: {
        subscription_id: string;
        recurrences: number[];
        payment_type: string;
        discount?: {
          type: string;
          value: number;
        };
        document?: string;
      } = {
        subscription_id: subscriptionId,
        recurrences: recurrencesArray,
        payment_type: paymentType,
      };

      // Adicionar opções adicionais se fornecidas
      if (additionalOptions.discountValue !== undefined && additionalOptions.discountValue > 0) {
        body.discount = {
          type: 'CUSTOM',
          value: additionalOptions.discountValue,
        };
      }

      // Validar e adicionar documento se for boleto
      if (paymentType === 'BILLET' && (!additionalOptions.document || additionalOptions.document === '')) {
        throw new Error('CPF/CNPJ é obrigatório para pagamento via boleto');
      }

      if (additionalOptions.document !== undefined && additionalOptions.document !== '') {
        // Remover caracteres não numéricos do documento
        body.document = additionalOptions.document.replace(/\D/g, '');
      }

      // Fazer a requisição para gerar a negociação
      const responseData = await hotmartApiRequest.call(
        this,
        'POST',
        '/payments/api/v1/installments/negotiate',
        body
      );

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([(responseData as IDataObject) || {}]),
        { itemData: { item: i } }
      );

      returnData.push(...executionData);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
        continue;
      }
      throw error;
    }
  }

  return [returnData];
};
