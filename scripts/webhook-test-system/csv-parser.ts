#!/usr/bin/env ts-node

/**
 * Parser de CSV para extrair eventos do webhook Hotmart
 * 
 * Lê o arquivo CSV de logs e extrai os JSONs válidos
 */

import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';

interface CSVRow {
  Data: string;
  Timestamp: string;
  Evento: string;
  ID: string;
  Produto: string;
  Nome: string;
  'E-mail': string;
  JSON: string;
}

interface ParsedEvent {
  csvRow: number;
  eventType: string;
  timestamp: string;
  json: any;
  isValid: boolean;
  error?: string;
}

interface ParseResult {
  totalRows: number;
  validEvents: number;
  invalidEvents: number;
  eventsByType: Map<string, ParsedEvent[]>;
  errors: string[];
}

export class CSVParser {
  private csvPath: string;
  private outputDir: string;

  constructor(csvPath: string, outputDir: string) {
    this.csvPath = csvPath;
    this.outputDir = outputDir;
  }

  /**
   * Processa o arquivo CSV e extrai os eventos
   */
  async parse(): Promise<ParseResult> {
    console.log('🔍 Iniciando parsing do CSV...');
    
    const result: ParseResult = {
      totalRows: 0,
      validEvents: 0,
      invalidEvents: 0,
      eventsByType: new Map(),
      errors: []
    };

    try {
      // Ler arquivo CSV
      const fileContent = fs.readFileSync(this.csvPath, 'utf-8');
      
      // Parse CSV
      const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
        quote: '"',
        escape: '"',
        relax_quotes: true,
        relax_column_count: true,
        bom: true
      }) as CSVRow[];

      result.totalRows = records.length;
      console.log(`📊 Total de linhas no CSV: ${result.totalRows}`);

      // Processar cada linha
      records.forEach((row, index) => {
        const parsed = this.parseRow(row, index + 2); // +2 porque CSV começa na linha 1 e tem header
        
        if (parsed.isValid) {
          result.validEvents++;
          
          // Agrupar por tipo de evento
          if (!result.eventsByType.has(parsed.eventType)) {
            result.eventsByType.set(parsed.eventType, []);
          }
          result.eventsByType.get(parsed.eventType)!.push(parsed);
        } else {
          result.invalidEvents++;
          if (parsed.error) {
            result.errors.push(`Linha ${parsed.csvRow}: ${parsed.error}`);
          }
        }
      });

      // Salvar estatísticas
      this.saveStatistics(result);
      
      // Salvar eventos parseados
      this.saveEvents(result);

      console.log(`\n✅ Parsing concluído!`);
      console.log(`   - Eventos válidos: ${result.validEvents}`);
      console.log(`   - Eventos inválidos: ${result.invalidEvents}`);
      console.log(`   - Tipos de eventos: ${result.eventsByType.size}`);

      return result;

    } catch (error) {
      console.error('❌ Erro ao processar CSV:', error);
      throw error;
    }
  }

  /**
   * Processa uma linha do CSV
   */
  private parseRow(row: CSVRow, rowNumber: number): ParsedEvent {
    const parsed: ParsedEvent = {
      csvRow: rowNumber,
      eventType: row.Evento || 'UNKNOWN',
      timestamp: row.Timestamp || '',
      json: null,
      isValid: false
    };

    try {
      // Limpar e validar JSON
      if (row.JSON) {
        // Remover possíveis caracteres problemáticos
        let jsonString = row.JSON.trim();
        
        // Tentar parsear o JSON
        parsed.json = JSON.parse(jsonString);
        
        // Validar estrutura básica
        if (parsed.json && parsed.json.event && parsed.json.data) {
          parsed.isValid = true;
          parsed.eventType = parsed.json.event; // Usar o tipo do JSON como fonte de verdade
        } else {
          parsed.error = 'JSON sem campos obrigatórios (event, data)';
        }
      } else {
        parsed.error = 'Campo JSON vazio';
      }
    } catch (error) {
      parsed.error = `Erro ao parsear JSON: ${error.message}`;
    }

    return parsed;
  }

  /**
   * Salva estatísticas do parsing
   */
  private saveStatistics(result: ParseResult): void {
    const statsPath = path.join(this.outputDir, 'parsing-stats.json');
    
    const stats = {
      parsedAt: new Date().toISOString(),
      totalRows: result.totalRows,
      validEvents: result.validEvents,
      invalidEvents: result.invalidEvents,
      eventTypes: {} as Record<string, number>,
      errors: result.errors.slice(0, 100) // Limitar erros para não ficar muito grande
    };

    // Contar eventos por tipo
    result.eventsByType.forEach((events, type) => {
      stats.eventTypes[type] = events.length;
    });

    // Criar diretório se não existir
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`\n📊 Estatísticas salvas em: ${statsPath}`);
  }

  /**
   * Salva eventos parseados em arquivos separados
   */
  private saveEvents(result: ParseResult): void {
    const eventsDir = path.join(this.outputDir, 'parsed-events');
    
    // Criar diretório
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }

    // Salvar cada tipo de evento em arquivo separado
    result.eventsByType.forEach((events, type) => {
      const filename = `${type.toLowerCase().replace(/_/g, '-')}.json`;
      const filepath = path.join(eventsDir, filename);
      
      // Salvar apenas os JSONs válidos
      const jsonEvents = events.map(e => e.json);
      
      fs.writeFileSync(filepath, JSON.stringify(jsonEvents, null, 2));
      console.log(`   📁 ${type}: ${events.length} eventos salvos`);
    });

    // Salvar todos os eventos em um único arquivo também
    const allEvents: any[] = [];
    result.eventsByType.forEach((events) => {
      events.forEach(e => allEvents.push(e.json));
    });

    // Dados históricos movidos para .local/archive/webhook-data-historical/
    // Arquivo all-events.json não é mais gerado para evitar arquivos enormes
    // const allEventsPath = path.join(eventsDir, 'all-events.json');
    // fs.writeFileSync(allEventsPath, JSON.stringify(allEvents, null, 2));
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const csvPath = process.argv[2] || path.join(__dirname, '../../logs/LOGS WEBHOOK.csv');
  const outputDir = process.argv[3] || path.join(__dirname, '../../__tests__/fixtures/webhook-events');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo CSV não encontrado: ${csvPath}`);
    process.exit(1);
  }

  const parser = new CSVParser(csvPath, outputDir);
  parser.parse()
    .then(() => {
      console.log('\n✨ Parser concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro durante parsing:', error);
      process.exit(1);
    });
}