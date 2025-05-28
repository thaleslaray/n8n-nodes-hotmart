#!/usr/bin/env ts-node

/**
 * Anonimizador de Dados de Webhook
 * 
 * Remove/substitui informações pessoais dos eventos para uso em testes
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface AnonymizationConfig {
  inputDir: string;
  outputDir: string;
  preserveStructure: boolean;
  deterministicHash: boolean; // Para manter consistência entre execuções
}

interface AnonymizationStats {
  totalEvents: number;
  fieldsAnonymized: number;
  eventTypes: Record<string, number>;
}

export class WebhookAnonymizer {
  private config: AnonymizationConfig;
  private stats: AnonymizationStats;
  private hashCache: Map<string, string> = new Map();
  
  // Campos que contém dados pessoais
  private readonly PII_FIELDS = [
    'name', 'full_name', 'first_name', 'last_name',
    'email', 'mail', 'buyer_email', 'producer_email',
    'phone', 'telephone', 'phone_number', 'cellphone',
    'document', 'cpf', 'cnpj', 'doc', 'tax_id',
    'address', 'street', 'zip_code', 'postal_code',
    'ip', 'ip_address', 'user_ip',
    'ucode', 'user_code', 'buyer_ucode',
    'hottok', 'token', 'api_key', 'access_token',
    'card_number', 'card_holder_name',
    'bank_account', 'agency', 'account'
  ];
  
  // Padrões regex para detectar dados sensíveis
  private readonly SENSITIVE_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
    phone: /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[(]?[0-9]{2,5}[)]?[-\s\.]?[0-9]{4,5}[-\s\.]?[0-9]{4}$/,
    creditCard: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/
  };

  constructor(config: AnonymizationConfig) {
    this.config = config;
    this.stats = {
      totalEvents: 0,
      fieldsAnonymized: 0,
      eventTypes: {}
    };
  }

  /**
   * Anonimiza todos os eventos
   */
  async anonymizeAll(): Promise<void> {
    console.log('🔒 Iniciando anonimização de dados...');
    
    // Criar diretório de saída
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    // Processar diretório parsed-events
    const eventsDir = path.join(this.config.inputDir, 'parsed-events');
    if (fs.existsSync(eventsDir)) {
      await this.processEventsDirectory(eventsDir);
    }
    
    // Processar fixtures
    const fixturesDir = path.join(this.config.inputDir, '../webhook-fixtures');
    if (fs.existsSync(fixturesDir)) {
      await this.processFixturesDirectory(fixturesDir);
    }
    
    // Salvar estatísticas
    this.saveStats();
    
    console.log('\n✅ Anonimização concluída!');
    console.log(`   Total de eventos: ${this.stats.totalEvents}`);
    console.log(`   Campos anonimizados: ${this.stats.fieldsAnonymized}`);
  }

  /**
   * Processa diretório de eventos
   */
  private async processEventsDirectory(dir: string): Promise<void> {
    const outputDir = path.join(this.config.outputDir, 'parsed-events');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const events = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const anonymizedEvents = Array.isArray(events) 
        ? events.map(e => this.anonymizeEvent(e))
        : this.anonymizeEvent(events);
      
      const outputPath = path.join(outputDir, file);
      fs.writeFileSync(outputPath, JSON.stringify(anonymizedEvents, null, 2));
      
      console.log(`   📁 ${file}: ${Array.isArray(events) ? events.length : 1} eventos anonimizados`);
    }
  }

  /**
   * Processa diretório de fixtures
   */
  private async processFixturesDirectory(dir: string): Promise<void> {
    const outputDir = path.join(this.config.outputDir, '../webhook-fixtures-anon');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Copiar arquivo de resumo
    const summaryPath = path.join(dir, 'fixture-summary.json');
    if (fs.existsSync(summaryPath)) {
      fs.copyFileSync(summaryPath, path.join(outputDir, 'fixture-summary.json'));
    }
    
    // Processar cada tipo de evento
    const eventDirs = fs.readdirSync(dir).filter(
      f => fs.statSync(path.join(dir, f)).isDirectory()
    );
    
    for (const eventDir of eventDirs) {
      const eventPath = path.join(dir, eventDir);
      const outputEventDir = path.join(outputDir, eventDir);
      
      if (!fs.existsSync(outputEventDir)) {
        fs.mkdirSync(outputEventDir, { recursive: true });
      }
      
      const files = fs.readdirSync(eventPath).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(eventPath, file);
        const event = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const anonymized = this.anonymizeEvent(event);
        
        const outputPath = path.join(outputEventDir, file);
        fs.writeFileSync(outputPath, JSON.stringify(anonymized, null, 2));
      }
      
      console.log(`   📁 ${eventDir}: ${files.length} fixtures anonimizadas`);
    }
  }

  /**
   * Anonimiza um evento
   */
  private anonymizeEvent(event: any): any {
    this.stats.totalEvents++;
    
    if (event.event) {
      this.stats.eventTypes[event.event] = (this.stats.eventTypes[event.event] || 0) + 1;
    }
    
    return this.anonymizeObject(event);
  }

  /**
   * Anonimiza recursivamente um objeto
   */
  private anonymizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.anonymizeObject(item));
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Verificar se é campo sensível
      if (this.isSensitiveField(key)) {
        result[key] = this.anonymizeValue(key, value);
        this.stats.fieldsAnonymized++;
      } else if (typeof value === 'string' && this.containsSensitiveData(value)) {
        // Verificar se o valor contém dados sensíveis
        result[key] = this.anonymizeValue(key, value);
        this.stats.fieldsAnonymized++;
      } else if (typeof value === 'object') {
        // Recursão para objetos aninhados
        result[key] = this.anonymizeObject(value);
      } else {
        // Manter valor original
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Verifica se um campo é sensível
   */
  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return this.PII_FIELDS.some(pii => lowerField.includes(pii));
  }

  /**
   * Verifica se um valor contém dados sensíveis
   */
  private containsSensitiveData(value: string): boolean {
    if (typeof value !== 'string') return false;
    
    return Object.values(this.SENSITIVE_PATTERNS).some(
      pattern => pattern.test(value)
    );
  }

  /**
   * Anonimiza um valor
   */
  private anonymizeValue(key: string, value: any): any {
    if (value === null || value === undefined) {
      return value;
    }
    
    const valueStr = String(value);
    
    // Usar hash determinístico se configurado
    if (this.config.deterministicHash) {
      if (this.hashCache.has(valueStr)) {
        return this.hashCache.get(valueStr);
      }
    }
    
    let anonymized: string;
    
    // Anonimização específica por tipo
    if (key.toLowerCase().includes('email')) {
      anonymized = this.anonymizeEmail(valueStr);
    } else if (key.toLowerCase().includes('name')) {
      anonymized = this.anonymizeName(valueStr);
    } else if (key.toLowerCase().includes('phone')) {
      anonymized = this.anonymizePhone(valueStr);
    } else if (key.toLowerCase().includes('cpf') || key.toLowerCase().includes('document')) {
      anonymized = this.anonymizeDocument(valueStr);
    } else if (key.toLowerCase().includes('address')) {
      anonymized = this.anonymizeAddress(valueStr);
    } else if (key.toLowerCase().includes('ip')) {
      anonymized = this.anonymizeIP(valueStr);
    } else {
      // Anonimização genérica
      anonymized = this.genericAnonymize(key, valueStr);
    }
    
    if (this.config.deterministicHash) {
      this.hashCache.set(valueStr, anonymized);
    }
    
    return anonymized;
  }

  /**
   * Anonimiza email preservando formato
   */
  private anonymizeEmail(email: string): string {
    if (!email.includes('@')) return 'user@example.com';
    
    const parts = email.split('@');
    const domain = parts[1].split('.');
    const hash = this.getHash(email).substring(0, 8);
    
    return `user_${hash}@example.${domain[domain.length - 1]}`;
  }

  /**
   * Anonimiza nome
   */
  private anonymizeName(name: string): string {
    const hash = this.getHash(name).substring(0, 6);
    const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia'];
    const surnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Lima'];
    
    const nameIndex = parseInt(hash.substring(0, 2), 16) % names.length;
    const surnameIndex = parseInt(hash.substring(2, 4), 16) % surnames.length;
    
    return `${names[nameIndex]} ${surnames[surnameIndex]}`;
  }

  /**
   * Anonimiza telefone
   */
  private anonymizePhone(phone: string): string {
    const hash = this.getHash(phone).substring(0, 8);
    return `+55 11 9${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
  }

  /**
   * Anonimiza documento
   */
  private anonymizeDocument(doc: string): string {
    const hash = this.getHash(doc).substring(0, 11);
    return `${hash.substring(0, 3)}.${hash.substring(3, 6)}.${hash.substring(6, 9)}-${hash.substring(9, 11)}`;
  }

  /**
   * Anonimiza endereço
   */
  private anonymizeAddress(address: string): string {
    const hash = this.getHash(address).substring(0, 4);
    const streets = ['Rua das Flores', 'Av. Paulista', 'Rua Augusta', 'Av. Brasil'];
    const streetIndex = parseInt(hash, 16) % streets.length;
    
    return `${streets[streetIndex]}, ${parseInt(hash, 16) % 1000}`;
  }

  /**
   * Anonimiza IP
   */
  private anonymizeIP(ip: string): string {
    const hash = this.getHash(ip);
    return `192.168.${parseInt(hash.substring(0, 2), 16)}.${parseInt(hash.substring(2, 4), 16)}`;
  }

  /**
   * Anonimização genérica
   */
  private genericAnonymize(key: string, value: string): string {
    const hash = this.getHash(value).substring(0, 8);
    return `${key}_${hash}`;
  }

  /**
   * Gera hash determinístico
   */
  private getHash(value: string): string {
    const secret = this.config.deterministicHash ? 'hotmart-test' : Date.now().toString();
    return crypto.createHash('sha256')
      .update(value + secret)
      .digest('hex');
  }

  /**
   * Salva estatísticas
   */
  private saveStats(): void {
    const statsPath = path.join(this.config.outputDir, 'anonymization-stats.json');
    const stats = {
      ...this.stats,
      anonymizedAt: new Date().toISOString(),
      config: {
        preserveStructure: this.config.preserveStructure,
        deterministicHash: this.config.deterministicHash
      }
    };
    
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`\n📊 Estatísticas salvas em: ${statsPath}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const config: AnonymizationConfig = {
    inputDir: path.join(__dirname, '../../__tests__/fixtures/webhook-events'),
    outputDir: path.join(__dirname, '../../__tests__/fixtures/webhook-events-anon'),
    preserveStructure: true,
    deterministicHash: true // Para testes consistentes
  };
  
  const anonymizer = new WebhookAnonymizer(config);
  anonymizer.anonymizeAll()
    .then(() => {
      console.log('\n✨ Anonimização concluída com sucesso!');
      console.log('\n⚠️  IMPORTANTE:');
      console.log('   - Os dados originais ainda existem!');
      console.log('   - Remova manualmente os diretórios com dados sensíveis após verificar a anonimização');
      console.log('   - Use apenas os dados anonimizados em testes e repositórios públicos');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro durante anonimização:', error);
      process.exit(1);
    });
}