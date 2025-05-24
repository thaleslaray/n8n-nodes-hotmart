import { getProducts, getEventProducts, getCouponsByProduct } from '../../../nodes/Hotmart/v1/methods/loadOptions';
import { ILoadOptionsFunctions } from 'n8n-workflow';

describe('LoadOptions Methods', () => {
  let mockThis: ILoadOptionsFunctions;

  beforeEach(() => {
    mockThis = {
      helpers: {
        httpRequestWithAuthentication: {
          call: jest.fn(),
        },
      },
      logger: {
        error: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
      },
      getCurrentNodeParameter: jest.fn(),
    } as unknown as ILoadOptionsFunctions;
  });

  describe('getProducts', () => {
    it('deve retornar produtos com sucesso', async () => {
      const mockResponse = {
        items: [
          { id: 'prod1', name: 'Produto 1' },
          { id: 'prod2', name: 'Produto 2' },
        ],
      };

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getProducts.call(mockThis);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Produto 1',
        value: 'prod1',
      });
      expect(result[1]).toEqual({
        name: 'Produto 2',
        value: 'prod2',
      });
    });

    it('deve tratar erro e retornar opção de erro', async () => {
      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const result = await getProducts.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: '[ERRO] Não foi possível buscar produtos',
        value: 'erro',
      });
      expect(mockThis.logger.error).toHaveBeenCalled();
    });

    it('deve tratar resposta sem items', async () => {
      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue({});

      const result = await getProducts.call(mockThis);

      expect(result).toHaveLength(0);
    });

    it('deve tratar resposta com items não array', async () => {
      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue({
        items: 'not-an-array',
      });

      const result = await getProducts.call(mockThis);

      expect(result).toHaveLength(0);
    });
  });

  describe('getEventProducts', () => {
    it('deve retornar eventos com sucesso', async () => {
      const mockResponse = {
        items: [
          { id: 'event1', name: 'Evento 1' },
          { id: 'event2', name: 'Evento 2' },
        ],
      };

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getEventProducts.call(mockThis);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Evento 1',
        value: 'event1',
      });

      expect(mockThis.helpers.httpRequestWithAuthentication.call).toHaveBeenCalledWith(
        mockThis,
        'hotmartOAuth2Api',
        {
          method: 'GET',
          url: 'https://developers.hotmart.com/products/api/v1/products',
          qs: { max_results: 100, format: 'ETICKET' },
        }
      );
    });

    it('deve retornar mensagem quando não há eventos', async () => {
      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue({
        items: [],
      });

      const result = await getEventProducts.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Nenhum evento (ETICKET) encontrado',
        value: '',
      });
    });

    it('deve tratar erro e adicionar mensagem de evento não encontrado', async () => {
      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const result = await getEventProducts.call(mockThis);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: '[ERRO] Não foi possível buscar eventos',
        value: 'erro',
      });
      expect(result[1]).toEqual({
        name: 'Nenhum evento (ETICKET) encontrado',
        value: '',
      });
    });
  });

  describe('getCouponsByProduct', () => {
    it('deve retornar cupons para um produto específico', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('product123');

      const mockResponse = {
        items: [
          {
            id: 'coupon1',
            coupon_code: 'DESC10',
            discount: 0.1,
            status: 'ACTIVE',
          },
          {
            id: 'coupon2',
            coupon_code: 'DESC20',
            discount: 0.2,
            status: 'INACTIVE',
          },
        ],
      };

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'DESC10 - 10% (ACTIVE)',
        value: 'coupon1',
        description: 'ID: coupon1',
      });
      expect(result[1]).toEqual({
        name: 'DESC20 - 20% (INACTIVE)',
        value: 'coupon2',
        description: 'ID: coupon2',
      });
    });

    it('deve retornar mensagem quando produto não está selecionado', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('');

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Selecione um produto primeiro',
        value: '',
      });
    });

    it('deve retornar mensagem quando não há cupons', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('product123');

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue({
        items: [],
      });

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Nenhum cupom encontrado para este produto',
        value: '',
      });
    });

    it('deve tratar cupons sem desconto', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('product123');

      const mockResponse = {
        items: [
          {
            id: 'coupon1',
            coupon_code: 'FREE',
            status: 'ACTIVE',
          },
        ],
      };

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'FREE -  (ACTIVE)',
        value: 'coupon1',
        description: 'ID: coupon1',
      });
    });

    it('deve tratar erro na API', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('product123');

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: '[ERRO] Não foi possível buscar cupons',
        value: 'erro',
      });
      expect(mockThis.logger.error).toHaveBeenCalled();
    });

    it('deve retornar mensagem padrão quando não há items na resposta', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('product123');

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue({});

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Nenhum cupom encontrado',
        value: '',
      });
    });

    it('deve tratar cupons sem status definido', async () => {
      (mockThis.getCurrentNodeParameter as jest.Mock).mockReturnValue('product123');

      const mockResponse = {
        items: [
          {
            id: 'coupon1',
            coupon_code: 'NOSTATUS',
            discount: 0.15,
            // status não definido
          },
          {
            id: 'coupon2',
            coupon_code: 'NULLSTATUS',
            discount: 0.25,
            status: null,
          },
        ],
      };

      (mockThis.helpers.httpRequestWithAuthentication.call as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getCouponsByProduct.call(mockThis);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'NOSTATUS - 15% (unknown)',
        value: 'coupon1',
        description: 'ID: coupon1',
      });
      expect(result[1]).toEqual({
        name: 'NULLSTATUS - 25% (unknown)',
        value: 'coupon2',
        description: 'ID: coupon2',
      });
    });
  });
});