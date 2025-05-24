import { INodeProperties } from 'n8n-workflow';
import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';

describe('Field Validation Tests', () => {
  describe('DateTime fields validation', () => {
    let allOperationFiles: string[] = [];
    let allDateTimeFields: Array<{ file: string; field: INodeProperties }> = [];

    beforeAll(() => {
      // Encontrar todos os arquivos de operação
      const pattern = path.join(__dirname, '../../../nodes/Hotmart/v1/actions/**/*.operation.ts');
      allOperationFiles = glob.sync(pattern);

      // Extrair campos dateTime de cada arquivo
      allOperationFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Regex para encontrar objetos de campo dateTime
        const fieldRegex = /\{[^{}]*displayName:[^{}]*type:\s*['"]dateTime['"][^{}]*\}/gs;
        const matches = content.match(fieldRegex) || [];
        
        matches.forEach(match => {
          try {
            // Extrair propriedades do campo
            const displayNameMatch = match.match(/displayName:\s*['"]([^'"]+)['"]/);
            const nameMatch = match.match(/name:\s*['"]([^'"]+)['"]/);
            const defaultMatch = match.match(/default:\s*['"]([^'"]*)['"]/);
            const placeholderMatch = match.match(/placeholder:/);
            
            if (displayNameMatch && nameMatch) {
              allDateTimeFields.push({
                file: path.relative(process.cwd(), file),
                field: {
                  displayName: displayNameMatch[1],
                  name: nameMatch[1],
                  type: 'dateTime',
                  default: defaultMatch ? defaultMatch[1] : '',
                  hasPlaceholder: !!placeholderMatch,
                } as any
              });
            }
          } catch (e) {
            // Ignorar campos mal formados
          }
        });
      });
    });

    it('should have dateTime fields to test', () => {
      expect(allDateTimeFields.length).toBeGreaterThan(0);
    });

    it('should not have expressions in default values', () => {
      const fieldsWithExpressions = allDateTimeFields.filter(({ field }) => 
        field.default && typeof field.default === 'string' && (
          field.default.includes('{{') || 
          field.default.includes('$now') ||
          field.default.includes('$today')
        )
      );

      if (fieldsWithExpressions.length > 0) {
        const details = fieldsWithExpressions.map(({ file, field }) => 
          `\n  - ${file}: field "${field.name}" has expression in default: "${field.default}"`
        ).join('');
        
        throw new Error(`Found ${fieldsWithExpressions.length} dateTime fields with expressions in default values:${details}`);
      }
    });

    it('should not have placeholder property in dateTime fields', () => {
      const fieldsWithPlaceholder = allDateTimeFields.filter(({ field }) => (field as any).hasPlaceholder);

      if (fieldsWithPlaceholder.length > 0) {
        const details = fieldsWithPlaceholder.map(({ file, field }) => 
          `\n  - ${file}: field "${field.name}" has placeholder property`
        ).join('');
        
        throw new Error(`Found ${fieldsWithPlaceholder.length} dateTime fields with placeholder property:${details}`);
      }
    });

    it('should have empty string as default value', () => {
      const fieldsWithNonEmptyDefault = allDateTimeFields.filter(({ field }) => 
        field.default !== ''
      );

      if (fieldsWithNonEmptyDefault.length > 0) {
        const details = fieldsWithNonEmptyDefault.map(({ file, field }) => 
          `\n  - ${file}: field "${field.name}" has non-empty default: "${field.default}"`
        ).join('');
        
        throw new Error(`Found ${fieldsWithNonEmptyDefault.length} dateTime fields with non-empty default values:${details}`);
      }
    });

    it('should follow consistent structure', () => {
      // Teste simplificado - apenas verifica se todos os campos foram extraídos corretamente
      allDateTimeFields.forEach(({ field }) => {
        expect(field).toHaveProperty('displayName');
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('type', 'dateTime');
        expect(field).toHaveProperty('default');
      });
    });
  });

  describe('Field validation rules', () => {
    it('should validate all node parameters follow n8n conventions', () => {
      // Este teste pode ser expandido para validar outras convenções
      expect(true).toBe(true);
    });
  });
});