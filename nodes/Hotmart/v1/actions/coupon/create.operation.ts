import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from '../../transport/request';
import { convertToTimestamp } from '../../helpers/dateUtils';
import type { CreateCouponBody } from '../../types';

export const description: INodeProperties[] = [
  {
    displayName: 'ID do Produto',
    name: 'product_id',
    type: 'options',
    required: true,
    default: '',
    description: 'Selecione o produto para o qual o cupom será válido. O cupom só poderá ser usado para este produto específico',
    hint: 'Escolha o produto da lista. Se não encontrar, verifique se tem permissão para acessá-lo',
    typeOptions: {
      loadOptionsMethod: 'getProducts',
    },
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Código do Cupom',
    name: 'code',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'Ex: PROMO2024, DESCONTO20, BLACKFRIDAY',
    description: 'Código único que seus clientes usarão para aplicar o desconto. Máximo de 25 caracteres',
    hint: 'Use códigos fáceis de lembrar e digitar. Evite caracteres especiais. Este código aparecerá no checkout',
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Percentual de Desconto (%)',
    name: 'discount',
    type: 'number',
    required: true,
    default: 10,
    placeholder: 'Ex: 10, 20, 50',
    description: 'Percentual de desconto que será aplicado ao valor do produto. Digite apenas o número (sem o símbolo %)',
    hint: 'Digite o valor do desconto entre 1 e 99. Por exemplo: 20 para 20% de desconto',
    typeOptions: {
      minValue: 1,
      maxValue: 99,
      numberPrecision: 0,
      numberStepSize: 1,
    },
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Opções Adicionais',
    name: 'options',
    type: 'collection',
    placeholder: 'Adicionar Opção',
    default: {},
    description: 'Configure validade, afiliados exclusivos e ofertas específicas para o cupom',
    displayOptions: {
      show: {
        resource: ['coupon'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Data de Início',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        placeholder: '2024-01-01 00:00:00',
        description: 'Data e hora em que o cupom começará a ser válido. Deixe vazio para ativar imediatamente',
        hint: 'Útil para campanhas programadas como Black Friday ou lançamentos. O cupom só funcionará a partir desta data',
      },
      {
        displayName: 'Data de Término',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        placeholder: '2024-12-31 23:59:59',
        description: 'Data e hora em que o cupom expirará e não poderá mais ser usado. Deixe vazio para cupom sem prazo',
        hint: 'Crie senso de urgência definindo uma data limite. Após esta data, o cupom será automaticamente desativado',
      },
      {
        displayName: 'ID do Afiliado',
        name: 'affiliate',
        type: 'string',
        default: '',
        placeholder: 'ABC123DEF456',
        description: 'ID do afiliado que terá exclusividade no uso deste cupom. Apenas vendas deste afiliado aceitarão o cupom',
        hint: 'Use para criar cupons exclusivos para parceiros específicos. Deixe vazio para cupom disponível a todos',
      },
      {
        displayName: 'IDs das Ofertas',
        name: 'offer_ids',
        type: 'string',
        default: '',
        placeholder: 'offer_123, offer_456, offer_789',
        description: 'IDs específicos das ofertas onde o cupom será válido. Separe múltiplos IDs por vírgula',
        hint: 'Deixe vazio para aplicar a TODAS as ofertas do produto. Use para restringir cupom a ofertas específicas como plano anual',
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
      const productId = this.getNodeParameter('product_id', i) as string;
      const code = this.getNodeParameter('code', i) as string;
      const discountPercentage = this.getNodeParameter('discount', i) as number;
      const discount = discountPercentage / 100; // Converter percentual para decimal
      const options = this.getNodeParameter('options', i, {}) as {
        start_date?: string;
        end_date?: string;
        affiliate?: string;
        offer_ids?: string;
      };

      const body: CreateCouponBody = {
        code,
        discount,
      };

      // Converter datas para timestamp se fornecidas
      if (options.start_date) {
        body.start_date = convertToTimestamp(options.start_date);
      }

      if (options.end_date) {
        body.end_date = convertToTimestamp(options.end_date);
      }

      if (options.affiliate) {
        body.affiliate = options.affiliate;
      }

      // offer_ids é obrigatório, mesmo que vazio
      if (options.offer_ids && options.offer_ids.trim() !== '') {
        body.offer_ids = options.offer_ids.split(',').map((id) => id.trim());
      } else {
        body.offer_ids = [];
      }

      const response = await hotmartApiRequest.call(
        this,
        'POST',
        `/products/api/v1/product/${productId}/coupon`,
        body
      );

      const executionData = this.helpers.constructExecutionMetaData(
        this.helpers.returnJsonArray([(response as IDataObject) || {}]),
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
