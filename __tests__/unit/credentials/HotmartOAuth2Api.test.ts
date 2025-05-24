import { HotmartOAuth2Api } from '../../../credentials/HotmartOAuth2Api.credentials';

describe('HotmartOAuth2Api Credentials', () => {
  let credentials: HotmartOAuth2Api;

  beforeEach(() => {
    credentials = new HotmartOAuth2Api();
  });

  it('deve ter propriedades básicas definidas', () => {
    expect(credentials.name).toBe('hotmartOAuth2Api');
    expect(credentials.displayName).toBe('Hotmart OAuth2 API');
    expect(credentials.documentationUrl).toBe('https://developers.hotmart.com/docs/pt-BR/start/app-auth');
    expect(credentials.extends).toEqual(['oAuth2Api']);
  });

  it('deve ter propriedades configuradas', () => {
    expect(credentials.properties).toBeDefined();
    expect(Array.isArray(credentials.properties)).toBe(true);
    expect(credentials.properties.length).toBeGreaterThan(0);
  });

  it('deve ter propriedade de environment', () => {
    const environmentProp = credentials.properties.find(prop => prop.name === 'environment');
    expect(environmentProp).toBeDefined();
    expect(environmentProp?.type).toBe('options');
    expect(environmentProp?.default).toBe('production');
  });

  it('deve ter propriedade de grantType', () => {
    const grantTypeProp = credentials.properties.find(prop => prop.name === 'grantType');
    expect(grantTypeProp).toBeDefined();
    expect(grantTypeProp?.type).toBe('hidden');
    expect(grantTypeProp?.default).toBe('clientCredentials');
  });

  it('deve ter test request configurado', () => {
    expect(credentials.test).toBeDefined();
    if (credentials.test) {
      expect(credentials.test.request).toBeDefined();
      expect(credentials.test.request.method).toBe('GET');
      expect(credentials.test.request.url).toContain('/payments/api/v1/sales/history');
    }
  });
});