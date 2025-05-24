import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import type { IExecuteFunctions } from 'n8n-workflow';
import subscriptionReal from '../../../fixtures/responses/subscription-real.json';

// Mock do módulo de request
jest.mock('../../../../nodes/Hotmart/v1/transport/request', () => ({
  hotmartApiRequest: jest.fn(),
}));

import { hotmartApiRequest } from '../../../../nodes/Hotmart/v1/transport/request';

describe('Subscription GetAll - Com Resposta REAL da API', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunctions();
    jest.clearAllMocks();
  });

  it('deve processar resposta REAL da API corretamente', async () => {
    console.log('\n🎯 TESTE COM DADOS REAIS DA API HOTMART\n');
    
    // Configura parâmetros
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false)  // returnAll
      .mockReturnValueOnce({})     // filters
      .mockReturnValueOnce(10);     // limit

    // Usa a resposta REAL como mock
    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce({
      items: subscriptionReal.response.body.slice(0, 10), // Pega as primeiras 10 assinaturas
      page_info: {
        total_results: subscriptionReal.response.body.length,
        next_page_token: null,
        results_per_page: 10
      }
    });

    const result = await execute.call(mockThis, [{ json: {} }]);

    // Verificações com dados REAIS
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2); // 2 assinaturas retornadas (limitado pelos dados do mock)
    
    // Primeira assinatura
    const primeiraAssinatura = result[0][0].json;
    expect(primeiraAssinatura).toMatchObject({
      subscriber_code: "SUB67E6CDA0",
      subscription_id: 10000000,
      status: "CANCELLED_BY_SELLER",
      plan: {
        name: "Plano Teste 360 dias",
        id: 558689,
        recurrency_period: 360
      },
      product: {
        name: "Produto de Teste 1",
        id: 1355458
      },
      subscriber: {
        name: "João Silva",
        email: "joão.silva@hotmail.com"
      }
    });
    
    // Verifica campos adicionais que vieram na resposta real
    expect(primeiraAssinatura.trial).toBe(false);
    expect(primeiraAssinatura.transaction).toBe("TX5B929770");
    expect(primeiraAssinatura.price).toEqual({
      currency_code: "BRL",
      value: 1
    });
    
    // Verifica timestamps
    expect(typeof primeiraAssinatura.accession_date).toBe('number');
    expect(primeiraAssinatura.accession_date).toBe(1745527299000);
    
    console.log('\n✅ TESTE PASSOU! O código processa corretamente a resposta real da API.');
    console.log('\n📊 Campos processados:');
    console.log('   - subscriber_code: ✅');
    console.log('   - subscription_id: ✅');
    console.log('   - status: ✅');
    console.log('   - plan (objeto): ✅');
    console.log('   - product (objeto): ✅');
    console.log('   - subscriber (objeto): ✅');
    console.log('   - price (objeto): ✅');
    console.log('   - timestamps: ✅');
    console.log('   - campos extras: ✅');
  });

  it('deve lidar com diferentes status de assinatura', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({})
      .mockReturnValueOnce(50);

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce({
      items: subscriptionReal.response.body,
      page_info: {
        total_results: subscriptionReal.response.body.length,
        next_page_token: null,
        results_per_page: 50
      }
    });

    const result = await execute.call(mockThis, [{ json: {} }]);
    
    const statuses = result[0].map((item: any) => item.json.status);
    
    expect(statuses).toContain('CANCELLED_BY_SELLER');
    expect(statuses).toContain('ACTIVE');
    
    console.log('\n📊 Status encontrados na resposta real:');
    console.log(`   - ${statuses.join('\n   - ')}`);
  });

  it('deve manter compatibilidade mesmo com campos extras', async () => {
    // Simula resposta com campos que não existiam antes
    const respostaComCamposNovos = {
      items: [
        {
          ...subscriptionReal.response.body[0],
          campo_novo_2025: "valor novo",
          feature_experimental: true,
          metadata: {
            source: "api-v2",
            version: "2.0"
          }
        }
      ],
      page_info: {
        total_results: 1,
        next_page_token: null,
        results_per_page: 10
      }
    };

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({})
      .mockReturnValueOnce(10);

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(respostaComCamposNovos);

    const result = await execute.call(mockThis, [{ json: {} }]);
    
    // Verifica que não quebrou
    expect(result[0][0].json.subscriber_code).toBe("SUB67E6CDA0");
    
    // E que os campos novos estão presentes
    expect(result[0][0].json.campo_novo_2025).toBe("valor novo");
    expect(result[0][0].json.feature_experimental).toBe(true);
    
    console.log('\n✅ Compatibilidade mantida mesmo com campos novos!');
  });
});