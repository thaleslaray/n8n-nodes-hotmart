import { execute } from '../../nodes/Hotmart/v1/actions/coupon/get.operation';
import { createMockExecuteFunction } from '../helpers/mocks';
import type { IExecuteFunctions } from 'n8n-workflow';

// Mock dos módulos de request
jest.mock('../../nodes/Hotmart/v1/transport/request', () => ({
  hotmartApiRequest: jest.fn(),
}));

import { hotmartApiRequest } from '../../nodes/Hotmart/v1/transport/request';

describe('DEMONSTRAÇÃO TÉCNICA - Como os testes funcionam', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunction();
    jest.clearAllMocks();
  });

  it('EXEMPLO: Buscar cupons de desconto', async () => {
    console.log('\n=== INÍCIO DO TESTE ===\n');
    
    // 1️⃣ DADOS DE ENTRADA
    console.log('1️⃣ SIMULANDO ENTRADA DO USUÁRIO:');
    console.log('   - Produto ID: PROD-123');
    console.log('   - Limite: 50 cupons');
    console.log('   - Retornar todos: NÃO\n');

    // 2️⃣ CONFIGURANDO OS MOCKS
    console.log('2️⃣ CONFIGURANDO PARÂMETROS DO NODE:');
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false)     // returnAll = false
      .mockReturnValueOnce(50)        // maxResults = 50
      .mockReturnValueOnce('PROD-123') // product_id = 'PROD-123'
      .mockReturnValueOnce({})        // filters = {}
      .mockReturnValueOnce(50);       // limit = 50
    console.log('   ✅ Parâmetros configurados\n');

    // 3️⃣ SIMULANDO RESPOSTA DA API
    console.log('3️⃣ ENDPOINT QUE SERIA CHAMADO:');
    console.log('   GET https://developers.hotmart.com/products/api/v1/coupon/product/PROD-123');
    console.log('   Query params: { max_results: 50 }\n');

    const mockApiResponse = {
      items: [
        {
          coupon_code: 'DESCONTO20',
          discount: 0.2,
          status: 'ACTIVE',
          created_at: '2025-01-15T10:00:00.000Z',
          usage_count: 15,
          max_usage: 100
        },
        {
          coupon_code: 'BLACKFRIDAY',
          discount: 0.5,
          status: 'ACTIVE',
          created_at: '2025-11-20T00:00:00.000Z',
          usage_count: 250,
          max_usage: 1000
        }
      ],
      page_info: {
        total_items: 2,
        next_page_token: null
      }
    };

    console.log('4️⃣ RESPOSTA SIMULADA DA API HOTMART:');
    console.log(JSON.stringify(mockApiResponse, null, 2) + '\n');

    // Configurando o mock para retornar nossa resposta simulada
    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockApiResponse);

    // 4️⃣ EXECUTANDO A OPERAÇÃO
    console.log('5️⃣ EXECUTANDO A OPERAÇÃO DO NODE...\n');
    const result = await execute.call(mockThis, [{ json: {} }]);

    // 5️⃣ VERIFICANDO O RESULTADO
    console.log('6️⃣ RESULTADO PROCESSADO PELO NODE:');
    console.log('   - Total de arrays retornados:', result.length);
    console.log('   - Total de itens no array:', result[0].length);
    console.log('   - Dados do primeiro cupom:');
    console.log('     • Código:', result[0][0].json.coupon_code);
    console.log('     • Desconto:', result[0][0].json.discount_percentage);
    console.log('     • Info formatada:', result[0][0].json.coupon_info);
    console.log('\n');

    // 6️⃣ VERIFICAÇÕES DO TESTE
    console.log('7️⃣ VERIFICAÇÕES DO TESTE:');
    
    // Verifica se a API foi chamada corretamente
    expect(hotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/products/api/v1/coupon/product/PROD-123',
      {},
      { max_results: 50 }
    );
    console.log('   ✅ API foi chamada com os parâmetros corretos');

    // Verifica se os dados foram processados
    expect(result[0][0].json.coupon_code).toBe('DESCONTO20');
    console.log('   ✅ Cupom DESCONTO20 foi retornado corretamente');
    
    expect(result[0][0].json.discount_percentage).toBe('20%');
    console.log('   ✅ Desconto foi formatado como porcentagem (20%)');
    
    expect(result[0][0].json.coupon_info).toBe('DESCONTO20 - 20% (ACTIVE)');
    console.log('   ✅ Info formatada foi criada corretamente');

    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===\n');
  });

  it('EXEMPLO 2: Tratamento de erro', async () => {
    console.log('\n=== TESTE DE ERRO ===\n');
    
    console.log('1️⃣ SIMULANDO ERRO 404 - Produto não encontrado');
    
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(50)
      .mockReturnValueOnce('PROD-INVALIDO')
      .mockReturnValueOnce({})
      .mockReturnValueOnce(50);

    console.log('2️⃣ ENDPOINT QUE SERIA CHAMADO:');
    console.log('   GET https://developers.hotmart.com/products/api/v1/coupon/product/PROD-INVALIDO\n');

    // Simulando erro da API
    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(
      new Error('Product not found')
    );
    console.log('3️⃣ API RETORNA ERRO: Product not found\n');

    // Configurando para continuar em caso de erro
    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(true);

    console.log('4️⃣ EXECUTANDO COM continueOnFail = true...\n');
    const result = await execute.call(mockThis, [{ json: {} }]);

    console.log('5️⃣ RESULTADO:');
    console.log('   - Erro capturado:', result[0][0].json.error);
    console.log('   - Node não travou, retornou o erro no output');
    
    expect(result[0][0].json.error).toBe('Product not found');
    console.log('\n   ✅ Erro foi tratado corretamente!');
    
    console.log('\n=== FIM DO TESTE DE ERRO ===\n');
  });
});