import { Hotmart } from '../../../nodes/Hotmart/Hotmart.node';
import { HotmartV1 } from '../../../nodes/Hotmart/v1/HotmartV1.node';

describe('Hotmart Node', () => {
  let hotmart: Hotmart;

  beforeEach(() => {
    hotmart = new Hotmart();
  });

  it('should have correct base description', () => {
    expect(hotmart.description.displayName).toBe('Hotmart');
    expect(hotmart.description.name).toBe('hotmart');
    expect(hotmart.description.group).toEqual(['transform']);
    expect(hotmart.description.defaultVersion).toBe(1);
  });

  it('should create correct version instance', () => {
    const nodeVersions = hotmart.nodeVersions;
    expect(nodeVersions[1]).toBeInstanceOf(HotmartV1);
  });

  it('should have correct icon', () => {
    expect(hotmart.description.icon).toBe('file:hotmart.svg');
  });

  it('should have version 1 node with complete description', () => {
    const v1Node = hotmart.nodeVersions[1] as HotmartV1;
    const v1Description = v1Node.description;
    
    // Check V1 specific properties
    expect(v1Description.version).toEqual([1, 2]);
    // Verificar se o subtitle é uma string (existe, mas é muito longo)
    expect(typeof v1Description.subtitle).toBe('string');
    expect(v1Description.subtitle).toContain('$parameter["resource"]');
    expect(v1Description.inputs).toEqual(['main']);
    expect(v1Description.outputs).toEqual(['main']);
    expect(v1Description.credentials).toEqual([
      {
        name: 'hotmartOAuth2Api',
        required: true
      }
    ]);
  });

  it('should have properties in v1 node', () => {
    const v1Node = hotmart.nodeVersions[1] as HotmartV1;
    const properties = v1Node.description.properties;
    
    // Should have properties
    expect(properties).toBeDefined();
    expect(Array.isArray(properties)).toBe(true);
    expect(properties.length).toBeGreaterThan(0);
  });
});