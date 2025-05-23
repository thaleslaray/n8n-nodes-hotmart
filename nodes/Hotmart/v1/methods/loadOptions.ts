import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export async function getProducts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const returnData: INodePropertyOptions[] = [];
  const endpoint = 'https://developers.hotmart.com/products/api/v1/products';

  try {
    // Usar o método httpRequestWithAuthentication diretamente
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'hotmartOAuth2Api',
      {
        method: 'GET',
        url: endpoint,
        qs: { max_results: 100 },
      }
    );

    if (response && response.items && Array.isArray(response.items)) {
      for (const product of response.items) {
        returnData.push({
          name: product.name,
          value: product.id,
        });
      }
    }
  } catch (error) {
    this.logger.error('Erro ao buscar produtos Hotmart', { error });
    // Retorna uma opção de teste para depuração
    returnData.push({
      name: '[ERRO] Não foi possível buscar produtos',
      value: 'erro',
    });
  }

  return returnData;
}

// Método específico para buscar apenas produtos do tipo ETICKET (eventos)
export async function getEventProducts(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  const returnData: INodePropertyOptions[] = [];
  const endpoint = 'https://developers.hotmart.com/products/api/v1/products';

  try {
    // Usar o método httpRequestWithAuthentication diretamente
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'hotmartOAuth2Api',
      {
        method: 'GET',
        url: endpoint,
        qs: { max_results: 100, format: 'ETICKET' },
      }
    );

    if (response && response.items && Array.isArray(response.items)) {
      for (const product of response.items) {
        returnData.push({
          name: product.name,
          value: product.id,
        });
      }
    }
  } catch (error) {
    this.logger.error('Erro ao buscar eventos Hotmart', { error });
    // Retorna uma opção de teste para depuração
    returnData.push({
      name: '[ERRO] Não foi possível buscar eventos',
      value: 'erro',
    });
  }

  // Se não houver eventos, exibir uma mensagem
  if (returnData.length === 0 || (returnData.length === 1 && returnData[0].value === 'erro')) {
    returnData.push({
      name: 'Nenhum evento (ETICKET) encontrado',
      value: '',
    });
  }

  return returnData;
}

// Método para carregar cupons baseado no produto selecionado
export async function getCouponsByProduct(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  const returnData: INodePropertyOptions[] = [];
  const productId = this.getCurrentNodeParameter('product_id') as string;

  if (!productId || productId === '') {
    return [{ name: 'Selecione um produto primeiro', value: '' }];
  }

  try {
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'hotmartOAuth2Api',
      {
        method: 'GET',
        url: `https://developers.hotmart.com/products/api/v1/coupon/product/${productId}`,
        qs: { max_results: 100 },
      }
    );

    if (response && response.items && Array.isArray(response.items)) {
      if (response.items.length === 0) {
        returnData.push({
          name: 'Nenhum cupom encontrado para este produto',
          value: '',
        });
      } else {
        for (const coupon of response.items) {
          const status = coupon.status || 'unknown';
          const discount = coupon.discount ? `${(coupon.discount * 100).toFixed(0)}%` : '';
          const name = `${coupon.coupon_code} - ${discount} (${status})`;

          returnData.push({
            name,
            value: coupon.id,
            description: `ID: ${coupon.id}`,
          });
        }
      }
    }
  } catch (error) {
    this.logger.error('Erro ao buscar cupons', { error });
    returnData.push({
      name: '[ERRO] Não foi possível buscar cupons',
      value: 'erro',
    });
  }

  if (returnData.length === 0) {
    returnData.push({
      name: 'Nenhum cupom encontrado',
      value: '',
    });
  }

  return returnData;
}
